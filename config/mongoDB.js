import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
    throw new Error("Veuillez renseigner l'URL de la base de donnees.");
}

const DBconnection = async () => {
    try {
        console.log("Connexion en cours, patientez SVP...");

        await mongoose.connect(DB_URL);

        console.log("Connexion a la base de donnees reussie.");
    } catch (error) {
        console.error("Erreur de connexion MongoDB :", error.message);
        process.exit(1);
    }
};

export default DBconnection;