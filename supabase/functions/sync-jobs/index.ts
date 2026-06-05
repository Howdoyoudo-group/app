const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Industry → value chain stages mapping
const INDUSTRY_STAGES: Record<string, string[]> = {
  beer: ["Brewing & Production", "Quality & Lab", "Taproom & Retail", "Sales & Distribution", "Marketing & Brand", "Operations"],
  cinema: ["Idea & Story", "Pre-Production", "Production", "Post-Production", "Distribution", "Exhibition"],
  coffee: ["Farm & Origin", "Processing", "Roasting", "Distribution", "Retail & Café", "Cup & Consumer"],
  fashion: ["Design", "Sourcing", "Production", "Marketing", "Retail", "Consumer"],
  football: ["Youth Development", "Scouting & Recruitment", "Club Operations", "Matchday", "Broadcasting", "Commercial"],
  music: ["Creation", "Recording", "Production", "Distribution", "Marketing", "Live & Exhibition"],
  "food-drink": ["Concept & Design", "Kitchen", "Front of House", "Supply Chain", "Marketing", "Operations"],
  grocery: ["Sourcing", "Manufacturing", "Distribution", "Merchandising", "Retail Ops", "Consumer"],
  teaching: ["Policy & Governance", "Training & CPD", "Curriculum", "Classroom", "Assessment", "Leadership"],
  "interior-design": ["Brief & Research", "Concept", "Design Development", "Procurement", "Build & Install", "Handover & Styling"],
  charity: ["Mission & Cause", "Strategy", "Fundraising", "Operations", "Delivery", "Impact & Reporting"],
  physiotherapy: ["Education & Training", "NHS & Primary Care", "Sports & Performance", "Private Practice", "Specialist Areas", "Leadership"],
  psychotherapy: ["Training & Qualification", "NHS & IAPT", "Private Practice", "Specialist Populations", "Supervision & Ethics", "Leadership & Research"],
  pets: ["Veterinary & Animal Health", "Pet Food & Nutrition", "Pet Retail & E-Commerce", "Pet Services & Wellbeing", "Marketing & Brand", "Business & Operations"],
  travel: ["Airlines & Aviation", "Rail & Public Transport", "Hotels & Accommodation", "Tour Operators & Experiences", "Travel Tech & Platforms", "Business & Commercial"],
};

// Stage → role categories mapping
const STAGE_ROLES: Record<string, Record<string, string[]>> = {
  beer: {
    "Brewing & Production": ["Head Brewer", "Brewer", "Cellar Operative", "Packaging Operator", "Brewing Assistant"],
    "Quality & Lab": ["Quality Manager", "Lab Technician", "Microbiologist", "Sensory Analyst"],
    "Taproom & Retail": ["Taproom Manager", "Bartender", "Bar Staff", "Retail Manager", "Front of House"],
    "Sales & Distribution": ["Sales Manager", "Account Manager", "Distribution Manager", "Wholesale Manager", "Export Manager"],
    "Marketing & Brand": ["Brand Manager", "Marketing Manager", "Content Creator", "Events Coordinator", "PR Manager"],
    "Operations": ["Operations Manager", "Logistics Manager", "Warehouse Operative", "Finance Manager", "HR Manager"],
  },
  cinema: {
    "Idea & Story": ["Screenwriter", "Script Reader", "Story Editor", "Script Consultant", "IP Acquisitions", "Development Executive", "Literary Agent"],
    "Pre-Production": ["Producer", "Line Producer", "Casting Director", "Location Scout", "Production Designer", "Storyboard Artist", "Production Coordinator"],
    "Production": ["Director", "Cinematographer", "1st Assistant Director", "Sound Recordist", "Gaffer", "Grip", "Script Supervisor", "Camera Operator"],
    "Post-Production": ["Film Editor", "Colourist", "VFX Artist", "Sound Designer", "Composer", "Foley Artist", "Post-Production Supervisor"],
    "Distribution": ["Sales Agent", "Distribution Executive", "Marketing Manager", "Publicist", "Festival Strategist", "Acquisitions Executive"],
    "Exhibition": ["Cinema Manager", "Programmer", "Projectionist", "Box Office Manager", "Events Coordinator", "Operations Manager"],
  },
  football: {
    "Youth Development": ["Academy Coach", "Youth Development Officer", "Academy Director", "Sports Scientist", "Physiotherapist"],
    "Scouting & Recruitment": ["Chief Scout", "Regional Scout", "Data Analyst", "Video Analyst", "Recruitment Manager"],
    "Club Operations": ["CEO", "Football Director", "Head of Operations", "Stadium Manager", "HR Manager", "Finance Director"],
    "Matchday": ["First Team Manager", "Assistant Coach", "Goalkeeper Coach", "Performance Analyst", "Kit Manager", "Team Doctor"],
    "Broadcasting": ["Commentator", "Pundit", "Producer", "Camera Operator", "Graphics Operator", "Digital Content Manager"],
    "Commercial": ["Commercial Director", "Sponsorship Manager", "Ticketing Manager", "Retail Manager", "Community Officer", "Brand Manager"],
  },
  music: {
    "Creation": ["Songwriter", "Composer", "Lyricist", "Music Producer", "Beat Maker", "Arranger", "Session Musician"],
    "Recording": ["Recording Engineer", "Studio Manager", "Session Vocalist", "A&R Scout", "Demo Producer"],
    "Production": ["Mixing Engineer", "Mastering Engineer", "Sound Designer", "Audio Programmer"],
    "Distribution": ["Distribution Manager", "Sync Licensing Manager", "Royalties Analyst", "Label Manager"],
    "Marketing": ["Artist Manager", "PR & Publicity", "Social Media Manager", "Playlist Strategist", "Music Journalist"],
    "Live & Exhibition": ["Tour Manager", "Live Sound Engineer", "Promoter", "Festival Programmer", "Venue Manager", "Booking Agent"],
  },
  fashion: {
    "Design": ["Fashion Designer", "Textile Designer", "Pattern Cutter", "Technical Designer", "Creative Director", "Trend Forecaster"],
    "Sourcing": ["Sourcing Manager", "Fabric Buyer", "Sustainability Officer", "Quality Inspector", "Compliance Manager"],
    "Production": ["Production Manager", "Garment Technologist", "Sample Machinist", "Quality Controller"],
    "Marketing": ["Brand Manager", "PR Manager", "Social Media Manager", "Content Creator", "Stylist", "Photographer"],
    "Retail": ["Retail Manager", "Visual Merchandiser", "Buyer", "Store Manager", "E-Commerce Manager"],
    "Consumer": ["Customer Experience Lead", "Community Manager", "Loyalty Programme Manager", "Data Analyst"],
  },
  coffee: {
    "Farm & Origin": ["Coffee Farmer", "Agronomist", "Q Grader", "Origin Buyer", "Sustainability Manager"],
    "Processing": ["Processing Manager", "Quality Controller", "Green Coffee Trader", "Import Specialist"],
    "Roasting": ["Head Roaster", "Production Roaster", "Quality Assurance", "R&D / Blend Developer"],
    "Distribution": ["Wholesale Manager", "Account Manager", "Supply Chain Analyst", "E-Commerce Manager"],
    "Retail & Café": ["Café Manager", "Head Barista", "Barista Trainer", "Shift Supervisor", "Operations Manager"],
    "Cup & Consumer": ["Brand Strategist", "Content Creator", "Events Coordinator", "Coffee Educator"],
  },
};

