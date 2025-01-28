import express from "express";
import { createUser, getAllUsers, getApplicantById, deleteUserById, updateStatusById, getNewUser, getBeneficiariesByPurpose} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/applicant", createUser);
userRouter.post("/:tokenId", getApplicantById);
userRouter.patch("/updateStatus", updateStatusById);
userRouter.get("/", getAllUsers);
userRouter.get("/getNewUsers", getNewUser);
userRouter.get("/beneficiariesByPurpose", getBeneficiariesByPurpose);
export default userRouter;
