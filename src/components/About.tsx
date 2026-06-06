import { motion } from "framer-motion";
const voxpopsVideo = { url: "https://https-howdoyoudo-group.lovable.app/__l5e/assets-v1/867b66a7-10b5-43f6-9316-a1c231af2265/hdyd-voxpops-v6.mp4" };
import { useEffect, useRef } from "react";
import aboutStudio from "@/assets/about-studio.jpg";

const About = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="about" className="py-20 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        {/* Studio image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 overflow-visible"
        >
          {/* Mobile: video inside the same hand-drawn ornate picture frame as the desktop hero promo */}
          <div className="md:hidden mx-auto w-full max-w-[320px]">
            <div className="relative aspect-[9/16] bg-transparent">
              <svg
                className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none z-10"
                viewBox="0 0 660 1080"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  fill="hsl(var(--background))"
                  stroke="none"
                  d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,360 632,540 Q636,720 630,1050 Q480,1052 330,1050 Q180,1048 30,1052 Q24,720 28,540 Q24,360 30,30 Z M50,50 Q180,46 330,48 Q480,50 610,52 Q612,360 610,540 Q612,720 610,1030 Q480,1032 330,1030 Q180,1028 50,1032 Q48,720 50,540 Q48,360 50,50 Z"
                />
                <g
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,360 632,540 Q636,720 630,1050 Q480,1052 330,1050 Q180,1048 30,1052 Q24,720 28,540 Q24,360 30,30 Z" />
                  <path d="M50,50 Q180,46 330,48 Q480,50 610,52 Q612,360 610,540 Q612,720 610,1030 Q480,1032 330,1030 Q180,1028 50,1032 Q48,720 50,540 Q48,360 50,50 Z" />
                  <circle cx="60" cy="40" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="200" cy="38" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="460" cy="38" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="600" cy="40" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="60" cy="1042" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="330" cy="1042" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="600" cy="1042" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="40" cy="300" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="40" cy="540" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="40" cy="780" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="620" cy="300" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="620" cy="540" r="2.5" fill="hsl(var(--foreground))" />
                  <circle cx="620" cy="780" r="2.5" fill="hsl(var(--foreground))" />
                  {/* Top centre cartouche */}
                  <path d="M300,28 Q310,8 330,4 Q350,8 360,28" />
                  <path d="M315,18 Q330,10 345,18" />
                  <circle cx="330" cy="20" r="3" fill="hsl(var(--primary))" />
                  {/* Bottom centre flourish */}
                  <path d="M300,1052 Q310,1070 330,1075 Q350,1070 360,1052" />
                  <circle cx="330" cy="1063" r="3" fill="hsl(var(--primary))" />
                  {/* Corner curls */}
                  <path d="M30,30 Q12,18 6,32 Q4,46 18,50 Q26,42 30,50" />
                  <circle cx="10" cy="42" r="2.5" fill="hsl(var(--primary))" />
                  <path d="M630,30 Q648,18 654,32 Q656,46 642,50 Q634,42 630,50" />
                  <circle cx="650" cy="42" r="2.5" fill="hsl(var(--primary))" />
                  <path d="M30,1050 Q12,1063 6,1048 Q4,1033 18,1030 Q26,1038 30,1030" />
                  <circle cx="10" cy="1037" r="2.5" fill="hsl(var(--primary))" />
                  <path d="M630,1050 Q648,1063 654,1048 Q656,1033 642,1030 Q634,1038 630,1030" />
                  <circle cx="650" cy="1037" r="2.5" fill="hsl(var(--primary))" />
                  {/* Hanging hook */}
                  <path d="M325,4 Q330,-4 335,4" />
                </g>
              </svg>
              <video
                ref={videoRef}
                src="/videos/promo-web.mp4"
                poster="/videos/promo-poster.jpg"
                loop
                playsInline
                preload="metadata"
                controls
                controlsList="nodownload noplaybackrate"
                className="absolute inset-0 w-full h-full object-cover rounded-sm"
                aria-label="Howdoyoudo? promo"
              />
            </div>
          </div>
          {/* Desktop: voxpops video replacing the studio image */}
          <video
            src={voxpopsVideo.url}
            poster="/videos/hdyd-voxpops-1-poster.jpg"
            loop
            muted
            playsInline
            preload="metadata"
            controls
            controlsList="nodownload noplaybackrate"
            className="hidden md:block w-full h-64 md:h-[28rem] object-cover object-center"
            aria-label="Howdoyoudo voxpops"
          />

          </motion.div>

          {/* Mobile: voxpops video sits between the HOW DO YOU DO heading and WHAT WE DO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:hidden -mt-4"
          >
            <video
              src={voxpopsVideo.url}
              poster="/videos/hdyd-voxpops-1-poster.jpg"
              loop
              muted
              playsInline
              preload="metadata"
              controls
              controlsList="nodownload noplaybackrate"
              className="w-full aspect-video object-cover rounded-md border border-border"
              aria-label="Howdoyoudo voxpops"
            />
          </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
              About
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-800 leading-[0.9]">
              How Do
              <br />
              You Do<span className="text-gradient">?</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-12"
          >
            {/* Who are we */}
            <div>
              <h3 className="font-display text-xl md:text-2xl font-700 mb-4">
                Who are we<span className="text-primary">?</span>
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                The <span className="font-700 text-foreground">How Do You Do</span> community is a growing group of young people, writers, comics, experts and producers - investing their time, energy and experience, and committed to turning traditional business podcasts and dull career websites on their head.
              </p>
            </div>

            {/* What are we */}
            <div className="border-t border-border pt-8">
              <h3 className="font-display text-xl md:text-2xl font-700 mb-4">
                What are we<span className="text-primary">?</span>
              </h3>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-500 mb-4">
                An entertaining magazine show - and a job platform/aggregator with a clear mission.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                In 2026, millions of young people are leaving education without a clear idea of what they want to do, who to talk to, or how to make their next move. And the outlook (certainly the narrative) is bleak and miserable - over 1m young unemployed; cost of living; AI taking all jobs; and a jobs market taking its biggest hit since the pandemic <span className="italic">(City AM, 20th April 2026)</span>.
              </p>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-500 mb-4">
                The How Do You Do Group exists to change that.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                We are here to help 16–30 year olds discover careers they're excited and curious about - by unpacking the industries they love and live in, and seeing things from the inside.
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                <span className="font-700 text-foreground">No jargon. No boring job boards.</span> Honest, fun (and funny) conversation, real experiences and practical insight. And 1000s of live tips and jobs every day.
              </p>
            </div>

            {/* What do we do */}
            <div className="border-t border-border pt-8">
              <h3 className="font-display text-xl md:text-2xl font-700 mb-4">
                What do we do<span className="text-primary">?</span>
              </h3>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                A weekly magazine show recorded by experts and comedians - explaining the mechanics behind industries, including YT shorts, TikTok and Instagram reels that link straight to the HDYD Job Platform.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                The HDYD Job Platform curates industries by the things we love and the way we live - fashion, football, beauty, beer, pets - linking to a range of role types like marketing, finance, technology and AI.
              </p>

              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-500 mb-3">
                Turning the traditional CV on its head - starting with experience and interests first; qualifications second:
              </p>
              <ul className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4 space-y-1 pl-5 list-disc marker:text-primary">
                <li>24 live industries (plan, read, listen, watch, who, attend, jobs)</li>
                <li>1000s of roles</li>
                <li>
                  Resources platform aggregating essential content:
                  <ul className="mt-1 space-y-0.5 pl-5 list-[circle] marker:text-primary/60">
                    <li>Business &amp; Startups</li>
                    <li>Employability, Internships &amp; Graduates</li>
                    <li>Money &amp; Financial Skills</li>
                    <li>Careers Advice</li>
                    <li>Apprenticeships</li>
                    <li>Profile Builder</li>
                    <li>Interview Skills</li>
                    <li>Mentoring</li>
                    <li>Further Education &amp; University</li>
                    <li>Industry Learning</li>
                  </ul>
                </li>
              </ul>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                We offer a helping hand to understand the huge range of jobs in each industry - sharing interesting articles and news, relevant courses and learning, and live internships and jobs. Daily emails. Daily news. Daily jobs.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
                All supported by our chatbot <span className="font-700 text-foreground">Howdy</span>, who tailors your experience and plans, and introduces you to relevant employers and jobs. Plus we can build your CV, your LinkedIn profile, and help with your applications.
              </p>

              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-500 mb-3">
                A smart algorithm finds suitable jobs based on your profile:
              </p>
              <ul className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4 space-y-1 pl-5 list-disc marker:text-primary">
                <li>Level &amp; salary</li>
                <li>Industries &amp; roles</li>
                <li>Location</li>
                <li>Passion boost - surfacing things you love</li>
                <li>Learns from your behaviour and search history</li>
              </ul>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                For employers, brands and investors, we introduce you to brilliant talent - with expertly and uniquely curated profiles, starting with what people love and the things they are curious about. We bring a scale audience and fast, efficient access to the best talent UK / [US] wide - including not just those looking for a role, but those thinking about a change.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
