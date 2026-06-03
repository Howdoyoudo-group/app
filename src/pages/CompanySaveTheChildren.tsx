import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-savethechildren-cover.jpg";

const data: CompanyCultureData = {
  slug: "save-the-children",
  name: "Save the Children UK",
  tagline: "Fighting for children's rights in over 100 countries - since 1919.",
  industry: "Charity",
  industrySlug: "charity",
  coverImage,
  website: "https://www.savethechildren.org.uk",
  careersUrl: "https://jobs.savethechildren.org.uk/jobs/",
  founded: "1919",
  hq: "London",
  employees: "25,000+ (globally)",
  sectors: ["Charity", "International Development", "Advocacy", "Education"],
  glassdoor: 3.7,
  about: [
    "Save the Children was founded in 1919 by Eglantyne Jebb, who drafted the Declaration of the Rights of the Child - the precursor to the UN Convention on the Rights of the Child. From its very beginning, the organisation has been driven by a belief that every child deserves a future.",
    "Today, Save the Children operates in over 100 countries, reaching approximately 40 million children per year through programmes in education, health, nutrition, child protection, and emergency response.",
    "The UK arm is one of 30 members of Save the Children International. It raises over £400 million annually and combines frontline programme delivery with high-level advocacy, influencing government policy on issues from child poverty to refugee rights.",
    "As one of the UK's largest and most established charities, Save the Children offers the rare combination of global scale and deep subject-matter expertise - making it a benchmark for careers in international development and the non-profit sector.",
  ],
  whyWorkHere: [
    { title: "Global impact, tangible results", description: "Your work directly improves children's lives - from emergency response in conflict zones to education programmes that reach millions." },
    { title: "World-class policy influence", description: "Save the Children shapes government policy at the highest levels. If you want to change systems, not just deliver services, this is the place." },
    { title: "Career development across borders", description: "With offices in 100+ countries, there are opportunities to move between roles, regions, and functions throughout your career." },
    { title: "Values-driven culture", description: "People here are motivated by mission, not money. The culture is collaborative, intellectually rigorous, and deeply committed to equity." },
  ],
  values: [
    { emoji: "🧒", title: "Children first", description: "Every decision, programme, and campaign starts and ends with the question: what's best for children? This isn't rhetoric - it's operational doctrine." },
    { emoji: "🌍", title: "Accountability", description: "Save the Children holds itself to the highest standards of transparency, governance, and safeguarding. Trust is earned through evidence and rigour." },
    { emoji: "✊", title: "Ambition", description: "The organisation sets bold goals - ending preventable child deaths, ensuring every child learns - and builds the evidence base and coalitions to achieve them." },
    { emoji: "🤝", title: "Collaboration", description: "Impact at this scale requires partnerships - with governments, communities, donors, and other NGOs. No one changes the world alone." },
  ],
  perks: ["Generous annual leave", "Flexible & hybrid working", "Pension scheme (employer contribution)", "Employee assistance programme", "Season ticket loan", "Cycle to work scheme", "Enhanced parental leave", "Learning & development budget", "Sabbatical policy", "Staff networks & inclusion groups"],
  popularRoles: ["Programme Manager", "Policy Adviser", "Fundraising Manager", "Communications Officer", "Monitoring & Evaluation Specialist", "Humanitarian Coordinator", "Grants Manager", "Advocacy Lead"],
};

const CompanySaveTheChildren = () => <CompanyCultureProfile data={data} />;
export default CompanySaveTheChildren;
