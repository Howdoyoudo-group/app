import roleMarketing from "@/assets/role-marketing.png";
import roleFinance from "@/assets/role-finance.png";
import roleOperations from "@/assets/role-operations.png";
import roleStrategy from "@/assets/role-strategy.png";
import roleSales from "@/assets/role-sales.png";
import roleProduct from "@/assets/role-product.png";
import roleCreative from "@/assets/role-creative.png";
import roleHR from "@/assets/role-hr.png";
import roleLegal from "@/assets/role-legal.png";
import roleProject from "@/assets/role-project.png";
import roleCommercial from "@/assets/role-commercial.png";
import roleEcommerce from "@/assets/role-ecommerce.png";
import roleBarista from "@/assets/role-barista.png";
import roleChef from "@/assets/role-chef.png";
import rolePersonalTrainer from "@/assets/role-personal-trainer.png";
import roleEstateAgent from "@/assets/role-estate-agent.png";
import roleStylist from "@/assets/role-stylist.png";
import roleProducer from "@/assets/role-producer.png";
import roleTeacher from "@/assets/role-teacher.png";
import rolePhysiotherapist from "@/assets/role-physiotherapist.png";
import rolePsychotherapist from "@/assets/role-psychotherapist.png";
import roleFitnessInstructor from "@/assets/role-fitness-instructor.png";
import roleCharityFundraiser from "@/assets/role-charity-fundraiser.png";
import roleHotelManager from "@/assets/role-hotel-manager.png";
import roleBartender from "@/assets/role-bartender.png";
import roleGarmentTechnologist from "@/assets/role-garment-technologist.png";
import roleMortgageAdvisor from "@/assets/role-mortgage-advisor.png";
import roleITTechnology from "@/assets/role-it-technology.png";
import roleAI from "@/assets/role-ai.png";
import roleRetailAssistant from "@/assets/role-retail-assistant.png";
import roleWarehouseDelivery from "@/assets/role-warehouse-delivery.png";
import roleVehicleTechnician from "@/assets/role-vehicle-technician.png";
import roleBeautyTherapist from "@/assets/role-beauty-therapist.png";
import roleFarmer from "@/assets/role-farmer.png";
// New doodles
import roleDoctor from "@/assets/role-doctor.png";
import roleNurse from "@/assets/role-nurse.png";
import roleMidwife from "@/assets/role-midwife.png";
import roleHealthcareAssistant from "@/assets/role-healthcare-assistant.png";
import roleVeterinarySurgeon from "@/assets/role-veterinary-surgeon.png";
import roleVeterinaryNurse from "@/assets/role-veterinary-nurse.png";
import roleJockey from "@/assets/role-jockey.png";
import roleRacehorseTrainer from "@/assets/role-racehorse-trainer.png";
import roleBuyer from "@/assets/role-buyer.png";
import roleDataAnalyst from "@/assets/role-data-analyst.png";
import roleCarSalesExecutive from "@/assets/role-car-sales-executive.png";
import roleCareWorker from "@/assets/role-care-worker.png";
import roleGroundsperson from "@/assets/role-groundsperson.png";
import roleKitManager from "@/assets/role-kit-manager.png";
import roleQaTester from "@/assets/role-qa-tester.png";
import roleRaceEngineer from "@/assets/role-race-engineer.png";
import roleMechanic from "@/assets/role-mechanic.png";
import roleAerodynamicist from "@/assets/role-aerodynamicist.png";
import rolePerformanceEngineer from "@/assets/role-performance-engineer.png";
import roleCompositeTechnician from "@/assets/role-composite-technician.png";
import roleFootballCoach from "@/assets/role-football-coach.png";
import roleFootballScout from "@/assets/role-football-scout.png";
import roleSportsScientist from "@/assets/role-sports-scientist.png";
import roleFootballPhysio from "@/assets/role-football-physio.png";
import roleFootballAnalyst from "@/assets/role-football-analyst.png";
import roleAcademyCoach from "@/assets/role-academy-coach.png";
import roleReporter from "@/assets/role-reporter.png";
import roleEditor from "@/assets/role-editor.png";
import roleBroadcastJournalist from "@/assets/role-broadcast-journalist.png";
import roleGameDesigner from "@/assets/role-game-designer.png";
import roleSoundEngineer from "@/assets/role-sound-engineer.png";
import roleLiveEventsManager from "@/assets/role-live-events-manager.png";
import roleTravelConsultant from "@/assets/role-travel-consultant.png";
import roleInteriorDesigner from "@/assets/role-interior-designer.png";
import roleGroceryStoreManager from "@/assets/role-grocery-store-manager.png";
// No bespoke doodle exists yet for these roles - reuse the parent
// industry's series card illustration until one is commissioned.
import seriesBooks from "@/assets/series-books.jpg";
import seriesTheatre from "@/assets/series-theatre.jpg";
import seriesPolitics from "@/assets/series-politics.jpg";

