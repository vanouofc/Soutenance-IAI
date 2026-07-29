import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN;
if (!JWT_SECRET || !JWT_EXPIRE_IN) {
  throw new Error("Veuillez renseigner les variables d'environnement du Json Web Token.",);
}

export const generateToken = (Data) => {
  try {
    //const { nom, email, niveau, filiere, classe, matricule, paiement } = Data;
    // Payload du token - informations à inclure
    const payload = Data; //{ nom, email, filiere, niveau, classe, matricule, paiement };

    // Options du token
    const options = {
      expiresIn: JWT_EXPIRE_IN,
      issuer: "Soutenance-IAI Cameroun",
      audience: "IAI Cameroun", // Public cible
    };

    // Générer le token
    const token = jwt.sign(payload, JWT_SECRET, options);

    return token;
  } catch (error) {
    console.error("Erreur lors de la génération du token JWT:", error);
    throw new Error("Impossible de générer le token de paiement");
  }
};
