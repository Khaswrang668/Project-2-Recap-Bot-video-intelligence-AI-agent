import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudioFile = (videoPath,audioPath)=>{
    ffmpeg(videoPath)
        .output(audioPath)
        .noVideo() 
        .on('end', () => {
            console.log('Audio extraction finished successfully!');
        })
        .on('error', (err) => {
            console.error('An error occurred: ' + err.message);
        })
        .run();
}