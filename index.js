import Express from "express";
import dbconnection from "./DB/dbConnection.js";

import users from "./Routing/users.js";
import feedBack from "./Routing/feedBack.js";
import serviceDetails from "./Routing/serviceDetails.js";
import homePage from "./Routing/homepage.js";
import Jwt from "jsonwebtoken";

import cors from "cors"
import dotenv from "dotenv";

const server=Express();

dotenv.config();

server.use(Express.json());

server.use(cors());

const homeMiddleWare=(req,res,next)=>{
    try{
        //console.log(req.headers['token'])
        Jwt.verify(req.headers['token'],process.env.JWT_SECREAT_KEY,async(err,result)=>{
            if(err){
                console.log(err);
                res.send({message:"unAuthorized"})
            }else{
                next();
            }
        })
    }catch(e){
        res.status(500).send({message:"Internal Server Error"})
    }
}

const port=5000

await dbconnection();

server.use("/Users",users);
server.use("/FeedBack",feedBack);
server.use("/ServiceDetails",serviceDetails);
server.use('/HomePage',homeMiddleWare,homePage);

server.listen(port,()=>{
    console.log("Server listening in the port: "+port)
})