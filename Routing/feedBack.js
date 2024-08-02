import Express from "express";
import { db } from "../DB/dbConnection.js";

const feedBack=Express.Router();

//feedback db collection
const feedBackCollection=db.collection(process.env.DB_FEEDBACKCOLLECTION);

//API to add the user feedback
feedBack.post("/UserFeedBack",async(req,res)=>{
    try{
        const data=req.body;
        await feedBackCollection.insertOne(data);
        res.send({message:"FeedBack inserted successfull"});
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

//API to get the user feedback
feedBack.get("/GetUserFeedBack",async(req,res)=>{
    try{
        const UsersFeedBack=await feedBackCollection.find({},{projection:{_id:0}}).toArray();
        res.send(UsersFeedBack);
    }catch(e){
        res.status(500).send({message:"Internal Server error",e});
    }
})

export default feedBack;