import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import accountRoutes from "./routes/accountRoutes.js";
import preferenceRoutes from "./routes/preferenceRoute.js";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from any origin
    callback(null, origin || '*');
  },
  credentials: true, // Allow credentials (cookies)
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());


const mongoURI = "mongodb://localhost:27017/T5DB";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/api/account", accountRoutes);
app.use("/api/preferences", preferenceRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
