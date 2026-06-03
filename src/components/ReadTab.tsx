import { ReactNode } from "react";
import { BookOpen, Newspaper, Rss, Mail, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DailyBriefing from "./DailyBriefing";
import LiveArticles from "./LiveArticles";
import NewsfeedModal from "./NewsfeedModal";
import BreakingNewsFeed from "./BreakingNewsFeed";
import SubstackNewsletters from "./SubstackNewsletters";

type Article = { title: string; source: string; url: string };
type Source = { title: string; url: string };

interface ReadTabProps {
  /** Industry slug used by DailyBriefing / LiveArticles / BreakingNewsFeed (lowercase, may be hyphenated). */
  industry: string;
  /** Optional override slug for DailyBriefing (e.g. Hospitality uses "food-drink"). */
  briefingIndustry?: string;
  /** Display label for the NewsfeedModal heading (e.g. "estate agency"). Defaults to `industry`. */
  newsfeedLabel?: string;
  /** Sources passed to NewsfeedModal & BreakingNewsFeed. */
  sources: Source[];
  /** Fallback articles for LiveArticles. */
  fallbackArticles: Article[];
  /** Optional extra content rendered below all sections (e.g. a downloadable PDF guide). */
  extra?: ReactNode;
}

const SectionIcon = ({ Icon }: { Icon: typeof BookOpen }) => (
  <span className="inline-flex items-center justify-center w-8 h-8 border border-foreground bg-background shrink-0">
    <Icon className="w-4 h-4" />
  </span>
);

const ReadTab = ({
  industry,
  briefingIndustry,
  newsfeedLabel,
  sources,
  fallbackArticles,
  extra,
}: ReadTabProps) => {
  const briefSlug = briefingIndustry ?? industry;
  const newsLabel = newsfeedLabel ?? industry;

  const items: {
    value: string;
    icon: typeof BookOpen;
    title: string;
    sub: string;
    content: ReactNode;
  }[] = [
    {
      value: "briefing",
      icon: BookOpen,
      title: "Today's Briefing",
      sub: "AI-synthesised morning brief for the industry",
      content: <DailyBriefing industry={briefSlug} />,
    },
    {
      value: "articles",
      icon: Newspaper,
      title: "Latest Articles",
      sub: "Long-reads pulled from the leading trade titles",
      content: (
        <LiveArticles industry={industry} fallbackArticles={fallbackArticles} />
      ),
    },
    {
      value: "newsfeed",
      icon: Rss,
      title: "Newsfeed & Sources",
      sub: "Breaking headlines and the publications worth bookmarking",
      content: (
        <div className="space-y-8">
          <NewsfeedModal sources={sources} industry={newsLabel} />
          <BreakingNewsFeed industry={industry} sources={sources} />
        </div>
      ),
    },
    {
      value: "substack",
      icon: Mail,
      title: "Substack Newsletters",
      sub: "Independent writers and industry insiders, straight to your inbox",
      content: <SubstackNewsletters industry={industry} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-2 border-foreground bg-primary/10 p-5 md:p-6">
        <p className="font-display text-[11px] tracking-[0.25em] uppercase text-primary mb-1">
          The Read
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-700 leading-tight">
          Everything worth reading<span className="text-primary">.</span>
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-2 max-w-xl">
          The morning brief, the long-reads, the breaking headlines, and the
          newsletters insiders actually subscribe to - all in one place. Tap a
          section to open it.
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["briefing"]}
        className="border border-foreground divide-y divide-foreground"
      >
        {items.map(({ value, icon: Icon, title, sub, content }) => (
          <AccordionItem
            key={value}
            value={value}
            className="border-b-0 bg-background"
          >
            <AccordionTrigger className="px-4 md:px-5 py-4 hover:no-underline hover:bg-primary/5 [&>svg]:hidden group">
              <div className="flex items-center gap-4 flex-1 text-left">
                <SectionIcon Icon={Icon} />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-700 text-base md:text-lg leading-tight">
                    {title}
                  </div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">
                    {sub}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 md:px-5 pt-2 pb-6 border-t border-border bg-muted/20">
              <div className="[&_h2]:!mb-4 [&_h2]:!text-xl [&_.scroll-mt-24]:!mb-0">
                {content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {extra}
    </div>
  );
};

export default ReadTab;
