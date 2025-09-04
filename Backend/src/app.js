import express from "express";
import urlRoutes from "./routes/urlRoutes.js";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
app.use(bodyParser.json())
app.use("/", urlRoutes);
export default app;
