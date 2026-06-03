// External destination for "Most Wanted" chips and any other quick-link surface.
// Mirrors the URLs surfaced on each industry's "Who" page card so behaviour is
// consistent: prefer the company's careers site, fall back to its main website.
//
// Keys are matched case-insensitively against the company name stored in a
// user's job_preferences.targetCompanies array.

interface CompanyExternal {
  careers?: string;
  website?: string;
}

const COMPANY_EXTERNAL: Record<string, CompanyExternal> = {
  // Grocery
  "ocado": { careers: "https://careers.ocadogroup.com/", website: "https://www.ocadogroup.com/" },
  "ocado group": { careers: "https://careers.ocadogroup.com/", website: "https://www.ocadogroup.com/" },
  "ocado retail": { careers: "https://careers.ocadoretail.com/", website: "https://www.ocadoretail.com/" },
  "ocado logistics": { careers: "https://www.ocado-logistics.com/job-listing", website: "https://www.ocado-logistics.com/" },
  "tesco": { careers: "https://www.tesco-careers.com", website: "https://www.tesco.com" },
  "sainsbury's": { careers: "https://sainsburys.jobs", website: "https://www.sainsburys.co.uk" },
  "sainsburys": { careers: "https://sainsburys.jobs", website: "https://www.sainsburys.co.uk" },
  "m&s food": { careers: "https://jobs.marksandspencer.com/our-teams/food", website: "https://www.marksandspencer.com" },
  "marks & spencer": { careers: "https://jobs.marksandspencer.com/our-teams/food", website: "https://www.marksandspencer.com" },
  "aldi": { careers: "https://www.aldirecruitment.co.uk", website: "https://www.aldi.co.uk" },
  "lidl": { careers: "https://careers.lidl.co.uk/", website: "https://www.lidl.co.uk" },
  "waitrose": { careers: "https://www.jlpjobs.com/", website: "https://www.waitrose.com" },
  "morrisons": { careers: "https://jobs.morrisons.com/", website: "https://www.morrisons.com" },
  "asda": { careers: "https://www.asda.jobs/", website: "https://www.asda.com" },
  "co-op": { careers: "https://jobs.coop.co.uk/", website: "https://www.coop.co.uk" },
  "deliveroo": { careers: "https://careers.deliveroo.co.uk/", website: "https://deliveroo.co.uk" },

  // Music
  "spotify": { careers: "https://www.lifeatspotify.com", website: "https://www.spotify.com" },
  "apple music": { careers: "https://www.apple.com/careers/uk/", website: "https://www.apple.com/apple-music/" },
  "youtube music": { careers: "https://careers.google.com/", website: "https://music.youtube.com" },
  "universal music": { careers: "https://www.universalmusic.com/careers/", website: "https://www.universalmusic.com" },
  "sony music": { careers: "https://www.sonymusic.com/careers/", website: "https://www.sonymusic.com" },
  "warner music": { careers: "https://www.wmg.com/careers/", website: "https://www.wmg.com" },
  "abbey road studios": { careers: "https://www.umusiccareers.com/jobs/abbeyroad", website: "https://www.abbeyroad.com" },
  "secretly group": { website: "https://secretlygroup.com" },
  "broadwick": { careers: "https://broadwick.com/careers/", website: "https://broadwick.com" },
  "dice": { careers: "https://dice.fm/careers", website: "https://dice.fm" },
  "dice fm": { careers: "https://dice.fm/careers", website: "https://dice.fm" },

  // Fashion
  "asos": { careers: "https://www.asoscareers.com/", website: "https://www.asos.com" },
  "burberry": { careers: "https://www.burberrycareers.com/", website: "https://www.burberry.com" },
  "me+em": { careers: "https://www.meandem.com/careers", website: "https://www.meandem.com" },
  "me&em": { careers: "https://www.meandem.com/careers", website: "https://www.meandem.com" },
  "nike": { careers: "https://jobs.nike.com/", website: "https://www.nike.com" },
  "adidas": { careers: "https://careers.adidas-group.com/", website: "https://www.adidas.co.uk" },

  // Footwear
  "dr martens": { careers: "https://careers.drmartens.com/", website: "https://www.drmartens.com" },
  "dr. martens": { careers: "https://careers.drmartens.com/", website: "https://www.drmartens.com" },
  "birkenstock": { careers: "https://group.birkenstock.com/en/careers/", website: "https://www.birkenstock.com" },
  "timberland": { careers: "https://jobs.vfc.com/", website: "https://www.timberland.co.uk" },
  "ugg": { careers: "https://www.deckers.com/careers", website: "https://www.ugg.com" },

  // Bakery / Coffee / Hospitality
  "gail's": { careers: "https://gailsbread.co.uk/careers/", website: "https://gailsbread.co.uk" },
  "gails": { careers: "https://gailsbread.co.uk/careers/", website: "https://gailsbread.co.uk" },
  "greggs": { careers: "https://corporate.greggs.co.uk/careers", website: "https://www.greggs.co.uk" },
  "costa": { careers: "https://www.costa.co.uk/careers", website: "https://www.costa.co.uk" },
  "costa coffee": { careers: "https://www.costa.co.uk/careers", website: "https://www.costa.co.uk" },
  "starbucks": { careers: "https://www.starbucks.co.uk/careers", website: "https://www.starbucks.co.uk" },
  "caffè nero": { careers: "https://caffenero.com/uk/careers/", website: "https://caffenero.com/uk/" },
  "caffe nero": { careers: "https://caffenero.com/uk/careers/", website: "https://caffenero.com/uk/" },
  "blank street": { careers: "https://www.blankstreet.com/careers", website: "https://www.blankstreet.com" },
  "blank street coffee": { careers: "https://www.blankstreet.com/careers", website: "https://www.blankstreet.com" },
  "grind": { careers: "https://grind.co.uk/pages/careers", website: "https://grind.co.uk" },
  "five guys": { careers: "https://careers.fiveguys.co.uk/", website: "https://www.fiveguys.co.uk" },
  "soho house": { careers: "https://www.sohohouse.com/careers", website: "https://www.sohohouse.com" },
  "hawkstone": { website: "https://hawkstone.co/" },
  "pret": { careers: "https://careers.pret.co.uk/", website: "https://www.pret.co.uk" },
  "pret a manger": { careers: "https://careers.pret.co.uk/", website: "https://www.pret.co.uk" },
  "pret a manger uk": { careers: "https://careers.pret.co.uk/", website: "https://www.pret.co.uk" },
  "leon": { careers: "https://leon.co/jobs/", website: "https://leon.co" },
  "leon restaurants": { careers: "https://leon.co/jobs/", website: "https://leon.co" },
  "paul": { careers: "https://www.paul-uk.com/careers", website: "https://www.paul-uk.com" },
  "paul uk": { careers: "https://www.paul-uk.com/careers", website: "https://www.paul-uk.com" },
  "wagamama": { careers: "https://careers.wagamama.com/", website: "https://www.wagamama.com" },
  "nando's": { careers: "https://careers.nandos.co.uk/", website: "https://www.nandos.co.uk" },
  "nandos": { careers: "https://careers.nandos.co.uk/", website: "https://www.nandos.co.uk" },
  "mcdonald's": { careers: "https://people.mcdonalds.co.uk/opportunities/restaurant/crew-member?places_position=51.51437%2C-0.09229&places_query=London%2C%20Greater%20London%2C%20England&country%5B0%5D=United%20Kingdom", website: "https://www.mcdonalds.com/gb/en-gb.html" },
  "mcdonalds": { careers: "https://people.mcdonalds.co.uk/opportunities/restaurant/crew-member?places_position=51.51437%2C-0.09229&places_query=London%2C%20Greater%20London%2C%20England&country%5B0%5D=United%20Kingdom", website: "https://www.mcdonalds.com/gb/en-gb.html" },
  "mcdonald": { careers: "https://people.mcdonalds.co.uk/opportunities/restaurant/crew-member?places_position=51.51437%2C-0.09229&places_query=London%2C%20Greater%20London%2C%20England&country%5B0%5D=United%20Kingdom", website: "https://www.mcdonalds.com/gb/en-gb.html" },

  // Cinema / Media
  "netflix": { careers: "https://jobs.netflix.com/", website: "https://www.netflix.com" },
  "everyman": { careers: "https://www.everymancinema.com/careers", website: "https://www.everymancinema.com" },
  "everyman cinema": { careers: "https://www.everymancinema.com/careers", website: "https://www.everymancinema.com" },
  "news uk": { careers: "https://www.newscareers.co.uk/", website: "https://www.news.co.uk" },

  // Estate agency
  "savills": { careers: "https://www.savills.co.uk/careers/", website: "https://www.savills.co.uk" },
  "rightmove": { careers: "https://www.rightmove.co.uk/careers.html", website: "https://www.rightmove.co.uk" },
  "purplebricks": { careers: "https://www.purplebricks.co.uk/careers", website: "https://www.purplebricks.co.uk" },

  // Football
  "premier league": { careers: "https://www.premierleague.com/careers", website: "https://www.premierleague.com" },
  "the premier league": { careers: "https://www.premierleague.com/careers", website: "https://www.premierleague.com" },
  "sky sports": { careers: "https://careers.sky.com/", website: "https://www.skysports.com" },

  // Charity / Education
  "save the children": { careers: "https://www.savethechildren.org.uk/about-us/jobs", website: "https://www.savethechildren.org.uk" },
  "teach first": { careers: "https://www.teachfirst.org.uk/work-for-us", website: "https://www.teachfirst.org.uk" },

  // Jewellery / Interiors
  "pragnell": { careers: "https://www.pragnell.co.uk/careers", website: "https://www.pragnell.co.uk" },
  "tom dixon": { careers: "https://www.tomdixon.net/en_gb/careers", website: "https://www.tomdixon.net" },
  "tom dixon studio": { careers: "https://www.tomdixon.net/en_gb/careers", website: "https://www.tomdixon.net" },
};

function lookup(company: string): CompanyExternal | null {
  const key = company.trim().toLowerCase();
  if (!key) return null;
  return COMPANY_EXTERNAL[key] ?? null;
}

/**
 * Returns the best external destination for a company chip - careers site
 * if known, otherwise the main website. Returns null if neither is mapped.
 */
export function getCompanyExternalUrl(company: string | null | undefined): string | null {
  if (!company) return null;
  const entry = lookup(company);
  if (!entry) return null;
  return entry.careers || entry.website || null;
}
