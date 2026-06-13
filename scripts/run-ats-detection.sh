#!/bin/bash
# Runs ATS detection against all companies in the Who? sections.
# Calls the detect-ats-boards edge function one company at a time.
# Results are saved to the ats_detection_results table in Supabase.
#
# Usage:
#   ./scripts/run-ats-detection.sh            # scan all companies
#   ./scripts/run-ats-detection.sh 50 100     # scan offset 50, limit 100

FUNCTION_URL="https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/detect-ats-boards"
SERVICE_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaXN0Y2t4eGJmcHN1dWxic3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUwNTkyNCwiZXhwIjoyMDk2MDgxOTI0fQ.9qSNx10_Kkwqyj2MAWt54LOcyonLHWCGjhHyrHynnMo"

# company|industry|url  — one per line
COMPANIES=(
  "Charlotte Tilbury|beauty|https://apply.workable.com/charlotte-tilbury/"
  "Boots (No7 Beauty)|beauty|https://www.boots.jobs"
  "The Body Shop|beauty|https://careers.thebodyshop.com"
  "Space NK|beauty|https://careers.spacenk.com/jobs"
  "Elemis|beauty|https://careers.elemis.com/en"
  "Revolution Beauty|beauty|https://revolutionbeauty.teamtailor.com/jobs"
  "Cult Beauty (THG)|beauty|https://www.thg.com/careers"
  "Toni & Guy|beauty|https://www.toniandguy.com/careers"
  "Hawkstone|beer|https://hawkstone.com"
  "Northern Monk|beer|https://www.northernmonk.com"
  "BrewDog|beer|https://jobs.brewdog.com/"
  "Beavertown Brewery|beer|https://www.beavertownbrewery.co.uk"
  "Camden Town Brewery|beer|https://www.camdentownbrewery.com"
  "Cloudwater Brew Co|beer|https://cloudwaterbrew.co"
  "Heineken UK|beer|https://heineken.wd3.myworkdayjobs.com/heineken_external"
  "Molson Coors UK|beer|https://molsoncoors.wd5.myworkdayjobs.com/MolsonCoors"
  "AB InBev UK|beer|https://abinbev.wd3.myworkdayjobs.com/Anheuser-Busch_InBev"
  "Fuller's|beer|https://careers.fullers.co.uk"
  "Marston's|beer|https://www.marstons.co.uk/careers/"
  "JD Wetherspoon|beer|https://www.jdwetherspooncareers.com/"
  "Diageo (Guinness)|beer|https://diageo.wd3.myworkdayjobs.com/Diageo_Careers"
  "Toast Ale|beer|https://www.toastale.com"
  "Jaguar Land Rover|cars|https://www.jaguarlandrovercareers.com"
  "Bentley Motors|cars|https://www.bentleycareers.com"
  "Aston Martin|cars|https://careers.astonmartin.com"
  "Arnold Clark|cars|https://www.arnoldclark.com/careers"
  "Halfords|cars|https://careers.halfordscareers.com"
  "AA (Automobile Association)|cars|https://www.theaacareers.co.uk"
  "RAC|cars|https://www.rac-careers.com"
  "Kwik Fit|cars|https://www.kwik-fit.com/careers"
  "Macmillan Cancer Support|charity|https://www.macmillan.org.uk/about-us/jobs/"
  "Cancer Research UK|charity|https://careers.cancerresearchuk.org"
  "British Heart Foundation|charity|https://careers.bhf.org.uk"
  "Oxfam GB|charity|https://jobs.oxfam.org.uk"
  "Save the Children UK|charity|https://www.savethechildren.org.uk/about-us/work-for-us"
  "NSPCC|charity|https://www.nspcc.org.uk/about-us/jobs/"
  "Mind|charity|https://www.mind.org.uk/about-us/jobs-and-volunteering/"
  "National Trust|charity|https://www.nationaltrust.org.uk/jobs"
  "Working Title Films|cinema|https://www.workingtitlefilms.com"
  "Pinewood Studios|cinema|https://www.pinewoodgroup.com/careers"
  "Warner Bros. Pictures|cinema|https://www.warnerbroscareers.com"
  "Universal Pictures|cinema|https://www.nbcunicareers.com"
  "The Walt Disney Company|cinema|https://jobs.disneycareers.com"
  "Sony Pictures|cinema|https://www.sonypictures.com/corp/help.html"
  "Paramount Pictures|cinema|https://www.paramount.com/careers"
  "Lionsgate|cinema|https://boards.greenhouse.io/lionsgate"
  "A24|cinema|https://boards.greenhouse.io/a24"
  "Framestore|cinema|https://boards.greenhouse.io/framestore"
  "DNEG|cinema|https://boards.greenhouse.io/dneg"
  "Cinesite|cinema|https://boards.greenhouse.io/cinesite"
  "The Mill|cinema|https://boards.greenhouse.io/themill"
  "Everyman|cinema|https://boards.greenhouse.io/everymancinema"
  "Odeon Cinemas|cinema|https://careers.odeon.co.uk"
  "BBC|cinema|https://careers.bbc.co.uk"
  "ITV|cinema|https://www.itvjobs.com"
  "Channel 4|cinema|https://careers.channel4.com"
  "Sky|cinema|https://careers.sky.com"
  "Starbucks UK|coffee|https://www.starbucks.co.uk/careers"
  "Costa Coffee|coffee|https://www.costa.co.uk/careers/"
  "Pret A Manger|coffee|https://www.pret.co.uk/en-gb/careers"
  "Red Bull Racing|formula-1|https://careers.redbullracing.com"
  "Mercedes-AMG Petronas|formula-1|https://careers.mercedesamgf1.com"
  "McLaren Racing|formula-1|https://careers.mclaren.com"
  "Williams Racing|formula-1|https://careers.williamsf1.com"
  "Aston Martin Aramco F1|formula-1|https://astonmartinf1.pinpointhq.com"
  "Ferrari|formula-1|https://careers.ferrari.com"
  "Silverstone|formula-1|https://www.silverstone.co.uk/about/jobs"
  "Tesco|grocery|https://www.tesco-careers.com"
  "Sainsbury's|grocery|https://jobs.sainsburys.co.uk"
  "Waitrose & Partners|grocery|https://www.waitrose.jobs"
  "Marks & Spencer|grocery|https://careers.marksandspencer.com"
  "Lidl GB|grocery|https://careers.lidl.co.uk"
  "Aldi UK|grocery|https://careers.aldi.co.uk"
  "Co-op|grocery|https://jobs.coop.co.uk"
  "Ocado Group|grocery|https://www.ocadogroup.com/careers"
  "Deliveroo|grocery|https://careers.deliveroo.co.uk"
  "HelloFresh|grocery|https://www.hellofresh.co.uk/careers"
  "Gousto|grocery|https://www.gousto.co.uk/careers"
  "Unilever|grocery|https://unilever.wd3.myworkdayjobs.com/Unilever_Careers"
  "Nestlé UK|grocery|https://www.nestle.co.uk/en-gb/jobs"
  "Mars UK|grocery|https://www.mars.com/careers"
  "Mondelēz International|grocery|https://careers.mondelez.com"
  "Coca-Cola UK|grocery|https://www.careersatcoca-cola.co.uk"
  "Sky News|journalism|https://www.lifeatsky.com/search-results"
  "Channel 4 News|journalism|https://careers.channel4.com"
  "GB News|journalism|https://boards.greenhouse.io/gbnews"
  "The Telegraph|journalism|https://boards.greenhouse.io/telegraph"
  "Associated Newspapers (DMGT)|journalism|https://www.dmgmedia.co.uk/careers/"
  "Condé Nast|journalism|https://condenast.wd5.myworkdayjobs.com/Conde_Nast"
  "Hearst UK|journalism|https://boards.greenhouse.io/hearstuk"
  "Reach plc|journalism|https://boards.greenhouse.io/reach"
  "The Guardian|journalism|https://boards.greenhouse.io/theguardian"
  "Nike|footwear|https://jobs.nike.com"
  "Adidas|footwear|https://careers.adidas-group.com"
  "Puma|footwear|https://about.puma.com/en/careers"
  "New Balance|footwear|https://www.newbalance.com/careers.html"
  "Asics|footwear|https://www.asics.com/gb/en-gb/mk/careers"
  "On Running|footwear|https://www.on-running.com/en-gb/careers"
  "Dr. Martens|footwear|https://boards.greenhouse.io/drmartens"
  "Clarks|footwear|https://careers.clarks.co.uk"
  "Schuh|footwear|https://boards.greenhouse.io/schuh"
  "JD Sports|footwear|https://careers.jdsports.co.uk"
  "Foot Locker|footwear|https://careers.footlocker.com"
  "Kurt Geiger|footwear|https://jobs.lever.co/kurtgeiger"
  "Deckers (UGG/HOKA)|footwear|https://www.deckers.com/careers"
  "Pandora|jewellery|https://pandora.wd3.myworkdayjobs.com/Pandora_Careers"
  "Signet Jewelers|jewellery|https://signetjewelers.wd1.myworkdayjobs.com/signetjewelers"
  "Watches of Switzerland|jewellery|https://careers.thewosgroupplc.com"
  "Swarovski|jewellery|https://www.swarovski.com/en-GB/careers/"
  "Cartier|jewellery|https://careers.richemont.com"
  "De Beers Group|jewellery|https://www.debeersgroup.com/careers"
  "Spotify|music|https://www.lifeatspotify.com"
  "Live Nation|music|https://www.livenationentertainment.com/careers/"
  "Barclays|money|https://home.barclays/careers/"
  "HSBC UK|money|https://www.hsbc.com/careers"
  "NatWest Group|money|https://jobs.natwestgroup.com"
  "Lloyds Banking Group|money|https://lloydsbankinggroupcareers.com"
  "Goldman Sachs|money|https://www.goldmansachs.com/careers"
  "JPMorgan Chase|money|https://careers.jpmorgan.com"
  "Morgan Stanley|money|https://www.morganstanley.com/careers"
  "BlackRock|money|https://careers.blackrock.com"
  "Schroders|money|https://www.schroders.com/en-gb/uk/individual/careers/"
  "Aviva|money|https://careers.aviva.co.uk"
  "Revolut|money|https://www.revolut.com/careers/"
  "Wise|money|https://wise.com/gb/careers/"
  "Klarna|money|https://www.klarna.com/careers/"
  "Starling Bank|money|https://www.starlingbank.com/careers/"
  "Deloitte|money|https://www2.deloitte.com/uk/en/pages/careers"
  "PwC|money|https://www.pwc.co.uk/careers.html"
  "EY|money|https://www.ey.com/en_uk/careers"
  "KPMG UK|money|https://home.kpmg/uk/en/home/careers.html"
  "NHS England|health|https://www.jobs.nhs.uk"
  "Bupa|health|https://www.bupa.co.uk/careers"
  "Nuffield Health|health|https://jobs.nuffieldhealth.com"
  "Ramsay Health Care UK|health|https://www.ramsayhealth.co.uk/careers"
  "HCA Healthcare UK|health|https://careers.hcahealthcare.co.uk"
  "Spire Healthcare|health|https://careers.spirehealthcare.com"
  "AstraZeneca|health|https://careers.astrazeneca.com"
  "GlaxoSmithKline (GSK)|health|https://www.gsk.com/en-gb/careers/"
  "Pfizer UK|health|https://www.pfizer.co.uk/careers"
  "Johnson & Johnson UK|health|https://jobs.jnj.com/en"
  "Pets at Home|pets|https://www.petsathomecareers.com"
  "PDSA|pets|https://www.pdsa.org.uk/about-us/jobs"
  "Dogs Trust|pets|https://www.dogstrust.org.uk/about-us/jobs-and-internships/"
  "Blue Cross|pets|https://www.bluecross.org.uk/jobs"
  "RSPCA|pets|https://jobs.rspca.org.uk"
  "Butternut Box|pets|https://boards.greenhouse.io/butternutbox"
  "Tails.com|pets|https://tails.com/gb/careers/"
  "Purina (Nestlé)|pets|https://www.purina.co.uk/our-story/careers"
  "Mars Petcare|pets|https://www.mars.com/careers"
  "CVS Group|pets|https://careers.cvsgroup.co.uk"
  "Rightmove|estate-agency|https://careers.rightmove.co.uk"
  "Zoopla|estate-agency|https://careers.zoopla.co.uk"
  "Savills|estate-agency|https://www.savills.co.uk/careers"
  "Knight Frank|estate-agency|https://careers.knightfrank.com"
  "JLL|estate-agency|https://www.careers.jll.com"
  "CBRE|estate-agency|https://careers.cbre.com"
  "Foxtons|estate-agency|https://careers.foxtons.co.uk"
)

