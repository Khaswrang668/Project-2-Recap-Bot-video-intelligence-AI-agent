import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,'./uploads/inputs')
    },
    filename: function(req,file,cb){
      const suffix = req.params.videoId;
      cb(null,file.fieldname+'-'+suffix) //Change filenaming logic for ffmpeg file paths
    }
})

export const upload = multer({storage: storage})