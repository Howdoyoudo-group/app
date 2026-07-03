const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CareerSource = {
  company: string;
  url: string;
  industry: string;
};

type NormalizedJob = {
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  description: string | null;
  url: string;
  tags: string[];
  industry: string;
  type: string;
  work_mode: string;
  featured: boolean;
  source_url: string;
  value_chain_stage: string | null;
  role_category: string | null;
};

const CAREER_SOURCES: CareerSource[] = [
  // ===== Specialist UK aggregators (no Adzuna overlap) =====
  // Hospitality / Food & Drink - Caterer.com (~10k UK hospitality jobs)
  { company: "Caterer.com", url: "https://www.caterer.com/jobs", industry: "food-drink" },
  { company: "Caterer.com (Bakery)", url: "https://www.caterer.com/jobs/bakery", industry: "bakery" },
  { company: "Caterer.com (Coffee)", url: "https://www.caterer.com/jobs/barista", industry: "coffee" },
  { company: "Caterer.com (Beer)", url: "https://www.caterer.com/jobs/bar", industry: "beer" },
  // FashionJobs UK removed - site returns 403 on detail pages, only aggregator URLs were captured
  // Charity - CharityJob.co.uk (UK's largest third-sector board)
  { company: "CharityJob", url: "https://www.charityjob.co.uk/jobs", industry: "charity" },
  // Teaching - Tes.com (UK's leading education jobs board)
  { company: "Tes Jobs", url: "https://www.tes.com/jobs/vacancy/search-results", industry: "teaching" },
  // Creative / Marketing - The Dots (creative industry network)
  { company: "The Dots", url: "https://the-dots.com/jobs", industry: "creative" },
  // Music - MusicWeek Jobs (UK music industry trade board, custom scraper)
  { company: "MusicWeek", url: "https://www.musicweek.com/jobs", industry: "music" },
  // Journalism - Hold the Front Page (UK newsroom standard, RSS feed)
  { company: "Hold the Front Page", url: "https://www.holdthefrontpage.co.uk/jobsboard/rss/?filter=active", industry: "journalism" },
  // Film & TV - The Talent Manager (UK TV/film board; JS-rendered, Firecrawl with extended wait)
  { company: "The Talent Manager", url: "https://www.thetalentmanager.com/jobs", industry: "cinema" },

  // Bakery
  { company: "Greggs", url: "https://careerssearch.greggs.co.uk", industry: "bakery" },
  { company: "Paul UK", url: "https://www.paul-uk.com/careers", industry: "bakery" },
  { company: "Gail's", url: "https://gfreedmanco.com/gails-bakery/", industry: "bakery" },
  { company: "Warburtons", url: "https://www.warburtons.co.uk/corporate/careers", industry: "bakery" },
  { company: "Allied Bakeries", url: "https://www.alliedbakeries.co.uk", industry: "bakery" },
  { company: "Bidfood", url: "https://www.bidfood.co.uk/careers", industry: "bakery" },

  // Beer
  { company: "BrewDog", url: "https://jobs.brewdog.com/", industry: "beer" },
  { company: "Hawkstone", url: "https://www.hawkstone.co.uk/pages/careers", industry: "beer" },
  { company: "Northern Monk", url: "https://www.northernmonk.com/careers/", industry: "beer" },
  { company: "Beavertown", url: "https://beavertownbrewery.co.uk/pages/careers", industry: "beer" },
  { company: "Camden Town Brewery", url: "https://www.camdentownbrewery.com", industry: "beer" },
  { company: "Heineken UK", url: "https://www.heinekenuk.co.uk/careers", industry: "beer" },
  { company: "Molson Coors UK", url: "https://www.molsoncoors.com/careers", industry: "beer" },
  { company: "AB InBev UK", url: "https://www.ab-inbev.com/", industry: "beer" },

  // Charity
  { company: "Save the Children UK", url: "https://jobs.savethechildren.org.uk/jobs/", industry: "charity" },
  { company: "The Trussell Trust", url: "https://www.trusselltrust.org", industry: "charity" },
  { company: "Charity Job", url: "https://www.charityjob.co.uk", industry: "charity" },
  { company: "Oxfam", url: "https://www.oxfam.org.uk/what-we-do/about-us/work-with-us/", industry: "charity" },
  { company: "British Red Cross", url: "https://www.redcross.org.uk/about-us/jobs", industry: "charity" },
  { company: "NCVO", url: "https://www.ncvo.org.uk/about-us/jobs-at-ncvo/", industry: "charity" },
  { company: "Institute of Fundraising", url: "https://www.institute-of-fundraising.org.uk/jobs/", industry: "charity" },

  // Cinema
  { company: "Netflix", url: "https://explore.jobs.netflix.net/careers", industry: "cinema" },
  { company: "A24", url: "https://a24films.com/jobs", industry: "cinema" },
  { company: "Curzon", url: "https://www.curzon.com/careers", industry: "cinema" },
  { company: "MUBI", url: "https://mubi.com/jobs", industry: "cinema" },
  { company: "Working Title Films", url: "https://www.workingtitlefilms.com/about/jobs", industry: "cinema" },
  { company: "Pinewood Studios", url: "https://www.pinewoodgroup.com/careers", industry: "cinema" },
  { company: "Dolby", url: "https://careers.dolby.com", industry: "cinema" },
  { company: "Warner Bros.", url: "https://www.warnerbroscareers.com", industry: "cinema" },
  { company: "Universal Pictures", url: "https://www.nbcunicareers.com", industry: "cinema" },
  { company: "Walt Disney Studios", url: "https://jobs.disneycareers.com", industry: "cinema" },
  { company: "Sony Pictures", url: "https://www.sonypictures.com/corp/help.html", industry: "cinema" },
  { company: "Paramount Pictures", url: "https://www.paramount.com/careers", industry: "cinema" },
  { company: "Lionsgate", url: "https://www.lionsgate.com/careers", industry: "cinema" },
  { company: "Amazon MGM Studios", url: "https://www.amazon.jobs/en-gb/", industry: "cinema" },
  { company: "Framestore", url: "https://www.framestore.com/careers", industry: "cinema" },
  { company: "Vue International", url: "https://careers.myvue.com", industry: "cinema" },
  { company: "Everyman", url: "https://careers.everymancinema.com/", industry: "cinema" },
  { company: "BBC", url: "https://careers.bbc.co.uk/search/?createNewAlert=false&q=&locationsearch=United+Kingdom", industry: "cinema" },
  { company: "ITV", url: "https://www.itvjobs.com/jobs/vacancy/find/results/", industry: "cinema" },
  { company: "ITN", url: "https://www.itn.co.uk/careers/", industry: "cinema" },
  { company: "Channel 4", url: "https://careers.channel4.com/c4careers/vacancies/vacancy-search-results.aspx", industry: "cinema" },
  { company: "Channel 5", url: "https://www.paramount.com/careers", industry: "cinema" },
  { company: "Sky", url: "https://careers.sky.com/search-jobs?orgIds=1719&kt=1", industry: "cinema" },
  { company: "HBO", url: "https://careers.wbd.com/global/en/c/hbo-jobs", industry: "cinema" },
  { company: "Sister", url: "https://sister-pictures.com/careers/", industry: "cinema" },
  { company: "Big Talk Productions", url: "https://www.bigtalk.co.uk/contact", industry: "cinema" },
  { company: "Odeon Cinemas", url: "https://careers.odeon.co.uk", industry: "cinema" },
  { company: "Showcase Cinemas", url: "https://uk.showcasecinemas.co.uk/careers", industry: "cinema" },
  { company: "DNEG", url: "https://www.dneg.com/careers/", industry: "cinema" },
  { company: "Industrial Light & Magic", url: "https://www.ilm.com/careers/", industry: "cinema" },
  { company: "Cinesite", url: "https://www.cinesite.com/careers/", industry: "cinema" },
  { company: "The Mill", url: "https://www.themill.com/careers", industry: "cinema" },
  { company: "Molinare", url: "https://www.molinare.co.uk/careers/", industry: "cinema" },
  { company: "Technicolor", url: "https://www.streamlandmedia.com/careers/", industry: "cinema" },
  // Specialist Film & TV job boards (aggregators)
  { company: "Grapevine Jobs", url: "https://www.grapevinejobs.co.uk/jobs-in-media-broadcast-tv-video-post-production", industry: "cinema" },
  { company: "BFI Jobs & Opportunities", url: "https://bfijobsandopportunities.bfi.org.uk", industry: "cinema" },
  { company: "My First Job in Film", url: "https://myfirstjobinfilm.com/UK", industry: "cinema" },
  { company: "Production Guild", url: "https://productionguild.com/member-resources/job-opportunities/", industry: "cinema" },
  { company: "Creative Access", url: "https://opportunities.creativeaccess.org.uk/jobs/film-tv-radio-audio", industry: "cinema" },
  { company: "The Dots", url: "https://the-dots.com/jobs/search/film-jobs", industry: "cinema" },

  // Coffee
  { company: "Grind", url: "https://grind.co.uk/pages/careers", industry: "coffee" },
  { company: "Costa Coffee", url: "https://www.costa.co.uk/careers", industry: "coffee" },
  { company: "Starbucks UK", url: "https://www.starbucksemeacareers.com/", industry: "coffee" },
  { company: "Caffè Nero", url: "https://caffenero.com/uk/careers/", industry: "coffee" },
  { company: "Blank Street", url: "https://www.blankstreet.com/careers", industry: "coffee" },
  { company: "Square Mile Coffee", url: "https://shop.squaremilecoffee.com/pages/careers", industry: "coffee" },

  // Estate Agency
  { company: "Foxtons", url: "https://www.foxtons.co.uk/careers", industry: "estate-agency" },
  { company: "Savills", url: "https://jobs.savills.co.uk/search", industry: "estate-agency" },
  { company: "Knight Frank", url: "https://www.knightfrank.co.uk/current-opportunities", industry: "estate-agency" },
  { company: "Rightmove", url: "https://www.rightmove.co.uk/careers/our-jobs", industry: "estate-agency" },
  { company: "Connells Group", url: "https://www.connellsgroup.co.uk/jobs", industry: "estate-agency" },
  { company: "Purplebricks", url: "https://www.purplebricks.co.uk", industry: "estate-agency" },
  { company: "Zoopla", url: "https://zpg.co.uk/careers", industry: "estate-agency" },
  { company: "Hamptons", url: "https://www.hamptons.co.uk/about-us/careers/", industry: "estate-agency" },
  { company: "Winkworth", url: "https://www.winkworth.co.uk/about-winkworth/careers", industry: "estate-agency" },
  { company: "Dexters", url: "https://www.dexters.co.uk/careers", industry: "estate-agency" },

  // Fashion
  { company: "ASOS", url: "https://www.asoscareers.com/job-search", industry: "fashion" },
  { company: "Next", url: "https://careers.next.co.uk", industry: "fashion" },
  // ME+EM hires through PeopleHR. Their public careers page is a Next.js SPA
  // with no jobs in the raw HTML - point Firecrawl directly at the PeopleHR
  // job board which renders the live vacancies server-side.
  { company: "ME+EM", url: "https://meandem.peoplehr.net/jobboard", industry: "fashion" },
  { company: "Zara (Inditex)", url: "https://www.inditexcareers.com", industry: "fashion" },
  { company: "Depop", url: "https://www.depop.com/jobs", industry: "fashion" },
  { company: "Dr. Martens", url: "https://jobs.drmartens.com", industry: "fashion" },
  { company: "Burberry", url: "https://burberrycareers.com", industry: "fashion" },
  { company: "Coats Group", url: "https://www.coats.com/en/careers", industry: "fashion" },
  { company: "Boohoo Group", url: "https://www.debenhamsgroup.com/careers/boohoo/", industry: "fashion" },
  { company: "Uniqlo", url: "https://www.uniqlo.com/uk/en/", industry: "fashion" },
  { company: "Monsoon", url: "https://www.monsoonjobs.com", industry: "fashion" },
  { company: "Li & Fung", url: "https://www.lifung.com/careers/", industry: "fashion" },
  { company: "Pentland Brands", url: "https://pentlandbrands.com/jobs/", industry: "fashion" },
  { company: "Brand Machine Group", url: "https://www.brandmachinegroup.com/careers", industry: "fashion" },
  { company: "JOOR", url: "https://www.joor.com/careers", industry: "fashion" },
  { company: "Faire", url: "https://www.faire.com/careers", industry: "fashion" },
  { company: "Zalando", url: "https://jobs.zalando.com", industry: "fashion" },
  { company: "Selfridges", url: "https://jobsearch.selfridges.com", industry: "fashion" },
  { company: "Harrods", url: "https://www.harrodscareers.com", industry: "fashion" },
  { company: "John Lewis", url: "https://www.jlpjobs.com", industry: "fashion" },
  { company: "Flannels", url: "https://www.flannels.com/careers", industry: "fashion" },
  { company: "END.", url: "https://careers.endclothing.com", industry: "fashion" },
  { company: "Vinted", url: "https://careers.vinted.com/jobs", industry: "fashion" },
  { company: "eBay", url: "https://www.ebayinc.com/careers/", industry: "fashion" },
  { company: "Marks & Spencer", url: "https://jobs.marksandspencer.com", industry: "fashion" },

  // Hospitality (Food & Drink)
  { company: "Dishoom", url: "https://www.dishoom.com/careers", industry: "food-drink" },
  { company: "Five Guys UK", url: "https://careers.fiveguys.com/gb/en", industry: "food-drink" },
  { company: "JKS Restaurants", url: "https://jksrestaurants.com/careers", industry: "food-drink" },
  { company: "Nando's", url: "https://careers.nandos.co.uk", industry: "food-drink" },
  { company: "Wagamama", url: "https://www.wagamama.com/careers", industry: "food-drink" },
  { company: "Pret A Manger", url: "https://www.pret.co.uk/en-GB/pret-jobs", industry: "food-drink" },
  { company: "Compass Group", url: "https://www.compass-group.co.uk/jobs/", industry: "food-drink" },
  { company: "Brakes", url: "https://www.brake.co.uk/careers", industry: "food-drink" },
  { company: "Soho House", url: "https://careers.sohohouse.com", industry: "food-drink" },
  { company: "Diageo", url: "https://www.diageo.com/en/careers", industry: "food-drink" },
  { company: "Unilever", url: "https://careers.unilever.com", industry: "food-drink" },
  { company: "Nestlé UK", url: "https://www.nestle.co.uk/en-gb/jobs", industry: "food-drink" },
  { company: "PepsiCo UK", url: "https://www.pepsicojobs.com/main/jobs?location=United+Kingdom", industry: "food-drink" },
  { company: "Coca-Cola Europacific Partners", url: "https://www.cocacolaep.com/careers/", industry: "food-drink" },
  { company: "Associated British Foods", url: "https://www.abf.co.uk/careers", industry: "food-drink" },
  { company: "Premier Foods", url: "https://www.premierfoods.co.uk/careers/", industry: "food-drink" },
  { company: "Heineken UK", url: "https://www.heinekenuk.co.uk/careers", industry: "food-drink" },
  { company: "Molson Coors UK", url: "https://www.molsoncoors.com/careers", industry: "food-drink" },
  { company: "AB InBev UK", url: "https://www.ab-inbev.com/", industry: "food-drink" },

  // Football
  { company: "Jobs in Football", url: "https://jobsinfootball.com/jobs/", industry: "football" },
  { company: "Sky Sports", url: "https://careers.sky.com", industry: "football" },
  { company: "BBC Sport", url: "https://careers.bbc.co.uk/search/?createNewAlert=false&q=sport&locationsearch=United+Kingdom", industry: "football" },
  { company: "DAZN", url: "https://careers.dazn.com", industry: "football" },
  { company: "City Football Group", url: "https://www.cityfootballgroup.com/careers", industry: "football" },
  { company: "Kick It Out", url: "https://www.kickitout.org/jobs", industry: "football" },
  { company: "Stats Perform", url: "https://www.statsperform.com/careers/", industry: "football" },
  { company: "Levy UK", url: "https://www.levyrestaurants.co.uk/careers", industry: "football" },
  { company: "Premier League", url: "https://careers.premierleague.com/", industry: "football" },
  { company: "EFL", url: "https://www.efl.com/efl-careers/", industry: "football" },
  { company: "Manchester United", url: "https://careers.manutd.com", industry: "football" },
  { company: "Liverpool FC", url: "https://jobsearch.liverpoolfc.com/jobs/search/-1/2", industry: "football" },
  { company: "Arsenal", url: "https://www.arsenal.com/the-club/jobs", industry: "football" },
  { company: "Chelsea FC", url: "https://chelseafc.recruitee.com", industry: "football" },
  { company: "Tottenham Hotspur", url: "https://www.tottenhamhotspur.com/the-club/jobs-and-careers/", industry: "football" },
  { company: "Manchester City", url: "https://www.mancity.com/careers", industry: "football" },
  { company: "Newcastle United", url: "https://www.newcastleunited.com/en/club/careers", industry: "football" },
  { company: "Aston Villa", url: "https://www.avfc.co.uk/club/careers/", industry: "football" },
  { company: "West Ham United", url: "https://www.whufc.com/club/careers", industry: "football" },
  { company: "Everton", url: "https://www.evertonfc.com/careers", industry: "football" },
  { company: "Crystal Palace", url: "https://www.cpfc.co.uk/club/careers/", industry: "football" },
  { company: "Fulham", url: "https://www.fulhamfc.com/club/careers", industry: "football" },
  { company: "Brentford", url: "https://www.brentfordfc.com/en/the-club/careers", industry: "football" },
  { company: "Wolverhampton Wanderers", url: "https://www.wolves.co.uk/club/careers/", industry: "football" },
  { company: "Nottingham Forest", url: "https://www.nottinghamforest.co.uk/club/careers", industry: "football" },
  { company: "AFC Bournemouth", url: "https://www.afcb.co.uk/club/careers/", industry: "football" },
  { company: "Leicester City", url: "https://www.lcfc.com/club/careers", industry: "football" },
  { company: "Ipswich Town", url: "https://www.itfc.co.uk/club/jobs", industry: "football" },
  { company: "Southampton", url: "https://www.southamptonfc.com/en/club/careers", industry: "football" },

  // Grocery
  { company: "Ocado Logistics", url: "https://www.ocado-logistics.com/job-listing", industry: "grocery" },
  { company: "Ocado Retail", url: "https://careers.ocadoretail.com/open-roles/", industry: "grocery" },
  { company: "Tesco", url: "https://www.tesco-careers.com", industry: "grocery" },
  { company: "Sainsbury's", url: "https://sainsburys.jobs", industry: "grocery" },
  { company: "M&S Food", url: "https://jobs.marksandspencer.com/our-teams/food", industry: "grocery" },
  { company: "Waitrose", url: "https://www.waitrosejobs.com", industry: "grocery" },
  { company: "Deliveroo", url: "https://careers.deliveroo.co.uk/join-the-team/", industry: "grocery" },
  { company: "Cranswick", url: "https://www.cranswick.plc.uk/careers", industry: "grocery" },
  { company: "Greencore", url: "https://www.greencore.com/careers/", industry: "grocery" },
  { company: "Premier Foods", url: "https://www.premierfoods.co.uk/careers/", industry: "grocery" },
  { company: "Wincanton", url: "https://www.wincanton.co.uk/careers", industry: "grocery" },
  { company: "XPO Logistics", url: "https://jobs.xpo.com", industry: "grocery" },

  // Interior Design
  { company: "Tom Dixon", url: "https://www.tomdixon.net/en_gb/jobs", industry: "interior-design" },
  { company: "Soho Home", url: "https://www.sohohome.com/careers", industry: "interior-design" },
  { company: "Neptune", url: "https://www.neptune.com/careers", industry: "interior-design" },
  { company: "Farrow & Ball", url: "https://www.farrow-ball.com", industry: "interior-design" },
  { company: "Studio Ashby", url: "https://www.studioashby.com", industry: "interior-design" },

  // Music
  { company: "Dice", url: "https://dice.fm/jobs", industry: "music" },
  { company: "Spotify", url: "https://www.lifeatspotify.com", industry: "music" },
  { company: "Broadwick", url: "https://broadwick.com/careers/", industry: "music" },
  { company: "Secretly Group", url: "https://secretlygroup.com", industry: "music" },
  { company: "Focusrite", url: "https://focusriteplc.com/careers/", industry: "music" },
  { company: "Abbey Road Studios", url: "https://www.umusiccareers.com/jobs/abbeyroad", industry: "music" },
  { company: "WME", url: "https://www.wmeagency.com/careers", industry: "music" },
  { company: "Live Nation", url: "https://www.livenationentertainment.com/careers/", industry: "music" },
  { company: "Superstruct Entertainment", url: "https://www.superstruct.com", industry: "music" },
  { company: "Universal Music Group", url: "https://www.universalmusic.com/careers/", industry: "music" },
  { company: "Sony Music", url: "https://www.sonymusic.com/careers/", industry: "music" },
  { company: "Warner Music Group", url: "https://www.wmg.com/careers", industry: "music" },
  { company: "BMG", url: "https://www.bmg.com/careers", industry: "music" },

  // Teaching
  { company: "Teach First", url: "https://www.teachfirst.org.uk/careers", industry: "teaching" },
  { company: "TES", url: "https://www.tes.com/jobs", industry: "teaching" },
  { company: "Teach in Further Education (DfE)", url: "https://www.teachinfurthereducation.education.gov.uk/jobs", industry: "teaching" },
  { company: "Guardian Jobs Education", url: "https://jobs.theguardian.com/jobs/education-schools/", industry: "teaching" },
  { company: "Ark Schools", url: "https://www.arkonline.org/careers", industry: "teaching" },
  { company: "Oak National Academy", url: "https://www.thenational.academy/jobs", industry: "teaching" },
  { company: "Twinkl", url: "https://www.twinkl.co.uk/careers", industry: "teaching" },
  { company: "Harris Federation", url: "https://www.harriscareers.org.uk/vacancies", industry: "teaching" },
  { company: "United Learning", url: "https://unitedlearning.org.uk/careers", industry: "teaching" },
  { company: "Oasis Community Learning", url: "https://www.oasiscommunitylearning.org/careers", industry: "teaching" },
  { company: "Pearson", url: "https://pearson.jobs/united-kingdom/new-jobs/", industry: "teaching" },
  { company: "Renaissance Learning", url: "https://www.renaissance.com/careers/", industry: "teaching" },
  { company: "White Rose Maths", url: "https://whiteroseeducation.com/careers", industry: "teaching" },
  { company: "Eteach", url: "https://www.eteach.com/careers", industry: "teaching" },

  // Footwear
  { company: "Nike", url: "https://jobs.nike.com/search-jobs?location=United%20Kingdom", industry: "footwear" },
  { company: "Dr. Martens", url: "https://jobs.drmartens.com/results?country[0]=GB", industry: "footwear" },
  { company: "Birkenstock", url: "https://careers.birkenstock-group.com/us/en/search-results?keywords=&location=United+Kingdom", industry: "footwear" },
  { company: "New Balance", url: "https://jobs.newbalance.com/global/en/search-results?keywords=&location=United+Kingdom", industry: "footwear" },
  { company: "Adidas", url: "https://careers.adidas-group.com/jobs?location=United+Kingdom", industry: "footwear" },
  { company: "Clarks", url: "https://www.clarks.co.uk/careers", industry: "footwear" },
  { company: "Schuh", url: "https://careers.schuh.co.uk", industry: "footwear" },
  { company: "JD Sports", url: "https://careers.jdplc.com/vacancies", industry: "footwear" },
  { company: "Office Shoes", url: "https://www.office.co.uk/view/content/careers", industry: "footwear" },
  { company: "Loake", url: "https://www.loake.com/careers", industry: "footwear" },
  { company: "Vibram", url: "https://www.vibram.com/careers/", industry: "footwear" },

  // Health (general clinical / nursing / NHS)
  { company: "NHS Jobs", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=nurse", industry: "health" },
  { company: "NHS Jobs", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=healthcare+assistant", industry: "health" },
  { company: "NHS Jobs", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=midwife", industry: "health" },
  { company: "NHS Jobs", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=doctor", industry: "health" },
  { company: "Nuffield Health", url: "https://www.nuffieldhealth.com/careers", industry: "health" },
  { company: "Bupa", url: "https://jobs.bupa.co.uk", industry: "health" },
  { company: "Circle Health Group", url: "https://www.circlehealthgroup.co.uk/careers", industry: "health" },
  { company: "Ramsay Health Care UK", url: "https://www.ramsayhealth.co.uk/careers", industry: "health" },
  { company: "Spire Healthcare", url: "https://careers.spirehealthcare.com/", industry: "health" },
  { company: "HCA Healthcare UK", url: "https://careers.hcahealthcare.co.uk/", industry: "health" },

  // Physiotherapy
  { company: "Nuffield Health", url: "https://www.nuffieldhealth.com/careers", industry: "physiotherapy" },
  { company: "Bupa", url: "https://jobs.bupa.co.uk", industry: "physiotherapy" },
  { company: "Circle Health Group", url: "https://www.circlehealthgroup.co.uk/careers", industry: "physiotherapy" },
  { company: "NHS Jobs", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=physiotherapist", industry: "physiotherapy" },

  // Psychotherapy
  { company: "NHS Talking Therapies", url: "https://www.jobs.nhs.uk/candidate/search/results?keyword=psychotherapist", industry: "psychotherapy" },
  { company: "Priory Group", url: "https://jobs.priorygroup.com", industry: "psychotherapy" },
  { company: "BetterHelp", url: "https://www.betterhelp.com/therapist-jobs/", industry: "psychotherapy" },
  { company: "Relate", url: "https://www.relate.org.uk/about-us/work-us", industry: "psychotherapy" },

  // Wellness
  { company: "PureGym", url: "https://www.puregym.com/careers/", industry: "wellness" },
  { company: "Gymshark", url: "https://careers.gymshark.com/jobs", industry: "wellness" },
  { company: "Barry's", url: "https://www.barrys.com/careers", industry: "wellness" },
  { company: "Myprotein (THG)", url: "https://careers.thehutgroup.com/jobs", industry: "wellness" },
  { company: "Third Space", url: "https://www.thirdspace.london/careers", industry: "wellness" },
  { company: "Lululemon", url: "https://careers.lululemon.com/en_GB/careers", industry: "wellness" },
  { company: "David Lloyd", url: "https://www.davidlloyd.co.uk/careers", industry: "wellness" },
  { company: "Huel", url: "https://uk.huel.com/pages/careers", industry: "wellness" },
  { company: "Holland & Barrett", url: "https://careers.hollandandbarrett.com/search/", industry: "wellness" },
  { company: "Boots", url: "https://www.boots.jobs/search-results", industry: "wellness" },
  { company: "Superdrug", url: "https://careers.superdrug.jobs/search-results", industry: "wellness" },
  { company: "Bannatyne", url: "https://www.bannatyne.co.uk/careers", industry: "wellness" },
  { company: "Everyone Active", url: "https://www.everyoneactive.com/about-us/careers/", industry: "wellness" },
  { company: "Virgin Active", url: "https://careers.virginactive.co.uk/jobs/home/", industry: "wellness" },
  { company: "The Gym Group", url: "https://www.tggplc.com", industry: "wellness" },

  // Hospitality (QSR additions)
  { company: "Domino's", url: "https://corporate.dominos.co.uk/careers", industry: "food-drink" },
  { company: "McDonald's", url: "https://people.mcdonalds.co.uk/our-workplaces", industry: "food-drink" },

  // Gaming
  { company: "Hitmarker", url: "https://hitmarker.net/jobs", industry: "gaming" },
  // GamesIndustry.biz Jobs - UK gaming trade board (sitemap + JSON-LD)
  { company: "GamesIndustry.biz", url: "https://jobs.gamesindustry.biz/sitemap.xml", industry: "gaming" },
  { company: "Rockstar Games", url: "https://www.rockstargames.com/careers", industry: "gaming" },
  { company: "Playground Games", url: "https://www.playground-games.com/careers", industry: "gaming" },
  { company: "Creative Assembly", url: "https://www.creative-assembly.com/careers", industry: "gaming" },
  { company: "Frontier Developments", url: "https://www.frontier.co.uk/careers", industry: "gaming" },
  { company: "Sumo Digital", url: "https://www.sumodigital.com/careers", industry: "gaming" },
  { company: "Team17", url: "https://www.team17.com/careers", industry: "gaming" },
  { company: "Jagex", url: "https://www.jagex.com/en-GB/careers", industry: "gaming" },
  { company: "Sports Interactive", url: "https://www.sigames.com/careers", industry: "gaming" },
  { company: "Rare", url: "https://www.rare.co.uk/careers", industry: "gaming" },
  { company: "Ninja Theory", url: "https://www.ninjatheory.com/careers", industry: "gaming" },
  { company: "nDreams", url: "https://www.ndreams.com/careers", industry: "gaming" },

  // Journalism
  { company: "BBC News", url: "https://careers.bbc.co.uk/search/?createNewAlert=false&q=news&locationsearch=United+Kingdom", industry: "journalism" },
  { company: "The Guardian", url: "https://workforus.theguardian.com", industry: "journalism" },
  { company: "News UK", url: "https://www.newscareers.co.uk", industry: "journalism" },
  { company: "Financial Times", url: "https://aboutus.ft.com/careers", industry: "journalism" },
  { company: "The Telegraph", url: "https://www.telegraph.co.uk/about-us/jobs/", industry: "journalism" },
  { company: "Associated Newspapers", url: "https://www.dmgmedia.co.uk/careers/", industry: "journalism" },
  { company: "Sky News", url: "https://careers.sky.com", industry: "journalism" },
  { company: "ITN", url: "https://www.itn.co.uk/careers", industry: "journalism" },
  { company: "Reuters", url: "https://www.thomsonreuters.com/en/careers.html", industry: "journalism" },
  { company: "PA Media", url: "https://www.pamedia.co.uk/careers", industry: "journalism" },
  { company: "Reach plc", url: "https://www.reachplc.com/careers", industry: "journalism" },
  { company: "Global", url: "https://www.global.com/careers/", industry: "journalism" },
  { company: "Bauer Media", url: "https://www.bauermedia.co.uk/careers", industry: "journalism" },
  { company: "Channel 4", url: "https://www.channel4.com/corporate/jobs", industry: "journalism" },
  { company: "ITV", url: "https://www.itvjobs.com", industry: "journalism" },
  { company: "Journo Resources", url: "https://www.journoresources.org.uk/jobs", industry: "journalism" },
  { company: "Press Gazette", url: "https://pressgazette.co.uk/jobs/", industry: "journalism" },
  { company: "Cision", url: "https://www.cision.com/careers/", industry: "journalism" },
  { company: "ScreenSkills", url: "https://www.screenskills.com/jobs/", industry: "journalism" },

  // Jewellery
  { company: "Pragnell", url: "https://www.pragnell.co.uk/careers", industry: "jewellery" },
  { company: "Boodles", url: "https://www.boodles.com/careers", industry: "jewellery" },
  { company: "Graff", url: "https://www.graff.com/careers", industry: "jewellery" },
  { company: "De Beers", url: "https://www.debeersgroup.com/careers", industry: "jewellery" },
  { company: "Pandora", url: "https://www.pandoragroup.com/careers", industry: "jewellery" },
  { company: "Monica Vinader", url: "https://www.monicavinader.com/careers", industry: "jewellery" },
  { company: "Goldsmiths", url: "https://www.goldsmiths.co.uk/careers", industry: "jewellery" },
  { company: "Signet Jewelers", url: "https://www.signetjewelers.com/careers", industry: "jewellery" },
  { company: "Astley Clarke", url: "https://www.astleyclarke.com/pages/careers", industry: "jewellery" },
  { company: "Tiffany & Co.", url: "https://careers.tiffany.com", industry: "jewellery" },
  { company: "Cartier", url: "https://www.cartier.com/en-gb/maison/careers.html", industry: "jewellery" },

  // Pets
  { company: "Pets at Home", url: "https://www.petsathomejobs.com", industry: "pets" },
  { company: "Vets4Pets", url: "https://www.vets4petscareers.com", industry: "pets" },
  { company: "IVC Evidensia", url: "https://www.ivcevidensia.com/careers", industry: "pets" },
  { company: "Medivet", url: "https://www.medivet.co.uk/careers", industry: "pets" },
  { company: "Purina", url: "https://www.purina.co.uk/about-purina/careers", industry: "pets" },
  { company: "Battersea Dogs & Cats Home", url: "https://www.battersea.org.uk/jobs", industry: "pets" },
  { company: "Blue Cross", url: "https://www.bluecross.org.uk/jobs", industry: "pets" },
  { company: "PDSA", url: "https://www.pdsa.org.uk/careers", industry: "pets" },
  { company: "Jollyes", url: "https://www.jollyes.co.uk/careers", industry: "pets" },
  { company: "Butternut Box", url: "https://www.butternutbox.com/careers", industry: "pets" },
  { company: "Lily's Kitchen", url: "https://www.lilyskitchen.co.uk/about-us/careers", industry: "pets" },

  // Travel & Transport
  { company: "British Airways", url: "https://careers.ba.com", industry: "travel" },
  { company: "easyJet", url: "https://careers.easyjet.com", industry: "travel" },
  { company: "Virgin Atlantic", url: "https://careersuk.virgin-atlantic.com", industry: "travel" },
  { company: "Jet2", url: "https://www.jet2careers.com", industry: "travel" },
  { company: "Ryanair", url: "https://careers.ryanair.com", industry: "travel" },
  { company: "Uber", url: "https://www.uber.com/gb/en/careers/", industry: "travel" },
  { company: "Booking.com", url: "https://careers.booking.com", industry: "travel" },
  { company: "Airbnb", url: "https://careers.airbnb.com", industry: "travel" },
  { company: "Trainline", url: "https://www.trainlinegroup.com/careers/en/", industry: "travel" },
  { company: "Skyscanner", url: "https://www.skyscanner.net/jobs", industry: "travel" },
  { company: "TUI", url: "https://careers.tuigroup.com", industry: "travel" },
  { company: "Avanti West Coast", url: "https://www.avantiwestcoast.co.uk/about-us/careers", industry: "travel" },
  { company: "LNER", url: "https://www.lner.co.uk/about-us/careers/", industry: "travel" },
  { company: "Transport for London", url: "https://tfl.gov.uk/corporate/careers", industry: "travel" },
  { company: "National Express", url: "https://careers.nationalexpress.com", industry: "travel" },
  { company: "FirstGroup", url: "https://www.firstgroupplc.com/careers.aspx", industry: "travel" },
  { company: "IHG Hotels", url: "https://careers.ihg.com", industry: "travel" },
  { company: "Whitbread", url: "https://www.whitbreadcareers.com", industry: "travel" },
  { company: "Marriott", url: "https://careers.marriott.com", industry: "travel" },
  { company: "Expedia Group", url: "https://lifeatexpediagroup.com/jobs", industry: "travel" },
  { company: "Accor", url: "https://careers.accor.com/global/en/search-results?keywords=&location=United+Kingdom", industry: "travel" },

  // Bakery (additions)
  { company: "Bread Ahead", url: "https://breadahead.com/pages/work-with-us", industry: "bakery" },
  { company: "Hobbs House Bakery", url: "https://www.hobbshousebakery.co.uk/pages/careers", industry: "bakery" },
  { company: "Hovis", url: "https://www.hovis.co.uk/careers", industry: "bakery" },
  { company: "Ole & Steen", url: "https://oleandsteen.co.uk/pages/careers", industry: "bakery" },
  { company: "Shipton Mill", url: "https://www.shipton-mill.com/about-us/jobs", industry: "bakery" },
  { company: "Carr's Group", url: "https://www.carrsgroup.com/careers/", industry: "bakery" },
  { company: "Marriage's Flour", url: "https://www.flour.co.uk/about-marriages/careers/", industry: "bakery" },

  // Beauty (new industry)
  { company: "Charlotte Tilbury", url: "https://www.charlottetilbury.com/uk/careers", industry: "beauty" },
  { company: "The Body Shop", url: "https://www.thebodyshop.com/en-gb/about-us/careers", industry: "beauty" },
  { company: "Space NK", url: "https://www.spacenk.com/uk/about/careers.html", industry: "beauty" },
  { company: "Elemis", url: "https://www.elemis.com/uk/careers", industry: "beauty" },
  { company: "Revolution Beauty", url: "https://revolutionbeauty.com/uk/pages/careers", industry: "beauty" },
  { company: "Cult Beauty (THG)", url: "https://careers.thehutgroup.com/jobs", industry: "beauty" },
  { company: "Larry King Hair", url: "https://larrykinghair.com/pages/careers", industry: "beauty" },
  { company: "Toni & Guy", url: "https://www.toniandguy.com/careers", industry: "beauty" },
  { company: "Townhouse", url: "https://townhouse.co.uk/careers", industry: "beauty" },

  // Beer (additions)
  { company: "Cloudwater Brew Co", url: "https://cloudwaterbrew.co/pages/jobs", industry: "beer" },
  { company: "Fuller's", url: "https://careers.fullers.co.uk", industry: "beer" },
  { company: "Marston's", url: "https://www.marstonscareers.co.uk", industry: "beer" },
  { company: "JD Wetherspoon", url: "https://jdwcareers.com", industry: "beer" },
  { company: "Toast Ale", url: "https://www.toastale.com/careers/", industry: "beer" },

  // Cars
  { company: "Jaguar Land Rover", url: "https://www.jaguarlandrovercareers.com/search-jobs", industry: "cars" },
  { company: "Bentley Motors", url: "https://careers.bentleymotors.com/search-jobs", industry: "cars" },
  { company: "Aston Martin", url: "https://www.astonmartin.com/en/careers", industry: "cars" },
  { company: "Nissan UK", url: "https://www.nissan.jobs/UK/", industry: "cars" },
  { company: "BMW Group UK", url: "https://www.bmwgroup.jobs/uk/en.html", industry: "cars" },
  { company: "Arnold Clark", url: "https://www.arnoldclark.com/careers", industry: "cars" },
  { company: "Octopus Electric Vehicles", url: "https://octopusev.com/careers", industry: "cars" },
  { company: "Halfords", url: "https://www.halfordscareers.com", industry: "cars" },
  { company: "AA", url: "https://careers.theaa.com", industry: "cars" },
  { company: "Kwik Fit", url: "https://www.kwik-fit.com/careers", industry: "cars" },
  // UK dealership groups
  { company: "Sytner Group", url: "https://www.sytner.co.uk/careers", industry: "cars" },
  { company: "Lookers", url: "https://www.lookers.co.uk/careers", industry: "cars" },
  { company: "Vertu Motors", url: "https://www.vertumotors.com/careers", industry: "cars" },
  { company: "Pendragon", url: "https://www.pendragonplc.com/careers", industry: "cars" },
  { company: "Marshall Motor Group", url: "https://www.marshall.co.uk/careers", industry: "cars" },
  { company: "Inchcape UK", url: "https://www.inchcape.co.uk/careers", industry: "cars" },
  { company: "Stellantis UK", url: "https://www.stellantis.com/en/careers", industry: "cars" },
  { company: "Ford UK", url: "https://corporate.ford.com/careers.html", industry: "cars" },
  { company: "Volkswagen Group UK", url: "https://www.volkswagen-group.com/en/career-15819", industry: "cars" },
  { company: "Mercedes-Benz UK", url: "https://group.mercedes-benz.com/careers/", industry: "cars" },
  { company: "Toyota GB", url: "https://www.toyota.co.uk/world-of-toyota/careers", industry: "cars" },
  { company: "Honda UK", url: "https://www.honda.co.uk/cars/world-of-honda/careers.html", industry: "cars" },
  { company: "Vauxhall", url: "https://www.vauxhall.co.uk/careers.html", industry: "cars" },
  { company: "MINI UK", url: "https://www.mini.co.uk/en_GB/home/explore/about-mini/careers.html", industry: "cars" },
  { company: "Rolls-Royce Motor Cars", url: "https://careers.rolls-roycemotorcars.com/", industry: "cars" },
  { company: "McLaren Automotive", url: "https://careers.mclaren.com/", industry: "cars" },
  { company: "Polestar UK", url: "https://www.polestar.com/uk/careers/", industry: "cars" },
  { company: "Tesla UK", url: "https://www.tesla.com/en_gb/careers/search", industry: "cars" },
  { company: "Cazoo", url: "https://www.cazoo.co.uk/careers/", industry: "cars" },
  { company: "Cinch", url: "https://www.cinch.co.uk/careers", industry: "cars" },
  { company: "Auto Trader UK", url: "https://careers.autotrader.co.uk/", industry: "cars" },
  { company: "Motorpoint", url: "https://www.motorpoint.co.uk/about-motorpoint/careers", industry: "cars" },
  { company: "RAC", url: "https://www.rac.co.uk/about-us/careers", industry: "cars" },
  { company: "Halfords Autocentres", url: "https://www.halfordsautocentres.com/about-us/careers", industry: "cars" },
  { company: "National Tyres", url: "https://www.national.co.uk/careers", industry: "cars" },
  { company: "ATS Euromaster", url: "https://www.atseuromaster.co.uk/careers", industry: "cars" },
  { company: "Listers", url: "https://www.listers.co.uk/careers", industry: "cars" },
  { company: "JCT600", url: "https://www.jct600.co.uk/careers/", industry: "cars" },
  { company: "Stoneacre Motor Group", url: "https://www.stoneacre.co.uk/careers", industry: "cars" },
  { company: "Hendy Group", url: "https://www.hendy-group.com/careers", industry: "cars" },

  // Charity (additions)
  { company: "Comic Relief", url: "https://www.comicrelief.com/careers/", industry: "charity" },
  { company: "Crisis", url: "https://www.crisis.org.uk/about-us/jobs/", industry: "charity" },
  { company: "Motability Foundation", url: "https://www.motabilityfoundation.org.uk/careers", industry: "charity" },
  { company: "Charities Aid Foundation", url: "https://www.cafonline.org/about-us/careers", industry: "charity" },
  { company: "Mental Health Innovations", url: "https://www.mentalhealthinnovations.org/careers", industry: "charity" },
  { company: "Eastside People", url: "https://eastsidepeople.org/jobs/", industry: "charity" },
  { company: "Blackbaud", url: "https://careers.blackbaud.com/uk", industry: "charity" },

  // Cinema (additions)
  { company: "The Walt Disney Company", url: "https://jobs.disneycareers.com/job-search-results/?location=United%20Kingdom", industry: "cinema" },

  // Coffee (additions)
  { company: "Allpress Espresso", url: "https://uk.allpressespresso.com/pages/careers", industry: "coffee" },

  // Estate Agency (additions)
  { company: "Countrywide", url: "https://www.countrywidecareers.com", industry: "estate-agency" },
  { company: "My Home Move", url: "https://www.myhomemove.com/careers", industry: "estate-agency" },
  { company: "Simplify", url: "https://www.simplify.co.uk/careers", industry: "estate-agency" },
  { company: "O'Neill Patient", url: "https://www.oprs.co.uk/careers/", industry: "estate-agency" },
  { company: "Slater and Gordon", url: "https://www.slatergordon.co.uk/careers/", industry: "estate-agency" },
  { company: "JMW Solicitors", url: "https://www.jmw.co.uk/about/careers", industry: "estate-agency" },

  // Fashion (additions)
  { company: "Tomorrow London", url: "https://tomorrowlondon.com/careers", industry: "fashion" },

  // Football (additions)
  { company: "The Football Association", url: "https://www.thefa.com/about-football-association/careers", industry: "football" },
  { company: "Brighton & Hove Albion", url: "https://www.brightonandhovealbion.com/club/working-at-the-club/", industry: "football" },
  { company: "Wrexham AFC", url: "https://www.wrexhamafc.co.uk/club/vacancies", industry: "football" },

  // Footwear (additions)
  { company: "ECCO", url: "https://global.ecco.com/en/careers", industry: "footwear" },
  { company: "UGG", url: "https://www.deckers.com/careers", industry: "footwear" },
  { company: "Timberland", url: "https://careers.vfc.com/global/en/timberland", industry: "footwear" },
  { company: "Foot Locker", url: "https://careers.footlocker.com/global/en/search-results?location=United+Kingdom", industry: "footwear" },
  { company: "Footasylum", url: "https://www.footasylum.com/page/careers/", industry: "footwear" },
  { company: "Skechers", url: "https://www.skechers.com/careers/", industry: "footwear" },
  { company: "Shoe Zone", url: "https://www.shoezone.com/Careers", industry: "footwear" },
  { company: "Kurt Geiger", url: "https://www.kurtgeiger.com/customerservices/careers", industry: "footwear" },

  // Grocery (additions)
  { company: "Aldi", url: "https://www.aldirecruitment.co.uk", industry: "grocery" },
  { company: "Lidl", url: "https://careers.lidl.co.uk", industry: "grocery" },
  { company: "Gousto", url: "https://www.gousto.co.uk/careers", industry: "grocery" },
  { company: "Hilton Food Group", url: "https://www.hiltonfoods.com/careers/", industry: "grocery" },

  // Hospitality (additions)
  { company: "The Wolseley Hospitality Group", url: "https://www.thewolseley.com/careers/", industry: "food-drink" },
  { company: "KFC", url: "https://www.kfc.co.uk/jobs", industry: "food-drink" },
  { company: "SSP Group", url: "https://www.foodtravelexperts.com/careers/", industry: "food-drink" },

  // Interior Design (additions)
  { company: "Gensler", url: "https://www.gensler.com/careers", industry: "interior-design" },
  { company: "Havwoods", url: "https://www.havwoods.com/uk/about-us/careers/", industry: "interior-design" },
  { company: "Sonder Living", url: "https://www.sonderliving.com/pages/careers", industry: "interior-design" },

  // Jewellery (additions)
  { company: "Bulgari", url: "https://www.bulgari.com/en-gb/the-maison/careers/", industry: "jewellery" },

  // Journalism (additions)
  { company: "The Observer", url: "https://workforus.theguardian.com", industry: "journalism" },
  { company: "Newsquest", url: "https://newsquest-careers.com", industry: "journalism" },

  // Pets (additions)
  { company: "Mars Petcare", url: "https://www.mars.com/careers/petcare", industry: "pets" },
  { company: "Rover", url: "https://www.rover.com/uk/careers/", industry: "pets" },
  { company: "Pooch & Mutt", url: "https://www.poochandmutt.co.uk/pages/careers", industry: "pets" },
  { company: "Vets Now", url: "https://www.vets-now.com/careers/", industry: "pets" },
  { company: "CVS Group", url: "https://www.cvsukcareers.com", industry: "pets" },

  // Physiotherapy (additions)
  { company: "Six Physio", url: "https://www.sixphysio.com/careers", industry: "physiotherapy" },
  { company: "PhysioFirst", url: "https://www.physiofirst.org.uk/careers/", industry: "physiotherapy" },
  { company: "Ramsay Health Care UK", url: "https://www.ramsayhealth.co.uk/careers", industry: "physiotherapy" },

  // Psychotherapy (additions)
  { company: "Tavistock & Portman NHS Trust", url: "https://tavistockandportman.nhs.uk/work-with-us/careers/", industry: "psychotherapy" },
  { company: "BACP", url: "https://www.bacp.co.uk/about-us/working-at-bacp/", industry: "psychotherapy" },
  { company: "Ieso Digital Health", url: "https://www.iesohealth.com/en-gb/careers", industry: "psychotherapy" },

  // Wellness (additions)
  { company: "Tala", url: "https://www.wearetala.com/pages/careers", industry: "wellness" },
  { company: "GLL (Better)", url: "https://www.better.org.uk/careers", industry: "wellness" },
  { company: "JD Gyms", url: "https://www.jdgyms.co.uk/careers", industry: "wellness" },
];

const INDUSTRY_STAGES: Record<string, string[]> = {
  bakery: ["Craft & Product", "Production", "Operations", "Retail & Café", "Marketing"],
  beer: ["Brewing & Production", "Quality & Lab", "Taproom & Retail", "Sales & Distribution", "Marketing & Brand", "Operations"],
  charity: ["Mission & Cause", "Fundraising", "Operations", "Service Delivery", "Impact & Reporting"],
  cinema: ["Development", "Production", "Post-Production", "Distribution", "Exhibition"],
  coffee: ["Origin & Sourcing", "Roasting & Production", "Operations", "Retail & Café", "Brand & Growth"],
  "estate-agency": ["Valuation", "Listings", "Sales", "Lettings", "Operations & Marketing"],
  fashion: ["Design", "Sourcing", "Production", "Marketing", "Retail", "Consumer"],
  "food-drink": ["Kitchen", "Front of House", "Operations", "Growth & Marketing", "Support Functions"],
  football: ["Sporting", "Scouting & Analysis", "Club Operations", "Commercial", "Media & Community"],
  grocery: ["Sourcing", "Supply Chain", "Store Operations", "Commercial", "Digital & Support"],
  "interior-design": ["Concept", "Design Development", "Procurement", "Sales", "Operations"],
  music: ["Creation", "Production", "Distribution", "Marketing", "Live & Events"],
  teaching: ["Classroom", "Pastoral", "Curriculum", "Leadership", "Operations"],
  footwear: ["Design & Development", "Manufacturing", "Supply Chain", "Retail & E-Commerce", "Marketing & Brand", "Business & Strategy"],
  physiotherapy: ["Education & Training", "NHS & Primary Care", "Sports & Performance", "Private Practice", "Specialist Areas", "Leadership"],
  psychotherapy: ["Training & Qualification", "NHS & IAPT", "Private Practice", "Specialist Populations", "Supervision & Ethics", "Leadership & Research"],
  wellness: ["Gyms & Fitness", "Health & Wellbeing", "Supplements & Nutrition", "Activewear & Apparel", "Retail & Wellness", "Community & Experience", "Business & Growth"],
  gaming: ["Concept & Pre-Production", "Development & Engineering", "Art & Audio", "QA & Live Ops", "Marketing & Publishing", "Business & Distribution"],
  journalism: ["Reporting & Newsgathering", "Broadcast & Audio", "Digital & Multimedia", "Photography & Visual", "Editorial & Production", "Commercial & Business"],
  jewellery: ["Design & Creation", "Craft & Workshop", "Sourcing & Supply", "Retail & Client Experience", "Marketing & Brand", "Business & Operations"],
  pets: ["Veterinary & Animal Health", "Pet Food & Nutrition", "Pet Retail & E-Commerce", "Pet Services & Wellbeing", "Marketing & Brand", "Business & Operations"],
  travel: ["Airlines & Aviation", "Rail & Public Transport", "Hotels & Accommodation", "Tour Operators & Experiences", "Travel Tech & Platforms", "Business & Commercial"],
  beauty: ["Product & Formulation", "Manufacturing & Supply", "Retail & Counter", "Salon & Treatment", "Marketing & Brand", "Business & Operations"],
  cars: ["Design & Engineering", "Manufacturing", "Sales & Dealership", "Aftercare & Service", "Marketing & Brand", "Business & Operations"],
};

const STAGE_KEYWORDS: Record<string, Record<string, string[]>> = {
  beer: {
    "Brewing & Production": ["brewer", "head brewer", "brewing", "cellar", "fermentation", "packaging"],
    "Quality & Lab": ["quality", "lab", "microbiologist", "sensory", "qa"],
    "Taproom & Retail": ["taproom", "bar", "bartender", "front of house", "retail", "shop"],
    "Sales & Distribution": ["sales", "account manager", "distribution", "wholesale", "export"],
    "Marketing & Brand": ["marketing", "brand", "content", "social", "events", "pr"],
    "Operations": ["operations", "logistics", "warehouse", "finance", "hr", "people"],
  },
  bakery: {
    "Craft & Product": ["baker", "pastry", "viennoiserie", "cake", "bread", "product developer"],
    "Production": ["production", "manufacturing", "quality", "food safety", "prep"],
    "Operations": ["operations", "supply chain", "logistics", "planner", "warehouse"],
    "Retail & Café": ["barista", "team member", "shift", "supervisor", "store", "front of house", "assistant manager"],
    "Marketing": ["marketing", "brand", "social", "content"],
  },
  charity: {
    "Mission & Cause": ["programme", "campaign", "advocacy", "policy"],
    Fundraising: ["fundraising", "partnerships", "major donor", "individual giving", "events"],
    Operations: ["operations", "finance", "hr", "people", "coordinator"],
    "Service Delivery": ["support worker", "advisor", "caseworker", "volunteer", "service"],
    "Impact & Reporting": ["impact", "evaluation", "insight", "reporting", "data analyst"],
  },
  cinema: {
    Development: ["development", "script", "story", "acquisitions"],
    Production: ["producer", "production", "camera", "director", "sound", "coordinator"],
    "Post-Production": ["editor", "vfx", "post", "colour", "animation"],
    Distribution: ["distribution", "marketing", "publicity", "sales", "festival"],
    Exhibition: ["cinema", "venue", "box office", "programmer", "events"],
  },
  coffee: {
    "Origin & Sourcing": ["buyer", "green coffee", "origin", "sourcing"],
    "Roasting & Production": ["roaster", "production", "quality", "qa", "warehouse"],
    Operations: ["operations", "supply chain", "account manager", "wholesale"],
    "Retail & Café": ["barista", "cafe", "café", "shift", "store manager", "supervisor"],
    "Brand & Growth": ["marketing", "brand", "content", "community", "events", "e-commerce"],
  },
  "estate-agency": {
    Valuation: ["valuer", "valuation", "lister", "instructions"],
    Listings: ["property marketing", "listing", "photography", "copywriter"],
    Sales: ["sales negotiator", "sales", "associate director", "branch manager"],
    Lettings: ["lettings", "property manager", "tenancy", "leasing"],
    "Operations & Marketing": ["operations", "mortgage", "marketing", "crm", "administrator"],
  },
  fashion: {
    Design: ["designer", "textile", "pattern", "creative", "stylist"],
    Sourcing: ["buyer", "sourcing", "fabric", "compliance", "sustainability"],
    Production: ["production", "garment", "quality", "sample"],
    Marketing: ["marketing", "brand", "content", "social", "pr"],
    Retail: ["retail", "merchandiser", "store", "e-commerce", "visual"],
    Consumer: ["customer", "community", "crm", "loyalty"],
  },
  "food-drink": {
    Kitchen: ["chef", "cook", "kitchen", "prep", "pastry"],
    "Front of House": ["waiter", "server", "host", "bartender", "bar staff", "front of house"],
    Operations: ["general manager", "assistant manager", "operations", "restaurant manager"],
    "Growth & Marketing": ["marketing", "brand", "partnerships", "events", "sales"],
    "Support Functions": ["finance", "people", "hr", "recruitment", "admin"],
  },
  football: {
    Sporting: ["coach", "physio", "performance", "academy", "medical"],
    "Scouting & Analysis": ["analyst", "scout", "recruitment", "data"],
    "Club Operations": ["operations", "facilities", "ticketing", "stadium"],
    Commercial: ["commercial", "sponsorship", "partnerships", "sales", "brand"],
    "Media & Community": ["content", "video", "social", "media", "community"],
  },
  grocery: {
    Sourcing: ["buyer", "sourcing", "category", "procurement"],
    "Supply Chain": ["supply chain", "logistics", "warehouse", "distribution"],
    "Store Operations": ["store", "team manager", "operations", "assistant manager"],
    Commercial: ["trading", "merchandising", "e-commerce", "marketing"],
    "Digital & Support": ["engineer", "developer", "analyst", "finance", "people"],
  },
  "interior-design": {
    Concept: ["interior designer", "designer", "stylist", "concept"],
    "Design Development": ["cad", "technical", "project designer", "specification"],
    Procurement: ["procurement", "sourcing", "buyer"],
    Sales: ["sales", "showroom", "business development", "account manager"],
    Operations: ["operations", "project manager", "installation", "logistics"],
  },
  music: {
    Creation: ["a&r", "artist", "songwriter", "composer"],
    Production: ["producer", "audio", "sound", "recording", "studio"],
    Distribution: ["distribution", "licensing", "royalties", "label"],
    Marketing: ["marketing", "social", "content", "publicity", "partnerships"],
    "Live & Events": ["events", "venue", "promoter", "booking", "festival", "ticketing"],
  },
  teaching: {
    Classroom: ["teacher", "tutor", "ta", "teaching assistant", "lecturer"],
    Pastoral: ["pastoral", "safeguarding", "send", "attendance"],
    Curriculum: ["curriculum", "subject lead", "assessment", "instructional"],
    Leadership: ["headteacher", "principal", "assistant head", "deputy", "director"],
    Operations: ["operations", "admissions", "office", "admin", "finance", "hr"],
  },
  footwear: {
    "Design & Development": ["designer", "design", "product developer", "footwear developer", "pattern", "last", "prototype", "colour", "colorway"],
    "Manufacturing": ["manufacturing", "production", "factory", "quality", "assembly", "materials"],
    "Supply Chain": ["supply chain", "logistics", "warehouse", "sourcing", "procurement", "import", "export", "planning"],
    "Retail & E-Commerce": ["retail", "store", "e-commerce", "ecommerce", "visual merchandiser", "sales associate", "store manager"],
    "Marketing & Brand": ["marketing", "brand", "content", "social", "pr", "creative", "digital", "community", "influencer"],
    "Business & Strategy": ["finance", "hr", "people", "strategy", "analyst", "legal", "operations", "commercial", "data"],
  },
  physiotherapy: {
    "Education & Training": ["student", "placement", "lecturer", "research", "academic"],
    "NHS & Primary Care": ["band 5", "band 6", "band 7", "band 8", "nhs", "community", "outpatient"],
    "Sports & Performance": ["sports", "pitch", "strength", "conditioning", "performance", "athlete"],
    "Private Practice": ["private", "clinic", "msk", "musculoskeletal", "domiciliary"],
    "Specialist Areas": ["neuro", "respiratory", "paediatric", "women", "pain", "hand therapy"],
    "Leadership": ["head of", "director", "consultant", "service lead", "clinical lead", "ahp"],
  },
  psychotherapy: {
    "Training & Qualification": ["trainee", "student", "placement"],
    "NHS & IAPT": ["iapt", "pwp", "psychological wellbeing", "high intensity", "talking therapies", "nhs"],
    "Private Practice": ["private", "online therapist", "self-employed"],
    "Specialist Populations": ["child", "adolescent", "addiction", "eating disorder", "trauma", "perinatal", "couples"],
    "Supervision & Ethics": ["supervisor", "clinical supervisor", "ethics"],
    "Leadership & Research": ["head of", "director", "professor", "research", "service lead"],
  },
  wellness: {
    "Gyms & Fitness": ["gym", "fitness", "personal trainer", "pt", "instructor", "coach", "exercise"],
    "Health & Wellbeing": ["wellbeing", "wellness", "yoga", "pilates", "mindfulness", "spa", "therapist"],
    "Supplements & Nutrition": ["nutrition", "supplement", "dietitian", "formulation", "protein", "food science"],
    "Activewear & Apparel": ["activewear", "apparel", "designer", "merchandis", "buyer"],
    "Retail & Wellness": ["retail", "store", "pharmacy", "pharmacist", "beauty", "counter", "advisor", "shop", "cashier", "team member", "assistant", "boots", "superdrug", "holland"],
    "Community & Experience": ["community", "events", "social media", "content", "membership", "experience"],
    "Business & Growth": ["director", "head of", "operations", "strategy", "finance", "hr", "people"],
  },
  pets: {
    "Veterinary & Animal Health": ["vet", "veterinary", "veterinarian", "vet nurse", "veterinary nurse", "rvn", "animal health", "clinical", "surgeon"],
    "Pet Food & Nutrition": ["pet food", "nutrition", "npd", "formulation", "quality assurance", "production", "manufacturing"],
    "Pet Retail & E-Commerce": ["retail", "store", "shop", "e-commerce", "ecommerce", "buyer", "merchandis", "warehouse"],
    "Pet Services & Wellbeing": ["groomer", "grooming", "dog walker", "pet sitter", "trainer", "dog trainer", "behaviourist", "photographer", "boarding", "kennel", "daycare"],
    "Marketing & Brand": ["marketing", "brand", "content", "social media", "pr ", "communications"],
    "Business & Operations": ["operations", "finance", "hr", "director", "head of", "practice manager", "franchise"],
  },
  travel: {
    "Airlines & Aviation": ["pilot", "cabin crew", "flight", "airline", "airport", "aviation", "ground", "cargo", "dispatcher"],
    "Rail & Public Transport": ["train driver", "rail", "signalling", "station", "bus", "transport", "tfl", "conductor"],
    "Hotels & Accommodation": ["hotel", "housekeeping", "concierge", "front desk", "reception", "f&b", "spa", "porter"],
    "Tour Operators & Experiences": ["tour", "travel agent", "travel consultant", "destination", "cruise", "holiday", "contracting"],
    "Travel Tech & Platforms": ["product manager", "software", "engineer", "data", "ux", "booking", "platform", "developer"],
    "Business & Commercial": ["commercial", "marketing", "brand", "sustainability", "finance", "hr", "director", "partnerships"],
  },
};

const SPECIFIC_ROLE_HINTS = /\b(team member|account manager|crm executive|services assistant|trading assistant|food manager|product technologist|customer and trading manager|assistant manager|store manager|team manager|general manager|project manager|programme manager|program manager|operations manager|warehouse operative|warehouse colleague|delivery driver|driver|barista|baker|chef|cook|waiter|server|bartender|host|runner|picker|packer|engineer|developer|designer|analyst|coordinator|specialist|technologist|merchandiser|buyer|planner|advisor|consultant|teacher|lecturer|tutor|recruiter|scientist|technician|operator|supervisor|officer|administrator|producer|editor|writer|cashier|receptionist|porter|steward|controller|valuer|negotiator|apprentice|intern|graduate)\b/i;
const GENERIC_ROLE_WORDS = /\b(manager|director|head|lead|associate|assistant|specialist|executive|coordinator|advisor|consultant|officer|administrator|admin)\b/i;
const ROLE_CONTEXT_HINTS = /\b(product|marketing|finance|people|operations|trading|customer|store|engineering|commercial|brand|sales|hr|data|supply chain|procurement|quality|content|social|recruitment|partnerships|design|technology|digital|food|retail|warehouse|delivery|kitchen|logistics|community|policy|research|analytics|crm|merchandising|buying|planning|production|bar|cafe|café)\b/i;
const JOB_CONTENT_HINTS = /\b(apply|responsibilit|requirement|qualification|experience|salary|compensation|benefits|location|hours|contract|permanent|fixed[- ]term|full[- ]?time|part[- ]?time|hybrid|remote|report(?:ing)? to|vacancy|job reference|job description|closing date)\b/i;
const JOB_URL_HINTS = /(greenhouse\.io|workday|smartrecruiters|lever\.co|ashbyhq|\/((job|jobs|job-search|roles?|vacanc(?:y|ies)|positions?|openings?)\b)|[?&](job|jobid|gh_jid|lever_id|vacancy|reqid)=)/i;
const JOB_DETAIL_URL_HINTS = /(greenhouse\.io|workday|smartrecruiters|lever\.co|ashbyhq|\/(?:job|jobs|roles?|vacanc(?:y|ies)|positions?|openings?)\/[^/?#]{3,}|[?&](job|jobid|gh_jid|lever_id|vacancy|reqid)=)/i;
const NON_JOB_HOST_HINTS = /(youtube\.com|youtu\.be|curator\.io|instagram\.com|facebook\.com|linkedin\.com|tiktok\.com|x\.com|twitter\.com|support\.renaissance\.com)/i;
const MEDIA_URL_HINTS = /\/(?:_next\/image|cdn-cgi\/image)\b|\.(?:avif|gif|jpe?g|png|svg|webp|mp4|mov|pdf)(?:$|\?)/i;
const NON_JOB_URL_HINTS = /(#$|\/(about|about-us|life-at|who-we-are|our-(teams?|story)|teams?|team|culture|benefits|inclusion|diversity|sustainability|community|social-wall|locations?|departments?|business-areas|cast|blog\/meet-|property-guides?|buyers-guide|buying\/|investors?|analyst-coverage|healthcare-professionals|why-brakes|product-assurance|knowledge-base|apac-careers)(\/|$))/i;
const PRODUCT_PAGE_URL_HINTS = /\/(us|gb|eu|au|fr|de|it|es)\/(retro-|classic-|leather-|suede-|cotton-|silk-|wool-|linen-|cashmere-|velvet-|satin-|nylon-|denim-|trainer|sneaker|dress|skirt|trouser|jacket|coat|knit|shirt|bag|accessori)/i;
const PROMO_TITLE_STARTS = /^(we(?:'|’)re|this\s|from our|apply today|thank you|oops|sounds good|if you see|protecting you|find your|use my location|home\b|jobs near me\b|lead beyond boundaries\b|lead fearless teams\b|next level leaders\b)/i;
const TITLE_CASE_ROLE_PATTERN = /^[A-Z][A-Za-z0-9&+'()./-]*(?:\s+[A-Z][A-Za-z0-9&+'()./-]*){1,5}$/;
const STRUCTURED_JOB_EXTRACTION_PROMPT = `Extract only real, currently open job vacancies from this page. Ignore navigation, testimonials, benefits, locations, culture copy, team names, employee stories, image captions, and marketing slogans. Return a JSON object with a jobs array. Each job must include title and url when available. Optional fields: location, employment_type, description. Exclude generic pages and anything that is not an actual role someone can apply for right now.`;

function normalizeIndustryKey(industry: string): string {
  return industry
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value: string): string {
  return value
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[>*_`#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupTitle(value: unknown): string {
  const title = stripMarkdown(normalizeText(value));
  return title
    .replace(/\s*[|–-]\s*(careers?|jobs?|job search|vacancies).*/i, '')
    .replace(/^all jobs\s*[:|-]?\s*/i, '')
    .replace(/\\+$/g, '')
    .replace(/\s+$/, '')
    .trim();
}

function resolveUrl(value: unknown, baseUrl: string): URL | null {
  const url = normalizeText(value);
  if (!url) return null;

  try {
    return new URL(url, baseUrl);
  } catch {
    return null;
  }
}

function isSamePageUrl(url: string, sourceUrl: string): boolean {
  const resolved = resolveUrl(url, sourceUrl);
  const source = resolveUrl(sourceUrl, sourceUrl);

  return !!resolved
    && !!source
    && resolved.origin === source.origin
    && resolved.pathname === source.pathname;
}

function hasCredibleRoleShape(title: string): boolean {
  const normalized = normalizeText(title);
  if (!normalized) return false;

  const matchesTitleCaseRole = TITLE_CASE_ROLE_PATTERN.test(normalized)
    && !/\b(office|careers?|jobs?|community|leaders|boundaries|opportunity|benefits|culture|locations?|story|team)\b/i.test(normalized);

  return SPECIFIC_ROLE_HINTS.test(normalized)
    || (GENERIC_ROLE_WORDS.test(normalized) && ROLE_CONTEXT_HINTS.test(normalized))
    || matchesTitleCaseRole;
}

function looksLikePromotionalTitle(title: string): boolean {
  const normalized = normalizeText(title);
  if (!normalized) return false;

  if (PROMO_TITLE_STARTS.test(normalized)) return true;
  if (normalized.includes('. ') || /[!?]$/.test(normalized)) return true;
  if (/^(collecting|working|joining|leading|making|keeping|supporting|delivering|helping)\b/i.test(normalized)) return true;
  if (/\b(all jobs|jobs?\s*[&/]\s*internships?|find your next opportunity|find your team|apply for role|our benefits package|we treat people|partner difference|view vacancies|first[- ]time buyer|browse all|search jobs|more info|read more|learn more|see all|show more|click here|apply now)\b/i.test(normalized)) return true;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 10) return true;

  if ((/\b£\s?\d|\b\d{4,}\b|per hour\b|competitive plus benefits\b/i.test(normalized)
    || /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i.test(normalized))
    && !hasCredibleRoleShape(normalized)) {
    return true;
  }

  return false;
}

function looksLikeNonJobUrl(url: string, sourceUrl: string): boolean {
  const resolved = resolveUrl(url, sourceUrl);
  if (!resolved) return false;

  if (!['http:', 'https:'].includes(resolved.protocol)) return true;
  if (NON_JOB_HOST_HINTS.test(resolved.hostname)) return true;
  if (MEDIA_URL_HINTS.test(`${resolved.pathname}${resolved.search}`)) return true;
  if (PRODUCT_PAGE_URL_HINTS.test(resolved.pathname)) return true;

  // Reject URLs that are just the homepage with a hash fragment (broken links)
  if (resolved.pathname === '/' && resolved.hash && !resolved.search) return true;

  // Reject obvious landing/search pages: /careers, /jobs, /search, /grads, /vacancies on their own
  // (no trailing slug). E.g. https://dice.fm/jobs, https://www.compass-group.co.uk/grads/,
  // https://careers.caffenero.com/search, http://careers.paul-uk.com/
  const trimmedPath = resolved.pathname.replace(/\/+$/, '');
  if (/^\/?(careers?|jobs?|grads?|search|vacancies|recruitment|about|blog)$/i.test(trimmedPath)) return true;
  if (trimmedPath === '' || trimmedPath === '/') return true;

  // Reject /jobs?empNo=123 and similar (employer-listing URLs, not individual job postings)
  if (/^\/jobs\/?$/i.test(trimmedPath) && /(?:^|[?&])(empNo|employer|company|category|department|location)=/i.test(resolved.search)) {
    return true;
  }

  // Reject FashionJobs-style category aggregators: /s/<board>/<category-slug>.html
  if (/^\/s\/[^/]+\/[^/]+\.html?$/i.test(trimmedPath) && resolved.hostname.includes('fashionjobs')) return true;

  const source = resolveUrl(sourceUrl, sourceUrl);
  if (source && resolved.hostname === source.hostname && resolved.pathname === source.pathname && resolved.hash) {
    return true;
  }

  return NON_JOB_URL_HINTS.test(`${resolved.pathname}${resolved.search}${resolved.hash}`);
}

function looksLikeDetailedJobUrl(url: string, sourceUrl: string): boolean {
  const resolved = resolveUrl(url, sourceUrl);
  if (!resolved) return false;
  if (looksLikeNonJobUrl(resolved.toString(), sourceUrl)) return false;

  return JOB_DETAIL_URL_HINTS.test(`${resolved.hostname}${resolved.pathname}${resolved.search}`);
}

function looksLikeJobUrl(url: string, sourceUrl: string): boolean {
  const resolved = resolveUrl(url, sourceUrl);
  if (!resolved) return false;
  if (looksLikeNonJobUrl(resolved.toString(), sourceUrl)) return false;

  return JOB_URL_HINTS.test(`${resolved.hostname}${resolved.pathname}${resolved.search}`);
}

function hasStrongJobSignals(title: string, description: string, url: string, pageUrl: string): boolean {
  const normalizedTitle = normalizeText(title);
  const combined = `${normalizedTitle} ${description}`.trim();
  const samePage = isSamePageUrl(url, pageUrl);
  const credibleTitle = hasCredibleRoleShape(normalizedTitle);
  const specificRole = SPECIFIC_ROLE_HINTS.test(normalizedTitle);
  const detailedUrl = looksLikeDetailedJobUrl(url, pageUrl);
  const jobUrl = looksLikeJobUrl(url, pageUrl);

  if (!normalizedTitle || looksLikePromotionalTitle(normalizedTitle)) return false;
  if (samePage) return specificRole || (credibleTitle && JOB_CONTENT_HINTS.test(combined));
  if (detailedUrl && credibleTitle) return true;
  if (specificRole) return true;

  return credibleTitle && jobUrl && JOB_CONTENT_HINTS.test(combined);
}

function isValidJobTitle(title: string): boolean {
  const cleaned = cleanupTitle(title);
  const normalized = cleaned.toLowerCase().trim();
  if (!normalized || normalized.length < 4 || normalized.length > 140) return false;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;
  if (normalized.startsWith('!')) return false;

  const invalidPatterns = [
    /^careers?$/,
    /^jobs?$/,
    /^vacancies$/,
    /^join us$/,
    /^join our team$/,
    /^work with us$/,
    /^working here$/,
    /^all jobs$/,
    /^job search$/,
    /^opportunities$/,
    /^search roles$/,
    /^open roles$/,
    /^our teams?$/,
    /^benefits$/,
    /^about us$/,
    /^skip to/,
    /^more about/,
    /^read more$/,
    /^learn more$/,
    /^view all$/,
    /^back to/,
    /^go to/,
    /^see all/,
    /^see\s+[a-z].*/,
    /^explore /,
    /^join the team$/,
    /^filter by/,
    /^showing \d+/,
    /^sort by/,
    /^page \d/,
    /^next$/,
    /^previous$/,
    /^load more/,
    /^apply now$/,
    /^sign up/,
    /^subscribe/,
    /^create.*alert/,
    /^job id:/,
    /^find out more$/,
    /^watch on /,
    /^powered by /,
    /^high contrast theme$/,
    /^our business areas$/,
    /^join our community$/,
    /^the partner difference$/,
    /^use my location$/,
    /^find your team$/,
    /^find your next opportunity$/,
    /^apply for role$/,
    /^home\b.*careers?$/,
    /^lead beyond boundaries$/,
    /^lead fearless teams$/,
    /^next level leaders$/,
  ];

  if (invalidPatterns.some((pattern) => pattern.test(normalized))) return false;
  if (/cookie|privacy|terms|login|sign in|register|talent community|early careers/i.test(normalized)) return false;
  if (/[,;]|:\s/.test(cleaned) && !hasCredibleRoleShape(cleaned)) return false;
  if (looksLikePromotionalTitle(cleaned)) return false;

  if (/\b(my journey|presents:|how we|brightening|view latest|life at|our story|meet the|day in the life|what it'?s like|blog|article)\b/i.test(normalized)) return false;
  if (/\b(australia|apac|asia[- ]pacific)\b/i.test(normalized) && !hasCredibleRoleShape(cleaned)) return false;
  if (/\b(buyer'?s guide|property guide|first[- ]time buyer|size guide|delivery info|returns policy)\b/i.test(normalized)) return false;

  if (/\b(laughing|smiling|standing|sitting|walking|holding|looking|sticker on|background|employees?|woman|man|people|photo|image|picture)\b/i.test(normalized) && !hasCredibleRoleShape(cleaned)) return false;

  if (/^\[?[A-Z][a-z]+(?: - | – )(?:main |head )?office/i.test(cleaned.trim())) return false;
  if (/^[\[\(]?(?:london|manchester|birmingham|paris|dublin|berlin|amsterdam|milan|rome|florence|brescia|naples|bologna|hong kong|singapore|new york|chicago|sydney|melbourne|edinburgh|glasgow|leeds|bristol|liverpool|leicester|hatfield)\b/i.test(normalized.replace(/[\[\]\\]/g, ''))) return false;

  return hasCredibleRoleShape(cleaned);
}

function toAbsoluteUrl(value: unknown, baseUrl: string): string {
  const url = normalizeText(value);
  if (!url) return baseUrl;

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function extractLocation(text: string): string | null {
  const locationMatch = text.match(/\b(London|Manchester|Birmingham|Leeds|Bristol|Edinburgh|Glasgow|Liverpool|Leicester|Hatfield|Burton-on-Trent|Loughborough|Dublin|Berlin|Amsterdam|New York|Los Angeles|San Francisco|Remote)\b/i);
  return locationMatch ? locationMatch[1] : null;
}

function extractWorkMode(text: string): string {
  if (/remote/i.test(text)) return 'Remote';
  if (/hybrid/i.test(text)) return 'Hybrid';
  return 'On-site';
}

function extractEmploymentType(text: string): string {
  if (/intern(ship)?/i.test(text)) return 'Internship';
  if (/apprentice/i.test(text)) return 'Apprenticeship';
  if (/freelance|contractor/i.test(text)) return 'Freelance';
  if (/part[- ]?time/i.test(text)) return 'Part-time';
  if (/contract|fixed[- ]term|temporary/i.test(text)) return 'Contract';
  return 'Full-time';
}

function classifyJob(title: string, description: string, industry: string): { stage: string | null; roleCategory: string | null } {
  const key = normalizeIndustryKey(industry);
  const combined = `${title} ${description}`.toLowerCase();
  const stageRules = STAGE_KEYWORDS[key];

  if (stageRules) {
    for (const [stage, keywords] of Object.entries(stageRules)) {
      if (keywords.some((keyword) => combined.includes(keyword))) {
        return { stage, roleCategory: title };
      }
    }
  }

  return {
    stage: INDUSTRY_STAGES[key]?.[0] ?? null,
    roleCategory: title || null,
  };
}

function getSourceHostname(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isSameHostOrSubdomain(url: string, sourceUrl: string): boolean {
  const resolved = resolveUrl(url, sourceUrl);
  const source = resolveUrl(sourceUrl, sourceUrl);
  if (!resolved || !source) return false;

  const resolvedHost = resolved.hostname.replace(/^www\./, '');
  const sourceHost = source.hostname.replace(/^www\./, '');
  return resolvedHost === sourceHost || resolvedHost.endsWith(`.${sourceHost}`);
}

function extractNetflixJobsFromMarkdown(markdown: string, company: string, source: CareerSource): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const normalized = markdown.replace(/\r/g, '');
  const blocks = normalized.split(/\n(?=# )/g);

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const titleLine = lines.find((line) => line.startsWith('# '));
    if (!titleLine) continue;

    const title = cleanupTitle(titleLine.replace(/^#\s+/, ''));
    if (!isValidJobTitle(title)) continue;

    const postingDateIndex = lines.findIndex((line) => /job posting date/i.test(line));
    const requisitionIndex = lines.findIndex((line) => /job requisition id/i.test(line));
    if (postingDateIndex === -1 || requisitionIndex === -1) continue;

    const location = lines[1] && !/^apply now$/i.test(lines[1]) ? normalizeText(lines[1]) : null;
    const teamIndex = lines.findIndex((line) => /^teams$/i.test(line));
    const workTypeIndex = lines.findIndex((line) => /^work type$/i.test(line));
    const descriptionStart = lines.findIndex((line) => /^at netflix,/i.test(line));
    const description = descriptionStart >= 0
      ? lines.slice(descriptionStart, Math.min(descriptionStart + 8, lines.length)).join(' ').slice(0, 2000)
      : null;

    const detailUrl = `${source.url}?query=${encodeURIComponent(title)}`;
    const seeded = createJobRecord(
      company,
      source,
      {
        title,
        url: detailUrl,
        location,
        employment_type: workTypeIndex >= 0 ? lines[workTypeIndex + 1] : null,
        description,
      },
      [
        location,
        teamIndex >= 0 ? lines[teamIndex + 1] : null,
        workTypeIndex >= 0 ? lines[workTypeIndex + 1] : null,
        description,
      ].filter(Boolean).join(' '),
      source.url,
    );

    if (seeded) jobs.push(seeded);
  }

  return dedupeJobs(jobs);
}

function extractAsosJobsFromMarkdown(markdown: string, company: string, source: CareerSource): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const lines = markdown.replace(/\r/g, '').split('\n').map((line) => line.trim());

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^\d+\.\s+\[([^\]]{4,180})\]\(([^)]+)\)$/);
    if (!match) continue;

    const title = cleanupTitle(match[1]);
    const url = toAbsoluteUrl(match[2], source.url);
    const metaLine = normalizeText(lines[index + 1] || '');
    const locationMatch = metaLine.match(/Location\*\*(.*?)\*\*Department/i);
    const departmentMatch = metaLine.match(/Department\*\*(.*?)\*\*Level/i);
    const typeMatch = metaLine.match(/Type of Role\*\*(.*?)\*\*$/i);

    const seeded = createJobRecord(
      company,
      source,
      {
        title,
        url,
        location: locationMatch?.[1] || null,
        employment_type: typeMatch?.[1] || null,
        description: metaLine,
      },
      [metaLine, departmentMatch?.[1] || null].filter(Boolean).join(' '),
      source.url,
    );

    if (seeded) jobs.push(seeded);
  }

  return dedupeJobs(jobs);
}

function extractGreggsJobsFromMarkdown(markdown: string, company: string, source: CareerSource): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  // Join multi-line markdown links into single lines
  const collapsed = markdown.replace(/\r/g, '').replace(/\\\\\n/g, ' ').replace(/\n(?!\s*[-*#\[])/g, ' ');
  
  // Match markdown links to greggs job URLs
  const linkPattern = /\[([^\]]*?\*\*([^*]{3,80})\*\*[^\]]*?)\]\((https:\/\/careerssearch\.greggs\.co\.uk\/jobs\/job\/[^)]+)\)/g;
  let match;
  
  while ((match = linkPattern.exec(collapsed)) !== null) {
    const fullText = match[1];
    const title = cleanupTitle(match[2]);
    const url = match[3];
    if (!isValidJobTitle(title)) continue;

    const locationMatch = fullText.match(/([A-Z][\w\s,]+),\s*United Kingdom/);
    const salaryMatch = fullText.match(/(£[\d.]+\s*per\s*hour)/i);
    const typeMatch = fullText.match(/(Permanent|Temporary)/i);

    const seeded = createJobRecord(company, source, {
      title,
      url,
      location: locationMatch?.[1]?.trim() || null,
      employment_type: typeMatch?.[1] || 'Permanent',
      description: salaryMatch?.[1] || null,
    }, fullText, source.url);

    if (seeded) jobs.push(seeded);
  }

  return dedupeJobs(jobs);
}

function extractPaulUkJobsFromMarkdown(markdown: string, company: string, source: CareerSource): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const lines = markdown.replace(/\r/g, '').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Paul UK format: ### Title - salary or ### Title £salary
    const match = line.match(/^-?\s*###\s+(.+)/);
    if (!match) continue;

    let rawTitle = match[1].trim();
    // Skip non-job headings
    if (/^(benefits|join us|our\s|more\s|as a member)/i.test(rawTitle)) continue;

    // Extract salary from title
    let salary: string | null = null;
    const salaryMatch = rawTitle.match(/[-–]\s*(£[\d,.]+.*?)$/i);
    if (salaryMatch) {
      salary = salaryMatch[1].trim();
      rawTitle = rawTitle.replace(/\s*[-–]\s*£[\d,.]+.*$/, '').trim();
    }
    const salaryMatch2 = rawTitle.match(/\s+(£[\d,.]+.*?)$/i);
    if (!salary && salaryMatch2) {
      salary = salaryMatch2[1].trim();
      rawTitle = rawTitle.replace(/\s+£[\d,.]+.*$/, '').trim();
    }

    const title = cleanupTitle(rawTitle);
    if (!title || title.length < 4) continue;

    // Look ahead for location info
    let location: string | null = null;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      const ahead = lines[j].trim();
      if (/\*\*Based at/i.test(ahead)) {
        const locMatch = ahead.match(/Based at\s*:?\s*(.*?)\*\*/i);
        if (locMatch) location = locMatch[1].replace(/[.*]/g, '').trim();
        break;
      }
    }

    const seeded = createJobRecord(company, source, {
      title,
      url: source.url,
      location,
      description: salary ? `Salary: ${salary}` : null,
    }, `${title} ${salary || ''} ${location || ''} bakery baker pastry`, source.url);

    if (seeded) jobs.push(seeded);
  }

  return dedupeJobs(jobs);
}

// Ocado Logistics careers site (Webflow CMS) renders cards in a strict 7-block sequence:
//   <category>\n<title>\n<location>\nFULL TIME|PART TIME|CASUAL\nPermanent|Temporary|...\nPosted N {days|months|years} ago\n[Apply now](https://iahbme.fa.ocs.oraclecloud.com/...)
//
// When Firecrawl's `onlyMainContent` strips the inline apply link, we fall back to
// the ordered list of Oracle HCM apply URLs (collected from the `links` format) and
// pair them to cards by position.
const OCADO_ORACLE_APPLY_RE = /https:\/\/iahbme\.fa\.ocs\.oraclecloud\.com\/hcmUI\/CandidateExperience\/[^\s)"'<>]+/gi;
const OCADO_APPLY_LINK_MD_RE = /\[Apply now\]\((https:\/\/iahbme\.fa\.ocs\.oraclecloud\.com\/[^)]+)\)/i;

function extractOcadoLogisticsJobsFromMarkdown(
  markdown: string,
  company: string,
  source: CareerSource,
  fallbackApplyLinks: string[] = [],
): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const lines = markdown.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);

  const KNOWN_CATEGORIES = new Set([
    'customer delivery',
    'head office',
    'hgv/lgv transport',
    'warehouse',
    'service engineering and maintenance',
    'logistics operations',
    'people',
    'finance',
    'data analytics',
    'compliance, risk and audit',
  ]);

  // Strip markdown emphasis (**bold**, *italic*) and trim before matching
  const norm = (l: string) => l.replace(/\*+/g, '').replace(/^[-•*]\s*/, '').trim();
  const isEmploymentLine = (l: string) => /^(FULL\s*TIME|PART\s*TIME|CASUAL)\b/i.test(norm(l));
  const isContractLine = (l: string) => /^(Permanent|Temporary|Fixed[\s-]?Term|Casual|Contract)\b/i.test(norm(l));
  const isPostedLine = (l: string) => /Posted\s+\d+\s+(day|week|month|year)s?\s+ago/i.test(norm(l));

  // Ordered fallback queue of Oracle apply URLs found anywhere on the page.
  // We pop from the front whenever a card lacks its own inline apply link.
  const orderedApplyUrls: string[] = [];
  for (const line of lines) {
    let m: RegExpExecArray | null;
    const re = new RegExp(OCADO_ORACLE_APPLY_RE.source, 'gi');
    while ((m = re.exec(line)) !== null) {
      orderedApplyUrls.push(m[0]);
    }
  }
  for (const link of fallbackApplyLinks) {
    if (typeof link === 'string' && /iahbme\.fa\.ocs\.oraclecloud\.com\/hcmUI\/CandidateExperience/i.test(link)) {
      orderedApplyUrls.push(link);
    }
  }
  // De-dupe while preserving order
  const seenApply = new Set<string>();
  const applyQueue = orderedApplyUrls.filter((u) => {
    if (seenApply.has(u)) return false;
    seenApply.add(u);
    return true;
  });
  let applyCursor = 0;

  for (let i = 0; i < lines.length; i++) {
    const cat = norm(lines[i].replace(/^#+\s*/, ''));
    if (!cat || !KNOWN_CATEGORIES.has(cat.toLowerCase())) continue;

    // Strict 7-block lookahead: title, location, employment, contract, posted, [apply]
    const title = cleanupTitle(norm((lines[i + 1] || '').replace(/^#+\s*/, '')));
    const location = norm(lines[i + 2] || '') || null;
    const employmentLine = lines[i + 3] || '';
    const contractLine = lines[i + 4] || '';
    const postedLine = lines[i + 5] || '';
    const applyLine = lines[i + 6] || '';

    if (!isValidJobTitle(title)) continue;
    if (!isEmploymentLine(employmentLine)) continue;
    if (!isContractLine(contractLine)) continue;
    if (!isPostedLine(postedLine)) continue;

    // Prefer the inline [Apply now](...) link on the card itself
    let applyUrl: string | null = null;
    const inline = applyLine.match(OCADO_APPLY_LINK_MD_RE);
    if (inline) {
      applyUrl = inline[1];
    } else {
      // Fall back to the next Oracle URL in document order
      while (applyCursor < applyQueue.length) {
        applyUrl = applyQueue[applyCursor++];
        break;
      }
    }

    const seeded = createJobRecord(
      company,
      source,
      {
        title,
        url: applyUrl || source.url,
        location,
        employment_type: [employmentLine, contractLine].filter(Boolean).join(' · ') || null,
        description: [cat, location, postedLine].filter(Boolean).join(' · '),
      },
      [cat, location, employmentLine, contractLine, postedLine].filter(Boolean).join(' '),
      source.url,
    );

    if (seeded) jobs.push(seeded);

    // Skip past this card so we don't re-match its own employment/contract lines
    i += 6;
  }

  if (jobs.length === 0) {
    console.log(`[scrape-jobs] Ocado Logistics DEBUG: ${lines.length} lines, ${applyQueue.length} apply URLs queued. First 40 lines: ${JSON.stringify(lines.slice(0, 40))}`);
  }

  return dedupeJobs(jobs);
}

// Ocado Retail's careers site (careers.ocadoretail.com/open-roles/) renders a single
// pipe-table where each row is: Name | Team | Vacancy No. | Employment Type | Work Location | Applications Close Date.
// There are NO inline per-job links - the site relies on a Salesforce-hosted apply
// page reached via the vacancy reference. We rebuild that URL ourselves so each row
// has a real apply destination, and we synthesise a clean structured description
// from the row's fields (instead of dumping the whole listing markdown as the desc).
const OCADO_RETAIL_APPLY_URL = (vacancyNo: string) =>
  `https://ocadoretail.my.salesforce-sites.com/recruit/fRecruit__ApplyMyApplication?uid=${encodeURIComponent(vacancyNo)}`;

function extractOcadoRetailJobsFromMarkdown(
  markdown: string,
  company: string,
  source: CareerSource,
): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const lines = markdown.replace(/\r/g, '').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;
    // Skip header / separator rows
    if (/^\|\s*[-:]+\s*\|/.test(line)) continue;

    const cells = line
      .slice(1, -1)
      .split('|')
      .map((c) => c.replace(/\*+/g, '').trim());

    if (cells.length < 6) continue;

    const [nameCell, teamCell, vacancyCell, employmentCell, locationCell, closingCell] = cells;

    // Skip the header row (column titles include sort arrows like ↑ / ↓↑)
    if (/^Name\b/i.test(nameCell) || /Vacancy\s*No/i.test(vacancyCell)) continue;

    // Strip any markdown link wrapper around the title
    const titleRaw = nameCell.replace(/^\[(.*)\]\([^)]*\)$/, '$1').trim();
    const title = cleanupTitle(titleRaw);
    if (!isValidJobTitle(title)) continue;

    // Vacancy reference must be numeric (e.g. 7554706) for the Salesforce URL to work
    const vacancyNo = vacancyCell.replace(/[^0-9]/g, '');
    if (!vacancyNo || vacancyNo.length < 5) continue;

    const team = teamCell || null;
    const employmentType = employmentCell || null;
    const location = locationCell || null;
    const closingDate = closingCell && closingCell !== '–' && closingCell !== '-' ? closingCell : null;

    const descriptionParts: string[] = [
      `${title} at Ocado Retail${location ? `, based in ${location}` : ''}.`,
      team ? `Team: ${team}.` : '',
      employmentType ? `Employment type: ${employmentType}.` : '',
      closingDate ? `Applications close: ${closingDate}.` : '',
      `Vacancy reference: ${vacancyNo}.`,
      'Apply via the Ocado Retail recruitment portal for the full job description, responsibilities and benefits.',
    ].filter(Boolean);

    // Build the record directly: createJobRecord would reject Salesforce-hosted apply
    // URLs because they're a different host (ocadoretail.my.salesforce-sites.com vs
    // careers.ocadoretail.com), and `hasStrongJobSignals` filters short titles like
    // "CRM Executive". For this curated source, the table itself is the signal.
    const description = descriptionParts.join(' ');
    const { stage, roleCategory } = classifyJob(title, description, source.industry);
    const workMode = extractWorkMode(`${title} ${description}`);
    const tags = [source.industry, stage, workMode !== 'On-site' ? workMode : null].filter(Boolean) as string[];

    jobs.push({
      title: title.slice(0, 255),
      company,
      location,
      salary: null,
      description: description.slice(0, 2000),
      url: OCADO_RETAIL_APPLY_URL(vacancyNo),
      tags,
      industry: source.industry,
      type: employmentType || 'Full-time',
      work_mode: workMode,
      featured: false,
      source_url: source.url,
      value_chain_stage: stage,
      role_category: roleCategory,
    });
  }

  return dedupeJobs(jobs);
}

function normalizeStructuredPayload(payload: any): any {
  if (typeof payload !== 'string') return payload;

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

function getExtractedJobsArray(payload: any): any[] {
  const normalized = normalizeStructuredPayload(payload);
  if (Array.isArray(normalized)) return normalized;
  if (Array.isArray(normalized?.jobs)) return normalized.jobs;
  if (Array.isArray(normalized?.openings)) return normalized.openings;
  if (Array.isArray(normalized?.roles)) return normalized.roles;
  if (Array.isArray(normalized?.positions)) return normalized.positions;
  if (Array.isArray(normalized?.vacancies)) return normalized.vacancies;
  if (Array.isArray(normalized?.data?.jobs)) return normalized.data.jobs;
  return [];
}

function createJobRecord(company: string, source: CareerSource, raw: any, contextText = '', pageUrl = source.url): NormalizedJob | null {
  const title = cleanupTitle(raw?.title || raw?.job_title || raw?.role || raw?.position || raw?.name);
  if (!isValidJobTitle(title)) return null;

  const description = normalizeText(raw?.description || raw?.summary || raw?.snippet || contextText).slice(0, 2000) || null;
  const combinedContext = [description, contextText].filter(Boolean).join(' ');
  let url = toAbsoluteUrl(raw?.url || raw?.apply_url || raw?.link || raw?.href, pageUrl);

  if (looksLikeNonJobUrl(url, pageUrl)) return null;
  if (!isSameHostOrSubdomain(url, source.url)) return null;
  if (!hasStrongJobSignals(title, combinedContext, url, pageUrl)) return null;

  // When per-vacancy URLs aren't extractable (e.g. SPA job boards like PeopleHR),
  // multiple roles collapse onto the same page URL and the DB upsert (onConflict: 'url')
  // keeps only one. Append a stable fragment derived from the title so each role
  // becomes a distinct row while still pointing users at the same job board page.
  try {
    const stripped = url.split('#')[0];
    const strippedPage = (pageUrl || source.url).split('#')[0];
    if (stripped === strippedPage) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
      const locSlug = (raw?.location || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
      const fragment = locSlug ? `${slug}--${locSlug}` : slug;
      if (fragment) url = `${stripped}#job=${fragment}`;
    }
  } catch (_e) {
    // Non-fatal; fall back to original URL.
  }

  const location = normalizeText(raw?.location || raw?.city || extractLocation(`${title} ${combinedContext}`)) || null;
  const type = normalizeText(raw?.employment_type || raw?.type || raw?.job_type || extractEmploymentType(`${title} ${combinedContext}`)) || 'Full-time';
  const workMode = extractWorkMode(`${title} ${combinedContext}`);
  const { stage, roleCategory } = classifyJob(title, description || '', source.industry);

  const tags = [source.industry, stage, workMode !== 'On-site' ? workMode : null].filter(Boolean) as string[];

  return {
    title: title.slice(0, 255),
    company,
    location,
    salary: null,
    description,
    url,
    tags,
    industry: source.industry,
    type,
    work_mode: workMode,
    featured: false,
    source_url: source.url,
    value_chain_stage: stage,
    role_category: roleCategory,
  };
}

function extractJobsFromStructuredPayload(payload: any, company: string, source: CareerSource, contextText = '', pageUrl = source.url): NormalizedJob[] {
  return dedupeJobs(
    getExtractedJobsArray(payload)
      .map((raw) => createJobRecord(company, source, raw, contextText, pageUrl))
      .filter(Boolean) as NormalizedJob[]
  );
}

function extractJobsFromMarkdown(markdown: string, company: string, source: CareerSource, pageUrl = source.url): NormalizedJob[] {
  const jobs: NormalizedJob[] = [];
  const lines = markdown.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('!') || line.startsWith('![')) continue;

    const matches = [...line.matchAll(/\[([^\]]{4,180})\]\(([^)]+)\)/g)];
    for (const match of matches) {
      if (match[1].startsWith('!')) continue;
      if (match[2].startsWith('#')) continue;

      // Strip standard markdown link titles: [text](url "title") - the title
      // part is not part of the URL. Without this, scrapers like A24's career
      // page produce malformed URLs ending in `%20%22Title%22`.
      let cleanUrl = match[2].trim();
      const titleMatch = cleanUrl.match(/^(\S+)\s+["'(].*$/);
      if (titleMatch) cleanUrl = titleMatch[1];

      const job = createJobRecord(company, source, {
        title: match[1],
        url: cleanUrl,
        description: stripMarkdown(line),
      }, stripMarkdown(line), pageUrl);

      if (job) jobs.push(job);
    }
  }

  return dedupeJobs(jobs);
}

function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();

  return jobs.filter((job) => {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}|${job.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Filter out jobs whose location clearly indicates a non-UK country */
const NON_UK_LOCATIONS = /\b(United States|USA|U\.S\.A|Canada|Australia|Germany|France|Spain|Italy|Netherlands|Belgium|Switzerland|Austria|Sweden|Norway|Denmark|Finland|Poland|Portugal|Czech|Romania|Hungary|Greece|Ireland|Japan|China|Hong Kong|Singapore|Malaysia|Philippines|India|Indonesia|Thailand|Vietnam|Korea|Taiwan|Brazil|Mexico|Colombia|Argentina|Chile|Peru|South Africa|Nigeria|Kenya|Egypt|UAE|Dubai|Abu Dhabi|Saudi Arabia|Qatar|Bahrain|Kuwait|Oman|Israel|Turkey|Russia|Ukraine|New Zealand)\b/i;
const NON_UK_CITIES = /\b(New York|Los Angeles|San Francisco|Chicago|Boston|Seattle|Portland|Miami|Houston|Dallas|Denver|Atlanta|Philadelphia|Detroit|Tokyo|Beijing|Shanghai|Mumbai|Delhi|Bangalore|Sydney|Melbourne|Auckland|Toronto|Montreal|Vancouver|Paris|Berlin|Munich|Hamburg|Amsterdam|Rotterdam|Madrid|Barcelona|Milan|Rome|Stockholm|Oslo|Copenhagen|Helsinki|Warsaw|Prague|Budapest|Vienna|Zurich|Geneva|Brussels|Lisbon|Dubai|Singapore|Hong Kong|Seoul|Taipei|Bangkok|Jakarta|Manila|Sao Paulo|Rio de Janeiro|Bogota|Mexico City|Buenos Aires|Cape Town|Johannesburg|Lagos|Nairobi|Cairo|Riyadh|Doha|Abu Dhabi|Herzogenaurach)\b/i;

function isLikelyUkJob(job: NormalizedJob): boolean {
  const loc = job.location || '';
  if (!loc) return true; // no location = keep (benefit of the doubt)
  // Explicit UK markers
  if (/\bU\.?K\.?\b|United Kingdom|England|Scotland|Wales|Northern Ireland/i.test(loc)) return true;
  // Check for non-UK country/city
  if (NON_UK_LOCATIONS.test(loc)) return false;
  if (NON_UK_CITIES.test(loc)) return false;
  return true; // default keep
}

// Dedicated paginated scraper for jobsinfootball.com (~592 listings across ~25 pages).
async function scrapeJobsInFootball(company: string, source: CareerSource, apiKey: string): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  const MAX_PAGES = 30;
  const all: NormalizedJob[] = [];
  let consecutiveEmpty = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const pageUrl = page === 1 ? source.url : `${source.url}?page=${page}`;
    try {
      const resp = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: pageUrl,
          formats: ['markdown', { type: 'json', prompt: STRUCTURED_JOB_EXTRACTION_PROMPT }],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      });
      if (!resp.ok) {
        console.warn(`[scrape-jobs] jobsinfootball page ${page} failed: ${resp.status}`);
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) break;
        continue;
      }
      const data = await resp.json();
      const markdown = data?.data?.markdown ?? data?.markdown ?? '';
      const structured = data?.data?.json ?? data?.json ?? null;
      const pageJobs = dedupeJobs([
        ...extractJobsFromStructuredPayload(structured, company, source, markdown, pageUrl),
        ...extractJobsFromMarkdown(markdown, company, source, pageUrl),
      ]);
      console.log(`[scrape-jobs] jobsinfootball page ${page}: ${pageJobs.length} jobs`);
      if (pageJobs.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) break;
      } else {
        consecutiveEmpty = 0;
        all.push(...pageJobs);
      }
    } catch (err) {
      console.error(`[scrape-jobs] jobsinfootball page ${page} error:`, err);
      consecutiveEmpty++;
      if (consecutiveEmpty >= 2) break;
    }
  }

  const unique = dedupeJobs(all);
  console.log(`[scrape-jobs] jobsinfootball total unique: ${unique.length}`);
  return { success: unique.length > 0, jobs: unique };
}

async function scrapeBbcCareers(company: string, source: CareerSource): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // BBC careers site is rendered client-side via SuccessFactors, but the public
  // sitemap exposes every live job (typically 50–200 roles) with location + title in the URL.
  try {
    const resp = await fetch('https://careers.bbc.co.uk/sitemap.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' },
    });
    if (!resp.ok) {
      console.warn(`[scrape-jobs] BBC sitemap fetch failed: ${resp.status}`);
      return { success: false, jobs: [] };
    }
    const xml = await resp.text();
    const urls = Array.from(xml.matchAll(/<loc>(https:\/\/careers\.bbc\.co\.uk\/job\/[^<]+)<\/loc>/g)).map(m => m[1]);
    console.log(`[scrape-jobs] BBC sitemap: found ${urls.length} job URLs`);

    // Known multi-word locations seen in BBC sitemap
    const KNOWN_LOCATIONS = ['New York', 'Los Angeles', 'Hong Kong', 'Cape Town', 'Multiple Locations'];
    const industryKeywords: Record<string, string[]> = {
      journalism: ['journalist', 'reporter', 'correspondent', 'news editor', 'newsroom', 'investigations', 'bureau'],
      football: ['sport', 'football', 'match commentator', 'pundit'],
      music: [' music ', 'radio 1', 'radio 2', 'radio 6', 'composer'],
      cinema: ['producer', 'director', 'studio', 'drama', 'film', 'television', 'broadcast', 'media', 'creative', 'camera', 'sound engineer', 'post-production', 'commissioning'],
    };

    const jobs: NormalizedJob[] = [];
    for (const url of urls) {
      const path = url.replace('https://careers.bbc.co.uk/job/', '').replace(/\/$/, '');
      const [slugRaw] = path.split('/');
      if (!slugRaw) continue;
      const slug = decodeURIComponent(slugRaw).replace(/&amp;/g, '&').replace(/%2C/gi, ',');
      // Strip trailing postcode / numeric code (e.g. -W1A-1AA, -10036, -BS1-6BX, -0, -EH8-8DF)
      const cleaned = slug.replace(/-([A-Z]{1,2}\d[A-Z\d]?(-\d[A-Z]{2,3})?|\d{3,6}|0)$/i, '');
      const dashed = cleaned.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      if (!dashed) continue;

      let location: string | null = null;
      let title = dashed;
      const known = KNOWN_LOCATIONS.find(loc => dashed.toLowerCase().startsWith(loc.toLowerCase() + ' '));
      if (known) {
        location = known;
        title = dashed.slice(known.length).trim();
      } else {
        const parts = dashed.split(' ');
        location = parts[0] || null;
        title = parts.slice(1).join(' ').trim();
      }
      if (!title) continue;

      const lower = ` ${title.toLowerCase()} `;
      let inferredIndustry = source.industry;
      for (const [ind, kws] of Object.entries(industryKeywords)) {
        if (kws.some(kw => lower.includes(kw))) {
          inferredIndustry = ind;
          break;
        }
      }

      jobs.push({
        title,
        company,
        location,
        salary: null,
        description: null,
        url,
        tags: [],
        industry: inferredIndustry,
        type: 'Full-time',
        work_mode: 'On-site',
        featured: false,
        source_url: 'https://careers.bbc.co.uk',
        value_chain_stage: null,
        role_category: null,
      });
    }

    const unique = dedupeJobs(jobs);
    console.log(`[scrape-jobs] BBC: extracted ${unique.length} unique jobs`);
    return { success: unique.length > 0, jobs: unique };
  } catch (err) {
    console.error('[scrape-jobs] BBC scrape error:', err);
    return { success: false, jobs: [] };
  }
}

