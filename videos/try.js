// const exec=require('child_process').exec;
const spawn=require('child_process').spawn;
const http=require('http');
//const parent = process.argv[2];
let video = "http://localhost:5000/image/cfc9c380cf09086a73a16555ad60d5f7.mp4";
const videoName=[];

const resizeVideo=(video,quality)=>{
    const p = new Promise((resolve,reject)=>{
        const ffmpeg=spawn('ffmpeg',['-i',`${video}`,'-codec:v','libx264','-profile:v','main','-preset','slow','-b:v','400k','-maxrate','400k','-bufsize','800k','-vf',`scale=-2:${quality}`,'-threads','0','-b:a','128k',`src/video_${quality}.mp4`]);
        ffmpeg.stderr.on('data',(data)=>{
            console.log(`stderr: ${data}`);
        })
        ffmpeg.on('close',(code)=>{
            videoName.push(`video_${quality}`);
            resolve();
        })
    })
    return p;
}

const packageVideo=(videos)=>{
    const p=new Promise((resolve,reject)=>{
        const thestring=['--profile','on-demand','--mpd_output','sample-manifest-full.mpd','--min_buffer_time','3','--segment_duration','3'];

        videos.forEach(video => {
            thestring.unshift(`input=src/${video}.mp4,stream=audio,output=dest/${video}_audio.mp4`,`input=src/${video}.mp4,stream=video,output=dest/${video}_video.mp4`);
        });

        const packager=spawn('./packager',thestring);
        packager.stderr.on('data',(data)=>{
            console.log(`stderr: ${data}`);
        })
        packager.on('close',(code)=>{
            resolve();
        })
    })

    return p;
}

const processVideo=(video)=>{
    if(video){
        //console.log(`${video}`);
        resizeVideo(video,720).then(()=>{
            //720p video done
            console.log('720p video done');
            resizeVideo(video,480).then(()=>{
                //480p video done
                console.log('480p video done');
                resizeVideo(video,360).then(()=>{
                    //360p video done
                    console.log('360p video done');
                    resizeVideo(video,240).then(()=>{
                        packageVideo(videoName);
                        console.log('240p video done: '+`${videoName}`);
                    })
                })
            })
        })
    }
}

processVideo(video);
// const myScript=exec('sh script.sh',(err,stdout,stderr)=>{
//     console.log(stdout);
//     console.log(stderr);
//     if(err!==null){
//         console.log(`exec error: ${err}`);
//     }
// })