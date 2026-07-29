export const errorMiddleware = (err, req, res, next) => {
    console.error(`[Erreur API]: ${err.stack}`);

    // 1. Erreur métier explicite → on fait confiance au statusCode qu'elle transporte
    if (err.isErreurMetier) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // 1bis. Erreurs Multer (upload de fichier) : trop volumineux, champ
    // inattendu, etc. Sans ce cas elles tombaient dans le 500 générique
    // ci-dessous et l'utilisateur ne savait jamais pourquoi son upload échouait.
    if (err.name === "MulterError") {
        const messages = {
            LIMIT_FILE_SIZE: "Le fichier dépasse la taille maximale autorisée (5 Mo).",
            LIMIT_UNEXPECTED_FILE: "Champ de fichier inattendu. Utilisez le champ \"photo\".",
        };
        return res.status(400).json({
            success: false,
            message: messages[err.code] || "Erreur lors du téléversement du fichier."
        });
    }

    // 2. Erreurs Mongoose courantes, pas encore migrées en ErreurMetier
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors).map(e => e.message).join(", ")
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Identifiant invalide : ${err.value}`
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Cette donnée existe déjà dans le système."
        });
    }

    // 3. Fallback texte, pour le code pas encore migré (à supprimer une fois tout migré)
    if (err.message && (err.message.includes("Stock insuffisant") || err.message.includes("n'existe pas"))) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // 4. Tout le reste = vraie erreur serveur inattendue
    return res.status(500).json({
        success: false,
        message: "Une erreur interne du serveur est survenue."
    });
};