async function scrapeHitmarker(company: string, source: CareerSource): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // Hitmarker is the largest dedicated games-industry job board (~6k live roles).
  // The sitemap exposes every URL; UK-relevant roles are filtered post-fetch by
  // parsing the country out of the URL slug. We cap at the most-recent 400 URLs
  // (sitemap is sorted by lastmod desc) to keep the scrape under the 45s budget.
  try {
    const sitemap = await fetch('https://hitmarker.net/sitemap-jobs.xml/p1', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' },
    });
    if (!sitemap.ok) {
      console.warn(`[scrape-jobs] Hitmarker sitemap fetch failed: ${sitemap.status}`);
      return { success: false, jobs: [] };
    }
    const xml = await sitemap.text();
    const urls = Array.from(xml.matchAll(/<loc>(https:\/\/hitmarker\.net\/jobs\/[^<]+)<\/loc>/g))
      .map(m => m[1])
      .slice(0, 400);
    console.log(`[scrape-jobs] Hitmarker sitemap: processing ${urls.length} job URLs`);

    const jobs: NormalizedJob[] = [];
    // Parse detail pages in batches of 10 for JSON-LD (gives us title, company, location, country)
    for (let i = 0; i < urls.length; i += 10) {
      const batch = urls.slice(i, i + 10);
      const results = await Promise.all(batch.map(async (url) => {
        try {
          const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' } });
          if (!resp.ok) return null;
          const html = await resp.text();
          const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
          if (!ldMatch) return null;
          let ld: any;
          try { ld = JSON.parse(ldMatch[1]); } catch { return null; }
          if (ld['@type'] !== 'JobPosting') return null;
          const title = ld.title || '';
          const orgName = ld.hiringOrganization?.name || '';
          const locs = Array.isArray(ld.jobLocation) ? ld.jobLocation : (ld.jobLocation ? [ld.jobLocation] : []);
          const ukLoc = locs.find((l: any) => {
            const c = l?.address?.addressCountry || '';
            return /united kingdom|uk|england|scotland|wales|northern ireland|gb/i.test(c);
          });
          if (!ukLoc) return null; // UK-only filter
          const city = ukLoc.address?.addressLocality || ukLoc.address?.addressRegion || 'United Kingdom';
          const remote = ld.jobLocationType === 'TELECOMMUTE' ? 'Remote' : 'On-site';
          if (!title || !orgName) return null;
          return {
            title,
            company: orgName,
            location: city,
            salary: null,
            description: ld.description ? String(ld.description).replace(/<[^>]+>/g, ' ').trim().slice(0, 1500) : null,
            url,
            tags: [],
            industry: 'gaming',
            type: ld.employmentType === 'PART_TIME' ? 'Part-time' : ld.employmentType === 'CONTRACTOR' ? 'Freelance' : 'Full-time',
            work_mode: remote,
            featured: false,
            source_url: 'https://hitmarker.net',
            value_chain_stage: null,
            role_category: null,
          } as NormalizedJob;
        } catch {
          return null;
        }
      }));
      jobs.push(...results.filter((j): j is NormalizedJob => j !== null));
    }

    const unique = dedupeJobs(jobs);
    console.log(`[scrape-jobs] Hitmarker: extracted ${unique.length} UK gaming jobs`);
    return { success: unique.length > 0, jobs: unique };
  } catch (err) {
    console.error('[scrape-jobs] Hitmarker scrape error:', err);
    return { success: false, jobs: [] };
  }
}

