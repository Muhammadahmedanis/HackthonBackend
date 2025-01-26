import { User } from "../models/user.model.js"; // Adjust path as per your project structure

// // Create a new user
export const createUser = async (req, res) => {
    try {
        const { userName, phoneNumber, Cnic, address, visit, userId } = req.body;
        const user = new User({
            userName,
            phoneNumber,
            Cnic,
            address,
            visit,
            userId,
        });
        console.log("ok");
        
        await user.save();
        res.status(201).json({ success: true, message: "User created successfully", user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const visitUser = async (req, res) => {
    const { userId } = req.body;
    
    try {
        const user = await User.find({userId});
        
        if(!user){
            return res.status(400).send({success: false, message: error.message});
        }
        return res.status(200).send({success: true, user})
    } catch (error) {
        return res.status(500).send({success: false, message: error.message});
    }
}

// Get a user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a user by ID
export const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a user by ID
export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};