import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req,file,cb){
       cb(null,'./uploads/temp')
    },
    filename: function(req,file,cb){
       cb(null,file.originalName) //Change filenaming logic for ffmpeg file pathS
    }
})

export const upload = multer({storage: storage})