async function scrapeGamesIndustry(company: string, source: CareerSource): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // GamesIndustry.biz is the trade body's job board. Sitemap exposes every live job
  // with a /job/ slug. Detail pages embed JSON-LD (JobPosting) with country, location,
  // org name, and full description. We filter to UK only post-fetch.
  try {
    const sitemap = await fetch('https://jobs.gamesindustry.biz/sitemap.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' },
    });
    if (!sitemap.ok) {
      console.warn(`[scrape-jobs] GamesIndustry sitemap fetch failed: ${sitemap.status}`);
      return { success: false, jobs: [] };
    }
    const xml = await sitemap.text();
    const urls = Array.from(xml.matchAll(/<loc>(https:\/\/jobs\.gamesindustry\.biz\/job\/[^<]+)<\/loc>/g))
      .map(m => m[1])
      .slice(0, 300);
    console.log(`[scrape-jobs] GamesIndustry sitemap: processing ${urls.length} job URLs`);

    const jobs: NormalizedJob[] = [];
    for (let i = 0; i < urls.length; i += 10) {
      const batch = urls.slice(i, i + 10);
      const results = await Promise.all(batch.map(async (url) => {
        try {
          const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' } });
          if (!resp.ok) return null;
          const html = await resp.text();
          // Find the JobPosting JSON-LD block specifically
          const blocks = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g));
          let posting: any = null;
          for (const b of blocks) {
            try {
              const parsed = JSON.parse(b[1]);
              if (parsed['@type'] === 'JobPosting') { posting = parsed; break; }
            } catch { /* ignore */ }
          }
          if (!posting) return null;
          const title = posting.title || '';
          const orgName = posting.hiringOrganization?.name || '';
          const locs = Array.isArray(posting.jobLocation) ? posting.jobLocation : (posting.jobLocation ? [posting.jobLocation] : []);
          const ukLoc = locs.find((l: any) => {
            const c = l?.address?.addressCountry || '';
            return /^(united kingdom|uk|england|scotland|wales|northern ireland|gb)$/i.test(String(c).trim());
          });
          if (!ukLoc) return null;
          const city = ukLoc.address?.addressLocality || ukLoc.address?.addressRegion || 'United Kingdom';
          if (!title || !orgName) return null;
          return {
            title,
            company: orgName,
            location: city,
            salary: null,
            description: posting.description ? String(posting.description).replace(/<[^>]+>/g, ' ').trim().slice(0, 1500) : null,
            url,
            tags: [],
            industry: 'gaming',
            type: Array.isArray(posting.employmentType) && posting.employmentType[0] === 'PART_TIME' ? 'Part-time'
                 : Array.isArray(posting.employmentType) && posting.employmentType[0] === 'CONTRACTOR' ? 'Freelance'
                 : 'Full-time',
            work_mode: 'On-site',
            featured: false,
            source_url: 'https://jobs.gamesindustry.biz',
            value_chain_stage: null,
            role_category: null,
          } as NormalizedJob;
        } catch {
          return null;
        }
      }));
      jobs.push(...results.filter((j): j is NormalizedJob => j !== null));
    }

    const unique = dedupeJobs(jobs);
    console.log(`[scrape-jobs] GamesIndustry.biz: extracted ${unique.length} UK gaming jobs`);
    return { success: unique.length > 0, jobs: unique };
  } catch (err) {
    console.error('[scrape-jobs] GamesIndustry scrape error:', err);
    return { success: false, jobs: [] };
  }
}

