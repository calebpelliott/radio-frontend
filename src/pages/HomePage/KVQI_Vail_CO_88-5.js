//area ~223sq miles
//perimeter 77.7 miles
//source: https://apps.nationalmap.gov/downloader/ 1 arc-second DEM
//file: USGS_1_n40w107_20220216.tif

import { fromUrl } from 'geotiff';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {Lut} from "three/addons/math/Lut";
import {OrbitControls} from "three/addons/controls/OrbitControls";

let perpCamera, orthoCamera, renderer, lut;

let mesh, sprite;
let scene, uiScene;

let params;

const KVQI = ({ onDataLoaded }) => {
    const refContainer = useRef(null);
    useEffect(() => {
        const fetchData = async () => {
            /*try {
                const response = await experimental();
                onDataLoaded(response);
            } catch (error) {
                console.error("Error fetching data:", error);
            }*/
            await loadGeometry();
            refContainer.current && refContainer.current.appendChild( renderer.domElement );

        };

        fetchData();

        return () => {
            renderer && renderer.setSize(0,0);
            renderer && renderer.forceContextLoss();
            renderer && renderer.dispose();
            mesh.geometry.dispose();
            mesh.material.dispose();
        };
    }, [onDataLoaded]);

    return (
        <div ref={refContainer}></div>
    );
};

function transform(a, b, M, roundToInt = false) {
    const round = (v) => (roundToInt ? v | 0 : v);
    return [
        round(M[0] + M[1] * a + M[2] * b),
        round(M[3] + M[4] * a + M[5] * b),
    ];
}

export async function loadSwath(heigth, width, lat, lon, widthMultiplier = 1, heightMultiplier = 1) {
    const tiff = await fromUrl('/geotiff/USGS_1_n40w107_20220216.tif');
    const image = await tiff.getImage();
    const [data] = await image.readRasters();

    // Construct the WGS-84 forward and inverse affine matrices:
    const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory;
    let [sx, sy, sz] = s;
    let [px, py, k, gx, gy, gz] = t;
    sy = -sy; // WGS-84 tiles have a "flipped" y component
    const pixelToGPS = [gx, sx, 0, gy, 0, sy];

    let y_offset = Math.round(Math.abs((gy - lat) / sy));
    let x_offset = Math.round(Math.abs((lon - gx) / sx));
    let x = x_offset, y= y_offset;
    const gpsBBox = [transform(x, y, pixelToGPS), transform(x + 1, y + 1, pixelToGPS)];
    console.log(`Origin (top left):`, gpsBBox[0]);
    console.log(gpsBBox[0][1] + "," + gpsBBox[0][0]);

    x = x_offset + (width * widthMultiplier);
    y= y_offset + (heigth * heightMultiplier);
    const gpsBBox2 = [transform(x, y, pixelToGPS), transform(x + 1, y + 1, pixelToGPS)];
    console.log(`Bottom right:`, gpsBBox2[0]);
    console.log(gpsBBox2[0][1] + "," + gpsBBox2[0][0]);

    const bbox = image.getBoundingBox();
    console.log('Bounding Box:', bbox);

    let vals = [];

    for (let i = width-1; i >=0; i--) {
        for (let j = 0; j < heigth; j++) {
            const row = (j * widthMultiplier) + x_offset;
            const col = (i * heightMultiplier) + y_offset;
            let ele = data[row * image.getWidth() + col];
            vals.push(ele)
        }
    }

    return vals;
}

async function loadGeotiffModel() {
    const tiff = await fromUrl('/geotiff/USGS_1_n40w107_20220216.tif');
    const image = await tiff.getImage();

    // Read raster data from the first band
    //const data = await image.readRasters({ samples: [0] });
    const [data] = await image.readRasters();
    //const row = 0, col = 0;  // example row and column indices
    //const elevation_value = data[row * image.getWidth() + col];

    let points = []
    let vals = []

    for (let i = 0; i < image.getHeight(); i++) {
        for (let j = 0; j < image.getWidth(); j++) {
            const row = j, col = i;
            let ele = data[row * image.getWidth() + col];
            points.push(row, col, ele);
            vals.push(ele)
        }
    }

    let modelData = formatToThree(points, vals)

    // Get metadata
    const width = image.getWidth();
    const height = image.getHeight();
    const bbox = image.getBoundingBox();
    console.log('Width:', width, 'Height:', height, 'Bounding Box:', bbox);


    return modelData
}

