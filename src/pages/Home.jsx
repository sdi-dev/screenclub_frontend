import { useEffect, useState } from "react";
import FeaturesSection from "@components/ui/FeaturesSection.jsx";
import CtaForm from "@components/ui/CtaForm.jsx";
import Hero2 from "@components/ui/Hero2.jsx";
import BlobsBackground from "@components/layout/BlobsBackground.jsx";

function Home() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            setScrollProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative bg-base-100">
            <BlobsBackground fixed progress={scrollProgress} />

            <div className="relative" style={{ zIndex: 1 }}>
                <Hero2 />
                <FeaturesSection />
                <CtaForm />
            </div>
        </div>
    );
}

export default Home;
