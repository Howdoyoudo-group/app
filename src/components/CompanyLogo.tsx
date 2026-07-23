import { useMemo, useState } from "react";
import sohoHouseLogo from "@/assets/logos/soho-house.jpeg";
import mclarenLogo from "@/assets/mclaren-logo.jpeg";
import caffeNeroLogo from "@/assets/logos/caffe-nero.png";
import { useEmployerLogoMap } from "@/hooks/useEmployerLogoMap";

/**
 * Local asset overrides - used when a brand's CDN logo is poor quality
 * or unavailable. Keyed by lowercased company name (matched the same way
 * as CURATED_DOMAINS via findCuratedLogoAsset below).
 */
const CURATED_LOGO_ASSETS: Record<string, string> = {
  "soho house": sohoHouseLogo,
  "soho house design": sohoHouseLogo,
  "soho house & co": sohoHouseLogo,
  "soho house and co": sohoHouseLogo,
  "mclaren racing": mclarenLogo,
  "mclaren": mclarenLogo,
  "caffè nero": caffeNeroLogo,
  "caffe nero": caffeNeroLogo,
};

/**
 * Curated map of company name → domain to use for the logo CDN.
 * Add hero brands here so we always get a clean, predictable result.
 * Anything not in the map falls back to a heuristic Clearbit lookup,
 * then to a coloured initials avatar.
 */
