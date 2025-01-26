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
