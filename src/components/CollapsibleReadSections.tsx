import { Children, isValidElement, type ReactNode, type ComponentType } from "react";
import { BookOpen, Newspaper, Rss, Mail, ChevronDown } from "lucide-react";

import DailyBriefing from "./DailyBriefing";
import LiveArticles from "./LiveArticles";
import NewsfeedModal from "./NewsfeedModal";
import BreakingNewsFeed from "./BreakingNewsFeed";
import SubstackNewsletters from "./SubstackNewsletters";

/**
 * CollapsibleReadSections
 *
 * Wraps the existing per-industry "Read" tab content (DailyBriefing,
 * LiveArticles, NewsfeedModal, BreakingNewsFeed, SubstackNewsletters and any
 * other markup) into MyProfile-style collapsible <details> blocks - without
 * needing to touch each of the 28 industry pages.
 *
 * Strategy: walk the children, classify each element by which "Read" component
 * it renders, and bucket it into one of four sections. Anything we don't
 * recognise is appended to a final "More" section so nothing is lost.
 */

type SectionKey = "briefing" | "articles" | "newsfeed" | "substack" | "more";

const SECTION_META: Record<
  SectionKey,
  { title: string; subtitle: string; icon: ComponentType<{ className?: string }> }
> = {
  briefing: {
    title: "Today's Briefing",
    subtitle: "AI-synthesised morning brief for the industry",
    icon: BookOpen,
  },
  articles: {
    title: "Latest Articles",
    subtitle: "Long-reads pulled from the leading trade titles",
    icon: Newspaper,
  },
  newsfeed: {
    title: "Newsfeed & Sources",
    subtitle: "Breaking headlines and the publications worth bookmarking",
    icon: Rss,
  },
  substack: {
    title: "Substack Newsletters",
    subtitle: "Independent writers and industry insiders, straight to your inbox",
    icon: Mail,
  },
  more: {
    title: "More to read",
    subtitle: "Extra picks for this industry",
    icon: BookOpen,
  },
};

const SECTION_ORDER: SectionKey[] = ["briefing", "articles", "newsfeed", "substack", "more"];

function classifyChild(node: ReactNode): SectionKey {
  if (!isValidElement(node)) return "more";
  const type = node.type as unknown as { displayName?: string; name?: string };
  // Prefer displayName, fall back to function/class name. Components imported
  // by reference share identity so we also do an `===` check below.
  const name = (type?.displayName || type?.name || "").toString();

  if (node.type === DailyBriefing || /DailyBriefing/.test(name)) return "briefing";
  if (node.type === LiveArticles || /LiveArticles/.test(name)) return "articles";
  if (
    node.type === NewsfeedModal ||
    node.type === BreakingNewsFeed ||
    /Newsfeed|BreakingNews/.test(name)
  ) {
    return "newsfeed";
  }
  if (node.type === SubstackNewsletters || /Substack/.test(name)) return "substack";
  return "more";
}

/**
 * Recursively flatten React children, descending into wrapper <div>/<>...</> /
 * <Fragment> elements but stopping at known Read components. Many industry
 * pages wrap a NewsfeedModal+BreakingNewsFeed pair in a `<div className="mt-12">`
 * - without flattening, the whole wrapper would land in the "More" bucket.
 */
function flatten(node: ReactNode, out: ReactNode[]) {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) {
      // strings, numbers, null - keep as-is in case it's content
      if (child !== null && child !== undefined && child !== false && child !== "") {
        out.push(child);
      }
      return;
    }
    const known =
      child.type === DailyBriefing ||
      child.type === LiveArticles ||
      child.type === NewsfeedModal ||
      child.type === BreakingNewsFeed ||
      child.type === SubstackNewsletters;
    if (known) {
      out.push(child);
      return;
    }
    // Descend into wrapper elements (divs, fragments) so nested Read components
    // are picked up.
    const children = (child.props as { children?: ReactNode })?.children;
    if (children !== undefined) {
      flatten(children, out);
      return;
    }
    // Unknown leaf - keep in "More" so nothing disappears.
    out.push(child);
  });
}

interface Props {
  children: ReactNode;
}

const CollapsibleReadSections = ({ children }: Props) => {
  const flat: ReactNode[] = [];
  flatten(children, flat);

  const buckets: Record<SectionKey, ReactNode[]> = {
    briefing: [],
    articles: [],
    newsfeed: [],
    substack: [],
    more: [],
  };

  flat.forEach((node, idx) => {
    const key = classifyChild(node);
    buckets[key].push(
      <div key={idx} className={buckets[key].length > 0 ? "mt-6" : undefined}>
        {node}
      </div>,
    );
  });

  // Drop empty sections (especially "more" which is empty for most industries).
  const visibleSections = SECTION_ORDER.filter((key) => buckets[key].length > 0);

  // If we somehow couldn't classify anything (defensive), fall back to the raw
  // children rather than rendering nothing.
  if (visibleSections.length === 0) return <>{children}</>;

  return (
    <div className="space-y-4">
      {visibleSections.map((key, index) => {
        const { title, subtitle, icon: Icon } = SECTION_META[key];
        return (
          <details
            key={key}
            open={index === 0}
            className="group bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
          >
            <summary className="list-none cursor-pointer flex items-start gap-4 px-5 md:px-6 py-4 hover:bg-primary/5 transition-colors">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-700 text-base md:text-lg leading-tight text-foreground">
                  {title}
                </h2>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 md:px-6 pb-6 pt-2 border-t border-border bg-muted/10">
              <div className="[&_h2]:!mt-0 [&_h2]:!mb-4 [&_h2]:!text-xl">
                {buckets[key]}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default CollapsibleReadSections;
