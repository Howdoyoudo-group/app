import { Briefcase, Lightbulb, Clock, CheckCircle2 } from "lucide-react";

export interface RoleOverviewData {
  summary: string;
  dayToDay: string[];
  skills: string[];
  traits: string[];
  salary: string;
  entryTip: string;
}

interface RoleOverviewProps {
  name: string;
  data: RoleOverviewData;
}

const RoleOverview = ({ name, data }: RoleOverviewProps) => {
  return (
    <div className="mb-12">
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        What is {name}
        <span className="text-primary">?</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm md:text-base max-w-2xl mb-8">
        {data.summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Day to Day */}
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-display font-700 text-sm uppercase tracking-wide">
              Day-to-Day
            </h3>
          </div>
          <ul className="space-y-2">
            {data.dayToDay.map((item) => (
              <li
                key={item}
                className="text-muted-foreground font-body text-xs flex items-start gap-2"
              >
                <span className="w-1 h-1 bg-primary rounded-full shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Skills */}
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-display font-700 text-sm uppercase tracking-wide">
              Key Skills
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="bg-primary/10 text-primary font-display font-600 text-xs px-3 py-1.5 tracking-wide"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* You'll thrive if */}
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-700 text-sm uppercase tracking-wide">
              You'll Thrive If…
            </h3>
          </div>
          <ul className="space-y-2">
            {data.traits.map((trait) => (
              <li
                key={trait}
                className="text-muted-foreground font-body text-xs flex items-start gap-2"
              >
                <span className="w-1 h-1 bg-primary rounded-full shrink-0 mt-1.5" />
                {trait}
              </li>
            ))}
          </ul>
        </div>

        {/* Getting in */}
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-display font-700 text-sm uppercase tracking-wide">
              Getting In
            </h3>
          </div>
          <p className="text-muted-foreground font-body text-xs mb-3">
            {data.entryTip}
          </p>
          <p className="font-display font-700 text-sm text-foreground">
            Typical starting salary: <span className="text-primary">{data.salary}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleOverview;
