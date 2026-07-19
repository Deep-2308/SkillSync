"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStatus } from "@/hooks/use-ai-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface HiringCopilotProps {
  projectId: string;
  proposals: any[];
}

export function HiringCopilot({ projectId, proposals }: HiringCopilotProps) {
  const aiStatus = useAIStatus();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);

  if (proposals.length < 3) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to analyze proposals.");
      
      setAnalysis(json.data);
      toast.success("AI analysis complete!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold text-foreground">Hiring Copilot</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Get an AI-generated comparison of your proposals.
          </p>
        </div>
        
        {!analysis && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!aiStatus.enabled || isAnalyzing}
                    className="bg-brand text-primary-foreground hover:bg-brand/90"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze {proposals.length} Proposals
                  </Button>
                </div>
              </TooltipTrigger>
              {!aiStatus.enabled && (
                <TooltipContent>
                  <p>AI features are currently unavailable.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground mb-6">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          <strong>Disclaimer:</strong> This analysis is AI-generated for advisory purposes only. It is intended to assist your review process and does not make hiring decisions, reject proposals, or hide candidates.
        </p>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
          {proposals.map((proposal) => {
            const data = analysis[proposal.id || proposal._id];
            if (!data) return null;

            return (
              <div key={proposal.id || proposal._id} className="bg-background rounded-xl border p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {proposal.freelancerId?.name || "Unknown"}
                    </h4>
                    <p className="text-xs text-muted-foreground">Fit Score: <strong className={data.fitScore >= 80 ? "text-emerald-600" : "text-foreground"}>{data.fitScore}/100</strong></p>
                  </div>
                </div>
                
                <p className="text-sm text-foreground/90 leading-relaxed mb-4 flex-1">
                  {data.summary}
                </p>

                <div className="space-y-4 pt-4 border-t border-border">
                  {data.strengths && data.strengths.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Strengths
                      </h5>
                      <ul className="space-y-1">
                        {data.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.concerns && data.concerns.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Concerns
                      </h5>
                      <ul className="space-y-1">
                        {data.concerns.map((c: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
