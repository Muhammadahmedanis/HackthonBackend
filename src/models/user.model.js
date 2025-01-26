import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        Cnic: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: "",
        },
        visit: {
            type: String,
        },
        userId: {
            type: String,
            unique: true,
        },
        status: {
            type: String, 
            enum: ["pending", "completed"], 
            default: "pending",
        },
        
    },
    { timestamps: true }
);

// Pre-save middleware to generate a unique userId if not provided
userSchema.pre("save", function (next) {
    if (!this.userId) {
        this.userId = this._id.toString(); // Use MongoDB's _id as the userId
    }
    next();
});

export const User = mongoose.model("User", userSchema);