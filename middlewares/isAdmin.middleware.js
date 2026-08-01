export const isAdmin = (req, res, next) => {
    // Vérifier si l'utilisateur existe dans la requête
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Utilisateur non authentifié' 
        });
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (req.user.role !== 'admin'/* && req.user.role !== 'administrateur'*/) {
        return res.status(403).json({ 
            success: false, 
            message: 'Accès refusé. Droits administrateur requis.' 
        });
    }

    next();
};