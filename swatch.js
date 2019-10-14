const getPixels=require('get-pixels');

class Swatch{
    static get DEFAULT_DEPTH(){
        return 4;
    }

    static load(image){
        return new Promise((resolve,reject)=>{
            getPixels(image,(err,pixels)=>{
                if(err){
                    reject(err);
                }
                resolve(Swatch._convertPixelsToRGB(pixels));
            });
        });
    }

    static _convertPixelsToRGB(pixels){
        const width=pixels.shape[0];
        const height=pixels.shape[1];
        const rgbvals=[];
        for(let y=0;y<height;y++){
            for(let x=0;x<width;x++){
                const index=(y*width+x)*4;
                rgbvals.push({
                    r:pixels.data[index],
                    g:pixels.data[index+1],
                    b:pixels.data[index+2]
                });
            }
        }

        return rgbvals;
    }

    static _findBiggestRange(rgbValues){
        let rMin=Number.POSITIVE_INFINITY;
        let rMax=Number.NEGATIVE_INFINITY;

        let gMin=Number.POSITIVE_INFINITY;
        let gMax=Number.NEGATIVE_INFINITY;
        
        let bMin=Number.POSITIVE_INFINITY;
        let bMax=Number.NEGATIVE_INFINITY;

        rgbValues.forEach(pixel=>{
            rMin=Math.min(rMax,pixel.r);
            rMax=Math.max(rMax,pixel.r);
            gMin=Math.min(gMax,pixel.g);
            gMax=Math.max(gMax,pixel.g);
            bMin=Math.min(bMax,pixel.b);
            bMax=Math.max(bMax,pixel.b);
        });

        const rRange=rMax-rMin;
        const gRange=gMax-gMin;
        const bRange=bMax-bMin;

        const biggestRange=Math.max(rRange,gRange,bRange);
        if(biggestRange===rRange){
            return 'r';
        }else if(biggestRange===gRange){
            return 'g';
        }
        return 'b';
    };

    static quantize(rgbVals,depth=0,maxDepth=Swatch.DEFAULT_DEPTH){
        if(depth===0){
            console.log(`Quantasizing to ${Math.pow(2,maxDepth)} buckets.`);
        }

        //Base case:average the rgb values  down to a single average value
        if(depth===maxDepth){
            const color=rgbVals.reduce((prev,curr)=>{
                prev.r+=curr.r;
                prev.g+=curr.g;
                prev.b+=curr.b;

                return prev;
            },{
                r:0,
                g:0,
                b:0
            });

            color.r=Math.round(color.r/rgbVals.length);
            color.g=Math.round(color.g/rgbVals.length);
            color.b=Math.round(color.b/rgbVals.length);

            return [color];
        }

        //Recursive case:find the component with the biggest range,
        // sort by it, then divide the RGB values in half, and go again.

        const componentToSortBy=Swatch._findBiggestRange(rgbVals);
        rgbVals.sort((p1,p2)=>{
            return p1[componentToSortBy]-p2[componentToSortBy];
        });

        const mid = rgbVals.length/2;
        return [...Swatch.quantize(rgbVals.slice(0,mid),depth+1,maxDepth),
        ...Swatch.quantize(rgbVals.slice(mid+1),depth+1,maxDepth)];
    }

    static orderByLuminance(rgbVals){
        const calcLuminance=p=>{
            return 0.2126 *p.r + 0.7152*p.g+0.0722*p.b;
        };

        return rgbVals.sort((p1,p2)=>{
            return calcLuminance(p1)-calcLuminance(p2);
        });
    }

    static getMostVarientColor(rgbVals){
        let index=0;
        let max=Number.NEGATIVE_INFINITY;

        //Remap each RGB value to a variance by taking the max component from the
        // min component.
        rgbVals.map(v=>Math.max(v.r,v.g,v.b)-Math.min(v.r,v.g,v.b))
        // Then step through each value and find which has the largest value.
        .forEach((v,i)=>{
            if(v>max){
                index=i;
                max=v;
            }
        });

        return rgbVals[index];
    }

    static lighten(rgbVal,percent){
        const factor=1+(percent/100);
        return Swatch._adjustColor(rgbVal,factor);
    }

    static darken(rgbVal,percent){
        const factor = 1 - (percent / 100);
        return Swatch._adjustColor(rgbVal, factor);
    }

    static _clamp(value,min,max){
        return Math.min(max,Math.max(min,value));
    }

    static _adjustColor(rgbVal,factor){
        return{
            r: Swatch._clamp(Math.round(rgbVal.r * factor), 0, 255),
            g: Swatch._clamp(Math.round(rgbVal.g * factor), 0, 255),
            b: Swatch._clamp(Math.round(rgbVal.b * factor), 0, 255)
        }
    }
}

module.exports=Swatch;