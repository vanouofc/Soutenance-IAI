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
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.requestBody = { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['photo', 'theme', 'jour', 'heure', 'salle', 'encadreurAcademique', 'encadreurProfessionnel'], properties: { photo: { type: 'string', format: 'binary', description: 'Fichier image (jpeg, jpg, png, webp) - max 5 Mo' }, theme: { type: 'string', description: 'Thème de la soutenance' }, jour: { type: 'string', description: 'Date de la soutenance (ex: 12/08/2026)' }, heure: { type: 'string', description: 'Heure de la soutenance (ex: 10h30)' }, salle: { type: 'string', description: 'Salle où se déroule la soutenance' }, encadreurAcademique: { type: 'string', description: 'Encadreur academique' }, encadreurProfessionnel: { type: 'string', description: 'Encadreur professionnel' } } } } } } */ 
    /* #swagger.responses[201] = { description: 'Carte générée (apercu base64 + url)' } */ 
    /* #swagger.responses[400] = { description: 'Photo manquante, format invalide ou champs manquants' } */ 
    /* #swagger.responses[404] = { description: 'Aucun modèle de carte pour cette filière/niveau' } */ 
    /* #swagger.responses[500] = { description: 'Erreur lors du téléchargement' } */ 
    uploadPhoto
);

export default photoRouter;
