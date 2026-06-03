import { INDUSTRY_ICONS } from "@/data/industryIcons";

interface IndustryIconProps {
  industry: string;
  className?: string;
}

const IndustryIcon = ({ industry, className = "w-8 h-8" }: IndustryIconProps) => {
  const icon = INDUSTRY_ICONS[industry];
  if (!icon) return null;

  return (
    <img
      src={icon}
      alt={industry}
      className={`${className} rounded-full object-cover border border-border`}
      loading="lazy"
    />
  );
};

export default IndustryIcon;
