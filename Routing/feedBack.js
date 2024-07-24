import Express from "express";
import { db } from "../DB/dbConnection.js";

const feedBack=Express.Router();


const feedBackCollection=db.collection(process.env.DB_FEEDBACKCOLLECTION);

feedBack.post("/UserFeedBack",async(req,res)=>{
    try{
        const data=req.body;
        await feedBackCollection.insertOne(data);
        res.send({message:"FeedBack inserted successfull"});
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})


feedBack.get("/GetUserFeedBack",async(req,res)=>{
    try{
        const UsersFeedBack=await feedBackCollection.find({},{projection:{_id:0}}).toArray();
        res.send(UsersFeedBack);
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

export default feedBack;