import { PaymentOperation } from "@hachther/mesomb";
import dotenv from "dotenv";
import Paiement from "../models/paiement.model.js";
import { ErreurMetier } from "../error/erreurMetier.js";

dotenv.config();

const applicationKey = process.env.APP_KEY;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
if (!applicationKey || !accessKey || !secretKey) {
  throw new Error("Verifier les variables d'environnement pour les paiements.");
};

const client = new PaymentOperation({ applicationKey, accessKey, secretKey });

export const paiementService = async (transactionData) => {
    try {
        const {nom, email, filiere, niveau, classe, matricule, operateur, numero, nonce, transacId} = transactionData;

        const operation = await client.makeCollect({
            service: operateur,
            payer: numero,
            amount: 10,
            nonce: nonce,
            trxId: transacId,
            fees: false
        });
        if(!operation.success){
            throw new ErreurMetier("Echec du paiement.", 400);
        };

        const newPaiement = new Paiement({
            numero,
            email,
            filiere,
            nom,
            niveau,
            classe,
            matricule,
            operateur,
            idTransaction: transacId,
        });
        const paiement = await newPaiement.save();

        return operation;
    } catch (error) {
        throw error
    }
};

export const getPaiementsService = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const total = await Paiement.countDocuments({ isActive: true });
        const paiements = await Paiement.find().skip(skip).limit(limit);

        return { paiements, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        throw error;
    }
};

export const getPaiementsByFieldService = async (field, value, page = 1, limit = 10) => {
    try {
      const allowedFields = ["nom", "matricule", "classe", "filiere", "niveau"];
      if (!allowedFields.includes(field)) {
        throw new ErreurMetier(`Champ de recherche invalide. Utilisez: ${allowedFields.join(", ")}`, 400);
      };

      if (!value || value.trim() === "") {
        throw new ErreurMetier("La valeur de recherche est requise", 400);
      };

      const skip = (page - 1) * limit;
      const filtre = { [field]: { $regex: value, $options: "i" } };
      const total = await Paiement.countDocuments(filtre);
      const paiements = await Paiement.find(filtre).skip(skip).limit(limit);

      if (paiements.length === 0) {
        throw new ErreurMetier( `Aucun paiement trouvé pour ${field}: ${value}`, 404 );
      };

      return { paiements, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        throw error;
    }
};

export const getPaiementService = async (paiementId) => {
    try {
        const paiement = await Paiement.findById(paiementId);
        if(!paiement){
            throw new ErreurMetier("Paiement introuvable", 404);
        };

        return paiement;
    } catch (error) {
        throw error;
    }
};

export const deletePaiementService = async (paiementId) => {
    try {
        const paiement = await Paiement.findById(paiementId);
        if(!paiement){
            throw new ErreurMetier("Paiement introuvable", 404);
        };

        const deletedPaiement = await Paiement.findByIdAndUpdate(
            paiementId,
            {isActive: false, deletedAt: new Date()},
            {runValidators: true, returnDocument: "after"}
        );

        return deletedPaiement;
    } catch (error) {
        throw error;
    }
};