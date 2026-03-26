import PageLegal from "@components/ui/PageLegal.jsx";

const sections = [
    {
        heading: "Introduction",
        content: (
            <p>
                Chez <strong>ScreenClub</strong>, la confidentialité de nos membres est une priorité absolue. Cette politique
                explique de façon transparente quelles informations nous collectons, pourquoi nous les collectons, comment
                nous les utilisons et les protégeons, et quels choix vous avez à leur sujet. Elle s'applique à l'ensemble
                de nos services : site web, application mobile et API.
            </p>
        ),
    },
    {
        heading: "Informations que nous collectons",
        content: (
            <>
                <p>Nous collectons les informations suivantes :</p>
                <ul>
                    <li>
                        <strong>Informations que vous nous fournissez :</strong> adresse e-mail, nom d'utilisateur, photo
                        de profil, biographie, préférences de genres cinématographiques.
                    </li>
                    <li>
                        <strong>Informations générées par votre activité :</strong> notes attribuées, avis rédigés, watchlists
                        créées, films marqués comme vus, interactions sociales (abonnements, likes).
                    </li>
                    <li>
                        <strong>Informations techniques :</strong> adresse IP, identifiant de session, type et version
                        du navigateur, système d'exploitation, résolution d'écran, langue.
                    </li>
                    <li>
                        <strong>Informations de navigation :</strong> pages consultées, durée des visites, liens cliqués,
                        requêtes de recherche effectuées sur la plateforme.
                    </li>
                </ul>
            </>
        ),
    },
    {
        heading: "Comment nous utilisons vos informations",
        content: (
            <>
                <p>Vos informations nous servent exclusivement à :</p>
                <ul>
                    <li>Faire fonctionner, maintenir et améliorer la plateforme.</li>
                    <li>Personnaliser votre fil d'actualité et vos recommandations.</li>
                    <li>Vous envoyer des communications essentielles (sécurité, modifications de compte).</li>
                    <li>Vous envoyer des communications marketing, <strong>uniquement avec votre consentement</strong>.</li>
                    <li>Détecter et prévenir les fraudes, abus et violations de nos CGU.</li>
                    <li>Respecter nos obligations légales et réglementaires.</li>
                </ul>
                <p>
                    Nous <strong>ne vendons jamais</strong> vos données personnelles à des tiers.
                </p>
            </>
        ),
    },
    {
        heading: "Partage des informations",
        content: (
            <>
                <p>Vos données peuvent être partagées dans les cas suivants :</p>
                <ul>
                    <li>
                        <strong>Prestataires de services :</strong> hébergement (Vercel), base de données (Supabase),
                        e-mailing transactionnel (Resend). Ces prestataires agissent en tant que sous-traitants et ne
                        peuvent utiliser vos données qu'aux fins définies par ScreenClub.
                    </li>
                    <li>
                        <strong>Obligations légales :</strong> si la loi l'exige ou en réponse à une demande judiciaire valide.
                    </li>
                    <li>
                        <strong>Protection des droits :</strong> pour protéger la sécurité de nos membres ou prévenir
                        une activité illégale.
                    </li>
                    <li>
                        <strong>Transfert d'entreprise :</strong> en cas de fusion ou acquisition, vos données seraient
                        transférées au repreneur, qui serait alors soumis à cette politique.
                    </li>
                </ul>
            </>
        ),
    },
    {
        heading: "Cookies et technologies similaires",
        content: (
            <>
                <p>Nous utilisons trois catégories de cookies :</p>
                <ul>
                    <li>
                        <strong>Cookies essentiels :</strong> indispensables au fonctionnement de la plateforme
                        (session, authentification, préférences de thème). Ils ne peuvent pas être désactivés.
                    </li>
                    <li>
                        <strong>Cookies analytiques :</strong> nous aident à comprendre comment la plateforme est
                        utilisée (Plausible Analytics, solution sans cookies tiers). Activés par défaut, désactivables.
                    </li>
                    <li>
                        <strong>Cookies de personnalisation :</strong> mémorisent vos préférences pour améliorer
                        votre expérience. Soumis à votre consentement.
                    </li>
                </ul>
                <p>
                    Vous pouvez gérer vos préférences à tout moment via notre{" "}
                    <a href="/cookies">Gestionnaire de cookies</a>.
                </p>
            </>
        ),
    },
    {
        heading: "Sécurité des données",
        content: (
            <p>
                Nous appliquons des mesures de sécurité techniques et organisationnelles conformes aux standards de
                l'industrie : chiffrement des données en transit (<strong>TLS 1.3</strong>), hachage des mots de passe
                (<strong>bcrypt</strong>), accès aux données restreint au strict nécessaire (principe du moindre privilège),
                audits de sécurité réguliers et journalisation des accès. En cas de violation de données, vous serez notifié
                dans les <strong>72 heures</strong> conformément au RGPD.
            </p>
        ),
    },
    {
        heading: "Confidentialité des mineurs",
        content: (
            <p>
                ScreenClub n'est pas destiné aux enfants de moins de <strong>13 ans</strong>. Nous ne collectons pas
                sciemment de données personnelles concernant des enfants de moins de 13 ans. Si vous pensez qu'un mineur
                a créé un compte sans autorisation parentale, contactez-nous à{" "}
                <a href="mailto:privacy@screenclub.fr">privacy@screenclub.fr</a> afin que nous puissions supprimer
                les données concernées.
            </p>
        ),
    },
    {
        heading: "Liens externes",
        content: (
            <p>
                ScreenClub peut contenir des liens vers des sites tiers (bases de données cinématographiques, plateformes
                de streaming, réseaux sociaux). Cette politique de confidentialité ne s'applique pas à ces sites. Nous
                vous encourageons à consulter leurs politiques respectives avant de leur communiquer vos données.
            </p>
        ),
    },
    {
        heading: "Modifications de cette politique",
        content: (
            <p>
                Nous pouvons mettre à jour cette politique ponctuellement. En cas de modification substantielle, nous vous
                en informerons par e-mail et/ou par une notification visible sur la plateforme au moins <strong>15 jours</strong>{" "}
                avant l'entrée en vigueur des changements. La date de « dernière mise à jour » en haut de cette page
                indique la version en vigueur.
            </p>
        ),
    },
    {
        heading: "Nous contacter",
        content: (
            <p>
                Pour toute question relative à cette politique ou pour exercer vos droits, contactez notre équipe
                Confidentialité : <a href="mailto:privacy@screenclub.fr">privacy@screenclub.fr</a>. Notre délégué
                à la protection des données (DPO) est également disponible à{" "}
                <a href="mailto:dpo@screenclub.fr">dpo@screenclub.fr</a>. Nous nous engageons à répondre dans un
                délai de <strong>30 jours</strong>.
            </p>
        ),
    },
];

function Confidentialite() {
    return (
        <PageLegal
            title="Politique de confidentialité"
            description="Transparence totale sur la façon dont ScreenClub collecte, utilise et protège vos données personnelles. Votre vie privée n'est pas un accessoire — c'est un engagement."
            lastUpdated="20 mars 2025"
            sections={sections}
        />
    );
}

export default Confidentialite;