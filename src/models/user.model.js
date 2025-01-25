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





// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";


// Method for bcrypt password
// userSchema.pre("save", async function (next) {
//     if(!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10)
//     next();
// })


// //Method for compare password
// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }


// //Method for GenerateToken
// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//             email: this.email,
//             userName: this.userName,
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     );
// }


// //Method for AccessToken
// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     );
// }
