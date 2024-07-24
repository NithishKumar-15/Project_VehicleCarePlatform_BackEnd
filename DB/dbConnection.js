import {MongoClient} from "mongodb"
import dotenv from "dotenv"

dotenv.config();

const Db_Name=process.env.DB_NAME;
const Db_Cluster=process.env.DB_WHOLECLUSTER;

const url=Db_Cluster;

const client=new MongoClient(url);

const db=client.db(Db_Name);

const dbconnection=async()=>{
    try{
        await client.connect();
        console.log('Connection Successfull');
    }catch(e){
        console.log("Connection Failed");
        process.exit(1);
    }
}

export{db,client};
export default dbconnection;
