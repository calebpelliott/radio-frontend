//area ~223sq miles
//perimeter 77.7 miles
//source: https://apps.nationalmap.gov/downloader/ 1 arc-second DEM
//file: USGS_1_n40w107_20220216.tif

import { fromUrl } from 'geotiff';

import { useEffect, useRef } from "react";

function Topo() {
    const refContainer = useRef(null);
    useEffect(() => {
    }, []);

    experimental();

    return (
        <div ref={refContainer}></div>
    );
}

async function experimental() {
    const tiff = await fromUrl('/geotiff/USGS_1_n40w107_20220216.tif');
    const image = await tiff.getImage();

    // Read raster data from the first band
    //const data = await image.readRasters({ samples: [0] });
    const [data] = await image.readRasters();
    const row = 0, col = 0;  // example row and column indices
    const elevation_value = data[row * image.getWidth() + col];

    // Get metadata
    const width = image.getWidth();
    const height = image.getHeight();
    const bbox = image.getBoundingBox();
    console.log('Data array:', data);
    console.log('Width:', width, 'Height:', height, 'Bounding Box:', bbox, "Elevation:", elevation_value);
    let x = 4;
}

export default Topo