async function scrapeHoldTheFrontPage(company: string, source: CareerSource): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // Hold the Front Page exposes every active journalism job via a clean RSS feed.
  // Each <item> includes title, link, location, employer, and a CDATA description.
  try {
    const resp = await fetch('https://www.holdthefrontpage.co.uk/jobsboard/rss/?filter=active', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' },
    });
    if (!resp.ok) {
      console.warn(`[scrape-jobs] HoldTheFrontPage RSS fetch failed: ${resp.status}`);
      return { success: false, jobs: [] };
    }
    const xml = await resp.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).map(m => m[1]);
    const jobs: NormalizedJob[] = [];
    for (const item of items) {
      const titleMatch = item.match(/<title>([^<]+)<\/title>/);
      const linkMatch = item.match(/<link>([^<]+)<\/link>/);
      const locMatch = item.match(/<location>([^<]+)<\/location>/);
      const employerMatch = item.match(/<employer>([^<]+)<\/employer>/);
      const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
      const title = titleMatch?.[1]?.trim();
      const url = linkMatch?.[1]?.trim();
      if (!title || !url) continue;
      const location = locMatch?.[1]?.trim() || 'United Kingdom';
      const orgName = employerMatch?.[1]?.trim() || 'Hold the Front Page';
      const description = descMatch?.[1]?.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').trim() || null;
      jobs.push({
        title,
        company: orgName,
        location,
        salary: null,
        description,
        url,
        tags: [],
        industry: 'journalism',
        type: 'Full-time',
        work_mode: 'On-site',
        featured: false,
        source_url: 'https://www.holdthefrontpage.co.uk/jobsboard',
        value_chain_stage: null,
        role_category: null,
      });
    }
    const unique = dedupeJobs(jobs);
    console.log(`[scrape-jobs] HoldTheFrontPage: extracted ${unique.length} UK journalism jobs`);
    return { success: unique.length > 0, jobs: unique };
  } catch (err) {
    console.error('[scrape-jobs] HoldTheFrontPage scrape error:', err);
    return { success: false, jobs: [] };
  }
}

