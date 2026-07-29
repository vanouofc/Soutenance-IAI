import photoService from "../services/photo.service.js";
import fs from "fs";

export const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Aucune photo téléchargée'
            });
        };

        const validation = await photoService.validatePhoto(req.file);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        };

        const result = await photoService.savePhoto(req.file);

        return res.status(201).json({
            success: true,
            message: 'Photo téléchargée avec succès',
            data: result.data
        });

    } catch (error) {
        console.error('Erreur contrôleur upload:', error);
        
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Erreur nettoyage:', unlinkError);
            }
        };

        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors du téléchargement'
        });
    }
};
