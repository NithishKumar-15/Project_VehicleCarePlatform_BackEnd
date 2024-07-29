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
        const servicePrice=req.body.service.split('/');
        const data={
            ...req.body,
            service:servicePrice[0],
            serviceAmount:servicePrice[1],
            work:"workstarted"
        }

        const date=req.body.appoinmentDate.split("/");

        const email=await useCollection.findOne({name:req.body.customerName},{projection:{_id:0,email:1}})
        console.log(email);
         
        console.log(date);
       
        const job=schedule.scheduleJob(`0 25 20 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
            console.log("Job")
            await useCollection.updateOne({name:req.body.customerName},{$set:{Appointment:data}})
            
            transport.sendMail({
                ...mailOption,
                to:email.email
            })

            const job1=schedule.scheduleJob(`0 27 20 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                console.log("job1");
                await useCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workonprocess"}})

                const job2=schedule.scheduleJob(`0 29 20 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                    console.log("job2");
                    await useCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"fiftypercentofworkcompleted"}})

                    const job3=schedule.scheduleJob(`0 32 20 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                        console.log("job3");
                        await useCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workgoingtocomplete"}})
                        
                        const job4=schedule.scheduleJob(`0 34 20 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                            console.log("job4");
                            await useCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workcompleted"}})
                        })
                    })
                })
            })
            
        })

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