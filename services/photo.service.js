import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { ErreurMetier } from "../error/erreurMetier.js";

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// CONSTANTES GÉNÉRALES
// ------------------------------------------------------------

// Taille de la page (en points) des cartes GL3-PDF.pdf / SR3-PDF.pdf.
const PAGE_WIDTH = 259.2;
const PAGE_HEIGHT = 363.84;

// Dossier où seront enregistrées les cartes générées (images PNG).
const CARTES_DIR = path.join(__dirname, "../uploads/cartes");

// Échelle de rendu PDF -> PNG (2 = ~150 dpi, suffisant pour un aperçu + téléchargement).
const RENDER_SCALE = 4;

// Échelle (px par pt) utilisée pour recadrer/redimensionner la photo avant
// son insertion : garantit une photo nette dans la zone w × h définie.
const PHOTO_SCALE = 3;

// Polices TTF embarqées dans le PDF (exportées par pdfjs-dist).
// Les embarquer dans le PDF évite à pdfjs-dist de devoir charger les
// polices "standard" (Helvetica...) au moment de la conversion PDF -> PNG.
const FONT_REGULAR_PATH = path.join(
  path.dirname(require.resolve("pdfjs-dist/package.json")),
  "standard_fonts/LiberationSans-Regular.ttf",
);
const FONT_BOLD_PATH = path.join(
  path.dirname(require.resolve("pdfjs-dist/package.json")),
  "standard_fonts/LiberationSans-Bold.ttf",
);

// ------------------------------------------------------------
// MAPPING (filière, niveau) -> fichier template dans public/
// ------------------------------------------------------------
// Codes utilisés :
//   - GL = "Génie logiciel"
//   - SR = "Système et réseau"
//   - SE = "Software engineering"
// Suffixe = niveau (2 ou 3).
// Seuls les fichiers réellement présents dans public/ fonctionnent.
// Ajoutez simplement le PDF dans public/ pour activer une combinaison.
const TEMPLATE_FILES = {
  GL2: "GL2-PDF.pdf",
  GL3: "GL3-PDF.pdf",
  SR2: "SR2-PDF.pdf",
  SR3: "SR3-PDF.pdf",
  SE2: "SE2-PDF.pdf",
  SE3: "SE3-PDF.pdf",
};

// ------------------------------------------------------------
// POSITIONS DES ÉLÉMENTS SUR LA CARTE
// ------------------------------------------------------------
// Système de coordonnées : ORIGINE EN HAUT À GAUCHE.
//   x = distance depuis le bord gauche (pts)
//   y = distance depuis le bord haut    (pts)
// Page : 259.2 pts (largeur) x 363.84 pts (hauteur).
//
// Pour la photo :  x, y (coin haut-gauche), w, h (largeur, hauteur fixes).
//   mode = "cover"   : la photo remplit EXACTEMENT w × h (recadrée au centre
//                      puis redimensionnée, jamais déformée).
//   mode = "contain" : la photo entière est visible dans w × h (bandes vides).
// Pour le texte :  x, y (début du texte), size (taille de police).
//
// Modifiez ces valeurs pour ajuster le rendu de CHAQUE carte.
// Les champs absents d'une carte héritent de "default".
const POSITIONS = {
  default: {
    photo: { x: 17, y: 105, w: 125, h: 111, mode: "cover" },
    nom: { x: 163, y: 145, size: 6, couleur: [1, 1, 1] },
    theme: { x: 22, y: 253, size: 8, couleur: [1, 1, 1] },
    jour: { x: 55, y: 294, size: 9, gras: true, couleur: [1, 1, 1] },
    heure: { x: 128, y: 294, size: 9, gras: true, couleur: [1, 1, 1] },
    salle: { x: 202, y: 294, size: 9, gras: true, couleur: [1, 1, 1] },
    encadreurAcademique: { x: 15, y: 328, size: 5, couleur: [1, 1, 1] },
    encadreurProfessionnel: { x: 180, y: 328, size: 5, couleur: [1, 1, 1] },
  },
  GL3: {
    // À ajuster selon la mise en page réelle de GL3-PDF.pdf
  },
  SR3: {
    // À ajuster selon la mise en page réelle de SR3-PDF.pdf
  },
};

// Ordre d'affichage des champs texte.
const CHAMPS_TEXTE = ["nom", "theme", "jour", "heure", "salle", "encadreurAcademique", "encadreurProfessionnel"];

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

