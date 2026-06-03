import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const industries = [
  { name: "Bakery", path: "/bakery" },
  { name: "Beer", path: "/beer" },
  { name: "Charity", path: "/charity" },
  { name: "Film and TV", path: "/cinema" },
  { name: "Coffee", path: "/coffee" },
  { name: "Estate Agency", path: "/estate-agency" },
  { name: "Farming", path: "/farming" },
  { name: "Fashion", path: "/fashion" },
  { name: "Food & Drink", path: "/hospitality" },
  { name: "Football", path: "/football" },
  { name: "Footwear", path: "/footwear" },
  { name: "Formula 1", path: "/formula-1" },
  { name: "Gaming", path: "/gaming" },
  { name: "Grocery", path: "/grocery" },
  { name: "Health", path: "/health" },
  { name: "Horse Racing", path: "/horse-racing" },
  { name: "Interior Design", path: "/interior-design" },
  { name: "Journalism", path: "/journalism" },
  { name: "Money", path: "/money" },
  { name: "Music", path: "/music" },
  { name: "Pets", path: "/pets" },
  { name: "Physiotherapy", path: "/physiotherapy" },
  { name: "Psychotherapy", path: "/psychotherapy" },
  { name: "Teaching", path: "/teaching" },
  { name: "Travel", path: "/travel" },
  { name: "Wellness", path: "/wellness" },
];

const CoursesHighlight = () => {
  return (
    <section id="courses" className="py-20 md:py-28 px-6 md:px-12">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
            <p className="text-primary text-xs tracking-[0.3em] uppercase font-body">
              Learn
            </p>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-900 leading-[0.95] tracking-tight mb-4">
            Courses<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Curated courses from top universities, industry bodies, and learning platforms - free and paid - to help you break into the industries that interest you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.03 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`${ind.path}#courses`}
                className="group flex items-center justify-between p-4 border border-border hover:bg-muted/30 transition-colors"
              >
                <span className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">
                  {ind.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesHighlight;
