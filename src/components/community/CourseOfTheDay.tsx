import { useEffect, useState } from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CourseOfTheDayProps {
  industry: string;
  industryLabel: string;
}

interface ReedCourse {
  title?: string;
  url?: string;
  provider?: string | null;
  searchUrl?: string;
  fallbackUrl?: string;
  keyword?: string;
  error?: string;
}

const todayKey = () => new Date().toISOString().slice(0, 10);
const CACHE_VERSION = "v2";

const CourseOfTheDay = ({ industry, industryLabel }: CourseOfTheDayProps) => {
  const [course, setCourse] = useState<ReedCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const cacheKey = `reed-course:${CACHE_VERSION}:${industry}:${todayKey()}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setCourse(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {}

    supabase.functions
      .invoke("fetch-reed-course", { body: { industry } })
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setCourse({ error: "fetch-failed" });
        } else {
          setCourse(data as ReedCourse);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [industry]);

  const href =
    course?.url ||
    course?.searchUrl ||
    course?.fallbackUrl ||
    `https://www.reed.co.uk/courses/${encodeURIComponent(industryLabel)}`;

  const title = loading
    ? "Finding a course…"
    : course?.title ?? `Browse ${industryLabel} courses on Reed`;

  const subtitle = course?.provider ?? "Reed.co.uk · Courses";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-background p-3 hover:border-foreground/30 transition-colors group"
    >
      <GraduationCap className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          Course of the day
          <span className="inline-flex items-center rounded-full bg-[hsl(354,80%,45%)]/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[hsl(354,80%,45%)]">
            Reed
          </span>
        </div>
        <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {title}
        </div>
        {!loading && (
          <div className="text-[10px] text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </a>
  );
};

export default CourseOfTheDay;
