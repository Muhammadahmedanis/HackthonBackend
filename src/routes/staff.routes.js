import express from "express";
import { createStaff, getAllStaff, getStaffByDesignation } from "../controllers/staff.controller.js";
import { staffMiddleware } from "../middlewares/staff.middleware.js";

const staffRouter = express.Router();

staffRouter.post("/", createStaff);
staffRouter.post("/designation", staffMiddleware, getStaffByDesignation);
staffRouter.get("/get", getAllStaff);

export default staffRouter;