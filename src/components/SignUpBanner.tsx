import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignUpBanner = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("signup-banner-dismissed")) return;
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem("signup-banner-dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-4 py-4 md:px-8 md:py-5"
        >
          <div className="container mx-auto flex items-center justify-between gap-4 max-w-3xl">
            <div className="flex-1 min-w-0">
              <p className="font-display font-700 text-sm md:text-base text-foreground leading-tight">
                Join the community<span className="text-primary">.</span>
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Sign up to save your profile, get job alerts & discover your career fit.
              </p>
            </div>
            <Link
              to="/auth"
              className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </Link>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignUpBanner;
