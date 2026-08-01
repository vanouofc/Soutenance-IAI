import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getPayDataService } from "../services/paiement.service.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware pour vérifier le token de paiement
 * Utilise le service getPayDataService pour récupérer les données du paiement
 */
export const verifierPaiementToken = async (req, res, next) => {
    try {
        // 1. Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification manquant ou invalide"
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Appeler le service pour récupérer les données du paiement
        let session;
        try {
            session = await getPayDataService(token);
        } catch (error) {
            // Gérer les erreurs du service
            if (error.message === "Token invalide") {
                return res.status(401).json({
                    success: false,
                    message: "Token invalide"
                });
            }
            if (error.message === "Paiement expiré, veuillez payer de nouveau.") {
                return res.status(401).json({
                    success: false,
                    message: "Token expiré, veuillez renouveler votre paiement"
                });
            }
            if (error.message === "Paiement non trouvé") {
                return res.status(404).json({
                    success: false,
                    message: "Paiement non trouvé"
                });
            }
            // Ré-erreur pour les autres cas
            throw error;
        }

        // 3. Ajouter les données du paiement à la requête
        req.paiementSession = session;
        req.paiementData = session.pay;
        req.transactionId = session.pay.id;
        req.paiementExpiresAt = session.expiresAt;
        req.paiementIssuedAt = session.issuedAt;

        // 4. Ajouter également le token décodé (le service a déjà vérifié la signature)
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token invalide"
            });
        }

        next();
        
    } catch (error) {
        console.error("Erreur de vérification du token:", error);
        
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification du paiement"
        });
    }
};