// Récupère la configuration d'une carte en héritant de "default".
const positionsPour = (code) => ({
  ...POSITIONS.default,
  ...(POSITIONS[code] || {}),
});

// Normalise la filière en code (GL / SR / SE).
const normaliserFiliere = (filiere) => {
  const map = {
    "génie logiciel": "GL",
    "genie logiciel": "GL",
    "système et réseau": "SR",
    "systeme et reseau": "SR",
    "software engineering": "SE",
  };
  return map[String(filiere || "").trim().toLowerCase()] || null;
};

// Normalise le niveau en "2", "3", etc.
const normaliserNiveau = (niveau) => {
  const s = String(niveau || "").trim().toLowerCase();
  if (/3/.test(s)) return "3";
  if (/2/.test(s)) return "2";
  if (/5/.test(s)) return "5";
  if (/4/.test(s)) return "4";
  if (/1/.test(s)) return "1";
  return null;
};

// Résout le chemin du template PDF pour une (filière, niveau) données.
const resoudreTemplate = (filiere, niveau) => {
  const codeFiliere = normaliserFiliere(filiere);
  const niveauNormalise = normaliserNiveau(niveau);
  if (!codeFiliere || !niveauNormalise) {
    throw new ErreurMetier(`Filière ou niveau invalide (filière="${filiere}", niveau="${niveau}").`, 400);
  }
  const code = codeFiliere + niveauNormalise;
  const fichier = TEMPLATE_FILES[code];
  const chemin = path.join(__dirname, "../public", fichier || `${code}-PDF.pdf`);
  if (!fs.existsSync(chemin)) {
    throw new ErreurMetier(
      `Aucun modèle de carte disponible pour ${filiere} / ${niveau}. Ajoutez le fichier ${path.basename(chemin)} dans public/.`,
      404,
    );
  }
  return { code, fichier, chemin };
};

// Calcule le rectangle "contain" d'une image dans une zone (mode contain = image entière visible).
const fitContain = (imgW, imgH, boxW, boxH) => {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const dx = (boxW - w) / 2;
  const dy = (boxH - h) / 2;
  return { dx, dy, w, h };
};

// Coupe un texte en lignes qui tiennent dans maxWidth (points).
const envelopperTexte = (texte, font, size, maxWidth) => {
  const mots = String(texte || "").split(/\s+/).filter(Boolean);
  const lignes = [];
  let ligne = "";
  for (const mot of mots) {
    const test = ligne ? `${ligne} ${mot}` : mot;
    if (ligne && font.widthOfTextAtSize(test, size) > maxWidth) {
      lignes.push(ligne);
      ligne = mot;
    } else {
      ligne = test;
    }
  }
  if (ligne) lignes.push(ligne);
  return lignes;
};

// Convertit un PDF (bytes) en image PNG via pdfjs-dist + @napi-rs/canvas.
// Les polices étant embarquées dans le PDF (voir FONT_*_PATH), aucun
// chargement externe de police n'est nécessaire ici.
async function renderPdfVersPng(pdfBytes, scale = RENDER_SCALE) {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");
    await page.render({
      canvasContext: ctx,
      viewport,
      canvasFactory: {
        create: async (w, h) => {
          const c = createCanvas(w, h);
          return { canvas: c, context: c.getContext("2d") };
        },
        reset: async (c, w, h) => {
          c.canvas.width = w;
          c.canvas.height = h;
          c.context = c.canvas.getContext("2d");
        },
        destroy: async (c) => {
          c.canvas.width = 0;
          c.canvas.height = 0;
          c.context = null;
        },
      },
    }).promise;
    return canvas.toBuffer("image/png");
  } finally {
    // pdfjs-dist v6+ : la méthode de libération s'appelle cleanup() (destroy() a été retirée).
    await doc.cleanup();
  }
}

// ------------------------------------------------------------
// CLASSE PRINCIPALE
// ------------------------------------------------------------

class PhotoService {
  constructor() {
    this.uploadDir = path.join(__dirname, "../uploads/photos");
  }

