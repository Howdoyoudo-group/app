export interface Course {
  title: string;
  provider: string;
  url: string;
  description: string;
  free: boolean;
}

export interface YouTubeChannel {
  name: string;
  url: string;
  description: string;
}

export interface SubstackNewsletter {
  name: string;
  url: string;
  description: string;
}

export interface TikTokCreator {
  name: string;
  handle: string;
  url: string;
  description: string;
}

export const substackByIndustry: Record<string, SubstackNewsletter[]> = {
  beauty: [
    { name: "Beauty Independent", url: "https://www.beautyindependent.com/", description: "Indie beauty brand news, founder stories, and the business of building a beauty brand from scratch." },
    { name: "The Beauty Shortlist", url: "https://thebeautyshortlist.substack.com/", description: "Beauty industry trends, clean beauty business, and award-winning product analysis." },
  ],
  cars: [
    { name: "Fully Charged", url: "https://fullycharged.show/", description: "Electric vehicle industry analysis - the business of EVs, charging infrastructure, and sustainable transport." },
    { name: "The Driven", url: "https://thedriven.io/", description: "EV and clean energy news - industry moves, policy changes, and the transition to electric." },
  ],
  fashion: [
    { name: "Back Row - Amy Odell", url: "https://amyodell.substack.com/", description: "Former Cosmopolitan editor covering fashion industry power dynamics, business moves, and career politics." },
    { name: "Stylist Elixir", url: "https://stylistelixir.substack.com/", description: "Fashion jobs, career advice, and insider breakdowns of real job openings in the industry." },
    { name: "Glam Observer", url: "https://glamobserver.substack.com/", description: "Career guides for breaking into fashion - what to study, where to apply, and how to stand out." },
  ],
  beer: [
    { name: "Boak & Bailey's Beer Blog", url: "https://boakandbailey.com/", description: "Respected UK beer writers covering brewing history, pub culture, and the evolving British beer scene." },
    { name: "Pellicle Magazine", url: "https://pelliclemag.com/", description: "Independent beer and drinks writing - craft, culture, and industry analysis." },
  ],
  coffee: [
    { name: "Sprudge", url: "https://sprudge.substack.com/", description: "The leading coffee media outlet - industry news, café business, and career stories from the speciality coffee world." },
    { name: "The Café Dispatch", url: "https://thecoffeedispatch.substack.com/", description: "Weekly café business trends, industry insights, and what's shaping the global coffee scene." },
  ],
  cinema: [
    { name: "Club Ciné", url: "https://clubcine.substack.com/", description: "UK cinema culture - festivals, independent film, and the business of running and working in cinemas." },
    { name: "Listen to Lillian", url: "https://listentolillian.substack.com/", description: "British cinema history and criticism - industry analysis from a historian and film critic." },
    { name: "The Industry", url: "https://theindustry.co/", description: "Daily film and TV news - industry deals, production updates, and the business of screen entertainment." },
  ],
  music: [
    { name: "MUSIC x", url: "https://musicx.substack.com/", description: "European music industry economics - publishing, streaming deals, and the business of a diverse music ecosystem." },
    { name: "Water & Music", url: "https://waterandmusic.substack.com/", description: "Music and technology business analysis - how innovation is creating new music industry careers." },
    { name: "First Floor", url: "https://firstfloor.substack.com/", description: "Music journalism and industry criticism - corporate consolidation, streaming economics, and muckraking." },
  ],
  football: [
    { name: "The Bottom Line", url: "https://thebottomlinesport.substack.com/", description: "The business of football - Premier League club finances, commercial deals, and industry operations." },
    { name: "The Football Weekend", url: "https://www.thefootballweekend.com/", description: "In-depth football writing with a focus on culture, business, and the industry behind the game." },
    { name: "Grace on Football", url: "https://graceonfootball.substack.com/", description: "Premier League analysis and football business insight from one of Substack's top football writers." },
  ],
  "interior design": [
    { name: "The Design Edit", url: "https://thedesignedit.substack.com/", description: "Design industry trends, business of interiors, and career insights for designers." },
    { name: "Interior Design Insiders", url: "https://interiordesigninsiders.substack.com/", description: "Industry insights and business expertise for interior designers - the studio shenanigans behind the scenes." },
  ],
  teaching: [
    { name: "The Careers Education Substack", url: "https://careersedforallweekly.substack.com/", description: "Weekly careers education insights for school leaders and careers professionals - over 1,000 subscribers." },
    { name: "Teach Again - Joe Hallgarten", url: "https://joehallgarten.substack.com/", description: "Teacher, writer, and education strategist sharing insights on working in schools and education policy." },
    { name: "FE Teacher Education Network", url: "https://feinitialteachereducationnetwork.substack.com/", description: "Routes into Further Education teaching - career reflections, training advice, and sector insights." },
  ],
  bakery: [
    { name: "The Next Delicious Thing", url: "https://jenniferearle.substack.com/", description: "UK food industry insider - bakery business profiles, competition updates, and artisan industry trends." },
  ],
  charity: [
    { name: "Impact Funding", url: "https://impactfunding.substack.com/", description: "Grant opportunities, sector analysis, and career insights for people working in charities and social impact." },
    { name: "Nonprofit AF", url: "https://nonprofitaf.substack.com/", description: "Straight-talking nonprofit sector commentary - fundraising, leadership, and the realities of charity careers." },
  ],
  footwear: [
    { name: "The Sneaker Newsletter", url: "https://www.thesneakernewsletter.com/", description: "20+ years inside the sneaker industry - real analysis from a StockX, Complex, and Sole Collector veteran." },
    { name: "The Kicks You Wear", url: "https://kyw.substack.com/", description: "Footwear industry strategy, brand business analysis, and interviews with CEOs and trade leaders." },
  ],
  "formula-1": [
    { name: "The Race - Inside Track", url: "https://the-race.com/newsletter/", description: "Daily F1 analysis from former insiders - team strategy, regulation changes and the business of racing." },
    { name: "Missed Apex", url: "https://missedapexpodcast.substack.com/", description: "F1 engineering deep-dives, cost-cap economics and career paths in Motorsport Valley." },
  ],
  wellness: [
    { name: "Beauty Confidential", url: "https://thebeautycopywriter.substack.com/", description: "Beauty industry business - brand accountability, market trends, and careers in wellness and beauty." },
    { name: "BritishBeautyBlogger", url: "https://britbeautyblog.substack.com/", description: "UK beauty business news - industry shifts, brand strategies, and working in the beauty sector." },
    { name: "Between Sessions", url: "https://betweensessions.substack.com/", description: "Mental health professional community - practice management, career growth, and working in wellness." },
  ],
  grocery: [
    { name: "Moving Tribes", url: "https://movingtribes.substack.com/", description: "UK retail property and grocery business - economics of retail, industry strategy, and sector careers." },
  ],
  "estate agency": [
    { name: "Ladies in Real Estate (LiRE)", url: "https://ladiesinrealestate.substack.com/", description: "UK real estate career network - 4,000+ subscribers covering industry news, professional development, and women in property." },
    { name: "Secret Property Club", url: "https://secretpropertyclub.substack.com/", description: "UK property market updates for industry professionals - regulation changes, market trends, and investment insights." },
  ],
  "food & drink": [
    { name: "Hospitality is a Lifestyle", url: "https://www.kiranrobinson.com/", description: "Hospitality industry insider - career stories, business strategies, and building a life in food and drink." },
    { name: "The Next Delicious Thing", url: "https://jenniferearle.substack.com/", description: "UK food business - restaurant openings, industry trends, and the people behind the plates." },
  ],
  physiotherapy: [
    { name: "Physio Matters", url: "https://mskmag.substack.com/", description: "MSK physiotherapy insights - FCP roles, advanced practice, and career development in UK physio." },
  ],
  psychotherapy: [
    { name: "Counselling & Psychotherapy Stuff", url: "https://counselling.substack.com/", description: "Life, therapy, and the profession - career reflections from a counselling and psychotherapy academic." },
    { name: "Therapy Works - Julia Samuel", url: "https://juliasamuel.substack.com/", description: "Renowned psychotherapist sharing insights on therapy practice, career in mental health, and the human condition." },
  ],
  gaming: [
    { name: "GameDiscoverCo", url: "https://gamediscover.co/", description: "Data-driven analysis of game sales, Steam trends, and the business of getting your game discovered." },
    { name: "Game Developer Newsletter", url: "https://gamedeveloper.substack.com/", description: "Industry news, postmortems, and career advice for game developers and studio leaders." },
    { name: "Hit Points - Nathan Brown", url: "https://hitpoints.substack.com/", description: "Former Edge editor covering the games industry - business, culture, and what's really happening behind the scenes." },
  ],
  journalism: [
    { name: "Press Gazette Daily", url: "https://pressgazette.substack.com/", description: "UK media industry intelligence - publisher strategies, ad revenue, and journalism career news." },
    { name: "The Fix", url: "https://thefix.media/", description: "Newsletter for media professionals - business models, reader revenue, and the future of news." },
    { name: "Journalism.co.uk", url: "https://www.journalism.co.uk/", description: "UK journalism industry updates - tools, techniques, training, and career opportunities." },
  ],
  influencing: [
    { name: "Creator Economy", url: "https://creatoreconomy.so", description: "Peter Yang's flagship newsletter - strategy, monetisation and platform shifts across the global creator economy." },
    { name: "Tubefilter", url: "https://www.tubefilter.com", description: "Daily news and analysis on the YouTube and short-form video industry - channel deals, MCN moves and platform updates." },
    { name: "The Drum", url: "https://www.thedrum.com", description: "Marketing industry news with deep coverage of influencer campaigns, agency moves and brand-creator partnerships." },
    { name: "Trapital", url: "https://trapital.co", description: "Dan Runcie's weekly read on the business of music, media and creators - sharp deal analysis." },
    { name: "Every", url: "https://every.to", description: "Premium creator-economy publication - essays on content, careers and building a one-person media business." },
  ],
  jewellery: [
    { name: "The Jewellery Cut", url: "https://www.thejewellerycut.com/", description: "In-depth jewellery journalism - designer profiles, brand stories, and industry interviews." },
    { name: "Professional Jeweller", url: "https://professionaljeweller.substack.com/", description: "UK jewellery trade intelligence - market trends, brand news, and retail strategy." },
  ],
  pets: [
    { name: "Pet Gazette", url: "https://www.petgazette.biz/", description: "UK pet industry trade news - retail, veterinary, and pet care business updates." },
    { name: "VetSurgeon News", url: "https://www.vetsurgeon.org/", description: "Veterinary profession news, career development, and industry analysis for UK vets and vet nurses." },
  ],
  health: [
    { name: "The HSJ Daily", url: "https://www.hsj.co.uk/newsletters", description: "The Health Service Journal's daily intelligence for NHS leaders - policy, performance and people moves." },
    { name: "Sifted Healthtech", url: "https://sifted.eu/newsletters", description: "European healthtech and biotech startup news, funding rounds and founder stories from the Sifted team." },
    { name: "The Medical Republic", url: "https://www.medicalrepublic.com.au/newsletter", description: "Independent medical journalism - clinical practice, GP life and career-relevant healthcare commentary." },
  ],
  farming: [
    { name: "Farmers Weekly", url: "https://www.fwi.co.uk/newsletter-sign-up", description: "The UK's leading farming weekly - news, business analysis and jobs across British agriculture." },
    { name: "AHDB Insight", url: "https://ahdb.org.uk/news", description: "Agriculture & Horticulture Development Board market intelligence for arable, dairy, beef, lamb and pork sectors." },
    { name: "Sustainable Food Trust", url: "https://sustainablefoodtrust.org/news/", description: "Patrick Holden's writing on regenerative agriculture, food policy and the future of British farming." },
  ],
  money: [
    { name: "Money Stuff - Matt Levine", url: "https://www.bloomberg.com/account/newsletters/money-stuff", description: "Bloomberg's flagship daily - wry, deep analysis of finance, banking and capital markets from Matt Levine." },
    { name: "Net Interest - Marc Rubinstein", url: "https://www.netinterest.co/", description: "Former hedge-fund analyst writing the smartest weekly newsletter on banks, fintech and financial services." },
    { name: "Fintech Brainfood - Simon Taylor", url: "https://www.fintechbrainfood.com/", description: "Weekly UK-focused fintech analysis from 11:FS partner Simon Taylor - payments, banking and crypto." },
    { name: "The Generalist - Mario Gabriele", url: "https://www.generalist.com/", description: "Deep dives into venture capital, startups and the business of money from one of finance's best newsletter writers." },
  ],
  "horse-racing": [
    { name: "Thoroughbred Daily News", url: "https://www.thoroughbreddailynews.com/newsletter-signup/", description: "Daily newsletter for the global thoroughbred industry - bloodstock sales, breeding and racing business." },
    { name: "Racing Post Bulletin", url: "https://www.racingpost.com/newsletters", description: "The Racing Post's flagship newsletters - daily previews, betting analysis and industry news." },
    { name: "BloodHorse", url: "https://www.bloodhorse.com/horse-racing/newsletters", description: "International thoroughbred news - sales, breeding, racing results and industry careers." },
  ],
};

