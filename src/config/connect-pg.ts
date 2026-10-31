import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});

export const connectDatabase = async (): Promise<void> => {
    try {
        await pool.query("SELECT NOW()");
        console.log("==============SE CONECTO CORRECTAMENTE================");
    } catch (error) {
        console.error("ERROR SERVER CONNECT POSTGRES: ", error);
        process.exit(1);
    }
}


export default pool;
