import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { userLogin,registerUser,userLogout,refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route('/user-login').post(userLogin);
router.route('/user-register').post(registerUser);
router.route('/user-logout').post(verifyJWT,userLogout);
router.route('/refresh-access-token').post(verifyJWT,refreshAccessToken);

export default router;
