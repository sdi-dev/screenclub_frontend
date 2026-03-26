import PageLegal from "@components/ui/PageLegal.jsx";

const sections = [
    {
        heading: "Acceptation des conditions",
        content: (
            <p>
                En accédant à <strong>ScreenClub</strong> et en créant un compte, vous acceptez sans réserve les présentes
                Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, vous devez cesser d'utiliser
                la plateforme. ScreenClub se réserve le droit de modifier ces CGU à tout moment ; toute modification sera
                notifiée par e-mail et/ou par une notification in-app.
            </p>
        ),
    },
    {
        heading: "Description du service",
        content: (
            <>
                <p>
                    ScreenClub est une plateforme communautaire permettant à ses membres de :
                </p>
                <ul>
                    <li>Noter et critiquer des films, séries et animés.</li>
                    <li>Créer et partager des watchlists personnalisées.</li>
                    <li>Suivre les activités d'autres membres et interagir avec la communauté.</li>
                    <li>Recevoir des recommandations basées sur leurs préférences.</li>
                </ul>
                <p>
                    ScreenClub est un service d'agrégation d'opinions et ne propose pas de streaming ni de téléchargement de
                    contenus audiovisuels.
                </p>
            </>
        ),
    },
    {
        heading: "Création de compte",
        content: (
            <>
                <p>
                    L'accès à certaines fonctionnalités nécessite la création d'un compte. Vous vous engagez à :
                </p>
                <ul>
                    <li>Fournir des informations exactes et à jour lors de l'inscription.</li>
                    <li>Maintenir la confidentialité de vos identifiants de connexion.</li>
                    <li>Notifier immédiatement ScreenClub de toute utilisation non autorisée de votre compte.</li>
                    <li>Ne pas créer de compte au nom d'un tiers sans son consentement explicite.</li>
                </ul>
                <p>
                    Vous devez être âgé d'au moins <strong>13 ans</strong> pour créer un compte. Les mineurs de moins de 16 ans
                    doivent obtenir le consentement d'un parent ou tuteur légal.
                </p>
            </>
        ),
    },
    {
        heading: "Règles de conduite",
        content: (
            <>
                <p>En utilisant ScreenClub, vous vous engagez à ne pas :</p>
                <ul>
                    <li>Publier des contenus haineux, discriminatoires, diffamatoires ou illicites.</li>
                    <li>Harceler, menacer ou intimider d'autres membres.</li>
                    <li>Diffuser des informations fausses ou trompeuses (spoilers non signalés inclus).</li>
                    <li>Utiliser des bots, scripts ou outils automatisés pour interagir avec la plateforme.</li>
                    <li>Tenter de contourner les mesures de sécurité ou d'accéder à des données non autorisées.</li>
                    <li>Reproduire, vendre ou exploiter commercialement le contenu de la plateforme sans autorisation écrite.</li>
                </ul>
            </>
        ),
    },
    {
        heading: "Contenu utilisateur",
        content: (
            <p>
                Vous conservez la propriété intellectuelle de vos avis, notes et contenus publiés sur ScreenClub. En les
                publiant, vous accordez à ScreenClub une <strong>licence mondiale, non exclusive, gratuite et transférable</strong>{" "}
                pour utiliser, reproduire, modifier, distribuer et afficher ces contenus dans le cadre de l'exploitation
                du service. ScreenClub ne revendique aucun droit de propriété sur vos créations originales.
            </p>
        ),
    },
    {
        heading: "Modération",
        content: (
            <p>
                ScreenClub se réserve le droit de supprimer tout contenu enfreignant ces CGU, sans préavis ni compensation.
                En cas de violation grave ou répétée, le compte concerné pourra être suspendu ou définitivement supprimé.
                Un système de signalement communautaire est disponible pour tout contenu inapproprié. Les décisions de
                modération peuvent faire l'objet d'un recours en contactant{" "}
                <a href="mailto:moderation@screenclub.fr">moderation@screenclub.fr</a>.
            </p>
        ),
    },
    {
        heading: "Propriété intellectuelle",
        content: (
            <p>
                L'ensemble des éléments constitutifs de ScreenClub — logo, charte graphique, architecture technique, base de
                données, algorithmes de recommandation — est la propriété exclusive de SAS ScreenClub et est protégé par le
                droit de la propriété intellectuelle. Toute reproduction partielle ou totale sans autorisation préalable
                écrite est strictement interdite.
            </p>
        ),
    },
    {
        heading: "Limitation de responsabilité",
        content: (
            <p>
                ScreenClub est fourni <strong>« en l'état »</strong>, sans garantie d'aucune sorte. Nous ne saurions être
                tenus responsables des interruptions de service, pertes de données, dommages indirects ou manques à gagner
                résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme. ScreenClub décline également toute
                responsabilité quant à l'exactitude des informations publiées par les membres.
            </p>
        ),
    },
    {
        heading: "Résiliation",
        content: (
            <p>
                Vous pouvez clôturer votre compte à tout moment depuis les paramètres de votre profil. ScreenClub peut
                résilier votre accès sans préavis en cas de violation des présentes CGU. Après résiliation, vos données
                seront traitées conformément à notre{" "}
                <a href="/politique-de-confidentialite">Politique de confidentialité</a>.
            </p>
        ),
    },
    {
        heading: "Droit applicable",
        content: (
            <p>
                Les présentes CGU sont régies par le <strong>droit français</strong>. En cas de litige, une solution amiable
                sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront seuls compétents.
            </p>
        ),
    },
];

function ConditionsGeneralesUtilisation() {
    return (
        <PageLegal
            title="Conditions d'utilisation"
            description="Ces conditions définissent les règles d'accès et d'usage de la plateforme ScreenClub. Merci de les lire attentivement avant d'utiliser nos services."
            lastUpdated="20 mars 2025"
            sections={sections}
        />
    );
}

export default ConditionsGeneralesUtilisation;