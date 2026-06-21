import { verifyJWT } from '../middlewares/auth.middleware.js'
import { processVideo,generateAndSendID } from '../controllers/video.controller.js'
import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/get-video-id').get(verifyJWT,generateAndSendID);
router.route('/:videoId/process-video').post(verifyJWT,upload.single('uploaded_file'),processVideo);//the client is verified to be user by verifyJWT so there is no problem adding userID as file naming convention

export default router;