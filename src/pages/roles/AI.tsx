import { Link } from "react-router-dom";
import { Brain, Code, Cpu, Network } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Code, roles: [
    { name: "ML / AI Engineer (Junior)", description: "Builds, evaluates and deploys models under the guidance of senior researchers and engineers.", salary: "£45k–£70k" },
    { name: "Research Engineer (Early Career)", description: "Implements and runs experiments, builds tooling, and supports research teams.", salary: "£60k–£90k" },
    { name: "AI Product Analyst / Data Analyst", description: "Evaluates model performance, runs analysis on usage data, and supports product decisions.", salary: "£40k–£60k" },
  ]},
  { title: "Mid Level", icon: Brain, roles: [
    { name: "Machine Learning Engineer", description: "Owns end-to-end ML systems - training, fine-tuning, evaluation and deployment in production.", salary: "£80k–£140k" },
    { name: "Applied AI Engineer", description: "Builds AI-powered features and integrations on top of foundation models.", salary: "£75k–£130k" },
    { name: "AI Product Manager", description: "Owns the roadmap for AI products - balancing capability, safety and customer needs.", salary: "£90k–£150k" },
    { name: "AI Policy / Trust & Safety", description: "Shapes responsible-use policy, red-teams models, and works with regulators.", salary: "£70k–£120k" },
  ]},
  { title: "Senior Level", icon: Cpu, roles: [
    { name: "Research Scientist", description: "Sets the agenda on novel research - alignment, interpretability, capabilities, evaluations.", salary: "£150k–£300k+" },
    { name: "Senior / Staff ML Engineer", description: "Leads the architecture of large training and inference systems and mentors others.", salary: "£140k–£280k+" },
    { name: "Forward Deployed Engineer", description: "Embeds with major customers to design, ship and tune frontier-AI deployments.", salary: "£130k–£250k+" },
  ]},
  { title: "Leadership", icon: Network, roles: [
    { name: "Head of AI / Director of Research", description: "Owns an AI org - research direction, hiring, and strategic priorities.", salary: "£250k–£500k+" },
    { name: "VP Engineering (AI Infra)", description: "Runs the engineering org behind training compute, data and inference.", salary: "£250k–£500k+" },
    { name: "Chief AI Officer", description: "Sets enterprise-wide AI strategy, safety posture and external positioning.", salary: "£300k–£700k+" },
  ]},
];

const podcasts = [
  { title: "Dwarkesh Podcast", description: "Long-form interviews with the people building frontier AI.", url: "https://www.dwarkesh.com/podcast" },
  { title: "Latent Space", description: "The AI engineer's podcast - practical, technical, weekly.", url: "https://www.latent.space/podcast" },
  { title: "No Priors", description: "Sarah Guo and Elad Gil on AI, infrastructure and the people building it.", url: "https://www.nopriors.com/" },
];

const articles = [
  { title: "Anthropic Research", source: "Anthropic", url: "https://www.anthropic.com/research" },
  { title: "OpenAI Blog", source: "OpenAI", url: "https://openai.com/blog" },
  { title: "Google DeepMind Blog", source: "Google DeepMind", url: "https://deepmind.google/discover/blog/" },
  { title: "Import AI", source: "Jack Clark", url: "https://importai.substack.com/" },
];

