require("dotenv").config();
import express from 'express'
import router from './routes/Router';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
app.use("/portal", router);






app.listen("3012", () => console.log("Aplicação rodando"))