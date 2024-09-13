import * as THREE from 'three';

import { useEffect, useRef } from "react";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {BufferAttribute} from "three";

let scene, camera, renderer, raycaster, mouse, controls;
let line, colors;
let isDraggingVertex = false;
let draggedIndex;
let enabledEdgeSplitting = true;

function Cube() {
    const refContainer = useRef(null);
    useEffect(() => {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
        camera.position.set( 0, 0, 100 );
        camera.lookAt( 0, 0, 0 );

        controls = new OrbitControls(camera, renderer.domElement );
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
        //const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        let points = [];
        points.push( new THREE.Vector3( - 10, 0, 0 ),  new THREE.Vector3( 0, 0, 0 ));
        points.push( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 10, 10, 0 ) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        colors = [];
        for (let i = 0; i < geometry.attributes.position.count; i++) {
            colors.push( 1,0,0 );
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors,3 ) );

        line = new THREE.LineSegments( geometry, material );
        scene.add(line);
        renderer.render(scene, camera);
        var animate = function () {
            requestAnimationFrame(animate);

            movePointInCircle();
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        window.addEventListener('click', onClick,false);
        window.addEventListener('mousemove', (event) => {
            onMouseMove(event);
        });
        window.addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mouseup', onMouseUp, false);
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

function onMouseDown(event) {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);
    let intersection = raycaster.intersectObject(line);
    if (intersection.length > 0) {
        let index = intersection[0].index;
        console.log('intersection index: ', index);

        //find vertex closest to intersection[0].point
        let intersect = intersection[0].point;
        let intersectedArray = intersection[0].object.geometry.attributes.position.array;
        let p1 = [intersectedArray[(3*index)],intersectedArray[(3*index)+1],intersectedArray[(3*index)+2]];
        let p2 = [intersectedArray[(3*index)+3],intersectedArray[(3*index)+4],intersectedArray[(3*index)+5]];
        p1 = new THREE.Vector3(p1[0], p1[1], p1[2]);
        p2 = new THREE.Vector3(p2[0], p2[1], p2[2]);

        let closestIndex;
        if (p1.distanceTo(intersect) <= p2.distanceTo(intersect)) {
            closestIndex = index;
            console.log('p1 closer index: ', closestIndex);
        }
        else {
            closestIndex = index+1;
            console.log('p2 closer index: ', closestIndex);
        }

        isDraggingVertex = true;
        controls.enableRotate = false;
        draggedIndex = closestIndex;
        console.log(draggedIndex);

        if (enabledEdgeSplitting) {
            console.log(intersection[0]);
            splitIntersectedLine(intersection[0]);
        }
    }
}

function splitIntersectedLine(intersection) {
    console.log(intersection.index);
    let index = intersection.index;
    draggedIndex = index+1;

    let oldGeometry = line.geometry.attributes.position.array;
    let p1 = [oldGeometry[(3*index)], oldGeometry[(3*index)+1],oldGeometry[(3*index)+2]];
    let p2 = intersection.point;
    let p3 = [oldGeometry[(3*(index+1))], oldGeometry[(3*(index+1))+1],oldGeometry[(3*(index+1))+2]];

    let slice1 = oldGeometry.slice(0, (index+1)*3);
    let slice2 = oldGeometry.slice(((index+1)*3), oldGeometry.length);

    let newGeometry = new Float32Array(oldGeometry.length + 6);
    newGeometry.set(slice1);
    newGeometry.set(slice2, (index+3)*3);
    newGeometry.set([p2.x,p2.y,p2.z], (index+1)*3);
    newGeometry.set([p2.x,p2.y,p2.z], (index+1)*3+3);

    line.geometry.setAttribute('position', new THREE.BufferAttribute(newGeometry, 3));

    colors.push(1,1,0,1,1,0);
    line.geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors,3 ) );

    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingBox();
    line.geometry.computeBoundingSphere();

}

function onMouseUp(event) {
    if (isDraggingVertex) {
        isDraggingVertex = false;
        controls.enableRotate = true;
        line.geometry.computeBoundingBox();
        line.geometry.computeBoundingSphere();
    }
}

function movePointInCircle() {
    let postition = line.geometry.attributes.position;
    postition.array[3 * 0 + 0] = Math.sin(Date.now() * .001) * 10;
    postition.array[3 * 0 + 1] = Math.cos(Date.now() * .001) * 10;
    postition.needsUpdate = true;
}

