import Express from "express";
import { db } from "../DB/dbConnection.js";
import schedule from "node-schedule"
import { transport,mailOption } from "../MailUtils/mail.js";

const homePage=Express.Router();

const useCollection=db.collection(process.env.DB_USERCOLLECTION);

function getWeekNumber(date) {
    // Copy date so don't modify the original
    const currentDate = new Date(date.getTime());
    
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));
    
    // Get first day of the year
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    
    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil((((currentDate - yearStart) / 86400000) + 1) / 7);
    
    return weekNumber;
}

homePage.post("/AppointmentBook",async(req,res)=>{
    try{
        const data={
            ...req.body
        }

        await useCollection.updateOne({name:req.body.customerName},{$push:{Appointment:data}});
        const date=req.body.appoinmentDate.split("/");

        const email=await useCollection.findOne({name:req.body.customerName},{projection:{_id:0,email:1}})
        console.log(email);
         
        console.log(date);
       
    const dateToSendMail=new Date(2024,7,28,19,30,0);

        // const job=schedule.scheduleJob(`0 13 19 ${date[2]} 7 7`,()=>{
        //     console.log("Mail")
        //     transport.sendMail({
        //         ...mailOption,
        //         to:email.email
        //     })
        // })

        const job=schedule.scheduleJob(`0 38 19 ${date[2]} ${date[1]} ${date[3]}`,()=>{
            console.log("Mail")
            transport.sendMail({
                ...mailOption,
                to:email.email
            })
        })

        // const job=schedule.scheduleJob(dateToSendMail,()=>{
        //     console.log("Mail")
        //     transport.sendMail({
        //         ...mailOption,
        //         to:email.email
        //     })
        // })

        res.send({message:"Appoiment added"});
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})


homePage.post("/GetUserAppointment",async(req,res)=>{
    try{
        const appoinment= await useCollection.find({name:req.body.user},{projection:{_id:0,Appointment:1}}).toArray();
        res.send(appoinment);
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

export default homePage;