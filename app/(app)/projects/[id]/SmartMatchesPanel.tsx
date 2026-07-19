"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { RatingDisplay } from "@/components/shared/RatingDisplay";

interface MatchCandidate {
  candidateId: string;
  matchPercentage: number;
  reasons: string[];
  user: {
    id: string;
    name: string;
    headline: string;
    image: string;
    skills: string[];
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
  };
}

export function SmartMatchesPanel({ projectId }: { projectId: string }) {
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAiPowered, setIsAiPowered] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`/api/ai/matches/freelancers?projectId=${projectId}`);
        const data = await res.json();
        if (res.ok) {
          setMatches(data.data || []);
          // Check if fallback was used: if all matchPercentages are exactly 95, 92, 89 (the fallback logic)
          // or if we check a header/flag. For simplicity, we just assume if there's no "data" it failed.
          // Wait, the prompt says "omit the AI badge/label when AI is down". 
          // The API doesn't currently tell us if it's fallback. Let's look at the fallback reasons:
          // The fallback reasons are always ["Strong category overlap", "General skill alignment"].
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
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Finding the best freelancers for your project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-2xl border border-red-200 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-foreground">Recommended Freelancers</h2>
        {isAiPowered && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-brand/10 text-brand px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            AI Match
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <div key={match.candidateId} className="bg-card rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:border-brand/30 transition-colors group">
            
            <div className="flex flex-col items-center shrink-0">
              <Avatar className="w-16 h-16 border-2 border-background shadow-sm mb-2">
                <AvatarImage src={match.user.image || ""} />
                <AvatarFallback><UserCircle className="w-10 h-10 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-sm shadow-sm relative -mt-4 z-10">
                {match.matchPercentage}%
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <Link href={`/freelancers/${match.user.id}`} className="font-bold text-lg text-foreground hover:text-brand transition-colors block truncate">
                    {match.user.name}
                  </Link>
                  <p className="text-sm font-medium text-muted-foreground truncate">{match.user.headline}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-foreground">${match.user.hourlyRate}/hr</p>
                  </div>
                </div>
              </div>

              {match.user.averageRating !== undefined && (
                <RatingDisplay rating={match.user.averageRating} count={match.user.totalReviews || 0} className="mb-3" />
              )}

              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why this match?</p>
                <ul className="text-sm text-foreground space-y-1">
                  {match.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand shrink-0 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1.5">
                  {match.user.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {match.user.skills.length > 4 && (
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                      +{match.user.skills.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={`/freelancers/${match.user.id}`}>View Profile</Link>
                  </Button>
                  <Button size="sm" className="w-full sm:w-auto" asChild>
                    <Link href={`/messages?userId=${match.user.id}&projectId=${projectId}`}>Invite to Project</Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
