import nodemailer from "nodemailer";

import dotenv from "dotenv";

dotenv.config();

//Mail transpoter
const transport=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"nithishkumarmurugesan2001@gmail.com",
        pass:process.env.MAIL_PASSWORD
    },
});

//Mail content
const mailOption={
    from:"nithishkumarmurugesan2001@gmail.com",
    to:[],
    subject:"Appointment date For Your Vehicle",
    text:"Today is your vehicle Appointment date. So provide your vehicle to the service center. Important note I have used node-schedule package to schedule task on specific date but it work in local but not work in render.com",
}

export {transport,mailOption}