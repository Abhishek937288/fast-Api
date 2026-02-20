import express from "express";
import dotenv from "dotenv/config";
import { connectDb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users" , userRoutes)

app.listen(port, () => {
  console.log(`server is working on ${port}`);
  connectDb()
});