export const youtubeByIndustry: Record<string, YouTubeChannel[]> = {
  beauty: [
    { name: "British Beauty Council", url: "https://www.youtube.com/@BritishBeautyCouncil", description: "The UK's beauty industry body - careers, sustainability, and the business of beauty." },
    { name: "Lisa Eldridge", url: "https://www.youtube.com/@LisaEldridge", description: "Celebrity makeup artist sharing professional techniques, product reviews, and beauty industry insights." },
    { name: "Caroline Hirons", url: "https://www.youtube.com/@CarolineHirons", description: "Skincare expert and industry veteran - honest product reviews and career advice in the beauty sector." },
  ],
  cars: [
    { name: "Autocar", url: "https://www.youtube.com/@Autocar", description: "The UK's oldest car magazine - reviews, industry news, and what's driving the automotive market." },
    { name: "Fully Charged Show", url: "https://www.youtube.com/@fullychargedshow", description: "Electric vehicles and clean energy - the future of transport and automotive careers." },
    { name: "Car Throttle", url: "https://www.youtube.com/@CarThrottle", description: "Car culture, engineering explainers, and the business side of the automotive world." },
  ],
  fashion: [
    { name: "Fashion Retail Academy", url: "https://www.youtube.com/@fashionretailacademy", description: "Industry-backed careers content - buying, merchandising, visual merchandising, and breaking into fashion business." },
    { name: "The Business of Fashion", url: "https://www.youtube.com/@businessoffashion", description: "CEO interviews, brand strategy, and deep dives into how the global fashion industry operates." },
    { name: "Bliss Foster", url: "https://www.youtube.com/@blissfoster", description: "Day-in-the-life vlogs, career advice, and behind-the-scenes of working in the fashion industry." },
    { name: "Highsnobiety", url: "https://www.youtube.com/@Highsnobiety", description: "Fashion business culture - brand profiles, industry trends, and what it takes to work in streetwear and luxury." },
  ],
  beer: [
    { name: "The Craft Beer Channel", url: "https://www.youtube.com/@TheCraftBeerChannel", description: "Brewery tours, beer education, and industry interviews from the UK's leading beer YouTube channel." },
    { name: "Beer Sommelier", url: "https://www.youtube.com/@BeerSommelierUK", description: "Tasting guides, food pairings, and careers in beer - from a certified beer sommelier." },
  ],
  coffee: [
    { name: "European Coffee Trip", url: "https://www.youtube.com/@europeancoffeetrip", description: "Café business profiles, barista career stories, and the business of speciality coffee across Europe." },
    { name: "The Girl in the Cafe", url: "https://www.youtube.com/@thegirlinthecafe", description: "Coffee Portraits series - interviews with roasters, café owners, and people building careers in the UK coffee industry." },
  ],
  cinema: [
    { name: "BFI", url: "https://www.youtube.com/@BritishFilmInstitute", description: "The British Film Institute - career pathways, Film Academy insights, and how to break into the UK film industry." },
    { name: "Into Film", url: "https://www.youtube.com/@IntoFilm", description: "Screen industry careers education - roles explained, career pathways, and industry professional interviews." },
    { name: "ScreenSkills", url: "https://www.youtube.com/@ScreenSkills", description: "The UK's official screen industries skills body - training, career guides, and routes into film and TV work." },
  ],
  music: [
    { name: "Point Blank Music School", url: "https://www.youtube.com/@pointblankmusicschool", description: "London music school covering careers in production, sound engineering, and the music business." },
    { name: "BIMM University", url: "https://www.youtube.com/@BIMMUniversity", description: "Music industry career advice, graduate stories, and insights into working in the music business." },
  ],
  football: [
    { name: "UCFB", url: "https://www.youtube.com/@UCFB", description: "The UK's football business university - degree insights, industry events, and careers in football management." },
    { name: "Tifo Football", url: "https://www.youtube.com/@Tifo", description: "Explainers on club finances, transfers, ownership, and the business side of professional football." },
    { name: "The Athletic FC", url: "https://www.youtube.com/@TheAthleticFC", description: "In-depth football journalism - industry analysis, behind-the-scenes operations, and club business stories." },
    { name: "Football Benchmark", url: "https://www.youtube.com/@FootballBenchmark", description: "Data and analytics on football club valuations, finances, and the business of the sport." },
  ],
  "interior design": [
    { name: "KLC School of Design", url: "https://www.youtube.com/@KLCDesign", description: "London's leading interior design school - career advice, student stories, and what it takes to work in design." },
    { name: "BIID", url: "https://www.youtube.com/@BIID", description: "The British Institute of Interior Design - CPD, industry standards, and professional development." },
    { name: "Architectural Digest", url: "https://www.youtube.com/@archdigest", description: "Behind-the-scenes with designers, studio tours, and how top interior design professionals build their careers." },
  ],
  teaching: [
    { name: "Get Into Teaching", url: "https://www.youtube.com/@getintoteaching", description: "Official DfE channel - routes into teaching, trainee stories, and what it's really like working in education." },
    { name: "Teach First", url: "https://www.youtube.com/@TeachFirst", description: "Stories from graduates and career changers building careers in teaching across the UK." },
    { name: "TES", url: "https://www.youtube.com/@TES", description: "Career development, CPD, and education sector news for teachers and school leaders." },
  ],
  bakery: [
    { name: "Le Cordon Bleu", url: "https://www.youtube.com/@lecordonbleu", description: "Professional bakery and patisserie career training - industry insights from one of the world's top culinary schools." },
    { name: "Craft Bakers Association", url: "https://www.youtube.com/@CraftBakersAssociation", description: "UK bakery industry body - business advice, apprenticeships, and careers in artisan baking." },
    { name: "British Bakers", url: "https://www.youtube.com/@BritishBakers", description: "UK baking industry careers - working in commercial bakeries, apprenticeships, and industry career paths." },
  ],
  charity: [
    { name: "CharityComms", url: "https://www.youtube.com/@CharityComms", description: "Careers in charity communications - campaigns, digital strategy, and building a nonprofit career." },
    { name: "NCVO", url: "https://www.youtube.com/@NCVO", description: "The National Council for Voluntary Organisations - sector insights, leadership, and careers in the charity sector." },
    { name: "Charity Digital", url: "https://www.youtube.com/@CharityDigital", description: "Digital careers and transformation in the charity sector - skills, tools, and working in nonprofit tech." },
    { name: "Third Sector", url: "https://www.youtube.com/@ThirdSectorMag", description: "News and careers coverage for people working in and wanting to join the UK charity and voluntary sector." },
  ],
  footwear: [
    { name: "The Sole Supplier", url: "https://www.youtube.com/@theSoleSupplier", description: "The business of sneaker retail - brand launches, industry trends, and footwear market analysis." },
    { name: "Yellowbrick Learning", url: "https://www.youtube.com/@yellowbrick", description: "Careers in the sneaker industry - roles at Nike, Foot Locker, and Adidas explained by industry insiders." },
    { name: "Highsnobiety", url: "https://www.youtube.com/@Highsnobiety", description: "Brand business profiles, industry culture, and career stories across footwear and streetwear." },
  ],
  "formula-1": [
    { name: "Chain Bear", url: "https://www.youtube.com/@chainbear", description: "Brilliant animated explainers on F1 strategy, engineering and regulations - the best career-adjacent F1 education channel." },
    { name: "The Race", url: "https://www.youtube.com/@TheRace", description: "Former F1 engineers and journalists unpacking team strategy, technical regulations and the business of motorsport." },
    { name: "Driver61", url: "https://www.youtube.com/@Driver61", description: "Racing driver and engineer explaining F1 car physics, driving techniques and how teams gain tenths." },
  ],
  wellness: [
    { name: "NASM", url: "https://www.youtube.com/@NASM", description: "Career pathways in fitness and wellness - certification guides, industry trends, and professional development." },
    { name: "Les Mills", url: "https://www.youtube.com/@LesMills", description: "Global fitness brand - careers in group fitness, instructor training, and the business of wellness." },
    { name: "Premier Global", url: "https://www.youtube.com/@PremierGlobal", description: "UK fitness education provider - personal training careers, qualifications, and industry career advice." },
  ],
  grocery: [
    { name: "IGD", url: "https://www.youtube.com/@IGDonline", description: "Grocery industry insights - supply chain innovation, retail trends, and careers in food retail." },
    { name: "Retail Week", url: "https://www.youtube.com/@RetailWeek", description: "UK retail sector news - leadership interviews, business strategy, and career insights across grocery and retail." },
    { name: "Retail Gazette", url: "https://www.youtube.com/@RetailGazette", description: "Retail industry careers and business news - who's hiring, company strategies, and sector analysis." },
  ],
  "estate agency": [
    { name: "Property Tribes", url: "https://www.youtube.com/@PropertyTribes", description: "UK property industry careers - estate agency tips, business building, and working in the property sector." },
    { name: "Mr Carrington", url: "https://www.youtube.com/@MrCarrington", description: "Estate agency career advice - day in the life, earning potential, and building a career in property sales." },
    { name: "Savills", url: "https://www.youtube.com/@Savills", description: "Global property company - graduate programmes, career stories, and what it's like working in real estate." },
    { name: "Knight Frank", url: "https://www.youtube.com/@KnightFrank", description: "International property consultancy - career insights, market analysis, and working in commercial real estate." },
  ],
  "food & drink": [
    { name: "UKHospitality", url: "https://www.youtube.com/@UKHospitality", description: "The UK's hospitality trade body - industry careers, business strategy, and sector advocacy." },
    { name: "Institute of Hospitality", url: "https://www.youtube.com/@IOH", description: "Professional body for hospitality careers - CPD, leadership, and career development in food and drink." },
  ],
  physiotherapy: [
    { name: "Chartered Society of Physiotherapy", url: "https://www.youtube.com/@theCSP", description: "The CSP's official channel - career pathways, CPD, and what it's like working as a physiotherapist in the UK." },
    { name: "Physiotutors", url: "https://www.youtube.com/@Physiotutors", description: "Evidence-based physiotherapy education - clinical skills, career development, and working in the profession." },
    { name: "Physiotherapy in UK", url: "https://www.youtube.com/@PhysiotherapyinUK", description: "Career guidance for physiotherapists - HCPC registration, NHS roles, and building a physio career in the UK." },
  ],
  psychotherapy: [
    { name: "BACP", url: "https://www.youtube.com/@BACP", description: "The British Association for Counselling and Psychotherapy - career development, accreditation, and therapist stories." },
    { name: "Counselling Tutor", url: "https://www.youtube.com/@CounsellingTutor", description: "Training to become a counsellor or psychotherapist - course advice, career paths, and working in therapy." },
    { name: "A Bunch of Therapists", url: "https://www.youtube.com/@abunchoftherapists", description: "Therapists sharing career journeys, industry insights, and the realities of working in mental health." },
  ],
  gaming: [
    { name: "GDC", url: "https://www.youtube.com/@GDC_channel", description: "Game Developers Conference - talks, postmortems, and career advice from top game industry professionals." },
    { name: "UKIE", url: "https://www.youtube.com/@Ukie", description: "The UK's games industry trade body - policy, careers, and what it takes to work in British games." },
    { name: "Noclip", url: "https://www.youtube.com/@Noclip", description: "Crowdfunded gaming documentaries - studio tours, developer stories, and behind-the-scenes of game development." },
    { name: "Game Maker's Toolkit", url: "https://www.youtube.com/@GMTK", description: "In-depth analysis of game design - mechanics, level design, and what makes great games tick." },
  ],
  journalism: [
    { name: "Reuters", url: "https://www.youtube.com/@Reuters", description: "Global wire service - breaking news, investigative reporting, and how a world-class newsroom operates." },
    { name: "Press Gazette", url: "https://www.youtube.com/@PressGazette", description: "UK media industry intelligence - publisher strategies, career advice, and the business of journalism." },
    { name: "The Cardiffian (Cardiff Journalism)", url: "https://www.youtube.com/@cardiffian", description: "Video journalism from trainees on Cardiff University's News Journalism MA - one of the UK's top journalism schools." },
    { name: "BBC News", url: "https://www.youtube.com/@BBCNews", description: "The BBC's flagship news channel - broadcast journalism, reporting craft and how a world-class newsroom operates." },
    { name: "The Media Club", url: "https://www.youtube.com/playlist?list=PL9Et_mmyZQMZKTESM8Ylb06C_rU5C0y1S", description: "Matt Deegan's long-running media industry interviews - radio, TV, podcasts, and the business of content." },
  ],
  jewellery: [
    { name: "GIA (Gemological Institute of America)", url: "https://www.youtube.com/@GemologicalInstituteofAmerica", description: "The world's leading gemmological institution - diamond grading, coloured stones, and jewellery careers." },
    { name: "The Goldsmiths' Centre", url: "https://www.youtube.com/@TheGoldsmithsCentre", description: "London's home of jewellery and silversmithing training - bench skills, apprenticeships and craft careers." },
    { name: "Goldsmith's Company", url: "https://www.youtube.com/@thegoldsmithscompany", description: "Hallmarking authority and craft patron - industry events, apprenticeships, and the future of British goldsmithing." },
  ],
  influencing: [
    { name: "Colin and Samir", url: "https://www.youtube.com/@ColinandSamir", description: "The definitive show on the creator economy - interviews with the biggest YouTubers, platform leaders and creator businesses." },
    { name: "Creator Science (Jay Clouse)", url: "https://www.youtube.com/@CreatorScience", description: "Tactical, evidence-based videos on growing an audience, monetisation and creator businesses." },
    { name: "Roberto Blake", url: "https://www.youtube.com/@RobertoBlake", description: "Long-running creator-business channel - YouTube strategy, AdSense, sponsorships and the realities of going full-time." },
    { name: "Ali Abdaal", url: "https://www.youtube.com/@AliAbdaal", description: "Cambridge doctor turned 5M-subscriber creator - productivity, monetisation, and how he built a creator business." },
    { name: "Pat Flynn", url: "https://www.youtube.com/@PatFlynn", description: "Smart Passive Income founder - podcasts, courses, newsletters and the long arc of a creator career." },
    { name: "Think Media", url: "https://www.youtube.com/@thinkmedia", description: "YouTube growth tactics, gear and creator-business advice - go-to channel for aspiring full-time YouTubers." },
    { name: "Influencer Marketing Hub", url: "https://www.youtube.com/@influencermarketinghub", description: "Industry insight on influencer campaigns, platform updates, and the brand-creator economy from the leading research site." },
  ],
  pets: [
    { name: "The Royal Veterinary College", url: "https://www.youtube.com/@royalvetcollege", description: "The UK's leading vet school - career insights, student life, and what working in veterinary practice looks like." },
    { name: "Pets at Home", url: "https://www.youtube.com/@PetsatHome", description: "The UK's largest pet retailer - pet care advice, career stories, and behind-the-scenes of the pet industry." },
    { name: "BVNA", url: "https://www.youtube.com/@BVNA", description: "British Veterinary Nursing Association - career development, CPD, and what it means to be a veterinary nurse." },
  ],
  health: [
    { name: "NHS England", url: "https://www.youtube.com/thenhsengland", description: "The official NHS England channel - workforce stories, careers and how the health service works." },
    { name: "NHS Health Careers", url: "https://www.youtube.com/NHSCareers", description: "NHS Health Careers - over 350 career profiles across medicine, nursing, allied health and support roles." },
    { name: "Royal College of Nursing", url: "https://www.youtube.com/user/RCNonline", description: "The UK's largest nursing union - career development, professional issues and member stories." },
    { name: "The BMJ", url: "https://www.youtube.com/c/TheBMJ", description: "British Medical Journal - clinical research, doctor interviews and the politics of UK healthcare." },
  ],
  farming: [
    { name: "AHDB", url: "https://www.youtube.com/@AHDB", description: "Agriculture and Horticulture Development Board - practical business advice and market insight for UK farmers." },
    { name: "Farmers Weekly", url: "https://www.youtube.com/@FarmersWeekly", description: "The UK's leading farming title - machinery reviews, farm visits and business analysis." },
    { name: "Tom Pemberton Farm Life", url: "https://www.youtube.com/@TomPembertonFarmLife", description: "Lancashire dairy farmer documenting daily life on a working British farm - over 600k subscribers." },
    { name: "Olly's Farm", url: "https://www.youtube.com/@OllysFarm", description: "Norfolk farmer Olly documenting honest, unfiltered modern British farming - arable, pigs and machinery." },
  ],
  money: [
    { name: "Bloomberg Originals", url: "https://www.youtube.com/@bloombergoriginals", description: "Bloomberg's documentary channel - markets, banking, fintech and the people running global finance." },
    { name: "Financial Times", url: "https://www.youtube.com/@FinancialTimes", description: "The FT's video journalism - markets, banking, economics and careers in financial services." },
    { name: "CFA Institute", url: "https://www.youtube.com/@CFAInstitute", description: "The global body for investment professionals - career guidance, CFA exam prep and industry talks." },
    { name: "Patrick Boyle", url: "https://www.youtube.com/@PBoyle", description: "Former hedge-fund manager and finance professor explaining markets, banking and capital with rare clarity." },
  ],
  "horse-racing": [
    { name: "Racing TV", url: "https://www.youtube.com/@RacingTV", description: "The official channel of British and Irish racing - race replays, interviews and behind-the-scenes content." },
    { name: "Racing Post", url: "https://www.youtube.com/@RacingPostOfficial", description: "The UK's racing daily - previews, tipping, big-race analysis and rider interviews." },
    { name: "British Horseracing Authority", url: "https://www.youtube.com/channel/UCK1gjz98T5f6ZxNhRrf63bQ", description: "The BHA's official channel - governance, integrity, careers and behind-the-scenes from British racing's regulator." },
    { name: "Careers in Racing", url: "https://www.youtube.com/@CareersinRacing", description: "British racing's careers hub - role profiles, training routes and day-in-the-life from across the sport." },
  ],
};

