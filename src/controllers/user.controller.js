import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from 'uuid'
import { sendEmailLink, sendEmailOTP } from '../utils/sendEmail.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { responseMessages } from "../constant/responseMessages.js";
const { MISSING_FIELDS, USER_EXISTS, UN_AUTHORIZED, SUCCESS_REGISTRATION, NO_USER, SUCCESS_LOGIN, INVALID_OTP, OTP_EXPIRED, EMAIL_VERIFY, SUCCESS_LOGOUT, MISSING_FIELD_EMAIL_PASSWORD, UNAUTHORIZED_REQUEST, GET_SUCCESS_MESSAGES, RESET_LINK_SUCCESS, PASSWORD_CHANGE, NOT_VERIFY, PASSWORD_AND_CONFIRM_NO_MATCH, MISSING_FIELD_EMAIL, RESET_OTP_SECCESS, INVALID_TOKEN, TOKEN_EXPIRED, SUCCESS_TOKEN, INVALID_DATA } = responseMessages

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById( userId );
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
}


// @desc    SIGNUP
// @route   POST /api/v1/auth/signup
// @access  Public

export const signup = asyncHandler( async (req, res) => {
    // get user from detail
    // validation-not empty
    // check if user already exist: username, email
    // create user object - create entry in db
    // remove password and refresh field token from response
    // check for user creation
    // return res

    // const avatarLocalePath = req.files?.avatar[0]?.path; if(!AvartlocalePsthz) throwApiError; avatar = await uploadOnCloudinary(avaltarLocaleFile)  if !avatar throw ApiError

    const { userName, email, password } = req.body;

    // Validate required fields
    if ([userName, email, password].some((field) => typeof field !== "string" || field.trim() === "")) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MISSING_FIELDS);
    }
    
    // Check if the user already exists
    const isUserExist = await User.findOne({ $or: [{ userName }, { email }] });
    if (isUserExist) {
        throw new ApiError(StatusCodes.CONFLICT, USER_EXISTS);
    }
    
    // Generate OTP
    const otp = uuidv4().slice(0, 6);
    const otpExpiry = Date.now() + 600000; // OTP expires in 10 minutes
    
    // Create the user
    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        otp,
        expiresIn: otpExpiry,
    });
    
    // Send OTP via email
    const emailResponse = await sendEmailOTP(email, otp);
    if (!emailResponse) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, EMAIL_ERROR);
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        
    // Retrieve the created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    console.log("ok3");
    
    if (!createdUser) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, NO_USER);
    }
    // Respond with success
    const options = {
        httpOnly: true,
        secure: true,
    }
    console.log("OK4");
        
    return res
    .status(StatusCodes.CREATED)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .send(new ApiResponse(StatusCodes.OK, 
        SUCCESS_REGISTRATION,
        {user: createdUser, accessToken, refreshToken, SUCCESS_REGISTRATION },
    ))
    
})



// @desc    RESEND-OTP
// @route   POST api/v1/user/resendOtp
// @access  Private

export const resendOtp = asyncHandler( async (req, res) => {
        const { email, _id } = req.body;

        // Validate input
        if (!email || !_id) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send(new ApiError(StatusCodes.BAD_REQUEST, UN_AUTHORIZED));
        }

        // Check if the user exists
        const isUser = await User.findOne({ email, _id });
        if (!isUser) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .send(new ApiError(StatusCodes.NOT_FOUND, NO_USER));
        }

        // Generate new OTP
        const newOtp = uuidv4().slice(0, 6);

        // Update OTP and expiration time
        isUser.otp = newOtp;
        isUser.expiresIn = Date.now() + 600000; // 10 minutes
        await isUser.save({ validateBeforeSave: false });

        // Send OTP email
        await sendEmailOTP(email, newOtp);

        // Return success response
        return res
            .status(StatusCodes.OK)
            .send(new ApiResponse(StatusCodes.OK, RESET_OTP_SECCESS));
    } 
);



// @desc    VERIFY EMAIL
// @route   POST /api/user/verifyEmail
// @access  Private

export const verifyEmail = asyncHandler(async (req, res) => {
        const { otp } = req.body;
        
        // Validate the input
        if (!otp) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send(new ApiError(StatusCodes.BAD_REQUEST, MISSING_FIELDS));
        }

        // Fetch the user
        // console.log(req);

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .send(new ApiError(StatusCodes.NOT_FOUND, USER_NOT_FOUND));
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(new ApiError(StatusCodes.FORBIDDEN, INVALID_OTP));
        }

        // Check OTP expiration
        if (user.expiresIn < Date.now()) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(new ApiError(StatusCodes.FORBIDDEN, OTP_EXPIRED));
        }

        // Mark the user as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.expiresIn = undefined;
       // Save without validation checks
        await user.save({ validateBeforeSave: false });

        // Send success response
        return res
            .status(StatusCodes.OK)
            .send(new ApiResponse(StatusCodes.OK, EMAIL_VERIFY, { email: user.email, isVerified: user.isVerified }));
    } 
);




