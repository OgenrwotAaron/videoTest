ffmpeg -y -i src/sample.mp4 -ac 2 -ab 256k -ar 48000 -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 1500k -maxrate 1500k -bufsize 1000k -vf "scale=-1:720" src/sample720.webm
ffmpeg -y -i src/sample.mp4 -ac 2 -ab 128k -ar 44100 -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 800k -maxrate 800k -bufsize 500k -vf "scale=-1:540" src/sample540.webm
#ffmpeg -y -i src/sample.mp4 -ac 2 -ab 64k -ar 22050 -c:v libx264 -x264opts 'keyint=24:min-keyint=24:no-scenecut' -b:v 400k -maxrate 400k -bufsize 400k -vf "scale=-1:360" src/sample360.mp4
./packager \
    input=src/sample720.webm,stream=audio,output=dest/sample720_audio.webm \
    input=src/sample720.webm,stream=video,output=dest/sample720_video.webm \
    input=src/sample540.webm,stream=audio,output=dest/sample540_audio.webm \
    input=src/sample540.webm,stream=video,output=dest/sample540_video.webm \
--profile on-demand \
--mpd_output sample-manifest-full.mpd \
--min_buffer_time 3 \
--segment_duration 3

# ./packager \
#     input=src/sample720.mp4,stream=audio,output=dest/sample720_audio.mp4 \
#     input=src/sample720.mp4,stream=video,output=dest/sample720_video.mp4 \
# --profile on-demand \
# --mpd_output sample-manifest-720.mpd \
# --min_buffer_time 3 \
# --segment_duration 3

# ./packager \
#     input=src/sample540.mp4,stream=audio,output=dest/sample540_audio.mp4 \
#     input=src/sample540.mp4,stream=video,output=dest/sample540_video.mp4 \
# --profile on-demand \
# --mpd_output sample-manifest-540.mpd \
# --min_buffer_time 3 \
# --segment_duration 3

# ./packager \
#     input=src/sample540.mp4,stream=audio,output=dest/sample540_audio.mp4 \
#     input=src/sample540.mp4,stream=video,output=dest/sample540_video.mp4 \
# --profile on-demand \
# --mpd_output sample-manifest-540.mpd \
# --min_buffer_time 3 \
# --segment_duration 3
# ffmpeg -i src/sample.mp4 -vn -acodec libvorbis -ab 128k -dash 1 dest/sample_audio.webm
# ffmpeg -i src/sample.mp4 -c:v libvpx-vp9 -keyint_min 150 -g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
# -an -vf scale=160:90 -b:v 250k -dash 1 dest/video_160x90_250k.webm
# ffmpeg -i src/sample.mp4 -c:v libvpx-vp9 -keyint_min 150 -g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
# -an -vf scale=320:180 -b:v 500k -dash 1 dest/video_320x180_500k.webm
# ffmpeg -i src/sample.mp4 -c:v libvpx-vp9 -keyint_min 150 -g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
# -an -vf scale=640:360 -b:v 750k -dash 1 dest/video_640x360_750k.webm
# ffmpeg -i src/sample.mp4 -c:v libvpx-vp9 -keyint_min 150 -g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
# -an -vf scale=640:360 -b:v 1000k -dash 1 dest/video_640x360_1000k.webm
# ffmpeg -i src/sample.mp4 -c:v libvpx-vp9 -keyint_min 150 -g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
# -an -vf scale=1280:720 -b:v 1500k -dash 1 dest/video_1280x720_1500k.webm
# ffmpeg \
#     -f webm_dash_manifest -i dest/video_160x90_250k.webm \
#     -f webm_dash_manifest -i dest/video_320x180_500k.webm \
#     -f webm_dash_manifest -i dest/video_640x360_750k.webm \
#     -f webm_dash_manifest -i dest/video_1280x720_1500k.webm \
#     -f webm_dash_manifest -i dest/sample_audio.webm \
#     -c copy \
#     -map 0 -map 1 -map 2 -map 3 -map 4 \
#     -f webm_dash_manifest \
#     -adaptation_sets "id=0,streams=0,1,2,3 id=1,streams=4" \
#     sample_full_manifest.mpd