export const tiktokByIndustry: Record<string, TikTokCreator[]> = {
  beauty: [
    { name: "Robert Welsh", handle: "robertwelsh", url: "https://www.tiktok.com/@robertwelsh", description: "Pro makeup artist sharing techniques, product reviews, and what working in the beauty industry looks like." },
    { name: "Skincare by Hyram", handle: "hyram", url: "https://www.tiktok.com/@hyram", description: "Skincare education and beauty industry analysis - ingredients, brand strategies, and career insights." },
  ],
  cars: [
    { name: "Car Throttle", handle: "carthrottle", url: "https://www.tiktok.com/@carthrottle", description: "Automotive culture, engineering breakdowns, and behind-the-scenes of the car industry." },
    { name: "Electric Viking", handle: "electricviking", url: "https://www.tiktok.com/@electricviking", description: "EV industry news, brand strategies, and the business of electric vehicles." },
  ],
  fashion: [
    { name: "Aimee Smale", handle: "aimeesmalex", url: "https://www.tiktok.com/@aimeesmalex", description: "Founder of Odd Muse London - building a fashion brand from scratch, design decisions and the business of fashion." },
    { name: "Fashion Roadman", handle: "fashionroadman", url: "https://www.tiktok.com/@fashionroadman", description: "Fashion industry commentary - brand strategies, business breakdowns, and career insights into luxury and streetwear." },
  ],
  coffee: [
    { name: "Morgan Eckroth", handle: "morgandrinkscoffee", url: "https://www.tiktok.com/@morgandrinkscoffee", description: "US Barista Champion sharing barista skills, latte art, and what a career in speciality coffee looks like." },
    { name: "James Hoffmann", handle: "jameshoffmanncoffee", url: "https://www.tiktok.com/@jameshoffmanncoffee", description: "World Barista Champion - coffee science, brewing technique and the speciality coffee industry explained." },
  ],
  beer: [
    { name: "Craft Beer Channel", handle: "craftbeerchannel", url: "https://www.tiktok.com/@craftbeerchannel", description: "UK craft beer reviews, brewery visits, and honest takes on the beer industry." },
    { name: "Beer Aficionado", handle: "beeraficionado", url: "https://www.tiktok.com/@beeraficionado", description: "Brewery tours, beer business insights, and behind-the-scenes of the craft beer scene." },
  ],
  cinema: [
    { name: "Film Fatale NYC", handle: "filmfatale_nyc", url: "https://www.tiktok.com/@filmfatale_nyc", description: "Film industry career tips, networking advice, and breaking into the entertainment business." },
  ],
  music: [
    { name: "Just Shauny", handle: "itsjustshauny", url: "https://www.tiktok.com/@itsjustshauny", description: "Music industry insider - marketing tips, label scams to avoid, and how independent artists actually build careers." },
  ],
  football: [
    { name: "Luke Chadwick", handle: "_lukechadwick", url: "https://www.tiktok.com/@_lukechadwick", description: "Ex-Man United professional footballer turned business owner - sharing football career insights and industry life." },
    { name: "Jacques Slade", handle: "kustoo", url: "https://www.tiktok.com/@kustoo", description: "Sports and sneaker industry insider - brand strategies, football business, and behind-the-scenes content." },
  ],
  "interior design": [
    { name: "Sophie Paterson", handle: "sophiepatersoninteriors", url: "https://www.tiktok.com/@sophiepatersoninteriors", description: "Luxury interior designer sharing project walkthroughs, business tips, and career advice in design." },
    { name: "Medina Grillo", handle: "grillodesigns", url: "https://www.tiktok.com/@grillodesigns", description: "Interior styling on a budget - day-in-the-life of a freelance interior stylist and content creator." },
  ],
  teaching: [
    { name: "Mr P Techies", handle: "mrptechies", url: "https://www.tiktok.com/@mrptechies", description: "UK teacher sharing classroom tips, edtech and the realities of working in education." },
    { name: "Hannah Kettle Maths", handle: "hannahkettlemaths", url: "https://www.tiktok.com/@hannahkettlemaths", description: "QTS Maths teacher and Head of Maths with 280k+ followers - revision lessons and life as a UK secondary teacher." },
  ],
  bakery: [
    { name: "Bake with Jack", handle: "bakewithjack", url: "https://www.tiktok.com/@bakewithjack", description: "Professional baker sharing bread-making skills, bakery business tips, and the craft of artisan baking." },
  ],
  charity: [
    { name: "UNICEF", handle: "unicef", url: "https://www.tiktok.com/@unicef", description: "Global nonprofit sharing campaigns, advocacy, and mission-led storytelling that shows how charity-sector communications works at scale." },
    { name: "British Red Cross", handle: "britishredcross", url: "https://www.tiktok.com/@britishredcross", description: "Trusted humanitarian charity sharing real campaign work, volunteering, emergency response, and public engagement content." },
  ],
  footwear: [
    { name: "Jacques Slade", handle: "kustoo", url: "https://www.tiktok.com/@kustoo", description: "Sneaker industry insider - brand strategies, new releases, and the business behind the footwear industry." },
    { name: "Sneaker News", handle: "sneakernews", url: "https://www.tiktok.com/@sneakernews", description: "The biggest sneaker news account - releases, brand strategies, and industry trends across Nike, Adidas, and more." },
  ],
  "formula-1": [
    { name: "F1", handle: "f1", url: "https://www.tiktok.com/@f1", description: "Official Formula 1 account - behind-the-scenes paddock access, team content and race highlights." },
    { name: "McLaren", handle: "mclaren", url: "https://www.tiktok.com/@mclaren", description: "McLaren Racing's official TikTok - factory tours, driver content and what life inside an F1 team looks like." },
    { name: "Mercedes-AMG F1", handle: "mercedesamgf1", url: "https://www.tiktok.com/@mercedesamgf1", description: "Mercedes F1 team - engineering explainers, race-week content and Brackley factory behind-the-scenes." },
  ],
  wellness: [
    { name: "Gymshark", handle: "gymshark", url: "https://www.tiktok.com/@gymshark", description: "Leading fitness brand - workout culture, athlete stories, and what it's like to work in the wellness industry." },
  ],
  grocery: [
    { name: "Gymshark", handle: "gymshark", url: "https://www.tiktok.com/@gymshark", description: "Major UK retail brand on TikTok - supply chain, retail operations and behind-the-scenes of consumer goods." },
  ],
  "estate agency": [
    { name: "Myles Property", handle: "mylesproperty", url: "https://www.tiktok.com/@mylesproperty", description: "UK estate agent sharing day-in-the-life content, property viewings, and how to build a career in the property industry." },
  ],
  "estate-agency": [
    { name: "Myles Property", handle: "mylesproperty", url: "https://www.tiktok.com/@mylesproperty", description: "UK estate agent sharing day-in-the-life content, property viewings, and how to build a career in the property industry." },
  ],
  physiotherapy: [
    { name: "Dr Claire Physio", handle: "dr.claire_physio", url: "https://www.tiktok.com/@dr.claire_physio", description: "Doctor of Physical Therapy sharing clinical insights, career advice, and what working in physiotherapy looks like." },
    { name: "Doctor Jacob", handle: "doctorjacob", url: "https://www.tiktok.com/@doctorjacob", description: "Physiotherapist sharing movement science, rehab tips, and career insights from working in the profession." },
  ],
  psychotherapy: [
    { name: "Dr Kirren", handle: "drkirren", url: "https://www.tiktok.com/@drkirren", description: "Clinical psychologist with 600K+ followers sharing mental health insights, therapy career advice, and what working in psychology looks like." },
  ],
  hospitality: [
    { name: "Thomas Straker", handle: "thomas_straker", url: "https://www.tiktok.com/@thomas_straker", description: "Professional chef and TikTok sensation with 2.5M followers - restaurant life, cooking career, and the hospitality industry." },
  ],
  "interior-design": [
    { name: "Sophie Paterson", handle: "sophiepatersoninteriors", url: "https://www.tiktok.com/@sophiepatersoninteriors", description: "Luxury interior designer sharing project walkthroughs, business tips, and career advice in design." },
    { name: "Medina Grillo", handle: "grillodesigns", url: "https://www.tiktok.com/@grillodesigns", description: "Interior styling on a budget - day-in-the-life of a freelance interior stylist and content creator." },
  ],
  gaming: [
    { name: "People Make Games", handle: "peoplemakegames", url: "https://www.tiktok.com/@peoplemakegames", description: "Investigative gaming journalism - exposing industry practices and telling the stories of the people who make games." },
    { name: "Ask Gamedev", handle: "askgamedev", url: "https://www.tiktok.com/@askgamedev", description: "Game industry career advice - how to get hired, what studios look for, and life as a game developer." },
    { name: "Game Dev Unlocked", handle: "gamedevunlocked", url: "https://www.tiktok.com/@gamedevunlocked", description: "Game development career tips - portfolios, interviews, and breaking into the industry." },
  ],
  journalism: [
    { name: "Hanna Gets Hired", handle: "hannagetshired", url: "https://www.tiktok.com/@hannagetshired", description: "Career and job-search advice - CV tips, interview prep and breaking into competitive industries like media." },
    { name: "Jackson's Tips", handle: "jacksonstips", url: "https://www.tiktok.com/@jacksonstips", description: "Practical career and workplace tips - useful watching for anyone navigating early newsroom or office life." },
    { name: "NCTJ", handle: "nctj_news", url: "https://www.tiktok.com/@nctj_news", description: "The UK's journalism training body - behind-the-scenes of journalism qualifications, career tips, and industry events." },
    { name: "Journo Resources", handle: "journoresources", url: "https://www.tiktok.com/@journoresources", description: "Practical tips and resources for aspiring and early-career journalists - job advice, skills, and industry insights." },
  ],
  jewellery: [
    { name: "The Cut Price Jewellers", handle: "thecutpricejewellers", url: "https://www.tiktok.com/@thecutpricejewellers", description: "Family-run Dublin jewellers sharing the day-to-day of running a high-street jewellery shop." },
    { name: "Jessica Diamond", handle: "jessicadiamond", url: "https://www.tiktok.com/@jessicadiamond", description: "Engagement ring advice and diamond education - helping buyers make informed jewellery decisions." },
  ],
  influencing: [
    { name: "Colin & Samir", handle: "colinandsamir", url: "https://www.tiktok.com/@colinandsamir", description: "The duo behind the creator economy's flagship show - quick takes on creator deals, platform shifts and industry strategy." },
    { name: "Jay Clouse", handle: "jayclouse", url: "https://www.tiktok.com/@jayclouse", description: "Creator Science host - tactical, evidence-based clips on building a creator business and audience growth." },
    { name: "Modern Millie", handle: "modernmillie", url: "https://www.tiktok.com/@modernmillie", description: "Creator-business educator - turning hobbies into income, platform monetisation and full-time creator life." },
    { name: "Whalar", handle: "whalarhq", url: "https://www.tiktok.com/@whalarhq", description: "Inside-the-agency content from the global creator company - campaign work, talent stories and creator-economy news." },
    { name: "Dan Koe", handle: "itsdankoe", url: "https://www.tiktok.com/@itsdankoe", description: "Solopreneur and one-person business educator - millions of views on building digital products as a creator." },
  ],
  pets: [
    { name: "Vet1", handle: "vet1_", url: "https://www.tiktok.com/@vet1_", description: "Veterinary educator sharing clinical cases, anaesthesia tips and what it's like working in veterinary practice." },
  ],
  health: [
    { name: "Dr Karan Rajan", handle: "dr.karanr", url: "https://www.tiktok.com/@dr.karanr", description: "NHS surgeon with millions of followers explaining medical science and the realities of working in the NHS." },
    { name: "Dr Sooj", handle: "doctorsooj", url: "https://www.tiktok.com/@doctorsooj", description: "NHS GP sharing day-in-the-life content, career advice for medics and demystifying primary care." },
    { name: "The NHS", handle: "nhs.england", url: "https://www.tiktok.com/@nhs.england", description: "The official NHS account - workforce stories, career routes and a behind-the-scenes look at the health service." },
  ],
  farming: [
    { name: "Farmer Will", handle: "farmerwill_", url: "https://www.tiktok.com/@farmerwill_", description: "British farmer sharing rural life, harvest, and what working in modern UK farming actually looks like." },
  ],
  money: [
    { name: "Damien Talks Money", handle: "damien_talks_money", url: "https://www.tiktok.com/@damien_talks_money", description: "UK personal finance creator covering investing, ISAs, pensions and how the financial services industry works." },
    { name: "Vivian Tu (Your Rich BFF)", handle: "yourrichbff", url: "https://www.tiktok.com/@yourrichbff", description: "Ex-JP Morgan trader breaking down finance careers, salary negotiation and life inside investment banks." },
    { name: "Toby Newbatt", handle: "tobynewbatt", url: "https://www.tiktok.com/@tobynewbatt", description: "UK investing creator covering markets, index funds and the world of personal finance." },
  ],
  "horse-racing": [
    { name: "Racing TV", handle: "racing_tv", url: "https://www.tiktok.com/@racing_tv", description: "British and Irish racing's official broadcaster - clips, interviews and best moments from the racecourse." },
    { name: "Racing Post", handle: "racingpost", url: "https://www.tiktok.com/@racingpost", description: "The UK's racing daily on TikTok - big-race highlights, tipping content and stable-yard moments." },
    { name: "Great British Racing", handle: "greatbritishracing", url: "https://www.tiktok.com/@greatbritishracing", description: "Behind the scenes at British racecourses - Royal Ascot, Cheltenham, jockeys, trainers and stable staff." },
  ],
};

