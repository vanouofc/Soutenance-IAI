import mongoose from "mongoose";
import Utilisateur from "../models/utilisateur.model.js";
import { ErreurMetier } from "../error/erreurMetier.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "./generateToken.service.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


export const createUtilisateurService = async (utilisateurData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {nom, email, password, phone} = utilisateurData;

        const existUtilisateur = await Utilisateur.findOne({email}).session(session);
        if(existUtilisateur){
            throw new ErreurMetier('Cet utilisateur existe déjà.', 409);
        };

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUtilisateur = new Utilisateur({
            nom,
            email,
            password: hashPassword,
            phone
        });
        const utilisateur = await newUtilisateur.save({session});

        const token = await generateToken({newUtilisateur});

        await session.commitTransaction();
        await session.endSession();

        return {utilisateur, token};
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
};

export const utilisateurSignInService = async (utilisateurData) => {
    try {
        const {email, password} = utilisateurData;

        const utilisateur = await Utilisateur.findOne({email});
        if(!utilisateur){
            throw new ErreurMetier('Utilisateur introuvable.', 404);
        };

        const correctPassword = await bcrypt.compare(password, utilisateur.password);
        if(!correctPassword){
            throw new ErreurMetier('Mot de passe incorrect.', 400);
        };

        const token = await generateToken({utilisateur});

        return {utilisateur, token};
    } catch (error) {
        throw error;
    }
};

export const getSessionService = async (token) => {
    try {
        // Vérifier si le token est fourni
        if (!token) {
            throw new ErreurMetier('Token d\'authentification manquant', 401);
        }

        // Vérifier et décoder le token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new ErreurMetier('Token invalide', 401);
            };
            if (error.name === 'TokenExpiredError') {
                throw new ErreurMetier('Session expirée, veuillez vous reconnecter', 401);
            };
            throw new ErreurMetier('Erreur lors de la vérification du token', 500);
        };
        
        const utilisateurToken = decodedToken.utilisateur;

        // Récupérer l'utilisateur depuis la base de données
        const utilisateur = await Utilisateur.findById(utilisateurToken._id).select('-password').lean(); // Retourner un objet simple
        if (!utilisateur) {
            throw new ErreurMetier('Utilisateur non trouvé', 404);
        };

        // Construire la session
        const session = {
            utilisateur: {
                id: utilisateur._id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                phone: utilisateur.phone,
                createdAt: utilisateur.createdAt,
                updatedAt: utilisateur.updatedAt
            },
            token: token,
            expiresAt: new Date(decodedToken.exp * 1000), // Conversion en date
            issuedAt: new Date(decodedToken.iat * 1000)
        };

        return session;

    } catch (error) {
        throw error;
    }
};