import { PaymentOperation } from "@hachther/mesomb";
import dotenv from "dotenv";
import Paiement from "../models/paiement.model.js";
import { ErreurMetier } from "../error/erreurMetier.js";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const applicationKey = process.env.APP_KEY;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
if (!applicationKey || !accessKey || !secretKey) {
  throw new Error("Verifier les variables d'environnement pour les paiements.");
};

const client = new PaymentOperation({ applicationKey, accessKey, secretKey });

export const paiementService = async (transactionData) => {
    try {
        const {nom, email, filiere, niveau, classe, matricule, operateur, montant, numero, nonce, transacId} = transactionData;

        const operation = await client.makeCollect({
            service: operateur,
            payer: numero,
            amount: montant,
            nonce: nonce,
            trxId: transacId,
            fees: false
        });
        if(!operation.success){
            throw new ErreurMetier("Echec du paiement.", 400);
        };

        const finTrxId = operation.transaction.finTrxId;

        const newPaiement = new Paiement({
            numero,
            email,
            filiere,
            nom,
            montant: operation.transaction.amount,
            niveau,
            classe,
            matricule,
            operateur,
            idTransaction: finTrxId,
        });
        const paiement = await newPaiement.save();

        return operation;
    } catch (error) {
        throw error;
    }
};

export const addPaiementService = async (paiementData) => {
    const {nom, email, filiere, niveau, classe, matricule, numero, montant, transactionId, addedBy} = paiementData;
    try {

        const paiement = new Paiement({
            nom,
            email,
            filiere,
            niveau,
            classe,
            matricule,
            numero,
            idTransaction: transactionId,
            operateur: addedBy,
            montant: montant,
            methode: 'Cash'
        });
        const result = await paiement.save();

        return result;
    } catch (error) {
        throw error;
    }
};

export const getPayDataService = async (token) => {
  try {
    // Vérifier si le token est fourni
    if (!token) {
      throw new ErreurMetier("Token de paiement manquant", 401);
    }

    // Vérifier et décoder le token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new ErreurMetier("Token invalide", 401);
      }
      if (error.name === "TokenExpiredError") {
        throw new ErreurMetier(
          "Paiement expiré, veuillez payer de nouveau.",
          401,
        );
      }
      throw new ErreurMetier("Erreur lors de la vérification du token", 500);
    }

    const paiementToken = decodedToken;
    const id = paiementToken.IdTransaction;
    if (!id) {
      throw new ErreurMetier("Token invalide", 401);
    }

    // Récupérer le depuis la base de données
    const paiement = await Paiement.findOne({idTransaction: id}).lean(); // Retourner un objet simple
    if (!paiement) {
      throw new ErreurMetier("Paiement non trouvé", 404);
    };

    // Construire la session
    const session = {
      pay: {
        id: paiement.idTransaction,
        nom: paiement.nom,
        email: paiement.email,
        filiere: paiement.filiere,
        classe: paiement.classe,
      },
      expiresAt: new Date(decodedToken.exp * 1000), // Conversion en date
      issuedAt: new Date(decodedToken.iat * 1000)
    };

    return session;
  } catch (error) {
    throw error;
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

      if (!value || String(value).trim() === "") {
        throw new ErreurMetier("La valeur de recherche est requise", 400);
      };

      if (String(value).length > 200) {
        throw new ErreurMetier("La valeur de recherche est trop longue (200 caractères max).", 400);
      };

      const skip = (page - 1) * limit;
      // "niveau" est stocké en Number dans la base : on ne peut pas utiliser
      // $regex (réservé aux chaînes). On recherche donc par égalité numérique.
      let filtre;
      if (field === "niveau") {
        const niveau = Number(value);
        if (Number.isNaN(niveau)) {
          throw new ErreurMetier(`La valeur du niveau doit être un nombre (reçu: "${value}")`, 400);
        };
        filtre = { [field]: niveau };
      } else {
        // Échappe les métacaractères d'expression régulière : la valeur est
        // recherchée en tant que texte LITTÉRAL, ce qui neutralise le ReDoS
        // (backtracking catastrophique via "(a+)+$" ou équivalent).
        const valeurLitterale = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filtre = { [field]: { $regex: valeurLitterale, $options: "i" } };
      }
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