const CURATED_DOMAINS: Record<string, string> = {
  // ── Fashion ──────────────────────────────────────────────
  "adidas": "adidas.com",
  "nike": "nike.com",
  "asos": "asos.com",
  "burberry": "burberry.com",
  "me+em": "meandem.com",
  "me em": "meandem.com",
  "uniqlo": "uniqlo.com",
  "zara": "zara.com",
  "h&m": "hm.com",
  "cos": "cos.com",
  "monsoon": "monsoon.co.uk",
  "boohoo": "boohoo.com",
  "boohoo group": "boohoo.com",
  "primark": "primark.com",
  "next": "next.co.uk",
  "marks & spencer": "marksandspencer.com",
  "m&s": "marksandspencer.com",
  "river island": "riverisland.com",
  "selfridges": "selfridges.com",
  "harrods": "harrods.com",
  "harvey nichols": "harveynichols.com",
  "liberty": "libertylondon.com",
  "farfetch": "farfetch.com",
  "depop": "depop.com",
  "vinted": "vinted.com",
  "ganni": "ganni.com",
  "stella mccartney": "stellamccartney.com",
  "alexander mcqueen": "alexandermcqueen.com",
  "mulberry": "mulberry.com",
  "barbour": "barbour.com",
  "ted baker": "tedbaker.com",
  "paul smith": "paulsmith.com",
  "reiss": "reiss.com",
  "whistles": "whistles.com",
  "jigsaw": "jigsaw-online.com",
  "anthropologie": "anthropologie.com",
  "urban outfitters": "urbanoutfitters.com",
  "free people": "freepeople.com",
  "joseph": "joseph-fashion.com",
  "the outnet": "theoutnet.com",
  "net-a-porter": "net-a-porter.com",
  "matchesfashion": "matchesfashion.com",
  "matches": "matchesfashion.com",
  "browns": "brownsfashion.com",
  "arket": "arket.com",
  "& other stories": "stories.com",
  "victoria beckham": "victoriabeckham.com",
  "reformation": "thereformation.com",
  "coats group": "coats.com",
  "brand machine group": "brandmachinegroup.com",

  // ── Footwear ─────────────────────────────────────────────
  "birkenstock": "birkenstock.com",
  "dr martens": "drmartens.com",
  "dr. martens": "drmartens.com",
  "ugg": "ugg.com",
  "timberland": "timberland.com",
  "new balance": "newbalance.com",
  "puma": "puma.com",
  "asics": "asics.com",
  "reebok": "reebok.com",
  "vans": "vans.com",
  "converse": "converse.com",
  "clarks": "clarks.com",
  "kurt geiger": "kurtgeiger.com",
  "schuh": "schuh.co.uk",
  "office": "office.co.uk",
  "jd sports": "jdsports.co.uk",
  "russell & bromley": "russellandbromley.co.uk",
  "loake": "loake.co.uk",
  "church's": "church-footwear.com",
  "hunter": "hunterboots.com",
  "crocs": "crocs.com",
  "on running": "on.com",
  "hoka": "hoka.com",
  "foot locker": "footlocker.co.uk",
  "footlocker": "footlocker.co.uk",

  // ── Coffee / hospitality / food ──────────────────────────
  "starbucks": "starbucks.com",
  "starbucks uk": "starbucks.co.uk",
  "costa": "costa.co.uk",
  "costa coffee": "costa.co.uk",
  "caffè nero": "caffenero.com",
  "caffe nero": "caffenero.com",
  "blank street": "blankstreet.com",
  "blank street coffee": "blankstreet.com",
  "gail's": "gailsbread.co.uk",
  "gails": "gailsbread.co.uk",
  "greggs": "greggs.co.uk",
  "five guys": "fiveguys.co.uk",
  "grind": "grind.co.uk",
  "pret": "pret.co.uk",
  "pret a manger": "pret.co.uk",
  "leon": "leon.co",
  "itsu": "itsu.com",
  "wagamama": "wagamama.com",
  "honest burgers": "honestburgers.co.uk",
  "shake shack": "shakeshack.com",
  "nando's": "nandos.co.uk",
  "nandos": "nandos.co.uk",
  "mcdonald's": "mcdonalds.com",
  "mcdonalds": "mcdonalds.com",
  "mcdonald": "mcdonalds.com",
  "domino's": "dominos.co.uk",
  "dominos": "dominos.co.uk",
  "burger king": "burgerking.co.uk",
  "subway": "subway.com",
  "deliveroo": "deliveroo.co.uk",
  "soho house": "sohohouse.com",
  "the ivy": "theivy.co.uk",
  "hawksmoor": "thehawksmoor.com",
  "dishoom": "dishoom.com",
  "ottolenghi": "ottolenghi.co.uk",
  "allpress espresso": "allpressespresso.com",

  // ── Beer / drinks ────────────────────────────────────────
  "hawkstone": "hawkstone.com",
  "hawkstone lager": "hawkstone.com",
  "hawkstone brewing": "hawkstone.com",
  "northern monk": "northernmonk.com",
  "brewdog": "brewdog.com",
  "beavertown brewery": "beavertownbrewery.com",
  "beavertown": "beavertownbrewery.com",
  "camden town brewery": "camdentownbrewery.com",
  "cloudwater brew co": "cloudwaterbrew.co",
  "cloudwater": "cloudwaterbrew.co",
  "heineken uk": "theheinekencompany.com",
  "heineken": "heineken.com",
  "molson coors uk": "molsoncoors.com",
  "molson coors": "molsoncoors.com",
  "ab inbev uk": "ab-inbev.com",
  "ab inbev": "ab-inbev.com",
  "fuller's": "fullers.co.uk",
  "fullers": "fullers.co.uk",
  "marston's": "marstons.co.uk",
  "marstons": "marstons.co.uk",
  "jd wetherspoon": "jdwetherspoon.com",
  "wetherspoon": "jdwetherspoon.com",
  "diageo (guinness)": "diageo.com",
  "diageo": "diageo.com",
  "guinness": "guinness.com",
  "toast ale": "toastale.com",

  // ── Cars / automotive ────────────────────────────────────
  "jaguar land rover": "jaguarlandrover.com",
  "jlr": "jaguarlandrover.com",
  "bentley motors": "bentleymotors.com",
  "bentley": "bentleymotors.com",
  "aston martin": "astonmartin.com",
  "nissan uk": "nissan.co.uk",
  "nissan": "nissan.co.uk",
  "bmw group uk": "bmwgroup.com",
  "bmw": "bmw.co.uk",
  "mini": "mini.co.uk",
  "rolls-royce": "rolls-roycemotorcars.com",
  "pendragon / stratstone": "stratstone.com",
  "stratstone": "stratstone.com",
  "pendragon": "pendragonplc.com",
  "evans halshaw": "evanshalshaw.com",
  "arnold clark": "arnoldclark.com",
  "octopus electric vehicles": "octopusev.com",
  "octopus ev": "octopusev.com",
  "halfords": "halfords.com",
  "aa (automobile association)": "theaa.com",
  "aa": "theaa.com",
  "rac": "rac.co.uk",
  "kwik fit": "kwik-fit.com",
  "sytner": "sytner.co.uk",
  "lookers": "lookers.co.uk",
  "listers": "listers.co.uk",
  "mercedes-benz": "mercedes-benz.co.uk",
  "mercedes": "mercedes-benz.co.uk",
  "ford": "ford.co.uk",
  "tesla": "tesla.com",
  "porsche": "porsche.com",
  "auto trader": "autotrader.co.uk",
  "autotrader": "autotrader.co.uk",
  "motorpoint": "motorpoint.co.uk",

  // ── Grocery / retail ─────────────────────────────────────
  "tesco": "tesco.com",
  "amazon": "amazon.com",
  "amazon uk": "amazon.co.uk",
  "amazon.com": "amazon.com",
  "amazon fresh": "amazon.com",
  "amazon web services": "aws.amazon.com",
  "aws": "aws.amazon.com",
  "ebay": "ebay.com",
  "ebay uk": "ebay.co.uk",
  "hellofresh": "hellofresh.com",
  "hello fresh": "hellofresh.com",
  "hellofresh uk": "hellofresh.co.uk",
  "ocado": "ocado.com",
  "ocado retail": "ocado.com",
  "ocado group": "ocadogroup.com",
  "sainsbury's": "sainsburys.co.uk",
  "sainsburys": "sainsburys.co.uk",
  "waitrose": "waitrose.com",
  "asda": "asda.com",
  "morrisons": "morrisons.com",
  "aldi": "aldi.co.uk",
  "lidl": "lidl.co.uk",
  "marks & spencer food": "marksandspencer.com",
  "m&s food": "marksandspencer.com",
  "co-op": "coop.co.uk",
  "iceland": "iceland.co.uk",
  "boots": "boots.com",
  "boots (no7 beauty)": "boots.com",
  "holland & barrett": "hollandandbarrett.com",
  "superdrug": "superdrug.com",

  // ── Property / estate agency ─────────────────────────────
  "savills": "savills.co.uk",
  "rightmove": "rightmove.co.uk",
  "purplebricks": "purplebricks.co.uk",
  "foxtons": "foxtons.co.uk",
  "knight frank": "knightfrank.co.uk",
  "zoopla": "zoopla.co.uk",
  "countrywide": "countrywide.co.uk",
  "connells": "connells.co.uk",
  "dexters": "dexters.co.uk",
  "hamptons": "hamptons.co.uk",
  "jll": "jll.co.uk",
  "cbre": "cbre.co.uk",
  "cushman & wakefield": "cushmanwakefield.com",
  "chestertons": "chestertons.com",
  "winkworth": "winkworth.co.uk",
  "kfh": "kfh.co.uk",
  "kinleigh folkard & hayward": "kfh.co.uk",
  "kfh (kinleigh folkard & hayward)": "kfh.co.uk",
  "marsh & parsons": "marshandparsons.co.uk",
  "marsh and parsons": "marshandparsons.co.uk",
  "john d wood": "johndwood.co.uk",
  "john d wood & co": "johndwood.co.uk",
  "andrews property group": "andrewsonline.co.uk",
  "andrews": "andrewsonline.co.uk",
  "strutt & parker": "struttandparker.com",
  "strutt and parker": "struttandparker.com",
  "carter jonas": "carterjonas.co.uk",
  "cluttons": "cluttons.com",
  "hunters": "hunters.com",
  "your move": "your-move.co.uk",
  "reeds rains": "reedsrains.co.uk",
  "openrent": "openrent.co.uk",
  "open rent": "openrent.co.uk",
  "goodlord": "goodlord.co",
  "spicerhaart": "spicerhaart.co.uk",
  "haart": "haart.co.uk",
  "leaders romans group": "lrg.co.uk",
  "leaders": "leaders.co.uk",
  "romans": "romans.co.uk",
  "belvoir": "belvoirgroup.com",
  "belvoir group": "belvoirgroup.com",
  "northwood": "northwooduk.com",
  "connells group": "connellsgroup.co.uk",

  // ── Media / entertainment ────────────────────────────────
  "netflix": "netflix.com",
  "nbcuniversal": "nbcuniversal.com",
  "nbc universal": "nbcuniversal.com",
  "nbc": "nbcuniversal.com",
  "universal studios": "nbcuniversal.com",
  "sky sports": "skysports.com",
  "sky": "sky.com",
  "bbc": "bbc.co.uk",
  "bbc news": "bbc.co.uk",
  "bbc sport": "bbc.co.uk",
  "bbc studios": "bbcstudios.com",
  "bbc careers": "bbc.co.uk",
  "itv": "itv.com",
  "channel 4": "channel4.com",
  "channel 4 news": "channel4.com",
  "news uk": "news.co.uk",
  "the times": "thetimes.co.uk",
  "the guardian": "theguardian.com",
  "financial times": "ft.com",
  "the telegraph": "telegraph.co.uk",
  "everyman": "everymancinema.com",
  "everyman cinema": "everymancinema.com",
  "dice": "dice.fm",
  "spotify": "spotify.com",
  "warner music": "wmg.com",
  "warner music group": "wmg.com",
  "sony music": "sonymusic.com",
  "sony music entertainment": "sonymusic.com",
  "sony music uk": "sonymusic.co.uk",
  "universal music": "universalmusic.com",
  "universal music group": "universalmusic.com",
  "umg": "universalmusic.com",
  "universal music uk": "umusic.co.uk",
  "bmg": "bmg.com",
  "abbey road studios": "abbeyroad.com",
  "a24": "a24films.com",
  "amazon mgm studios": "amazon.com",
  "amazon prime video": "amazon.com",
  "mubi": "mubi.com",
  "bfi": "bfi.org.uk",
  "curzon": "curzon.com",
  "tate": "tate.org.uk",
  "national theatre": "nationaltheatre.org.uk",
  "v&a": "vam.ac.uk",
  "live nation": "livenationentertainment.com",
  "broadwick": "broadwicklive.com",
  "fabric": "fabriclondon.com",
  "printworks": "printworkslondon.co.uk",
  "glastonbury": "glastonburyfestivals.co.uk",
  "associated newspapers (dmgt)": "dmgt.com",
  "bauer media (kiss, hits radio)": "bauermedia.co.uk",
  "bauer media": "bauermedia.co.uk",
  "getty images": "gettyimages.com",
  "vice media": "vice.com",
  "nme": "nme.com",
  "wgsn": "wgsn.com",
  "penguin random house": "penguinrandomhouse.co.uk",
  "banijay uk": "banijay.com",

  // ── Theatre ──────────────────────────────────────────────
  "royal shakespeare company": "rsc.org.uk",
  "rsc": "rsc.org.uk",
  "atg entertainment": "atgtickets.com",
  "atg": "atgtickets.com",
  "ambassador theatre group": "atgtickets.com",
  "lw theatres": "lwtheatres.co.uk",
  "delfont mackintosh theatres": "delfontmackintosh.co.uk",
  "delfont mackintosh": "delfontmackintosh.co.uk",
  "sonia friedman productions": "soniafriedman.com",
  "sonia friedman": "soniafriedman.com",
  "prg (production resource group)": "prg.com",
  "prg": "prg.com",
  "production resource group": "prg.com",
  "white light": "whitelight.ltd.uk",
  "glyndebourne": "glyndebourne.com",
  "royal exchange theatre": "royalexchange.co.uk",
  "rada (royal academy of dramatic art)": "rada.ac.uk",
  "rada": "rada.ac.uk",
  "royal academy of dramatic art": "rada.ac.uk",
  "royal opera house": "rbo.org.uk",
  "royal ballet and opera": "rbo.org.uk",
  "todaytix": "todaytix.com",
  "today tix": "todaytix.com",
  "todaytix group": "todaytixgroup.com",
  "see tickets": "seetickets.com",
  "lovetheatre": "lovetheatre.com",
  "love theatre": "lovetheatre.com",
  "london theatre direct": "londontheatredirect.com",
  "official london theatre": "officiallondontheatre.com",

  // ── Sport ────────────────────────────────────────────────
  "premier league": "premierleague.com",
  "the fa": "thefa.com",
  "england football": "englandfootball.com",
  "efl": "efl.com",
  "img": "img.com",
  "dazn": "dazn.com",
  "arsenal fc": "arsenal.com",
  "arsenal": "arsenal.com",
  "chelsea fc": "chelseafc.com",
  "chelsea": "chelseafc.com",
  "tottenham hotspur": "tottenhamhotspur.com",
  "tottenham": "tottenhamhotspur.com",
  "spurs": "tottenhamhotspur.com",
  "manchester city": "mancity.com",
  "man city": "mancity.com",
  "manchester united": "manutd.com",
  "man united": "manutd.com",
  "man utd": "manutd.com",
  "liverpool": "liverpoolfc.com",
  "liverpool fc": "liverpoolfc.com",
  "city football group": "cityfootballgroup.com",
  "leicester city fc": "lcfc.com",
  "leicester city": "lcfc.com",
  "leicester": "lcfc.com",
  "brighton & hove albion": "brightonandhovealbion.com",
  "brighton and hove albion": "brightonandhovealbion.com",
  "brighton": "brightonandhovealbion.com",
  "brighton fc": "brightonandhovealbion.com",
  "everton": "evertonfc.com",
  "everton fc": "evertonfc.com",
  "everton football club": "evertonfc.com",
  "fulham": "fulhamfc.com",
  "fulham fc": "fulhamfc.com",
  "fulham football club": "fulhamfc.com",
  "newcastle": "nufc.co.uk",
  "newcastle united": "nufc.co.uk",
  "newcastle united fc": "nufc.co.uk",
  "west ham": "whufc.com",
  "west ham united": "whufc.com",
  "west ham united fc": "whufc.com",
  "aston villa": "avfc.co.uk",
  "aston villa fc": "avfc.co.uk",
  "wolverhampton wanderers": "wolves.co.uk",
  "wolves": "wolves.co.uk",
  "wolves fc": "wolves.co.uk",
  "crystal palace": "cpfc.co.uk",
  "crystal palace fc": "cpfc.co.uk",
  "nottingham forest": "nottinghamforest.co.uk",
  "nottingham forest fc": "nottinghamforest.co.uk",
  "brentford": "brentfordfc.com",
  "brentford fc": "brentfordfc.com",
  "bournemouth": "afcb.co.uk",
  "afc bournemouth": "afcb.co.uk",
  "southampton": "southamptonfc.com",
  "southampton fc": "southamptonfc.com",
  "ipswich town": "itfc.co.uk",
  "ipswich": "itfc.co.uk",
  "leeds united": "leedsunited.com",
  "leeds": "leedsunited.com",
  "burnley": "burnleyfootballclub.com",
  "burnley fc": "burnleyfootballclub.com",
  "sheffield united": "sufc.co.uk",
  "sheffield wednesday": "swfc.co.uk",
  "sunderland": "safc.com",
  "sunderland afc": "safc.com",
  "norwich city": "canaries.co.uk",
  "watford": "watfordfc.com",
  "watford fc": "watfordfc.com",
  "stoke city": "stokecityfc.com",
  "middlesbrough": "mfc.co.uk",
  "preston north end": "pnefc.net",
  "cardiff city": "cardiffcityfc.co.uk",
  "swansea city": "swanseacity.com",
  "hull city": "hullcitytigers.com",
  "queens park rangers": "qpr.co.uk",
  "qpr": "qpr.co.uk",
  "millwall": "millwallfc.co.uk",
  "blackburn rovers": "rovers.co.uk",
  "bristol city": "bcfc.co.uk",
  "coventry city": "ccfc.co.uk",
  "derby county": "dcfc.co.uk",
  "portsmouth": "portsmouthfc.co.uk",
  "plymouth argyle": "pafc.co.uk",
  "wembley stadium": "wembleystadium.com",
  "british cycling": "britishcycling.org.uk",
  "uk athletics": "uka.org.uk",
  "swim england": "swimming.org",
  "lta": "lta.org.uk",
  "england cricket board": "ecb.co.uk",
  "premiership rugby": "premiershiprugby.com",
  "opta (stats perform)": "statsperform.com",
  "faceit": "faceit.com",

  // ── Charity / public ─────────────────────────────────────
  "save the children": "savethechildren.org.uk",
  "save the children uk": "savethechildren.org.uk",
  "teach first": "teachfirst.org.uk",
  "british red cross": "redcross.org.uk",
  "blue cross": "bluecross.org.uk",
  "battersea dogs & cats home": "battersea.org.uk",
  "charities aid foundation": "cafonline.org",
  "charity job": "charityjob.co.uk",
  "charity: water": "charitywater.org",
  "relate": "relate.org.uk",
  "bupa": "bupa.co.uk",
  "nuffield health": "nuffieldhealth.com",
  "circle health group": "circlehealthgroup.co.uk",
  "priory group": "priorygroup.com",
  "blackbaud": "blackbaud.co.uk",
  "crisis": "crisis.org.uk",
  "mental health innovations": "mentalhealthinnovations.org",
  "ncvo": "ncvo.org.uk",
  "eastside people": "eastsidepeople.org",
  "the trussell trust": "trusselltrust.org",
  "trussell trust": "trusselltrust.org",
  "pdsa": "pdsa.org.uk",

  // ── Wellness / fitness ───────────────────────────────────
  "puregym": "puregym.com",
  "gymshark": "gymshark.com",
  "barry's": "barrys.com",
  "myprotein": "myprotein.com",
  "third space": "thirdspace.london",
  "lululemon": "lululemon.com",
  "david lloyd": "davidlloyd.co.uk",
  "david lloyd clubs": "davidlloyd.co.uk",
  "huel": "huel.com",
  "mindful chef": "mindfulchef.com",
  "gousto": "gousto.co.uk",
  "virgin active": "virginactive.co.uk",
  "the gym group": "thegymgroup.com",
  "tala": "wearetala.com",
  "gll (better)": "better.org.uk",
  "gll": "better.org.uk",
  "jd gyms": "jdgyms.co.uk",

  // ── Beauty ───────────────────────────────────────────────
  "charlotte tilbury": "charlottetilbury.com",
  "facegym": "facegym.com",
  "aesop": "aesop.com",
  "glossier": "glossier.com",
  "sephora": "sephora.co.uk",
  "l'oréal": "loreal.com",
  "loreal": "loreal.com",
  "estée lauder": "elcompanies.com",
  "estee lauder": "elcompanies.com",
  "the body shop": "thebodyshop.com",
  "space nk": "spacenk.com",
  "elemis": "elemis.com",
  "revolution beauty": "revolutionbeauty.com",
  "cult beauty (thg)": "cultbeauty.co.uk",
  "cult beauty": "cultbeauty.co.uk",
  "larry king hair": "larryking.co.uk",
  "toni & guy": "toniandguy.com",
  "townhouse": "townhouse.co.uk",

  // ── Travel ───────────────────────────────────────────────
  "british airways": "britishairways.com",
  "airbnb": "airbnb.co.uk",
  "booking.com": "booking.com",
  "accor": "accor.com",
  "marriott": "marriott.com",
  "marriott international": "marriott.com",
  "hilton": "hilton.com",
  "rosewood": "rosewoodhotels.com",
  "the savoy": "thesavoylondon.com",
  "the dorchester": "dorchestercollection.com",
  "the langham": "langhamhotels.com",
  "edition": "editionhotels.com",
  "ace hotel": "acehotel.com",
  "the standard": "standardhotels.com",
  "avanti west coast": "avantiwestcoast.co.uk",
  "easyjet": "easyjet.com",
  "virgin atlantic": "virginatlantic.com",
  "jet2": "jet2.com",
  "ryanair": "ryanair.com",
  "uber": "uber.com",
  "trainline": "thetrainline.com",
  "skyscanner": "skyscanner.net",
  "tui": "tui.co.uk",
  "lner": "lner.co.uk",
  "transport for london": "tfl.gov.uk",
  "national express": "nationalexpress.com",
  "firstgroup": "firstgroupplc.com",
  "ihg hotels & resorts": "ihg.com",
  "ihg": "ihg.com",
  "whitbread (premier inn)": "whitbread.co.uk",
  "whitbread": "whitbread.co.uk",
  "premier inn": "premierinn.com",
  "expedia group": "expediagroup.com",
  "expedia": "expedia.co.uk",

  // ── Jewellery ────────────────────────────────────────────
  "cartier": "cartier.com",
  "bulgari": "bulgari.com",
  "boodles": "boodles.com",
  "astley clarke": "astleyclarke.com",
  "monica vinader": "monicavinader.com",
  "pragnell": "pragnell.co.uk",
  "christie's (jewellery dept)": "christies.com",
  "christie's": "christies.com",
  "graff": "graff.com",
  "de beers": "debeersgroup.com",
  "pandora": "pandora.net",
  "tiffany & co.": "tiffany.com",
  "tiffany & co": "tiffany.com",
  "hatton garden (bid)": "hattongardenbid.com",
  "birmingham jewellery quarter": "jewelleryquarter.net",
  "signet jewelers": "signetjewelers.com",
  "goldsmiths": "goldsmiths.co.uk",
  "sotheby's (jewellery dept)": "sothebys.com",
  "sotheby's": "sothebys.com",

  // ── Pets / vets ──────────────────────────────────────────
  "cvs group": "cvsukltd.co.uk",
  "butternut box": "butternutbox.com",
  "pets at home": "petsathome.com",
  "vets4pets": "vets4pets.com",
  "ivc evidensia": "ivcevidensia.com",
  "medivet": "medivet.co.uk",
  "purina (nestlé)": "purina.co.uk",
  "purina": "purina.co.uk",
  "mars petcare": "marspetcare.com",
  "lily's kitchen": "lilyskitchen.co.uk",
  "rover": "rover.com",
  "pooch & mutt": "poochandmutt.co.uk",
  "jollyes": "jollyes.co.uk",
  "vets now": "vets-now.com",

  // ── Bakery / food production ─────────────────────────────
  "allied bakeries": "alliedbakeries.co.uk",
  "associated british foods": "abf.co.uk",
  "carr's flour": "carrsflour.com",
  "bidfood": "bidfood.co.uk",
  "brakes (sysco)": "brake.co.uk",
  "bread ahead": "breadahead.com",
  "gail's bakery": "gailsbread.co.uk",
  "hobbs house bakery": "hobbshousebakery.co.uk",
  "hovis": "hovis.co.uk",
  "marriage's flour": "marriagesmillers.co.uk",
  "ole & steen": "oleandsteen.co.uk",
  "paul uk": "paul-uk.com",
  "shipton mill": "shipton-mill.com",
  "warburtons": "warburtons.co.uk",

  // ── Hospitality / food production extra ──────────────────
  "unilever": "unilever.co.uk",
  "nestlé uk": "nestle.co.uk",
  "nestle uk": "nestle.co.uk",
  "pepsico uk": "pepsico.co.uk",
  "pepsico": "pepsico.com",
  "coca-cola europacific partners": "cocacolaep.com",
  "premier foods": "premierfoods.co.uk",
  "cranswick": "cranswick.plc.uk",
  "hilton food group": "hiltonfoods.com",
  "greencore": "greencore.com",
  "ocado logistics": "ocado-logistics.com",
  "wincanton": "wincanton.co.uk",
  "xpo logistics": "xpo.com",

  // ── Cinema / film ────────────────────────────────────────
  "working title films": "workingtitlefilms.com",
  "pinewood studios": "pinewoodgroup.com",
  "warner bros. pictures": "warnerbros.com",
  "warner bros": "warnerbros.com",
  "universal pictures": "universalpictures.com",
  "the walt disney company": "thewaltdisneycompany.com",
  "disney": "thewaltdisneycompany.com",
  "walt disney": "thewaltdisneycompany.com",
  "disney+": "thewaltdisneycompany.com",
  "sony pictures": "sonypictures.com",
  "paramount pictures": "paramount.com",
  "lionsgate": "lionsgate.com",
  "framestore": "framestore.com",
  "vue international": "myvue.com",

  // ── Music ────────────────────────────────────────────────
  "secretly group": "secretlygroup.com",
  "wme (william morris)": "wmeagency.com",
  "wme": "wmeagency.com",

  // ── Football / sport extra ───────────────────────────────
  "the football association": "thefa.com",
  "the premier league": "premierleague.com",
  "stats perform (opta)": "statsperform.com",
  "stats perform": "statsperform.com",
  "levy uk": "levy.co.uk",

  // ── Gaming ───────────────────────────────────────────────
  "rockstar games": "rockstargames.com",
  "playground games": "playground-games.com",
  "rare": "rare.co.uk",
  "frontier developments": "frontier.co.uk",
  "creative assembly": "creative-assembly.com",
  "ninja theory": "ninjatheory.com",
  "sumo digital": "sumo-digital.com",
  "team17": "team17.com",
  "jagex": "jagex.com",
  "sports interactive": "sigames.com",
  "ubisoft reflections": "ubisoft.com",
  "ndreams": "ndreams.com",

  // ── Property / estate agency extra ───────────────────────
  "my home move": "myhomemove.com",
  "simplify (premier property lawyers)": "simplify.co.uk",
  "simplify": "simplify.co.uk",
  "o'neill patient": "oprs.co.uk",
  "slater and gordon": "slatergordon.co.uk",
  "jmw solicitors": "jmw.co.uk",

  // ── Interior design ──────────────────────────────────────
  "gensler": "gensler.com",
  "soho house design": "sohohouse.com",
  "farrow & ball": "farrow-ball.com",
  "havwoods": "havwoods.com",
  "tom dixon": "tomdixon.net",
  "sonder living": "sonderliving.com",
  "ikea": "ikea.com",
  "dunelm": "dunelm.com",
  "john lewis": "johnlewis.com",
  "john lewis & partners": "johnlewis.com",
  "next home": "next.co.uk",
  "vinterior": "vinterior.co",

  // ── Journalism / news media extra ────────────────────────
  "sky news": "news.sky.com",
  "itn": "itn.co.uk",
  "global (capital, heart, lbc)": "global.com",
  "global": "global.com",
  "the observer": "theguardian.com",
  "reuters": "reuters.com",
  "pa media": "pamediagroup.com",
  "reach plc": "reachplc.com",
  "reach": "reachplc.com",
  "newsquest / archant": "newsquest.co.uk",
  "newsquest": "newsquest.co.uk",
  "associated press": "ap.org",
  "ap": "ap.org",
  "the news movement": "thenewsmovement.com",
  "gb news": "gbnews.com",
  "condé nast": "condenast.com",
  "conde nast": "condenast.com",
  "hearst uk": "hearst.co.uk",
  "hearst": "hearst.com",

  // ── Teaching / education extra ───────────────────────────
  "pearson": "pearson.com",
  "tes": "tes.com",
  "oak national academy": "thenational.academy",
  "united learning": "unitedlearning.org.uk",

  // ── Education / careers ──────────────────────────────────
  "ark schools": "arkonline.org",
  "amazing apprenticeships": "amazingapprenticeships.com",
  "career ready": "careerready.org",
  "barclays lifeskills": "barclayslifeskills.com",
  "bright network": "brightnetwork.co.uk",
  "allaboutcareers": "allaboutcareers.com",

  // ── Therapy / health ─────────────────────────────────────
  "betterhelp": "betterhelp.com",
  "bacp": "bacp.co.uk",
  "bacp job board": "bacp.co.uk",
  "csp": "csp.org.uk",
  "csp jobs": "csp.org.uk",

  // ── Additional high-volume employers seen in the marketplace ─
  "kfc": "kfc.co.uk",
  "witherslack": "witherslackgroup.co.uk",
  "busy bees": "busybeeschildcare.co.uk",
  "reed": "reed.co.uk",
  "hays": "hays.co.uk",
  "hays specialist recruitment": "hays.co.uk",
  "zachary daniels": "zacharydaniels.co.uk",
  "tradewind": "twrecruitment.com",
  "tradewind recruitment": "twrecruitment.com",
  "academics": "academics.co.uk",
  "reeson education": "reesoneducation.com",
  "teaching personnel": "teachingpersonnel.com",
  "fashion personnel": "fashionpersonnel.co.uk",
  "rituals": "rituals.com",
  "waitrose and partners": "waitrose.com",
  "bromford": "bromford.co.uk",
  "ramsay health care": "ramsayhealth.co.uk",
  "compass": "compass-group.co.uk",
  "compass uk": "compass-group.co.uk",
  "everlast gyms": "everlastgyms.com",
  "places leisure": "placesleisure.org",
  "bannatyne": "bannatyne.co.uk",
  "yard sale pizza": "yardsalepizza.com",
  "lounge cafe bars": "loungers.co.uk",
  "loungers": "loungers.co.uk",
  "brewers fayre": "brewersfayre.co.uk",
  "anthropic": "anthropic.com",
  "openai": "openai.com",
  "google deepmind": "deepmind.google",
  "deepmind": "deepmind.google",
  "playrix": "playrix.com",
  "ssp": "foodtravelexperts.com",
  "associated newspapers": "dmgt.com",
  "simplyhealth": "simplyhealth.co.uk",
  "burnley football club": "burnleyfootballclub.com",
  "southampton football club": "southamptonfc.com",
  "birmingham city football club": "bcfc.com",
  "manchester united football club": "manutd.com",
  "leicester city football club": "lcfc.com",
  "chelsea football club": "chelseafc.com",
  "arsenal football club": "arsenal.com",
  "liverpool football club": "liverpoolfc.com",
  "tottenham hotspur football club": "tottenhamhotspur.com",
  "asda stores": "asda.com",
  "inditex": "inditex.com",
  "zara inditex": "zara.com",
  "pure gym": "puregym.com",
  "puregym limited": "puregym.com",
  "the gym group plc": "thegymgroup.com",
  "six physio": "sixphysio.com",
  "signet": "signetjewelers.com",
  "live nation entertainment": "livenationentertainment.com",

  // ── Health (NHS, private hospitals, pharma, medtech) ─────
  "nhs": "nhs.uk",
  "nhs jobs": "nhs.uk",
  "nhs trust": "nhs.uk",
  "nhs talking therapies": "nhs.uk",
  "nhs england": "england.nhs.uk",
  "nhs scotland": "scot.nhs.uk",
  "nhs wales": "wales.nhs.uk",
  "hca healthcare uk": "hcahealthcare.co.uk",
  "spire healthcare": "spirehealthcare.com",
  "royal college of nursing": "rcn.org.uk",
  "care uk": "careuk.com",
  "hc-one": "hc-one.co.uk",
  "helping hands": "helpinghandshomecare.co.uk",
  "boots uk": "boots.com",
  "lloydspharmacy": "lloydspharmacy.com",
  "gsk": "gsk.com",
  "astrazeneca": "astrazeneca.com",
  "babylon / emed": "emed.com",
  "babylon": "emed.com",
  "emed": "emed.com",
  "smith+nephew": "smith-nephew.com",
  "ge healthcare": "gehealthcare.com",
  "nice (national institute for health and care excellence)": "nice.org.uk",
  "nice": "nice.org.uk",
  "department of health & social care": "gov.uk",
  "wellcome trust": "wellcome.org",

  // ── Farming (agriculture, agritech, livestock) ───────────
  "ahdb (agriculture & horticulture development board)": "ahdb.org.uk",
  "ahdb": "ahdb.org.uk",
  "nfu (national farmers' union)": "nfuonline.com",
  "nfu": "nfuonline.com",
  "arla foods uk": "arlafoods.co.uk",
  "arla foods": "arlafoods.co.uk",
  "arla": "arlafoods.co.uk",
  "müller uk": "muller.co.uk",
  "muller uk": "muller.co.uk",
  "müller": "muller.co.uk",
  "muller": "muller.co.uk",
  "g's fresh": "gs-fresh.com",
  "berry gardens": "berrygardens.co.uk",
  "velcourt": "velcourt.co.uk",
  "frontier agriculture": "frontierag.co.uk",
  "openfield": "openfield.co.uk",
  "john deere uk": "deere.co.uk",
  "john deere": "deere.com",
  "agco (massey ferguson)": "agcocorp.com",
  "agco": "agcocorp.com",
  "massey ferguson": "masseyferguson.com",
  "small robot company": "smallrobotcompany.com",
  "riverford organic farmers": "riverford.co.uk",
  "riverford": "riverford.co.uk",
  "leaf (linking environment and farming)": "leaf.eco",
  "leaf": "leaf.eco",
  "soil association": "soilassociation.org",
  "abp uk": "abpfoodgroup.com",
  "abp": "abpfoodgroup.com",

  // ── Money (banking, insurance, fintech, accountancy) ─────
  "hsbc": "hsbc.com",
  "barclays": "home.barclays",
  "lloyds banking group": "lloydsbankinggroup.com",
  "natwest group": "natwestgroup.com",
  "natwest": "natwest.com",
  "goldman sachs": "goldmansachs.com",
  "jp morgan": "jpmorgan.com",
  "jpmorgan": "jpmorgan.com",
  "blackrock": "blackrock.com",
  "schroders": "schroders.com",
  "m&g": "mandg.com",
  "lloyd's of london": "lloyds.com",
  "lloyds of london": "lloyds.com",
  "aviva": "aviva.com",
  "legal & general": "legalandgeneral.com",
  "legal and general": "legalandgeneral.com",
  "revolut": "revolut.com",
  "monzo": "monzo.com",
  "starling bank": "starlingbank.com",
  "wise": "wise.com",
  "pwc uk": "pwc.co.uk",
  "pwc": "pwc.com",
  "deloitte uk": "deloitte.co.uk",
  "deloitte": "deloitte.com",
  "ey uk": "ey.com",
  "ey": "ey.com",
  "kpmg uk": "kpmg.co.uk",
  "kpmg": "kpmg.com",
  "bank of england": "bankofengland.co.uk",
  "hargreaves lansdown": "hl.co.uk",

  // ── Horse Racing (regulators, courses, bloodstock, media) ─
  "british horseracing authority (bha)": "britishhorseracing.com",
  "british horseracing authority": "britishhorseracing.com",
  "bha": "britishhorseracing.com",
  "the jockey club": "thejockeyclub.co.uk",
  "jockey club": "thejockeyclub.co.uk",
  "arena racing company (arc)": "arenaracingcompany.co.uk",
  "arena racing company": "arenaracingcompany.co.uk",
  "arc": "arenaracingcompany.co.uk",
  "ascot racecourse": "ascot.com",
  "ascot": "ascot.com",
  "york racecourse": "yorkracecourse.co.uk",
  "goodwood racecourse": "goodwood.com",
  "goodwood": "goodwood.com",
  "tattersalls": "tattersalls.com",
  "goffs uk": "goffsuk.com",
  "goffs": "goffs.com",
  "coolmore stud": "coolmore.com",
  "coolmore": "coolmore.com",
  "darley (godolphin)": "godolphin.com",
  "darley": "darleyeurope.com",
  "godolphin": "godolphin.com",
  "racing post": "racingpost.com",
  "racing tv": "racingtv.com",
  "itv racing": "itv.com",
  "bet365": "bet365.com",
  "paddy power betfair (flutter)": "flutter.com",
  "paddy power betfair": "flutter.com",
  "paddy power": "paddypower.com",
  "betfair": "betfair.com",
  "flutter": "flutter.com",
  "racing welfare": "racingwelfare.co.uk",
  "retraining of racehorses (ror)": "ror.org.uk",
  "retraining of racehorses": "ror.org.uk",
  "ror": "ror.org.uk",
  "newmarket equine hospital": "newmarketequinehospital.com",
  "british racing school": "brs.org.uk",
  "national horseracing college": "nationalhorseracingcollege.com",

  // ── Formula 1 (teams, governing bodies, broadcast, circuits) ─
  "formula 1 (liberty media)": "formula1.com",
  "formula 1": "formula1.com",
  "formula one": "formula1.com",
  "f1": "formula1.com",
  "mclaren racing": "mclaren.com",
  "mclaren": "mclaren.com",
  "mercedes-amg petronas f1 team": "mercedesamgf1.com",
  "mercedes f1": "mercedesamgf1.com",
  "mercedes amg f1": "mercedesamgf1.com",
  "red bull racing": "redbullracing.com",
  "red bull": "redbull.com",
  "aston martin aramco f1 team": "astonmartinf1.com",
  "aston martin f1": "astonmartinf1.com",
  "williams racing": "williamsf1.com",
  "williams f1": "williamsf1.com",
  "alpine f1 team": "alpinecars.com",
  "alpine f1": "alpinecars.com",
  "alpine": "alpinecars.com",
  "haas f1 team": "haasf1team.com",
  "haas f1": "haasf1team.com",
  "cadillac f1 team": "cadillac.com",
  "cadillac f1": "cadillac.com",
  "sky sports f1": "sky.com",
  "motorsport network": "motorsport.com",
  "motorsport.com": "motorsport.com",
  "autosport": "autosport.com",
  "the race": "the-race.com",
  "pirelli motorsport": "pirelli.com",
  "pirelli": "pirelli.com",
  "fia": "fia.com",
  "silverstone circuits": "silverstone.co.uk",
  "silverstone": "silverstone.co.uk",
  "motorsport uk": "motorsportuk.org",
};

