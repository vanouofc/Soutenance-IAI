import { Router } from "express";
import { upload } from "../config/multer.js";
import { uploadPhoto } from "../controllers/photo.controller.js";
import { verifierPaiementToken } from "../middlewares/paiement.middleware.js";

const photoRouter = Router();

photoRouter.post('/upload', 
    verifierPaiementToken, upload.single('photo'), 
    /* #swagger.tags = ['Photos'] */ 
    /* #swagger.summary = 'Uploader une photo' */ 
    /* #swagger.description = 'Télécharge une photo (jpeg, jpg, png, webp - max 5 Mo). Authentification requise.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ /* #swagger.consumes = ['multipart/form-data'] */ 
    /* #swagger.parameters['photo'] = { in: 'formData', type: 'file', required: true, description: 'Fichier image (jpeg, jpg, png, webp) - max 5 Mo' } */ 
    /* #swagger.responses[201] = { description: 'Photo téléchargée avec succès' } */ 
    /* #swagger.responses[400] = { description: 'Aucune photo ou format invalide' } */ 
    /* #swagger.responses[500] = { description: 'Erreur lors du téléchargement' } */ 
    uploadPhoto
);

export default photoRouter;
