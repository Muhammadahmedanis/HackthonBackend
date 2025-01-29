import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import mongoSanitize from "express-mongo-sanitize";
import userRouter from "./routes/user.routes.js";
import staffRouter from "./routes/staff.routes.js";

const app = express();
app.use(express.json({ limit: "16kb" }));

// Middleware Configurations
app.use(cors({
  origin: [process.env.ALLOWED_ORIGIN_1, process.env.ALLOWED_ORIGIN_2], // Array of allowed origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to My Page")
})
app.use("/api/v1/user", userRouter);
app.use("/api/v1/staff", staffRouter);

// Handle Undefined Routes
app.all("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export { app };
