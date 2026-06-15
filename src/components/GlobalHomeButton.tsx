import { useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader";

/**
 * Renders the full SiteHeader on every route that doesn't already have its
 * own primary navigation. Pages that render SiteNav / SiteHeader themselves
 * are listed in skipRoutes to avoid stacking two bars.
 */
const GlobalHomeButton = () => {
  const { pathname } = useLocation();

  // These pages render their own full navigation header
  const skipRoutes = [
    "/",
    "/home-v2",
    "/feed",
    "/events",
    "/the-show",
    "/community",
    "/Community",
    "/community/members",
    "/members",
    "/Members",
    "/my-profile",
    "/my-profile-demo",
    "/my-jobs-demo",
    "/cv-builder",
    "/onboarding",
    "/videos",
    "/skills-passport",
    "/skill-course",
  ];
  if (skipRoutes.some(r => pathname === r || pathname.startsWith(r + "/"))) return null;

  return <SiteHeader overlay={false} showLogo />;
};

export default GlobalHomeButton;
