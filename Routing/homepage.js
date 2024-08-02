import Express from "express";
import { db } from "../DB/dbConnection.js";
import schedule from "node-schedule"
import { transport,mailOption } from "../MailUtils/mail.js";
import Stripe from "stripe";

const homePage=Express.Router();

const stripe=new Stripe(process.env.STRIP_SECREATKEY);

//User db collection
const userCollection=db.collection(process.env.DB_USERCOLLECTION);

//API a to book and AppointmentBook
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

        const email=await userCollection.findOne({name:req.body.customerName},{projection:{_id:0,email:1}})
    
        const job=schedule.scheduleJob(`0 17 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
            console.log('Your email')
            await userCollection.updateOne({name:req.body.customerName},{$set:{Appointment:data}})
            
            transport.sendMail({
                ...mailOption,
                to:email.email
            })

            const job1=schedule.scheduleJob(`0 19 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                
                await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workonprocess"}})

                const job2=schedule.scheduleJob(`0 21 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                    
                    await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"fiftypercentofworkcompleted"}})

                    const job3=schedule.scheduleJob(`0 24 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                        
                        await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workgoingtocomplete"}})
                        
                        const job4=schedule.scheduleJob(`0 25 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{
                            
                            await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workcompleted"}})
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

//API to get the user AppointmentBook
homePage.post("/GetUserAppointment",async(req,res)=>{
    try{
        const appoinment= await userCollection.find({name:req.body.user},{projection:{_id:0,Appointment:1}}).toArray();
        res.send(appoinment);
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

// API for stripe payment gateway 
homePage.post("/payment",async(req,res)=>{

    try{
        const session=await stripe.checkout.sessions.create({
            line_items:[
                {
                    price_data:{
                        currency:"usd",
                        product_data:{
                            name:req.body.service,
                            description:"Payment for your vehicle service"
                        },
                        unit_amount:Number(req.body.payment),
                    },
                    quantity:1
                }
            ],
            mode:'payment',
            success_url:"http://localhost:5173/PaymentSuccess",
            cancel_url:"http://localhost:5173/PaymentCancel"
        })
       
        res.send({message:"Payment success",session});

    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

export default homePage;