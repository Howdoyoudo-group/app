import { useRef, useState } from "react";
import { Plus, X, Sparkles, ImagePlus, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FunFact {
  q: string;
  a: string;
  photoUrl?: string;
  photoPath?: string;
}

const PROMPTS = [
  "A guilty pleasure of mine is…",
  "If I had a free Saturday I'd…",
  "The job I wanted as a kid was…",
  "I'm secretly really good at…",
  "My most-played song right now is…",
  "I'd love to learn how to…",
  "An unpopular opinion I hold is…",
  "The best thing I ate this month was…",
  "My superpower at work is…",
  "I lose track of time when I'm…",
  "A small thing that makes me happy is…",
  "The last thing that made me laugh out loud was…",
  "If I won the lottery, I'd still…",
  "Three words my friends would use about me…",
  "My favourite place on earth is…",
];

interface Props {
  facts: FunFact[];
  onChange: (next: FunFact[]) => void;
  userId?: string;
}

const PILL_COLOURS = [
  "bg-yellow-100 border-foreground",
  "bg-pink-100 border-foreground",
  "bg-blue-100 border-foreground",
  "bg-green-100 border-foreground",
  "bg-purple-100 border-foreground",
  "bg-orange-100 border-foreground",
];

const FunFactsEditor = ({ facts, onChange, userId }: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [editingPromptIdx, setEditingPromptIdx] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const addFact = (q: string) => {
    if (!q.trim()) return;
    if (facts.some((f) => f.q === q)) return;
    onChange([...facts, { q, a: "" }]);
    setPickerOpen(false);
    setCustomDraft("");
  };

  const updateFact = (idx: number, patch: Partial<FunFact>) => {
    onChange(facts.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeFact = async (idx: number) => {
    const fact = facts[idx];
    if (fact.photoPath) {
      await supabase.storage.from("love-photos").remove([fact.photoPath]);
    }
    onChange(facts.filter((_, i) => i !== idx));
  };

  const handlePhoto = async (idx: number, file: File) => {
    if (!userId) {
      toast.error("Sign in to add photos");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploadingIdx(idx);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/funfact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("love-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      setUploadingIdx(null);
      toast.error(error.message);
      return;
    }
    // Remove old photo if replacing
    const old = facts[idx];
    if (old.photoPath) {
      await supabase.storage.from("love-photos").remove([old.photoPath]);
    }
    const { data } = supabase.storage.from("love-photos").getPublicUrl(path);
    updateFact(idx, { photoUrl: data.publicUrl, photoPath: path });
    setUploadingIdx(null);
    const ref = fileRefs.current[idx];
    if (ref) ref.value = "";
  };

  const removePhoto = async (idx: number) => {
    const fact = facts[idx];
    if (fact.photoPath) {
      await supabase.storage.from("love-photos").remove([fact.photoPath]);
    }
    updateFact(idx, { photoUrl: undefined, photoPath: undefined });
  };

  const remainingPrompts = PROMPTS.filter((p) => !facts.some((f) => f.q === p));

  return (
    <div>
      {facts.length === 0 && !pickerOpen && (
        <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-5 text-center">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="font-body text-sm text-muted-foreground mb-3">
            No fun facts yet. Pick a prompt or write your own.
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider"
          >
            <Plus className="w-3 h-3" /> Add a fact
          </button>
        </div>
      )}

      {facts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {facts.map((fact, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border-2 p-4 shadow-[3px_3px_0_hsl(var(--foreground))] ${PILL_COLOURS[idx % PILL_COLOURS.length]}`}
            >
              <button
                type="button"
                onClick={() => removeFact(idx)}
                aria-label="Remove fact"
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>

              {editingPromptIdx === idx ? (
                <input
                  autoFocus
                  value={fact.q}
                  onChange={(e) => updateFact(idx, { q: e.target.value })}
                  onBlur={() => setEditingPromptIdx(null)}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditingPromptIdx(null); }}
                  placeholder="Your prompt or heading…"
                  className="w-full bg-background/60 rounded px-2 py-1 mb-2 mr-6 font-display font-700 text-[11px] uppercase tracking-wider text-foreground border border-foreground/30 outline-none focus:border-foreground"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingPromptIdx(idx)}
                  className="group flex items-start gap-1 pr-6 mb-2 text-left"
                  title="Tap to edit prompt"
                >
                  <p className="font-display font-700 text-[11px] uppercase tracking-wider text-foreground/70">
                    {fact.q || "Tap to add a prompt…"}
                  </p>
                  <Pencil className="w-3 h-3 text-foreground/40 group-hover:text-foreground shrink-0 mt-0.5" />
                </button>
              )}

              <textarea
                value={fact.a}
                onChange={(e) => updateFact(idx, { a: e.target.value })}
                placeholder="Your answer…"
                rows={2}
                className="w-full bg-transparent border-none outline-none font-body text-sm font-600 text-foreground resize-none placeholder:text-foreground/40"
              />

              {fact.photoUrl ? (
                <div className="relative mt-3 rounded-xl overflow-hidden border-2 border-foreground/20">
                  <img src={fact.photoUrl} alt={fact.q || "Fun fact"} className="w-full h-40 object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/95 border border-foreground/20 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : facts.some((f) => f.photoUrl) ? null : (
                <button
                  type="button"
                  onClick={() => fileRefs.current[idx]?.click()}
                  disabled={uploadingIdx === idx}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-foreground/30 hover:border-primary rounded-xl py-2 font-display text-[10px] font-700 uppercase tracking-wider text-foreground/60 hover:text-primary transition-colors"
                >
                  {uploadingIdx === idx ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                  ) : (
                    <><ImagePlus className="w-3.5 h-3.5" /> Add a photo (optional, one total)</>
                  )}
                </button>
              )}
              <input
                ref={(el) => { fileRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(idx, f);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {(facts.length > 0 || pickerOpen) && (
        <div className="mt-4">
          {pickerOpen ? (
            <div className="border-2 border-foreground rounded-2xl p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-700 text-xs uppercase tracking-wider">
                  Pick a prompt - or write your own
                </p>
                <button
                  type="button"
                  onClick={() => { setPickerOpen(false); setCustomDraft(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom prompt */}
              <div className="flex gap-2 mb-3">
                <input
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addFact(customDraft.trim()); }}
                  placeholder="Write your own prompt or heading…"
                  className="flex-1 bg-background border-2 border-border rounded-full px-3 py-1.5 font-body text-xs outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => addFact(customDraft.trim())}
                  disabled={!customDraft.trim()}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground disabled:opacity-40 rounded-full px-3 py-1.5 font-display font-700 text-[11px] uppercase tracking-wider"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <p className="font-display font-700 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Or pick a prompt
              </p>
              <div className="flex flex-wrap gap-1.5">
                {remainingPrompts.length === 0 && (
                  <p className="font-body text-xs text-muted-foreground">
                    You've used every prompt - nice work.
                  </p>
                )}
                {remainingPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addFact(p)}
                    className="px-3 py-1.5 rounded-full font-body text-xs border border-border text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            facts.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 border-2 border-foreground rounded-full px-4 py-2 font-display font-700 text-[11px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                <Plus className="w-3 h-3" /> Add another
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FunFactsEditor;
