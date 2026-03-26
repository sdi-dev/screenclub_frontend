import PageLegal from "@components/ui/PageLegal.jsx";

export default function MentionsLegales() {
    return (
        <>
            <PageLegal
                title="Mentions légales"
                description="Informations légales relatives à l'exploitation du site ScreenClub."
                lastUpdated="20 mars 2025"
                sections={[
                    { heading: "Éditeur du site", content: "SAS ScreenClub, RCS Paris..." },
                    { heading: "Hébergement", content: <p>Hébergé par <a href="#">Vercel</a></p> },
                    { heading: "Propriété intellectuelle", content: "..." },
                ]}
            />
        </>
    )
}