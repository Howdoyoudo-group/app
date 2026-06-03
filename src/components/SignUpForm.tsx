import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const SignUpForm = () => {
  return (
    <section id="community" className="py-20 md:py-32 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
            Join the community
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-800 leading-none mb-4">
            Sign up & find your fit<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-base mb-8 max-w-lg">
            Create a free account to get personalised job matches, daily industry newsletters, and discover which roles suit you best with Understand Me.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-8 py-4 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            Create your free account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SignUpForm;
