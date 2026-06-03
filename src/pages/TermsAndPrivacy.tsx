import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Trash2, FileText, Mail, MessageCircle } from "lucide-react";

const TermsAndPrivacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl font-900 leading-[0.9] tracking-tight mb-4">
          Terms & Privacy<span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-12 max-w-xl">
          How we collect, store, and protect your data - and your rights under UK law.
        </p>

        <p className="text-muted-foreground font-body text-sm mb-12">
          Last updated: 23 April 2026
        </p>

        {/* Data Controller */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Data Controller<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              Howdoyoudo Group ("we", "us", "our") is the data controller responsible for your personal data.
              We are committed to protecting your privacy in accordance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and
              the <strong>Data Protection Act 2018</strong>.
            </p>
            <p>
              For any data protection queries, contact us at:{" "}
              <a href="mailto:privacy@howdoyoudo.group" className="text-primary hover:underline">
                privacy@howdoyoudo.group
              </a>
            </p>
          </div>
        </section>

        {/* What We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              What Data We Collect<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>When you sign up to our platform or newsletter, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Name</strong> - to personalise your experience</li>
              <li><strong>Email address</strong> - to send you newsletters, job alerts, and updates</li>
              <li><strong>Phone number</strong> (optional) - if provided for additional contact preferences</li>
              <li><strong>Profile photo</strong> (optional) - if you choose to upload one to your profile</li>
              <li><strong>Industry interests</strong> - to tailor content and job recommendations to you</li>
              <li><strong>Job preferences</strong> - including target companies, target roles, salary expectations and location, to match you with relevant opportunities</li>
              <li><strong>CV and LinkedIn information</strong> (optional) - if you upload them, to power our AI matching and "Understand Me" tools</li>
              <li><strong>Career personality results</strong> - RIASEC scores from our optional in-product quiz</li>
              <li><strong>Activity data</strong> - pages, companies and industries you interact with on the platform, used to personalise your experience and (if you opt in) to surface you to relevant employers</li>
            </ul>
            <p>We do not collect sensitive personal data (e.g. health, ethnicity, political views).</p>
          </div>
        </section>

        {/* Lawful Basis */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Lawful Basis for Processing<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>We process your personal data under the following lawful bases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Consent</strong> - you actively sign up and opt in to receive communications from us</li>
              <li><strong>Legitimate interest</strong> - to improve our platform and provide relevant career content</li>
              <li><strong>Contract</strong> - where necessary to provide services you've requested</li>
            </ul>
            <p>You may withdraw your consent at any time by unsubscribing from our emails or contacting us directly.</p>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              How We Use Your Data<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Send you industry newsletters, articles, and job alerts tailored to your interests</li>
              <li>Deliver daily digest emails with curated content for your chosen industries</li>
              <li>Improve our platform content and user experience</li>
              <li>Communicate important updates about our services</li>
            </ul>
            <p>We will <strong>never</strong> sell your personal data to third parties.</p>
          </div>
        </section>

        {/* Sharing with Employers */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Sharing with Employers<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              We have introduced a feature that allows verified employers on our platform to discover candidates
              who appear to be a strong match for their roles. This sharing is <strong>strictly opt-in</strong> and
              off by default.
            </p>
            <p><strong>What employers may see (only if you opt in):</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>An anonymised display name (first name + last initial) and, if uploaded, your profile photo</li>
              <li>Your selected industry interests and role preferences</li>
              <li>Your career level and salary expectation</li>
              <li>Your location preference</li>
              <li>Your "Most Wanted" target companies and target roles</li>
              <li><strong>Your CV summary</strong> - the structured analysis we generate from your CV or LinkedIn (best-fit roles, industry fit, transferable skills, and a short personality insight). This lets employers understand your background before reaching out, so contact requests are more relevant.</li>
            </ul>
            <p><strong>What employers will never see without your explicit action:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your full name, email address or phone number - these are only shared if you choose to respond to a contact request and tick "share my details"</li>
              <li>Your raw CV file or LinkedIn screenshot - only the structured summary above is shown; the original document stays private</li>
              <li>Your detailed RIASEC personality scores or free-text passions</li>
            </ul>
            <p><strong>Who can see you:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Only verified employers whose company industry matches one of your industry interests, or who appear in your "Most Wanted" target companies, or whose company you have actively engaged with on the platform</li>
              <li>An employer can send you a contact request - you decide whether to respond, and whether to share your contact details once or always. We never reveal your contact details automatically.</li>
            </ul>
            <p>
              <strong>Your control:</strong> You can turn employer visibility on or off at any time from your
              profile settings, or by re-running the onboarding journey. Switching it off removes you from
              employer search results immediately. The lawful basis for this processing is your explicit consent
              under UK GDPR Article 6(1)(a), which you may withdraw at any time.
            </p>
          </div>
        </section>

        {/* WhatsApp messaging */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              WhatsApp Messaging<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              Premium members can opt in to receive their daily morning briefing and top-matched jobs via WhatsApp.
              You must explicitly verify your mobile number with a one-time 6-digit code before any further messages are sent.
            </p>
            <p>
              Messages are delivered through Twilio acting as our processor. We store your mobile number, opt-in status,
              and a log of messages sent (timestamp, template, delivery status — never the full body).
              Standard WhatsApp / carrier rates may apply at the recipient's end; we do not charge for messages.
            </p>
            <p>
              You can disconnect WhatsApp or pause the digest at any time from your profile, or by replying <strong>STOP</strong> to any
              message. Disconnecting removes your number and verification within 30 days.
            </p>
          </div>
        </section>

        {/* Data Storage & Security */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Data Storage & Security<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              Your data is stored securely using industry-standard cloud infrastructure with encryption at rest and in transit.
              We implement appropriate technical and organisational measures to protect against unauthorised access,
              alteration, disclosure, or destruction of your personal data.
            </p>
            <p>
              We retain your data only for as long as necessary to fulfil the purposes for which it was collected,
              or as required by law. If you unsubscribe, we will delete your personal data within 30 days unless
              we are legally required to retain it.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Your Rights Under UK GDPR<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>Under the UK GDPR and Data Protection Act 2018, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Right of access</strong> - you can request a copy of the personal data we hold about you (a "Subject Access Request")
              </li>
              <li>
                <strong>Right to rectification</strong> - you can ask us to correct any inaccurate or incomplete data
              </li>
              <li>
                <strong>Right to erasure</strong> - you can ask us to delete your personal data ("right to be forgotten")
              </li>
              <li>
                <strong>Right to restrict processing</strong> - you can ask us to limit how we use your data
              </li>
              <li>
                <strong>Right to data portability</strong> - you can request your data in a structured, commonly used format
              </li>
              <li>
                <strong>Right to object</strong> - you can object to processing based on legitimate interests or direct marketing
              </li>
              <li>
                <strong>Right to withdraw consent</strong> - where processing is based on consent, you can withdraw it at any time
              </li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@howdoyoudo.group" className="text-primary hover:underline">
                privacy@howdoyoudo.group
              </a>
              . We will respond within one calendar month.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Cookies<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              We use essential cookies to ensure the platform functions correctly. We do not currently use
              advertising or tracking cookies. If this changes, we will update this policy and seek your consent.
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Third-Party Services<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>We may share data with trusted third-party service providers who assist us in operating our platform, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email delivery services (for newsletters and alerts)</li>
              <li>Cloud hosting providers (for secure data storage)</li>
              <li>Analytics tools (anonymised usage data only)</li>
            </ul>
            <p>
              All third-party processors are bound by data processing agreements and are required to comply with UK GDPR.
              We do not transfer data outside the UK/EEA without appropriate safeguards in place.
            </p>
          </div>
        </section>

        {/* Complaints */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Complaints<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              If you are unhappy with how we handle your data, you have the right to lodge a complaint with the
              Information Commissioner's Office (ICO):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Website:{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  ico.org.uk
                </a>
              </li>
              <li>Helpline: 0303 123 1113</li>
            </ul>
            <p>We encourage you to contact us first so we can try to resolve your concern directly.</p>
          </div>
        </section>

        {/* Terms of Use */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Terms of Use<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>By using the Howdoyoudo platform, you agree that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You will provide accurate information when signing up</li>
              <li>You will not misuse the platform or its content for unlawful purposes</li>
              <li>Content on this platform (articles, career maps, company profiles, job summaries, briefings and editorial copy) is for informational purposes and does not constitute professional career advice</li>
              <li>Job listings are sourced from third parties - we are not responsible for the accuracy of external job postings</li>
              <li>
                <strong>No scraping, automated access or AI training.</strong> You may not use any
                automated means (including bots, crawlers, scrapers, headless browsers or AI agents)
                to access, copy, index, harvest, republish or create derivative works from any part
                of this platform - including job listings, company profiles, career maps, briefings
                and editorial content - without our prior written permission. You may not use our
                content to train, fine-tune or evaluate machine-learning models. We reserve the
                right to rate-limit, block or pursue legal remedies against any party that breaches
                this clause.
              </li>
              <li>We reserve the right to update these terms at any time, with changes posted on this page</li>
            </ul>
          </div>
        </section>

        {/* External Content Disclaimer */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              External Videos & Third-Party Content<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              Howdoyoudo curates links to videos, articles, podcasts, job listings, events, courses and other
              content hosted on third-party platforms (including but not limited to YouTube, BBC Bitesize,
              Spotify, Substack, Eventbrite, LinkedIn, Adzuna and partner ATS providers).
            </p>
            <p>
              This content is provided for informational and inspirational purposes only. We do not host,
              create, control, endorse or verify third-party content, and it may be changed, removed or
              made unavailable at any time by its publisher.
            </p>
            <p>
              To the fullest extent permitted by law, Howdoyoudo accepts <strong>no liability</strong> for
              the accuracy, completeness, legality, safety or availability of any external content, nor for
              any loss or damage arising from your reliance on it or your use of any third-party website or
              service we link to. Your use of those services is governed by their own terms and privacy
              policies.
            </p>
            <p>
              If you believe a linked piece of content is inappropriate, broken or infringes your rights,
              please contact us and we will review it.
            </p>
          </div>
        </section>

        {/* Community Chat Guidelines */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-700">
              Community Chat Guidelines<span className="text-primary">.</span>
            </h2>
          </div>
          <div className="space-y-3 text-foreground/80 font-body text-sm leading-relaxed">
            <p>
              Community Chat is a member-only space for talking with other Howdoyoudo members about
              industries, jobs and ideas. By joining you agree to these rules. Breaking them can lead
              to your messages being removed, your access to chat being revoked, or your account being
              terminated. Serious or illegal behaviour may be reported to the relevant authorities.
            </p>
            <p><strong>You must be 16 or older to join Community Chat.</strong> You'll be asked to
            confirm your date of birth before you join. Accounts found to belong to under-16s will
            be removed from chat.</p>
            <p>While using Community Chat you agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Post or share <strong>sexual, sexually suggestive or pornographic content</strong>, or send unwanted sexual messages to anyone.</li>
              <li>Post <strong>racist, sexist, homophobic, transphobic, ableist or religiously hateful</strong> content, slurs, or other discriminatory language.</li>
              <li>Harass, bully, threaten, intimidate, dox or stalk other members.</li>
              <li>Target, contact or attempt to groom anyone you know or suspect to be a minor.</li>
              <li>Post illegal content, incite violence, glorify terrorism or self-harm, or share content involving the abuse or exploitation of children.</li>
              <li>Spam, scam, run pyramid schemes or MLM recruitment, or send unsolicited sales messages.</li>
              <li>Impersonate another person, brand or member of the Howdoyoudo team.</li>
              <li>Share other members' personal information, screenshots of private DMs, or anything shared in confidence.</li>
            </ul>
            <p>
              <strong>Reporting.</strong> Every member card and chat message carries a Report button.
              Reports are confidential and reviewed by our moderation team. You can also email{" "}
              <a href="mailto:safety@howdoyoudo.group" className="text-primary hover:underline">
                safety@howdoyoudo.group
              </a>{" "}
              with concerns. Misuse of the report system (false or malicious reports) may itself lead
              to action against your account.
            </p>
            <p>
              <strong>Data we collect for Community Chat.</strong> When you join we record your date
              of birth (to verify you are 16+), the time you agreed to these guidelines, your chat
              messages, and any reports filed by or about you. We retain reports and the messages
              they relate to for as long as needed to investigate and to comply with our legal
              obligations.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;