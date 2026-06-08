import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

// Holland RIASEC dimensions
type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

const RIASEC_LABELS: Record<RiasecKey, { label: string; desc: string }> = {
  R: { label: "Realistic", desc: "Hands-on, practical, physical" },
  I: { label: "Investigative", desc: "Analytical, curious, research-oriented" },
  A: { label: "Artistic", desc: "Creative, expressive, original" },
  S: { label: "Social", desc: "Helping, teaching, mentoring" },
  E: { label: "Enterprising", desc: "Leading, persuading, managing" },
  C: { label: "Conventional", desc: "Organised, detail-oriented, systematic" },
};

interface QuizQuestion {
  id: number;
  text: string;
  optionA: { label: string; dimension: RiasecKey };
  optionB: { label: string; dimension: RiasecKey };
}

const QUESTIONS: QuizQuestion[] = [
  { id: 1, text: "Which sounds more like you?", optionA: { label: "I enjoy building or fixing things with my hands", dimension: "R" }, optionB: { label: "I love researching and solving complex puzzles", dimension: "I" } },
  { id: 2, text: "Which appeals to you more?", optionA: { label: "Designing something visually striking", dimension: "A" }, optionB: { label: "Coaching or mentoring someone", dimension: "S" } },
  { id: 3, text: "In a group project, you'd rather…", optionA: { label: "Take the lead and drive decisions", dimension: "E" }, optionB: { label: "Create the plan and organise tasks", dimension: "C" } },
  { id: 4, text: "Which energises you more?", optionA: { label: "Working outdoors or in a workshop", dimension: "R" }, optionB: { label: "Writing, painting, or creating content", dimension: "A" } },
  { id: 5, text: "Pick the one that fits you better:", optionA: { label: "Analysing data to find hidden patterns", dimension: "I" }, optionB: { label: "Persuading someone to see your point of view", dimension: "E" } },
  { id: 6, text: "Which role sounds more appealing?", optionA: { label: "Listening to people and helping them grow", dimension: "S" }, optionB: { label: "Setting up systems and keeping things running smoothly", dimension: "C" } },
  { id: 7, text: "Which do you enjoy more?", optionA: { label: "Testing, experimenting, or prototyping", dimension: "R" }, optionB: { label: "Networking and meeting new people", dimension: "E" } },
  { id: 8, text: "What matters more to you?", optionA: { label: "Understanding how something works", dimension: "I" }, optionB: { label: "Making something look and feel beautiful", dimension: "A" } },
  { id: 9, text: "Which Saturday sounds better?", optionA: { label: "Volunteering or supporting a cause", dimension: "S" }, optionB: { label: "Organising your home or planning a trip in detail", dimension: "C" } },
  { id: 10, text: "You'd be happier in a role that requires…", optionA: { label: "Physical skill or technical craft", dimension: "R" }, optionB: { label: "Empathy and emotional intelligence", dimension: "S" } },
  { id: 11, text: "Which excites you more?", optionA: { label: "Launching a new business idea", dimension: "E" }, optionB: { label: "Deep-diving into a subject nobody else understands", dimension: "I" } },
  { id: 12, text: "Pick the one closer to you:", optionA: { label: "Expressing yourself through art, music, or writing", dimension: "A" }, optionB: { label: "Following a clear process to deliver quality work", dimension: "C" } },
];

const WORK_VALUES = [
  { key: "autonomy", label: "Autonomy", desc: "Freedom to work independently" },
  { key: "creativity", label: "Creativity", desc: "Opportunities to innovate and create" },
  { key: "stability", label: "Stability", desc: "Job security and predictability" },
  { key: "recognition", label: "Recognition", desc: "Being acknowledged for your work" },
  { key: "variety", label: "Variety", desc: "Diverse tasks and challenges" },
];

