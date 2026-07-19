"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MatchCandidate {
  candidateId: string;
  matchPercentage: number;
  reasons: string[];
  project: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    budgetType: string;
    budgetMax: number;
    budgetMin: number;
    hourlyRate: number;
    experienceLevel: string;
  };
}

export function SmartProjectMatchesPanel() {
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAiPowered, setIsAiPowered] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`/api/ai/matches/projects`);
        const data = await res.json();
        if (res.ok) {
          setMatches(data.data || []);
          if (data.data && data.data.length > 0 && data.data[0].reasons[0] === "Strong category overlap") {
            setIsAiPowered(false);
          } else {
            setIsAiPowered(true);
          }
        } else {
          setError(data.error || "Failed to load matches");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAiPowered ? (
            <Sparkles className="w-5 h-5 text-brand" />
          ) : (
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          )}
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Recommended for you
            {isAiPowered && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                AI Match
              </span>
            )}
          </h3>
        </div>
        <Link href="/freelancer/find-work" className="text-sm text-brand font-medium hover:underline">
          Browse All
        </Link>
      </div>
      
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Finding the best projects for you...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No recommended projects right now. Update your profile and skills to get better matches!
        </div>
      ) : (
        <div className="divide-y divide-border">
          {matches.map(({ project, matchPercentage, reasons }) => (
            <div key={project.id} className="p-6 flex flex-col gap-4 hover:bg-accent/50 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                
                <div className="flex gap-4 min-w-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm">
                      {matchPercentage}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project.id}`} className="font-semibold text-lg text-brand hover:underline line-clamp-1 mb-1">
                      {project.title}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-2">
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {project.budgetType === "fixed" ? `$${project.budgetMin} - $${project.budgetMax}` : `$${project.hourlyRate}/hr`}
                    </p>
                    <p className="text-xs text-muted-foreground">{project.budgetType === "fixed" ? "Fixed Price" : "Hourly"}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projects/${project.id}`}>View Details</Link>
                  </Button>
                </div>

              </div>

              {/* AI Reasons Expander */}
              <div className="ml-16 bg-muted/30 rounded-lg overflow-hidden border border-transparent">
                <button 
                  onClick={() => toggleExpand(project.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors uppercase tracking-wider"
                >
                  <span>Why this match?</span>
                  {expanded[project.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expanded[project.id] && (
                  <div className="px-3 pb-3 pt-1">
                    <ul className="text-sm text-foreground space-y-1.5">
                      {reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-brand shrink-0 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
