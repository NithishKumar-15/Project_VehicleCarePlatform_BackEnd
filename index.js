import Express from "express";
import dbconnection from "./DB/dbConnection.js";

import users from "./Routing/users.js";
import feedBack from "./Routing/feedBack.js";
import serviceDetails from "./Routing/serviceDetails.js";
import homePage from "./Routing/homepage.js";

import cors from "cors"
import dotenv from "dotenv";

const server=Express();

dotenv.config();

server.use(Express.json());

server.use(cors());

const port=5000

await dbconnection();

server.use("/Users",users);
server.use("/FeedBack",feedBack);
server.use("/ServiceDetails",serviceDetails);
server.use('/HomePage',homePage);

server.listen(port,()=>{
    console.log("Server listening in the port: "+port)
})