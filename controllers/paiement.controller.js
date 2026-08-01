import { confirmationEmail, sendEmail } from "../config/resend.js";
import Paiement from "../models/paiement.model.js";
import { generateToken } from "../services/generateToken.service.js";
import { addPaiementService, deletePaiementService, getPaiementsByFieldService, getPaiementService, getPaiementsService, getPayDataService, paiementService } from "../services/paiement.service.js";
import { RandomGenerator } from "@hachther/mesomb";

export const paiementFrais = async (req, res, next) => {
  const { nom, email, filiere, niveau, classe, matricule, numero, operateur } = req.body;
  if(!nom || !email || !niveau || !classe || !matricule || !numero || !operateur){
    return res.status(400).json({
        success: false,
        message: "Les éléments n'ont pas été renseigner."
    });
  };

  const filiereInfo = ["Génie logiciel", "Système et réseau", "Software engineering"];
  function defMontant (filiere, niveau) {
    if(niveau === 3 && filiereInfo.includes(filiere)) {
      return 10;
    } else if(niveau === 2 && filiereInfo.includes(filiere)) {
      return 10;
    }else return 10
  };

  const montant = defMontant(filiere, niveau);

  const nonce = RandomGenerator.nonce();
  const transacId = "IAI-" + Date.now();

  try {
    const result = await paiementService({nom, email, filiere, niveau, classe, matricule, numero, operateur, montant, nonce, transacId });

    if (!result.success) {
      return res.status(402).json({
        success: false,
        message: result.message,
      });
    };

    const paiement = result.transaction;
    
    if(paiement.status === "PENDING") {
      return res.status(200).json({
        success: true,
        message: "Paiement en attente.",
        data: result,
      });
    };

    const IdTransaction = paiement.finTrxId;
    const montantR = paiement.amount;

    const token = generateToken({nom, email, filiere, niveau, classe, matricule, montantR, IdTransaction});

    await sendEmail({
        to: email, 
        subject: 'Frais de soutenance IAI Cameroun',
        html: confirmationEmail({nom, filiere, niveau, classe, matricule, montant: montantR, transaction: IdTransaction}),
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

export const addPaiement = async (req, res, next) => {
  try {
    const { nom, email, filiere, niveau, classe, matricule, numero } = req.body;
    const addedBy = req.user?.nom;
    console.log(addedBy);

    if(!nom || !email || !niveau || !classe || !matricule || !numero) {
    return res.status(400).json({
        success: false,
        message: "Les éléments n'ont pas été renseigner."
    });
  };
  const montant = 10

  const transactionId = 'Cash-' + Date.now();

  const paiement = await addPaiementService({nom, email, montant, filiere, niveau, addedBy, classe, matricule, numero, transactionId});
  
  if(!paiement) {
    return res.status(402).json({
      success: false,
      message: "Nous n'avons pas pu ajouter le paiement.",
    });
  };
  
  await sendEmail({
    to: email,
    subject: 'Frais de soutenance IAI Cameroun',
    html: confirmationEmail({nom, filiere, niveau, classe, matricule, montantR: montant, IdTransaction: transactionId}),
  });

  return res.status(200).json({
    success: true,
    message: "Paiement reussi.",
    data: paiement,
  });

  } catch (error) {
    next(error);
  }
};

export const getPayData = async (req, res, next) => {
  try {
    const payHeader = req.headers.authorization;
            if (!payHeader || !payHeader.startsWith('Bearer ')) {
               return res.status(401).json({
                success: false,
                message: 'Token de paiement manquant'
               });
            };
    
            const token = payHeader.split(' ')[1];
            
            // Récupérer le paiement
            const session = await getPayDataService(token);
            
            res.status(200).json({
                success: true,
                session: session
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