function updateMouse(event) {
    // Get the canvas bounds
    const canvasBounds = renderer.domElement.getBoundingClientRect();

    // Calculate mouse coordinates relative to the canvas
    const mouseX = (event.clientX - canvasBounds.left) / canvasBounds.width;
    const mouseY = (event.clientY - canvasBounds.top) / canvasBounds.height;

    // Convert mouse coordinates to normalized device coordinates (-1 to +1 range)
    mouse.x = (mouseX * 2) - 1;
    mouse.y = -(mouseY * 2) + 1;
}

function onClick(event) {
    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObject(line);

    //console.log('x: ', mouse.x, ' y: ', mouse.y);

    //addPointAtClick();


    if (intersects.length > 0) {
        console.log('Line clicked!', intersects[0].point);
        console.log('Line clicked: ', intersects[0].index);
        //addStaticPoint();


        //dragVertex();
        //dragVertexAfterRotation();//TODO
        //splitAndDragSegmentAtClick();//TODO

        // Example: Change line color when clicked
        //line.material.color.set(0xff0000);
    }
    else {
        addPointAtClickAfterRotation();
    }
}

function onMouseMove(event) {
    //console.log('checking intersection');
    updateMouse(event);


    if (isDraggingVertex) {
        if(enabledEdgeSplitting) {
            dragVertex();
        }
        else {
            dragVertex();
        }
    }

    //raycaster.setFromCamera(mouse, camera);
    /*const intersection = raycaster.intersectObject(line);

    if (intersection.length > 0) {
        const line = intersection[0].object;
        const material = line.material.clone(); // Clone the material
        material.color.set(0x0000ff); // Set hover color to red
        line.material = material; // Apply the new material
    }*/
}

function addStaticPoint() {
    /*points.push(new THREE.Vector3(10,10,5));
    let newGeom = new THREE.BufferGeometry().setFromPoints(points);
    let colorArr = Array(newGeom.attributes.position.count).fill([1,0,0]).flat();
    colorArr[1] = 1;
    const colors = new Float32Array(
        colorArr
    );
    newGeom.setAttribute('color', new BufferAttribute( colors,3 ) );

    line.geometry.dispose();
    line.geometry = newGeom;*/
}

function addPointAtClick() {
    /*const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    points.push(intersection);
    line.geometry.dispose();
    line.geometry.setFromPoints(points);*/
}

function addPointAtClickAfterRotation() {
    const camDirection = new THREE.Vector3();
    camera.getWorldDirection(camDirection);

    const plane = new THREE.Plane(camDirection, 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    let oldGeometry = line.geometry.attributes.position.array;
    let lastPoint = [oldGeometry[oldGeometry.length - 3], oldGeometry[oldGeometry.length - 2], oldGeometry[oldGeometry.length - 1]];
    let newGeometry = new Float32Array(oldGeometry.length + 6);
    newGeometry.set(oldGeometry);
    newGeometry.set(lastPoint, oldGeometry.length);
    newGeometry.set([intersection.x, intersection.y, intersection.z], oldGeometry.length+3);
    line.geometry.setAttribute('position', new THREE.BufferAttribute(newGeometry, 3));

    colors.push(1,1,0,1,1,0);
    line.geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors,3 ) );

    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingBox();
    line.geometry.computeBoundingSphere();
}

function dragVertex() {
    let position = line.geometry.attributes.position;
    let camDirection = new THREE.Vector3();
    camera.getWorldDirection(camDirection);
    let draggedVertex = new THREE.Vector3(position.array[(3 * draggedIndex) + 0],position.array[(3 * draggedIndex) + 1], position.array[(3 * draggedIndex) + 2]);
    let plane = new THREE.Plane(camDirection, 0);
    let distanceBetweenPointAndOriginPlane = plane.distanceToPoint(draggedVertex);
    plane.constant = distanceBetweenPointAndOriginPlane;
    let intersection = new THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    //Assume odd
    let sharedVertIndex = draggedIndex + 1;

    //If even, shared vert is -1, else +1
    if (draggedIndex % 2 === 0) {
        sharedVertIndex = draggedIndex - 1;
    }


    position.array[(3 * draggedIndex) + 0] = intersection.x;
    position.array[(3 * draggedIndex) + 1] = intersection.y;
    position.array[(3 * draggedIndex) + 2] = intersection.z;

    //Check to make sure the shared vertex is within the bounds of the geometry
    if (sharedVertIndex >= 0  && sharedVertIndex < position.count) {
        position.array[(3 * sharedVertIndex) + 0] = intersection.x;
        position.array[(3 * sharedVertIndex) + 1] = intersection.y;
        position.array[(3 * sharedVertIndex) + 2] = intersection.z;
    }

    position.needsUpdate = true;
    console.log('x', position.array[(3 * draggedIndex) + 0], 'y', position.array[(3 * draggedIndex) + 1], 'z', position.array[(3 * draggedIndex) + 2]);
}

export default Cube