function classifyJob(title: string, description: string, industry: string): { stage: string; roleCategory: string } {
  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  const combined = `${titleLower} ${descLower}`;
  
  const stages = STAGE_ROLES[industry];
  if (!stages) return { stage: "General", roleCategory: "General" };

  for (const [stageName, roles] of Object.entries(stages)) {
    for (const role of roles) {
      if (combined.includes(role.toLowerCase())) {
        return { stage: stageName, roleCategory: role };
      }
    }
  }

  // Keyword-based fallback classification
  const keywordMap: Record<string, string[]> = {
    "marketing": ["marketing", "brand", "social media", "content", "pr ", "publicity", "communications"],
    "production": ["production", "manufacturing", "factory", "quality"],
    "operations": ["operations", "manager", "coordinator", "logistics", "supply chain"],
    "creative": ["design", "creative", "art ", "visual", "writer", "editor"],
    "commercial": ["sales", "commercial", "business development", "account", "partnerships"],
    "technical": ["engineer", "developer", "technician", "analyst", "data"],
  };

  for (const [category, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        // Find best matching stage
        const industryStages = INDUSTRY_STAGES[industry] || [];
        const matchedStage = industryStages.find(s => s.toLowerCase().includes(category)) || industryStages[Math.floor(industryStages.length / 2)] || "General";
        return { stage: matchedStage, roleCategory: title };
      }
    }
  }

  return { stage: INDUSTRY_STAGES[industry]?.[0] || "General", roleCategory: title };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { industry, jobs: externalJobs } = await req.json();

    if (!industry || !externalJobs || !Array.isArray(externalJobs)) {
      return new Response(
        JSON.stringify({ success: false, error: "industry and jobs[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize and classify each job
    const normalizedJobs = externalJobs.map((job: any) => {
      const { stage, roleCategory } = classifyJob(
        job.title || job.job_title || "",
        job.description || "",
        industry
      );

      return {
        title: job.title || job.job_title,
        company: job.company || "Unknown",
        industry,
        value_chain_stage: job.value_chain_stage || stage,
        role_category: job.role_category || roleCategory,
        location: job.location || null,
        type: job.type || job.job_type || "Full-time",
        salary: job.salary || null,
        description: job.description || null,
        url: job.apply_url || job.url || "",
        source_url: job.source || job.source_url || null,
        expires_at: job.expires_at || null,
      };
    });

    // Deduplicate by checking existing URLs
    const urls = normalizedJobs.map((j: any) => j.url).filter(Boolean);
    const { data: existing } = await supabase
      .from("jobs")
      .select("url")
      .in("url", urls);

    const existingUrls = new Set((existing || []).map((e: any) => e.url));
    const newJobs = normalizedJobs.filter((j: any) => j.url && !existingUrls.has(j.url));

    // Insert new jobs
    let inserted = 0;
    if (newJobs.length > 0) {
      const { error: insertError, data: insertedData } = await supabase
        .from("jobs")
        .insert(newJobs)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      inserted = insertedData?.length || 0;
    }

    // Clean up expired listings
    const { data: expired } = await supabase
      .from("jobs")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null)
      .select("id");

    const expiredCount = expired?.length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        duplicatesSkipped: normalizedJobs.length - newJobs.length,
        expiredRemoved: expiredCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-jobs error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
