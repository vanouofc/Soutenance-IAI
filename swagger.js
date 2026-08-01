import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: 'API Soutenances IAI',
    description: 'API de collecte des frais de soutenance - Institut Africain d\'Informatique',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Entrez votre token JWT (ex: Bearer <token>)',
    },
  },
  definitions: {
    Utilisateur: {
      nom: 'TINGUEU Shivano',
      email: 'tingueushivano@example.com',
      password: '123456',
      phone: '6xxxxxxxx',
    },
    SignInBody: {
      email: 'tingueushivano@example.com',
      password: '123456',
    },
    Paiement: {
      nom: 'TINGUEU Shivano',
      email: 'tingueushivano@example.com',
      filiere: 'Génie logiciel',
      niveau: 3,
      classe: 'GL3A',
      matricule: 'IAI-2025-001',
      numero: '6xxxxxxxx',
      operateur: 'ORANGE',
    },
  },
  tags: [
    { name: 'Utilisateurs', description: 'Gestion des administrateurs' },
    { name: 'Paiements', description: 'Gestion des paiements Mobile Money' },
    { name: 'Photos', description: 'Upload de photos' },
  ],
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, routes, doc);
