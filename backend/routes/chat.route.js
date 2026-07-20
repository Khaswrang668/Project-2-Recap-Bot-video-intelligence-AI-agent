import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { initChatBox,responseMessage,getChatHistory,viewChat} from "../controllers/chat.controller.js";

const router = Router();

router.route('/:videoId/intialize-chat').post(verifyJWT,initChatBox)
router.route('/:chatId/get-response-message').post(verifyJWT,responseMessage);
router.route('/get-chat-history').get(verifyJWT,getChatHistory);
router.route('/:boxId/view-chat').get(verifyJWT,viewChat);

export default router;