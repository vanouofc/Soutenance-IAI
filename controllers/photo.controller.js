import photoService from "../services/photo.service.js";
import fs from "fs";

export const uploadPhoto = async (req, res, next) => {
    try {
        // ----- 1. Vérifier la présence de la photo -----
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Aucune photo téléchargée'
            });
        };

        // ----- 2. Valider la photo (format, taille) -----
        const validation = await photoService.validatePhoto(req.file);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        };

        // ----- 3. Enregistrer la photo source (uploads/photos/) -----
        const photo = await photoService.savePhoto(req.file);

        // ----- 4. Récupérer les métadonnées du formulaire -----
        const { theme, jour, heure, salle, encadreurAcademique, encadreurProfessionnel } = req.body;

        // ----- 5. Données du candidat issues du token de paiement -----
        // verifierPaiementToken a posé le payload décodé dans req.user :
        // { nom, email, filiere, niveau, classe, matricule, montant, transacId }
        const paiement = req.user;
        if (!paiement?.filiere || !paiement?.niveau || !paiement?.nom) {
            return res.status(400).json({
                success: false,
                error: 'Token de paiement invalide ou incomplet.'
            });
        };

        // ----- 6. Générer la carte de soutenance (PDF rempli -> PNG) -----
        const carte = await photoService.genererCarte({
            file: req.file,
            donnees: {
                nom: paiement.nom,
                filiere: paiement.filiere,
                niveau: paiement.niveau,
                theme,
                jour,
                heure,
                salle,
                encadreurAcademique,
                encadreurProfessionnel,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Carte de soutenance générée avec succès.',
            apercu: carte.apercuBase64,
            url: carte.url,
            photo: photo.data,
        });

    } catch (error) {
        // ----- Nettoyage de la photo si une erreur survient après l'upload -----
        if (req.file && req.file.path) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Erreur nettoyage:', unlinkError);
            }
        };

        console.error('Erreur contrôleur upload:', error);

        // On délègue à errorMiddleware pour respecter les statuts ErreurMetier (400/404/...)
        next(error);
    }
};
