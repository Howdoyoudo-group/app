// Personalised AI-generated skill course page.
// Route: /skill-course/:courseId
// Mirrors IndustryBadgePage but loads from skill_course_* tables and grades client-side.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Circle, Lock, Award, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

type Lesson = { id: string; slot: number; title: string; body_markdown: string };
type Question = { id: string; question: string; options: string[]; correct_index: number; explanation: string | null };
type CourseData = {
  id: string;
  role_slug: string;
  role_title: string;
  course_title: string;
  focus_skills: string[];
  status: "generating" | "ready" | "error";
};

const PASS_THRESHOLD = 8;

export default function SkillCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [passed, setPassed] = useState<{ score: number; at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; feedback: any[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCourse = async () => {
    if (!courseId || !user) return;

    const [{ data: c }, { data: ls }, { data: qs }, { data: prog }] = await Promise.all([
      supabase.from("skill_courses").select("*").eq("id", courseId).eq("user_id", user.id).maybeSingle(),
      supabase.from("skill_course_lessons").select("id,slot,title,body_markdown").eq("course_id", courseId).order("slot"),
      supabase.from("skill_course_questions").select("id,question,options,correct_index,explanation").eq("course_id", courseId),
      supabase.from("skill_course_progress").select("lessons_completed,passed,score,completed_at").eq("course_id", courseId).eq("user_id", user.id).maybeSingle(),
    ]);

    setCourse(c as CourseData ?? null);
    setLessons((ls ?? []) as Lesson[]);
    setQuestions((qs ?? []) as Question[]);
    setCompleted((prog?.data as any)?.lessons_completed ?? []);
    const p = (prog?.data as any);
    if (p?.passed) setPassed({ score: p.score, at: p.completed_at });
    setLoading(false);
  };

  useEffect(() => {
    loadCourse();
  }, [courseId, user]);

  // Poll while generating
  useEffect(() => {
    if (course?.status !== "generating") return;
    setPolling(true);
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("skill_courses")
        .select("status, course_title")
        .eq("id", courseId)
        .single();
      if (data?.status === "ready") {
        setPolling(false);
        clearInterval(interval);
        loadCourse();
      } else if (data?.status === "error") {
        setPolling(false);
        clearInterval(interval);
        setCourse((prev) => prev ? { ...prev, status: "error" } : null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [course?.status, courseId]);

  const allDone = useMemo(() => lessons.length > 0 && lessons.every((l) => completed.includes(l.slot)), [lessons, completed]);
  const progressPct = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;

  const markComplete = async (slot: number) => {
    const next = Array.from(new Set([...completed, slot])).sort((a, b) => a - b);
    setCompleted(next);
    setActiveSlot(null);
    if (user && courseId) {
      await supabase
        .from("skill_course_progress")
        .upsert({ user_id: user.id, course_id: courseId, lessons_completed: next }, { onConflict: "user_id,course_id" });
    }
  };

  const submitQuiz = async () => {
    if (!questions.length || !user || !courseId || !course) return;
    setSubmitting(true);

    const feedback = questions.map((q) => {
      const chosen = quizAnswers[q.id] ?? -1;
      return {
        question: q.question,
        options: q.options,
        chosen_index: chosen,
        correct_index: q.correct_index,
        explanation: q.explanation,
        is_correct: chosen === q.correct_index,
      };
    });

    const score = feedback.filter((f) => f.is_correct).length;
    const didPass = score >= PASS_THRESHOLD;

    setQuizResult({ passed: didPass, score, feedback });
    setSubmitting(false);

    if (didPass) {
      const now = new Date().toISOString();
      setPassed({ score, at: now });
      // Save progress
      await supabase
        .from("skill_course_progress")
        .upsert(
          { user_id: user.id, course_id: courseId, lessons_completed: completed, passed: true, score, completed_at: now },
          { onConflict: "user_id,course_id" },
        );
      // Evidence ALL skills for the role (full accreditation)
      const { data: allSkillRows } = await supabase
        .from("role_skills")
        .select("id")
        .eq("slug", course.role_slug);
      if (allSkillRows?.length) {
        const upsertRows = (allSkillRows as any[]).map((s) => ({
          user_id: user.id,
          skill_id: s.id,
          rating: 4,
          evidenced: true,
          source: `skill-course:${courseId}`,
          updated_at: now,
        }));
        await supabase.from("user_skill_ratings").upsert(upsertRows, { onConflict: "user_id,skill_id" });
      }
      // Save badge to earned_badges so it shows on profile
      await supabase.from("earned_badges").upsert(
        { user_id: user.id, industry: course.role_slug, score, earned_at: now },
        { onConflict: "user_id,industry" },
      );
    }
  };

  if (!user) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-display font-700 text-lg mb-2">Sign in to view your course</p>
            <Link to="/auth" className="text-primary underline text-sm">Sign in</Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="font-display font-700 text-lg mb-2">Course not found</p>
            <Link to="/skills-passport?tab=gaps" className="text-primary underline text-sm">Back to Skill Gaps</Link>
          </div>
        </div>
      </>
    );
  }

  if (course.status === "generating" || polling) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="font-display font-700 text-xl mb-2">Building your course…</p>
            <p className="font-body text-sm text-muted-foreground">
              Gemini is writing 4 lessons and 10 quiz questions tailored to your specific skill gaps. Usually takes about 20–30 seconds.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (course.status === "error") {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="font-display font-700 text-lg mb-2">Generation failed</p>
            <p className="font-body text-sm text-muted-foreground mb-4">Something went wrong creating your course. Try generating a new one from your Skill Gaps page.</p>
            <Link to="/skills-passport?tab=gaps" className="inline-flex items-center gap-1.5 text-primary underline text-sm">
              <ArrowLeft className="w-3 h-3" /> Back to Skill Gaps
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ backgroundImage: "none" }}>
      <SEO title={`${course.course_title} | Howdoyoudo?`} description={`Your personalised skills course for ${course.role_title}.`} />
      <SiteNav />
      <main className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">

        <Link
          to="/skills-passport?tab=gaps"
          className="inline-flex items-center gap-2 text-sm font-display font-700 uppercase tracking-wider mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Skill Gaps
        </Link>

        <div className="mb-8">
          <p className="text-xs font-display font-700 uppercase tracking-[0.2em] text-primary mb-2">Your personalised course</p>
          <h1 className="font-display font-900 text-3xl md:text-4xl leading-none mb-3">{course.course_title}</h1>
          <p className="font-body text-muted-foreground text-sm max-w-xl">
            Four short lessons and a 10-question quiz built around your weakest skills for the {course.role_title} role.
            Pass with 8/10 to evidence those skills on your profile.
          </p>
        </div>

        {passed && (
          <div className="mb-8 border-2 border-primary bg-primary/10 p-5 flex items-center gap-4 rounded-xl">
            <Award className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-display font-800 text-lg leading-tight">Accreditation earned!</p>
              <p className="font-body text-sm text-muted-foreground">
                You scored {passed.score}/10 on {new Date(passed.at).toLocaleDateString("en-GB")}. All skills evidenced and badge saved to your profile.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between font-display font-700 text-xs uppercase tracking-wider mb-2">
            <span>Progress</span>
            <span>{completed.length}/{lessons.length} lessons</span>
          </div>
          <Progress value={progressPct} className="h-3" />
        </div>

        {/* Lessons */}
        <div className="space-y-3 mb-10">
          {lessons.map((l) => {
            const done = completed.includes(l.slot);
            const open = activeSlot === l.slot;
            return (
              <div key={l.id} className="border-2 border-foreground bg-background rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveSlot(open ? null : l.slot)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  {done
                    ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-display font-700 uppercase tracking-wider text-muted-foreground">Lesson {l.slot}</p>
                    <p className="font-display font-800 text-base leading-tight truncate">{l.title}</p>
                  </div>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t-2 border-foreground"
                    >
                      <div className="p-5 prose prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-a:underline">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                          }}
                        >
                          {l.body_markdown}
                        </ReactMarkdown>
                        <div className="mt-6 pt-4 border-t flex justify-end not-prose">
                          <Button onClick={() => markComplete(l.slot)} className="font-display">
                            {done ? "Re-mark complete" : "Mark complete"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Quiz unlock */}
        <div className="border-2 border-foreground p-6 text-center bg-primary/5 rounded-lg">
          {allDone ? (
            <>
              <h2 className="font-display font-800 text-2xl mb-2">Ready for the quiz?</h2>
              <p className="font-body text-sm text-muted-foreground mb-4">10 questions. Score 8/10 to pass and evidence your skills.</p>
              <Button size="lg" onClick={() => { setQuizOpen(true); setQuizStep(0); setQuizAnswers({}); setQuizResult(null); }} className="font-display">
                {passed ? "Retake quiz" : "Start quiz"}
              </Button>
            </>
          ) : (
            <>
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h2 className="font-display font-800 text-2xl mb-2">Quiz locked</h2>
              <p className="font-body text-sm text-muted-foreground">Complete all {lessons.length} lessons to unlock the quiz.</p>
            </>
          )}
        </div>

        {/* Focus skills */}
        {course.focus_skills?.length > 0 && (
          <div className="mt-8 p-4 border border-border rounded-xl bg-muted/20">
            <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Skills this course covers</p>
            <div className="flex flex-wrap gap-1.5">
              {course.focus_skills.map((s) => (
                <span key={s} className="px-2.5 py-1 text-[11px] font-display font-600 bg-blue-50 text-blue-800 border border-blue-200 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Quiz modal */}
      <AnimatePresence>
        {quizOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
            onClick={() => !submitting && setQuizOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-foreground max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
              style={{ backgroundImage: "none" }}
            >
              {!quizResult ? (
                <QuizRunner
                  questions={questions}
                  step={quizStep}
                  setStep={setQuizStep}
                  answers={quizAnswers}
                  setAnswers={setQuizAnswers}
                  submitting={submitting}
                  onSubmit={submitQuiz}
                  onClose={() => setQuizOpen(false)}
                />
              ) : (
                <QuizResultView
                  result={quizResult}
                  onClose={() => setQuizOpen(false)}
                  onRetry={() => { setQuizStep(0); setQuizAnswers({}); setQuizResult(null); }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function QuizRunner({
  questions, step, setStep, answers, setAnswers, submitting, onSubmit, onClose,
}: {
  questions: Question[];
  step: number;
  setStep: (n: number) => void;
  answers: Record<string, number>;
  setAnswers: (a: Record<string, number>) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const q = questions[step];
  const last = step === questions.length - 1;
  const allAnswered = questions.every((qq) => answers[qq.id] != null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-display font-700 uppercase tracking-wider text-muted-foreground">
          Question {step + 1} of {questions.length}
        </p>
        <button onClick={onClose} className="text-sm underline font-body">Close</button>
      </div>
      <Progress value={((step + 1) / questions.length) * 100} className="h-2 mb-6" />
      <h3 className="font-display font-800 text-xl mb-5">{q.question}</h3>
      <div className="space-y-2 mb-6">
        {q.options.map((opt, i) => {
          const selected = answers[q.id] === i;
          return (
            <button
              key={i}
              onClick={() => setAnswers({ ...answers, [q.id]: i })}
              className={`w-full text-left p-3 border-2 transition-colors rounded ${selected ? "border-primary bg-primary/10" : "border-foreground hover:bg-muted/40"}`}
            >
              <span className="font-display font-700 mr-3">{String.fromCharCode(65 + i)}.</span>
              <span className="font-body text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        {last ? (
          <Button disabled={!allAnswered || submitting} onClick={onSubmit} className="font-display">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        ) : (
          <Button disabled={answers[q.id] == null} onClick={() => setStep(step + 1)}>Next</Button>
        )}
      </div>
    </div>
  );
}

function QuizResultView({
  result, onClose, onRetry,
}: {
  result: { passed: boolean; score: number; feedback: any[] };
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        {result.passed ? (
          <>
            <Award className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="font-display font-900 text-3xl mb-1">Accreditation earned!</h2>
            <p className="font-body text-muted-foreground">
              You scored {result.score}/10. All skills for this role are now evidenced on your Skills Passport and the badge is saved to your profile.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display font-900 text-3xl mb-1">Not quite</h2>
            <p className="font-body text-muted-foreground">
              {result.score}/{result.score + result.feedback.filter((f) => !f.is_correct).length} — you need {PASS_THRESHOLD}/10 to pass. Review the lessons and try again.
            </p>
          </>
        )}
      </div>
      <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
        {result.feedback.map((f, i) => (
          <div key={i} className={`border-2 p-3 rounded ${f.is_correct ? "border-primary bg-primary/5" : "border-destructive/60 bg-destructive/5"}`}>
            <p className="font-display font-700 text-sm mb-1">{i + 1}. {f.question}</p>
            <p className="font-body text-xs">
              <span className={f.is_correct ? "text-primary" : "text-destructive"}>
                {f.is_correct ? "Correct" : `Your answer: ${f.options[f.chosen_index] ?? "—"}`}
              </span>
              {!f.is_correct && <> · Right answer: <strong>{f.options[f.correct_index]}</strong></>}
            </p>
            {f.explanation && <p className="font-body text-xs text-muted-foreground mt-1">{f.explanation}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
        {!result.passed && <Button onClick={onRetry} className="font-display">Try again</Button>}
      </div>
    </div>
  );
}
