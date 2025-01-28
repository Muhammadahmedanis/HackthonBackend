import express from "express";
import { createStaff, getAllStaff, getStaffByDesignation } from "../controllers/staff.controller.js";

const staffRouter = express.Router();

staffRouter.post("/", createStaff);
staffRouter.post("/designation", getStaffByDesignation);
staffRouter.get("/get", getAllStaff);

export default staffRouter;