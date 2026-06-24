import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SeriesCard from "./SeriesCard";
import seriesFormula1 from "@/assets/series-formula1.jpg";
import seriesCinema from "@/assets/series-cinema.jpg";
import seriesFashion from "@/assets/series-fashion.jpg";
import seriesCoffee from "@/assets/series-coffee.jpg";
import seriesMusic from "@/assets/series-music.jpg";
import seriesGrocery from "@/assets/series-grocery.jpg";
import seriesHospitality from "@/assets/series-hospitality.jpg";
import seriesFootball from "@/assets/series-football.jpg";
import seriesTeaching from "@/assets/series-teaching.jpg";
import seriesInteriorDesign from "@/assets/series-interiordesign.jpg";
import seriesCharity from "@/assets/series-charity.jpg";
import seriesEstateAgency from "@/assets/series-estateagency.jpg";
import seriesBakery from "@/assets/series-bakery.jpg";
import seriesBeer from "@/assets/series-beer.jpg";
import seriesFootwear from "@/assets/series-footwear.jpg";
import seriesPhysiotherapy from "@/assets/series-physiotherapy.jpg";
import seriesPsychotherapy from "@/assets/series-psychotherapy.jpg";
import seriesWellness from "@/assets/series-wellness.jpg";
import seriesGaming from "@/assets/series-gaming.jpg";
import seriesInfluencing from "@/assets/series-influencing.jpg";
import seriesJournalism from "@/assets/series-journalism.jpg";
import seriesJewellery from "@/assets/series-jewellery.jpg";
import seriesPets from "@/assets/series-pets.jpg";
import seriesCars from "@/assets/series-cars.jpg";
import seriesBeauty from "@/assets/series-beauty.jpg";
import seriesTravel from "@/assets/series-travel.jpg";
import seriesFarming from "@/assets/series-farming.jpg";
import seriesHealth from "@/assets/series-health.jpg";
import seriesHorseRacing from "@/assets/series-horse-racing.jpg";
import seriesMoney from "@/assets/series-money.jpg";
import seriesBuilding from "@/assets/series-building.jpg";
import seriesFixing from "@/assets/series-fixing.jpg";
import seriesDelivery from "@/assets/series-delivery.jpg";
import seriesTennis from "@/assets/series-tennis.jpg";

