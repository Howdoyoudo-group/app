import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, UserPlus } from "lucide-react";

interface SignUpPopupProps {
  open: boolean;
  onClose: () => void;
}

const SignUpPopup = ({ open, onClose }: SignUpPopupProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background border-2 border-foreground w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">
          We'd love to get to know you
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-800 leading-none mb-3">
          Your personalised job matches are ready<span className="text-primary">.</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Sign up free to see the jobs, industries and opportunities matched to what you love.
        </p>

        <Link
          to="/auth"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" strokeWidth={2.5} />
          Sign up to see them
        </Link>

        <p className="mt-4 text-center font-body text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" onClick={onClose} className="text-primary font-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export const useSignUpPopup = (delayMs: number = 20000, enabled: boolean = true) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const dismissed = sessionStorage.getItem("signup-popup-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, enabled]);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem("signup-popup-dismissed", "true");
  };

  const openPopup = () => setOpen(true);

  return { open, close, openPopup };
};

export default SignUpPopup;
