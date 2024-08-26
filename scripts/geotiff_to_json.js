const fs = require('fs');
import { fromUrl, fromFile } from 'geotiff';

async function geotiff_to_json() {
    const tiff = await fromFile('../public/geotiff/USGS_1_n40w107_20220216.tif');
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

// Convert the JSON object to a string
    const jsonString = JSON.stringify(geo_data, null, 2);

// Write the string to a file
    fs.writeFile('USGS_1_n40w107_20220216.json', jsonString, (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
}

geotiff_to_json()