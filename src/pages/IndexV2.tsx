import HeroEditorial from "@/components/HeroEditorial";
import SeriesGrid from "@/components/SeriesGrid";
import SEO, { organizationJsonLd, websiteJsonLd } from "@/components/SEO";
import RolesGrid from "@/components/RolesGrid";
import ImageStrip from "@/components/ImageStrip";
import CoursesHighlight from "@/components/CoursesHighlight";
import About from "@/components/About";
import SignUpForm from "@/components/SignUpForm";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";
import SignUpBanner from "@/components/SignUpBanner";
import SignUpPopup, { useSignUpPopup } from "@/components/SignUpPopup";

const IndexV2 = () => {
  const { user } = useAuth();
  const { open: popupOpen, close: closePopup } = useSignUpPopup(10000, !user);

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/home-v2" jsonLd={[organizationJsonLd, websiteJsonLd]} />
      <SiteNav />
      <HeroEditorial />
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

export default IndexV2;
