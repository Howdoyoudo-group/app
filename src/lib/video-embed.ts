// Turns a YouTube/Vimeo watch link into an embeddable iframe URL. Anything
// else is treated as a direct video file (mp4/webm/etc) and played natively.

export type EmbeddableVideo =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string };

export function toEmbeddableVideo(url: string): EmbeddableVideo | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  const yt = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (yt) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=0&rel=0` };
  }

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  return { kind: "file", src: trimmed };
}
