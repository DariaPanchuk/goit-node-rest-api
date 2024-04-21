import { model, Schema } from 'mongoose';

import handleMongooseError from "../helpers/handleMongooseError.js";
import required from 'joi';

const userSchema = new Schema(
    {
        password: {
            type: String,
            required: [true, "Set password for user"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
        },
        subscription: {
            type: String,
            enum: ["starter", "pro", "business"],
            default: "starter",
        },
        token: {
            type: String,
            default: "",
        },
        avatarURL: {
            type: String,
            required: [true, "Avatar is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.post("save", handleMongooseError);

export const User = model("user", userSchema);