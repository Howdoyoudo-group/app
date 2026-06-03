import { Children, Fragment, isValidElement, type ReactNode } from "react";
import PodcastPlayer from "./PodcastPlayer";

/**
 * Reorders the Listen tab so that "Podcasts We Rate" (and any other curated
 * sections) appear ABOVE the AI-narrated <PodcastPlayer /> block.
 *
 * Industry/role pages typically render the Listen tab as a Fragment:
 *   <>
 *     <h2>Episodes.</h2>
 *     <p>Coming soon…</p>
 *     <PodcastPlayer industry="…" />
 *     <h2>Podcasts We Rate.</h2>
 *     <div>…links…</div>
 *   </>
 *
 * We recursively flatten Fragments so the PodcastPlayer is reachable at the
 * top level, then split the children at the player. Everything BEFORE the
 * player (the "Episodes" intro) drops to the bottom alongside the player;
 * everything AFTER (the curated "Podcasts We Rate" block) stays on top.
 */
function flattenFragments(node: ReactNode, out: ReactNode[]) {
  Children.forEach(node, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      flattenFragments((child.props as { children?: ReactNode })?.children, out);
      return;
    }
    if (child === null || child === undefined || child === false) return;
    out.push(child);
  });
}

const ReorderListenSections = ({ children }: { children: ReactNode }) => {
  const arr: ReactNode[] = [];
  flattenFragments(children, arr);

  const playerIdx = arr.findIndex(
    (child) => isValidElement(child) && child.type === PodcastPlayer,
  );

  if (playerIdx === -1) {
    return <>{children}</>;
  }

  const beforePlayer = arr.slice(0, playerIdx); // "Episodes" intro
  const player = arr[playerIdx];
  const afterPlayer = arr.slice(playerIdx + 1); // "Podcasts We Rate" + extras

  // Re-key everything so React doesn't complain about siblings without keys.
  const keyed = (nodes: ReactNode[], prefix: string) =>
    nodes.map((n, i) =>
      isValidElement(n) ? <Fragment key={`${prefix}-${i}`}>{n}</Fragment> : n,
    );

  return (
    <>
      {keyed(afterPlayer, "after")}
      {keyed(beforePlayer, "before")}
      <Fragment key="player">{player}</Fragment>
    </>
  );
};

export default ReorderListenSections;
