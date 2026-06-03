import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  value?: string;
  onChange: (url: string) => void;
  preview?: React.ReactNode;
  label?: string;
}

const LogoUploader = ({ userId, value, onChange, preview, label = "Add a photo" }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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
    onChange(data.publicUrl);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Logo uploaded");
  };

  return (
    <div className="flex items-center gap-2">
      {preview}
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-destructive hover:border-destructive font-display text-[10px] font-700 uppercase tracking-wider"
        >
          <X className="w-3 h-3" /> Remove
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background font-display text-[10px] font-700 uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {value ? "Replace" : label}
      </button>
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

export default LogoUploader;
