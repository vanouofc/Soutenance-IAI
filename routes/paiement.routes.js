import { Router } from "express";
import { addPaiement, deletePaiement, getPaiement, getPaiementsByField, getPaiments, getPayData, paiementFrais } from "../controllers/paiement.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
import { verifierPaiementToken } from "../middlewares/paiement.middleware.js";

const paiementRouter = Router();

paiementRouter.post('/', 
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Effectuer un paiement Mobile Money' */ 
    /* #swagger.description = 'Initie un paiement Mobile Money via Orange ou MTN et envoie un email de confirmation.' */ 
    /* #swagger.parameters['body'] = { in: 'body', description: 'Données du paiement', schema: { $ref: '#/definitions/Paiement' } } */ /* #swagger.responses[200] = { description: 'Paiement réussi', schema: { $ref: '#/definitions/Paiement' } } */ 
    /* #swagger.responses[400] = { description: 'Champs manquants' } */ 
    /* #swagger.responses[402] = { description: 'Échec du paiement' } */ 
    paiementFrais
);

paiementRouter.post('/add', 
    requireAuth, 
    isAdmin, 
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Ajouter un paiement' */ 
    /* #swagger.description = 'Ajouter un paiement manuellement dans la base de données.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID MongoDB du paiement', required: true, type: 'string' } */ 
    /* #swagger.responses[200] = { description: 'Paiement supprimé' } */ 
    /* #swagger.responses[404] = { description: 'Paiement introuvable' } */
    addPaiement
);

paiementRouter.get('/', 
    requireAuth,
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Lister tous les paiements' */ 
    /* #swagger.description = 'Retourne la liste des paiements avec pagination. Authentification requise.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.responses[200] = { description: 'Liste des paiements' } */ 
    getPaiments
);

paiementRouter.get('/get-paydata', verifierPaiementToken, getPayData);

paiementRouter.get('/:id', 
    requireAuth, 
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Obtenir un paiement par ID' */ 
    /* #swagger.description = 'Retourne les détails d\'un paiement spécifique.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID MongoDB du paiement', required: true, type: 'string' } */ 
    /* #swagger.responses[200] = { description: 'Paiement trouvé' } */ 
    /* #swagger.responses[404] = { description: 'Paiement introuvable' } */ 
    getPaiement
);

paiementRouter.delete('/:id', 
    requireAuth, 
    isAdmin,
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Supprimer un paiement (soft delete)' */ 
    /* #swagger.description = 'Marque un paiement comme supprimé (isActive: false) sans l\'effacer de la base.' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.parameters['id'] = { in: 'path', description: 'ID MongoDB du paiement', required: true, type: 'string' } */ 
    /* #swagger.responses[200] = { description: 'Paiement supprimé' } */ 
    /* #swagger.responses[404] = { description: 'Paiement introuvable' } */ 
    deletePaiement
);

paiementRouter.get('/search/:field', 
    requireAuth, 
    /* #swagger.tags = ['Paiements'] */ 
    /* #swagger.summary = 'Rechercher des paiements par champ' */ 
    /* #swagger.description = 'Recherche des paiements par nom, matricule, classe, filière ou niveau (insensible à la casse).' */ 
    /* #swagger.security = [{ "bearerAuth": [] }] */ 
    /* #swagger.parameters['field'] = { in: 'path', description: 'Champ de recherche (nom, matricule, classe, filiere, niveau)', required: true, type: 'string' } */ 
    /* #swagger.parameters['value'] = { in: 'query', description: 'Valeur à rechercher', required: true, type: 'string' } */ 
    /* #swagger.responses[200] = { description: 'Résultats de la recherche' } */ 
    /* #swagger.responses[400] = { description: 'Champ de recherche invalide' } */ 
    /* #swagger.responses[404] = { description: 'Aucun paiement trouvé' } */ 
    getPaiementsByField
);

export default paiementRouter
