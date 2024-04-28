import express from "express";

import validateBody from "../middlewares/validateBody.js";
import {
    registerUserSchema,
    loginUserSchema,
} from "../schemas/usersSchemas.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrent,
    updateAvatar,
} from "../controllers/usersControllers.js";
import authenticate from "../middlewares/authMiddlewares.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerUserSchema), registerUser);

authRouter.post("/login", validateBody(loginUserSchema), loginUser);

authRouter.post("/logout", authenticate, logoutUser);

authRouter.get("/current", authenticate, getCurrent);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);

export default authRouter;
