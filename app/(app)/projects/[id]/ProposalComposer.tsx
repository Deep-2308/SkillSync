"use client";

import { useState } from "react";
import { Send, AlertCircle, CheckCircle2, Loader2, Info, DollarSign, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIStatus } from "@/hooks/use-ai-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const formSchema = z.object({
  message: z.string().min(10, "Cover letter must be at least 10 characters.").max(3000),
  proposedRate: z.number({ coerce: true }).min(1, "Rate must be at least $1."),
  timeline: z.string().min(1, "Timeline is required.").max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface ProposalComposerProps {
  projectId: string;
  budgetType: "fixed" | "hourly";
  budgetMin: number;
  budgetMax: number;
  hourlyRate: number;
  freelancerHourlyRate: number; // to prefill if hourly
  onSuccess?: () => void;
}

export function ProposalComposer({
  projectId,
  budgetType,
  budgetMin,
  budgetMax,
  hourlyRate,
  freelancerHourlyRate,
  onSuccess,
}: ProposalComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const aiStatus = useAIStatus();
  const [aiRateBand, setAiRateBand] = useState<{min: number, max: number, rationale: string} | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      proposedRate: budgetType === "hourly" ? freelancerHourlyRate : undefined,
      timeline: "",
    },
  });

  // Fetch AI rate band on mount
  import("react").then(({ useEffect }) => {
    useEffect(() => {
      if (aiStatus.enabled && !aiRateBand) {
        const projectBudget = budgetType === "fixed" ? `$${budgetMin} - $${budgetMax}` : `$${hourlyRate}/hr`;
        fetch("/api/ai/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contextType: "proposal",
            projectBudget,
            freelancerRate: freelancerHourlyRate,
          }),
        })
        .then(res => res.json())
        .then(data => {
           if (data.data) setAiRateBand(data.data);
        })
        .catch(console.error);
      }
    }, [aiStatus.enabled, aiRateBand, budgetType, budgetMin, budgetMax, hourlyRate, freelancerHourlyRate]);
  });

  const handleDraftWithAI = async () => {
    setIsDrafting(true);
    setTalkingPoints([]);
    try {
      // 1. Fetch full project details and user profile
      const [projectRes, profileRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch("/api/users/me")
      ]);
      const projectData = await projectRes.json();
      const profileData = await profileRes.json();

      if (!projectRes.ok) throw new Error("Failed to fetch project details");
      if (!profileRes.ok) throw new Error("Failed to fetch user profile");

      // 2. Call AI
      const res = await fetch("/api/ai/compose/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectContext: {
            title: projectData.data.title,
            description: projectData.data.description,
            skills: projectData.data.skills,
            budgetType: projectData.data.budgetType,
            budgetMin: projectData.data.budgetMin,
            budgetMax: projectData.data.budgetMax,
            hourlyRate: projectData.data.hourlyRate,
          },
          freelancerContext: {
            name: profileData.data.name,
            headline: profileData.data.headline,
            bio: profileData.data.bio,
            skills: profileData.data.skills || [],
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Append rather than silently replacing
      const currentVal = form.getValues("message");
      const newVal = currentVal ? currentVal + "\n\n" + data.data.coverLetter : data.data.coverLetter;
      form.setValue("message", newVal, { shouldValidate: true });
      
      if (data.data.talkingPoints) {
        setTalkingPoints(data.data.talkingPoints);
      }
      
      toast.success("Draft generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...values,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit proposal.");
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Proposal Submitted!</h3>
        <p className="text-emerald-700">
          Your proposal has been successfully sent to the client. You will be notified if they accept it or send you a message.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border p-6 sm:p-8">
      <h2 className="text-xl font-bold text-foreground mb-2">Submit a Proposal</h2>
      
      <div className="flex items-start gap-3 p-4 mb-6 bg-muted rounded-xl border">
        <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Client's Budget</p>
          <p>
            {budgetType === "fixed" 
              ? `The client has set a fixed budget of $${budgetMin} - $${budgetMax} for this project.` 
              : `The client has indicated an hourly rate of $${hourlyRate}/hr.`}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="proposedRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Proposed {budgetType === "fixed" ? "Bid" : "Hourly Rate"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {aiRateBand && aiStatus.enabled && (
              <div className="text-sm flex items-center gap-2 mt-2 p-3 bg-brand/5 border border-brand/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-brand shrink-0" />
                <div>
                  <span className="font-medium text-brand">Suggested Range: ${aiRateBand.min} - ${aiRateBand.max}.</span>
                  <span className="text-muted-foreground ml-1">{aiRateBand.rationale}</span>
                </div>
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Timeline</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2 weeks, 5 days..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="mb-0">Cover Letter</FormLabel>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs bg-brand/10 text-brand hover:bg-brand/20 border-0"
                            onClick={handleDraftWithAI}
                            disabled={!aiStatus.enabled || isDrafting}
                          >
                            {isDrafting ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                            Draft with AI
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
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Why are you the best fit for this project?" 
                    className="min-h-[150px] resize-y" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                {talkingPoints.length > 0 && (
                  <div className="mt-3 p-4 bg-muted border rounded-xl space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-brand" />
                      Interview Talking Points
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {talkingPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                )}
              </FormItem>
            )}
          />

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
