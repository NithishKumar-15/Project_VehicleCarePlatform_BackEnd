import Express from "express";
import { db } from "../DB/dbConnection.js";
import schedule from "node-schedule"
import { transport, mailOption } from "../MailUtils/mail.js";
import Stripe from "stripe";

const homePage = Express.Router();

const stripe = new Stripe(process.env.STRIP_SECREATKEY);

//User db collection
const userCollection = db.collection(process.env.DB_USERCOLLECTION);

//API a to book and AppointmentBook
homePage.post("/AppointmentBook", async (req, res) => {
    try {
        const servicePrice = req.body.service.split('/');
        const data = {
            id: Date.now().toString(),
            ...req.body,
            service: servicePrice[0],
            serviceAmount: servicePrice[1],
            work: "workcompleted"
        }

        //const email=await userCollection.findOne({email:req.body.email},{projection:{_id:0,email:1}})

        await userCollection.updateOne({ email: req.body.email }, { $push: { Appointment: data } })

        transport.sendMail({
            ...mailOption,
            to: req.body.email
        })

        //**This the code for task schedule for a prticular date this is the code I have mentioned in the readme.md file **/    
        // const date=req.body.appoinmentDate.split("/");    
        // const job=schedule.scheduleJob(`0 38 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{

        //     await userCollection.updateOne({email:req.body.email},{$push:{Appointment:data}})

        //     transport.sendMail({
        //         ...mailOption,
        //         to:req.body.email
        //     })

        //     const job1=schedule.scheduleJob(`0 40 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{

        //         //await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workonprocess"}})

        //         const updateData=await userCollection.findOne({email:req.body.email},{projection:{_id:0,Appointment:1}});
        //         const filterData=updateData.Appointment.map((val)=>{
        //             if(val.id===data.id){
        //                 return {...val,work:"workonprocess"}
        //             }else{
        //                 return val;
        //             }
        //         })
        //         await userCollection.updateOne({email:req.body.email},{$set:{Appointment:filterData}})

        //         const job2=schedule.scheduleJob(`0 42 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{

        //             //await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"fiftypercentofworkcompleted"}})
        //             const updateData1=await userCollection.findOne({email:req.body.email},{projection:{_id:0,Appointment:1}});
        //              const filterData1=updateData1.Appointment.map((val)=>{
        //                 if(val.id===data.id){
        //                 return {...val,work:"fiftypercentofworkcompleted"}
        //              }else{
        //                 return val;
        //              }
        //              })
        //             await userCollection.updateOne({email:req.body.email},{$set:{Appointment:filterData1}})

        //             const job3=schedule.scheduleJob(`0 44 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{

        //                 //await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workgoingtocomplete"}})
        //                     const updateData2=await userCollection.findOne({email:req.body.email},{projection:{_id:0,Appointment:1}});
        //                 const filterData2=updateData2.Appointment.map((val)=>{
        //                     if(val.id===data.id){
        //                     return {...val,work:"workgoingtocomplete"}
        //                 }else{
        //                     return val;
        //                 }
        //                 })
        //                 await userCollection.updateOne({email:req.body.email},{$set:{Appointment:filterData2}})

        //                 const job4=schedule.scheduleJob(`0 46 12 ${date[2]} ${date[1]} ${date[3]}`,async()=>{

        //                     //await userCollection.updateOne({name:req.body.customerName},{$set:{"Appointment.work":"workcompleted"}})
        //                         const updateData3=await userCollection.findOne({email:req.body.email},{projection:{_id:0,Appointment:1}});
        //                         const filterData3=updateData3.Appointment.map((val)=>{
        //                         if(val.id===data.id){
        //                          return {...val,work:"workcompleted"}
        //                           }else{
        //                             return val;
        //                              }
        //                             })
        //                          await userCollection.updateOne({email:req.body.email},{$set:{Appointment:filterData3}})
        //                 })
        //             })
        //         })
        //     })

        // })

        res.send({ message: "Appoiment added" });
    } catch (e) {
        res.status(500).send({ message: "Internal Server error", e });
    }
})

//API to get the user AppointmentBook
homePage.post("/GetUserAppointment", async (req, res) => {
    try {
        const appoinment = await userCollection.find({ email: req.body.email }, { projection: { _id: 0, Appointment: 1 } }).toArray();
        res.send(appoinment[0].Appointment);
    } catch (e) {
        res.status(500).send({ message: "Internal Server error", e });
    }
})

// API for stripe payment gateway 
homePage.post("/payment", async (req, res) => {

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: req.body.service,
                            description: "Payment for your vehicle service"
                        },
                        unit_amount: Number(req.body.payment),
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: "https://vevicare.netlify.app/PaymentSuccess",
            cancel_url: "https://vevicare.netlify.app/PaymentCancel"
        })

        res.send({ message: "Payment success", session });

    } catch (e) {
        res.status(500).send({ message: "Internal Server error", e });
    }
})

export default homePage;