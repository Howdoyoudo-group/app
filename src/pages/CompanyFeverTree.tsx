import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";

const feverTreeData: CompanyCultureData = {
  slug: "fever-tree",
  name: "Fever-Tree",
  tagline: "If three-quarters of your drink is the mixer, make it count.",
  industry: "Beer & Drinks",
  industrySlug: "beer",
  coverImage: undefined,
  videoUrl: "https://www.youtube.com/embed/ggiZsE0a97Y",
  website: "https://fever-tree.com",
  careersUrl: "https://fever-tree.com/en-gb/careers",
  founded: "2004",
  hq: "London, UK (Shepherd's Bush)",
  employees: "~400",
  sectors: ["Premium Mixers", "FMCG", "Drinks", "Export"],
  glassdoor: 4.0,
  about: [
    "Fever-Tree was founded in 2004 by Charles Rolls and Tim Warrillow with a deceptively simple idea: if three-quarters of a gin and tonic is the tonic water, why was no one making a great one? The answer was a premium tonic made with quinine sourced from fever trees in the Democratic Republic of Congo — hence the name.",
    "Within a decade, Fever-Tree had transformed the mixer category entirely. Premium spirits brands had proliferated; the mixers hadn't kept up. Fever-Tree changed that, launching with Indian Tonic Water and expanding to over 40 products — from Ginger Beer to Elderflower to Aromatic Tonic — available in more than 85 countries.",
    "The company listed on AIM in 2014 at 134p per share. By 2018 its share price had risen more than 3,000%. Today Fever-Tree is the world's leading premium mixer brand, with annual revenues exceeding £380 million, and a presence in virtually every premium bar, hotel, and supermarket in the UK and beyond.",
    "The Shepherd's Bush HQ is a relatively lean operation for its scale — around 400 people globally — which means individual roles carry genuine scope and responsibility. Fever-Tree operates more like an ambitious challenger brand than a corporate FMCG giant, even though by market cap it now sits firmly in the big leagues.",
  ],
  whyWorkHere: [
    {
      title: "A genuinely world-changing brand story",
      description:
        "Fever-Tree didn't just build a product — it created a category. Working here means being close to one of the best brand-building stories in British business history.",
    },
    {
      title: "Lean team, big impact",
      description:
        "With around 400 employees globally, there's no hiding in a large department. You'll work across functions, own your area, and see the results of your work quickly.",
    },
    {
      title: "Premium everywhere",
      description:
        "Fever-Tree is stocked in Michelin-starred restaurants, five-star hotels, and the best bars in the world. The brand you represent sets a high bar — and the team lives up to it.",
    },
    {
      title: "Entrepreneurial to the core",
      description:
        "The founding philosophy — spot a gap, obsess over quality, move fast — hasn't changed. New ideas are welcomed from every part of the business, not just the top.",
    },
  ],
  values: [
    {
      emoji: "🌿",
      title: "Natural ingredients, always",
      description:
        "No artificial sweeteners, no preservatives, no shortcuts. Fever-Tree's commitment to natural, high-quality ingredients is non-negotiable — and shapes everything from sourcing to packaging.",
    },
    {
      emoji: "🔍",
      title: "Obsessive quality",
      description:
        "The quinine in Fever-Tree tonic comes from a specific region of the DRC. The ginger in their Ginger Beer is sourced from three different countries. This level of ingredient obsession runs through the whole culture.",
    },
    {
      emoji: "💡",
      title: "Entrepreneurial thinking",
      description:
        "Ideas aren't the preserve of the founders. Teams are expected to spot opportunities, challenge the status quo, and bring solutions rather than problems.",
    },
    {
      emoji: "🌍",
      title: "Responsible growth",
      description:
        "Fever-Tree has made commitments on sustainable sourcing, packaging, and carbon reduction. With 85+ export markets, the environmental footprint is taken seriously.",
    },
  ],
  perks: [
    "Private healthcare",
    "Enhanced pension scheme",
    "Extra holiday that increases with tenure",
    "Perkbox employee benefits platform",
    "Regular team drinks (occupational hazard)",
    "Hybrid working",
    "Exposure to premium hospitality partners",
    "Annual bonus scheme",
    "Wellbeing support & mental health resources",
    "Cycle to work scheme",
  ],
  popularRoles: [
    "Brand Manager",
    "National Account Manager",
    "Trade Marketing Executive",
    "Supply Chain Planner",
    "International Sales Manager",
    "Marketing Director",
    "Digital & E-Commerce Manager",
    "Sustainability Manager",
    "Insights & Analytics Manager",
    "Finance Business Partner",
  ],
};

const CompanyFeverTree = () => <CompanyCultureProfile data={feverTreeData} />;

export default CompanyFeverTree;
