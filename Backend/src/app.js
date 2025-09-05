import express from "express";
import urlRoutes from "./routes/urlRoutes.js";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(bodyParser.json());
app.use("/", urlRoutes);
export default app;
