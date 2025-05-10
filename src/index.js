import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
const port = process.env.PORT || 8800;
const app = express();

job.start();
app.use(express.json()); //to parse Json data 
app.use(cors());

//Test Endpoint
/* app.get("/home", (req, res) => {
    res.send(`Hello Palash your port number is ${port}`);
  }); */

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
    connectDB();
});