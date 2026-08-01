import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  throw new Error("Veuillez renseigner la clé API Resend.");
}
const FROM = process.env.FROM;
if (!FROM) {
  throw new Error("Veuillez renseigner l'expéditeur.");
}

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({to, subject, html}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    return console.error({ error });
  }

  // console.log("Email envoyé : ", data);
}

export function confirmationEmail ({nom, classe, matricule, filiere, transacId, montant}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Confirmation de paiement</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
            rel="stylesheet">

        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                background: #F4F5F7;
                font-family: "Outfit", sans-serif;
                color: #444;
                padding: 40px 15px;
            }

            .container {
                max-width: 700px;
                margin: auto;
                background: #FFFFFF;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 12px 35px rgba(0, 0, 0, .08);
            }

            /* ================= HEADER ================= */

            .header {
                background: #FFFFFF;
                text-align: center;
                padding: 45px 45px 35px;
                border-bottom: 1px solid #ECECEC;
            }

            .logo {
                width: 95px;
                margin-bottom: 20px;
            }

            .institution {
                font-size: 28px;
                font-weight: 700;
                color: #0C7A43;
                line-height: 1.35;
                margin-bottom: 12px;
            }

            .subtitle {
                font-size: 15px;
                font-weight: 300;
                color: #6B7280;
                letter-spacing: .3px;
            }

            /* ================= CONTENT ================= */

            .content {
                padding: 45px;
            }

            .badge {
                width: 74px;
                height: 74px;
                border-radius: 50%;
                background: #0C7A43;
                color: white;
                margin: auto;
                text-align: center;
                line-height: 74px;
                font-size: 38px;
                font-weight: 600;
            }

            h2 {
                margin: 28px 0 20px;
                text-align: center;
                color: #0C7A43;
                font-size: 30px;
                font-weight: 600;
            }

            p {
                font-size: 16px;
                line-height: 1.9;
                font-weight: 300;
                color: #555;
                margin-bottom: 18px;
            }

            strong {
                font-weight: 600;
                color: #222;
            }

            .details {
                width: 100%;
                margin: 40px 0;
                border-collapse: collapse;
                border: 1px solid #EEEEEE;
                border-radius: 8px;
                overflow: hidden;
            }

            .details td {
                padding: 18px;
                border-bottom: 1px solid #EEEEEE;
                font-size: 15px;
            }

            .details tr:last-child td {
                border-bottom: none;
            }

            .details td:first-child {
                width: 38%;
                background: #FAFAFA;
                font-weight: 500;
                color: #444;
            }

            .details td:last-child {
                font-weight: 400;
                color: #555;
            }

            .amount {
                color: #0C7A43;
                font-size: 24px;
                font-weight: 700 !important;
            }

            .notice {
                margin-top: 35px;
                background: #F8F8F8;
                border-radius: 10px;
                padding: 22px;
            }

            .notice strong {
                display: block;
                margin-bottom: 10px;
                color: #0C7A43;
                font-weight: 600;
            }

            .signature {
                margin-top: 35px;
            }

            .signature p {
                margin-bottom: 5px;
            }

            /* ================= FOOTER ================= */

            .footer {
                background: #FAFAFA;
                border-top: 1px solid #ECECEC;
                text-align: center;
                padding: 35px;
            }

            .footer .name {
                color: #0C7A43;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }

            .footer .department {
                color: #555;
                font-size: 15px;
                font-weight: 400;
                margin-bottom: 25px;
            }

            .footer hr {
                border: none;
                border-top: 1px solid #DDDDDD;
                margin: 25px auto;
                width: 85%;
            }

            .footer p {
                margin: 0;
                color: #666;
                font-size: 14px;
                line-height: 1.9;
                font-weight: 300;
            }

            .footer .copyright {
                margin-top: 18px;
                color: #0C7A43;
                font-weight: 500;
            }

            @media (max-width:600px) {

                .content,
                .header,
                .footer {
                    padding: 25px;
                }

                .institution {
                    font-size: 22px;
                }

                h2 {
                    font-size: 25px;
                }

                .details td {
                    display: block;
                    width: 100%;
                }

                .details td:first-child {
                    border-bottom: none;
                }

            }
        </style>

    </head>

    <body>

        <div class="container">

            <!-- HEADER -->

            <div class="header">

                <img src="https://i.ibb.co/S7sxQ9jQ/iai.jpg"
                    class="logo"
                    alt="Institut Africain d'Informatique">

                <div class="institution">
                    Institut Africain d'Informatique<br>
                    Centre d'Excellence Technologique Paul Biya
                </div>

                <div class="subtitle">
                    Confirmation de paiement des frais de soutenance
                </div>

            </div>

            <!-- CONTENT -->

            <div class="content">

                <div class="badge">
                    ✓
                </div>

                <h2>Paiement confirmé</h2>

                <p>
                    Bonjour <strong>${nom}</strong>,
                </p>

                <p>
                    Nous avons le plaisir de vous informer que le paiement relatif à vos
                    <strong>frais de soutenance</strong> a été reçu et enregistré avec succès.
                </p>

                <table class="details">

                    <tr>
                        <td>Nom complet</td>
                        <td>${nom}</td>
                    </tr>

                    <tr>
                        <td>Matricule</td>
                        <td>${matricule}</td>
                    </tr>

                    <tr>
                        <td>Classe</td>
                        <td>${classe}</td>
                    </tr>

                    <tr>
                        <td>Filière</td>
                        <td>${filiere}</td>
                    </tr>

                    <tr>
                        <td>Numéro de transaction</td>
                        <td>${transacId}</td>
                    </tr>

                    <tr>
                        <td>Montant acquitté</td>
                        <td class="amount">${montant} FCFA</td>
                    </tr>

                </table>

                <div class="notice">

                    <strong>Information importante</strong>

                    <p>
                        Cet email constitue une confirmation officielle de
                        votre paiement. Nous vous recommandons de le conserver, car il
                        pourra vous être demandé lors des différentes étapes administratives
                        liées à votre soutenance.
                    </p>

                </div>

                <div class="signature">

                    <p>
                        Nous vous remercions pour votre confiance et vous souhaitons plein
                        succès dans la préparation de votre soutenance.
                    </p>

                    <p>
                        <strong>L'Administration</strong><br>
                        Institut Africain d'Informatique – Centre d'Excellence Technologique
                        Paul Biya
                    </p>

                </div>

            </div>

            <!-- FOOTER -->

            <div class="footer">

                <div class="name">
                    Institut Africain d'Informatique
                </div>

                <div class="department">
                    Centre d'Excellence Technologique Paul Biya
                </div>

                <hr>

                <p>
                    Direction des Affaires Académiques<br>
                    Service de la Comptabilité et des Finances<br>
                    Le comité des étudiants 2026 - IAI Synergy
                </p>

                <br>

                <p>
                    Cet email a été généré automatiquement.
                    Merci de ne pas répondre directement à ce message.
                </p>

                <br>

                <p>
                    Pour toute information complémentaire ou réclamation, veuillez
                    contacter l'administration de votre centre.
                </p>

                <div class="copyright">
                    © 2026 Institut Africain d'Informatique – Centre d'Excellence
                    Technologique Paul Biya
                </div>

            </div>

        </div>

    </body>

    </html> 
`;
};

export function activationEmail ({email, nom}) {
    return `
        <p>Bonjour <strong>Admin</strong>,</p>

        <p>
            Un nouvel administrateur a été ajouté sur <strong>Synergy-Pay</strong> et attend votre validation.
        </p>

        <p>
            Merci de vérifier et de confirmer l'autorisation du compte ayant les coordonnées suivantes :
        </p>

        <p style="font-size:16px; font-weight:bold; color:#333;">
            email : ${email}
        </p>
        <p style="font-size:16px; font-weight:bold; color:#333;">
            nom : ${nom}
        </p>

        <p>
            Si vous n'êtes pas à l'origine de cette demande ou si vous pensez qu'il s'agit d'une erreur,
            veuillez ne pas valider ce compte..
        </p>

        <p>
            Cordialement,<br>
            <strong>L'équipe Synergy Pay</strong>
        </p>
    `;
};
