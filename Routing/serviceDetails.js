import Express from "express";
import { db } from "../DB/dbConnection.js";

const serviceDetails = Express.Router();

//Types of service db collection
const serviceDetailsCollection = db.collection(process.env.DB_TYPESOFSERVICES);

//API to get the type of service available
serviceDetails.get("/AllServiceDetails", async (req, res) => {
    try {
        const serviceDetailsData = await serviceDetailsCollection.find({}, { projection: { _id: 0 } }).toArray();
        res.send(serviceDetailsData)
    } catch (e) {
        res.status(500).send({ message: "Internal Server error", e });
    }
})

export default serviceDetails;

