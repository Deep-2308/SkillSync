"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Freelancer } from "./FreelancerCard";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const proposalSchema = z.object({
  budget: z.coerce.number().min(5, "Budget must be at least $5"),
  timeline: z.string().min(1, "Timeline is required"),
  brief: z.string().min(20, "Please provide a bit more detail (min 20 chars)"),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface HireDialogProps {
  freelancer: Freelancer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HireDialog({ freelancer, open, onOpenChange }: HireDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      budget: 0,
      timeline: "",
      brief: "",
    },
  });

  const initials = freelancer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const onSubmit = async (data: ProposalFormValues) => {
    setIsLoading(true);
    try {
      // Mocking the POST /api/proposals request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Proposal data:", {
        freelancerId: freelancer.id,
        ...data,
      });

      toast.success("Proposal sent successfully!");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to send proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send a Proposal</DialogTitle>
          <DialogDescription>
            Detail your project needs to see if you&apos;re a good fit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
          <Avatar className="w-12 h-12">
            <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{freelancer.name}</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{freelancer.title}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">${freelancer.rate}/hr</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Budget ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="less_than_1_month">Less than 1 month</SelectItem>
                        <SelectItem value="1_to_3_months">1 to 3 months</SelectItem>
                        <SelectItem value="3_to_6_months">3 to 6 months</SelectItem>
                        <SelectItem value="more_than_6_months">More than 6 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="brief"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Brief</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project, deliverables, and any specific requirements..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Proposal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
