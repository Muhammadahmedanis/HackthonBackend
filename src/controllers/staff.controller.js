import { Staff } from "../models/staff.model.js";


// created staff
export const createStaff = async (req, res) => {
    try {
        const {name, email, designation } = req.body
        if([name, email, designation].some( (field) => typeof field !== "string" || field.trim() === "")){
            return res.status(400).send({success: false, message: "All fields are required"});
        }

        const isUserExist = await Staff.findOne({ $or: [{name}, {email}] });
        
        if(isUserExist){
            return res.status(400).send({success: false, message: "Name or Email already exist!"});
        } 

        const created = new Staff({ name, email, designation});
        console.log(created);
        await created.save();
        return res.status(201).send({success: true, message: `${designation} created successful`});
    } catch (error) {
        return res.status(500).json({success: 500, message: "Internal sever error"});
    }
}


//get staff by designation
export const getStaffByDesignation = async ( _, res) => {
    try {
        return res.status(200).json({success: true, message: "permission granted successful", access: true});

    } catch (error) {
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


// get All staff
export const getAllStaff = async (req, res) => {
    try {
        const getStaff = await Staff.find();
        return res.status(200).json({success: true, getStaff});
    } catch (error) {
        return res.status(500).send({success: false, message: "Internal server error"});
    }

}


// update staff designation
export const updateStaffDesignation = async (req, res) => {
    try {
        const {name, designation, email} = req.body;
        if(!name || !designation || !email){
            return res.status(400).send({success: false, message: "All fields are required"});
        }

        const isStaffExist = await Staff.findOne({userId});
        if(!isStaffExist){
            return req.status(400).send({success: false, message: "Staff not found"});
        }




    } catch (error) {
        res.status(500).send({success: false, message: "Internal server error"});
    }
}