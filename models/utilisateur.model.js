import mongoose from "mongoose";

const utilisateurSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: [true, `Le nom de l'utilisateur est requis.`],
        minlength: 4
    },
    email: {
        type: String,
        required: [true, `L'email est requis.`],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Renseigner un email valide.'], // ex: xxxxx@gmail.com
    },
    password: {
        type: String,
        required: [true, `Le mot de passe est requis.`],
        minlength: 6
    },
    phone: {
        type: String,
        required: [true, `Le numéro de téléphone est requis.`],
    },
    role: {
        type: String,
        default: 'user',
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    restoredAt: {
        type: Date,
        default: null
    },
}, {timestamps: true})



utilisateurSchema.pre('find', function() {
    this.where({ isActive: true });
});
utilisateurSchema.pre('findOne', function() {
    this.where({ isActive: true });
});


const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

export default Utilisateur;