const courses = [
  { title: "Deep Learning Specialization", provider: "DeepLearning.AI / Coursera", description: "Andrew Ng's foundational five-course series on neural networks, CNNs, sequence models and structuring ML projects.", url: "https://www.coursera.org/specializations/deep-learning", level: "Foundations" },
  { title: "Machine Learning Specialization", provider: "Stanford / Coursera", description: "The classic ML starting point - supervised and unsupervised learning, recommender systems, reinforcement learning.", url: "https://www.coursera.org/specializations/machine-learning-introduction", level: "Foundations" },
  { title: "Practical Deep Learning for Coders", provider: "fast.ai", description: "Top-down, code-first deep learning course - free, world-class, used inside many frontier labs.", url: "https://course.fast.ai/", level: "Practical" },
  { title: "Hugging Face NLP & LLM Course", provider: "Hugging Face", description: "Transformers, fine-tuning, RAG and agents - the hands-on standard for working with modern LLMs.", url: "https://huggingface.co/learn", level: "LLMs" },
  { title: "AI Safety Fundamentals", provider: "BlueDot Impact", description: "The leading entry route into alignment, governance and AI policy careers - used by Anthropic, DeepMind and OpenAI hires.", url: "https://aisafetyfundamentals.com/", level: "Safety & Policy" },
  { title: "MLOps Specialization", provider: "DeepLearning.AI / Coursera", description: "Productionising ML - data pipelines, deployment, monitoring and lifecycle management.", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", level: "Engineering" },
  { title: "MSc Machine Learning", provider: "UCL", description: "One of the UK's most respected postgraduate ML degrees - strong feeder into DeepMind and frontier labs.", url: "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/machine-learning-msc", level: "Postgraduate" },
  { title: "MSc Artificial Intelligence", provider: "Imperial College London", description: "Rigorous AI master's covering deep learning, reinforcement learning and applied research.", url: "https://www.imperial.ac.uk/study/courses/postgraduate-taught/artificial-intelligence/", level: "Postgraduate" },
  { title: "ARENA - Alignment Research Engineer Accelerator", provider: "ARENA", description: "Free London-based intensive for engineers moving into alignment and interpretability research.", url: "https://www.arena.education/", level: "Research" },
  { title: "Anthropic Fellows / Residency", provider: "Anthropic", description: "Paid fellowship route into alignment and safety research at Anthropic - runs in London and SF.", url: "https://www.anthropic.com/careers", level: "Research" },
];

const AI = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (
      <>
        <RoleOverview name="AI" data={{
          summary: "AI is the fastest-growing functional career path in the world right now. It covers the people who build, train, deploy, evaluate and govern modern AI systems - from frontier-model labs (Anthropic, OpenAI, Google DeepMind) to AI-native startups and the AI teams now embedded in every major business. UK-based AI roles currently command the strongest tech compensation outside of investment banking.",
          dayToDay: [
            "Training, fine-tuning and evaluating models",
            "Designing data pipelines, prompts and evals",
            "Building AI-powered product features and integrations",
            "Researching alignment, interpretability and capabilities",
            "Working with policy, safety and trust teams",
            "Deploying frontier models with enterprise customers",
          ],
          skills: ["Python & PyTorch / JAX", "ML / Deep Learning", "LLMs & Prompt Engineering", "Evals & Red-Teaming", "Distributed Systems", "Statistics & Research Methods"],
          traits: [
            "Curious - the field changes monthly",
            "Rigorous - evals beat intuition",
            "Safety-minded - capability without responsibility is a liability",
            "Collaborative - research, engineering and product live very close together",
          ],
          salary: "£40k entry → £700k+ at frontier-lab leadership",
          entryTip: "Routes in: ML / CS master's, AI residency programmes (DeepMind, Anthropic Fellows), open-source contributions, building public AI projects. Anthropic, OpenAI and Google DeepMind all have strong London hiring and currently set the UK pay benchmark.",
        }} />
        <CareerMap title="AI Career Path" subtitle="" stages={careerStages} industry="ai" />
      </>
    ) },
    { id: "read", label: "Read", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2>
        <div className="space-y-4">{articles.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p>
          </a>
        ))}</div>
      </>
    ) },
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={podcasts as PodcastItem[]} />
      </>
    ) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="ai" roleName="AI" /> },
    { id: "learn", label: "Learn", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Learn AI<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">A curated path from foundations to frontier - the courses, master's degrees and research programmes that actually feed into AI hiring at Anthropic, OpenAI, Google DeepMind and beyond.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="group border border-border p-5 hover:border-primary transition-colors flex flex-col gap-2">
              <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{c.title}</h3>
              <p className="text-muted-foreground font-body text-xs leading-relaxed">{c.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                <span className="text-xs font-display font-600 text-foreground/70">{c.provider}</span>
                <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground">{c.level}</span>
              </div>
            </a>
          ))}
        </div>
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="AI" searchQuery="AI machine learning conference London UK" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-6 bg-primary/5">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Frontier Labs</p>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">AI Lab Jobs<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Live UK-eligible roles at <span className="font-700 text-foreground">Anthropic</span>, <span className="font-700 text-foreground">OpenAI</span> and <span className="font-700 text-foreground">Google DeepMind</span> - research, engineering, applied, policy and go-to-market.
          </p>
          <Link to="/marketplace?industry=ai#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View AI Jobs</Link>
        </div>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Direct Careers Pages<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Apply directly via the labs' own boards.</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://www.anthropic.com/careers/jobs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-foreground px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Anthropic ↗</a>
            <a href="https://openai.com/careers/search/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-foreground px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">OpenAI ↗</a>
            <a href="https://boards.greenhouse.io/deepmind" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-foreground px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Google DeepMind ↗</a>
          </div>
        </div>
        <IndustryCVBuilder industry="AI" stages={careerStages} />
      </>
    ) },
  ];

  return <RolePageLayout name="AI" description="The people building, training, deploying and governing modern AI systems - from frontier labs to AI-native startups and enterprise AI teams." tabs={tabs} category="business" />;
};

export default AI;
