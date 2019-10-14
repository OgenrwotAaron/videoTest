const express = require('express');
const bodyParser=require('body-parser');
const path=require('path');
const crypto=require('crypto');
const mongoose=require('mongoose');
const multer=require('multer');
const GridFsStorage=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const methodOverride=require('method-override')
const spawn=require('child_process').spawn;

const app=express();

//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine','ejs');

//Mongo URI
const mongoURI = 'mongodb://localhost:27017/videotest';

//create mongo connection
const conn=mongoose.createConnection(mongoURI);

//init gridfs stream
let gfs
conn.once('open',()=>{
    //initialise stream
    gfs = Grid(conn.db,mongoose.mongo);
    //gfs.collection('uploads');
})

//create storage engine
const storage= new GridFsStorage({
    url:mongoURI,
    file:(req,file)=>{
        return new Promise((resolve,reject)=>{
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err);
                }
                const filename=buf.toString('hex')+path.extname(file.originalname);
                const fileInfo={
                    filename:filename,
                    bucketname:'uploads'
                };

                resolve(fileInfo)
            })
        })
    }
})

const upload= multer({ storage })

//GET
//loads form
app.get('/',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length === 0){
             res.render('index',{files:false})
        }else{
            files.map(file=>{
                if(file.contentType==='image/jpeg' || file.contentType==='image/png'){
                    file.isImage=true;
                    file.isVideo=false;
                }else if(file.contentType==='video/webm' || file.contentType==='video/mp4'){
                    file.isVideo=true;
                    file.isImage=false;
                }else{
                    file.isImage=false;
                    file.isVideo=false;
                }
            });
            res.render('index',{files:files})
        }
    });
});

//displays all uploads
app.get('/files',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length === 0){
             return res.status(404).json({error:'no files exist'});
        }
        return res.json(files);
    });
});

//get /files/:filename
app.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({error:'no file exist'});
       }
       return res.json(file);
    });
});

//get /image/:filename
app.get('/image/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({error:'no file exist'});
       }
       //check if image
       if (file.contentType==='image/jpeg' || file.contentType==='image/png') {
           //read output to browser
           const readStream=gfs.createReadStream(file.filename);
           readStream.pipe(res);
       }else if(file.contentType==='video/webm' || file.contentType==='video/mp4'){
            //read output to browser
           const readStream=gfs.createReadStream(file.filename);
           readStream.pipe(res);
           
       }else{
           res.status(404).json({
               error:'not an image'
           })
       }
    });
});

//POST
app.post('/upload',
    upload.single('file'),
    (req,res,next)=>{
        let video = `http://localhost:5000/image/${req.file.filename}`;
        const videoName=[];
        const videoname=`${req.file.filename}`.slice(0,-4);

        const resizeVideo=(video,quality)=>{
            const p = new Promise((resolve,reject)=>{
                const ffmpeg=spawn('ffmpeg',['-i',`${video}`,'-codec:v','libx264','-profile:v','main','-preset','slow','-b:v','400k','-maxrate','400k','-bufsize','800k','-vf',`scale=-2:${quality}`,'-threads','0','-b:a','128k',`src/${videoname}_${quality}.mp4`]);
                ffmpeg.stderr.on('data',(data)=>{
                    console.log(`stderr: ${data}`);
                })
                ffmpeg.on('close',(code)=>{
                    videoName.push(`${videoname}_${quality}`);
                    resolve();
                })
            })
            return p;
        }

        const packageVideo=(videos)=>{
            const p=new Promise((resolve,reject)=>{
                const thestring=['--profile','on-demand','--mpd_output',`${videoname}_full.mpd`,'--min_buffer_time','3','--segment_duration','3'];
        
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
        
        next();
    },
    (req,res)=>{
        res.json({file:req.file});
    //res.redirect('/');
    }
)

//DELETE /files/:id
app.delete('/files/:id',(req,res)=>{
    gfs.remove({_id:req.params.id},(err,gridStore)=>{
        if(err){
            return res.status(404).json({err:err})
        }
        res.redirect('/');
    })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>console.log(`Server started on port ${PORT}`));