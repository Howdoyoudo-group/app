import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedFeedItems, type SavedFeedItem, type SavedItemType } from "@/hooks/useSavedFeedItems";
import { useToast } from "@/hooks/use-toast";

interface Props {
  type: SavedItemType;
  itemKey: string;
  payload: SavedFeedItem["payload"];
  className?: string;
}

const LABELS: Record<SavedItemType, string> = {
  article: "article",
  news: "story",
  company_news: "story",
  briefing: "briefing",
  video: "video",
};

const FeedSaveButton = ({ type, itemKey, payload, className }: Props) => {
  const { isSaved, toggle } = useSavedFeedItems();
  const { toast } = useToast();
  const saved = isSaved(type, itemKey);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ item_type: type, item_key: itemKey, payload });
        toast({
          title: saved
            ? `Removed ${LABELS[type]} from saved`
            : `Saved ${LABELS[type]} to your list`,
        });
      }}
      aria-label={saved ? "Remove from saved" : "Save"}
      title={saved ? "Saved - tap to remove" : "Save"}
      className={
        className ??
        `p-1.5 rounded-full transition-colors ${
          saved
            ? "text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        }`
      }
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  );
};

export default FeedSaveButton;
