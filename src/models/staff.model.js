import mongoose from "mongoose";
const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    designation: {
        type: String,
        required: true,
    },
    userId: {
        type: Number,
    }
}, {timestamps: true})

staffSchema.pre("save", function (next) {
    if(!this.userId){
        this.userId = Math.floor(Math.random() * 900000) + 100000;
    }
    next();
})

export const Staff = mongoose.model("Staff", staffSchema)