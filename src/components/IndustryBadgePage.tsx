import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Circle, Lock, Trophy, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

type Lesson = {
  id: string;
  slot: number;
  title: string;
  body_markdown: string;
};
type QuizQuestion = { id: string; question: string; options: string[] };
type QuizResult = {
  passed: boolean;
  score: number;
  total: number;
  feedback: Array<{
    question: string;
    options: string[];
    chosen_index: number;
    correct_index: number;
    explanation: string | null;
    is_correct: boolean;
  }>;
};

interface IndustryBadgePageProps {
  industry: string; // canonical slug e.g. "football"
  industryDisplayName: string; // e.g. "Football"
  parentHref: string; // e.g. "/football"
}

const IndustryBadgePage = ({ industry, industryDisplayName, parentHref }: IndustryBadgePageProps) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [earned, setEarned] = useState<{ score: number; earned_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizStep, setQuizStep] = useState(0);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const progressKey = `badge_progress:${industry}`;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: lessonRows }, progRow, earnedRow] = await Promise.all([
        supabase.from("badge_lessons").select("id,slot,title,body_markdown").eq("industry", industry).order("slot"),
        user
          ? supabase.from("badge_progress").select("lessons_completed").eq("user_id", user.id).eq("industry", industry).maybeSingle()
          : Promise.resolve({ data: null } as any),
        user
          ? supabase.from("earned_badges").select("score,earned_at").eq("user_id", user.id).eq("industry", industry).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      setLessons(lessonRows ?? []);
      let initialProgress: number[] = progRow?.data?.lessons_completed ?? [];
      if (!user) {
        try {
          const stored = localStorage.getItem(progressKey);
          if (stored) initialProgress = JSON.parse(stored);
        } catch {}
      }
      setCompleted(initialProgress);
      setEarned(earnedRow?.data ?? null);
      setLoading(false);
    };
    load();
  }, [industry, user]);

  const allDone = useMemo(() => lessons.length > 0 && lessons.every((l) => completed.includes(l.slot)), [lessons, completed]);
  const progressPct = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;

  const markComplete = async (slot: number) => {
    const next = Array.from(new Set([...completed, slot])).sort();
    setCompleted(next);
    setActiveSlot(null);
    if (user) {
      await supabase
        .from("badge_progress")
        .upsert({ user_id: user.id, industry, lessons_completed: next }, { onConflict: "user_id,industry" });
    } else {
      try { localStorage.setItem(progressKey, JSON.stringify(next)); } catch {}
    }
  };

  const startQuiz = async () => {
    setQuizSubmitting(true);
    const { data, error } = await supabase.functions.invoke("grade-badge-quiz", {
      body: { action: "start", industry },
    });
    setQuizSubmitting(false);
    if (error || !data?.questions) {
      toast({ title: "Couldn't start quiz", description: data?.error || error?.message || "Try again later", variant: "destructive" });
      return;
    }
    setQuiz(data.questions);
    setQuizAnswers({});
    setQuizStep(0);
    setQuizResult(null);
  };


  const submitQuiz = async () => {
    if (!quiz) return;
    setQuizSubmitting(true);
    const answers = quiz.map((q) => ({ id: q.id, chosen_index: quizAnswers[q.id] ?? -1 }));
    const { data, error } = await supabase.functions.invoke("grade-badge-quiz", {
      body: { action: "submit", industry, answers },
    });
    setQuizSubmitting(false);
    if (error || !data) {
      toast({ title: "Submission failed", description: error?.message || "Try again", variant: "destructive" });
      return;
    }
    setQuizResult(data as QuizResult);
    if ((data as QuizResult).passed) {
      setEarned({ score: (data as QuizResult).score, earned_at: new Date().toISOString() });
    }
  };

  const closeQuiz = () => {
    setQuiz(null);
    setQuizResult(null);
    setQuizAnswers({});
    setQuizStep(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
        <SEO title={`${industryDisplayName} Fundamentals — Coming soon`} description={`Earn your ${industryDisplayName} Fundamentals badge on Howdy.`} />
        <Link to={parentHref} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {industryDisplayName}
        </Link>
        <h1 className="font-display text-3xl md:text-5xl mb-4">{industryDisplayName} Fundamentals</h1>
        <p className="text-muted-foreground">The badge for this industry is being prepared. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <SEO
        title={`${industryDisplayName} Fundamentals badge — Howdy`}
        description={`Learn the ${industryDisplayName} industry in 15 minutes and earn the Fundamentals badge to show employers you're serious.`}
      />

      <Link to={parentHref} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to {industryDisplayName}
      </Link>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Earn your badge</p>
        <h1 className="font-display text-3xl md:text-5xl leading-none mb-3">{industryDisplayName} Fundamentals</h1>
        <p className="text-muted-foreground max-w-xl">
          Four short lessons, one quiz. About 15 minutes. Pass it and employers on Howdy see the green badge on your profile.
        </p>
      </div>

      {earned && (
        <div className="mb-8 border-2 border-primary bg-primary/10 p-5 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="font-display text-lg leading-tight">Badge earned</p>
            <p className="text-sm text-muted-foreground">
              You scored {earned.score}/10 on {new Date(earned.earned_at).toLocaleDateString("en-GB")}. It's now on your profile.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span>Progress</span>
          <span>
            {completed.length}/{lessons.length} lessons
          </span>
        </div>
        <Progress value={progressPct} className="h-3" />
      </div>

      <div className="space-y-3 mb-10">
        {lessons.map((l) => {
          const done = completed.includes(l.slot);
          const open = activeSlot === l.slot;
          return (
            <div key={l.id} className="border-2 border-foreground bg-background">
              <button
                onClick={() => setActiveSlot(open ? null : l.slot)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                {done ? <CheckCircle2 className="h-6 w-6 text-primary shrink-0" /> : <Circle className="h-6 w-6 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lesson {l.slot}</p>
                  <p className="font-display text-base sm:text-lg leading-tight truncate">{l.title}</p>
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
                      <div className="mt-6 pt-4 border-t flex justify-end">
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

      <div className="border-2 border-foreground p-6 text-center bg-primary/5">
        {allDone ? (
          <>
            <h2 className="font-display text-2xl mb-2">Ready for the quiz?</h2>
            <p className="text-sm text-muted-foreground mb-4">10 questions. 80% to pass. 2 attempts per day.</p>
            <Button size="lg" onClick={startQuiz} disabled={quizSubmitting} className="font-display">
              {quizSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : earned ? "Retake quiz" : "Start quiz"}
            </Button>
          </>
        ) : (
          <>
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h2 className="font-display text-2xl mb-2">Quiz locked</h2>
            <p className="text-sm text-muted-foreground">Complete all {lessons.length} lessons to unlock the quiz.</p>
          </>
        )}
      </div>

      {/* Quiz modal */}
      <AnimatePresence>
        {quiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
            onClick={closeQuiz}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-foreground max-w-xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundImage: "none" }}
            >
              {!quizResult ? (
                <QuizRunner
                  questions={quiz}
                  step={quizStep}
                  setStep={setQuizStep}
                  answers={quizAnswers}
                  setAnswers={setQuizAnswers}
                  submitting={quizSubmitting}
                  onSubmit={submitQuiz}
                  onClose={closeQuiz}
                />
              ) : (
                <QuizResultView result={quizResult} onClose={closeQuiz} onRetry={startQuiz} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuizRunner = ({
  questions,
  step,
  setStep,
  answers,
  setAnswers,
  submitting,
  onSubmit,
  onClose,
}: {
  questions: QuizQuestion[];
  step: number;
  setStep: (n: number) => void;
  answers: Record<string, number>;
  setAnswers: (a: Record<string, number>) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) => {
  const q = questions[step];
  const last = step === questions.length - 1;
  const allAnswered = questions.every((qq) => answers[qq.id] != null);
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Question {step + 1} of {questions.length}
        </p>
        <button onClick={onClose} className="text-sm underline">Close</button>
      </div>
      <Progress value={((step + 1) / questions.length) * 100} className="h-2 mb-6" />
      <h3 className="font-display text-xl mb-5">{q.question}</h3>
      <div className="space-y-2 mb-6">
        {q.options.map((opt, i) => {
          const selected = answers[q.id] === i;
          return (
            <button
              key={i}
              onClick={() => setAnswers({ ...answers, [q.id]: i })}
              className={`w-full text-left p-3 border-2 transition-colors ${selected ? "border-primary bg-primary/10" : "border-foreground hover:bg-muted/40"}`}
            >
              <span className="font-display mr-3">{String.fromCharCode(65 + i)}.</span>
              {opt}
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
};

const QuizResultView = ({ result, onClose, onRetry }: { result: QuizResult; onClose: () => void; onRetry: () => void }) => {
  const saved = (result as any).saved !== false;
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        {result.passed ? (
          <>
            <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="font-display text-3xl mb-1">Badge earned!</h2>
            <p className="text-muted-foreground">
              You scored {result.score}/{result.total}.{" "}
              {saved ? "Your profile now shows the badge." : (
                <>
                  <Link to="/auth" className="underline text-primary">Sign in or create an account</Link> to save it to your profile.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-3xl mb-1">Not quite</h2>
            <p className="text-muted-foreground">{result.score}/{result.total} — you need 8/10 to pass. Review and try again.</p>
          </>
        )}
      </div>
      <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
        {result.feedback.map((f, i) => (
          <div key={i} className={`border-2 p-3 ${f.is_correct ? "border-primary bg-primary/5" : "border-destructive/60 bg-destructive/5"}`}>
            <p className="font-display text-sm mb-1">{i + 1}. {f.question}</p>
            <p className="text-xs">
              <span className={f.is_correct ? "text-primary" : "text-destructive"}>
                {f.is_correct ? "Correct" : `Your answer: ${f.options[f.chosen_index] ?? "—"}`}
              </span>
              {!f.is_correct && <> · Right answer: <strong>{f.options[f.correct_index]}</strong></>}
            </p>
            {f.explanation && <p className="text-xs text-muted-foreground mt-1">{f.explanation}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
        {!result.passed && <Button onClick={onRetry} className="font-display">Try again</Button>}
      </div>
    </div>
  );
};

export default IndustryBadgePage;
