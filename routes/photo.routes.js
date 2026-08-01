import { Router } from "express";
import { upload } from "../config/multer.js";
import { uploadPhoto } from "../controllers/photo.controller.js";
import { verifierPaiementToken } from "../middlewares/paiement.middleware.js";

const photoRouter = Router();

photoRouter.post('/upload', 
    verifierPaiementToken, upload.single('photo'), 
    /* #swagger.tags = ['Photos'] */ 
    /* #swagger.summary = 'Uploader une photo et générer la carte de soutenance' */ 
    /* #swagger.description = 'Télécharge une photo (jpeg, jpg, png, webp - max 5 Mo) et les métadonnées de la soutenance, puis génère la carte (PDF rempli converti en PNG) selon la filière et le niveau du token de paiement.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ /* #swagger.consumes = ['multipart/form-data'] */ 
    /* #swagger.parameters['photo'] = { in: 'formData', type: 'file', required: true, description: 'Fichier image (jpeg, jpg, png, webp) - max 5 Mo' } */ 
    /* #swagger.parameters['theme'] = { in: 'formData', type: 'string', required: true, description: 'Thème de la soutenance' } */ 
    /* #swagger.parameters['jour'] = { in: 'formData', type: 'string', required: true, description: 'Date de la soutenance (ex: 12/08/2026)' } */ 
    /* #swagger.parameters['heure'] = { in: 'formData', type: 'string', required: true, description: 'Heure de la soutenance (ex: 10h30)' } */ 
    /* #swagger.parameters['salle'] = { in: 'formData', type: 'string', required: true, description: 'Salle où se déroule la soutenance' } */ 
    /* #swagger.parameters['encadreurAcademique'] = { in: 'formData', type: 'string', required: true, description: 'Nom de l\'encadreur académique' } */ 
    /* #swagger.parameters['encadreurProfessionnel'] = { in: 'formData', type: 'string', required: true, description: 'Nom de l\'encadreur professionnel' } */ 
    /* #swagger.responses[201] = { description: 'Carte générée (apercu base64 + url)' } */ 
    /* #swagger.responses[400] = { description: 'Photo manquante, format invalide ou champs manquants' } */ 
    /* #swagger.responses[404] = { description: 'Aucun modèle de carte pour cette filière/niveau' } */ 
    /* #swagger.responses[500] = { description: 'Erreur lors du téléchargement' } */ 
    uploadPhoto
);

export default photoRouter;
