import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { connectDatabase } from "./config/connect-pg";

const app = express();
const port = Number(process.env.PORT_API);

const startServer = async (): Promise<void> => {
    await connectDatabase();

    app.listen(port, () => {
        console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
    });
}
app.use(helmet())
app.use(cors({
    origin: [
        "http://192.168.18.36"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan("dev"))

app.get("/", (req, res) => {
    res.json({
        succes: true,
        message: "Hotel API Succesfully connected"
    })
})

startServer();

export default app;
