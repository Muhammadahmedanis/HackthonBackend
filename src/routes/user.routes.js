import express from "express";
import { createUser, getAllUsers, getUserById, deleteUserById, updateUserById, visitUser} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/applicant", createUser);
userRouter.get("/users", getAllUsers);
userRouter.get("/users/:id", getUserById);
userRouter.put("/users/:id", updateUserById);
userRouter.delete("/users/:id", deleteUserById);
userRouter.post("/get-visit-details", visitUser);
export default userRouter;



// userRouter.route("/signup").post( upload.fields([ {name: "avatar", maxContent: 1}, {name: "coverImage", maxConetnt: 1} ]) signup);
// import { verifyJwt } from "../middlewares/auth.middleware.js";
// import { changeCurrentPassword, forgotPassword, logout, refreshAccessToken, resendOtp, signin, signup, verifyEmail } from "../controllers/user.controller.js";
// import { Router } from "express";

// const userRouter = Router();
// userRouter.route("/registration").post(signup);
// userRouter.route("/signin").post(signin);
// userRouter.route("/logout").post(verifyJwt, logout);
// userRouter.route("/verify-email").post(verifyJwt, verifyEmail)
// userRouter.route("/resend-otp").post(resendOtp);
// userRouter.route("/forgot-password").post(forgotPassword);
// userRouter.route("/change-password/:token").post(changeCurrentPassword)
// userRouter.route("/refresh-token").post(refreshAccessToken);
// export default userRouter;