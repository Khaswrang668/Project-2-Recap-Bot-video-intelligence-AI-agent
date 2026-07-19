import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { userLogin,registerUser,userLogout } from "../controllers/user.controller.js";

const router = Router();

router.route('/user-login').post(userLogin);
router.route('/user-register').post(registerUser);
router.route('/user-logout').post(userLogout);

export default router;
