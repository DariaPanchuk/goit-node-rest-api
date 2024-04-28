import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { META_MAIL, META_PASS, META_PORT } = process.env;

const nodemailerConfig = {
    host: "smtp.meta.ua",
    port: META_PORT,
    secure: true,
    auth: {
        user: META_MAIL,
        pass: META_PASS,
    },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
    const email = { ...data, from: META_MAIL };
    await transport.sendMail(email);
    return true;
}

export default sendEmail;