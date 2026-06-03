import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-teachfirst-cover.jpg";

const data: CompanyCultureData = {
  slug: "teach-first",
  name: "Teach First",
  tagline: "Recruiting top graduates into the classrooms that need them most.",
  industry: "Teaching",
  industrySlug: "teaching",
  coverImage,
  website: "https://www.teachfirst.org.uk",
  careersUrl: "https://www.teachfirst.org.uk/training-programme",
  founded: "2002",
  hq: "London",
  employees: "1,200+",
  sectors: ["Education", "Charity", "Leadership Development", "Social Impact"],
  glassdoor: 3.8,
  about: [
    "Teach First was founded in 2002 by Brett Wigdortz, inspired by Teach For America. The model is simple but powerful: recruit the best graduates, train them intensively, and place them in schools serving low-income communities for a minimum of two years.",
    "Over 16,000 teachers have been trained through the programme, and Teach First has become one of the UK's largest graduate recruiters - competing with investment banks and consultancies for top talent. The pitch: use your degree to make a difference, earn a salary, and gain a PGCE and QTS.",
    "The organisation has evolved beyond its initial teaching programme. Teach First now runs leadership development for experienced teachers, school leadership programmes, and policy campaigns on educational inequality. It operates across England and Wales.",
    "As a charity, Teach First is funded through a mix of government funding, corporate partnerships, and philanthropy. Its alumni network - the 'Teach First community' - includes headteachers, social entrepreneurs, MPs, and business leaders who maintain their commitment to educational equity.",
  ],
  whyWorkHere: [
    { title: "Change lives from day one", description: "Within weeks of joining, you're in a classroom making a tangible difference to young people's life chances. The impact is immediate and visible." },
    { title: "World-class training", description: "The training programme is intensive, challenging, and highly regarded. You'll earn a PGCE and QTS while being supported by experienced mentors." },
    { title: "Extraordinary alumni network", description: "The Teach First community includes 16,000+ alumni across education, policy, business, and social enterprise. The network opens doors for decades." },
    { title: "Leadership development", description: "Teach First doesn't just train teachers - it develops leaders. The skills you gain (resilience, communication, impact) transfer to any career." },
  ],
  values: [
    { emoji: "🎓", title: "Every child deserves an excellent education", description: "This is Teach First's founding belief. The organisation exists to close the attainment gap between children from low-income and affluent backgrounds." },
    { emoji: "💪", title: "High expectations", description: "Teach First sets high expectations for participants, partner schools, and itself. The programme is deliberately challenging because the problem is urgent." },
    { emoji: "🤝", title: "Collaboration over competition", description: "Teachers, schools, and communities working together. Teach First builds partnerships rather than competing with the existing education system." },
    { emoji: "📈", title: "Evidence and impact", description: "Teach First measures its impact rigorously. Programme design, school partnerships, and policy positions are all informed by evidence." },
  ],
  perks: ["Competitive salary (unqualified teacher scale)", "PGCE & QTS qualification", "Intensive training & mentoring", "Alumni network access", "Leadership development", "School holidays", "Pension scheme (Teachers' Pension)", "Wellbeing support", "Career transition support", "Bursaries available (some subjects)"],
  popularRoles: ["Teaching Programme Participant", "Programme Coordinator", "School Partnerships Manager", "Policy & Research Analyst", "Fundraising Manager", "Marketing & Recruitment", "Leadership Development Coach", "Events Manager"],
};

const CompanyTeachFirst = () => <CompanyCultureProfile data={data} />;
export default CompanyTeachFirst;
