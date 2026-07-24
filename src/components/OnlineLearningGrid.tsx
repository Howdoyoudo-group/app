import { ExternalLink, Laptop } from "lucide-react";
import { buildOnlineProviders } from "@/data/online-providers";

/**
 * The 8-provider "Online Learning" section (Reed, Coursera, FutureLearn,
 * Open University, edX, LinkedIn Learning, Udemy, learndirect) - shared by
 * RoleLearnSection (auto-injected on most role pages) and any role page
 * that hand-rolls its own "Learn" tab, so nobody loses this section just
 * because they wrote custom curated course content too.
 */
export default function OnlineLearningGrid({ roleName }: { roleName: string }) {
  const onlineProviders = buildOnlineProviders(roleName);
  return (
    <div className="mt-10 pt-8 border-t border-border">
      <h3 className="font-display text-xl md:text-2xl font-700 mb-3">
        Online Learning<span className="text-primary">.</span>
      </h3>
      <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">
        Search the leading online learning platforms for {roleName}-specific courses - from free taster modules to accredited qualifications.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {onlineProviders.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border p-5 hover:border-primary transition-colors flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <h4 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                  {p.name}
                </h4>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-muted-foreground font-body text-xs leading-relaxed">
              {p.note}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
