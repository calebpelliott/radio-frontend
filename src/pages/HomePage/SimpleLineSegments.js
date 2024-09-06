import * as THREE from 'three';

import { useEffect, useRef } from "react";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {BufferAttribute} from "three";

function Cube() {
    const refContainer = useRef(null);
    useEffect(() => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
        camera.position.set( 0, 100, 100 );
        camera.lookAt( 0, 0, 0 );

        var controls = new OrbitControls(camera, renderer.domElement );
        controls.minDistance = 50;
        controls.maxDistance = 100;
        controls.update();

        const scene = new THREE.Scene();

        // document.body.appendChild( renderer.domElement );
        // use ref as a mount point of the Cube.js scene instead of the document.body
        refContainer.current && refContainer.current.appendChild( renderer.domElement );
        //create a blue LineBasicMaterial
        const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        const points = [];
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

        const line = new THREE.Line( geometry, material );
        scene.add(line);
        renderer.render(scene, camera);
        var animate = function () {
            requestAnimationFrame(animate);
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        animate();

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

export default Cube