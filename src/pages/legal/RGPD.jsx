import PageLegal from "@components/ui/PageLegal.jsx";

const sections = [
    {
        heading: "Responsable du traitement",
        content: (
            <>
                <p>
                    Le responsable du traitement des données personnelles collectées sur <strong>ScreenClub</strong> est :
                </p>
                <ul>
                    <li>Raison sociale : SAS ScreenClub</li>
                    <li>Siège social : 12 rue du Cinéma, 75001 Paris, France</li>
                    <li>Email : <a href="mailto:privacy@screenclub.fr">privacy@screenclub.fr</a></li>
                </ul>
            </>
        ),
    },
    {
        heading: "Données collectées",
        content: (
            <>
                <p>Dans le cadre de l'utilisation de ScreenClub, nous collectons les données suivantes :</p>
                <ul>
                    <li><strong>Données d'identification :</strong> nom d'utilisateur, adresse e-mail, mot de passe haché.</li>
                    <li><strong>Données d'utilisation :</strong> films notés, watchlists, avis publiés, historique de consultation.</li>
                    <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation, pages visitées.</li>
                    <li><strong>Données sociales :</strong> interactions avec d'autres membres (abonnements, partages).</li>
                </ul>
            </>
        ),
    },
    {
        heading: "Finalités du traitement",
        content: (
            <>
                <p>Vos données sont traitées pour les finalités suivantes :</p>
                <ul>
                    <li>Gestion de votre compte et authentification.</li>
                    <li>Personnalisation de votre expérience et recommandations.</li>
                    <li>Amélioration de nos services par analyse d'audience anonymisée.</li>
                    <li>Communication transactionnelle (confirmation d'inscription, réinitialisation de mot de passe).</li>
                    <li>Envoi de newsletters si vous y avez expressément consenti.</li>
                    <li>Respect de nos obligations légales.</li>
                </ul>
            </>
        ),
    },
    {
        heading: "Base légale",
        content: (
            <>
                <p>Chaque traitement repose sur une base légale conforme au RGPD :</p>
                <ul>
                    <li><strong>Exécution du contrat</strong> — pour la gestion de votre compte.</li>
                    <li><strong>Consentement</strong> — pour l'envoi de newsletters et les cookies non essentiels.</li>
                    <li><strong>Intérêt légitime</strong> — pour la sécurité de la plateforme et la prévention des fraudes.</li>
                    <li><strong>Obligation légale</strong> — pour la conservation de certains journaux d'accès.</li>
                </ul>
            </>
        ),
    },
    {
        heading: "Durée de conservation",
        content: (
            <p>
                Vos données de compte sont conservées pendant toute la durée d'activité de votre compte, puis supprimées
                dans un délai de <strong>30 jours</strong> suivant la clôture. Les données de navigation sont anonymisées
                après <strong>13 mois</strong>. Les données de facturation sont archivées pendant <strong>10 ans</strong>
                conformément aux obligations comptables légales.
            </p>
        ),
    },
    {
        heading: "Vos droits",
        content: (
            <>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul>
                    <li><strong>Droit d'accès</strong> — obtenir une copie de vos données.</li>
                    <li><strong>Droit de rectification</strong> — corriger des données inexactes.</li>
                    <li><strong>Droit à l'effacement</strong> — demander la suppression de vos données.</li>
                    <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.</li>
                    <li><strong>Droit d'opposition</strong> — vous opposer à certains traitements.</li>
                    <li><strong>Droit à la limitation</strong> — restreindre temporairement un traitement.</li>
                    <li><strong>Droit de retrait du consentement</strong> — à tout moment, sans effet rétroactif.</li>
                </ul>
                <p>
                    Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@screenclub.fr">privacy@screenclub.fr</a>.
                    Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.
                </p>
            </>
        ),
    },
    {
        heading: "Transferts hors UE",
        content: (
            <p>
                Certains de nos prestataires techniques (hébergement, analytics) peuvent être situés hors de l'Union européenne.
                Ces transferts sont encadrés par des <strong>clauses contractuelles types</strong> approuvées par la Commission
                européenne, garantissant un niveau de protection équivalent à celui exigé par le RGPD.
            </p>
        ),
    },
    {
        heading: "Contact & DPO",
        content: (
            <p>
                Notre délégué à la protection des données (DPO) est joignable à l'adresse :{" "}
                <a href="mailto:dpo@screenclub.fr">dpo@screenclub.fr</a>. Toute demande sera traitée dans un délai maximum
                de <strong>30 jours</strong>.
            </p>
        ),
    },
];

function Rgpd() {
    return (
        <PageLegal
            title="RGPD"
            description="Conformément au Règlement Général sur la Protection des Données (UE) 2016/679, cette page détaille la façon dont ScreenClub collecte, utilise et protège vos données personnelles."
            lastUpdated="20 mars 2025"
            sections={sections}
        />
    );
}

export default Rgpd;