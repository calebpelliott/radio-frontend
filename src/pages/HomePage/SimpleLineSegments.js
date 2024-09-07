import * as THREE from 'three';

import { useEffect, useRef } from "react";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {BufferAttribute} from "three";

let scene, camera, renderer, raycaster, mouse;
let line, points;

function Cube() {
    const refContainer = useRef(null);
    useEffect(() => {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
        camera.position.set( 0, 0, 100 );
        camera.lookAt( 0, 0, 0 );

        var controls = new OrbitControls(camera, renderer.domElement );
        controls.minDistance = 50;
        controls.maxDistance = 100;
        controls.update();

        scene = new THREE.Scene();
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // document.body.appendChild( renderer.domElement );
        // use ref as a mount point of the Cube.js scene instead of the document.body
        refContainer.current && refContainer.current.appendChild( renderer.domElement );
        //create a blue LineBasicMaterial
        const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        points = [];
        points.push( new THREE.Vector3( - 10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        points.push( new THREE.Vector3( 10, 0, 0 ) );

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let colorArr = Array(geometry.attributes.position.count).fill([1,0,0]).flat();
        colorArr[1] = 1;
        const colors = new Float32Array(
            colorArr
        );
        geometry.setAttribute('color', new BufferAttribute( colors,3 ) );

        line = new THREE.Line( geometry, material );
        scene.add(line);
        renderer.render(scene, camera);
        var animate = function () {
            requestAnimationFrame(animate);

            movePointInCircle();

            renderer.render(scene, camera);
        };
        animate();
        window.addEventListener('click', onClick,false);
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

function movePointInCircle() {
    let postition = line.geometry.attributes.position;
    postition.array[3 * 0 + 0] = Math.sin(Date.now() * .001) * 10;
    postition.array[3 * 0 + 1] = Math.cos(Date.now() * .001) * 10;
    postition.needsUpdate = true;
}

function onClick(event) {
    // Get the canvas bounds
    const canvasBounds = renderer.domElement.getBoundingClientRect();

    // Calculate mouse coordinates relative to the canvas
    const mouseX = (event.clientX - canvasBounds.left) / canvasBounds.width;
    const mouseY = (event.clientY - canvasBounds.top) / canvasBounds.height;

    // Convert mouse coordinates to normalized device coordinates (-1 to +1 range)
    mouse.x = (mouseX * 2) - 1;
    mouse.y = -(mouseY * 2) + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObject(line);

    console.log('x: ', mouse.x, ' y: ', mouse.y);
    if (intersects.length > 0) {
        console.log('Line clicked!', intersects[0].point);
        points.push(new THREE.Vector3(10,10,0));
        let newGeom = new THREE.BufferGeometry().setFromPoints(points);
        let colorArr = Array(newGeom.attributes.position.count).fill([1,0,0]).flat();
        colorArr[1] = 1;
        const colors = new Float32Array(
            colorArr
        );
        newGeom.setAttribute('color', new BufferAttribute( colors,3 ) );

        line.geometry.dispose();
        line.geometry = newGeom;

        // Example: Change line color when clicked
        //line.material.color.set(0xff0000);
    }
}

export default Cube