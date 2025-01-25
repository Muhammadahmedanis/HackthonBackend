import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import mongoSanitize from "express-mongo-sanitize";
import userRouter from "./routes/user.routes.js";

const app = express();

// Middleware Configurations
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());

// Routes
app.use("/api/v1/user", userRouter);

// Handle Undefined Routes
app.all("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export { app };
