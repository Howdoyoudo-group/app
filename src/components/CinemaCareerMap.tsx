import CareerMap from "./CareerMap";
import {
  Lightbulb,
  ClipboardList,
  Clapperboard,
  Scissors,
  Truck,
  Projector,
  Tv,
} from "lucide-react";
import type { CareerStage } from "./CareerMap";

export const cinemaStages: CareerStage[] = [
  {
    title: "Idea & Story",
    icon: Lightbulb,
    roles: [
      { name: "Screenwriter", description: "Writes original scripts or adapts existing material into screenplays for film and television.", salary: "£25k–£60k" },
      { name: "Script Reader", description: "Reviews and evaluates submitted scripts, providing coverage and recommendations to producers and studios.", salary: "£22k–£35k" },
      { name: "Story Editor", description: "Works with writers to develop and refine scripts, ensuring narrative coherence and quality throughout production.", salary: "£30k–£55k" },
      { name: "Script Consultant", description: "Provides professional feedback on scripts, advising on structure, dialogue, and marketability.", salary: "£35k–£70k" },
      { name: "IP Acquisitions", description: "Identifies and acquires intellectual property rights for books, articles, and other source material to adapt into films.", salary: "£35k–£65k" },
      { name: "Development Executive", description: "Oversees projects from concept to green-light, managing writer relationships and shaping creative direction.", salary: "£35k–£70k" },
      { name: "Literary Agent", description: "Represents screenwriters and authors, negotiating deals and connecting talent with production companies.", salary: "£28k–£80k" },
    ],
  },
  {
    title: "Pre-Production",
    icon: ClipboardList,
    roles: [
      { name: "Producer", description: "Leads the project from development through delivery, overseeing financing, hiring, and creative decisions.", salary: "£40k–£100k+" },
      { name: "Line Producer", description: "Manages the day-to-day budget and logistics of a production, ensuring it stays on schedule and within budget.", salary: "£35k–£75k" },
      { name: "Casting Director", description: "Finds and auditions actors for roles, working closely with the director to select the right talent.", salary: "£30k–£65k" },
      { name: "Location Scout", description: "Researches and visits potential filming locations, considering logistics, aesthetics, and budget.", salary: "£25k–£45k" },
      { name: "Production Designer", description: "Creates the overall visual look of a film, designing sets and overseeing the art department.", salary: "£35k–£70k" },
      { name: "Set Designer", description: "Draws up detailed plans and technical drawings for sets based on the production designer's vision.", salary: "£28k–£50k" },
      { name: "Costume Designer", description: "Designs and sources all costumes for a production, reflecting character, period, and story.", salary: "£28k–£55k" },
      { name: "Storyboard Artist", description: "Translates the script into visual panels that map out camera angles, action, and scene composition.", salary: "£28k–£50k" },
      { name: "Production Coordinator", description: "Handles administrative tasks and communications to keep the production running smoothly.", salary: "£24k–£38k" },
      { name: "Unit Production Manager", description: "Oversees the production's operational and financial aspects on behalf of the producer.", salary: "£35k–£65k" },
    ],
  },
  {
    title: "Production",
    icon: Clapperboard,
    roles: [
      { name: "Director", description: "Leads the creative vision of the film, guiding actors and crew to bring the script to life on screen.", salary: "£40k–£150k+" },
      { name: "Cinematographer (DP)", description: "Designs and executes the visual look through lighting, camera placement, and lens choices.", salary: "£35k–£85k" },
      { name: "1st Assistant Director", description: "Manages the shooting schedule and set operations, keeping the production on time and organised.", salary: "£30k–£60k" },
      { name: "Art Director", description: "Supervises the art department on set, managing set construction, dressing, and props to realise the production designer's vision.", salary: "£30k–£60k" },
      { name: "Props Master", description: "Sources, creates, and manages all props used on set, ensuring continuity and availability during shoots.", salary: "£25k–£45k" },
      { name: "Hair & Makeup Artist", description: "Designs and applies hair styling and makeup for cast, from natural looks to prosthetics and special effects.", salary: "£25k–£50k" },
      { name: "Stunt Coordinator", description: "Designs, choreographs, and supervises all stunt sequences, ensuring performer safety on set.", salary: "£35k–£75k" },
      { name: "Special Effects Supervisor", description: "Creates practical on-set effects including pyrotechnics, weather, and mechanical rigs.", salary: "£30k–£65k" },
      { name: "Sound Recordist", description: "Captures high-quality audio on set, managing microphones and monitoring sound levels during filming.", salary: "£28k–£50k" },
      { name: "Gaffer", description: "Head of the electrical department, responsible for executing the lighting plan set by the cinematographer.", salary: "£30k–£55k" },
      { name: "Grip", description: "Sets up and operates camera support equipment, dollies, and rigging for complex camera movements.", salary: "£25k–£45k" },
      { name: "Script Supervisor", description: "Ensures continuity between shots and scenes, tracking dialogue, props, and actor positions.", salary: "£28k–£45k" },
      { name: "Camera Operator", description: "Physically operates the camera during filming, framing shots as directed by the DP and director.", salary: "£28k–£55k" },
      { name: "Set Dresser", description: "Arranges furniture, décor, and objects on set to create the environment specified by the production designer.", salary: "£22k–£38k" },
      { name: "Construction Manager", description: "Leads the team that physically builds sets, overseeing carpenters, painters, and plasterers.", salary: "£30k–£55k" },
      { name: "Wardrobe Supervisor", description: "Manages costumes during filming - fittings, continuity, repairs, and coordinating multiples for stunt work.", salary: "£25k–£42k" },
    ],
  },
  {
    title: "Post-Production",
    icon: Scissors,
    roles: [
      { name: "Film Editor", description: "Assembles raw footage into a polished narrative, working closely with the director on pacing and structure.", salary: "£30k–£65k" },
      { name: "Colourist", description: "Adjusts and enhances the colour and tone of footage to create a consistent visual mood across the film.", salary: "£30k–£60k" },
      { name: "VFX Artist", description: "Creates digital visual effects, from subtle enhancements to complex CGI sequences.", salary: "£30k–£65k" },
      { name: "Sound Designer", description: "Creates and layers sound effects and atmospheres to build the auditory world of the film.", salary: "£28k–£55k" },
      { name: "Composer", description: "Writes and produces the original musical score that underscores the film's emotional narrative.", salary: "£25k–£70k" },
      { name: "Foley Artist", description: "Recreates everyday sound effects in a studio to enhance the audio realism of the film.", salary: "£25k–£40k" },
      { name: "DIT (Digital Imaging Tech)", description: "Manages digital data on set, ensuring footage is properly backed up, colour-managed, and quality-checked.", salary: "£30k–£55k" },
      { name: "Post-Production Supervisor", description: "Coordinates all post-production activities, managing schedules, budgets, and deliverables.", salary: "£35k–£65k" },
    ],
  },
  {
    title: "Distribution",
    icon: Truck,
    roles: [
      { name: "Sales Agent", description: "Sells distribution rights for films to buyers in different territories and platforms worldwide.", salary: "£30k–£70k" },
      { name: "Distribution Executive", description: "Plans and executes the release strategy for films across theatrical, digital, and broadcast platforms.", salary: "£35k–£75k" },
      { name: "Marketing Manager", description: "Develops and runs marketing campaigns including trailers, posters, and digital promotion for film releases.", salary: "£30k–£60k" },
      { name: "Publicist", description: "Manages press relations and media coverage, organising interviews, premieres, and press junkets.", salary: "£28k–£55k" },
      { name: "Festival Strategist", description: "Plans film festival submissions and premiere strategies to maximise visibility and awards potential.", salary: "£30k–£55k" },
      { name: "Acquisitions Executive", description: "Evaluates and acquires completed films for a distributor's catalogue, negotiating rights and deals.", salary: "£32k–£65k" },
      { name: "Licensing Manager", description: "Manages the licensing of film content for merchandise, streaming platforms, and international markets.", salary: "£30k–£60k" },
    ],
  },
  {
    title: "Broadcast & Streaming",
    icon: Tv,
    roles: [
      { name: "Commissioning Editor", description: "Decides which programmes get made, working with production companies to develop ideas that fit the channel's strategy.", salary: "£50k–£100k+" },
      { name: "Channel Controller", description: "Sets the creative direction and scheduling strategy for an entire TV channel or streaming slate.", salary: "£80k–£150k+" },
      { name: "Scheduler", description: "Plans the broadcast schedule, deciding when programmes air to maximise audience and revenue.", salary: "£30k–£55k" },
      { name: "Acquisitions Manager", description: "Buys completed programmes and formats from international markets for broadcast or streaming platforms.", salary: "£35k–£65k" },
      { name: "Streaming Content Strategist", description: "Analyses viewing data to inform what content is commissioned, renewed, or promoted on a platform.", salary: "£40k–£75k" },
      { name: "Compliance Officer", description: "Ensures all broadcast content meets Ofcom regulations, watershed rules, and editorial standards.", salary: "£30k–£55k" },
      { name: "Broadcast Engineer", description: "Maintains and operates the technical infrastructure that delivers live and recorded TV to audiences.", salary: "£30k–£55k" },
      { name: "Playout Operator", description: "Monitors and controls the live transmission of scheduled programming, managing switches and contingencies.", salary: "£25k–£40k" },
      { name: "Platform Product Manager", description: "Shapes the user experience of streaming apps - discovery, recommendations, and interface design.", salary: "£45k–£80k" },
    ],
  },
  {
    title: "Exhibition",
    icon: Projector,
    roles: [
      { name: "Cinema Manager", description: "Runs the day-to-day operations of a cinema, managing staff, programming, and customer experience.", salary: "£28k–£45k" },
      { name: "Programmer / Curator", description: "Selects which films are screened, curating seasons, retrospectives, and special events.", salary: "£25k–£45k" },
      { name: "Projectionist", description: "Operates digital and analogue projection equipment, ensuring the best possible screening quality.", salary: "£22k–£32k" },
      { name: "Events Coordinator", description: "Plans and delivers special screenings, Q&As, premieres, and community events at the cinema.", salary: "£24k–£38k" },
      { name: "Operations Manager", description: "Manages facilities, health & safety, technology, and vendor relationships across cinema sites.", salary: "£30k–£50k" },
    ],
  },
];

const CinemaCareerMap = () => (
  <CareerMap
    title="Film and TV Career Map"
    subtitle="The pipeline from script to screen - and the roles that make it happen."
    stages={cinemaStages}
    industry="cinema"
  />
);

export default CinemaCareerMap;
