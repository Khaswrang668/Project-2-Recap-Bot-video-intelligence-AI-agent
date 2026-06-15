import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudioFile = async (videoPath,audioPath) => {
    await new Promise((resolve,reject)=>{
        ffmpeg(videoPath)
        .output(audioPath)
        .noVideo() 
        .on('end', () => {
            resolve();
            console.log('Audio extraction finished successfully!');
        })
        .on('error', (err) => {
            reject(err);
            console.error('An error occurred: ' + err.message);
        })
        .run();
    });
};

