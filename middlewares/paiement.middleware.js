import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifierPaiementToken = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification manquant ou invalide"
            });
        }

        const token = authHeader.split(' ')[1]; // Récupérer le token après "Bearer"

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ajouter les données du token à la requête
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error("Erreur de vérification du token:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expiré, veuillez renouveler votre paiement"
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Token invalide"
        });
    }
};