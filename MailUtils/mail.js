import nodemailer from "nodemailer";

import dotenv from "dotenv";

dotenv.config();

const transport=nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    auth:{
        user:"nithishkumarmurugesan2001@gmail.com",
        pass:process.env.MAIL_PASSWORD
    },
});

const mailOption={
    from:"nithishkumarmurugesan2001@gmail.com",
    to:[],
    subject:"Appointment date For Your Vehicle",
    text:"Today is your vehicle Appointment date. So provide your vehicle to the service center",
}

export {transport,mailOption}