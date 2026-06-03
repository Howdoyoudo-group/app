import { useState, useEffect } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, ArrowRight, Play } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import PodcastGrid from "@/components/PodcastGrid";
import { getSideHustleTopic, type SideHustleLink } from "@/data/side-hustle-topics";
import tabWatch from "@/assets/tab-watch.png";
import tabListen from "@/assets/tab-listen.png";
import tabRead from "@/assets/tab-read.png";
import tabWho from "@/assets/tab-who.png";

type TabId = "watch" | "listen" | "read" | "help";

const TAB_ICONS: Record<TabId, string> = {
  watch: tabWatch,
  listen: tabListen,
  read: tabRead,
  help: tabWho,
};

const TAB_LABELS: Record<TabId, string> = {
  watch: "Watch",
  listen: "Listen",
  read: "Read",
  help: "Help",
};

const getYouTubeVideoId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const getYouTubeHandle = (url: string): string | null => {
  const m = url.match(/youtube\.com\/@([A-Za-z0-9_.-]+)/);
  return m ? m[1] : null;
};

const stringToHue = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
};

const WatchCard = ({ res }: { res: SideHustleLink }) => {
  const videoId = getYouTubeVideoId(res.url);
  const handle = getYouTubeHandle(res.url);
  const hue = stringToHue(res.name);

  const thumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : handle
    ? `https://unavatar.io/youtube/${handle}`
    : null;

  return (
    <a
      href={res.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-border hover:border-primary transition-all group overflow-hidden bg-foreground/5"
    >
      <div className="relative aspect-video overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={res.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%), hsl(${(hue + 40) % 360}, 50%, 15%))`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors leading-snug">
          {res.name}
        </h3>
        <p className="text-muted-foreground font-body text-xs mt-1 line-clamp-2">
          {res.description}
        </p>
      </div>
    </a>
  );
};

const getDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const ResourceCard = ({ res }: { res: SideHustleLink }) => {
  const isInternal = res.url.startsWith("/");
  const domain = !isInternal ? getDomain(res.url) : null;
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSources = domain
    ? [
        `https://logo.clearbit.com/${domain}`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      ]
    : [];
  const logo = logoSources[logoIdx] ?? null;

  const inner = (
    <>
      <div className="flex items-start gap-3">
        {logo && (
          <div className="w-12 h-12 shrink-0 border border-border bg-background flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt=""
              className="w-full h-full object-contain p-1"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => {
                if (logoIdx < logoSources.length - 1) setLogoIdx(logoIdx + 1);
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">
              {res.name}
            </h3>
            {isInternal ? (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-muted-foreground font-body text-xs leading-relaxed mt-1.5">
            {res.description}
          </p>
          {res.tags && res.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {res.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-body font-600 uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
  const cls = "group block p-4 border border-border hover:bg-muted/30 transition-colors";
  if (isInternal) return <Link to={res.url} className={cls}>{inner}</Link>;
  return (
    <a href={res.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
};

const SideHustleTopic = () => {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getSideHustleTopic(slug) : undefined;
  const [active, setActive] = useState<TabId>("watch");
  const navigate = useNavigate();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dx > 80 && dy < 60) navigate("/side-hustles");
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [navigate]);

  if (!topic) return <Navigate to="/side-hustles" replace />;

  const items = topic[active];
  const tabs: TabId[] = ["watch", "listen", "read", "help"];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${topic.title} - Side Hustles`}
        description={topic.description}
        path={`/side-hustles/${topic.slug}`}
      />

      <section className="pt-6 pb-8 md:pt-10 md:pb-12 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl mb-6">
          <Link
            to="/side-hustles"
            className="inline-flex items-center gap-2 font-display text-sm font-700 tracking-wide text-primary hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Side Hustles
          </Link>
        </div>
      </section>

      <section className="pb-8 md:pb-12 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <img
                src={topic.icon}
                alt=""
                className="w-16 h-16 md:w-20 md:h-20"
                style={{ filter: "brightness(0)" }}
                width={512}
                height={512}
              />
              <p className="text-primary text-xs tracking-[0.3em] uppercase font-body">
                Side Hustle
              </p>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-900 leading-[0.9] tracking-tight mb-4">
              {topic.title}<span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground font-body text-base md:text-lg max-w-2xl">
              {topic.description}
            </p>

            <div className="grid grid-cols-4 gap-3 mt-10 border-b border-border pb-6">
              {tabs.map((id) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`flex flex-col items-center gap-2 px-3 py-4 transition-all border-2 ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={TAB_ICONS[id]}
                      alt={TAB_LABELS[id]}
                      className={`w-10 h-10 md:w-12 md:h-12 object-contain transition-opacity ${
                        isActive ? "opacity-100" : "opacity-60"
                      }`}
                      loading="lazy"
                    />
                    <span
                      className={`font-display font-700 text-xs tracking-wide uppercase transition-colors ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {TAB_LABELS[id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="font-display text-2xl md:text-3xl font-900 tracking-tight mb-6">
                {TAB_LABELS[active]}<span className="text-primary">.</span>
              </h2>
              {items.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">
                  We're still curating this section - check back soon.
                </p>
              ) : active === "watch" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((res) => (
                    <WatchCard key={res.url} res={res} />
                  ))}
                </div>
              ) : active === "listen" ? (
                <PodcastGrid
                  podcasts={items.map((r) => ({
                    title: r.name.replace(/\s*\(.*?\)\s*$/, "").replace(/\s*-.*$/, "").trim(),
                    description: r.description,
                    url: r.url,
                  }))}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((res) => (
                    <ResourceCard key={res.url} res={res} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 pt-8 border-t border-border flex justify-center">
            <Link
              to="/side-hustles"
              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors font-display font-700 text-sm uppercase tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" /> Back to all Side Hustles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SideHustleTopic;
