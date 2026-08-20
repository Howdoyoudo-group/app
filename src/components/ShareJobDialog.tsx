import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ShareableJob {
  dbId?: string;
  title: string;
  company: string;
}

interface ShareJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: ShareableJob;
}

interface CommunityMember {
  id: string;
  full_name: string | null;
  member_bio: string | null;
}

export function ShareJobDialog({ open, onOpenChange, job }: ShareJobDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<CommunityMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareLink = `${window.location.origin}/marketplace?jobId=${job.dbId}`;

  const handleSearchMembers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-community-members", {
        body: { query },
      });

      if (error) throw error;
      setSearchResults(data?.members || []);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search members");
    } finally {
      setSearching(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareViaEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-job-email", {
        body: {
          jobId: job.dbId,
          jobTitle: job.title,
          company: job.company,
          email,
          recipientName: recipientName.trim() || undefined,
          shareLink,
          senderName: user?.user_metadata?.full_name || "A How Do You Do user",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Job shared with ${email}`);
      setEmail("");
      setRecipientName("");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to share job");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const handleShareWithCommunity = async () => {
    if (!selectedMember) {
      toast.error("Please select a community member");
      return;
    }
    if (!user) {
      toast.error("Please log in to share");
      return;
    }

    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-job-with-member", {
        body: {
          jobId: job.dbId,
          jobTitle: job.title,
          company: job.company,
          recipientUserId: selectedMember.id,
          senderUserId: user.id,
          shareLink,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Job shared with ${selectedMember.full_name || "member"}`);
      setUserSearch("");
      setSelectedMember(null);
      setSearchResults([]);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to share job");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Job</DialogTitle>
          <DialogDescription>
            {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy this link to share the job. It will always link back to How Do You Do.
            </p>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="text-xs"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter an email address to share this job.
            </p>
            <Input
              type="text"
              placeholder="Their name (optional)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="someone@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={handleShareViaEmail}
              disabled={sharing || !email}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share with a member of the How Do You Do community.
            </p>
            <div className="relative">
              <Input
                placeholder="Search community members..."
                value={userSearch}
                onChange={(e) => handleSearchMembers(e.target.value)}
              />
              {searching && (
                <div className="text-xs text-muted-foreground mt-2">Searching...</div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setUserSearch("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0 text-sm"
                  >
                    <p className="font-medium text-foreground">{member.full_name || "Community Member"}</p>
                    {member.member_bio && (
                      <p className="text-xs text-muted-foreground truncate">{member.member_bio}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedMember && (
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <p className="text-sm">
                  Sharing with: <span className="font-semibold">{selectedMember.full_name || "member"}</span>
                </p>
              </div>
            )}

            <Button
              onClick={handleShareWithCommunity}
              disabled={sharing || !selectedMember}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Send to Member
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
