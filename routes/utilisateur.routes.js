import { Router } from "express";
import { createUtilisateur, getSession, utilisateurSignIn, utilisateurSignout } from "../controllers/utilisateur.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const utilisateurRouter = Router();

utilisateurRouter.post('/', 
    requireAuth,
    /* #swagger.tags = ['Utilisateurs'] */ 
    /* #swagger.summary = 'Créer un compte administrateur' */ 
    /* #swagger.description = 'Inscrit un nouvel utilisateur avec nom, email, mot de passe et téléphone.' */ 
    /* #swagger.parameters['body'] = { in: 'body', description: 'Données utilisateur', schema: { $ref: '#/definitions/Utilisateur' } } */ 
    /* #swagger.responses[201] = { description: 'Utilisateur créé avec succès', schema: { $ref: '#/definitions/Utilisateur' } } */ 
    /* #swagger.responses[400] = { description: 'Champs manquants' } */ 
    /* #swagger.responses[409] = { description: 'Cet utilisateur existe déjà.' } */ 
    createUtilisateur
);

utilisateurRouter.post('/signin', 
    /* #swagger.tags = ['Utilisateurs'] */ 
    /* #swagger.summary = 'Connecter un administrateur' */ 
    /* #swagger.description = 'Authentifie un utilisateur avec email et mot de passe.' */ 
    /* #swagger.parameters['body'] = { in: 'body', description: 'Identifiants de connexion', schema: { $ref: '#/definitions/SignInBody' } } */ 
    /* #swagger.responses[201] = { description: 'Authentification réussie', schema: { $ref: '#/definitions/Utilisateur' } } */ 
    /* #swagger.responses[400] = { description: 'Mot de passe incorrect' } */ 
    /* #swagger.responses[404] = { description: 'Utilisateur introuvable' } */ 
    utilisateurSignIn
);

utilisateurRouter.post('/signout', 
    /* #swagger.tags = ['Utilisateurs'] */ 
    /* #swagger.summary = 'Déconnecter un administrateur' */ 
    /* #swagger.description = 'Déconnecte l\'utilisateur (le token est géré côté client).' */ 
    /* #swagger.responses[200] = { description: 'Déconnexion réussie' } */ 
    utilisateurSignout
);

utilisateurRouter.get('/get-session', 
    /* #swagger.tags = ['Utilisateurs'] */ 
    /* #swagger.summary = 'Vérifier une session utilisateur' */ 
    /* #swagger.description = 'Vérifie la validité du token JWT et retourne les informations de session.' */ 
    /* #swagger.responses[200] = { description: 'Session active' } */ 
    /* #swagger.responses[401] = { description: 'Token manquant, invalide ou expiré' } */ 
    getSession
);

export default utilisateurRouter;