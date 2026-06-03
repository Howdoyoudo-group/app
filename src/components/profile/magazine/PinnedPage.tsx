import React, { useCallback, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { SECTIONS, type PinnedLayout, type SectionContext, type SectionId } from "./sections";
import { PAGE_W, PAGE_H, PAGE_PAD } from "./PageFrame";

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  unit?: "px";
  section?: SectionId | null;
};

// Legacy 12×12 grid → exact canvas pixels (for layouts saved before the absolute-pos rewrite).
const LEGACY_COLS = 12;
const LEGACY_ROWS = 12;
const LEGACY_MARGIN = 8;
const INNER_W = PAGE_W - PAGE_PAD * 2;
const INNER_H = PAGE_H - PAGE_PAD * 2;
const LEGACY_COL_WIDTH = (INNER_W - LEGACY_MARGIN * (LEGACY_COLS - 1)) / LEGACY_COLS;
const LEGACY_ROW_HEIGHT = (INNER_H - LEGACY_MARGIN * (LEGACY_ROWS - 1)) / LEGACY_ROWS;
const legacySpan = (s: number, u: number) => Math.round(s * u + Math.max(0, s - 1) * LEGACY_MARGIN);
const legacyPos = (p: number, u: number) => Math.round(p * (u + LEGACY_MARGIN));

const MIN_W = 60;
const MIN_H = 48;
const SNAP = 8;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const PINNED_DROP_W = legacySpan(3, LEGACY_COL_WIDTH);
export const PINNED_DROP_H = legacySpan(2, LEGACY_ROW_HEIGHT);

const normalize = (s: LayoutItem): LayoutItem => {
  const isLegacy = s.unit !== "px";
  const w = isLegacy && s.w <= LEGACY_COLS ? legacySpan(s.w, LEGACY_COL_WIDTH) : Math.round(s.w);
  const h = isLegacy && s.h <= LEGACY_ROWS ? legacySpan(s.h, LEGACY_ROW_HEIGHT) : Math.round(s.h);
  const x = isLegacy && s.x <= LEGACY_COLS ? legacyPos(s.x, LEGACY_COL_WIDTH) : Math.round(s.x);
  const y = isLegacy && s.y <= LEGACY_ROWS ? legacyPos(s.y, LEGACY_ROW_HEIGHT) : Math.round(s.y);
  return {
    ...s,
    unit: "px",
    w: clamp(w, MIN_W, INNER_W),
    h: clamp(h, MIN_H, INNER_H),
    x: clamp(x, 0, INNER_W - MIN_W),
    y: clamp(y, 0, INNER_H - MIN_H),
  };
};

interface Props extends SectionContext {
  layout: PinnedLayout;
  page: "page1" | "page2";
  editing?: boolean;
  onLayoutChange?: (page: "page1" | "page2", layout: LayoutItem[]) => void;
  onRemove?: (page: "page1" | "page2", id: string) => void;
  onDropSection?: (page: "page1" | "page2", x: number, y: number) => void;
  droppingItem?: { i: string; w: number; h: number };
}

