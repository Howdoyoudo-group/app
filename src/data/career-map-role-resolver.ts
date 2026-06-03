// Resolves a Career Map role name (e.g. "Band 6 Senior Physiotherapist",
// "Chef de Partie", "Branch / Mortgage Manager") to a /roles/:slug page,
// when there's a clear, direct correlation.
//
// Returns null when no confident match exists - caller falls back to the
// existing "Save to Most Wanted" CTA only.

import { roles } from "./roles";

const ROLE_SLUGS = new Set(roles.map((r) => r.slug));

/** Manual aliases for role-name families that don't slug-match cleanly. */
const ALIAS_MAP: Array<{ test: RegExp; slug: string }> = [
  // Physio family
  { test: /physiotherapist|physio/i, slug: "physiotherapist" },
  { test: /football physio|sports physio/i, slug: "football-physio" },

  // Chef / kitchen
  { test: /\b(chef|sous chef|head chef|chef de partie|commis|kitchen porter)\b/i, slug: "chef" },
  { test: /\b(baker)\b/i, slug: "chef" },

  // Bar / coffee
  { test: /\bbarista\b/i, slug: "barista" },
  { test: /\bbartender|barback|mixologist\b/i, slug: "bartender" },

  // Teaching
  { test: /\b(teacher|headteacher|head of department|lecturer|tutor)\b/i, slug: "teacher" },
  { test: /\bteaching assistant|ta\b/i, slug: "teaching-assistant" },

  // Health
  { test: /\b(nurse|staff nurse|matron)\b/i, slug: "nurse" },
  { test: /\bmidwife\b/i, slug: "midwife" },
  { test: /\bdoctor|gp|consultant physician|registrar|fy[12]\b/i, slug: "doctor" },
  { test: /\boccupational therapist|ot\b/i, slug: "occupational-therapist" },
  { test: /\bpsychotherapist|cbt therapist|counsellor\b/i, slug: "psychotherapist" },
  { test: /\bhealthcare assistant|hca\b/i, slug: "healthcare-assistant" },
  { test: /\bcare worker|care assistant|support worker\b/i, slug: "care-worker" },

  // Vet
  { test: /\bveterinary surgeon|vet surgeon|\bvet\b/i, slug: "veterinary-surgeon" },
  { test: /\bveterinary nurse|vet nurse|rvn\b/i, slug: "veterinary-nurse" },

  // Property / mortgage / estate
  { test: /\bestate agent|sales negotiator|valuer\b/i, slug: "estate-agent" },
  { test: /\blettings negotiator|lettings agent\b/i, slug: "lettings-negotiator" },
  { test: /\bproperty manager\b/i, slug: "property-manager" },
  { test: /\bconveyancer|licensed conveyancer\b/i, slug: "conveyancer" },
  { test: /\bmortgage advisor|mortgage adviser\b/i, slug: "mortgage-advisor" },
  { test: /\bmortgage broker\b/i, slug: "mortgage-broker" },

  // Finance
  { test: /\bfinancial advisor|financial adviser|ifa\b/i, slug: "financial-advisor" },
  { test: /\bwealth manager|private banker\b/i, slug: "wealth-manager" },
  { test: /\binvestment analyst|equity analyst\b/i, slug: "investment-analyst" },
  { test: /\b(cfo|chief financial officer|finance director|financial controller|accountant|accounts assistant|fp&a|treasury)\b/i, slug: "finance" },

  // Marketing / brand / creative / product / strategy
  { test: /\b(marketing|brand manager|cmo|chief marketing officer|marketing director|growth marketer|content marketer|seo manager)\b/i, slug: "marketing" },
  { test: /\b(creative director|art director|copywriter|graphic designer|chief creative officer)\b/i, slug: "creative" },
  { test: /\b(product manager|associate product manager|product owner|chief product officer|head of product)\b/i, slug: "product" },
  { test: /\b(strategy|strategist|chief strategy officer|chief transformation officer)\b/i, slug: "strategy" },
  { test: /\b(commercial manager|chief commercial officer|chief revenue officer|commercial director)\b/i, slug: "commercial" },
  { test: /\b(ecommerce|e-commerce|digital trading|online merchandiser)\b/i, slug: "ecommerce" },

  // Sales / customer
  { test: /\b(sales|account executive|account manager|business development|bdm|sdr|inside sales|sales director)\b/i, slug: "sales" },
  { test: /\b(customer service|customer support|customer success|contact centre)\b/i, slug: "customer-service" },

  // Ops / PM
  { test: /\b(operations|coo|chief operating officer|ops manager|operations director)\b/i, slug: "operations" },
  { test: /\b(project manager|programme manager|pmo|delivery manager)\b/i, slug: "project-management" },

  // People / legal / IT / AI / data
  { test: /\b(hr|human resources|people partner|people director|chief people officer|talent acquisition|recruiter)\b/i, slug: "hr-people" },
  { test: /\b(legal counsel|solicitor|paralegal|chief legal officer|general counsel|compliance)\b/i, slug: "legal-compliance" },
  { test: /\b(software engineer|developer|devops|cio|chief information officer|it manager|cyber|sysadmin)\b/i, slug: "it-technology" },
  { test: /\b(data analyst|business analyst|data scientist|bi analyst)\b/i, slug: "data-analyst" },
  { test: /\b(ai engineer|machine learning|ml engineer|chief ai officer|ai product|ai policy)\b/i, slug: "ai" },

  // Retail / hospitality / store
  { test: /\b(retail assistant|sales assistant|shop assistant|store assistant)\b/i, slug: "retail-assistant" },
  { test: /\b(grocery store manager|store manager|assistant store manager|branch manager)\b/i, slug: "grocery-store-manager" },
  { test: /\b(hotel manager|general manager|gm)\b/i, slug: "hotel-manager" },

  // Fitness / beauty / stylist
  { test: /\b(personal trainer|pt|fitness coach)\b/i, slug: "personal-trainer" },
  { test: /\b(fitness instructor|gym instructor|group exercise)\b/i, slug: "fitness-instructor" },
  { test: /\b(beauty therapist|aesthetic practitioner|nail technician)\b/i, slug: "beauty-therapist" },
  { test: /\b(stylist|hairdresser|hair stylist|colourist)\b/i, slug: "stylist" },

  // Auto / warehouse / vehicle
  { test: /\b(vehicle technician|mechanic apprentice|mot tester)\b/i, slug: "vehicle-technician" },
  { test: /\b(mechanic)\b/i, slug: "mechanic" },
  { test: /\b(car sales executive|car sales|aftersales)\b/i, slug: "car-sales-executive" },
  { test: /\b(warehouse|delivery driver|hgv|picker|packer|fulfilment)\b/i, slug: "warehouse-delivery" },

  // Farm / ag
  { test: /\b(farmer)\b/i, slug: "farmer" },
  { test: /\b(farm manager)\b/i, slug: "farm-manager" },
  { test: /\b(farm worker|farm hand|stockperson)\b/i, slug: "farm-worker" },
  { test: /\b(agronomist|farm consultant)\b/i, slug: "agronomist" },

  // Football
  { test: /\b(academy coach|youth coach)\b/i, slug: "academy-coach" },
  { test: /\b(football coach|first[- ]team coach|head coach|manager.*football)\b/i, slug: "football-coach" },
  { test: /\b(football scout|chief scout|recruitment analyst)\b/i, slug: "football-scout" },
  { test: /\b(football analyst|performance analyst|opposition analyst)\b/i, slug: "football-analyst" },
  { test: /\b(kit manager|kit assistant)\b/i, slug: "kit-manager" },
  { test: /\b(groundsperson|groundsman|head groundsperson)\b/i, slug: "groundsperson" },
  { test: /\b(sports scientist|s&c coach|strength and conditioning)\b/i, slug: "sports-scientist" },

  // Motorsport / engineering
  { test: /\b(aerodynamicist|aero performance)\b/i, slug: "aerodynamicist" },
  { test: /\b(performance engineer)\b/i, slug: "performance-engineer" },
  { test: /\b(race engineer)\b/i, slug: "race-engineer" },
  { test: /\b(composite technician|composites)\b/i, slug: "composite-technician" },

  // Media / broadcast / games / events / interiors / travel
  { test: /\b(broadcast journalist|news reporter|news presenter)\b/i, slug: "broadcast-journalist" },
  { test: /\b(reporter|correspondent|journalist|sub[- ]editor)\b/i, slug: "reporter" },
  { test: /\b(editor|editor[- ]in[- ]chief|features editor)\b/i, slug: "editor" },
  { test: /\b(producer|line producer|series producer)\b/i, slug: "producer" },
  { test: /\b(sound engineer|audio engineer|live sound)\b/i, slug: "sound-engineer" },
  { test: /\b(game designer|level designer|narrative designer)\b/i, slug: "game-designer" },
  { test: /\b(qa tester|qa analyst|test analyst)\b/i, slug: "qa-tester" },
  { test: /\b(interior designer|fit[- ]out designer)\b/i, slug: "interior-designer" },
  { test: /\b(live events manager|events producer|event manager)\b/i, slug: "live-events-manager" },
  { test: /\b(travel consultant|travel agent|reservations consultant)\b/i, slug: "travel-consultant" },

  // Buyer / merchandiser / garment
  { test: /\b(buyer|assistant buyer|merchandiser)\b/i, slug: "buyer" },
  { test: /\b(garment technologist|gt)\b/i, slug: "garment-technologist" },

  // Equine
  { test: /\b(jockey|apprentice jockey)\b/i, slug: "jockey" },
  { test: /\b(racehorse trainer|trainer.*racing)\b/i, slug: "racehorse-trainer" },
  { test: /\b(stable hand|stable staff|work rider|groom)\b/i, slug: "stable-hand" },

  // Charity
  { test: /\b(charity fundraiser|fundraiser|fundraising manager|trusts and foundations)\b/i, slug: "charity-fundraiser" },
];

/** Quick slugify of a free-text role name, stripping parentheticals & noise. */
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // drop parentheticals e.g. "(NHS)"
    .replace(/\bband\s*\d+\b/g, "") // drop "Band 5"
    .replace(/\blevel\s*\d+\b/g, "") // drop "Level 2/3"
    .replace(/\bjunior\b|\bsenior\b|\bapprentice\b|\bassistant\b/g, "")
    .replace(/[\\/&]/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** Returns a /roles/:slug match for a career-map role name, or null. */
export const resolveCareerMapRoleSlug = (roleName: string): string | null => {
  if (!roleName) return null;

  // 1. Direct slugify match
  const direct = slugify(roleName);
  if (ROLE_SLUGS.has(direct)) return direct;

  // 2. Alias overrides
  for (const { test, slug } of ALIAS_MAP) {
    if (test.test(roleName) && ROLE_SLUGS.has(slug)) return slug;
  }

  return null;
};
