"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  DollarSign,
  Star,
  MoreVertical,
  Loader2,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Pencil
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Gig = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  hourlyRate: number;
  isPublished: boolean;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  revisions: number;
  createdAt: string;
};

interface GigsClientProps {
  initialGigs: Gig[];
}

export function GigsClient({ initialGigs }: GigsClientProps) {
  const [gigs, setGigs] = useState<Gig[]>(initialGigs);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [gigToDelete, setGigToDelete] = useState<Gig | null>(null);
  const [togglingMap, setTogglingMap] = useState<Record<string, boolean>>({});

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setTogglingMap((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update gig.");

      setGigs((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isPublished: !currentStatus } : g))
      );
      toast.success(!currentStatus ? "Gig published!" : "Gig unpublished!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setTogglingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async () => {
    if (!gigToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/skills/${gigToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete gig.");

      setGigs((prev) => prev.filter((g) => g.id !== gigToDelete.id));
      setGigToDelete(null);
      toast.success("Gig deleted successfully.");
    } catch (err: any) {
      setDeleteError(err.message || "An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Gigs</h1>
          <p className="text-muted-foreground">Manage your service offerings.</p>
        </div>
        <Button asChild>
          <Link href="/freelancer/gigs/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Gig
          </Link>
        </Button>
      </div>

      {gigs.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30 flex flex-col items-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Gigs Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first gig to start offering your services to clients.
          </p>
          <Button asChild>
            <Link href="/freelancer/gigs/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Gig
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig.id} className="bg-card rounded-2xl border flex flex-col overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${gig.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground border'}`}>
                    {gig.isPublished ? "Published" : "Draft"}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/gigs/${gig.slug}`} className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> View Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/freelancer/gigs/${gig.id}/edit`} className="cursor-pointer disabled opacity-50 pointer-events-none">
                          <Pencil className="w-4 h-4 mr-2" /> Edit Gig
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                        onClick={() => setGigToDelete(gig)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2 hover:underline">
                  <Link href={`/gigs/${gig.slug}`}>{gig.title}</Link>
                </h3>
                
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-foreground">{gig.rating.toFixed(1)}</span>
                  ({gig.reviewCount})
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-md">{gig.category}</span>
                  <span className="px-2 py-1 bg-muted rounded-md capitalize">{gig.level}</span>
                </div>
              </div>

              <div className="p-4 border-t bg-muted/20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Starting at</span>
                  <span className="text-lg font-bold text-foreground">${gig.hourlyRate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`publish-${gig.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                    {togglingMap[gig.id] && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                    {gig.isPublished ? "Visible to public" : "Hidden"}
                  </Label>
                  <Switch 
                    id={`publish-${gig.id}`}
                    checked={gig.isPublished} 
                    onCheckedChange={() => handleTogglePublish(gig.id, gig.isPublished)}
                    disabled={togglingMap[gig.id]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!gigToDelete} onOpenChange={(open) => !open && !isDeleting && setGigToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{gigToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setGigToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete Gig"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
