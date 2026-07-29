import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PhotoService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads/photos');
    }

    // Sauvegarder une photo
    async savePhoto(file) {
        try {
            // Vérifier que le fichier existe
            if (!file) {
                throw new Error('Aucun fichier à sauvegarder');
            }

            // Récupérer les informations du fichier
            const photoData = {
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                url: `/uploads/photos/${file.filename}`
            };

            // Ici vous pouvez ajouter d'autres traitements :
            // - Optimisation avec Sharp
            // - Redimensionnement
            // - Compression
            // - Extraction des métadonnées
            // - Enregistrement en base de données

            return {
                success: true,
                data: photoData
            };

        } catch (error) {
            console.error('Erreur dans le service:', error);
            throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
        }
    }

    // Vérifier si un fichier est valide
    async validatePhoto(file) {
        if (!file) {
            return { valid: false, error: 'Aucun fichier fourni' };
        }

        // Vérifier la taille (déjà fait par Multer)
        if (file.size > 5 * 1024 * 1024) {
            return { valid: false, error: 'Fichier trop volumineux (max 5MB)' };
        }

        // Vérifier le type MIME
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
            return { valid: false, error: 'Format d\'image non supporté' };
        }

        return { valid: true };
    }
}

export default new PhotoService();