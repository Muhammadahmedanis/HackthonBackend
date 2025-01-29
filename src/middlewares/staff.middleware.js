import { Staff } from "../models/staff.model.js";

export const staffMiddleware = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Payload is missing." });
    }

    const { userId, designation } = req.body;

    if (!userId || !designation) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const findUser = await Staff.findOne({ userId });

    if (!findUser) {
      return res.status(400).json({ success: false, message: "Invalid userId." });
    }

    if (findUser.designation !== designation) {
      return res.status(403).json({ success: false, message: "You don't have permission to access this resource." });
    }

    return next();
  } catch (error) {
    console.error("Error in staffMiddleware:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
