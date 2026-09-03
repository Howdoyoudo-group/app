import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import RiasecHexagon from "@/components/profile/RiasecHexagon";
import type { RiasecScores, WorkValues } from "@/components/RiasecQuiz";
import type { LovePhoto } from "@/components/profile/LovesGallery";
import type { FamilyPhoto } from "@/components/profile/FamilyPetsGallery";
import { SECTION_KEYS, isSectionVisible } from "@/lib/profileSections";
import {
  Loader2, User, Quote, Sparkles, MapPin, Briefcase, GraduationCap, Award,
  Video, Heart, Building2, ArrowLeft,
} from "lucide-react";

interface PublicProfileRow {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  home_town: string | null;
  home_town_blurb: string | null;
  career_level: string | null;
  location_preference: string | null;
  industry_interests: string[] | null;
  role_preferences: string[] | null;
  riasec_scores: RiasecScores | null;
  work_values: WorkValues | null;
  job_preferences: Record<string, any> | null;
  understand_me_results: {
    personalityInsights?: string;
    roleMatches?: { role: string; slug: string; percentage: number }[];
  } | null;
}

const cardBase = "border-2 border-foreground bg-card rounded-2xl p-5 shadow-[3px_3px_0_0_hsl(var(--foreground))]";
const eyebrowCls = "font-body text-[11px] uppercase tracking-wider text-muted-foreground";
const titleCls = "font-display font-900 text-lg text-foreground";
const chipCls = "inline-flex items-center px-3 py-1.5 border border-foreground/30 rounded-full text-xs font-body font-500 text-foreground/80";

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<PublicProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!handle) { setLoading(false); return; }
      const { data } = await supabase.rpc("get_public_profile", { _handle: handle } as never);
      if (cancelled) return;
      const row = Array.isArray(data) ? (data[0] as unknown as PublicProfileRow) : null;
      setProfile(row || null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <SEO title="Profile not found" path={`/u/${handle || ""}`} noIndex />
        <h1 className="font-display font-900 text-xl uppercase tracking-wide">Profile not found</h1>
        <p className="font-body text-sm text-muted-foreground max-w-sm">
          This profile doesn't exist, or its owner hasn't made it public.
        </p>
        <Link to="/" className="text-primary font-body text-sm underline">Back to home</Link>
      </div>
    );
  }

  const jp = profile.job_preferences || {};
  const pb = jp.profileBuilder || {};
  const visibleSections: Record<string, boolean> = pb.visibleSections || {};
  const show = (key: string) => SECTION_KEYS.includes(key) && isSectionVisible(visibleSections, key);

  const lovePhotos: LovePhoto[] = Array.isArray(jp.lovePhotos) ? jp.lovePhotos : [];
  const familyPhotos: FamilyPhoto[] = Array.isArray(jp.familyPhotos) ? jp.familyPhotos : [];
  const funFacts: { q: string; a: string }[] = Array.isArray(jp.funFacts) ? jp.funFacts : [];
  const passions: string[] = Array.isArray(jp.passions) ? jp.passions : [];
  const targetCompanies: string[] = Array.isArray(jp.targetCompanies) ? jp.targetCompanies : [];
  const targetRoles: string[] = Array.isArray(jp.targetRoles) ? jp.targetRoles : [];
  const promptAnswers: Record<string, string> = pb.promptAnswers && typeof pb.promptAnswers === "object" ? pb.promptAnswers : {};
  const experience: { company?: string; title: string; dates?: string; description?: string; logoUrl?: string; link?: string }[] =
    Array.isArray(pb.experience) ? pb.experience.filter((e: any) => e?.company || e?.title) : [];
  const education: { school: string; qualification?: string; dates?: string; grade?: string }[] =
    Array.isArray(pb.education) ? pb.education.filter((e: any) => e?.school) : [];
  const qualifications: { name: string; issuer?: string; year?: string }[] =
    Array.isArray(pb.qualifications) ? pb.qualifications.filter((q: any) => q?.name) : [];

  const displayName = profile.full_name || "Someone great";
  const description = profile.career_level
    ? `${displayName} - ${profile.career_level}${profile.home_town ? `, ${profile.home_town}` : ""} - see their profile on How do you do?`
    : `${displayName}'s profile on How do you do?`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={displayName} description={description} path={`/u/${handle}`} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> howdoyoudo.co.uk
        </Link>

        {/* Header */}
        <div className={`${cardBase} flex flex-col sm:flex-row items-start gap-5 mb-6`}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-foreground shrink-0 bg-muted">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-900 text-2xl sm:text-3xl text-foreground leading-tight">
              {displayName}
              {jp.pronouns ? <span className="text-muted-foreground font-body font-400 text-base ml-2">({jp.pronouns})</span> : null}
            </h1>
            {jp.tagline && <p className="font-body text-sm text-foreground/80 mt-1">{jp.tagline}</p>}
            <div className="flex flex-wrap gap-3 mt-3 text-xs font-body text-muted-foreground">
              {profile.career_level && (
                <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {profile.career_level}</span>
              )}
              {profile.home_town && (
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.home_town}</span>
              )}
            </div>
            {profile.home_town_blurb && (
              <p className="font-body text-xs text-muted-foreground mt-2">{profile.home_town_blurb}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {show("story") && pb.intro && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Your story</p>
              <h2 className={titleCls}>In their own words</h2>
              <p className="mt-3 font-body text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{pb.intro}</p>
              {pb.lookingFor && (
                <p className="mt-3 font-body text-sm text-foreground/70 border-l-2 border-primary/40 pl-3">
                  Looking for: {pb.lookingFor}
                </p>
              )}
            </div>
          )}

          {show("about") && profile.understand_me_results?.personalityInsights && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>The story so far</p>
              <h2 className={titleCls}>About, by us</h2>
              <div className="mt-3 flex gap-3">
                <Quote className="w-5 h-5 text-primary shrink-0" />
                <p className="font-body text-sm text-foreground/85 italic leading-relaxed">
                  {profile.understand_me_results.personalityInsights}
                </p>
              </div>
            </div>
          )}

          {show("riasec") && profile.riasec_scores && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Career personality</p>
              <h2 className={titleCls}>How they're wired</h2>
              <div className="mt-3">
                <RiasecHexagon scores={profile.riasec_scores} />
              </div>
            </div>
          )}

          {show("values") && profile.work_values && Object.keys(profile.work_values).length > 0 && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Work values</p>
              <h2 className={titleCls}>What they want from work</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(profile.work_values)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([k]) => (
                    <span key={k} className={chipCls}>{k}</span>
                  ))}
              </div>
            </div>
          )}

          {show("skills") && passions.length > 0 && (
            <div className={cardBase}>
              <p className={eyebrowCls}>What they love doing</p>
              <h2 className={titleCls}>Skills &amp; passions</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {passions.map((p) => <span key={p} className={chipCls}>{p}</span>)}
              </div>
            </div>
          )}

          {show("industries") && profile.industry_interests && profile.industry_interests.length > 0 && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Following</p>
              <h2 className={titleCls}>Industries</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.industry_interests.map((i) => <span key={i} className={chipCls}>{i}</span>)}
              </div>
            </div>
          )}

          {show("hitlist") && (targetCompanies.length > 0 || targetRoles.length > 0) && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Most wanted</p>
              <h2 className={titleCls}>Companies &amp; roles they're chasing</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...targetCompanies, ...targetRoles].map((t) => (
                  <span key={t} className={chipCls}><Building2 className="w-3 h-3 mr-1" />{t}</span>
                ))}
              </div>
            </div>
          )}

          {show("roles") && profile.understand_me_results?.roleMatches && profile.understand_me_results.roleMatches.length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Top role matches</p>
              <h2 className={titleCls}>What they're good at</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.understand_me_results.roleMatches.slice(0, 6).map((m, i) => (
                  <Link
                    key={i}
                    to={`/roles/${m.slug}`}
                    className="group block border-2 border-foreground rounded-2xl p-3 bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-700 text-sm">{m.role}</span>
                      <span className="font-display font-800 text-base">{m.percentage}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {show("prompts") && Object.keys(promptAnswers).length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>In their words</p>
              <h2 className={titleCls}>Quick prompts</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(promptAnswers).filter(([, a]) => a?.trim()).map(([q, a]) => (
                  <div key={q} className="border-2 border-border rounded-2xl p-3 bg-background/60">
                    <p className="font-display font-700 text-sm text-foreground mb-1">{q}</p>
                    <p className="font-body text-sm text-foreground/80">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("qa") && funFacts.filter((f) => f.a?.trim()).length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Fun facts</p>
              <h2 className={titleCls}>Things you don't know about them</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {funFacts.filter((f) => f.a?.trim()).map((f, i) => (
                  <div key={i} className="border-2 border-border rounded-2xl p-3 bg-background/60">
                    <p className="font-display font-700 text-sm text-foreground mb-1">{f.q}</p>
                    <p className="font-body text-sm text-foreground/80">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("employment") && experience.length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Experience</p>
              <h2 className={titleCls}>Where they've worked</h2>
              <div className="mt-3 space-y-3">
                {experience.map((e, i) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-3">
                    <p className="font-display font-700 text-sm text-foreground">{e.title}{e.company ? ` · ${e.company}` : ""}</p>
                    {e.dates && <p className="font-body text-xs text-muted-foreground">{e.dates}</p>}
                    {e.description && <p className="font-body text-xs text-foreground/70 mt-1">{e.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("education") && education.length > 0 && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Education</p>
              <h2 className={titleCls}><GraduationCap className="inline w-4 h-4 mr-1 text-primary" />School &amp; study</h2>
              <div className="mt-3 space-y-2">
                {education.map((e, i) => (
                  <div key={i}>
                    <p className="font-display font-700 text-sm text-foreground">{e.school}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {[e.qualification, e.dates, e.grade].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("qualifications") && qualifications.length > 0 && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Recognition</p>
              <h2 className={titleCls}><Award className="inline w-4 h-4 mr-1 text-primary" />Qualifications &amp; awards</h2>
              <div className="mt-3 space-y-2">
                {qualifications.map((q, i) => (
                  <div key={i}>
                    <p className="font-display font-700 text-sm text-foreground">{q.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{[q.issuer, q.year].filter(Boolean).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("video") && pb.videoUrl && (
            <div className={cardBase}>
              <p className={eyebrowCls}>Meet them</p>
              <h2 className={titleCls}><Video className="inline w-4 h-4 mr-1 text-primary" />Intro video</h2>
              <a
                href={pb.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-primary font-body text-sm hover:underline"
              >
                Watch <Sparkles className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {show("loves") && lovePhotos.length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Obsessed with</p>
              <h2 className={titleCls}><Heart className="inline w-4 h-4 mr-1 text-primary" />Things they love</h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lovePhotos.map((p, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border">
                    <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover" />
                    {p.caption && <p className="font-body text-[11px] text-muted-foreground p-1.5">{p.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {show("family") && familyPhotos.length > 0 && (
            <div className={`${cardBase} md:col-span-2`}>
              <p className={eyebrowCls}>Home life</p>
              <h2 className={titleCls}>Family &amp; pets</h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {familyPhotos.map((p, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border">
                    <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover" />
                    {p.caption && <p className="font-body text-[11px] text-muted-foreground p-1.5">{p.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center font-body text-xs text-muted-foreground mt-10">
          Made with <Link to="/" className="text-primary underline">How do you do?</Link>
        </p>
      </div>
    </div>
  );
}