export interface RiasecScores {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface WorkValues {
  [key: string]: number;
}

interface RiasecQuizProps {
  initialScores?: RiasecScores | null;
  initialWorkValues?: WorkValues | null;
  onComplete: (scores: RiasecScores, workValues: WorkValues) => void;
  /** Optional: if provided, shows a "Complete your profile" CTA in the results screen */
  onFinish?: () => void;
}

export function getTopRiasecCode(scores: RiasecScores): string {
  return (Object.entries(scores) as [RiasecKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join("");
}

const RiasecQuiz = ({ initialScores, initialWorkValues, onComplete, onFinish }: RiasecQuizProps) => {
  const [phase, setPhase] = useState<"intro" | "questions" | "values" | "results">(
    initialScores ? "results" : "intro"
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<RiasecScores>(
    initialScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  );
  const [workValues, setWorkValues] = useState<WorkValues>(
    initialWorkValues || Object.fromEntries(WORK_VALUES.map((v) => [v.key, 50]))
  );
  const [answers, setAnswers] = useState<Record<number, "A" | "B">>({});

  const handleAnswer = (choice: "A" | "B") => {
    const q = QUESTIONS[currentQ];
    const dim = choice === "A" ? q.optionA.dimension : q.optionB.dimension;
    const newScores = { ...scores, [dim]: scores[dim] + 1 };
    setScores(newScores);
    setAnswers({ ...answers, [q.id]: choice });

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Normalize scores to 0-100
      const maxPossible = QUESTIONS.length / 3; // rough max per dimension
      const normalized: RiasecScores = {
        R: Math.min(100, Math.round((newScores.R / maxPossible) * 100)),
        I: Math.min(100, Math.round((newScores.I / maxPossible) * 100)),
        A: Math.min(100, Math.round((newScores.A / maxPossible) * 100)),
        S: Math.min(100, Math.round((newScores.S / maxPossible) * 100)),
        E: Math.min(100, Math.round((newScores.E / maxPossible) * 100)),
        C: Math.min(100, Math.round((newScores.C / maxPossible) * 100)),
      };
      setScores(normalized);
      setPhase("values");
    }
  };

  const handleValuesComplete = () => {
    setPhase("results");
    onComplete(scores, workValues);
  };

  const handleRetake = () => {
    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
    setWorkValues(Object.fromEntries(WORK_VALUES.map((v) => [v.key, 50])));
    setAnswers({});
    setCurrentQ(0);
    setPhase("questions");
  };

  const topCode = getTopRiasecCode(scores);
  const sortedDimensions = (Object.entries(scores) as [RiasecKey, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="border-2 border-foreground">
      <AnimatePresence mode="wait">
        {/* INTRO */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 text-center"
          >
            <div className="w-12 h-12 bg-primary mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-800 text-lg mb-2">Career Personality Quiz</h3>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              12 quick questions based on the Holland RIASEC model - the same science used by O*NET 
              and career counsellors worldwide. Takes about 2 minutes.
            </p>
            <button
              onClick={() => setPhase("questions")}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors"
            >
              Start Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* QUESTIONS */}
        {phase === "questions" && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Question {currentQ + 1} of {QUESTIONS.length}
              </span>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 transition-colors ${
                      i < currentQ ? "bg-primary" : i === currentQ ? "bg-foreground" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="font-display font-700 text-base mb-5">{QUESTIONS[currentQ].text}</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer("A")}
                className="w-full text-left border-2 border-border p-4 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <span className="font-display font-600 text-sm group-hover:text-primary transition-colors">
                  {QUESTIONS[currentQ].optionA.label}
                </span>
              </button>
              <button
                onClick={() => handleAnswer("B")}
                className="w-full text-left border-2 border-border p-4 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <span className="font-display font-600 text-sm group-hover:text-primary transition-colors">
                  {QUESTIONS[currentQ].optionB.label}
                </span>
              </button>
            </div>

            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ(currentQ - 1)}
                className="flex items-center gap-1 mt-4 text-muted-foreground hover:text-foreground font-display text-xs"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            )}
          </motion.div>
        )}

        {/* WORK VALUES */}
        {phase === "values" && (
          <motion.div
            key="values"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            <h3 className="font-display font-800 text-base mb-1">What matters to you at work?</h3>
            <p className="font-body text-xs text-muted-foreground mb-6">
              Rate how important each value is to you.
            </p>

            <div className="space-y-5">
              {WORK_VALUES.map((val) => (
                <div key={val.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-display font-700 text-sm">{val.label}</span>
                      <span className="font-body text-xs text-muted-foreground ml-2">{val.desc}</span>
                    </div>
                    <span className="font-display font-800 text-sm text-primary">
                      {workValues[val.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={workValues[val.key]}
                    onChange={(e) =>
                      setWorkValues({ ...workValues, [val.key]: Number(e.target.value) })
                    }
                    className="w-full accent-primary h-1.5 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleValuesComplete}
              className="flex items-center gap-2 mt-6 bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" /> See My Results
            </button>
          </motion.div>
        )}

        {/* RESULTS */}
        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-800 text-base">Your RIASEC Profile</h3>
              <span className="font-display font-800 text-lg text-primary tracking-wider">
                {topCode}
              </span>
            </div>

            <div className="space-y-2.5 mb-6">
              {sortedDimensions.map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-display font-600 text-xs">
                      {RIASEC_LABELS[key].label}
                      <span className="text-muted-foreground ml-1.5 font-400">
                        - {RIASEC_LABELS[key].desc}
                      </span>
                    </span>
                    <span className="font-display font-700 text-xs text-primary">{value}</span>
                  </div>
                  <div className="w-full bg-border h-2">
                    <motion.div
                      className="bg-primary h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Work values summary */}
            <div className="border-t border-border pt-4 mb-4">
              <p className="font-display font-600 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Your Work Values
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(workValues)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([key, val]) => {
                    const label = WORK_VALUES.find((v) => v.key === key)?.label || key;
                    return (
                      <span
                        key={key}
                        className={`px-2.5 py-1 font-display text-xs font-600 border ${
                          (val as number) >= 70
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {label} {val}%
                      </span>
                    );
                  })}
              </div>
            </div>

            {onFinish && (
              <button
                onClick={onFinish}
                className="flex items-center gap-2 w-full justify-center mt-4 bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
              >
                <Check className="w-4 h-4" /> Complete your profile
              </button>
            )}
            <button
              onClick={handleRetake}
              className="block text-center w-full mt-3 text-muted-foreground hover:text-foreground font-display text-xs underline"
            >
              Retake quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiasecQuiz;