// @desc    SIGNIN
// @route   POST /api/v1/auth/signin
// @access  Public

export const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password){
        throw new ApiError(StatusCodes.BAD_REQUEST, MISSING_FIELD_EMAIL_PASSWORD);
    }

    const user = await User.findOne({email});
    
    if(!user){
        throw new ApiError(StatusCodes.NOT_FOUND, NO_USER)
    }
    
    const isPaswordValid = await user.isPasswordCorrect(password);
    
    if(!isPaswordValid){
        throw new ApiError(StatusCodes.UNAUTHORIZED, UN_AUTHORIZED);
    }

    

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    console.log("ok");

    const loggedInusers = await  User.findById(user._id).select("-password, -refreshToken");
    console.log(loggedInusers);
    
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .send(new ApiResponse(StatusCodes.OK, 
        SUCCESS_LOGIN,
        {user: loggedInusers, accessToken, SUCCESS_LOGIN },
    ))
})



// @desc    LOGOUT
// @route   POST api/v1/auth/logout
// @access  Public

export const logout = asyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined } 
    }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    }

    res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshTokn", options)
    .send(new ApiResponse(StatusCodes.OK,  SUCCESS_LOGOUT, {}));
})


// @desc    FORGOT-PASSWORD-EMAIL
// @route   POST api/v1/auth/forgotPasswordEmail
// @access  Public

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).send(new ApiError(StatusCodes.BAD_REQUEST, MISSING_FIELD_EMAIL));
    }

    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send(new ApiError(StatusCodes.NOT_FOUND, NO_USER_FOUND));
    }
    
    if (!user.isVerified) {
        return res.status(StatusCodes.NOT_FOUND).send(new ApiError(StatusCodes.NOT_FOUND, NOT_VERIFY));
    }
    
    const isUser = await User.findById(user._id);  // true if both ObjectIds are equal
        console.log(isUser);
        
    if (!isUser) {
        return res.status(StatusCodes.UNAUTHORIZED).send(new ApiError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED));
    }
    
    const link = `${process.env.CLIENT_URL}/change-password/${isUser.refreshToken}`;
    const sendLink = await sendEmailLink(email, link);
    console.log(`Email sent: ${sendLink}`);
    return res.status(StatusCodes.OK).send(new ApiResponse(StatusCodes.OK, RESET_LINK_SUCCESS));
});




// @desc    CHANGE-CURRENT-PASSWORD
// @route   PUT api/v1/user/resetPasswordEmail
// @access  Private

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { token } = req.params
    const refreshToken = token;

     const user = await User.findOne({ refreshToken: refreshToken });
    console.log(user);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(StatusCodes.BAD_REQUEST, INVALID_DATA);
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(StatusCodes.OK).send(new ApiResponse(StatusCodes.OK, PASSWORD_CHANGE, {}));
});




export const refreshAccessToken =  asyncHandler(async (req, res) => {
    const getRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!getRefreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_REQUEST);
    }

    try {
        const decodedToken = jwt.verify(getRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log(decodedToken);
        
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(StatusCodes.UNAUTHORIZED, INVALID_TOKEN);
        }
    
        if (getRefreshToken !== user?.refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, TOKEN_EXPIRED);
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, newRefreshToken }  = await generateAccessAndRefreshToken(user._id);
        
        return res
        .status(StatusCodes.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .send(new ApiResponse(StatusCodes.OK, 
            { accessToken, newRefreshToken, SUCCESS_TOKEN },
        ))
    } catch (error) {
        throw new ApiError(StatusCodes.UNAUTHORIZED,  error.message)
    }

})


export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(StatusCodes.OK).send(new ApiResponse(StatusCodes.OK, GET_SUCCESS_MESSAGES, req.user));
})


// export const updateUserAvatar = asyncHandler(async (req, res) => {
//     const avatarLcalePth = req.file?.path;
//     if(!avatarLcalePth){
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar is missing")
//     }

//     const avatar = await uploadOnCloddibary(avatarLcalePth);
//     if(!avatar){
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Errir uplading while uploading")
//     }

//     await User.findByIdAndUpdate(req.user._id, 
//         {
//             $set: {
//                 avatr: avatar.url;
//             }
//         },
//         {new: true},
//     ).select("-password")
//     return 
// })