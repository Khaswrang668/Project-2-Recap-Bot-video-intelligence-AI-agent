import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { initChatBox,responseMessage} from "../controllers/chat.controller.js";

const router = Router();

router.route('/:videoId/intialize-chat').post(verifyJWT,initChatBox)
router.route('/:chatId/get-response-message').post(verifyJWT,responseMessage);

export default router;