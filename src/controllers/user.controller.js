import { User } from "../models/user.model.js";

// /Create a new Benefcirie 
export const createUser = async (req, res) => {
    try {
        const { userName, phoneNumber, cnic, address, purpose} = req.body;
        if([userName, phoneNumber, cnic, address, purpose].some( (field) => typeof field !== "string" || field.trim() === "")){
            return res.status(400).json({success: false, message: "All fields are required"});
        }
        
        const isUserExist = await User.findOne({ $or: [{userName}, {phoneNumber}, {cnic}] });
        if(isUserExist){
            isUserExist.visit = new Date();
            isUserExist.lastVisit.push(new Date());
            isUserExist.purpose.push(purpose);
            isUserExist.status.push("pending");
            await isUserExist.save();
            return res.status(200).send({success: true, message: "User already exists, detailss updated successful", isUserExist });
        } else{
            const user = new User({
                userName,
                phoneNumber,
                cnic,
                address,
                purpose: [purpose],  // Store the first purpose in the purposes array
            });
            console.log(user);
            const userCredted =  await user.save();
            console.log(userCredted);
            
            res.status(201).json({ success: true, message: "Application submitted successfully", userCredted });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Update Benefciries status 
export const updateStatusById = async (req, res) => {
    const {tokenId, status} = req.body;
    try {
        const user = await User.findOneAndUpdate({ tokenId}, 
            { $set: { status } }, 
            {new: true}
        );

        if(!user){
            return res.status(400).send({success: false, message: error.message});
        }
        await user.save({validateBeforeSave: false});
        return res.status(200).send({success: true, message: "Applicant's query resolution successful"});

    } catch (error) {
        return res.status(500).send({success: false, message: error.message});
    }
}



// Get a  Benefcirie by ID
export const getApplicantById = async (req, res) => {
    try {
        const {tokenId} = req.params;
        
        let user = await User.findOne({tokenId});
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if(user.status == "completed"){
            return res.status(400).json({ success: false, message: "Your application is submitted plz wait for approval" });
        }
        const sortedVisits = user.lastVisit.sort((a, b) => new Date(b) - new Date(a));
        const sortedLIFO = user.purpose.reverse();
        user = {...user, sortedVisits, sortedLIFO}
        return res.status(200).json({ success: true,  message: "Get user details successful", user: user._doc});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const users = await User.find({ visit: { $gte: last24Hours} });
        if(!users){
            return res.status(400).send({success: false, message: 'No user found'});
        }
        
        return res.status(200).json({ success: true, users });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



// Get new Benefciries
export const getNewUser = async (req, res) => {
    try {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        // visit: {$gte: last24Hours},

        const usersFirstVisits = await User.find({ 
            $expr:{ $lt: [{ $size: "$lastVisit" },2]}, 
        });

        const usersWithMultipleVisits = await User.find({
            $expr: { $gte: [{ $size: "$lastVisit" }, 2] },
        });

        if (usersFirstVisits.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const visitUsersData = {
            usersFirstVisits, usersWithMultipleVisits
        }

        res.status(200).json({ success: true, message: "User updated successfully", visitUsersData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};




//Get Beneficieries By Porpose
export const getBeneficiariesByPurpose = async (req, res) => {
    try {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const groupedByPurpose = await User.aggregate([
            // { $match: { visit: { $gte: last24Hours } } },
      
            { $unwind: "$purpose" },

            { $unwind: "$status" },
                
            {
                $group: {
                _id: "$purpose", // Group by the purpose field
                count: { $sum: 1 }, // Count the number of beneficiaries for each purpose
                completedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }, // Count completed statuses
                },
                rejectedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }, // Count rejected statuses
                },
                },
            },

            {
                $project: {
                  _id: 0, // Remove the _id field
                  purpose: "$_id", // Rename _id to purpose
                  count: 1, // Keep the count field
                  completedCount: 1, // Include completed count
                  rejectedCount: 1, // Include rejected count
                },
            },
          ]);
      
        const totalCount = await User.countDocuments({ visit: { $gte: last24Hours } });
  
        return res.status(200).json({
            success: true,
            message: "Beneficiaries grouped by purpose",
            data: {
            groupedByPurpose,
            totalCount,
            },
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
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