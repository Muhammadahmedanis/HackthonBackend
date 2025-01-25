// userRouter.route("/signup").post( upload.fields([ {name: "avatar", maxContent: 1}, {name: "coverImage", maxConetnt: 1} ]) signup);
import { Router } from "express";
import { changeCurrentPassword, forgotPassword, logout, refreshAccessToken, resendOtp, signin, signup, verifyEmail } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.route("/signup").post(signup);
userRouter.route("/signin").post(signin);
userRouter.route("/logout").post(verifyJwt, logout);
userRouter.route("/verify-email").post(verifyJwt, verifyEmail)
userRouter.route("/resend-otp").post(resendOtp);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/change-password/:token").post(changeCurrentPassword)
userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;