  // Sauvegarder une photo
  async savePhoto(file) {
    try {
      // Vérifier que le fichier existe
      if (!file) {
        throw new Error("Aucun fichier à sauvegarder");
      }

      // Récupérer les informations du fichier
      const photoData = {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/photos/${file.filename}`,
      };

      return {
        success: true,
        data: photoData,
      };
    } catch (error) {
      console.error("Erreur dans le service:", error);
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  // Vérifier si un fichier est valide
  async validatePhoto(file) {
    if (!file) {
      return { valid: false, error: "Aucun fichier fourni" };
    }

    // Vérifier la taille (déjà fait par Multer)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: "Fichier trop volumineux (max 5MB)" };
    }

    // Vérifier le type MIME
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
      return { valid: false, error: "Format d'image non supporté" };
    }

    return { valid: true };
  }

  // ------------------------------------------------------------
  // GÉNÉRATION DE LA CARTE DE SOUTENANCE
  // ------------------------------------------------------------
  // `file`    : req.file (photo uploadée via multer)
  // `donnees` : {
  //   nom, filiere, niveau,               (issus du token de paiement)
  //   theme, jour, heure, salle,          (champs du formulaire)
  //   encadreurAcademique, encadreurProfessionnel
  // }
  // Retour : { apercuBase64, url, filename }
  async genererCarte({ file, donnees }) {
    try {
      // ----- 1. Validations -----
      if (!file || !fs.existsSync(file.path)) {
        throw new ErreurMetier("Aucune photo fournie pour la carte.", 400);
      }

      const champsRequis = ["nom", "theme", "jour", "heure", "salle", "encadreurAcademique", "encadreurProfessionnel"];
      const manquants = champsRequis.filter((c) => !String(donnees?.[c] || "").trim());
      if (manquants.length) {
        throw new ErreurMetier(`Champs obligatoires manquants : ${manquants.join(", ")}.`, 400);
      }

      // ----- 2. Choix du template selon (filière, niveau) -----
      const { code, chemin } = resoudreTemplate(donnees.filiere, donnees.niveau);
      const positions = positionsPour(code);

      // ----- 3. Chargement du template PDF -----
      const templateBytes = fs.readFileSync(chemin);
      const doc = await PDFDocument.load(templateBytes);
      const page = doc.getPages()[0];
      // Necessaire pour embarquer des polices TTF custom (fontkit de pdf-lib).
      doc.registerFontkit(fontkit);
      // Polices TTF embarquées (subsetting automatique par pdf-lib).
      // Supportent les accents français (à, é, è, ç, ...).
      const font = await doc.embedFont(fs.readFileSync(FONT_REGULAR_PATH));
      const fontBold = await doc.embedFont(fs.readFileSync(FONT_BOLD_PATH));

      // ----- 4. Photo du candidat -----
      if (positions.photo) {
        const mode = positions.photo.mode || "contain";
        if (mode === "cover") {
          // Dimensions FIXES (w × h) : la photo est recadrée au centre puis
          // redimensionnée pour remplir exactement la zone, sans distorsion.
          const png = await this._photoRemplitBoite(file.path, positions.photo.w, positions.photo.h);
          const image = await page.doc.embedPng(png);
          // pdf-lib utilise une origine BAS-GAUCHE : on convertit y depuis le haut.
          const yPdf = PAGE_HEIGHT - positions.photo.y - positions.photo.h;
          page.drawImage(image, { x: positions.photo.x, y: yPdf, width: positions.photo.w, height: positions.photo.h });
        } else {
          // Mode "contain" : image entière visible (bandes vides éventuelles).
          const image = await this._embarquerPhoto(page, file.path);
          const { w, h, dx, dy } = fitContain(image.width, image.height, positions.photo.w, positions.photo.h);
          // pdf-lib utilise une origine BAS-GAUCHE : on convertit y depuis le haut.
          const yPdf = PAGE_HEIGHT - positions.photo.y - positions.photo.h + dy;
          page.drawImage(image, { x: positions.photo.x + dx, y: yPdf, width: w, height: h });
        }
      }

      // ----- 5. Champs texte -----
      for (const champ of CHAMPS_TEXTE) {
        const pos = positions[champ];
        if (!pos) continue;
        const valeur = String(donnees[champ] || "").trim();
        if (!valeur) continue;
        this._dessinerChamp(page, champ, valeur, pos, font, fontBold);
      }

      // ----- 6. Export du PDF rempli (mémoire) puis conversion en PNG -----
      const pdfBytes = await doc.save();
      const pngBytes = await renderPdfVersPng(pdfBytes);

      // ----- 7. Sauvegarde de l'image sur disque -----
      fs.mkdirSync(CARTES_DIR, { recursive: true });
      const filename = `carte-${Date.now()}.png`;
      fs.writeFileSync(path.join(CARTES_DIR, filename), pngBytes);

      return {
        apercuBase64: `data:image/png;base64,${pngBytes.toString("base64")}`,
        url: `/uploads/cartes/${filename}`,
        filename,
      };
    } catch (error) {
      throw error;
    }
  }

  // Recadre (au centre) puis redimensionne la photo pour remplir EXACTEMENT
  // la zone w × h (en pts), sans déformer l'image (mode "cover").
  // Retour : octets PNG de la photo redimensionnée.
  async _photoRemplitBoite(filePath, w, h) {
    const source = await loadImage(filePath);
    const cw = Math.max(1, Math.round(w * PHOTO_SCALE));
    const ch = Math.max(1, Math.round(h * PHOTO_SCALE));
    const canvas = createCanvas(cw, ch);
    const ctx = canvas.getContext("2d");
    // Scale "cover" : on remplit tout le canvas en conservant les proportions.
    const scale = Math.max(cw / source.width, ch / source.height);
    const sw = source.width * scale;
    const sh = source.height * scale;
    const dx = Math.round((cw - sw) / 2);
    const dy = Math.round((ch - sh) / 2);
    ctx.drawImage(source, dx, dy, sw, sh);
    // Copie des octets (byteOffset 0) : pdf-lib lit le ArrayBuffer brut.
    return Uint8Array.from(canvas.toBuffer("image/png"));
  }

  // Détecte le format réel d'une image depuis ses octets (magic bytes).
  // On ne se fie PAS au mimetype déclaré par le client (souvent erroné).
  // Retour : "png", "jpeg", "webp" ou null (format inconnu).
  _detecterFormat(bytes) {
    if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 &&
      bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a &&
      bytes[6] === 0x1a && bytes[7] === 0x0a
    ) return "png";
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
    if (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    ) return "webp";
    return null;
  }

  // Décode une image via @napi-rs/canvas puis l'embarque en PNG.
  // Utilisé pour les formats que pdf-lib ne sait pas embarquer nativement
  // (webp, avif, ...) ou quand l'encodage natif échoue (jpeg exotique).
  async _decoderVersPng(page, filePath) {
    try {
      const image = await loadImage(filePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      return page.doc.embedPng(canvas.toBuffer("image/png"));
    } catch (error) {
      throw new ErreurMetier(`Impossible de lire cette photo (${error.message}).`, 400);
    }
  }

  // Embarrque la photo dans le PDF. Le format réel est détecté depuis le
  // contenu du fichier (pas le mimetype) pour éviter les erreurs
  // "SOI not found in JPEG" quand un client envoie un PNG en image/jpeg.
  async _embarquerPhoto(page, filePath) {
    const bytes = fs.readFileSync(filePath);
    const format = this._detecterFormat(bytes);

    // pdf-lib lit le ArrayBuffer sous-jacent SANS tenir compte du byteOffset
    // (fs.readFileSync renvoie une vue dans un pool mémoire de 64 Ko).
    // On copie donc les octets dans un tableau dédié (byteOffset 0) avant
    // l'embarrage, sinon pdf-lib jette "SOI not found in JPEG" sur de vrais JPEG.
    const data = Uint8Array.from(bytes);

    switch (format) {
      case "png":
        return page.doc.embedPng(data);
      case "jpeg":
        try {
          return page.doc.embedJpg(data);
        } catch {
          // JPEG non supporté par pdf-lib (CMYK, progressif, ...) : re-encodage via canvas.
          return this._decoderVersPng(page, filePath);
        }
      case "webp":
        return this._decoderVersPng(page, filePath);
      default:
        return this._decoderVersPng(page, filePath);
    }
  }

  // Dessine un champ texte, avec retour à la ligne automatique.
  _dessinerChamp(page, champ, valeur, pos, font, fontBold) {
    const police = pos.gras || champ === "nom" ? fontBold : font;
    const maxWidth = PAGE_WIDTH - pos.x - 15;
    const lignes = envelopperTexte(valeur, police, pos.size, maxWidth);
    const couleur = rgb(...(pos.couleur || [1, 1, 1]));
    const interLigne = pos.size * 1.3;

    lignes.forEach((ligne, i) => {
      // Origine pdf = bas-gauche. pos.y est le haut de la 1re ligne.
      const yPdf = PAGE_HEIGHT - pos.y - pos.size * 0.8 - i * interLigne;
      page.drawText(ligne, {
        x: pos.x,
        y: yPdf,
        size: pos.size,
        font: police,
        color: couleur,
      });
    });
  }
}

export default new PhotoService();