const PinnedPage: React.FC<Props> = ({
  layout, page, editing, onLayoutChange, onRemove, onDropSection, droppingItem, ...ctx
}) => {
  const slots = useMemo(() => layout[page].map(normalize), [layout, page]);
  const [selected, setSelected] = useState<string | null>(null);

  const updateOne = useCallback((id: string, patch: Partial<LayoutItem>) => {
    if (!onLayoutChange) return;
    onLayoutChange(page, slots.map(s => s.i === id ? { ...s, ...patch, unit: "px" } : s));
  }, [onLayoutChange, page, slots]);

  const maxZ = useMemo(() => slots.reduce((m, s) => Math.max(m, s.z ?? 0), 0), [slots]);
  const minZ = useMemo(() => slots.reduce((m, s) => Math.min(m, s.z ?? 0), 0), [slots]);

  const handleNativeDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!editing || !onDropSection) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = INNER_W / rect.width;
    const sy = INNER_H / rect.height;
    const w = droppingItem?.w ?? PINNED_DROP_W;
    const h = droppingItem?.h ?? PINNED_DROP_H;
    const x = clamp(Math.round(((e.clientX - rect.left) * sx) / SNAP) * SNAP, 0, INNER_W - w);
    const y = clamp(Math.round(((e.clientY - rect.top) * sy) / SNAP) * SNAP, 0, INNER_H - h);
    onDropSection(page, x, y);
  }, [droppingItem?.h, droppingItem?.w, editing, onDropSection, page]);

  return (
    <div
      style={{ width: INNER_W, height: INNER_H, position: "relative" }}
      onDragOver={(e) => {
        if (!editing || !onDropSection) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleNativeDrop}
      onMouseDown={() => setSelected(null)}
    >
      {slots.map(slot => {
        const def = slot.section ? SECTIONS[slot.section] : null;
        const node = def?.has(ctx) ? def.render(ctx) : null;
        const isSel = selected === slot.i;
        const z = slot.z ?? 1;

        const content = (
          <div className={editing
            ? `slot-edit-shell relative w-full h-full rounded-2xl bg-background overflow-hidden ${isSel ? "ring-2 ring-primary" : "ring-1 ring-foreground/20"}`
            : "w-full h-full overflow-hidden"}>
            {editing && (
              <>
                <div className="slot-edit-label absolute top-1 left-2 z-10 font-display text-[8px] uppercase tracking-wider opacity-60 pointer-events-none select-none">
                  {def?.label ?? "Empty"}
                </div>
                <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5">
                  <button
                    type="button"
                    onMouseDown={e => { e.stopPropagation(); }}
                    onClick={(e) => { e.stopPropagation(); updateOne(slot.i, { z: maxZ + 1 }); }}
                    className="slot-action-btn p-1 rounded bg-background border border-foreground/30 hover:bg-foreground hover:text-background"
                    title="Bring forward"
                  ><ChevronUp className="w-3 h-3" /></button>
                  <button
                    type="button"
                    onMouseDown={e => { e.stopPropagation(); }}
                    onClick={(e) => { e.stopPropagation(); updateOne(slot.i, { z: minZ - 1 }); }}
                    className="slot-action-btn p-1 rounded bg-background border border-foreground/30 hover:bg-foreground hover:text-background"
                    title="Send backward"
                  ><ChevronDown className="w-3 h-3" /></button>
                  {onRemove && (
                    <button
                      type="button"
                      onMouseDown={e => { e.stopPropagation(); }}
                      onClick={(e) => { e.stopPropagation(); onRemove(page, slot.i); }}
                      className="slot-action-btn p-1 rounded bg-background border border-foreground/30 hover:bg-destructive hover:text-destructive-foreground"
                      title="Remove from page"
                    ><X className="w-3 h-3" /></button>
                  )}
                </div>
              </>
            )}
            <div className="w-full h-full overflow-hidden">
              {node ?? (
                <div className="w-full h-full rounded-2xl border-2 border-dashed border-foreground/30 flex items-center justify-center text-[10px] uppercase tracking-wider font-display text-foreground/50 p-2 text-center">
                  {def ? `No data: ${def.label}` : "Empty slot"}
                </div>
              )}
            </div>
          </div>
        );

        if (!editing) {
          return (
            <div
              key={slot.i}
              style={{
                position: "absolute",
                left: slot.x,
                top: slot.y,
                width: slot.w,
                height: slot.h,
                zIndex: z,
              }}
            >
              {content}
            </div>
          );
        }

        return (
          <Rnd
            key={slot.i}
            size={{ width: slot.w, height: slot.h }}
            position={{ x: slot.x, y: slot.y }}
            bounds="parent"
            minWidth={MIN_W}
            minHeight={MIN_H}
            dragGrid={[SNAP, SNAP]}
            resizeGrid={[SNAP, SNAP]}
            cancel=".slot-action-btn"
            style={{ zIndex: isSel ? 9999 : z }}
            onMouseDown={(e: any) => { e.stopPropagation(); setSelected(slot.i); }}
            onDragStop={(_e, d) => updateOne(slot.i, { x: Math.round(d.x), y: Math.round(d.y) })}
            onResizeStop={(_e, _dir, ref, _delta, pos) => updateOne(slot.i, {
              w: Math.round(ref.offsetWidth),
              h: Math.round(ref.offsetHeight),
              x: Math.round(pos.x),
              y: Math.round(pos.y),
            })}
            enableResizing={{
              top: true, right: true, bottom: true, left: true,
              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
            }}
          >
            {content}
          </Rnd>
        );
      })}
    </div>
  );
};

export default PinnedPage;
