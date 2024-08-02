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

//MiddleWare for cros orgin
server.use(cors());

//Middle ware for home page when ever the api hit from the home page this middleware verify the token and send to the regarding api
const homeMiddleWare=(req,res,next)=>{
    try{
        Jwt.verify(req.headers['token'],process.env.JWT_SECREAT_KEY,async(err,result)=>{
            if(err){
                res.send({message:"unAuthorized"})
            }else{
                next();
            }
        })
    }catch(e){
        res.status(500).send({message:"Internal Server Error"})
    }
}

//Port Number
const port=5000

await dbconnection();

//Routers
server.use("/Users",users);
server.use("/FeedBack",feedBack);
server.use("/ServiceDetails",serviceDetails);
server.use('/HomePage',homeMiddleWare,homePage);

server.listen(port,()=>{
    console.log("Server listening in the port: "+port)
})