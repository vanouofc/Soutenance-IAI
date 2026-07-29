import { confirmationEmail, sendEmail } from "../config/resend.js";
import Paiement from "../models/paiement.model.js";
import { generateToken } from "../services/generateToken.service.js";
import { deletePaiementService, getPaiementsByFieldService, getPaiementService, getPaiementsService, paiementService } from "../services/paiement.service.js";
import { RandomGenerator } from "@hachther/mesomb";

export const paiementFrais = async (req, res, next) => {
  const { nom, email, filiere, niveau, classe, matricule, numero, operateur } = req.body;
  if(!nom || !email || !niveau || !classe || !matricule || !numero || !operateur){
    return res.status(400).json({
        success: false,
        message: "Les éléments n'ont pas été renseigner."
    });
  };
  const nonce = RandomGenerator.nonce();
  const transacId = "IAI-" + Date.now();

  try {
    const result = await paiementService({nom, email, filiere, niveau, classe, matricule, numero, operateur, nonce, transacId });

    if (!result.success) {
      return res.status(402).json({
        success: false,
        message: result.message,
      });
    };

    const paiement = result.transaction;

    const montant = paiement.amount;
    const transactionId = paiement.finTrxId;

    const token = generateToken({nom, email, filiere, niveau, classe, matricule, montant, transactionId});

    await sendEmail({
        to: email, 
        subject: 'Frais de soutenance IAI Cameroun',
        html: confirmationEmail({nom, filiere, niveau, classe, matricule, montant, transactionId}),
    });

    return res.status(200).json({
      success: true,
      message: "Paiement reussi.",
      token: token,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaiments = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const { paiements, total, totalPages } = await getPaiementsService(page, limit);

      res.status(200).json({
        success: true,
        message: "Paiements trouvés.",
        pagination: { total, page, totalPages, limit },
        data: paiements,
      });
    } catch (error) {
        next(error);
    }
};

export const getPaiementsByField = async (req, res, next) => {
  try {
    const { field } = req.params;
    const { value, page: pageStr, limit: limitStr } = req.query;
    const page = parseInt(pageStr) || 1;
    const limit = parseInt(limitStr) || 10;

    const result = await getPaiementsByFieldService(field, value, page, limit);
    
    res.status(200).json({ 
        success: true, 
        pagination: { total: result.total, page: result.page, totalPages: result.totalPages, limit },
        paiements: result.paiements
    });
  } catch (error) {
    next(error);
  }
};

export const getPaiement = async (req, res, next) => {
    try {
      const { id } = req.params;

      const paiement = await getPaiementService(id);
      if (!paiement) {
        return res.status(404).json({
            success: false,
            message: "Paiement introuvable."
        });
      };

      res.status(200).json({
        success: true,
        message: "Paiement trouvé.",
        data: paiement
      });
    } catch (error) {
        next(error);
    }
}; 

export const deletePaiement = async (req, res, next) => {
    try {
        const {id} = req.params;
        const deletedPaiement = await deletePaiementService(id);
        if (!deletedPaiement) {
        return res.status(404).json({
            success: false,
            message: "Paiement introuvable."
        });
      };

      res.status(200).json({
        success: true,
        message: "Paiement supprimé.",
        data: deletedPaiement
      });
    } catch (error) {
        next(error);
    }
};
