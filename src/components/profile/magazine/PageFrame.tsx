import React from "react";

export const PAGE_W = 1123;
export const PAGE_H = 794;
export const PAGE_PAD = 28;

interface Props {
  label: string;
  children: React.ReactNode;
}

const PageFrame = React.forwardRef<HTMLDivElement, Props>(({ label, children }, ref) => (
  <div className="space-y-1">
    <div className="font-display text-[10px] uppercase tracking-wider text-muted-foreground text-center">{label}</div>
    <div
      ref={ref}
      className="printable-page bg-background border border-foreground/30"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        padding: PAGE_PAD,
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {children}
    </div>
  </div>
));
PageFrame.displayName = "PageFrame";
export default PageFrame;
