//var manifestUri='b064f88151586302bc9e36007a94042e_full.mpd';
//ftp://ruralmoocs.com/httpdocs/96cce13eec5140e69e1631482fe6e9f5/my_playlist.mpd
var manifestUri='ftp://ruraly9c@ruralmoocs.com:Ruraly9c!@ftp.ruralmoocs.com/httpdocs/96cce13eec5140e69e1631482fe6e9f5/my_playlist.mpd'
//https://www.dropbox.com/s/4agrf8n67r4nbjx/Creating%20Your%20First%20Android%20App%20with%20Android%20Studio%20and%20Firebase-1_my_playlist.mpd?dl=0

function initApp(){
    shaka.polyfill.installAll();

    if(shaka.Player.isBrowserSupported()){
        initPlayer();
    }else{
        console.error("Browser not supported");
    }
}

function initPlayer(){
    var video=document.getElementById('video');
    var player=new shaka.Player(video);

    window.player=player;

    player.addEventListener('error',onErrorEvent);

    player.load(manifestUri).then(function(){
        console.log("the vidoe has now been loaded");
    }).catch(onError);
}

function onErrorEvent(event){
    onError(event.detail);
}

function onError(error){
    console.log('Error code',error.code,'object',error);
}

document.addEventListener('DOMContentLoaded',initApp);
