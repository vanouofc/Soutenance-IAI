import dotenv from "dotenv";
import { activationEmail, sendEmail } from "../config/resend.js";
import { createUtilisateurService, getSessionService, utilisateurSignInService } from "../services/utilisateur.service.js";

dotenv.config();

const ADMIN_CONTACT = process.env.ADMIN_CONTACT;
if(!ADMIN_CONTACT) {
    throw new Error("Renseigner le contact de l'Admin.");
};


export const createUtilisateur = async (req, res, next) => {
    try {
        const {nom, email, password, phone} = req.body
        if(!nom || !email || !password || !phone){
            return res.status(400).json({
                success: false,
                message: "Veuillez renseigner les éléments correctements."
            });
        };

        const register = await createUtilisateurService({nom, email, password, phone});
        if(!register){
            return res.status(400).json({
                success: false,
                message: "L'utilisateur n'a pas pu etre creer."
            });
        };

        await sendEmail({
            to: process.env.ADMIN_CONTACT,
            subject: 'Valider un nouvel administrateur',
            html: activationEmail({nom, email}),
        });

        const {utilisateur, token} = register;
        

        res.status(201).json({
            success: true,
            message: 'Utilisateur creer avec succes.',
            token: token,
            data: utilisateur
        });
    } catch (error) {
        next(error);
    }
};

export const utilisateurSignIn = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Veuillez renseigner correctement tous les champs.'
            });
        };

        const signIn = await utilisateurSignInService({email, password});
        if(!signIn){
            return res.status(400).json({
                success: false,
                message: 'Connexion impossible.'
            });
        };

        const {utilisateur, token} = signIn;

        res.status(201).json({
            success: true,
            message: 'Utilisateur authentifier.',
            token: token,
            data: utilisateur
        });
    } catch (error) {
        next(error);
    }
};

export const utilisateurSignout = async (req, res, next) => {
    try {
        //Le token est supprimer cote frontend, donc pas besoin de grand chose a ce niveau.
        res.status(200).json({
            success: true,
            message: 'Deconnexion reussie'
        });
    } catch (error) {
        next(error);
    }
};

export const getSession = async (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
           return res.status(401).json({
            success: false,
            message: 'Token d\'authentification manquant'
           });
        };

        const token = authHeader.split(' ')[1];
        
        // Récupérer la session
        const session = await getSessionService(token);
        
        res.status(200).json({
            success: true,
            session: session
        });
    } catch (error) {
        next(error);
    }
};
