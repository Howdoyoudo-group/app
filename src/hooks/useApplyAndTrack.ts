import { useJobTracker, type NewTrackerItem } from "@/hooks/useJobTracker";

/**
 * Shared "prepared application" finishing move for both AI apply-helper
 * surfaces (JobApplicationHelper, HelpMeApply): open the real apply page and
 * log it into Job Tracker as applied, in one click. Howdy never submits
 * anything on the user's behalf - this only opens the outbound link the
 * job's source already provided.
 */
export function useApplyAndTrack() {
  const { addItem } = useJobTracker();

  const applyAndTrack = async (job: NewTrackerItem & { url: string }) => {
    if (job.url) window.open(job.url, "_blank", "noopener,noreferrer");
    return addItem({ ...job, status: "applied" });
  };

  return { applyAndTrack };
}