export const coursesByIndustry: Record<string, Course[]> = {
  beauty: [
    { title: "Cosmetic Science", provider: "Society of Cosmetic Scientists", url: "https://www.scs.org.uk/", description: "Professional courses in cosmetic formulation, regulatory affairs, and product development.", free: false },
    { title: "VTCT / ITEC Beauty Therapy Diplomas", provider: "VTCT", url: "https://www.vtct.org.uk/", description: "Industry-standard UK beauty therapy qualifications from Level 2 to Level 4.", free: false },
    { title: "Fashion & Beauty Management", provider: "Condé Nast College", url: "https://www.condenastcollege.co.uk/", description: "Short courses and diplomas in fashion and beauty business from the Condé Nast brand.", free: false },
    { title: "British Beauty Council Resources", provider: "British Beauty Council", url: "https://britishbeautycouncil.com/", description: "Industry reports, career guides, and professional development for the UK beauty sector.", free: true },
  ],
  cars: [
    { title: "IMI Automotive Qualifications", provider: "Institute of the Motor Industry", url: "https://www.theimi.org.uk/", description: "Industry-standard automotive qualifications from Level 1 to Master Technician.", free: false },
    { title: "Automotive Engineering", provider: "Coursera / University of Leeds", url: "https://www.coursera.org/learn/automotive-engineering", description: "Introduction to vehicle engineering, design, and manufacturing processes.", free: true },
    { title: "Electric Vehicle Technology", provider: "City & Guilds", url: "https://www.cityandguilds.com/", description: "EV-specific qualifications covering high-voltage systems, battery tech, and charging.", free: false },
    { title: "Automotive Management", provider: "Loughborough University", url: "https://www.lboro.ac.uk/", description: "MSc in automotive engineering and management from one of the UK's top engineering universities.", free: false },
  ],
  bakery: [
    { title: "Professional Bakery Diploma", provider: "Le Cordon Bleu", url: "https://www.cordonbleu.edu/london/en", description: "World-renowned professional bakery training from one of the top culinary schools.", free: false },
    { title: "Baking School Classes", provider: "King Arthur Baking", url: "https://www.kingarthurbaking.com/baking-school", description: "Hands-on and virtual baking classes from beginner to advanced levels.", free: false },
    { title: "Patisserie & Confectionery", provider: "City & Guilds", url: "https://www.cityandguilds.com/", description: "Industry-standard UK bakery qualifications from Level 1 to Level 3.", free: false },
    { title: "Food Science & Nutrition", provider: "Open University", url: "https://www.open.ac.uk/courses/science", description: "Understand the science behind food production, nutrition, and processing.", free: false },
  ],
  beer: [
    { title: "General Certificate in Brewing", provider: "Institute of Brewing & Distilling", url: "https://www.ibd.org.uk/", description: "The gold-standard qualification for aspiring brewers - covers raw materials, process, and quality.", free: false },
    { title: "Beer & Cider Academy Courses", provider: "Beer & Cider Academy", url: "https://www.beeracademy.co.uk/", description: "Beer sommelier training, tasting courses, and professional development for the drinks trade.", free: false },
    { title: "Brewing Science & Technology", provider: "Heriot-Watt University", url: "https://www.hw.ac.uk/", description: "MSc in Brewing & Distilling from one of the world's leading programmes.", free: false },
    { title: "Cicerone Certification", provider: "Cicerone", url: "https://www.cicerone.org/", description: "Professional beer server and sommelier certification - the beer world's equivalent of a wine sommelier.", free: false },
  ],
  charity: [
    { title: "Chartered Institute of Fundraising Training", provider: "CIOF", url: "https://ciof.org.uk/", description: "Professional development courses for charity fundraisers at all levels.", free: false },
    { title: "NCVO Learning & Support", provider: "NCVO", url: "https://www.ncvo.org.uk/", description: "Learn how the charity sector works and how to build a career within it.", free: true },
    { title: "Social Enterprise & Nonprofit", provider: "Coursera / Wharton", url: "https://www.coursera.org/learn/wharton-social-entrepreneurship", description: "University-backed course covering strategy and management in social enterprises.", free: true },
    { title: "The Charity School", provider: "Cranfield Trust", url: "https://www.cranfieldtrust.org/", description: "Free management support and skills training for charity leaders.", free: true },
  ],
  cinema: [
    { title: "Filmmaking Specialisation", provider: "Coursera / Michigan State", url: "https://www.coursera.org/specializations/filmmaking", description: "Full filmmaking journey from screenwriting to post-production.", free: true },
    { title: "BFI Film Academy", provider: "BFI", url: "https://www.bfi.org.uk/bfi-film-academy", description: "Prestigious programme for 16-25 year olds aspiring to careers in film.", free: true },
    { title: "Screenwriting Fundamentals", provider: "BBC Maestro", url: "https://www.bbcmaestro.com/", description: "Learn screenwriting from top industry professionals.", free: false },
    { title: "Short Courses", provider: "National Film & Television School", url: "https://nfts.co.uk/short-courses", description: "Short courses from the UK's leading film school.", free: false },
    { title: "ScreenSkills", provider: "ScreenSkills", url: "https://www.screenskills.com/", description: "The UK's industry-led skills body for film, TV, VFX, and animation - career guides, training, and bursaries.", free: true },
    { title: "Ant & Dec - Making It in Media", provider: "The King's Trust", url: "https://www.kingstrust.org.uk/how-we-can-help/programmes/ant-and-dec-making-it-in-media", description: "Free King's Trust programme for 16–30s - masterclasses, mentoring and routes into TV, film and media careers.", free: true },
  ],
  coffee: [
    { title: "SCA Coffee Skills Programme", provider: "Speciality Coffee Association", url: "https://sca.coffee/education/coffee-skills-program", description: "Industry-standard certification covering brewing, roasting, sensory skills, and green coffee.", free: false },
    { title: "Barista Hustle Online Courses", provider: "Barista Hustle", url: "https://www.baristahustle.com/courses/", description: "Online courses for baristas covering milk science, water chemistry, and espresso.", free: false },
    { title: "Coffee: From Plant to Cup", provider: "edX / Wageningen", url: "https://www.edx.org/learn/food-science", description: "Understand the science behind growing, roasting, and brewing coffee.", free: true },
    { title: "London School of Coffee", provider: "London School of Coffee", url: "https://www.londonschoolofcoffee.com/", description: "Professional barista and roasting training in central London.", free: false },
  ],
  "estate agency": [
    { title: "Propertymark Qualifications", provider: "Propertymark", url: "https://www.propertymark.co.uk/", description: "UK industry-standard estate agency qualifications.", free: false },
    { title: "Estate Agent Diploma", provider: "Open Study College", url: "https://www.openstudycollege.com/", description: "Covers valuations, sales progression, lettings, and property law.", free: false },
    { title: "Real Estate Management", provider: "RICS", url: "https://www.rics.org/training", description: "Professional development courses for property professionals.", free: false },
    { title: "Property Development Fundamentals", provider: "Alison", url: "https://alison.com/course/diploma-in-real-estate", description: "Free online course covering planning, financing, and managing property projects.", free: true },
  ],
  fashion: [
    { title: "Fashion as Design", provider: "Coursera / MoMA", url: "https://www.coursera.org/learn/fashion-design", description: "Explore fashion through the lens of design, materials, and cultural impact.", free: true },
    { title: "London College of Fashion Short Courses", provider: "UAL", url: "https://www.arts.ac.uk/colleges/london-college-of-fashion/", description: "Short courses in fashion buying, merchandising, and brand management.", free: false },
    { title: "Sustainable Fashion", provider: "Centre for Sustainable Fashion", url: "https://www.sustainable-fashion.com/", description: "Learn about circular fashion, ethical supply chains, and sustainable design.", free: true },
    { title: "Fashion Retail Academy", provider: "Fashion Retail Academy", url: "https://www.fashionretailacademy.ac.uk/", description: "Industry-backed courses in buying, merchandising, marketing, and visual merchandising.", free: false },
    { title: "FashionUnited Career Hub", provider: "FashionUnited", url: "https://fashionunited.uk/fashion-jobs", description: "The UK's leading fashion jobs board - career resources, employer profiles, and industry roles.", free: true },
  ],
  "food & drink": [
    { title: "Food Safety Level 2", provider: "Highfield", url: "https://www.highfieldqualifications.com/", description: "Essential certification for anyone working in food and drink.", free: false },
    { title: "WSET Wine & Spirit Education", provider: "WSET", url: "https://www.wsetglobal.com/qualifications/", description: "World-leading wine, spirits, and sake qualifications.", free: false },
    { title: "The Science of Gastronomy", provider: "Coursera / HKU", url: "https://www.coursera.org/learn/gastronomy", description: "Explore the science and culture behind what we eat and drink.", free: true },
    { title: "Hospitality Management", provider: "Open University", url: "https://www.open.ac.uk/", description: "Covers staffing, operations, and business management for hospitality.", free: false },
  ],
  football: [
    { title: "UCFB Football Business Degrees", provider: "UCFB", url: "https://www.ucfb.ac.uk/", description: "The UK's dedicated football university offering BA and MSc degrees at Wembley and Manchester campuses.", free: false },
    { title: "FA Coaching Courses", provider: "England Football Learning", url: "https://learn.englandfootball.com/courses", description: "Official pathway from grassroots coaching to professional management, run by the FA.", free: false },
    { title: "Football Industries MBA", provider: "University of Liverpool", url: "https://www.liverpool.ac.uk/study/postgraduate-taught/taught/football-industries-mba/overview/", description: "World-renowned MBA focused on the business of football - management, finance, and law.", free: false },
    { title: "StatsBomb Courses", provider: "StatsBomb / Hudl", url: "https://courses.statsbomb.com/", description: "Learn football data analytics from the industry leader in advanced match event data.", free: false },
    { title: "Sport Business & Innovation", provider: "Loughborough University", url: "https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/sport-business-and-innovation/", description: "MSc combining sport management with innovation - strong football industry connections.", free: false },
    { title: "Premier League Careers", provider: "Premier League", url: "https://careers.premierleague.com/", description: "Explore roles at the Premier League - football, broadcast, commercial, marketing, digital, finance, and legal.", free: true },
  ],
  footwear: [
    { title: "Footwear Design & Development", provider: "De Montfort University", url: "https://www.dmu.ac.uk/", description: "UK's leading footwear design degree - from concept to production.", free: false },
    { title: "Cordwainers at LCF", provider: "UAL / London College of Fashion", url: "https://www.arts.ac.uk/colleges/london-college-of-fashion/", description: "World-renowned footwear and accessories design courses at Cordwainers.", free: false },
    { title: "Fashion Supply Chain Management", provider: "edX", url: "https://www.edx.org/learn/supply-chain-management", description: "Understand the global supply chain from raw materials to retail.", free: true },
    { title: "SATRA Footwear Technology", provider: "SATRA", url: "https://www.satra.com/", description: "Technical training covering testing, materials, and manufacturing for the footwear industry.", free: false },
  ],
  "formula-1": [
    { title: "Motorsport Engineering", provider: "University of Oxford Brookes", url: "https://www.brookes.ac.uk/", description: "BSc/MSc Motorsport Engineering - one of the UK's top programmes in the heart of Motorsport Valley.", free: false },
    { title: "Motorsport Engineering & Management", provider: "Cranfield University", url: "https://www.cranfield.ac.uk/", description: "Advanced MSc blending vehicle dynamics, aerodynamics, and team management for the motorsport industry.", free: false },
    { title: "F1 Engineering Academy", provider: "National College for Motorsport", url: "https://www.ncm.ac.uk/", description: "UK apprenticeships and qualifications designed with F1 teams - from composite technicians to race engineers.", free: false },
    { title: "Introduction to Aerodynamics", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/16-100-aerodynamics-fall-2005/", description: "Free university-level aerodynamics course - foundational knowledge for F1 aero roles.", free: true },
  ],
  grocery: [
    { title: "IGD Training & Development", provider: "IGD", url: "https://www.igd.com/", description: "Industry-backed training for careers in grocery and retail.", free: false },
    { title: "Supply Chain Management", provider: "edX / MIT", url: "https://www.edx.org/learn/supply-chain-management", description: "Master the logistics and operations behind getting products to shelves.", free: true },
    { title: "Category Management", provider: "IGD", url: "https://www.igd.com/", description: "Learn how retailers and suppliers optimise product ranges and shelf space.", free: false },
    { title: "Retail Management", provider: "Open University", url: "https://www.open.ac.uk/", description: "From store operations to supply chains - the business of feeding millions.", free: false },
    { title: "Feeding Britain's Future", provider: "IGD", url: "https://www.igd.com/social-impact/people", description: "The UK food and drink industry's united movement - career inspiration, skills, and workforce development.", free: true },
  ],
  "interior design": [
    { title: "Interior Design", provider: "Coursera / CalArts", url: "https://www.coursera.org/learn/interior-design", description: "Foundational course covering space planning, colour theory, and materials.", free: true },
    { title: "KLC School of Design", provider: "KLC", url: "https://klc.co.uk/", description: "Renowned London school offering diplomas in interior design.", free: false },
    { title: "SketchUp for Interior Design", provider: "SketchUp", url: "https://www.sketchup.com/plans-and-pricing/sketchup-free", description: "Learn 3D modelling for interior design projects with the free version.", free: true },
    { title: "British Institute of Interior Design", provider: "BIID", url: "https://biid.org.uk/", description: "Professional body offering CPD, mentoring, and career resources for interior designers.", free: false },
  ],
  music: [
    { title: "Music Business Foundations", provider: "Berklee / Coursera", url: "https://www.coursera.org/learn/music-business-foundations", description: "How the music industry works - labels, publishing, streaming, and live.", free: true },
    { title: "Music Production", provider: "Ableton", url: "https://learningmusic.ableton.com/", description: "Free interactive course on beats, melodies, and song structure from Ableton.", free: true },
    { title: "Sound Engineering", provider: "Point Blank Music School", url: "https://www.pointblankmusicschool.com/", description: "Online courses from a top London music school - mixing, mastering, and sound design.", free: false },
    { title: "Songwriting", provider: "BBC Maestro", url: "https://www.bbcmaestro.com/", description: "Learn songwriting from top artists and industry professionals.", free: false },
    { title: "UK Music Careers", provider: "UK Music", url: "https://www.ukmusic.org/education-skills/careers-in-the-music-industry/", description: "The UK's music industry body - career guides, job profiles, and information packs for every role.", free: true },
  ],
  teaching: [
    { title: "Get Into Teaching", provider: "DfE", url: "https://getintoteaching.education.gov.uk/", description: "Official UK route into teaching - training options, funding, and support.", free: true },
    { title: "Understanding SEND", provider: "nasen", url: "https://nasen.org.uk/", description: "Essential training for understanding Special Educational Needs and Disabilities.", free: true },
    { title: "TES Institute CPD", provider: "TES Institute", url: "https://www.tes.com/institute", description: "CPD courses for teachers on classroom management and student engagement.", free: false },
    { title: "Education Technology", provider: "Open University", url: "https://www.open.ac.uk/", description: "How technology is transforming teaching and learning.", free: false },
  ],
  physiotherapy: [
    { title: "CSP Learning Hub", provider: "Chartered Society of Physiotherapy", url: "https://www.csp.org.uk/professional-clinical/cpd-education", description: "CPD, career resources, and learning for physiotherapists at every stage.", free: true },
    { title: "MSc Physiotherapy (Pre-registration)", provider: "King's College London", url: "https://www.kcl.ac.uk/study/postgraduate-taught/courses/physiotherapy-pre-registration-msc", description: "Accelerated postgraduate route into physiotherapy from a leading London university.", free: false },
    { title: "Sports & Exercise Medicine", provider: "BMJ Learning", url: "https://new-learning.bmj.com/", description: "Evidence-based courses on musculoskeletal assessment, rehabilitation, and injury management.", free: false },
    { title: "Anatomy & Physiology", provider: "Coursera / University of Michigan", url: "https://www.coursera.org/learn/anatomy", description: "Foundational anatomy course - essential knowledge for aspiring physiotherapists.", free: true },
  ],
  psychotherapy: [
    { title: "BACP Training & Qualifications", provider: "BACP", url: "https://www.bacp.co.uk/careers/careers-in-counselling/", description: "The leading UK body for counselling and psychotherapy - accredited training pathways.", free: true },
    { title: "UKCP Find a Training Course", provider: "UKCP", url: "https://www.psychotherapy.org.uk/training/find-a-training-course/", description: "Directory of UKCP-accredited psychotherapy training programmes across the UK.", free: true },
    { title: "CBT Foundations", provider: "Coursera / University of Pennsylvania", url: "https://www.coursera.org/learn/positive-psychology", description: "University-backed introduction to the principles of Cognitive Behavioural Therapy.", free: true },
    { title: "IAPT & NHS Talking Therapies Training", provider: "NHS Health Education England", url: "https://www.hee.nhs.uk/our-work/mental-health", description: "Official routes into NHS psychological therapies roles - PWP and High Intensity training.", free: true },
  ],
  wellness: [
    { title: "Personal Training Diploma", provider: "NASM / CIMSPA", url: "https://www.cimspa.co.uk/", description: "Industry-recognised personal training qualifications and standards.", free: false },
    { title: "Level 3 PT Qualification", provider: "Future Fit Training", url: "https://www.futurefit.co.uk/", description: "Comprehensive Level 2 & 3 gym instructor and personal trainer courses.", free: false },
    { title: "Nutrition for Sport & Exercise", provider: "Coursera / Stanford", url: "https://www.coursera.org/learn/stanford-introduction-food-and-health", description: "University-backed course on the science of food, health, and performance.", free: true },
    { title: "ukactive Training Academy", provider: "ukactive", url: "https://www.ukactive.com/", description: "Professional development for the UK's physical activity sector.", free: false },
  ],
  gaming: [
    { title: "UKIE – Get into Games", provider: "UKIE", url: "https://ukie.org.uk/get-into-games", description: "The UK's games industry trade body - career guides, events, and resources.", free: true },
    { title: "Game Design & Development", provider: "Coursera / Michigan State", url: "https://www.coursera.org/specializations/game-development", description: "University-backed specialisation in game design, development, and business.", free: true },
    { title: "Into Games", provider: "Into Games", url: "https://intogames.org", description: "Free career support, mentoring, and pathways into the UK games industry.", free: true },
    { title: "Games London / Tranzfuser", provider: "UK Games Fund", url: "https://ukgamesfund.com", description: "UK government-backed funding and development programme for new studios.", free: true },
    { title: "Unreal Engine Learning", provider: "Epic Games", url: "https://dev.epicgames.com/community/unreal-engine/learning", description: "Free tutorials, courses, and certifications for Unreal Engine development.", free: true },
    { title: "Unity Learn", provider: "Unity", url: "https://learn.unity.com", description: "Free learning pathways for Unity game engine - programming, design, and art.", free: true },
  ],
  journalism: [
    { title: "NCTJ Diploma in Journalism", provider: "NCTJ", url: "https://www.nctj.com/journalism-qualifications/diploma-in-journalism/", description: "The UK's gold-standard journalism qualification - essential for most newsrooms.", free: false },
    { title: "Reuters Digital Journalism Course", provider: "Reuters / Coursera", url: "https://www.coursera.org/learn/digital-journalism", description: "Free online course on digital reporting, verification, and multimedia storytelling.", free: true },
    { title: "Press Gazette Careers", provider: "Press Gazette", url: "https://pressgazette.co.uk/category/journalism-careers/", description: "Career advice, job listings, and industry insights for aspiring journalists.", free: true },
    { title: "BBC Academy", provider: "BBC", url: "https://www.bbc.co.uk/academy", description: "Free resources and training from BBC journalists - writing, reporting, and production.", free: true },
    { title: "Google News Initiative Training", provider: "Google", url: "https://newsinitiative.withgoogle.com/training/", description: "Free tools and training for digital journalism - verification, data, and storytelling.", free: true },
    { title: "Reuters Institute – University of Oxford", provider: "Reuters Institute", url: "https://reutersinstitute.politics.ox.ac.uk", description: "World-leading research institute for journalism and media studies.", free: true },
    { title: "Journalism.co.uk Training", provider: "Journalism.co.uk", url: "https://www.journalism.co.uk/training/", description: "A range of short courses in essential journalism skills - from data journalism to podcasting.", free: false },
  ],
  jewellery: [
    { title: "GIA Graduate Gemologist", provider: "GIA London", url: "https://www.gia.edu/gem-education", description: "The world's most respected gemmology qualification - diamond grading, coloured stones, and gem identification.", free: false },
    { title: "Jewellery Design & Making", provider: "Holts Academy", url: "https://www.holtsacademy.com/", description: "London-based bench jewellery skills - from beginner to advanced silversmithing and stone setting.", free: false },
    { title: "NAJ Jewellery Business Course", provider: "National Association of Jewellers", url: "https://naj.co.uk/", description: "Professional development for jewellery retail - product knowledge, ethical sourcing, and sales.", free: false },
    { title: "CAD for Jewellery (Rhino / MatrixGold)", provider: "Jewellery CAD Institute", url: "https://www.jewellerytraining.co.uk/", description: "Learn 3D modelling for jewellery design using industry-standard CAD software.", free: false },
    { title: "Goldsmiths' Centre Courses", provider: "Goldsmiths' Centre", url: "https://www.goldsmiths-centre.org/", description: "Short courses in bench skills, business, and professional development for jewellers.", free: false },
  ],
  pets: [
    { title: "Veterinary Nursing Diploma", provider: "Royal Veterinary College", url: "https://www.rvc.ac.uk/", description: "Professional veterinary nursing qualification from the UK's leading vet school.", free: false },
    { title: "Animal Care & Welfare", provider: "City & Guilds", url: "https://www.cityandguilds.com/", description: "Industry-standard animal care qualifications from Level 1 to Level 3.", free: false },
    { title: "Pet Nutrition Fundamentals", provider: "Coursera / Edinburgh", url: "https://www.coursera.org/learn/animal-behaviour-welfare", description: "Understand animal behaviour, welfare, and nutrition science.", free: true },
    { title: "Dog Grooming Diploma", provider: "iPET Network", url: "https://www.ipetnetwork.co.uk/", description: "Professional dog grooming qualification - breed-specific grooming, handling, and salon management.", free: false },
    { title: "Pet First Aid", provider: "British Red Cross", url: "https://www.redcross.org.uk/first-aid", description: "Learn essential first aid for pets - emergency response and common conditions.", free: true },
  ],
  travel: [
    { title: "IATA Travel & Tourism Training", provider: "IATA", url: "https://www.iata.org/en/training/", description: "The global aviation body's professional courses - airline operations, travel agency, cargo, and airport management.", free: false },
    { title: "Level 2/3 Travel & Tourism", provider: "City & Guilds", url: "https://www.cityandguilds.com/qualifications-and-apprenticeships/leisure/travel-tourism", description: "UK industry-standard qualifications for careers across travel agencies, tour operators and visitor attractions.", free: false },
    { title: "Sustainable Tourism", provider: "FutureLearn / University of Glasgow", url: "https://www.futurelearn.com/courses/sustainable-tourism", description: "Explore the principles of responsible tourism and how the industry is responding to climate and community challenges.", free: true },
    { title: "ABTA Training", provider: "ABTA", url: "https://www.abta.com/industry-zone/training-and-events", description: "The UK travel association's training on package travel regulations, customer service and crisis management.", free: false },
    { title: "Hospitality & Tourism Management", provider: "Open University", url: "https://www.open.ac.uk/", description: "Flexible degree-level study covering hotels, tour operations, and the wider visitor economy.", free: false },
    { title: "Aviation Management", provider: "Coursera / ENAC", url: "https://www.coursera.org/learn/aviation-management", description: "Introduction to how airlines, airports and the wider aviation industry are run.", free: true },
  ],
  health: [
    { title: "NHS Health Careers", provider: "NHS Health Education England", url: "https://www.healthcareers.nhs.uk/", description: "Official guide to over 350 NHS careers - entry routes, training, salaries and apprenticeships across medicine, nursing and allied health.", free: true },
    { title: "Care Certificate", provider: "Skills for Care", url: "https://www.skillsforcare.org.uk/Developing-workforce/Care-Certificate/Care-Certificate.aspx", description: "The minimum standard induction for new health and social care workers - required by most UK care employers.", free: true },
    { title: "Nursing Degree Apprenticeship", provider: "NHS / Universities", url: "https://www.healthcareers.nhs.uk/career-planning/study-and-training/nursing-degree-apprenticeships", description: "Earn while you train - the four-year apprenticeship route to becoming a registered nurse without student debt.", free: true },
    // Undergraduate
    { title: "Medicine MBBS (Undergraduate)", provider: "UCL Medical School", url: "https://www.ucl.ac.uk/medical-school/study/undergraduate", description: "Six-year undergraduate medicine degree at one of the UK's top teaching hospitals - entry route to becoming a doctor.", free: false },
    { title: "BSc Adult Nursing (Undergraduate)", provider: "King's College London", url: "https://www.kcl.ac.uk/study/undergraduate/courses/nursing-adult-bsc", description: "Three-year NMC-approved undergraduate degree leading to registration as an adult nurse - based at one of Europe's largest nursing faculties.", free: false },
    { title: "BSc Midwifery (Undergraduate)", provider: "University of Manchester", url: "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00990/bmidwif-midwifery/", description: "Three-year NMC-registered midwifery degree combining university study with NHS placements across Greater Manchester.", free: false },
    { title: "BSc Paramedic Science (Undergraduate)", provider: "University of Hertfordshire", url: "https://www.herts.ac.uk/courses/undergraduate/bsc-honours-paramedic-science", description: "HCPC-approved undergraduate route to becoming a registered paramedic with NHS ambulance trust placements.", free: false },
    { title: "BSc Physiotherapy (Undergraduate)", provider: "University of Birmingham", url: "https://www.birmingham.ac.uk/undergraduate/courses/sportex/physiotherapy-bsc", description: "Three-year HCPC-approved degree - the most common entry route into NHS and private physiotherapy.", free: false },
    { title: "BSc Biomedical Science (Undergraduate)", provider: "University of Edinburgh", url: "https://www.ed.ac.uk/studying/undergraduate/degrees", description: "IBMS-accredited undergraduate degree underpinning careers in NHS pathology labs, research and pharma.", free: false },
    // Postgraduate
    { title: "MSc Public Health (Postgraduate)", provider: "London School of Hygiene & Tropical Medicine", url: "https://www.lshtm.ac.uk/study/courses/masters-degrees/public-health", description: "World-leading postgraduate qualification for careers in NHS public health, global health and policy.", free: false },
    { title: "MSc Health Policy (Postgraduate)", provider: "Imperial College London", url: "https://www.imperial.ac.uk/study/courses/postgraduate-taught/health-policy/", description: "Postgraduate degree for future NHS leaders, civil servants and health-tech founders shaping system-level decisions.", free: false },
    { title: "MSc Clinical Research (Postgraduate)", provider: "University of Oxford", url: "https://www.conted.ox.ac.uk/about/msc-in-clinical-trials", description: "Part-time postgraduate route into NHS R&D, pharmaceutical trials and academic medicine.", free: false },
    { title: "MSc Advanced Clinical Practice (Postgraduate)", provider: "University of Manchester", url: "https://www.manchester.ac.uk/study/masters/courses/list/04373/msc-advanced-clinical-practice/", description: "NHS-funded apprenticeship-friendly postgraduate route for senior nurses, paramedics and AHPs to become Advanced Clinical Practitioners.", free: false },
    { title: "MSc Genomic Medicine (Postgraduate)", provider: "University of Cambridge", url: "https://www.postgraduate.study.cam.ac.uk/courses/directory/cvcgmpgms", description: "Postgraduate qualification for clinicians and scientists working in NHS Genomic Medicine Service and personalised medicine.", free: false },
    { title: "MSc Health Data Science (Postgraduate)", provider: "University of Edinburgh", url: "https://www.ed.ac.uk/studying/postgraduate/degrees", description: "Postgraduate route into NHS informatics, AI in medicine and digital health roles - strong industry partnerships.", free: false },
    { title: "Leading Change in Health & Social Care", provider: "The King's Fund", url: "https://www.kingsfund.org.uk/courses", description: "The UK's leading health think tank - leadership, system reform and policy short courses for health managers.", free: false },
    { title: "Improving Healthcare Through Clinical Research", provider: "FutureLearn / University of Leeds", url: "https://www.futurelearn.com/courses/clinical-research", description: "Free introduction to how clinical trials, evidence and research shape modern NHS practice.", free: true },
  ],
  farming: [
    { title: "Level 2/3 Agriculture Qualifications", provider: "City & Guilds", url: "https://www.cityandguilds.com/qualifications-and-apprenticeships/land-based-services/agriculture", description: "Industry-standard UK qualifications across livestock, crop production, farm machinery and land management.", free: false },
    { title: "AHDB Knowledge Library", provider: "AHDB", url: "https://ahdb.org.uk/knowledge-library", description: "Free practical training and webinars from the levy board - agronomy, livestock, dairy, business management.", free: true },
    { title: "FACTS / BASIS Certifications", provider: "BASIS Registration", url: "https://basis-reg.co.uk/", description: "The professional certification for agronomists, fertiliser advisers and crop-input professionals across UK farming.", free: false },
    // Undergraduate
    { title: "BSc Agriculture (Undergraduate)", provider: "Harper Adams University", url: "https://www.harper-adams.ac.uk/courses/undergraduate/201311/agriculture", description: "The UK's leading specialist agriculture and rural-business university - degrees, placements and direct industry links.", free: false },
    { title: "BSc Agricultural Business Management (Undergraduate)", provider: "Royal Agricultural University", url: "https://www.rau.ac.uk/study/undergraduate-courses/bsc-hons-agricultural-business-management", description: "Cirencester's flagship undergraduate degree combining farming science with land-based business and finance.", free: false },
    { title: "BSc Agriculture & Animal Science (Undergraduate)", provider: "SRUC (Scotland's Rural College)", url: "https://www.sruc.ac.uk/all-courses/", description: "Scotland's specialist land-based university - undergraduate degrees in farming, livestock and rural enterprise.", free: false },
    { title: "BSc Agriculture (Undergraduate)", provider: "University of Reading", url: "https://www.reading.ac.uk/ready-to-study/study/subject-area/agriculture-ug", description: "Russell Group agricultural degree with a strong research base in crop science, livestock and agri-economics.", free: false },
    { title: "BSc Agri-Food & Land Management (Undergraduate)", provider: "University of Nottingham", url: "https://www.nottingham.ac.uk/ugstudy/", description: "Sutton Bonington campus - one of the UK's largest agri-food undergraduate programmes with industry placements.", free: false },
    { title: "BSc Veterinary Medicine (Undergraduate)", provider: "Royal Veterinary College", url: "https://www.rvc.ac.uk/study/undergraduate", description: "The UK's oldest vet school - entry route into farm-animal practice, vital for modern livestock farming.", free: false },
    // Postgraduate
    { title: "MSc Sustainable Agriculture & Food Security (Postgraduate)", provider: "Harper Adams University", url: "https://www.harper-adams.ac.uk/courses/postgraduate/", description: "Postgraduate degree for farm managers, advisers and agri-food professionals working on regenerative systems.", free: false },
    { title: "MSc Agri-Food Technology (Postgraduate)", provider: "University of Lincoln", url: "https://www.lincoln.ac.uk/course/agtagrtmsy/", description: "Postgraduate route into agri-tech, robotics and precision farming - based at the UK's National Centre for Food Manufacturing.", free: false },
    { title: "MSc Crop Science (Postgraduate)", provider: "University of Nottingham", url: "https://www.nottingham.ac.uk/pgstudy/course/taught/crop-improvement-msc", description: "Postgraduate science qualification for plant breeders, agronomists and crop researchers in UK and global agriculture.", free: false },
    { title: "MSc Livestock Science (Postgraduate)", provider: "SRUC / University of Edinburgh", url: "https://www.sruc.ac.uk/courses/postgraduate/", description: "Postgraduate degree in livestock production, animal welfare and breeding - joint with Edinburgh's Roslin Institute.", free: false },
    { title: "MSc Rural Estate & Land Management (Postgraduate)", provider: "Royal Agricultural University", url: "https://www.rau.ac.uk/study/postgraduate-courses", description: "RICS-accredited postgraduate route into rural surveying, estate management and farm-business advisory.", free: false },
    { title: "MSc One Health (Postgraduate)", provider: "Royal Veterinary College", url: "https://www.rvc.ac.uk/study/postgraduate/one-health-msc", description: "Postgraduate degree linking livestock, food systems, environment and human health - emerging area in UK food policy.", free: false },
    { title: "Sustainable Agriculture & Soil", provider: "FutureLearn / SRUC", url: "https://www.futurelearn.com/courses/transformation-of-the-global-food-system", description: "Free online course on how British and global farming is shifting toward regenerative, low-carbon systems.", free: true },
  ],
  money: [
    { title: "CFA Programme", provider: "CFA Institute", url: "https://www.cfainstitute.org/programs/cfa", description: "The global gold-standard qualification for investment professionals - three exam levels covering ethics, finance and portfolio management.", free: false },
    { title: "ACA / ACCA / CIMA Accountancy", provider: "ICAEW / ACCA / CIMA", url: "https://www.icaew.com/qualifications-and-programmes/aca", description: "The three main UK chartered accountancy qualifications - most often studied with a Big Four firm.", free: false },
    { title: "CISI Investment Operations Certificate", provider: "Chartered Institute for Securities & Investment", url: "https://www.cisi.org/cisiweb2/cisi-website/study-with-us", description: "Industry entry-level qualification for back- and middle-office roles across investment banks and asset managers.", free: false },
    // Undergraduate
    { title: "BSc Economics (Undergraduate)", provider: "London School of Economics", url: "https://www.lse.ac.uk/study-at-lse/Undergraduate/degree-programmes-2025/BSc-Economics", description: "The UK's most influential economics undergraduate degree - primary feeder into investment banking, consulting and the Bank of England.", free: false },
    { title: "BSc Accounting & Finance (Undergraduate)", provider: "University of Warwick", url: "https://warwick.ac.uk/study/undergraduate/courses-2025/accountingandfinance/", description: "Warwick Business School's flagship undergraduate degree - strong pipeline into Big Four, City finance and graduate schemes.", free: false },
    { title: "BSc Finance (Undergraduate)", provider: "University of Cambridge (via Economics)", url: "https://www.undergraduate.study.cam.ac.uk/courses/economics", description: "Cambridge's Economics tripos with finance specialisation - a leading route into UK and global financial services.", free: false },
    { title: "BSc Financial Mathematics (Undergraduate)", provider: "University of Manchester", url: "https://www.manchester.ac.uk/study/undergraduate/courses/2025/00266/bsc-mathematics-with-financial-mathematics/", description: "Quantitative undergraduate route into derivatives, risk and trading roles in the City and global banks.", free: false },
    { title: "BSc Banking & International Finance (Undergraduate)", provider: "Bayes Business School (City, University of London)", url: "https://www.bayes.city.ac.uk/study/undergraduate/courses", description: "City of London-based undergraduate degree explicitly designed for entry into UK retail, investment and central banking.", free: false },
    { title: "BSc Business with Fintech (Undergraduate)", provider: "Queen Mary University of London", url: "https://www.qmul.ac.uk/undergraduate/", description: "Three-year undergraduate degree blending finance, coding and data - built for the UK fintech sector.", free: false },
    // Postgraduate
    { title: "MSc Finance (Postgraduate)", provider: "London Business School", url: "https://www.london.edu/masters-degrees/masters-in-finance", description: "World-ranked postgraduate finance degree - direct route into investment banking, private equity and asset management.", free: false },
    { title: "MSc Finance & Economics (Postgraduate)", provider: "London School of Economics", url: "https://www.lse.ac.uk/study-at-lse/Graduate/MSc-Finance-and-Economics", description: "LSE's flagship postgraduate finance qualification, recruited heavily by Goldman Sachs, Morgan Stanley and the Bank of England.", free: false },
    { title: "MSc Financial Economics (Postgraduate)", provider: "University of Oxford (Saïd Business School)", url: "https://www.sbs.ox.ac.uk/programmes/degrees/msc-financial-economics", description: "Oxford's intensive 9-month postgraduate degree - top feeder into bulge-bracket investment banks and hedge funds.", free: false },
    { title: "Master of Finance (Postgraduate)", provider: "University of Cambridge (Judge Business School)", url: "https://www.jbs.cam.ac.uk/masters/master-of-finance/", description: "One-year postgraduate degree designed for finance professionals stepping up into senior City and global roles.", free: false },
    { title: "MSc FinTech (Postgraduate)", provider: "Imperial College Business School", url: "https://www.imperial.ac.uk/business-school/masters-programmes/msc-financial-technology/", description: "Postgraduate qualification for tech-enabled finance roles across UK fintechs, banks and crypto firms.", free: false },
    { title: "MSc Risk Management & Financial Engineering (Postgraduate)", provider: "Imperial College London", url: "https://www.imperial.ac.uk/business-school/masters-programmes/msc-risk-management-financial-engineering/", description: "Postgraduate quant degree for risk, trading and structuring roles across investment banks and hedge funds.", free: false },
    { title: "Introduction to Corporate Finance", provider: "Coursera / Wharton", url: "https://www.coursera.org/learn/wharton-finance", description: "Free Ivy-League introduction to time value of money, valuation and capital budgeting - core skills for any finance career.", free: true },
    { title: "Financial Markets", provider: "Coursera / Yale (Robert Shiller)", url: "https://www.coursera.org/learn/financial-markets-global", description: "Nobel laureate Robert Shiller's free course on how banking, insurance, securities and behavioural finance actually work.", free: true },
    { title: "FCA Handbook & Training", provider: "Financial Conduct Authority", url: "https://www.fca.org.uk/firms/training-competence", description: "The UK regulator's training and competence rules - required reading for anyone working in regulated financial services.", free: true },
    { title: "Bright Network Banking & Finance", provider: "Bright Network", url: "https://www.brightnetwork.co.uk/career-path-guides/banking-finance/", description: "Free careers guides, internships and graduate scheme listings for UK banking, fintech and accountancy.", free: true },
  ],
  "horse-racing": [
    { title: "Foundation Course in Racehorse Care", provider: "British Racing School", url: "https://www.brs.org.uk/courses/", description: "The official entry-level training for jockeys and stable staff - fully funded residential course in Newmarket.", free: true },
    { title: "Level 2 Racehorse Care & Management", provider: "National Horseracing College", url: "https://www.nationalhorseracingcollege.com/courses/", description: "Funded residential diploma in Doncaster - the gateway qualification for working in licensed racing yards.", free: true },
    { title: "Careers in Racing", provider: "Careers in Racing (BHA)", url: "https://www.careersinracing.com/", description: "British racing's official careers hub - role profiles, training routes, apprenticeships and jobs across the industry.", free: true },
    // Undergraduate
    { title: "BSc Equine Science (Undergraduate)", provider: "Hartpury University", url: "https://www.hartpury.ac.uk/university/courses/undergraduate/equine-science-bsc-hons/", description: "Three-year undergraduate degree at the UK's specialist equine campus - performance, physiology and racing-industry placements.", free: false },
    { title: "BSc Bloodstock & Performance Horse Management (Undergraduate)", provider: "Royal Agricultural University", url: "https://www.rau.ac.uk/study/undergraduate-courses", description: "Cirencester's specialist undergraduate degree built for the breeding, sales and racing industries.", free: false },
    { title: "BSc Equine Sports Science (Undergraduate)", provider: "Writtle University College", url: "https://writtle.ac.uk/Courses", description: "Undergraduate degree focused on training, biomechanics and welfare - feeds into racing, breeding and veterinary careers.", free: false },
    { title: "BSc Equine Business Management (Undergraduate)", provider: "Nottingham Trent University (Brackenhurst)", url: "https://www.ntu.ac.uk/study-and-courses/courses/find-your-course/animal-equine-and-wildlife/ug", description: "Three-year undergraduate route into the commercial side of UK racing - yards, racecourses and bloodstock agencies.", free: false },
    { title: "FdSc Racehorse Performance & Management (Undergraduate)", provider: "National Horseracing College / University Centre Bishop Burton", url: "https://www.nationalhorseracingcollege.com/courses/foundation-degree/", description: "Two-year foundation degree designed with the BHA - the only UK degree built specifically for thoroughbred racing.", free: false },
    { title: "BVMS Veterinary Medicine (Undergraduate)", provider: "University of Liverpool (Leahurst)", url: "https://www.liverpool.ac.uk/study/undergraduate/courses/", description: "Five-year veterinary undergraduate degree with strong equine specialisation - feeds racing, breeding and stud-vet careers.", free: false },
    // Postgraduate
    { title: "MSc Equine Science (Postgraduate)", provider: "Hartpury University", url: "https://www.hartpury.ac.uk/university/courses/postgraduate/", description: "Postgraduate degree in equine performance, nutrition and welfare - research pipeline into racing science and bloodstock.", free: false },
    { title: "MSc International Equine Studies (Postgraduate)", provider: "University of Limerick", url: "https://www.ul.ie/gps/course/international-equine-studies-msc", description: "Postgraduate degree covering racing, breeding and global thoroughbred industry - strong UK & Irish racing links.", free: false },
    { title: "MSc Equine Nutrition (Postgraduate)", provider: "University of Edinburgh (Royal (Dick) School of Vet Studies)", url: "https://www.ed.ac.uk/studying/postgraduate/degrees", description: "Online-friendly postgraduate qualification for nutritionists, vets and racing-yard professionals advising trainers.", free: false },
    { title: "MSc Equine Science & Welfare (Postgraduate)", provider: "Aberystwyth University", url: "https://courses.aber.ac.uk/postgraduate/", description: "Postgraduate research-focused degree on equine welfare and performance - applicable to racing, breeding and regulation.", free: false },
    { title: "MBA / Sport Business - Racing Track", provider: "UCFB / Loughborough University", url: "https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/sport-business-and-innovation/", description: "Sport business postgraduate degrees taken by future racecourse, broadcast and bloodstock executives.", free: false },
    { title: "Thoroughbred Breeding Industry Education", provider: "Thoroughbred Breeders' Association", url: "https://www.thetba.co.uk/education-careers/", description: "Stud-staff training, scholarships and breeding-industry qualifications from the UK breeders' body.", free: true },
    { title: "BHA Trainee Jockey Programme", provider: "British Horseracing Authority", url: "https://www.britishhorseracing.com/regulation/jockeys-trainers/", description: "Official licensing pathway for apprentice and conditional jockeys - riding standards, race tactics and welfare.", free: true },
    { title: "Racing Welfare Career Support", provider: "Racing Welfare", url: "https://www.racingwelfare.co.uk/about-us/learning-development", description: "Free professional development, mental health and career-progression support for everyone working in British racing.", free: true },
  ],
  influencing: [
    { title: "The Creator MBA", provider: "Jay Clouse / Creator Science", url: "https://www.creatorscience.com/mba", description: "Comprehensive course covering the full business of being a full-time creator - audience, products, monetisation, ops.", free: false },
    { title: "Part-Time YouTuber Academy", provider: "Ali Abdaal", url: "https://academy.aliabdaal.com/ptya", description: "Cohort-based course on building a YouTube channel and creator business alongside another career.", free: false },
    { title: "Influencer Marketing Strategy", provider: "Coursera / UC Davis", url: "https://www.coursera.org/learn/influencer-marketing-strategy", description: "University-backed course on running brand–creator partnerships, campaign design, and measurement.", free: true },
    { title: "Social Media Marketing Specialisation", provider: "Coursera / Northwestern", url: "https://www.coursera.org/specializations/social-media-marketing", description: "Six-course specialisation covering content strategy, community, paid social, and analytics.", free: true },
    { title: "TikTok Marketing Science", provider: "TikTok Academy", url: "https://academy.tiktok.com/", description: "Free official training on creative strategy, ads, and the TikTok algorithm - essential for creators and marketers.", free: true },
    { title: "YouTube Creator Academy", provider: "YouTube", url: "https://creatoracademy.youtube.com/", description: "Free official lessons from YouTube on growing a channel, monetisation, and audience strategy.", free: true },
    { title: "Meta Blueprint - Content & Creators", provider: "Meta", url: "https://www.facebook.com/business/learn", description: "Free certifications on Instagram and Facebook content, brand partnerships, and creator monetisation tools.", free: true },
    { title: "ContentEd by Adam Faze", provider: "Gymnasium / Adam Faze", url: "https://www.gymnasium.studio/", description: "Short-form storytelling and vertical video craft for the next generation of creators and producers.", free: false },
    { title: "BA (Hons) Content, Media & Film Production", provider: "University of the Arts London (LCC)", url: "https://www.arts.ac.uk/colleges/london-college-of-communication", description: "Undergraduate degree training the next wave of creators, social-first producers and digital media talent.", free: false },
    { title: "MA Digital Media: Production", provider: "Goldsmiths, University of London", url: "https://www.gold.ac.uk/pg/ma-digital-media-production/", description: "Postgraduate degree blending creative practice with platform theory - strong pipeline into creator-economy roles.", free: false },
  ],
};
