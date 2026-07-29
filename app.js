import express from "express";
import dotenv from "dotenv";
import DBconnection from "./config/mongoDB.js";
import cors from "cors";
import paiementRouter from "./routes/paiement.routes.js";
import utilisateurRouter from "./routes/utilisateur.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import arcjectMiddleware from "./middlewares/arcjet.middleware.js";
import photoRouter from "./routes/photo.routes.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const PORT = process.env.PORT;
if(!PORT){
    throw new Error("Veuillez renseigner le PORT dans le .env.");
};

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(arcjectMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const swaggerDocument = JSON.parse(readFileSync(new URL("./swagger-output.json", import.meta.url)));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/photos', photoRouter);
app.use('/buy-it', paiementRouter);
app.use('/utilisateurs', utilisateurRouter);
app.get('/', (req, res) => {
    console.log(`http://127.0.0.1:${PORT}/`);
    res.send();
});

app.use(errorMiddleware);

app.listen(PORT, async (req, res) => {
    await DBconnection();
    console.log(`Server starting on port http://127.0.0.1:${PORT}.`);
});