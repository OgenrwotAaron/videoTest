const names=['sample_720','sample_480','sample_360','sample_240'];
const thestring=['--profile','on-demand','--mpd_output','sample-manifest-full.mpd','--min_buffer_time','3','--segment_duration','3'];
names.forEach(name => {
    thestring.unshift(`input=${name}.mp4,stream=audio,output=dest/${name}_audio.mp4`,`input=${name}.mp4,stream=video,output=dest/${name}_video.mp4`);
});
console.log(`${thestring}`);