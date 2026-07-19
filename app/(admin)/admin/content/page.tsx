"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminContentPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchProjects = () => fetch("/api/admin/content/projects").then(r=>r.json()).then(d=>setProjects(d.data));
  const fetchGigs = () => fetch("/api/admin/content/gigs").then(r=>r.json()).then(d=>setGigs(d.data));
  const fetchReviews = () => fetch("/api/admin/content/reviews").then(r=>r.json()).then(d=>setReviews(d.data));

  useEffect(() => {
    fetchProjects();
    fetchGigs();
    fetchReviews();
  }, []);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/admin/content/${type}s/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`${type} deleted`);
      if (type === "project") fetchProjects();
      if (type === "gig") fetchGigs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReviewAction = async (id: string, action: "approve" | "remove") => {
    try {
      const res = await fetch(`/api/admin/content/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(`Review ${action}d`);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Flagged Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="gigs">Gigs</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4 pt-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No flagged reviews.</TableCell></TableRow>
                )}
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.reviewerId?.name}</TableCell>
                    <TableCell>{r.targetId?.name}</TableCell>
                    <TableCell>{r.rating}/5</TableCell>
                    <TableCell className="max-w-md truncate">{r.comment}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleReviewAction(r.id, "approve")}>Approve</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReviewAction(r.id, "remove")}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 pt-4">
           <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.postedBy?.name}</TableCell>
                    <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete("project", p.id)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="gigs" className="space-y-4 pt-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gigs.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.title}</TableCell>
                    <TableCell>{g.providerId?.name}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete("gig", g.id)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
