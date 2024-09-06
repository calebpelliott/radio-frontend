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

let contour = [
    [-106.449750,39.692000],
    [-106.449750,39.692000],
    [-106.451480,39.691990],
    [-106.453220,39.691950],
    [-106.454950,39.691890],
    [-106.456680,39.691810],
    [-106.458410,39.691710],
    [-106.460140,39.691580],
    [-106.461860,39.691430],
    [-106.463580,39.691250],
    [-106.465290,39.691050],
    [-106.467000,39.690830],
    [-106.468710,39.690590],
    [-106.470410,39.690320],
    [-106.472100,39.690030],
    [-106.473790,39.689720],
    [-106.475470,39.689390],
    [-106.477140,39.689030],
    [-106.478800,39.688650],
    [-106.480460,39.688250],
    [-106.482100,39.687830],
    [-106.483730,39.687380],
    [-106.485360,39.686910],
    [-106.486970,39.686420],
    [-106.488570,39.685910],
    [-106.490160,39.685380],
    [-106.491740,39.684820],
    [-106.493310,39.684250],
    [-106.494860,39.683650],
    [-106.496400,39.683040],
    [-106.497920,39.682400],
    [-106.499430,39.681740],
    [-106.500920,39.681060],
    [-106.502400,39.680370],
    [-106.503860,39.679650],
    [-106.505310,39.678910],
    [-106.506740,39.678150],
    [-106.508150,39.677380],
    [-106.509540,39.676580],
    [-106.510920,39.675770],
    [-106.512270,39.674940],
    [-106.513610,39.674090],
    [-106.514930,39.673220],
    [-106.516230,39.672340],
    [-106.517500,39.671430],
    [-106.518760,39.670510],
    [-106.520000,39.669580],
    [-106.521210,39.668630],
    [-106.522400,39.667660],
    [-106.523570,39.666670],
    [-106.524720,39.665670],
    [-106.525850,39.664660],
    [-106.526950,39.663630],
    [-106.528020,39.662580],
    [-106.534920,39.664900],
    [-106.560750,39.677550],
    [-106.577450,39.684270],
    [-106.592750,39.689660],
    [-106.607800,39.694400],
    [-106.622000,39.698210],
    [-106.636120,39.701540],
    [-106.650330,39.704450],
    [-106.664870,39.707070],
    [-106.679200,39.709160],
    [-106.693760,39.710920],
    [-106.707340,39.711890],
    [-106.720590,39.712370],
    [-106.733850,39.712480],
    [-106.747040,39.712220],
    [-106.760700,39.711760],
    [-106.773690,39.710740],
    [-106.784770,39.708850],
    [-106.795970,39.706730],
    [-106.807320,39.704370],
    [-106.817590,39.701470],
    [-106.825670,39.697860],
    [-106.828560,39.693020],
    [-106.828060,39.687500],
    [-106.824800,39.681560],
    [-106.819360,39.675410],
    [-106.813470,39.669380],
    [-106.807090,39.663480],
    [-106.801420,39.657880],
    [-106.795570,39.652440],
    [-106.788300,39.647040],
    [-106.779770,39.641770],
    [-106.771280,39.636750],
    [-106.762930,39.631970],
    [-106.754940,39.627450],
    [-106.747770,39.623160],
    [-106.740160,39.619070],
    [-106.732320,39.615190],
    [-106.723910,39.611520],
    [-106.714990,39.608090],
    [-106.706000,39.604900],
    [-106.696820,39.601950],
    [-106.687510,39.599260],
    [-106.676220,39.596970],
    [-106.668020,39.594670],
    [-106.661490,39.592400],
    [-106.655190,39.590270],
    [-106.647300,39.588520],
    [-106.636830,39.587350],
    [-106.624250,39.586810],
    [-106.610830,39.586760],
    [-106.597840,39.586980],
    [-106.582760,39.587990],
    [-106.560510,39.591000],
    [-106.544650,39.593130],
    [-106.544120,39.591860],
    [-106.543570,39.590590],
    [-106.542990,39.589340],
    [-106.542390,39.588090],
    [-106.541750,39.586850],
    [-106.541080,39.585610],
    [-106.540390,39.584390],
    [-106.539670,39.583180],
    [-106.538930,39.581970],
    [-106.538150,39.580780],
    [-106.537350,39.579590],
    [-106.536520,39.578420],
    [-106.535670,39.577260],
    [-106.534790,39.576110],
    [-106.533880,39.574970],
    [-106.532950,39.573850],
    [-106.531990,39.572740],
    [-106.531010,39.571640],
    [-106.530000,39.570550],
    [-106.528970,39.569480],
    [-106.527920,39.568420],
    [-106.526840,39.567380],
    [-106.525740,39.566350],
    [-106.524610,39.565330],
    [-106.523460,39.564340],
    [-106.522290,39.563350],
    [-106.521100,39.562390],
    [-106.519890,39.561430],
    [-106.518650,39.560500],
    [-106.517390,39.559580],
    [-106.516120,39.558680],
    [-106.514820,39.557800],
    [-106.513500,39.556930],
    [-106.512170,39.556080],
    [-106.510810,39.555250],
    [-106.509440,39.554440],
    [-106.508040,39.553650],
    [-106.506630,39.552870],
    [-106.505210,39.552120],
    [-106.503760,39.551380],
    [-106.502300,39.550670],
    [-106.500830,39.549970],
    [-106.499330,39.549290],
    [-106.497830,39.548640],
    [-106.496310,39.548000],
    [-106.494770,39.547380],
    [-106.493220,39.546790],
    [-106.491660,39.546220],
    [-106.490080,39.545660],
    [-106.488500,39.545130],
    [-106.486900,39.544620],
    [-106.485290,39.544130],
    [-106.483660,39.543660],
    [-106.482030,39.543220],
    [-106.480390,39.542800],
    [-106.478740,39.542400],
    [-106.477080,39.542020],
    [-106.475410,39.541660],
    [-106.473740,39.541330],
    [-106.472050,39.541020],
    [-106.470360,39.540730],
    [-106.468670,39.540460],
    [-106.466970,39.540220],
    [-106.465260,39.540000],
    [-106.463550,39.539800],
    [-106.461830,39.539630],
    [-106.460110,39.539480],
    [-106.458390,39.539350],
    [-106.456670,39.539240],
    [-106.454940,39.539160],
    [-106.453210,39.539100],
    [-106.451480,39.539070],
    [-106.449750,39.539060],
    [-106.448020,39.539070],
    [-106.446290,39.539100],
    [-106.444560,39.539160],
    [-106.442830,39.539240],
    [-106.441110,39.539350],
    [-106.439380,39.539480],
    [-106.437660,39.539630],
    [-106.435950,39.539800],
    [-106.434240,39.540000],
    [-106.432530,39.540220],
    [-106.430830,39.540460],
    [-106.429130,39.540730],
    [-106.427440,39.541020],
    [-106.425760,39.541330],
    [-106.424080,39.541660],
    [-106.422420,39.542020],
    [-106.420760,39.542400],
    [-106.419110,39.542800],
    [-106.417460,39.543220],
    [-106.415830,39.543660],
    [-106.414210,39.544130],
    [-106.412600,39.544620],
    [-106.402440,39.529560],
    [-106.386620,39.506110],
    [-106.372470,39.487610],
    [-106.361250,39.475440],
    [-106.355700,39.473010],
    [-106.356640,39.480330],
    [-106.364200,39.496410],
    [-106.373280,39.513320],
    [-106.382830,39.529610],
    [-106.397190,39.550670],
    [-106.395730,39.551380],
    [-106.394290,39.552120],
    [-106.392860,39.552870],
    [-106.391450,39.553650],
    [-106.390060,39.554440],
    [-106.388690,39.555250],
    [-106.387330,39.556080],
    [-106.385990,39.556930],
    [-106.384680,39.557800],
    [-106.383380,39.558680],
    [-106.382100,39.559580],
    [-106.380850,39.560500],
    [-106.379610,39.561430],
    [-106.378400,39.562390],
    [-106.377200,39.563350],
    [-106.376030,39.564340],
    [-106.374880,39.565330],
    [-106.373760,39.566350],
    [-106.372660,39.567380],
    [-106.371580,39.568420],
    [-106.370520,39.569480],
    [-106.369490,39.570550],
    [-106.368480,39.571640],
    [-106.367500,39.572740],
    [-106.366550,39.573850],
    [-106.365610,39.574970],
    [-106.364710,39.576110],
    [-106.363830,39.577260],
    [-106.362970,39.578420],
    [-106.362150,39.579590],
    [-106.361340,39.580780],
    [-106.360570,39.581970],
    [-106.359820,39.583180],
    [-106.359100,39.584390],
    [-106.358410,39.585610],
    [-106.357750,39.586850],
    [-106.357110,39.588090],
    [-106.356500,39.589340],
    [-106.355920,39.590590],
    [-106.355370,39.591860],
    [-106.354850,39.593130],
    [-106.354360,39.594410],
    [-106.353890,39.595700],
    [-106.353460,39.596990],
    [-106.353050,39.598290],
    [-106.352670,39.599590],
    [-106.352330,39.600900],
    [-106.352010,39.602210],
    [-106.351720,39.603520],
    [-106.351460,39.604840],
    [-106.351230,39.606170],
    [-106.351040,39.607490],
    [-106.350870,39.608820],
    [-106.350730,39.610150],
    [-106.350620,39.611480],
    [-106.350550,39.612820],
    [-106.350500,39.614150],
    [-106.350480,39.615490],
    [-106.350490,39.616820],
    [-106.350540,39.618150],
    [-106.350610,39.619490],
    [-106.350720,39.620820],
    [-106.350850,39.622150],
    [-106.351010,39.623480],
    [-106.351210,39.624810],
    [-106.351430,39.626130],
    [-106.351690,39.627450],
    [-106.351970,39.628770],
    [-106.352280,39.630080],
    [-106.352630,39.631390],
    [-106.353000,39.632690],
    [-106.353400,39.633990],
    [-106.353840,39.635280],
    [-106.354300,39.636570],
    [-106.354790,39.637850],
    [-106.355310,39.639120],
    [-106.355860,39.640390],
    [-106.356430,39.641640],
    [-106.357040,39.642890],
    [-106.357670,39.644140],
    [-106.358330,39.645370],
    [-106.359020,39.646600],
    [-106.359740,39.647810],
    [-106.360480,39.649020],
    [-106.361260,39.650210],
    [-106.362050,39.651390],
    [-106.362880,39.652570],
    [-106.363730,39.653730],
    [-106.364610,39.654880],
    [-106.365520,39.656020],
    [-106.366450,39.657150],
    [-106.367400,39.658260],
    [-106.368380,39.659360],
    [-106.369390,39.660450],
    [-106.370420,39.661520],
    [-106.371470,39.662580],
    [-106.372550,39.663630],
    [-106.373650,39.664660],
    [-106.374780,39.665670],
    [-106.375920,39.666670],
    [-106.377090,39.667660],
    [-106.378290,39.668630],
    [-106.379500,39.669580],
    [-106.380740,39.670510],
    [-106.381990,39.671430],
    [-106.383270,39.672340],
    [-106.384570,39.673220],
    [-106.385890,39.674090],
    [-106.387220,39.674940],
    [-106.388580,39.675770],
    [-106.389950,39.676580],
    [-106.391350,39.677380],
    [-106.392760,39.678150],
    [-106.394190,39.678910],
    [-106.395630,39.679650],
    [-106.397100,39.680370],
    [-106.398570,39.681060],
    [-106.400070,39.681740],
    [-106.401580,39.682400],
    [-106.403100,39.683040],
    [-106.404640,39.683650],
    [-106.406190,39.684250],
    [-106.407750,39.684820],
    [-106.409330,39.685380],
    [-106.410920,39.685910],
    [-106.412520,39.686420],
    [-106.414140,39.686910],
    [-106.415760,39.687380],
    [-106.417400,39.687830],
    [-106.419040,39.688250],
    [-106.420690,39.688650],
    [-106.422360,39.689030],
    [-106.424030,39.689390],
    [-106.425710,39.689720],
    [-106.427390,39.690030],
    [-106.429090,39.690320],
    [-106.430790,39.690590],
    [-106.432490,39.690830],
    [-106.434200,39.691050],
    [-106.435920,39.691250],
    [-106.437640,39.691430],
    [-106.439360,39.691580],
    [-106.441090,39.691710],
    [-106.442820,39.691810],
    [-106.444550,39.691890],
    [-106.446280,39.691950],
    [-106.449750,39.692000]
];

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

    let latitude = 39.473010;
    let longitude = -106.35570;
    let lat_y = Math.round(Math.abs((gy - latitude) / sy));
    let long_x = Math.round(Math.abs((longitude - gx) / sx));

    let vals = [];
    let contour_idxs = [];

    for (let i = width-1; i >=0; i--) {
        for (let j = 0; j < heigth; j++) {
            const row = (j * widthMultiplier) + x_offset;
            const col = (i * heightMultiplier) + y_offset;
            let ele = data[row * image.getWidth() + col];
            vals.push(ele)

            for (const point_idx in contour) {
                const point = contour[point_idx];
                lat_y = Math.round(Math.abs((gy - point[1]) / sy));
                long_x = Math.round(Math.abs((point[0] - gx) / sx));
                if (row <= lat_y+2 && row >= lat_y-2){
                    if (col <= long_x+2 && col >= long_x-2) {
                        let index = vals.length;
                        contour_idxs.push(index);
                    }
                }
            }
        }
    }

    return [vals, contour_idxs];
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