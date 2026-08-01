import { ErreurMetier } from "../error/erreurMetier.js";
import { getSessionService } from "../services/utilisateur.service.js";

export const requireAuth = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ErreurMetier('Token d\'authentification manquant', 401);
        }

        const token = authHeader.split(' ')[1];
        
        // Récupérer la session
        const session = await getSessionService(token);
        
        // Attacher la session à la requête
        req.session = session;
        req.user = session.user;
        
        next();
    } catch (error) {
        next(error);
    }
};