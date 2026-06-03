import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-tomdixon-cover.jpg";

const data: CompanyCultureData = {
  slug: "tom-dixon",
  name: "Tom Dixon",
  tagline: "Self-taught designer turned global brand - lighting, furniture, and beyond.",
  industry: "Interior Design",
  industrySlug: "interior-design",
  coverImage,
  website: "https://www.tomdixon.net",
  careersUrl: "https://www.tomdixon.net/en_gb/jobs",
  founded: "2002",
  hq: "London",
  employees: "200+",
  sectors: ["Interior Design", "Product Design", "Hospitality", "Retail"],
  glassdoor: 3.6,
  about: [
    "Tom Dixon is one of the most celebrated British designers of his generation - and he's entirely self-taught. Starting as a welder and musician in the 1980s London scene, he began making furniture from salvaged materials, eventually becoming Creative Director of Habitat before launching his own brand in 2002.",
    "The Tom Dixon brand spans lighting, furniture, and accessories - with iconic products like the Beat pendant, Melt lamp, and Mirror Ball becoming fixtures in hotels, restaurants, and homes worldwide. The Coal Office HQ in King's Cross doubles as a showroom, restaurant, and creative studio.",
    "What makes Tom Dixon unusual is its vertical integration. The company designs, manufactures (through partners), retails (through its own stores and e-commerce), and even operates hospitality venues - giving employees exposure to the full chain from sketch to shelf.",
    "The brand has expanded globally with showrooms in New York, Hong Kong, and Shanghai, while maintaining its London identity. Recent projects include designing entire hotel interiors, restaurant concepts, and even a modular housing prototype.",
  ],
  whyWorkHere: [
    { title: "Design is the product and the culture", description: "At Tom Dixon, design isn't a department - it's the entire point. Everyone from the warehouse team to the CEO understands the importance of aesthetic quality." },
    { title: "Coal Office is extraordinary", description: "The HQ at Coal Drops Yard, King's Cross is one of the most beautiful workplaces in London. Part office, part showroom, part restaurant - it's an immersive brand experience." },
    { title: "End-to-end brand experience", description: "You'll see design through from concept to production to retail to hospitality. Few brands offer this breadth in one place." },
    { title: "Small team, big reputation", description: "With ~200 people, Tom Dixon is small enough to give everyone visibility and ownership, but influential enough to be globally recognised." },
  ],
  values: [
    { emoji: "🔨", title: "Make things", description: "Tom Dixon started by welding sculptures. The brand's DNA is about making - hands-on, physical, tangible. Design thinking over design theory." },
    { emoji: "💡", title: "Innovation through materials", description: "From hand-beaten brass to bio-plastic, the brand explores what materials can do. Material innovation drives product innovation." },
    { emoji: "🏭", title: "Industrial meets luxury", description: "Tom Dixon's aesthetic sits at the intersection of raw industrial craft and refined luxury. That tension is what makes the work distinctive." },
    { emoji: "🌐", title: "Design without borders", description: "The brand works across product, interiors, hospitality, and architecture. Disciplines overlap and boundaries blur - by design." },
  ],
  perks: ["Staff discount on products", "Flexible working", "Pension scheme", "Employee assistance programme", "Design industry events", "Coal Office restaurant discount", "Sample sales", "Creative development time", "International travel opportunities", "Annual team retreats"],
  popularRoles: ["Product Designer", "Interior Designer", "Retail Manager", "E-Commerce Manager", "Visual Merchandiser", "Brand Marketing Manager", "Production Coordinator", "Showroom Host"],
};

const CompanyTomDixon = () => <CompanyCultureProfile data={data} />;
export default CompanyTomDixon;
