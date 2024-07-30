import Express from "express";
import { db } from "../DB/dbConnection.js";
import schedule from "node-schedule"
import { transport,mailOption } from "../MailUtils/mail.js";
import Stripe from "stripe";

const homePage=Express.Router();

const stripe=new Stripe(process.env.STRIP_SECREATKEY);

const useCollection=db.collection(process.env.DB_USERCOLLECTION);


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


homePage.post("/payment",async(req,res)=>{

    try{
        const payment=req.body.payment;
        const successUrl=req.body.user;
        console.log(successUrl)
        const session=await stripe.checkout.sessions.create({
            line_items:[
                {
                    price_data:{
                        currency:"usd",
                        product_data:{
                            name:req.body.service,
                            description:"Payment for your vehicle service"
                        },
                        unit_amount:Number(req.body.payment)/60,
                    },
                    quantity:1
                }
            ],
            mode:'payment',
            success_url:'http://localhost:5173/PaymentSuccess/',
            cancel_url:"http://localhost:5173/PaymentCancel"
        })
       
        res.send(session);

    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

export default homePage;