import { motion } from "framer-motion";
const voxpopsVideo = { url: "https://https-howdoyoudo-group.lovable.app/__l5e/assets-v1/867b66a7-10b5-43f6-9316-a1c231af2265/hdyd-voxpops-v6.mp4" };
import { useEffect, useRef } from "react";

const INDUSTRIES = ["Fashion", "Football", "Music", "Beauty", "Food", "Travel", "Technology", "Beer", "Pets", "Gaming"];

const About = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) video.play().catch(() => {});
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

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 overflow-hidden"
        >
          <div className="md:hidden mx-auto w-full max-w-[320px]">
            <div className="relative aspect-[9/16] bg-transparent">
              <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none z-10" viewBox="0 0 660 1080" preserveAspectRatio="none" aria-hidden="true">
                <path fillRule="evenodd" fill="hsl(var(--background))" stroke="none" d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,360 632,540 Q636,720 630,1050 Q480,1052 330,1050 Q180,1048 30,1052 Q24,720 28,540 Q24,360 30,30 Z M50,50 Q180,46 330,48 Q480,50 610,52 Q612,360 610,540 Q612,720 610,1030 Q480,1032 330,1030 Q180,1028 50,1032 Q48,720 50,540 Q48,360 50,50 Z" />
                <g fill="none" stroke="hsl(var(--foreground))" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M30,30 Q180,24 330,28 Q480,32 630,30 Q636,360 632,540 Q636,720 630,1050 Q480,1052 330,1050 Q180,1048 30,1052 Q24,720 28,540 Q24,360 30,30 Z" />
                  <path d="M50,50 Q180,46 330,48 Q480,50 610,52 Q612,360 610,540 Q612,720 610,1030 Q480,1032 330,1030 Q180,1028 50,1032 Q48,720 50,540 Q48,360 50,50 Z" />
                  <circle cx="330" cy="20" r="3" fill="hsl(var(--primary))" />
                  <path d="M325,4 Q330,-4 335,4" />
                </g>
              </svg>
              <video ref={videoRef} src="/videos/promo-web.mp4" poster="/videos/promo-poster.jpg" loop playsInline preload="metadata" controls controlsList="nodownload noplaybackrate" className="absolute inset-0 w-full h-full object-cover rounded-sm" />
            </div>
          </div>
          <video src={voxpopsVideo.url} poster="/videos/hdyd-voxpops-1-poster.jpg" loop muted playsInline preload="metadata" controls controlsList="nodownload noplaybackrate" className="hidden md:block w-full h-64 md:h-[28rem] object-cover object-center" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:hidden mb-12">
          <video src={voxpopsVideo.url} poster="/videos/hdyd-voxpops-1-poster.jpg" loop muted playsInline preload="metadata" controls controlsList="nodownload noplaybackrate" className="w-full aspect-video object-cover rounded-md border border-border" />
        </motion.div>

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">About</p>
            <h2 className="font-display text-4xl md:text-5xl font-800 leading-[0.9]">
              How Do<br />You Do<span className="text-primary">?</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col justify-center">
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body mb-4">
              How Do You Do is a small but growing community of young people, writers, comedians, experts and producers in the UK and US.
            </p>
            <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-500">
              We're building something for people who are curious about the industries they love and want to understand how they really work.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {INDUSTRIES.map((ind) => (
                <span key={ind} className="px-3 py-1 border border-border font-display font-700 text-xs uppercase tracking-wide text-foreground">{ind}</span>
              ))}
              <span className="px-3 py-1 border border-primary font-display font-700 text-xs uppercase tracking-wide text-primary">+ more</span>
            </div>
          </motion.div>
        </div>

        {/* Sections */}
        <div className="space-y-0">

          {/* Why */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h3 className="font-display text-2xl md:text-3xl font-800">Why<span className="text-primary">?</span></h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">Millions of young people are leaving education without a clear idea of what they want to do next, who to talk to or where to start.</p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">At the same time, the outlook can feel pretty bleak. Headlines are full of rising living costs, AI taking jobs and a tough employment market.</p>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-600">How Do You Do exists to help solve that. Feeding our curiosities and helping people discover the things they didn't know existed. If you can't see it, you can't be part of it.</p>
            </div>
          </motion.div>

          {/* What We Do */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h3 className="font-display text-2xl md:text-3xl font-800">What We Do<span className="text-primary">.</span></h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">How Do You Do is a fun and informative chat show. Clips, stories, shorts and deep insight. Every week, founders, experts, young people and comedians get together and unpack the industries we use and obsess over every day.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                {["How industries really work","Who the big characters are","The challengers and disruptors","How the money is made","What the jobs actually involve","What new roles are emerging","What skills matter","The stories shaping what's next"].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-primary font-800 mt-0.5">→</span>
                    <span className="text-muted-foreground font-body text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-600">No jargon. No boring business podcasts. No endless corporate speak.<br />Just honest conversations and practical insight from people who've actually done it.</p>
            </div>
          </motion.div>

          {/* The Platform */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h3 className="font-display text-2xl md:text-3xl font-800">The Platform<span className="text-primary">.</span></h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">Alongside the show, we've built a platform that organises opportunities around industries, not job titles. Each industry includes things to read, watch, listen to, attend and explore, plus thousands of live job opportunities across marketing, finance, technology, AI, design, operations, sales and more.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
                {["Internships","Apprenticeships","Graduate opportunities","Side hustles","Industry news","Mentoring","Interview support","Financial skills","Further education","Industry learning","Upskilling","CV building"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground font-body text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-600">Everything in one place.</p>
            </div>
          </motion.div>

          {/* Howdy */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h3 className="font-display text-2xl md:text-3xl font-800">And Howdy<span className="text-primary">.</span></h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">Howdy is our friendly helpful sidekick. Howdy will help you discover industries, find opportunities, build your profile, improve your CV and LinkedIn, prepare applications and connect with relevant employers.</p>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-600">The more you use it, the more useful it becomes. Think of it as a helping hand, guide and introduction service rolled into one.</p>
            </div>
          </motion.div>

          {/* For Employers */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h3 className="font-display text-2xl md:text-3xl font-800">For Employers<span className="text-primary">.</span></h3>
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">For employers, brands and investors, How Do You Do offers direct access to brilliant talent at scale.</p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-body">Our profiles start with what people love, what they're interested in and what they're curious about — not just their qualifications. And not AI generated slop.</p>
              <p className="text-foreground text-base md:text-lg leading-relaxed font-body font-600">That means better matches, stronger engagement and access to people who may not be actively looking but are open to discovering something new.</p>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border-t border-border py-16">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-4">Our Mission</p>
              <p className="font-display text-2xl md:text-4xl font-800 leading-tight">
                To help people better understand the industries they love, discover opportunities they never knew existed and meet the people making them happen<span className="text-primary">.</span>
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
