import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ErreurMetier } from "../error/erreurMetier.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/photos');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true});
};

// Configuration du stockage.
const stockage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const instant = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `photo-${instant}${ext}`);
    }
});

// Filtre des types de fichiers.
const fileFiltre = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    // IMPORTANT : le `return` est nécessaire pour ne PAS appeler cb() une
    // seconde fois (sinon multer lève une erreur "Double callback").
    if (!mimetype || !extname){
        return cb(new ErreurMetier('Seules les images sont autorisées (jpeg, jpg, png, webp)', 400));
    }

    return cb(null, true);
};

// Configuration de multer.
export const upload = multer({
    storage: stockage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: fileFiltre
});