import { useRef, useState } from "react";
import { Loader2, X, Heart, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FamilyPhoto {
  url: string;
  caption: string;
  category?: string;
  path?: string;
}

const CATEGORY_SUGGESTIONS = [
  "Partner",
  "Kids",
  "Parents",
  "Siblings",
  "Family",
  "Dog",
  "Cat",
  "Pet",
  "Best mate",
];

interface Props {
  userId: string;
  photos: FamilyPhoto[];
  onChange: (next: FamilyPhoto[]) => void;
}

const FamilyPetsGallery = ({ userId, photos, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>("Family");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/family-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("love-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("love-photos").getPublicUrl(path);
    onChange([
      ...photos,
      { url: data.publicUrl, caption: "", category: pendingCategory, path },
    ]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Added! Tap the caption to describe it ✨");
  };

  const updatePhoto = (idx: number, patch: Partial<FamilyPhoto>) => {
    onChange(photos.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const removePhoto = async (idx: number) => {
    const photo = photos[idx];
    if (photo.path) {
      await supabase.storage.from("love-photos").remove([photo.path]);
    }
    onChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl overflow-hidden border-2 border-foreground bg-muted aspect-[4/5] shadow-[3px_3px_0_hsl(var(--primary))]"
          >
            <img
              src={photo.url}
              alt={photo.caption || "Family or pet"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 top-0 p-2 flex items-start justify-between gap-2">
              <select
                value={photo.category || "Family"}
                onChange={(e) => updatePhoto(idx, { category: e.target.value })}
                aria-label="Change category"
                className="no-print max-w-[70%] truncate inline-flex items-center bg-background/90 backdrop-blur px-2 py-0.5 rounded-full font-display text-[10px] font-700 uppercase tracking-wider text-foreground border border-foreground/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[photo.category || "Family", ...CATEGORY_SUGGESTIONS.filter(c => c !== (photo.category || "Family"))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="print-only max-w-[70%] truncate items-center bg-background px-2 py-0.5 rounded-full font-display text-[10px] font-700 uppercase tracking-wider text-foreground border border-foreground/20">
                {photo.category || "Family"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Remove this photo?")) removePhoto(idx);
                }}
                aria-label="Remove photo"
                className="no-print bg-background/95 hover:bg-destructive hover:text-destructive-foreground border border-foreground/20 rounded-full w-7 h-7 flex items-center justify-center shadow-sm shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/95 via-foreground/70 to-transparent p-2 pt-8">
              <input
                value={photo.caption}
                onChange={(e) => updatePhoto(idx, { caption: e.target.value })}
                placeholder="Tap to add a caption…"
                className="no-print w-full bg-background/15 hover:bg-background/25 focus:bg-background/30 rounded-md px-2 py-1 border border-background/30 focus:border-background/60 outline-none text-background placeholder:text-background/70 font-body text-xs font-600 transition-colors"
              />
              {photo.caption && (
                <span className="print-only w-full px-2 py-1 text-background font-body text-xs font-600">
                  {photo.caption}
                </span>
              )}
            </div>
          </div>
        ))}

        {photos.length === 0 && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="no-print aspect-[4/5] rounded-2xl border-2 border-dashed border-foreground/40 hover:border-primary bg-muted/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 p-3 text-center group"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                <ImagePlus className="w-5 h-5" />
              </div>
              <span className="font-display font-700 text-[11px] uppercase tracking-wider text-foreground">
                Add a photo
              </span>
              <span className="font-body text-[10px] text-muted-foreground leading-tight">
                Family, kids, pets, your people
              </span>
            </>
          )}
        </button>
        )}
      </div>

      {photos.length === 0 && (
      <div className="no-print mt-4">
        <p className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Tag your next photo as…
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_SUGGESTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setPendingCategory(cat)}
              className={`px-2.5 py-1 rounded-full font-display text-[10px] font-700 uppercase tracking-wider border transition-colors ${
                pendingCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
};

export default FamilyPetsGallery;
