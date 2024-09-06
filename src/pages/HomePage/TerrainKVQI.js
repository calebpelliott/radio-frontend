import * as THREE from 'three';

import { useEffect, useRef } from "react";

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import {loadSwath} from "./KVQI_Vail_CO_88-5";

let container, stats;

let camera, controls, scene, renderer;

let mesh, texture;

const worldHeight = 512, worldWidth = 512,
    worldHalfWidth = worldHeight / 2, worldHalfDepth = worldWidth / 2;

let helper;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function TerrainColoradoRiver() {
    const refContainer = useRef(null);
    useEffect(() => {
        const main = async () => {
            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.setAnimationLoop( animate );
            // document.body.appendChild( renderer.domElement );
            // use ref as a mount point of the Cube.js scene instead of the document.body
            refContainer.current && refContainer.current.appendChild( renderer.domElement );

            stats = new Stats();

            scene = new THREE.Scene();
            scene.background = new THREE.Color( 0xbfd1e5 );

            camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 20000 );

            controls = new OrbitControls( camera, renderer.domElement );
            controls.minDistance = 1000;
            controls.maxDistance = 100000;
            controls.maxPolarAngle = Math.PI / 2;

            //

            const data = generateHeight( worldHeight, worldWidth );
            let elevationData = await loadElevationData(worldHeight, worldWidth,  39.832799, -106.857484, 4, 4);

            let min = elevationData[0];
            for (const num of elevationData) {
                if (num < min) {
                    min = num;
                }
            }

            elevationData = elevationData.map(num => num - min);

            console.log("0", data[0], "255", data[255], "256", data[256]);
            console.log("min", min);

            controls.target.y = data[ worldHalfWidth + worldHalfDepth * worldHeight ] + 500;
            camera.position.y = controls.target.y + 2000;
            camera.position.x = 2000;
            controls.update();

            const geometry = new THREE.PlaneGeometry( 7500, 7500, worldHeight - 1, worldWidth - 1 );
            geometry.rotateX( - Math.PI / 2 );

            const vertices = geometry.attributes.position.array;
            let x = 0;
            let inc = true;
            for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
                if (inc && x > 255) {
                    inc = false;
                }
                else if (!inc && x < 1) {
                    inc = true;
                }

                if (inc) {
                    x++
                }else{
                    x--
                }

                //vertices[ j + 1 ] = x*10;//triangle slices
                //vertices[ j + 1 ] = data[ i ] * 10;
                vertices[ j + 1 ] = elevationData[ i ] * .5;
            }

            let vertPosition = geometry.attributes.position;
            let point_x = vertPosition.getX(42331);
            let point_z = vertPosition.getZ(42331);
            let point_y = vertPosition.getY(42331);

            let dotGeometry = new THREE.BoxGeometry( 80, 20, 80 ),
                dotMaterial = new THREE.MeshBasicMaterial( {color:'blue'})

            var dot = new THREE.Mesh( dotGeometry, dotMaterial );
            dot.position.set( point_x, point_y, point_z );
            scene.add( dot );

            //

            //texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
            texture = new THREE.CanvasTexture( generateTexture( elevationData, worldHeight, worldWidth ) );
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;

            mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
            /**uncomment for black wire mesh **/
            //mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ) );
            scene.add( mesh );

            const geometryHelper = new THREE.ConeGeometry( 20, 100, 3 );
            geometryHelper.translate( 0, 50, 0 );
            geometryHelper.rotateX( Math.PI / 2 );
            helper = new THREE.Mesh( geometryHelper, new THREE.MeshNormalMaterial() );
            scene.add( helper );

            refContainer.current && refContainer.current.addEventListener( 'pointermove', onPointerMove );


            refContainer.current && refContainer.current.appendChild( stats.dom );

            window.addEventListener( 'resize', onWindowResize );
        };

        main();
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

async function loadElevationData(heigth, width, lat, lon, widthMultiplier = 1, heightMultiplier = 1) {
    let data = await loadSwath(heigth, width, lat, lon, widthMultiplier, heightMultiplier);
    return data;
}

function generateHeight( width, height ) {

    const size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), z = Math.random() * 100;

    let quality = 1;

    for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }

    return data;

}

function generateTexture( data, width, height ) {

    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3( 0, 0, 0 );

    const sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    const canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    const canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

        const v = ~ ~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );

    let dotGeometry = new THREE.BoxGeometry( 80, 20, 80 ),
        dotMaterial = new THREE.MeshBasicMaterial( {color:'blue'})

    let pixel = context.getImageData( 0, 0, 1, 1 );
    let y = 1000
    var dot = new THREE.Mesh( dotGeometry, dotMaterial );
    dot.position.set( -3750, y, -3750 );
    scene.add( dot );

    return canvasScaled;

}

//

function animate() {

    render();
    stats.update();

}

function render() {

    renderer.render( scene, camera );

}

function onPointerMove( event ) {

    pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );

    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObject( mesh );

    // Toggle rotation bool for meshes that we clicked
    if ( intersects.length > 0 ) {

        helper.position.set( 0, 0, 0 );
        helper.lookAt( intersects[ 0 ].face.normal );

        helper.position.copy( intersects[ 0 ].point );
        console.log(helper.position)
    }

}

export default TerrainColoradoRiver