OFFSET=${1:-0}
LIMIT=${2:-${#COMPANIES[@]}}
END=$((OFFSET + LIMIT))
FOUND=0
TOTAL=0

echo "Scanning ${#COMPANIES[@]} companies (offset=$OFFSET, limit=$LIMIT)..."
echo ""

for i in "${!COMPANIES[@]}"; do
  if [ "$i" -lt "$OFFSET" ]; then continue; fi
  if [ "$i" -ge "$END" ]; then break; fi

  IFS='|' read -r company industry url <<< "${COMPANIES[$i]}"
  TOTAL=$((TOTAL + 1))

  PAYLOAD=$(printf '{"company":"%s","industry":"%s","url":"%s"}' \
    "$(echo "$company" | sed 's/"/\\"/g')" \
    "$industry" \
    "$url")

  RESULT=$(curl -s -X POST "$FUNCTION_URL" \
    -H "Authorization: Bearer $SERVICE_JWT" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    --max-time 15)

  ATS_TYPE=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ats_type') or '')" 2>/dev/null)
  BOARD_SLUG=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('board_slug') or d.get('wd_tenant') or '')" 2>/dev/null)
  IN_SCRAPER=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('in_scraper'))" 2>/dev/null)

  if [ -n "$ATS_TYPE" ]; then
    FOUND=$((FOUND + 1))
    if [ "$IN_SCRAPER" = "False" ]; then
      echo "✅ NEW  [$industry] $company → $ATS_TYPE / $BOARD_SLUG"
    else
      echo "   dup  [$industry] $company → $ATS_TYPE / $BOARD_SLUG (already scraped)"
    fi
  else
    echo "   ---  [$industry] $company → not detected"
  fi

  # small delay to avoid rate limits
  sleep 0.3
done

echo ""
echo "Done. $FOUND/$TOTAL companies had detectable ATS."
echo "Results saved to ats_detection_results table in Supabase."
echo ""
echo "To see new boards to add to the scraper:"
echo "  Run this SQL in Supabase dashboard:"
echo "  SELECT company, industry, ats_type, board_slug, wd_tenant, wd_site, wd_version, final_url"
echo "  FROM ats_detection_results WHERE in_scraper = false AND ats_type IS NOT NULL"
echo "  ORDER BY industry, ats_type;"
