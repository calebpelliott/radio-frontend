import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { useEffect, useRef } from "react";

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container, stats;
let camera, scene, renderer, meshWhite, meshBlue;
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
let axisOfRotation;
const frustumSize = 600;

function Cube() {
    const refContainer = useRef(null);
    useEffect(() => {
        // === THREE.JS CODE START ===
        init();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // document.body.appendChild( renderer.domElement );
        // use ref as a mount point of the Cube.js scene instead of the document.body
        refContainer.current && refContainer.current.appendChild( renderer.domElement );

        return () => {
            renderer.setSize(0,0);
            renderer.forceContextLoss();
            renderer.dispose();
        };
    }, []);
    return (
        <div ref={refContainer}></div>
    );
}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();

    //

    camera = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
    camera.position.z = 2500;

    cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );

    cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
    scene.add( cameraPerspectiveHelper );

    //
    cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

    cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
    scene.add( cameraOrthoHelper );

    //

    activeCamera = cameraPerspective;
    activeHelper = cameraPerspectiveHelper;


    // counteract different front orientation of cameras vs rig

    cameraOrtho.rotation.y = Math.PI;
    cameraPerspective.rotation.y = Math.PI;

    cameraRig = new THREE.Group();

    cameraRig.add( cameraPerspective );
    cameraRig.add( cameraOrtho );

    scene.add( cameraRig );

    //

    meshWhite = new THREE.Mesh(
        new THREE.SphereGeometry( 100, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
    );
    scene.add( meshWhite );

    const meshGreen = new THREE.Mesh(
        new THREE.SphereGeometry( 50, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
    );
    meshGreen.position.x = 150;
    meshGreen.position.y = 150;
    meshGreen.position.z = 150;
    meshWhite.add( meshGreen );


    const vectorAB = new THREE.Vector3().subVectors(meshWhite.position, meshWhite.children[ 0 ].position);
    let normalAB = vectorAB.normalize();
    let upVector = new THREE.Vector3(.3, 1, .6); // Y-axis
    if (normalAB.dot(upVector.clone().normalize()) > 0.99) {
        // If they are parallel, choose a different up vector
        //upVector = new THREE.Vector3(1, 0, 0); // X-axis
        let x = 3;
    }
    axisOfRotation = new THREE.Vector3().crossVectors(vectorAB, upVector).normalize();


    meshBlue = new THREE.Mesh(
        new THREE.SphereGeometry( 5, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
    );
    meshBlue.position.z = 150;
    cameraRig.add( meshBlue );

    //

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for ( let i = 0; i < 10000; i ++ ) {

        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
    scene.add( particles );

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.setAnimationLoop( animate );
    container.appendChild( renderer.domElement );

    renderer.setScissorTest( true );

    //

    stats = new Stats();
    container.appendChild( stats.dom );

    //

    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'keydown', onKeyDown );

}

//

function onKeyDown( event ) {

    switch ( event.keyCode ) {

        case 79: /*O*/

            activeCamera = cameraOrtho;
            activeHelper = cameraOrthoHelper;

            break;

        case 80: /*P*/

            activeCamera = cameraPerspective;
            activeHelper = cameraPerspectiveHelper;

            break;

    }

}

//

function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.aspect = 0.5 * aspect;
    camera.updateProjectionMatrix();

    cameraPerspective.aspect = 0.5 * aspect;
    cameraPerspective.updateProjectionMatrix();

    cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
    cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
    cameraOrtho.top = frustumSize / 2;
    cameraOrtho.bottom = - frustumSize / 2;
    cameraOrtho.updateProjectionMatrix();

}

//

function animate() {

    render();
    stats.update();

}

let once = false;
let angle = 0;
function render() {

    const r = Date.now() * 0.0005;

    if (!once) {
        once = true;
        meshWhite.position.x = 700 * Math.cos( r );
        meshWhite.position.z = 0;//700 * Math.sin( r );
        meshWhite.position.y = 700 * Math.sin( r );

        //meshWhite.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
        //meshWhite.children[ 0 ].position.z = 70 * Math.sin( r );
        //meshWhite.children[ 0 ].rotation.z = 70 * Math.sin( r );
    }

    meshWhite.position.x = 700 * Math.cos( r );
    meshWhite.position.z = 700 * Math.sin( r );
    meshWhite.position.y = 700 * Math.sin( r )

    //meshWhite.rotation.x += r/5000;


    //meshWhite.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
    //meshWhite.children[ 0 ].position.z = 70 * Math.sin( r );
    //meshWhite.children[ 0 ].rotation.z = 70 * Math.sin( r );

    meshBlue.position.z = 150 * Math.sin( r ) + 300;

    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axisOfRotation, .055);
    //const relativePosition = new THREE.Vector3().subVectors(meshWhite.position, meshWhite.children[ 0 ].position);
    //relativePosition.applyQuaternion(quaternion);
    meshWhite.children[ 0 ].position.applyQuaternion(quaternion);
    angle += .001;
    //meshWhite.children[ 0 ].position.applyQuaternion(quaternion);

    if ( activeCamera === cameraPerspective ) {

        cameraPerspective.fov = 50;//35 + 30 * Math.sin( 0.5 * r );
        cameraPerspective.far = meshWhite.position.length()+150;
        cameraPerspective.updateProjectionMatrix();

        cameraPerspectiveHelper.update();
        cameraPerspectiveHelper.visible = true;

        cameraOrthoHelper.visible = false;

    } else {

        cameraOrtho.far = meshWhite.position.length();
        cameraOrtho.updateProjectionMatrix();

        cameraOrthoHelper.update();
        cameraOrthoHelper.visible = true;

        cameraPerspectiveHelper.visible = false;

    }

    cameraRig.lookAt( meshWhite.position );

    //

    activeHelper.visible = false;

    renderer.setClearColor( 0x000000, 1 );
    renderer.setScissor( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
    renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
    renderer.render( scene, activeCamera );

    //

    activeHelper.visible = true;

    renderer.setClearColor( 0x111111, 1 );
    renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
    renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
    renderer.render( scene, camera );

}

export default Cube