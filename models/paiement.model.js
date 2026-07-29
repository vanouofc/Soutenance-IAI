import mongoose from "mongoose";

const paiementSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      trim: true,
      required: [true, "Numéro de téléphone du payeur requis."],
    },
    nom: {
      type: String,
      trim: true,
      required: [true, "Le nom du payeur est requis."],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "L'email du payeur est requis."],
    },
    filiere: {
      type: String,
      trim: true,
      enum: {
        values: [ "Génie logiciel", "Système et réseau", "Software engineering" ],
        message: "filière invalide.",
      },
    },
    classe: {
      type: String,
      trim: true,
      required: [true, "La classe du payeur est requis."],
    },
    niveau: {
      type: String,
      trim: true,
      required: [true, "Le niveau du payeur est requis."],
    },
    methode: {
        type: String,
        trim: true,
        enum: {
            values: ["En ligne", "Cash"],
            message: "Méthode de paiement invalide."
        },
        default: "En ligne"
    },
    matricule: {
      type: String,
      trim: true,
      required: [true, "Le matricule du payeur est requis."],
    },
    operateur: {
      type: String,
      trim: true,
      enum: {
        values: [ "ORANGE", "MTN" ],
        message: "Opérateur invalide.",
      },
    },
    idTransaction: {
      type: String,
      trim: true,
      required: [true, "L'id de la transaction est requis."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    restoredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

paiementSchema.pre("find", function () {
  this.where({ isActive: true });
});
paiementSchema.pre("findOne", function () {
  this.where({ isActive: true });
});

const Paiement = mongoose.model("Paiement", paiementSchema);

export default Paiement;
