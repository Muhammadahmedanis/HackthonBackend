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
        cnic: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: "",
        },
        purpose: {
            type: [String],  // Store multiple purposes in an array
            default: [],
        },
        tokenId: {
            type: String,
            unique: true,
        },
        visit:{
            type: Date,
            default: Date.now,
        },
        lastVisit: {
            type: [Date],
            default: function () {
              return [new Date()]; // Initialize with the current date
            },
        },
        status: {
            type: [String], 
            enum: ["Pending", "Completed", "Rejected"], 
            default: "Pending",
        },
        
    },
    { timestamps: true }
);

// Pre-save middleware to generate a unique tokenId if not provided
userSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        return next()
    }else{
        this.tokenId = Math.floor(Math.random() * 900000) + 10000000 // Use MongoDB's ObjectId to generate a unique tokenId
        next();
    }
});

export const User = mongoose.model("User", userSchema);