async function scrapeMusicWeek(company: string, source: CareerSource): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // MusicWeek's /jobs page lists current music-industry vacancies as /jobs/read/<slug>/<id> links.
  // Detail pages contain a clean h1 (title), location, and salary. Listings are UK-focused by default.
  try {
    const listResp = await fetch('https://www.musicweek.com/jobs', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' },
    });
    if (!listResp.ok) {
      console.warn(`[scrape-jobs] MusicWeek list fetch failed: ${listResp.status}`);
      return { success: false, jobs: [] };
    }
    const listHtml = await listResp.text();
    const slugs = Array.from(new Set(
      Array.from(listHtml.matchAll(/href="(\/jobs\/read\/[^"]+)"/g)).map(m => m[1])
    )).slice(0, 60);
    console.log(`[scrape-jobs] MusicWeek: processing ${slugs.length} job URLs`);

    const jobs: NormalizedJob[] = [];
    for (let i = 0; i < slugs.length; i += 8) {
      const batch = slugs.slice(i, i + 8);
      const results = await Promise.all(batch.map(async (slug) => {
        const url = `https://www.musicweek.com${slug}`;
        try {
          const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' } });
          if (!r.ok) return null;
          const h = await r.text();
          const titleMatch = h.match(/<h1[^>]*class="section-heading"[^>]*>([^<]+)<\/h1>/);
          const title = titleMatch?.[1]?.trim();
          if (!title) return null;
          // Company / employer is shown in the page header subtitle
          const companyMatch = h.match(/class="job_company"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i)
            || h.match(/jobspotlightcompany_headline[^>]*>\s*([^<]+)</i)
            || h.match(/class="company_name"[^>]*>([^<]+)</i);
          const orgName = companyMatch?.[1]?.trim() || 'MusicWeek';
          const locMatch = h.match(/location_healine[^>]*>([^<]+)</);
          const location = locMatch?.[1]?.trim().replace(/\s+/g, ' ') || 'United Kingdom';
          const salMatch = h.match(/jobspotlightsalary_headline[^>]*>([^<]+)</);
          const salary = salMatch?.[1]?.trim().replace(/\s+/g, ' ') || null;
          return {
            title,
            company: orgName,
            location,
            salary,
            description: null,
            url,
            tags: [],
            industry: 'music',
            type: 'Full-time',
            work_mode: 'On-site',
            featured: false,
            source_url: 'https://www.musicweek.com/jobs',
            value_chain_stage: null,
            role_category: null,
          } as NormalizedJob;
        } catch {
          return null;
        }
      }));
      jobs.push(...results.filter((j): j is NormalizedJob => j !== null));
    }
    const unique = dedupeJobs(jobs);
    console.log(`[scrape-jobs] MusicWeek: extracted ${unique.length} UK music jobs`);
    return { success: unique.length > 0, jobs: unique };
  } catch (err) {
    console.error('[scrape-jobs] MusicWeek scrape error:', err);
    return { success: false, jobs: [] };
  }
}

