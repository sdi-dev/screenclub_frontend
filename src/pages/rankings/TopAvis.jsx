import GridBackground from "@components/layout/GridBackground.jsx";

function TopAvis() {
    return (
        <>
            <section id="top_banner">
                <div className="h-32 lg:h-48 grid grid-rows-2 justify-center items-center w-full">
                    <GridBackground />
                    <h1 className="text-3xl lg:text-5xl font-unbounded font-semibold">Top des Avis</h1>
                    <p className="italic text-primary-content">De la semaine</p>
                </div>
            </section>
        </>
    )
}

export default TopAvis;