import Hero from "@/components/Hero";
import SeriesGrid from "@/components/SeriesGrid";
import SEO, { organizationJsonLd, websiteJsonLd } from "@/components/SEO";
import RolesGrid from "@/components/RolesGrid";
import ImageStrip from "@/components/ImageStrip";
import CoursesHighlight from "@/components/CoursesHighlight";
import About from "@/components/About";
import SignUpForm from "@/components/SignUpForm";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogIn, User, Inbox, Home } from "lucide-react";
import { useState, useEffect } from "react";
import SignUpBanner from "@/components/SignUpBanner";
import SignUpPopup, { useSignUpPopup } from "@/components/SignUpPopup";

/* Hand-drawn rounded pill - matches GlobalHomeButton / hero CTAs */
const LIME = "hsl(120, 100%, 45%)";
const SketchHomePill = ({ children }: { children: React.ReactNode }) => (
  <span className="relative inline-flex items-center hover:opacity-90 transition-opacity">
    <svg
      viewBox="0 0 140 52"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L114,49 C127,49 137,38 137,26 C138,14 127,3 114,3 Z"
        fill={LIME}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative inline-flex items-center gap-1.5 font-display font-900 text-xs md:text-sm tracking-wide uppercase text-foreground px-5 py-2.5 whitespace-nowrap">
      {children}
    </span>
  </span>
);

const Index = () => {
  const { user } = useAuth();
  const [showHome, setShowHome] = useState(false);
  const { open: popupOpen, close: closePopup } = useSignUpPopup(20000, !user);

  useEffect(() => {
    const target = document.body;
    const onScroll = () => setShowHome(target.scrollTop > 300);
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        path="/"
        jsonLd={[organizationJsonLd, websiteJsonLd]}
      />
      {showHome && (
        <header className="fixed top-0 left-0 z-50 p-3 md:p-6">
          <button
            onClick={() => document.body.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
          >
            <SketchHomePill>
              <Home className="w-4 h-4" strokeWidth={3} />
              Home
            </SketchHomePill>
          </button>
        </header>
      )}
      <Hero />
      <SeriesGrid />
      <RolesGrid />
      <ImageStrip />
      <CoursesHighlight />
      <About />
      <SignUpForm />
      <Footer />
      {!user && <SignUpBanner />}
      {!user && <SignUpPopup open={popupOpen} onClose={closePopup} />}
    </div>
  );
};

export default Index;