async function scrapeCompanyJobs(company: string, source: CareerSource, apiKey: string): Promise<{ success: boolean; jobs: NormalizedJob[] }> {
  // High-volume sources use a dedicated paginated scraper.
  if (source.url.startsWith('https://jobsinfootball.com')) {
    return scrapeJobsInFootball(company, source, apiKey);
  }
  // BBC: use the sitemap-based scraper (one source feeds cinema/journalism/football/music).
  if (company === 'BBC' || company === 'BBC News' || company === 'BBC Sport') {
    return scrapeBbcCareers(company, source);
  }
  // Hitmarker: dedicated games-industry job board with 6k+ roles.
  if (company === 'Hitmarker') {
    return scrapeHitmarker(company, source);
  }
  // GamesIndustry.biz: trade body's UK gaming job board (sitemap + JSON-LD).
  if (company === 'GamesIndustry.biz') {
    return scrapeGamesIndustry(company, source);
  }
  // Hold the Front Page: UK journalism RSS feed.
  if (company === 'Hold the Front Page') {
    return scrapeHoldTheFrontPage(company, source);
  }
  // MusicWeek: UK music industry trade board.
  if (company === 'MusicWeek') {
    return scrapeMusicWeek(company, source);
  }
  try {
    // Ocado Logistics is a Webflow CMS - request `links` alongside markdown so we
    // can pair the 39+ cards (rendered client-side, no inline apply links once
    // `onlyMainContent` strips them) to their Oracle HCM apply URLs by position.
    const isOcadoLogistics = company === 'Ocado Logistics';
    // Ocado Retail's open-roles page is a single pipe-table - request markdown only
    // (json extraction would just summarise the table; we parse rows ourselves below).
    const isOcadoRetail = company === 'Ocado Retail';
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: source.url,
        formats: isOcadoLogistics
          ? ['markdown', 'links']
          : isOcadoRetail
            ? ['markdown']
            : ['markdown', { type: 'json', prompt: STRUCTURED_JOB_EXTRACTION_PROMPT }],
        onlyMainContent: true,
        waitFor: isOcadoLogistics ? 6000 : isOcadoRetail ? 4000 : 3000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text().catch(() => 'Unknown Firecrawl scrape error');
      console.error(`[scrape-jobs] Firecrawl scrape failed for ${company}: ${scrapeResponse.status} ${errorText}`);
      return { success: false, jobs: [] };
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData?.data?.markdown ?? scrapeData?.markdown ?? '';
    const structuredPayload = scrapeData?.data?.json ?? scrapeData?.json ?? null;
    const scrapedLinks: string[] = scrapeData?.data?.links ?? scrapeData?.links ?? [];

    // Ocado Retail: use the dedicated table parser ONLY (skip generic extractors so we
    // don't pollute descriptions with the listing-page markdown).
    if (isOcadoRetail) {
      const retailJobs = extractOcadoRetailJobsFromMarkdown(markdown, company, source);
      console.log(`[scrape-jobs] Ocado Retail: extracted ${retailJobs.length} jobs from table`);
      return { success: retailJobs.length > 0, jobs: retailJobs };
    }

    let jobs = dedupeJobs([
      ...extractJobsFromStructuredPayload(structuredPayload, company, source, markdown, source.url),
      ...extractJobsFromMarkdown(markdown, company, source, source.url),
      ...(company === 'Netflix' ? extractNetflixJobsFromMarkdown(markdown, company, source) : []),
      ...(company === 'ASOS' ? extractAsosJobsFromMarkdown(markdown, company, source) : []),
      ...(company === 'Greggs' ? extractGreggsJobsFromMarkdown(markdown, company, source) : []),
      ...(company === 'Paul UK' ? extractPaulUkJobsFromMarkdown(markdown, company, source) : []),
      ...(isOcadoLogistics ? extractOcadoLogisticsJobsFromMarkdown(markdown, company, source, scrapedLinks) : []),
    ]);

    if (['ASOS', 'Greggs', 'Paul UK', 'Ocado Logistics'].includes(company) && jobs.length > 0) {
      console.log(`[scrape-jobs] ${company}: extracted ${jobs.length} jobs from ${source.url}`);
      return { success: true, jobs };
    }

    if (jobs.length < 5) {
      const hostname = getSourceHostname(source.url);

      if (hostname) {
        try {
          const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: `https://${hostname}`,
              search: 'jobs roles vacancies apply',
              limit: 200,
              includeSubdomains: true,
            }),
          });

          if (mapResponse.ok) {
            const mapData = await mapResponse.json();
            const allLinks: string[] = mapData?.links || mapData?.data?.links || [];
            const jobLinks = [...new Set(
              allLinks
                .map((link: string) => normalizeText(link))
                .filter((link: string) => !isSamePageUrl(link, source.url) && looksLikeJobUrl(link, source.url) && isSameHostOrSubdomain(link, source.url))
            )].slice(0, 30);

            if (jobLinks.length > 0) {
              console.log(`[scrape-jobs] ${company}: map found ${jobLinks.length} candidate job URLs`);
              const mapJobs: NormalizedJob[] = [];
              const scrapeBatch = jobLinks.slice(0, 15);

              for (let i = 0; i < scrapeBatch.length; i += 5) {
                const batch = scrapeBatch.slice(i, i + 5);
                const batchResults = await Promise.all(batch.map(async (jobUrl: string) => {
                  try {
                    const jobPageResp = await fetch('https://api.firecrawl.dev/v2/scrape', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        url: jobUrl,
                        formats: [
                          'markdown',
                          { type: 'json', prompt: STRUCTURED_JOB_EXTRACTION_PROMPT },
                        ],
                        onlyMainContent: true,
                        waitFor: 1500,
                      }),
                    });

                    if (!jobPageResp.ok) {
                      await jobPageResp.text();
                      return [];
                    }

                    const jobPageData = await jobPageResp.json();
                    const pageMarkdown = jobPageData?.data?.markdown ?? jobPageData?.markdown ?? '';
                    const structuredPageJobs = extractJobsFromStructuredPayload(
                      jobPageData?.data?.json ?? jobPageData?.json ?? null,
                      company,
                      source,
                      pageMarkdown.slice(0, 1200),
                      jobUrl,
                    );

                    if (structuredPageJobs.length > 0) {
                      return structuredPageJobs;
                    }

                    const pageTitle = jobPageData?.data?.metadata?.title ?? '';
                    let jobTitle = pageTitle.replace(/\s*[-|–]\s*(careers?|deliveroo|jobs?).*/i, '').trim();
                    if (!jobTitle) {
                      const h1Match = pageMarkdown.match(/^#\s+(.+)/m);
                      if (h1Match) jobTitle = h1Match[1].trim();
                    }

                    if (!jobTitle || !isValidJobTitle(jobTitle)) return [];

                    const descMatch = pageMarkdown.match(/(?:^|\n)(?!#)([A-Z].{20,500})/);
                    const desc = descMatch ? descMatch[1].trim() : null;
                    const seededJob = createJobRecord(company, source, {
                      title: jobTitle,
                      url: jobUrl,
                      description: desc,
                    }, pageMarkdown.slice(0, 500), jobUrl);

                    return seededJob ? [seededJob] : [];
                  } catch {
                    return [];
                  }
                }));

                mapJobs.push(...batchResults.flat());
              }

              jobs = dedupeJobs([...jobs, ...mapJobs]);
            }
          } else {
            await mapResponse.text();
          }
        } catch (mapErr) {
          console.error(`[scrape-jobs] Map fallback failed for ${company}:`, mapErr);
        }

        if (jobs.length < 5) {
          const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `site:${hostname} (job OR jobs OR role OR roles OR vacancy OR vacancies OR hiring)`,
              limit: 10,
              scrapeOptions: {
                formats: ['markdown'],
              },
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const results = Array.isArray(searchData?.data) ? searchData.data : [];
            const fallbackJobs = results.flatMap((result: any) => {
              const resultUrl = toAbsoluteUrl(result?.url, source.url);
              if (looksLikeNonJobUrl(resultUrl, source.url)) return [];
              if (!isSameHostOrSubdomain(resultUrl, source.url)) return [];

              const seeded = looksLikeDetailedJobUrl(resultUrl, source.url)
                ? createJobRecord(company, source, {
                    title: result?.title,
                    url: resultUrl,
                    description: result?.description,
                  }, result?.description || '', resultUrl)
                : null;

              const markdownMatches = result?.markdown
                ? extractJobsFromMarkdown(result.markdown, company, source, resultUrl)
                : [];

              return seeded ? [seeded, ...markdownMatches] : markdownMatches;
            });

            jobs = dedupeJobs([...jobs, ...fallbackJobs]);
          } else {
            const errorText = await searchResponse.text().catch(() => 'Unknown Firecrawl search error');
            console.error(`[scrape-jobs] Firecrawl search fallback failed for ${company}: ${searchResponse.status} ${errorText}`);
          }
        }
      }
    }

    jobs = dedupeJobs(jobs);
    console.log(`[scrape-jobs] ${company}: extracted ${jobs.length} jobs from ${source.url}`);
    return { success: true, jobs };
  } catch (error) {
    console.error(`[scrape-jobs] Unexpected error scraping ${company}:`, error);
    return { success: false, jobs: [] };
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Backend credentials are missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { company, industry } = await req.json().catch(() => ({}));

    let targets = CAREER_SOURCES;

    if (industry) {
      targets = targets.filter((source) => source.industry.toLowerCase() === String(industry).toLowerCase());
    }

    if (company) {
      targets = targets.filter((source) => source.company.toLowerCase() === String(company).toLowerCase());
    }

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No matching company career pages found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalInserted = 0;
    let companiesProcessed = 0;
    let totalJobsFound = 0;

    // Process in small batches and don't let one slow source block the rest
    for (let i = 0; i < targets.length; i += 2) {
      const batch = targets.slice(i, i + 2);
      const batchResults = await Promise.allSettled(
        batch.map(async (source) => ({
          source,
          ...(await withTimeout(scrapeCompanyJobs(source.company, source, apiKey), 45000, source.company)),
        }))
      );

      for (const settledResult of batchResults) {
        if (settledResult.status !== 'fulfilled') {
          console.error('[scrape-jobs] Source batch item failed:', settledResult.reason);
          continue;
        }

        const result = settledResult.value;
        if (!result.success || result.jobs.length === 0) continue;

        const rawJobs = dedupeJobs(result.jobs);
        const jobs = rawJobs.filter(isLikelyUkJob);
        if (jobs.length < rawJobs.length) {
          console.log(`[scrape-jobs] ${result.source.company}: filtered ${rawJobs.length - jobs.length} non-UK jobs`);
        }
        totalJobsFound += jobs.length;
        companiesProcessed++;

        // Delete old jobs for this company, then insert new ones
        const { error: deleteError } = await supabase
          .from('jobs')
          .delete()
          .eq('company', result.source.company);

        if (deleteError) {
          console.error(`[scrape-jobs] Failed to clear old jobs for ${result.source.company}:`, deleteError);
          continue;
        }

        for (const insertBatch of chunk(jobs, 50)) {
          if (insertBatch.length === 0) continue;
          const { error: insertError, data: insertedRows } = await supabase
            .from('jobs')
            .upsert(insertBatch, { onConflict: 'url', ignoreDuplicates: true })
            .select('id');

          if (insertError) {
            console.error(`[scrape-jobs] Insert error for ${result.source.company}:`, insertError);
            break;
          }
          totalInserted += insertedRows?.length ?? 0;
        }

        console.log(`[scrape-jobs] ${result.source.company}: saved ${jobs.length} jobs to database`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sources_attempted: targets.length,
        companies_processed: companiesProcessed,
        jobs_found: totalJobsFound,
        inserted: totalInserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape jobs';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});