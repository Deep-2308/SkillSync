"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  XCircle,
  Eye,
  PlusCircle,
  Clock,
  CheckCircle2,
  XOctagon,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type ProjectData = {
  _id: string;
  title: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  proposalCount: number;
};

export function ClientProjectList({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const router = useRouter();

  const handleClose = async (id: string) => {
    if (!confirm("Are you sure you want to close this project? It cannot be reopened.")) return;
    
    setIsClosing(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to close project");
      }

      setProjects((prev) => 
        prev.map((p) => p._id === id ? { ...p, status: "cancelled" } : p)
      );
      toast.success("Project closed successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsClosing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Open</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XOctagon className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return null;
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/30">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          You haven't posted any projects. Create your first project to start receiving proposals from talented freelancers.
        </p>
        <Button asChild>
          <Link href="/post-project">
            <PlusCircle className="w-4 h-4 mr-2" /> Post a Project
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Project Title</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Proposals</th>
              <th className="px-6 py-4 font-semibold">Posted</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => (
              <tr key={project._id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  <Link href={`/projects/${project._id}`} className="hover:underline hover:text-brand transition-colors">
                    {project.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(project.status)}
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  {project.proposalCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                      {project.proposalCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/projects/${project._id}`} className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> View Project
                        </Link>
                      </DropdownMenuItem>
                      {project.status === "open" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project._id}/edit`} className="cursor-pointer">
                              <Pencil className="w-4 h-4 mr-2" /> Edit Project
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            disabled={isClosing === project._id}
                            onClick={() => handleClose(project._id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Close Project
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