export const ROLE_ICONS: Record<string, string> = {
  marketing: roleMarketing,
  finance: roleFinance,
  operations: roleOperations,
  strategy: roleStrategy,
  // Placeholder - reuses the Strategy icon until a bespoke Sustainability icon exists
  sustainability: roleStrategy,
  sales: roleSales,
  product: roleProduct,
  creative: roleCreative,
  "hr-people": roleHR,
  "legal-compliance": roleLegal,
  "project-management": roleProject,
  commercial: roleCommercial,
  ecommerce: roleEcommerce,
  barista: roleBarista,
  chef: roleChef,
  "personal-trainer": rolePersonalTrainer,
  "estate-agent": roleEstateAgent,
  stylist: roleStylist,
  producer: roleProducer,
  teacher: roleTeacher,
  physiotherapist: rolePhysiotherapist,
  psychotherapist: rolePsychotherapist,
  "fitness-instructor": roleFitnessInstructor,
  "charity-fundraiser": roleCharityFundraiser,
  "hotel-manager": roleHotelManager,
  bartender: roleBartender,
  "garment-technologist": roleGarmentTechnologist,
  "mortgage-advisor": roleMortgageAdvisor,
  "it-technology": roleITTechnology,
  ai: roleAI,
  "ai-engineering": roleAI,
  "ai-research": roleAI,
  "ai-commercial": roleAI,
  "ai-policy": roleAI,
  "retail-assistant": roleRetailAssistant,
  "warehouse-delivery": roleWarehouseDelivery,
  "vehicle-technician": roleVehicleTechnician,
  "beauty-therapist": roleBeautyTherapist,
  farmer: roleFarmer,

  // Healthcare
  doctor: roleDoctor,
  nurse: roleNurse,
  midwife: roleMidwife,
  "healthcare-assistant": roleHealthcareAssistant,
  "occupational-therapist": rolePhysiotherapist,

  // Veterinary
  "veterinary-surgeon": roleVeterinarySurgeon,
  "veterinary-nurse": roleVeterinaryNurse,

  // Equine
  jockey: roleJockey,
  "racehorse-trainer": roleRacehorseTrainer,
  "stable-hand": roleRacehorseTrainer,

  // Property (reuse estate-agent)
  "lettings-negotiator": roleEstateAgent,
  "property-manager": roleEstateAgent,
  conveyancer: roleEstateAgent,

  // Finance (reuse)
  "financial-advisor": roleFinance,
  "wealth-manager": roleFinance,
  "investment-analyst": roleFinance,
  "mortgage-broker": roleMortgageAdvisor,

  // Farming (reuse farmer)
  "farm-manager": roleFarmer,
  "farm-worker": roleFarmer,
  agronomist: roleFarmer,

  // Education (reuse teacher)
  "teaching-assistant": roleTeacher,

  // Retail / service (reuse)
  "customer-service": roleRetailAssistant,
  buyer: roleBuyer,

  // Data
  "data-analyst": roleDataAnalyst,

  // Cars sales
  "car-sales-executive": roleCarSalesExecutive,

  // Frontline additions
  "care-worker": roleCareWorker,
  groundsperson: roleGroundsperson,
  "kit-manager": roleKitManager,
  "qa-tester": roleQaTester,

  // Vocational additions (Formula 1)
  "race-engineer": roleRaceEngineer,
  mechanic: roleMechanic,
  // Placeholders - reuse Mechanic/Vehicle Technician icons until bespoke
  // Fixing-trade icons exist
  electrician: roleMechanic,
  plumber: roleVehicleTechnician,
  "heating-engineer": roleMechanic,
  "repair-technician": roleVehicleTechnician,
  handyperson: roleMechanic,
  // Placeholders - reuse Mechanic/Vehicle Technician icons until bespoke
  // Building-trade icons exist
  bricklayer: roleMechanic,
  carpenter: roleVehicleTechnician,
  plasterer: roleMechanic,
  groundworker: roleVehicleTechnician,
  roofer: roleMechanic,
  aerodynamicist: roleAerodynamicist,
  "performance-engineer": rolePerformanceEngineer,
  "composite-technician": roleCompositeTechnician,

  // Football
  "football-coach": roleFootballCoach,
  "football-scout": roleFootballScout,
  "sports-scientist": roleSportsScientist,
  "football-physio": roleFootballPhysio,
  "football-analyst": roleFootballAnalyst,
  "academy-coach": roleAcademyCoach,
  // Placeholder - reuse the Football Coach doodle until a bespoke
  // Football Agent icon exists
  "football-agent": roleFootballCoach,
  // Placeholder - reuse the Data Analyst doodle until a bespoke
  // ISRC Manager icon exists
  "isrc-manager": roleDataAnalyst,

  // Journalism
  reporter: roleReporter,
  editor: roleEditor,
  "broadcast-journalist": roleBroadcastJournalist,

  // Gaming / Music / Travel / Interior / Grocery
  "game-designer": roleGameDesigner,
  "sound-engineer": roleSoundEngineer,
  "live-events-manager": roleLiveEventsManager,
  "travel-consultant": roleTravelConsultant,
  "interior-designer": roleInteriorDesigner,
  "grocery-store-manager": roleGroceryStoreManager,

  // Books - no bespoke doodle yet, reuse the Books industry series card
  "book-editor": seriesBooks,
  "literary-agent": seriesBooks,
  "book-publicist": seriesBooks,
  "rights-manager": seriesBooks,
  bookseller: seriesBooks,

  // Theatre - no bespoke doodle yet, reuse the Theatre industry series card
  performer: seriesTheatre,
  "theatre-stage-manager": seriesTheatre,
  "theatre-technician": seriesTheatre,
  "theatre-costume-designer": seriesTheatre,
  "theatre-producer": seriesTheatre,

  // Politics - no bespoke doodle yet, reuse the Politics industry series card
  "policy-advisor": seriesPolitics,
  "parliamentary-researcher": seriesPolitics,
  "council-officer": seriesPolitics,
  "think-tank-researcher": seriesPolitics,
  "public-affairs-manager": seriesPolitics,
};
