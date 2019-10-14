const argv=require('yargs').argv;
const Swatch=require('./swatch');
const image=argv.image;
const write=argv.write;

//get the folder of videos from the command line
if(!image){
    console.error('You must provide an image with  the --image flag');
    process.exit(1);
}

Swatch.load(image)
.then(pixels=>Swatch.quantize(pixels))
.then(buckets=>Swatch.orderByLuminance(buckets))
.then(swatch=>{
    const primary=Swatch.getMostVarientColor(swatch);
    const colors={
        primary,
        secondary:Swatch.darken(primary,25),
        tertiary: Swatch.darken(primary, 50),
        quaternary: Swatch.darken(primary, 75),
        primaryLight: Swatch.lighten(primary, 100)
    };

    console.log(JSON.stringify(colors,null,2));

    //write out an HTML doc
    if(!write){
        return;
    }

    const fs=require('fs');
    const path=require('path');

    const swatchHtml=`
        <!doctype html>
        <html>
        <head>
            <title>Swatch for ${image}</title>
            <style>
            html, body { width: 100%; height: 100%; margin: 0; padding: 0 }
            body { display: flex; flex-wrap: wrap; }
            .color { width: 25%; height: 25%; }
            </style>
        </head>
        <body>
            ${swatch.reduce((prev, color) => {
            return prev + `<div
                class="color"
                style="background-color: rgb(${color.r}, ${color.g}, ${color.b})"></div>`;
            }, '')}
        </body>
        </html>
    `;
    fs.writeFile(`${path.dirname(image)}/swatch2.html`,swatchHtml,(err)=>{
        if(err) throw err;
        console.log('Written');
    });
})