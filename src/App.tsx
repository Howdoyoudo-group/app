import { lazy, Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import CareerAssistant from "@/components/CareerAssistant";
import HowdyTour from "@/components/HowdyTour";
import GlobalHomeButton from "@/components/GlobalHomeButton";
import TermsAcceptBanner from "@/components/TermsAcceptBanner";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

const ConditionalHowdy = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/howdy")) return null;
  return (
    <>
      <CareerAssistant />
      <HowdyTour />
    </>
  );
};

const ConditionalHomeButton = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/howdy")) return null;
  return <GlobalHomeButton />;
};
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";

// Only eagerly load the landing page; lazy-load everything else
import Index from "./pages/Index.tsx";
const IndexV2 = lazy(() => import("./pages/IndexV2.tsx"));
const FeedPage = lazy(() => import("./pages/FeedPage.tsx"));
const InboxPage = lazy(() => import("./pages/InboxPage.tsx"));
const EventsPage = lazy(() => import("./pages/EventsPage.tsx"));
const TheShowPage = lazy(() => import("./pages/TheShowPage.tsx"));
const HowdyApp = lazy(() => import("./pages/HowdyApp.tsx"));

const Beer = lazy(() => import("./pages/Beer.tsx"));
const Beauty = lazy(() => import("./pages/Beauty.tsx"));
const Cars = lazy(() => import("./pages/Cars.tsx"));
const Jobs = lazy(() => import("./pages/Jobs.tsx"));
const Coffee = lazy(() => import("./pages/Coffee.tsx"));
const Cinema = lazy(() => import("./pages/Cinema.tsx"));
const Music = lazy(() => import("./pages/Music.tsx"));
const Books = lazy(() => import("./pages/Books.tsx"));
const Grocery = lazy(() => import("./pages/Grocery.tsx"));
const Fashion = lazy(() => import("./pages/Fashion.tsx"));
const Hospitality = lazy(() => import("./pages/Hospitality.tsx"));
const Football = lazy(() => import("./pages/Football.tsx"));
const FootballBadge = lazy(() => import("./pages/FootballBadge.tsx"));
const Teaching = lazy(() => import("./pages/Teaching.tsx"));
const InteriorDesign = lazy(() => import("./pages/InteriorDesign.tsx"));
const Charity = lazy(() => import("./pages/Charity.tsx"));
const EstateAgency = lazy(() => import("./pages/EstateAgency.tsx"));
const Bakery = lazy(() => import("./pages/Bakery.tsx"));
const Footwear = lazy(() => import("./pages/Footwear.tsx"));
const Physiotherapy = lazy(() => import("./pages/Physiotherapy.tsx"));
const Politics = lazy(() => import("./pages/Politics.tsx"));
const Psychotherapy = lazy(() => import("./pages/Psychotherapy.tsx"));
const Wellness = lazy(() => import("./pages/Wellness.tsx"));
const Gaming = lazy(() => import("./pages/Gaming.tsx"));
const Influencing = lazy(() => import("./pages/Influencing.tsx"));
const Journalism = lazy(() => import("./pages/Journalism.tsx"));
const Jewellery = lazy(() => import("./pages/Jewellery.tsx"));
const Pets = lazy(() => import("./pages/Pets.tsx"));
const Travel = lazy(() => import("./pages/Travel.tsx"));
const Farming = lazy(() => import("./pages/Farming.tsx"));
const Money = lazy(() => import("./pages/Money.tsx"));
const Health = lazy(() => import("./pages/Health.tsx"));
const HorseRacing = lazy(() => import("./pages/HorseRacing.tsx"));
const Formula1 = lazy(() => import("./pages/Formula1.tsx"));
const Building = lazy(() => import("./pages/Building.tsx"));
const Fixing = lazy(() => import("./pages/Fixing.tsx"));
const Delivery = lazy(() => import("./pages/Delivery.tsx"));
const Tennis = lazy(() => import("./pages/Tennis.tsx"));
const Theatre = lazy(() => import("./pages/Theatre.tsx"));
const Marketplace = lazy(() => import("./pages/Marketplace.tsx"));
const CVBuilderPage = lazy(() => import("./pages/CVBuilderPage.tsx"));
const MatchMe = lazy(() => import("./pages/MatchMe.tsx"));
const MatchMeSectionPage = lazy(() => import("./pages/MatchMeSectionPage.tsx"));
const MostWanted = lazy(() => import("./pages/MostWanted.tsx"));
const Companies = lazy(() => import("./pages/Companies.tsx"));
const HelpMeApply = lazy(() => import("./pages/HelpMeApply.tsx"));
const HowToStandOut = lazy(() => import("./pages/HowToStandOut.tsx"));
const SkillsPassport = lazy(() => import("./pages/SkillsPassport.tsx"));
const SkillCoursePage = lazy(() => import("./pages/SkillCoursePage.tsx"));
const Articles = lazy(() => import("./pages/Articles.tsx"));
const UsingOurSite = lazy(() => import("./pages/UsingOurSite.tsx"));
const CareerProfile = lazy(() => import("./pages/CareerProfile.tsx"));
const MyProfile = lazy(() => import("./pages/MyProfile.tsx"));
const BriefingsSample = lazy(() => import("./pages/BriefingsSample.tsx"));
const MyJobs = lazy(() => import("./pages/MyJobs.tsx"));
const JobTracker = lazy(() => import("./pages/JobTracker.tsx"));
const MyJobsDemo = lazy(() => import("./pages/MyJobsDemo.tsx"));
const MyProfileDemo = lazy(() => import("./pages/MyProfileDemo.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const AdminAdzunaRuns = lazy(() => import("./pages/AdminAdzunaRuns.tsx"));
const AdminIndustryHealth = lazy(() => import("./pages/AdminIndustryHealth.tsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.tsx"));
const AdminAiCosts = lazy(() => import("./pages/AdminAiCosts.tsx"));
const AdminEmployerSpotlight = lazy(() => import("./pages/AdminEmployerSpotlight.tsx"));
const AdminTeam = lazy(() => import("./pages/AdminTeam.tsx"));
const CompanyMeEm = lazy(() => import("./pages/CompanyMeEm.tsx"));
const CompanyGails = lazy(() => import("./pages/CompanyGails.tsx"));
const CompanyDrMartens = lazy(() => import("./pages/CompanyDrMartens.tsx"));
const CompanyNike = lazy(() => import("./pages/CompanyNike.tsx"));
const CompanyBirkenstock = lazy(() => import("./pages/CompanyBirkenstock.tsx"));
const CompanyTimberland = lazy(() => import("./pages/CompanyTimberland.tsx"));
const CompanyUgg = lazy(() => import("./pages/CompanyUgg.tsx"));
const CompanyOcado = lazy(() => import("./pages/CompanyOcado.tsx"));
const CompanyOcadoRetail = lazy(() => import("./pages/CompanyOcadoRetail.tsx"));
const CompanyOcadoLogistics = lazy(() => import("./pages/CompanyOcadoLogistics.tsx"));
const CompanyGreggs = lazy(() => import("./pages/CompanyGreggs.tsx"));
const CompanySaveTheChildren = lazy(() => import("./pages/CompanySaveTheChildren.tsx"));
const CompanyNetflix = lazy(() => import("./pages/CompanyNetflix.tsx"));
const CompanyEveryman = lazy(() => import("./pages/CompanyEveryman.tsx"));
const CompanyGrind = lazy(() => import("./pages/CompanyGrind.tsx"));
const CompanySavills = lazy(() => import("./pages/CompanySavills.tsx"));
const CompanyRightmove = lazy(() => import("./pages/CompanyRightmove.tsx"));
const CompanyBurberry = lazy(() => import("./pages/CompanyBurberry.tsx"));
const CompanyAsos = lazy(() => import("./pages/CompanyAsos.tsx"));
const CompanyPremierLeague = lazy(() => import("./pages/CompanyPremierLeague.tsx"));
const CompanySkySports = lazy(() => import("./pages/CompanySkySports.tsx"));
const CompanyTesco = lazy(() => import("./pages/CompanyTesco.tsx"));
const CompanySohoHouse = lazy(() => import("./pages/CompanySohoHouse.tsx"));
const CompanyTomDixon = lazy(() => import("./pages/CompanyTomDixon.tsx"));
const CompanyDice = lazy(() => import("./pages/CompanyDice.tsx"));
const CompanyTeachFirst = lazy(() => import("./pages/CompanyTeachFirst.tsx"));
const CompanyAdidas = lazy(() => import("./pages/CompanyAdidas.tsx"));
const CompanyPurplebricks = lazy(() => import("./pages/CompanyPurplebricks.tsx"));
const CompanyCosta = lazy(() => import("./pages/CompanyCosta.tsx"));
const CompanyStarbucks = lazy(() => import("./pages/CompanyStarbucks.tsx"));
const CompanyCaffeNero = lazy(() => import("./pages/CompanyCaffeNero.tsx"));
const CompanyBlankStreet = lazy(() => import("./pages/CompanyBlankStreet.tsx"));
const CompanyFiveGuys = lazy(() => import("./pages/CompanyFiveGuys.tsx"));
const CompanyHawkstone = lazy(() => import("./pages/CompanyHawkstone.tsx"));
const CompanyFeverTree = lazy(() => import("./pages/CompanyFeverTree.tsx"));
const CompanyPragnell = lazy(() => import("./pages/CompanyPragnell.tsx"));
const CompanyNewsUK = lazy(() => import("./pages/CompanyNewsUK.tsx"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage.tsx"));
const TermsAndPrivacy = lazy(() => import("./pages/TermsAndPrivacy.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const Learning = lazy(() => import("./pages/Learning.tsx"));
const Mentoring = lazy(() => import("./pages/Mentoring.tsx"));
const ResourceTopic = lazy(() => import("./pages/ResourceTopic.tsx"));
const WorkCuriosityChecklist = lazy(() => import("./pages/WorkCuriosityChecklist.tsx"));
const SideHustles = lazy(() => import("./pages/SideHustles.tsx"));
const SideHustleTopic = lazy(() => import("./pages/SideHustleTopic.tsx"));
const StartingABusiness = lazy(() => import("./pages/StartingABusiness.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Employers = lazy(() => import("./pages/Employers.tsx"));
const Educators = lazy(() => import("./pages/Educators.tsx"));
const EmployerLogin = lazy(() => import("./pages/EmployerLogin.tsx"));
const EmployerDashboard = lazy(() => import("./pages/EmployerDashboard.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Community = lazy(() => import("./pages/Community.tsx"));
const CommunityChat = lazy(() => import("./pages/CommunityChat.tsx"));
const CommunityMembers = lazy(() => import("./pages/CommunityMembers.tsx"));

const Roles = lazy(() => import("./pages/Roles.tsx"));
const RoleMarketing = lazy(() => import("./pages/roles/Marketing.tsx"));
const RoleFinance = lazy(() => import("./pages/roles/Finance.tsx"));
const RoleOperations = lazy(() => import("./pages/roles/Operations.tsx"));
const RoleStrategy = lazy(() => import("./pages/roles/Strategy.tsx"));
const RoleSales = lazy(() => import("./pages/roles/Sales.tsx"));
const RoleProduct = lazy(() => import("./pages/roles/Product.tsx"));
const RoleCreative = lazy(() => import("./pages/roles/Creative.tsx"));
const RoleHRPeople = lazy(() => import("./pages/roles/HRPeople.tsx"));
const RoleLegalCompliance = lazy(() => import("./pages/roles/LegalCompliance.tsx"));
const RoleProjectManagement = lazy(() => import("./pages/roles/ProjectManagement.tsx"));
const RoleCommercial = lazy(() => import("./pages/roles/Commercial.tsx"));
const RoleEcommerce = lazy(() => import("./pages/roles/Ecommerce.tsx"));
const RoleBarista = lazy(() => import("./pages/roles/Barista.tsx"));
const RoleChef = lazy(() => import("./pages/roles/Chef.tsx"));
const RolePersonalTrainer = lazy(() => import("./pages/roles/PersonalTrainer.tsx"));
const RoleEstateAgent = lazy(() => import("./pages/roles/EstateAgent.tsx"));
const RoleStylist = lazy(() => import("./pages/roles/Stylist.tsx"));
const RoleProducer = lazy(() => import("./pages/roles/Producer.tsx"));
const RoleTeacher = lazy(() => import("./pages/roles/Teacher.tsx"));
const RolePhysiotherapist = lazy(() => import("./pages/roles/Physiotherapist.tsx"));
const RolePsychotherapist = lazy(() => import("./pages/roles/Psychotherapist.tsx"));
const RoleFitnessInstructor = lazy(() => import("./pages/roles/FitnessInstructor.tsx"));
const RoleCharityFundraiser = lazy(() => import("./pages/roles/CharityFundraiser.tsx"));
const RoleHotelManager = lazy(() => import("./pages/roles/HotelManager.tsx"));
const RoleBartender = lazy(() => import("./pages/roles/Bartender.tsx"));
const RoleGarmentTechnologist = lazy(() => import("./pages/roles/GarmentTechnologist.tsx"));
const RoleMortgageAdvisor = lazy(() => import("./pages/roles/MortgageAdvisor.tsx"));
const RoleITTechnology = lazy(() => import("./pages/roles/ITTechnology.tsx"));
const RoleAI = lazy(() => import("./pages/roles/AI.tsx"));
const RoleFootballAgent = lazy(() => import("./pages/roles/FootballAgent.tsx"));
const RoleISRCManager = lazy(() => import("./pages/roles/ISRCManager.tsx"));
const RoleLiteraryAgent = lazy(() => import("./pages/roles/LiteraryAgent.tsx"));
const RoleBookseller = lazy(() => import("./pages/roles/Bookseller.tsx"));
const RoleRetailAssistant = lazy(() => import("./pages/roles/RetailAssistant.tsx"));
const RoleWarehouseDelivery = lazy(() => import("./pages/roles/WarehouseDelivery.tsx"));
const RoleVehicleTechnician = lazy(() => import("./pages/roles/VehicleTechnician.tsx"));
const RoleBeautyTherapist = lazy(() => import("./pages/roles/BeautyTherapist.tsx"));
const RoleFarmer = lazy(() => import("./pages/roles/Farmer.tsx"));
const RoleAgronomist = lazy(() => import("./pages/roles/Agronomist.tsx"));
const RoleBuyer = lazy(() => import("./pages/roles/Buyer.tsx"));
const RoleCarSalesExecutive = lazy(() => import("./pages/roles/CarSalesExecutive.tsx"));
const RoleConveyancer = lazy(() => import("./pages/roles/Conveyancer.tsx"));
const RoleCustomerService = lazy(() => import("./pages/roles/CustomerService.tsx"));
const RoleDataAnalyst = lazy(() => import("./pages/roles/DataAnalyst.tsx"));
const RoleDoctor = lazy(() => import("./pages/roles/Doctor.tsx"));
const RoleFarmManager = lazy(() => import("./pages/roles/FarmManager.tsx"));
const RoleFarmWorker = lazy(() => import("./pages/roles/FarmWorker.tsx"));
const RoleFinancialAdvisor = lazy(() => import("./pages/roles/FinancialAdvisor.tsx"));
const RoleHealthcareAssistant = lazy(() => import("./pages/roles/HealthcareAssistant.tsx"));
const RoleInvestmentAnalyst = lazy(() => import("./pages/roles/InvestmentAnalyst.tsx"));
const RoleJockey = lazy(() => import("./pages/roles/Jockey.tsx"));
const RoleLettingsNegotiator = lazy(() => import("./pages/roles/LettingsNegotiator.tsx"));
const RoleMidwife = lazy(() => import("./pages/roles/Midwife.tsx"));
const RoleMortgageBroker = lazy(() => import("./pages/roles/MortgageBroker.tsx"));
const RoleNurse = lazy(() => import("./pages/roles/Nurse.tsx"));
const RoleOccupationalTherapist = lazy(() => import("./pages/roles/OccupationalTherapist.tsx"));
const RolePropertyManager = lazy(() => import("./pages/roles/PropertyManager.tsx"));
const RoleRacehorseTrainer = lazy(() => import("./pages/roles/RacehorseTrainer.tsx"));
const RoleStableHand = lazy(() => import("./pages/roles/StableHand.tsx"));
const RoleTeachingAssistant = lazy(() => import("./pages/roles/TeachingAssistant.tsx"));
const RoleVeterinaryNurse = lazy(() => import("./pages/roles/VeterinaryNurse.tsx"));
const RoleVeterinarySurgeon = lazy(() => import("./pages/roles/VeterinarySurgeon.tsx"));
const RoleWealthManager = lazy(() => import("./pages/roles/WealthManager.tsx"));
const RoleGeneric = lazy(() => import("./pages/roles/RoleGeneric.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min — instant from cache, refresh in bg when stale
      gcTime: 24 * 60 * 60 * 1000,     // 24h — keep around for persistence to rehydrate
      refetchOnWindowFocus: false,
      refetchOnMount: false,           // use cached data on mount; revalidate only if stale
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "hdyd-query-cache-v1",         // bump suffix to invalidate after schema changes
  throttleTime: 1000,
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse font-display text-2xl text-muted-foreground">Loading…</div>
  </div>
);

const App = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister,
      maxAge: 24 * 60 * 60 * 1000,    // discard entries older than 24h
      buster: "v1",                    // bump to invalidate everyone's cache on deploy if needed
    }}
  >
    <TooltipProvider>
      <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <TermsAcceptBanner />
        <ConditionalHomeButton />
        <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home-v2" element={<IndexV2 />} />
          <Route path="/beauty" element={<Beauty />} />
          <Route path="/beer" element={<Beer />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/coffee" element={<Coffee />} />
          <Route path="/cinema" element={<Cinema />} />
          <Route path="/music" element={<Music />} />
          <Route path="/books" element={<Books />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/fashion" element={<Fashion />} />
          <Route path="/hospitality" element={<Hospitality />} />
          <Route path="/football" element={<Football />} />
          <Route path="/football/badge" element={<FootballBadge />} />
          <Route path="/teaching" element={<Teaching />} />
          <Route path="/interior-design" element={<InteriorDesign />} />
          <Route path="/charity" element={<Charity />} />
          <Route path="/estate-agency" element={<EstateAgency />} />
          <Route path="/bakery" element={<Bakery />} />
          <Route path="/footwear" element={<Footwear />} />
          <Route path="/physiotherapy" element={<Physiotherapy />} />
          <Route path="/politics" element={<Politics />} />
          <Route path="/psychotherapy" element={<Psychotherapy />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/gaming" element={<Gaming />} />
          <Route path="/influencing" element={<Influencing />} />
          <Route path="/journalism" element={<Journalism />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/farming" element={<Farming />} />
          <Route path="/money" element={<Money />} />
          <Route path="/health" element={<Health />} />
          <Route path="/horse-racing" element={<HorseRacing />} />
          <Route path="/formula-1" element={<Formula1 />} />
          <Route path="/building" element={<Building />} />
          <Route path="/fixing" element={<Fixing />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/tennis" element={<Tennis />} />
          <Route path="/theatre" element={<Theatre />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cv-builder" element={<CVBuilderPage />} />
          <Route path="/match-me" element={<MatchMe />} />
          <Route path="/match-me/:section" element={<MatchMeSectionPage />} />
          <Route path="/most-wanted" element={<MostWanted />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/help-me-apply" element={<HelpMeApply />} />
          <Route path="/how-to-stand-out" element={<HowToStandOut />} />
          <Route path="/videos" element={<Navigate to="/the-show" replace />} />
          <Route path="/skills-passport" element={<SkillsPassport />} />
          <Route path="/skill-course/:courseId" element={<SkillCoursePage />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/using-our-site" element={<UsingOurSite />} />
          <Route path="/profile/:id" element={<CareerProfile />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-profile-demo" element={<MyProfileDemo />} />
          <Route path="/my-jobs-demo" element={<MyJobsDemo />} />
          <Route path="/briefings" element={<BriefingsSample />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin/adzuna-runs" element={<AdminAdzunaRuns />} />
          <Route path="/admin/industry-health" element={<AdminIndustryHealth />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/ai-costs" element={<AdminAiCosts />} />
          <Route path="/admin/employer-spotlight" element={<AdminEmployerSpotlight />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin" element={<AdminTeam />} />
          <Route path="/company/me-em" element={<CompanyMeEm />} />
          <Route path="/company/gails" element={<CompanyGails />} />
          <Route path="/company/dr-martens" element={<CompanyDrMartens />} />
          <Route path="/company/nike" element={<CompanyNike />} />
          <Route path="/company/birkenstock" element={<CompanyBirkenstock />} />
          <Route path="/company/timberland" element={<CompanyTimberland />} />
          <Route path="/company/ugg" element={<CompanyUgg />} />
          <Route path="/company/ocado" element={<CompanyOcado />} />
          <Route path="/company/ocado-group" element={<CompanyOcado />} />
          <Route path="/company/ocado-retail" element={<CompanyOcadoRetail />} />
          <Route path="/company/ocado-logistics" element={<CompanyOcadoLogistics />} />
          <Route path="/company/greggs" element={<CompanyGreggs />} />
          <Route path="/company/save-the-children" element={<CompanySaveTheChildren />} />
          <Route path="/company/netflix" element={<CompanyNetflix />} />
          <Route path="/company/everyman" element={<CompanyEveryman />} />
          <Route path="/company/grind" element={<CompanyGrind />} />
          <Route path="/company/savills" element={<CompanySavills />} />
          <Route path="/company/rightmove" element={<CompanyRightmove />} />
          <Route path="/company/burberry" element={<CompanyBurberry />} />
          <Route path="/company/asos" element={<CompanyAsos />} />
          <Route path="/company/premier-league" element={<CompanyPremierLeague />} />
          <Route path="/company/sky-sports" element={<CompanySkySports />} />
          <Route path="/company/tesco" element={<CompanyTesco />} />
          <Route path="/company/soho-house" element={<CompanySohoHouse />} />
          <Route path="/company/tom-dixon" element={<CompanyTomDixon />} />
          <Route path="/company/dice" element={<CompanyDice />} />
          <Route path="/company/teach-first" element={<CompanyTeachFirst />} />
          <Route path="/company/adidas" element={<CompanyAdidas />} />
          <Route path="/company/purplebricks" element={<CompanyPurplebricks />} />
          <Route path="/company/costa" element={<CompanyCosta />} />
          <Route path="/company/starbucks" element={<CompanyStarbucks />} />
          <Route path="/company/caffe-nero" element={<CompanyCaffeNero />} />
          <Route path="/company/blank-street" element={<CompanyBlankStreet />} />
          <Route path="/company/hawkstone" element={<CompanyHawkstone />} />
          <Route path="/company/fever-tree" element={<CompanyFeverTree />} />
          <Route path="/company/five-guys" element={<CompanyFiveGuys />} />
          <Route path="/company/pragnell" element={<CompanyPragnell />} />
          <Route path="/company/news-uk" element={<CompanyNewsUK />} />
          <Route path="/company/:slug" element={<CompanyProfilePage />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/roles/marketing" element={<RoleMarketing />} />
          <Route path="/roles/finance" element={<RoleFinance />} />
          <Route path="/roles/operations" element={<RoleOperations />} />
          <Route path="/roles/strategy" element={<RoleStrategy />} />
          <Route path="/roles/sales" element={<RoleSales />} />
          <Route path="/roles/product" element={<RoleProduct />} />
          <Route path="/roles/creative" element={<RoleCreative />} />
          <Route path="/roles/hr-people" element={<RoleHRPeople />} />
          <Route path="/roles/legal-compliance" element={<RoleLegalCompliance />} />
          <Route path="/roles/project-management" element={<RoleProjectManagement />} />
          <Route path="/roles/commercial" element={<RoleCommercial />} />
          <Route path="/roles/ecommerce" element={<RoleEcommerce />} />
          <Route path="/roles/barista" element={<RoleBarista />} />
          <Route path="/roles/chef" element={<RoleChef />} />
          <Route path="/roles/personal-trainer" element={<RolePersonalTrainer />} />
          <Route path="/roles/estate-agent" element={<RoleEstateAgent />} />
          <Route path="/roles/stylist" element={<RoleStylist />} />
          <Route path="/roles/producer" element={<RoleProducer />} />
          <Route path="/roles/teacher" element={<RoleTeacher />} />
          <Route path="/roles/physiotherapist" element={<RolePhysiotherapist />} />
          <Route path="/roles/psychotherapist" element={<RolePsychotherapist />} />
          <Route path="/roles/fitness-instructor" element={<RoleFitnessInstructor />} />
          <Route path="/roles/charity-fundraiser" element={<RoleCharityFundraiser />} />
          <Route path="/roles/hotel-manager" element={<RoleHotelManager />} />
          <Route path="/roles/bartender" element={<RoleBartender />} />
          <Route path="/roles/garment-technologist" element={<RoleGarmentTechnologist />} />
          <Route path="/roles/mortgage-advisor" element={<RoleMortgageAdvisor />} />
          <Route path="/roles/it-technology" element={<RoleITTechnology />} />
          <Route path="/roles/ai" element={<RoleAI />} />
          <Route path="/roles/football-agent" element={<RoleFootballAgent />} />
          <Route path="/roles/isrc-manager" element={<RoleISRCManager />} />
          <Route path="/roles/literary-agent" element={<RoleLiteraryAgent />} />
          <Route path="/roles/bookseller" element={<RoleBookseller />} />
          <Route path="/roles/ai-engineering" element={<RoleAI />} />
          <Route path="/roles/ai-research" element={<RoleAI />} />
          <Route path="/roles/ai-commercial" element={<RoleAI />} />
          <Route path="/roles/ai-policy" element={<RoleAI />} />
          <Route path="/roles/retail-assistant" element={<RoleRetailAssistant />} />
          <Route path="/roles/warehouse-delivery" element={<RoleWarehouseDelivery />} />
          <Route path="/roles/vehicle-technician" element={<RoleVehicleTechnician />} />
          <Route path="/roles/beauty-therapist" element={<RoleBeautyTherapist />} />
          <Route path="/roles/farmer" element={<RoleFarmer />} />
          <Route path="/roles/agronomist" element={<RoleAgronomist />} />
          <Route path="/roles/buyer" element={<RoleBuyer />} />
          <Route path="/roles/car-sales-executive" element={<RoleCarSalesExecutive />} />
          <Route path="/roles/conveyancer" element={<RoleConveyancer />} />
          <Route path="/roles/customer-service" element={<RoleCustomerService />} />
          <Route path="/roles/data-analyst" element={<RoleDataAnalyst />} />
          <Route path="/roles/doctor" element={<RoleDoctor />} />
          <Route path="/roles/farm-manager" element={<RoleFarmManager />} />
          <Route path="/roles/farm-worker" element={<RoleFarmWorker />} />
          <Route path="/roles/financial-advisor" element={<RoleFinancialAdvisor />} />
          <Route path="/roles/healthcare-assistant" element={<RoleHealthcareAssistant />} />
          <Route path="/roles/investment-analyst" element={<RoleInvestmentAnalyst />} />
          <Route path="/roles/jockey" element={<RoleJockey />} />
          <Route path="/roles/lettings-negotiator" element={<RoleLettingsNegotiator />} />
          <Route path="/roles/midwife" element={<RoleMidwife />} />
          <Route path="/roles/mortgage-broker" element={<RoleMortgageBroker />} />
          <Route path="/roles/nurse" element={<RoleNurse />} />
          <Route path="/roles/occupational-therapist" element={<RoleOccupationalTherapist />} />
          <Route path="/roles/property-manager" element={<RolePropertyManager />} />
          <Route path="/roles/racehorse-trainer" element={<RoleRacehorseTrainer />} />
          <Route path="/roles/stable-hand" element={<RoleStableHand />} />
          <Route path="/roles/teaching-assistant" element={<RoleTeachingAssistant />} />
          <Route path="/roles/veterinary-nurse" element={<RoleVeterinaryNurse />} />
          <Route path="/roles/veterinary-surgeon" element={<RoleVeterinarySurgeon />} />
          <Route path="/roles/wealth-manager" element={<RoleWealthManager />} />
          {/* Catch-all for any role slug defined in src/data/roles.ts that doesn't have a bespoke page yet */}
          <Route path="/roles/:slug" element={<RoleGeneric />} />
          <Route path="/terms" element={<TermsAndPrivacy />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/mentoring" element={<Mentoring />} />
          <Route path="/resources/work-curiosity-checklist" element={<WorkCuriosityChecklist />} />
          <Route path="/resources/:slug" element={<ResourceTopic />} />
          <Route path="/side-hustles" element={<SideHustles />} />
          <Route path="/side-hustles/:slug" element={<SideHustleTopic />} />
          <Route path="/starting-a-business" element={<StartingABusiness />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/employers" element={<Employers />} />
          <Route path="/educators" element={<Educators />} />
          <Route path="/schools" element={<Educators />} />
          <Route path="/employer-login" element={<EmployerLogin />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/the-show" element={<TheShowPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/Community" element={<Community />} />
          <Route path="/community/members" element={<CommunityMembers />} />
          <Route path="/members" element={<Community />} />
          <Route path="/Members" element={<Community />} />
          <Route path="/community-chat" element={<CommunityChat />} />
          <Route path="/community/chat" element={<CommunityChat />} />
          <Route path="/howdy/*" element={<HowdyApp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
        <ConditionalHowdy />
        </Suspense>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </PersistQueryClientProvider>
);

export default App;