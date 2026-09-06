import { useJobTracker, type NewTrackerItem } from "@/hooks/useJobTracker";

/**
 * Shared "prepared application" finishing move for both AI apply-helper
 * surfaces (JobApplicationHelper, HelpMeApply): open the real apply page and
 * log it into Job Tracker as applied, in one click. Howdy never submits
 * anything on the user's behalf - this only opens the outbound link the
 * job's source already provided.
 *
 * Pass `existingItemId` when the job is already tracked (e.g. this flow was
 * opened from a Job Tracker card) so marking it applied updates that row
 * instead of inserting a duplicate.
 */
export function useApplyAndTrack() {
  const { addItem, updateStatus, updateItem } = useJobTracker();

  const applyAndTrack = async (
    job: NewTrackerItem & { url: string },
    existingItemId?: string,
  ) => {
    if (job.url) window.open(job.url, "_blank", "noopener,noreferrer");
    if (existingItemId) {
      await updateStatus(existingItemId, "applied");
      if (job.application_helper) {
        await updateItem(existingItemId, { application_helper: job.application_helper });
      }
      return { id: existingItemId };
    }
    return addItem({ ...job, status: "applied" });
  };

  return { applyAndTrack };
}
