// Curated external mentoring organisations, keyed by industry slug.
// Inspired by Cat's Mother (music). UK-first, free or low-cost where possible.
//
// STRICT RULE: every URL must land on a page that is explicitly a
// mentoring scheme / programme / 1:1 matching service — NOT a general
// industry portal, association homepage, or company site. If we can't
// verify a dedicated mentoring page, the industry is left empty and the
// section is hidden in the panel.

export interface MentoringOrg {
  name: string;
  url: string;
  blurb: string;
  /** Short eligibility line, e.g. "Women aged 18-25, UK & Ireland". */
  whoFor?: string;
  /** Optional cost note, defaults to "Free". */
  cost?: string;
}

// Industry slug → list of mentoring orgs.
// Use the same slugs as src/data/industries.ts.
export const MENTORING_ORGS: Record<string, MentoringOrg[]> = {
  music: [
    {
      name: "Cat's Mother",
      url: "https://www.catsmother.co.uk",
      blurb: "Free 30-minute meetings between young emerging creatives and professional women working in music and the creative industries.",
      whoFor: "Women aged 18–25 from low-income backgrounds, UK & Ireland",
    },
    {
      name: "Youth Music NextGen",
      url: "https://network.youthmusic.org.uk/nextgen",
      blurb: "Industry network giving 18–25-year-olds free advice, mentoring and paid opportunities in the music industry.",
      whoFor: "18–25 year olds, UK",
    },
  ],
  cinema: [
    {
      name: "ScreenSkills Mentoring",
      url: "https://www.screenskills.com/developing-your-career/mentoring/",
      blurb: "Free mentoring schemes across film, TV, games, VFX and animation for new entrants and mid-career professionals.",
      whoFor: "UK screen-industry workers",
    },
    {
      name: "Women in Film & TV (UK) Mentoring",
      url: "https://wftv.org.uk/mentoring/",
      blurb: "Year-long structured mentoring for women in screen industries, pairing mentees with senior industry mentors.",
      whoFor: "Women with 5+ years' experience",
    },
  ],
  fashion: [
    {
      name: "Graduate Fashion Foundation Mentoring",
      url: "https://graduatefashionfoundation.com/gff-mentoring-programme",
      blurb: "Year-long 1:1 mentoring pairing fashion graduates with senior industry mentors across design, buying, marketing and production.",
      whoFor: "UK fashion graduates & early-career",
    },
    {
      name: "Fashion Angel Business Mentoring",
      url: "https://fashion-angel.co.uk/business-mentoring/",
      blurb: "1:1 business mentoring for fashion and textile entrepreneurs scaling their own brand or studio.",
      whoFor: "UK fashion founders",
      cost: "Paid",
    },
    {
      name: "Fashion Minority Report Mentorship",
      url: "https://fashionminorityreport.com/mentorship/",
      blurb: "Structured mentoring programme connecting under-represented talent with senior leaders across the global fashion industry.",
      whoFor: "Under-represented fashion talent",
    },
    {
      name: "Hasou Fashion Academy Mentorship",
      url: "https://hasoufashionacademy.com/mentorship-programmes/",
      blurb: "1:1 mentorship for emerging designers covering collection development, production and launching a fashion business.",
      whoFor: "Emerging fashion designers",
      cost: "Paid",
    },
  ],

  football: [
    {
      name: "Women in Football Mentoring",
      url: "https://www.womeninfootball.co.uk/mentoring/",
      blurb: "Free mentoring scheme pairing women working in football with senior industry mentors.",
      whoFor: "Women working in football, UK",
    },
  ],
  journalism: [
    {
      name: "Journo Resources Mentoring",
      url: "https://www.journoresources.org.uk/mentoring/",
      blurb: "Free industry mentoring for early-career journalists from underrepresented backgrounds.",
      whoFor: "Early-career journalists, UK",
    },
    {
      name: "Women in Journalism Mentoring",
      url: "https://womeninjournalism.co.uk/what-we-do/mentoring/",
      blurb: "Mentoring scheme connecting student and early-career women journalists with senior mentors.",
      whoFor: "Women in journalism, UK",
    },
  ],
  money: [
    {
      name: "Girls Are INvestors (GAIN) Mentoring",
      url: "https://girlsareinvestors.org/our-programmes/mentoring/",
      blurb: "1:1 mentoring with investment professionals for young women considering a career in investment management.",
      whoFor: "Women, 16+, UK",
    },
    {
      name: "upReach",
      url: "https://upreach.org.uk/",
      blurb: "Free 1:1 employer mentoring for undergraduates from lower socio-economic backgrounds across professional services.",
      whoFor: "Undergraduates, UK",
    },
    {
      name: "Lloyd's Mentoring Programme",
      url: "https://www.lloyds.com/resources-and-services/learning-at-lloyds/mentoring-programme",
      blurb: "Cohort-based mentoring across the Lloyd's of London insurance market, covering technical skills, leadership and market knowledge.",
      whoFor: "Lloyd's insurance market professionals",
    },
    {
      name: "CII Connect e-mentoring",
      url: "https://www.cii.co.uk/membership/benefits/connect/connect-e-mentoring/",
      blurb: "Free e-mentoring platform from the Chartered Insurance Institute matching members with experienced insurance and financial-services mentors.",
      whoFor: "CII members, UK insurance",
    },
    {
      name: "Airmic Mentoring",
      url: "https://www.airmic.com/mentoring-scheme",
      blurb: "Mentoring scheme for risk and insurance professionals using bespoke matching technology to pair members with senior mentors.",
      whoFor: "Airmic members, UK risk & insurance",
    },
  ],
  gaming: [
    {
      name: "Limit Break",
      url: "https://www.limitbreak.co.uk/",
      blurb: "Free year-long 1:1 mentorship for women and non-binary people in the UK games industry.",
      whoFor: "Women & non-binary, UK games industry",
    },
  ],
  influencing: [
    {
      name: "Creator Mentor",
      url: "https://www.creatormentor.co/",
      blurb: "Peer-led mentoring for content creators looking to grow their channels and turn creating into a career.",
      whoFor: "Working content creators",
    },
  ],
  charity: [
    {
      name: "Charity Mentors UK",
      url: "https://charitymentorsuk.org/",
      blurb: "Free 1:1 mentoring for CEOs and senior leaders of small UK charities, delivered by senior business volunteers.",
      whoFor: "Charity leaders, UK",
    },
  ],
  health: [
    {
      name: "NHS Leadership Academy Mentoring",
      url: "https://www.leadershipacademy.nhs.uk/programmes/mentoring/",
      blurb: "Free mentoring scheme connecting NHS staff with senior healthcare leaders.",
      whoFor: "NHS staff, UK",
    },
    {
      name: "Medic Mentor",
      url: "https://medicmentor.org/",
      blurb: "Mentoring for students wanting to study medicine, dentistry and other healthcare degrees.",
      whoFor: "Aspiring healthcare students, UK",
    },
  ],
  travel: [
    {
      name: "Women in Travel CIC Mentoring",
      url: "https://womenintravelcic.com/our-services/mentoring/",
      blurb: "1:1 mentoring and employability support for underrepresented women in the travel industry.",
      whoFor: "Women in travel, UK",
    },
  ],
  hospitality: [
    {
      name: "Otolo",
      url: "https://www.myotolo.com/pages/mentoring",
      blurb: "Free mentoring scheme aimed at uplifting hospitality professionals, with monthly 1:1 sessions plus additional coaching hours.",
      whoFor: "UK & European hospitality staff",
    },
    {
      name: "Institute of Hospitality Mentoring",
      url: "https://www.instituteofhospitality.org/professional-development/mentoring/",
      blurb: "Long-running global mentoring programme matching students, apprentices and entry-level talent with senior hospitality leaders.",
      whoFor: "Hospitality students & early-career",
    },
  ],
  beauty: [
    {
      name: "British Beauty Council Future Talent Mentor Programme",
      url: "https://britishbeautycouncil.com/mentor-programme/",
      blurb: "Industry-backed mentoring scheme helping young people explore career pathways across the UK beauty industry.",
      whoFor: "Young people entering UK beauty",
    },
  ],
  "interior-design": [
    {
      name: "BIID Portfolio Support Mentoring",
      url: "https://biid.org.uk/events/portfolio-support-online-mentoring-sessions",
      blurb: "Online 1:1 portfolio mentoring sessions from the British Institute of Interior Design for emerging interior designers.",
      whoFor: "Emerging UK interior designers",
    },
  ],
  cars: [
    {
      name: "MICA Mentorships",
      url: "https://www.mica.org.uk/mentorships/",
      blurb: "1:1 mentoring pairing emerging automotive PR and communications professionals with senior industry directors via the Motoring Industry Communicators Association.",
      whoFor: "UK auto PR & comms",
    },
    {
      name: "Martec Automotive Coaching",
      url: "https://martec.co.uk/automotive-coaching/",
      blurb: "1:1 coaching and mentoring for UK automotive retail and dealer professionals, covering leadership, sales and management development.",
      whoFor: "UK automotive retail & dealership staff",
      cost: "Paid",
    },
  ],
  "formula-1": [
    {
      name: "Girls on Track UK",
      url: "https://girlsontrackuk.org/",
      blurb: "FIA / Motorsport UK initiative running mentoring, karting and skills programmes for girls and women into motorsport, including the BWT Alpine F1 Girls Mentoring Scheme.",
      whoFor: "Girls & women in UK motorsport",
    },
  ],
  beer: [
    {
      name: "Women in Beer UK Mentorship",
      url: "https://www.womeninbeer.co.uk/mentorship",
      blurb: "Cohort-based mentorship pairing women across UK brewing, hospitality, marketing and beer chemistry with experienced industry mentors.",
      whoFor: "Women in UK beer",
    },
    {
      name: "Pink Boots Society Mentor Match",
      url: "https://www.pinkbootssociety.org/news/mentor-program",
      blurb: "Global online mentor-matching programme for women and non-binary people working in the fermented and alcoholic beverage industry.",
      whoFor: "Women & non-binary in beer/brewing (incl. UK)",
    },
  ],
  coffee: [
    {
      name: "Well Grounded Coffee Leaders Programme",
      url: "https://www.wellgrounded.org/coffee-leaders-programme",
      blurb: "6-month part-time training and 1:1 mentoring to grow the next generation of diverse senior leaders in UK speciality coffee.",
      whoFor: "Coffee pros with 3+ years' experience, UK",
    },
  ],
  jewellery: [
    {
      name: "Goldsmiths' Centre Business Mentoring",
      url: "https://www.goldsmiths-centre.org/learn-and-upskill/business-mentoring/",
      blurb: "Up to 12 months of 1:1 business mentoring for early-career jewellers and silversmiths, delivered by experienced industry professionals.",
      whoFor: "Early-career UK jewellers & silversmiths",
    },
  ],
  footwear: [
    {
      name: "British Footwear Association Accelerated Development Programme",
      url: "https://britishfootwearassociation.co.uk/",
      blurb: "BFA's annual mentoring programme pairing emerging UK footwear brands with senior industry mentors for tailored business and product guidance.",
      whoFor: "Emerging UK footwear brands",
    },
  ],
  "horse-racing": [
    {
      name: "Women in Racing Mentoring Programme",
      url: "https://womeninracing.co.uk/wir-mentoring-programme/",
      blurb: "Free 10+ year-running mentoring programme pairing WiR members across British racing with senior mentors covering non-exec, corporate and entrepreneurial paths.",
      whoFor: "Women in UK horse racing",
    },
  ],
  psychotherapy: [
    {
      name: "BACP EDI Mentoring Scheme",
      url: "https://www.bacp.co.uk/about-us/mentoring-scheme/",
      blurb: "Mentoring scheme from the British Association for Counselling and Psychotherapy for student and trainee counsellors from marginalised and racialised communities.",
      whoFor: "BACP student & trainee counsellors, UK",
    },
  ],
  // bakery, grocery, teaching, wellness: no verified dedicated UK 1:1 mentoring scheme found
  //   (CBA = funding, IGD Leading Edge = network, ECF = statutory induction, CIMSPA = standards body).
  farming: [
    {
      name: "Henry Plumb Foundation",
      url: "https://www.thehenryplumbfoundation.org.uk/",
      blurb: "Free mentoring, business advice and seed grants for young people starting their own venture in UK agriculture.",
      whoFor: "Under-30s in farming, UK",
    },
  ],
  pets: [
    {
      name: "BVA Young Vet Network",
      url: "https://www.bva.co.uk/membership-and-community/young-vet-network/",
      blurb: "Peer mentoring, events and resources for vets in the first eight years of practice.",
      whoFor: "Early-career vets, UK",
    },
  ],
  physiotherapy: [
    {
      name: "CSP Mentoring",
      url: "https://www.csp.org.uk/professional-clinical/cpd-and-education/professional-networks/mentoring",
      blurb: "Mentoring scheme run by the Chartered Society of Physiotherapy for members at every career stage.",
      whoFor: "Chartered physiotherapists, UK",
    },
  ],
  "estate-agency": [
    {
      name: "Agents Together",
      url: "https://agentstogetheruk.com/",
      blurb: "Free, confidential 1:1 mentoring for UK estate and letting agents, pairing newer agents with experienced industry mentors.",
      whoFor: "UK estate & letting agency professionals",
    },
  ],
};

export function getOrgsForIndustry(slug?: string | null): MentoringOrg[] {
  if (!slug) return [];
  return MENTORING_ORGS[slug.toLowerCase()] || [];
}
