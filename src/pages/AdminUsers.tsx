import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Crown, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_premium: boolean;
  is_admin: boolean;
  is_employer: boolean;
  is_subscribed: boolean;
}

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Users · Admin";
  }, []);

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users" as never, {
      _search: q || null,
      _limit: 200,
      _offset: 0,
    } as never);
    if (error) {
      toast.error(`Failed to load users: ${error.message}`);
      setUsers([]);
    } else {
      setUsers((data ?? []) as unknown as UserRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/admin/users");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const superadmin = (roles ?? []).some((r) => (r.role as string) === "superadmin");
      setIsAdmin(superadmin);
      if (superadmin) await loadUsers("");
      else setLoading(false);
    })();
  }, [user, authLoading, navigate, loadUsers]);

  // Debounced search
  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, isAdmin, loadUsers]);

  const togglePremium = async (u: UserRow, next: boolean) => {
    setPendingId(u.id);
    // Optimistic update
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, is_premium: next } : x)),
    );
    const { error } = await supabase.rpc("admin_set_premium" as never, {
      _user_id: u.id,
      _is_premium: next,
    } as never);
    if (error) {
      toast.error(`Failed: ${error.message}`);
      // Revert
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_premium: !next } : x)),
      );
    } else {
      toast.success(
        `${u.email} is ${next ? "now premium ✨" : "no longer premium"}`,
      );
    }
    setPendingId(null);
  };

  const toggleAdmin = async (u: UserRow, next: boolean) => {
    if (u.id === user?.id && !next) {
      toast.error("You can't remove your own admin role.");
      return;
    }
    setPendingId(u.id);
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, is_admin: next } : x)),
    );
    const { error } = await supabase.rpc("admin_set_admin" as never, {
      _user_id: u.id,
      _is_admin: next,
    } as never);
    if (error) {
      toast.error(`Failed: ${error.message}`);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_admin: !next } : x)),
      );
    } else {
      toast.success(
        `${u.email} is ${next ? "now an admin 🛡️" : "no longer an admin"}`,
      );
    }
    setPendingId(null);
  };

  const toggleMailingList = async (u: UserRow, next: boolean) => {
    setPendingId(u.id);
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, is_subscribed: next } : x)),
    );
    const { error } = await supabase.rpc("admin_set_mailing_list" as never, {
      _user_id: u.id,
      _subscribed: next,
    } as never);
    if (error) {
      toast.error(`Failed: ${error.message}`);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_subscribed: !next } : x)),
      );
    } else {
      toast.success(
        next ? `${u.email} added back to mailing lists` : `${u.email} removed from mailing lists`,
      );
    }
    setPendingId(null);
  };

  const deleteUser = async (u: UserRow) => {
    if (u.id === user?.id) {
      toast.error("You can't delete your own account.");
      return;
    }
    setPendingId(u.id);
    const { error } = await supabase.rpc("admin_delete_user" as never, {
      _user_id: u.id,
    } as never);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
    } else {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success(`Deleted ${u.email}`);
    }
    setPendingId(null);
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-6 max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Superadmin only</h1>
          <p className="text-sm text-muted-foreground">
            Only superadmins can view and change user details.
          </p>
        </Card>
      </div>
    );
  }

  const premiumCount = users.filter((u) => u.is_premium).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Crown className="h-7 w-7 text-primary" />
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subscribers. Toggle premium to unlock Howdy voice mode.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary">
            {users.length} shown · {premiumCount} premium
          </Badge>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead className="text-right">Admin</TableHead>
                  <TableHead className="text-right">Mailing list</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">
                        {u.full_name || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {u.is_admin && <Badge variant="default">Admin</Badge>}
                        {u.is_employer && <Badge variant="outline">Employer</Badge>}
                        {u.is_premium && (
                          <Badge className="bg-primary text-primary-foreground">
                            ✨ Premium
                          </Badge>
                        )}
                        {!u.is_admin && !u.is_employer && !u.is_premium && (
                          <span className="text-xs text-muted-foreground">Free</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pendingId === u.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                        <Switch
                          checked={u.is_premium}
                          disabled={pendingId === u.id}
                          onCheckedChange={(checked) => togglePremium(u, checked)}
                          aria-label={`Toggle premium for ${u.email}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={u.is_admin}
                        disabled={pendingId === u.id || u.id === user?.id}
                        onCheckedChange={(checked) => toggleAdmin(u, checked)}
                        aria-label={`Toggle admin for ${u.email}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <Switch
                          checked={u.is_subscribed}
                          disabled={pendingId === u.id}
                          onCheckedChange={(checked) => toggleMailingList(u, checked)}
                          aria-label={
                            u.is_subscribed
                              ? `Remove ${u.email} from mailing lists`
                              : `Add ${u.email} back to mailing lists`
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={pendingId === u.id || u.id === user?.id}
                            aria-label={`Delete ${u.email}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes <strong>{u.email}</strong> and all their data. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser(u)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