function formatToThree (vertices, vals) {
    const geo_data = {
        metadata: {
            version: 4,
            type: "BufferGeometry"
        },
        uuid: "AF2ADB07-FBC5-4BAE-AD60-123456789ABC",
        type: "BufferGeometry",
        data: {
            attributes: {
                position: {
                    itemSize: 3,
                    type: "Float32Array",
                    array: vertices
                }
            }
        }
    }



    console.log(geo_data);
    return geo_data;
}

async function loadGeometry() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    uiScene = new THREE.Scene();

    lut = new Lut();

    const width = window.innerWidth;
    const height = window.innerHeight;

    perpCamera = new THREE.PerspectiveCamera(60, width / height, 1, 100);
    perpCamera.position.set(0, 0, 10);
    scene.add(perpCamera);

    orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2);
    orthoCamera.position.set(0.5, 0, 1);

    sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(lut.createCanvas())
    }));
    sprite.material.map.colorSpace = THREE.SRGBColorSpace;
    sprite.scale.x = 0.125;
    uiScene.add(sprite);

    mesh = new THREE.Mesh(undefined, new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0xF5F5F5,
        vertexColors: true
    }));
    scene.add(mesh);

    params = {
        colorMap: 'rainbow',
    };

    const pointLight = new THREE.PointLight(0xffffff, 3, 0, 0);
    perpCamera.add(pointLight);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    window.addEventListener('resize', onWindowResize);

    const controls = new OrbitControls(perpCamera, renderer.domElement);
    controls.addEventListener('change', render);

    const gui = new GUI();

    gui.add(params, 'colorMap', ['rainbow', 'cooltowarm', 'blackbody', 'grayscale']).onChange(function () {

        updateColors();
        render();

    });

    loadModel();

    return renderer;
}

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    perpCamera.aspect = width / height;
    perpCamera.updateProjectionMatrix();

    renderer.setSize( width, height );
    render();

}

function render() {

    renderer.clear();
    renderer.render( scene, perpCamera );
    renderer.render( uiScene, orthoCamera );

}

async function loadModel() {

    const loader = new THREE.BufferGeometryLoader();
    loader.load('/models/json/pressure.json', function (geometry) {

        geometry.center();
        geometry.computeVertexNormals();

        // default color attribute
        const colors = [];

        for (let i = 0, n = geometry.attributes.position.count; i < n; ++i) {

            colors.push(1, 1, 1);

        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        mesh.geometry = geometry;
        updateColors();

        render();

    });

    /*const geometry = new THREE.BufferGeometry();
    geometry.center();
    geometry.computeVertexNormals();
    const model = await loadGeotiffModel();

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( model.data.attributes.position.array, model.data.attributes.position.itemSize ) );
    const colors = [];
    for (let i = 0, n = geometry.attributes.position.count; i < n; ++i) {
        colors.push(1, 1, 1);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    mesh.geometry = geometry;
    render();*/


    /*const geometry = new THREE.BufferGeometry();
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array( [
        -1.0, -1.0,  1.0, // v0
        1.0, -1.0,  1.0, // v1
        1.0,  1.0,  1.0, // v2

        1.0,  1.0,  1.0, // v3
        -1.0,  1.0,  1.0, // v4
        -1.0, -1.0,  1.0  // v5
    ] );

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    mesh.geometry = geometry;
    render();*/
}

function updateColors() {

    /*lut.setColorMap( params.colorMap );

    lut.setMax( 2000 * 10);
    lut.setMin( 0 );

    const geometry = mesh.geometry;
    const pressures = geometry.attributes.pressure;
    const colors = geometry.attributes.color;
    const color = new THREE.Color();

    for ( let i = 0; i < pressures.array.length; i ++ ) {

        const colorValue = pressures.array[ i ] * 10;

        color.copy( lut.getColor( colorValue ) ).convertSRGBToLinear();

        colors.setXYZ( i, color.r, color.g, color.b );

    }

    colors.needsUpdate = true;

    const map = sprite.material.map;
    lut.updateCanvas( map.image );
    map.needsUpdate = true;*/

}

export default KVQI