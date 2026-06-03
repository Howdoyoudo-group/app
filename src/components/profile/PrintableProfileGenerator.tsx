// Public entry point. Internals live in ./magazine/*
// Kept as a thin shell so existing imports (MyProfile.tsx, ExportProfileDialog.tsx) continue to work.
import MagazineGenerator from "./magazine";
export type { PrintableData } from "./magazine/types";
export default MagazineGenerator;