const series = [
  {
    title: "Bakery",
    description:
      "Sourdough starters, 4 a.m. shifts, and the craft behind the UK's favourite loaves.",
    image: seriesBakery,
    href: "/bakery",
  },
  {
    title: "Beauty",
    description:
      "Formulas, founders, and the £30 billion UK industry behind every product on your shelf.",
    image: seriesBeauty,
    href: "/beauty",
  },
  {
    title: "Beer",
    description:
      "Craft breweries, global giants, taprooms, and pubs - the people and business behind every pint.",
    image: seriesBeer,
    href: "/beer",
  },
  {
    title: "Building",
    description: "Construction sites, architects, quantity surveyors, and the £160 billion UK industry shaping every skyline.",
    image: seriesBuilding,
    href: "/building",
  },
  {
    title: "Cars",
    description:
      "From design studios to dealership floors - the engineering, manufacturing, and business of the UK's automotive industry.",
    image: seriesCars,
    href: "/cars",
  },
  {
    title: "Charity",
    description:
      "Fundraising, campaigning, governance, and the people powering the UK's £60 billion charity sector.",
    image: seriesCharity,
    href: "/charity",
  },
  {
    title: "Coffee",
    description:
      "Cult brands, bean traders, and the $500 billion industry in your morning cup.",
    image: seriesCoffee,
    href: "/coffee",
  },
  {
    title: "Delivery",
    description: "Couriers, HGV drivers, logistics coordinators, and the operations moving 5 billion parcels across the UK every year.",
    image: seriesDelivery,
    href: "/delivery",
  },
  {
    title: "Estate Agency",
    description:
      "Valuations, viewings, negotiations, and the people behind every 'Sold' sign on the high street.",
    image: seriesEstateAgency,
    href: "/estate-agency",
  },
  {
    title: "Farming",
    description:
      "Field to fork - the producers, agritech, and supply chains feeding the country.",
    image: seriesFarming,
    href: "/farming",
  },
  {
    title: "Fashion",
    description:
      "Global supply chains, fast fashion empires, and the people stitching it all together.",
    image: seriesFashion,
    href: "/fashion",
  },
  {
    title: "Film and TV",
    description:
      "From multi-billion dollar studios to indie darlings - how does the film industry really work?",
    image: seriesCinema,
    href: "/cinema",
  },
  {
    title: "Fixing",
    description: "Electricians, plumbers, gas engineers, and the skilled trades keeping Britain's homes and businesses running.",
    image: seriesFixing,
    href: "/fixing",
  },
  {
    title: "Food & Drink",
    description:
      "Restaurants, bars, breweries, and the people behind the plate - how the food and drink industry really runs.",
    image: seriesHospitality,
    href: "/hospitality",
  },
  {
    title: "Football",
    description:
      "Billions in broadcast deals, grassroots clubs on the brink, and the business empire behind the beautiful game.",
    image: seriesFootball,
    href: "/football",
  },
  {
    title: "Footwear",
    description:
      "Sneakers, boots, and sandals - from the factory floor to the shop floor, the global footwear industry unpacked.",
    image: seriesFootwear,
    href: "/footwear",
  },
  {
    title: "Formula 1",
    description:
      "Engineers, strategists, mechanics, and the business behind the world's fastest sport - unpacked from Motorsport Valley.",
    image: seriesFormula1,
    href: "/formula-1",
  },
  {
    title: "Gaming",
    description:
      "Studios, esports, streamers, and the £7 billion UK industry behind the games we play.",
    image: seriesGaming,
    href: "/gaming",
  },
  {
    title: "Grocery",
    description:
      "The food on your shelves and the grocery delivered - supermarkets, supply chains & the race to your front door.",
    image: seriesGrocery,
    href: "/grocery",
  },
  {
    title: "Health",
    description:
      "Hospitals, clinics, and the people keeping the nation well - from the NHS to private practice.",
    image: seriesHealth,
    href: "/health",
  },
  {
    title: "Horse Racing",
    description:
      "Stables, racecourses, bloodstock and broadcast - inside Britain's £4 billion racing industry.",
    image: seriesHorseRacing,
    href: "/horse-racing",
  },
  {
    title: "Influencing",
    description:
      "Creators, agencies, platforms, and the booming creator economy - from TikTok to Substack.",
    image: seriesInfluencing,
    href: "/influencing",
  },
  {
    title: "Interior Design",
    description:
      "From mood boards to mansions - the creative studios, trade suppliers, and trends shaping the spaces we live in.",
    image: seriesInteriorDesign,
    href: "/interior-design",
  },
  {
    title: "Jewellery",
    description:
      "Diamonds, gold, gemstones, and the skilled craftspeople behind every piece - from workshops to boutiques.",
    image: seriesJewellery,
    href: "/jewellery",
  },
  {
    title: "Journalism",
    description:
      "Newsrooms, broadcasters, digital publishers, and the people behind every story.",
    image: seriesJournalism,
    href: "/journalism",
  },
  {
    title: "Money",
    description:
      "Banking, fintech, advice and markets - the people moving Britain's money.",
    image: seriesMoney,
    href: "/money",
  },
  {
    title: "Music",
    description:
      "Tiny promoters, giant corporations, and the invisible machinery behind live music.",
    image: seriesMusic,
    href: "/music",
  },
  {
    title: "Pets",
    description:
      "Vets, pet food brands, groomers, and the booming UK pet care industry - worth over £8 billion.",
    image: seriesPets,
    href: "/pets",
  },
  {
    title: "Physiotherapy",
    description:
      "From NHS wards to elite sports clubs - the people getting the world moving again.",
    image: seriesPhysiotherapy,
    href: "/physiotherapy",
  },
  {
    title: "Psychotherapy",
    description:
      "From NHS talking therapies to private practice - the people helping us make sense of our minds.",
    image: seriesPsychotherapy,
    href: "/psychotherapy",
  },
  {
    title: "Teaching",
    description:
      "From classrooms to curricula, teacher training to EdTech - the people and systems shaping how we learn.",
    image: seriesTeaching,
    href: "/teaching",
  },
  {
    title: "Tennis",
    description:
      "The LTA, Wimbledon, ATP Tour, and the careers behind the world's most prestigious sport.",
    image: seriesTennis,
    href: "/tennis",
  },
  {
    title: "Travel",
    description:
      "Airlines, railways, ride-hailing, hotels, and booking platforms - the people behind how the world moves.",
    image: seriesTravel,
    href: "/travel",
  },
  {
    title: "Wellness",
    description:
      "Gyms, personal training, supplements, activewear, and the booming industry keeping the world moving.",
    image: seriesWellness,
    href: "/wellness",
  },
];

const SeriesGrid = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const industryLinks = series.map((s) => ({ title: s.title, href: s.href }));

  return (
    <section id="series" className="py-20 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 md:mb-16">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
            The Series
          </p>
          <div className="flex items-start gap-4">
            <h2 className="font-display text-4xl md:text-6xl font-800 leading-none">
              Industries we live in.
              <br />
              <span className="text-muted-foreground">Unpacked.</span>
            </h2>
            <div className="relative mt-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Browse industries"
                className="border-2 border-foreground p-2 hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 max-h-[70vh] overflow-y-auto border-2 border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] z-50">
                  <div className="px-3 py-2 border-b-2 border-foreground bg-primary">
                    <span className="font-display text-[10px] tracking-[0.16em] uppercase font-700 text-primary-foreground">
                      Jump to industry
                    </span>
                  </div>
                  {industryLinks.map((ind) => (
                    <Link
                      key={ind.href}
                      to={ind.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 font-display text-xs font-700 tracking-wide uppercase border-b border-border last:border-0 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {ind.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {series.map((s, i) => (
            <SeriesCard key={s.title} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeriesGrid;
