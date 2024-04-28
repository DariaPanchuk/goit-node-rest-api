import gravatar from "gravatar";
import path from "path";
import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import Jimp from "jimp";
import dotenv from "dotenv";

import catchAsync from "../helpers/catchAsync.js";
import HttpError from "../helpers/HttpError.js";
import {
    register,
    checkEmail,
    generateHash,
    checkPassword,
    saveToken,
    deleteToken,
    addAvatar,
    checkVerification,
    updateVerify,
} from "../services/usersServices.js";
import { loginToken } from "../services/jwtServices.js";
import sendEmail from "../services/emailServices.js";

dotenv.config();
const { BASE_URL } = process.env;

const avatarsDir = path.join("public", "avatars");

export const registerUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await checkEmail(email);

    if (user) {
        throw HttpError(409, "Email in use.");
    }

    const hashPassword = await generateHash(password);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid(25); 

    const result = await register({
        ...req.body,
        password: hashPassword,
        avatarURL,
        verificationToken,
    });

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email!</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        user: {
        email: result.email,
        subscription: result.subscription,
        },
    });
});

export const loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await checkEmail(email);
    const passwordCompare = await checkPassword(email, password);

    if (!user || !passwordCompare) {
        throw HttpError(401, "Unauthorized!");
    }

    if (!user.verify) {
        throw HttpError(404, "Email is not verify.");
    }

    const token = loginToken(user._id);
    await saveToken(user._id, token);

    res.status(200).json({
        token,
        user: {
            email: user.email,
            subscription: user.subscription,
        },
    });
});

export const logoutUser = catchAsync(async (req, res) => {
    const { _id } = req.user;

    await deleteToken(_id);

    res.status(204).json();
});

export const getCurrent = catchAsync(async (req, res) => {
    const { email, subscription } = req.user;

    res.status(200).json({
        email,
        subscription,
    });
});


export const updateAvatar = catchAsync(async (req, res) => {
    const { _id } = req.user;
    const { path: temUpload, originalname, size } = req.file;

    if (size > (2 * 1024 * 1024)) {
        throw HttpError(400, "File is too large.");
    }

    const avatar = await Jimp.read(temUpload);
    await avatar.resize(250, 250).quality(50);

    const nanoidId = nanoid(20);
    const fileName = `${_id}_${nanoidId}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);
    await fs.rename(temUpload, resultUpload);

    const avatarURL = `/avatars/${fileName}`;
    await addAvatar(_id, avatarURL);

    res.status(200).json({
        avatarURL,
    });
});

export const verifyUser = catchAsync(async (req, res) => {
    const { verificationToken } = req.params;
    const user = await checkVerification(verificationToken);

    if (!user) {
        throw HttpError(404, "User not found.");
    }

    await updateVerify(user._id, {
        verify: true,
        verificationToken: null,
    });

    res.status(200).json({
        message: "Verification successful.",
    });
});

export const reverifyUser = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await checkEmail(email);

    if (!user) {
        throw HttpError(401, "Email not found.");
    }

    if (user.verify) {
        throw HttpError(400, "Verification has already been passed.");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify email!</a>`,
    };

    await sendEmail(verifyEmail);
    res.status(200).json({
        message: "Verification email sent.",
    });
});