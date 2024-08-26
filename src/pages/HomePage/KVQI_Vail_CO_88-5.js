//area ~223sq miles
//perimeter 77.7 miles
//source: https://apps.nationalmap.gov/downloader/ 1 arc-second DEM
//file: USGS_1_n40w107_20220216.tif

import { fromUrl } from 'geotiff';

import { useEffect, useRef } from "react";

const Topo = ({ onDataLoaded }) => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await experimental();
                onDataLoaded(response);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [onDataLoaded]);

    return <div>Child Component: Fetching data...</div>;
};

async function experimental() {
    return "Done";
    const tiff = await fromUrl('/geotiff/USGS_1_n40w107_20220216.tif');
    const image = await tiff.getImage();

    // Read raster data from the first band
    //const data = await image.readRasters({ samples: [0] });
    const [data] = await image.readRasters();
    //const row = 0, col = 0;  // example row and column indices
    //const elevation_value = data[row * image.getWidth() + col];

    let points = []

    for (let i = 0; i < image.getHeight(); i++) {
        for (let j = 0; j < image.getWidth(); j++) {
            const row = j, col = i;
            let ele = data[row * image.getWidth() + col];
            points.push(row, col, ele);
        }
    }

    let json = getJson(points)

    // Get metadata
    const width = image.getWidth();
    const height = image.getHeight();
    const bbox = image.getBoundingBox();
    console.log('Data array:', data);
    //console.log('Width:', width, 'Height:', height, 'Bounding Box:', bbox, "Elevation:", elevation_value);
    let x = 4;

    return JSON.stringify(json)
}

function getJson (points) {
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
                    array: points
                }
            }
        }
    }



    console.log(geo_data);
    return geo_data;
}

export default Topo