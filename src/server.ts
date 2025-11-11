require("dotenv").config();
import express from 'express'
import router from './routes/Router';
import cors from 'cors';
const PORT = process.env.PORT || "3012"
const app = express();

app.use(express.json());
app.use(cors());
app.use("/portal", router);






app.listen(PORT, () => console.log("Aplicação rodando"))