/** Simple deterministic colour from a string (HSL). */
function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 360;
}

function getInitials(name: string): string {
  const cleaned = name
    .replace(/&/g, " ")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Best-effort domain guess for a company we don't have curated. */
function guessDomain(name: string): string | null {
  const slug = name
    .toLowerCase()
    .replace(/\b(ltd|limited|plc|llc|inc|incorporated|group|uk|holdings|& co\.?|and co\.?|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  if (!slug) return null;
  return `${slug}.com`;
}

/** Normalise a company name for fuzzy curated-map lookup. */
function normaliseCompanyKey(name: string): string {
  return name
    .toLowerCase()
    // strip parenthetical suffixes like "Zara (Inditex)" → "zara "
    .replace(/\([^)]*\)/g, " ")
    // strip common corporate suffixes
    .replace(/\b(ltd\.?|limited|plc|llc|inc\.?|incorporated|holdings|holding|group|company|co\.?|stores?|& partners|and partners)\b/g, " ")
    // unify punctuation
    .replace(/&/g, " and ")
    .replace(/[.,'’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Try to find a curated domain via exact then progressively looser matches. */
export function findCuratedDomain(rawCompany: string): string | undefined {
  const key = rawCompany.trim().toLowerCase();
  if (CURATED_DOMAINS[key]) return CURATED_DOMAINS[key];

  const normalised = normaliseCompanyKey(rawCompany);
  if (CURATED_DOMAINS[normalised]) return CURATED_DOMAINS[normalised];

  // Any NHS trust / body falls back to nhs.uk for a recognisable logo
  if (/\bnhs\b/.test(normalised)) return "nhs.uk";

  // Try stripping trailing " uk" (e.g. "kfc uk" → "kfc")
  const noUk = normalised.replace(/\s+uk$/, "").trim();
  if (noUk && CURATED_DOMAINS[noUk]) return CURATED_DOMAINS[noUk];

  // Try matching the first 1-3 words of the normalised name against curated
  // keys (e.g. "pure gym limited" → "pure gym", "associated newspapers" → "associated newspapers (dmgt)")
  const words = normalised.split(" ").filter(Boolean);
  for (let take = Math.min(3, words.length); take >= 1; take--) {
    const prefix = words.slice(0, take).join(" ");
    if (CURATED_DOMAINS[prefix]) return CURATED_DOMAINS[prefix];
  }

  // Last resort: find any curated key that the normalised name starts with
  // (catches "burnley football club" → "burnley fc"-style cases when keyed
  // by full club name). Bias toward the longest match to avoid false hits.
  let bestKey: string | undefined;
  for (const candidate of Object.keys(CURATED_DOMAINS)) {
    if (candidate.length < 4) continue; // skip very short keys
    if (normalised === candidate || normalised.startsWith(candidate + " ")) {
      if (!bestKey || candidate.length > bestKey.length) bestKey = candidate;
    }
  }
  return bestKey ? CURATED_DOMAINS[bestKey] : undefined;
}

interface CompanyLogoProps {
  company: string;
  size?: number;
  className?: string;
  /** Visual style of the wrapper. Default is a soft rounded square. */
  rounded?: "sm" | "md" | "full";
}

/**
 * Renders a company logo using:
 *   1. Curated domain → Clearbit logo CDN
 *   2. Heuristic guessed domain → Clearbit
 *   3. Coloured initials fallback if both fail
 */
const CompanyLogo = ({ company, size = 40, className = "", rounded = "md" }: CompanyLogoProps) => {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const employerLogoMap = useEmployerLogoMap();

  const sources = useMemo(() => {
    // An employer's own uploaded logo (via their dashboard) wins over
    // everything else - it's the one thing we know is actually theirs.
    const uploaded = employerLogoMap[(company ?? "").toLowerCase().trim()];

    // Local asset override wins over any CDN result.
    const normalised = (company ?? "").toLowerCase().trim().replace(/\s+/g, " ");
    let assetKey: string | undefined;
    for (const k of Object.keys(CURATED_LOGO_ASSETS)) {
      if (normalised === k || normalised.startsWith(k + " ") || normalised.startsWith(k + ",")) {
        if (!assetKey || k.length > assetKey.length) assetKey = k;
      }
    }
    const localAsset = assetKey ? CURATED_LOGO_ASSETS[assetKey] : undefined;

    const curated = findCuratedDomain(company);
    if (!uploaded && !localAsset && !curated) return [] as string[];

    // Request 3x the display size for crisp retina rendering, capped at 256px.
    const px = Math.min(256, Math.max(128, size * 3));
    const cdnSources = curated
      ? [
          `https://img.logo.dev/${curated}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=${px}&format=png&fallback=404`,
          `https://icon.horse/icon/${curated}?size=large`,
          `https://icons.duckduckgo.com/ip3/${curated}.ico`,
          `https://www.google.com/s2/favicons?domain=${curated}&sz=${px}`,
        ]
      : [];
    const base = localAsset ? [localAsset, ...cdnSources] : cdnSources;
    return uploaded ? [uploaded, ...base] : base;
  }, [company, size, employerLogoMap]);

  const initials = getInitials(company);
  const hue = hashHue(company);
  const radius = rounded === "full" ? "rounded-full" : rounded === "sm" ? "rounded-sm" : "rounded-md";

  const currentSrc = stage < sources.length ? sources[stage] : null;

  if (!currentSrc) {
    return (
      <div
        className={`inline-flex items-center justify-center font-display font-700 shrink-0 ${radius} ${className}`}
        style={{
          width: size,
          height: size,
          background: `hsl(${hue}, 70%, 92%)`,
          color: `hsl(${hue}, 70%, 28%)`,
          fontSize: Math.max(10, Math.round(size * 0.38)),
        }}
        aria-label={`${company} logo`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-border overflow-hidden shrink-0 ${radius} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={currentSrc}
        alt={`${company} logo`}
        loading="lazy"
        width={size}
        height={size}
        className="w-full h-full object-contain p-0.5"
        onError={() => setStage((s) => (s + 1) as 0 | 1 | 2 | 3 | 4)}
      />
    </div>
  );
};

export default CompanyLogo;
