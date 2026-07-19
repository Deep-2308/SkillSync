"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/forms/TagInput";
import { categoryNames } from "@/data/categories";

const CATEGORIES = categoryNames;

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const gigSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(120),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Experience level is required"),
  hourlyRate: z.coerce.number().min(0, "Rate cannot be negative").max(10000),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  portfolioUrls: z.array(z.string().url("Must be a valid URL")).max(5).optional(),
  experience: z.string().max(200).optional(),
  deliveryTime: z.string().min(1, "Delivery time is required").max(50),
  revisions: z.coerce.number().min(0, "Must be 0 or more").max(50),
  tags: z.array(z.string()).max(10),
});

type GigFormValues = z.infer<typeof gigSchema>;

export function GigForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: "",
      category: "",
      level: "intermediate",
      hourlyRate: 25,
      description: "",
      portfolioUrls: [],
      experience: "",
      deliveryTime: "3 days",
      revisions: 2,
      tags: [],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore - react-hook-form field array string mapping quirk
    name: "portfolioUrls",
  });

  const onSubmit = async (data: GigFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create Gig");
      }

      toast.success("Gig published successfully!");
      router.push("/freelancer/gigs");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish gig. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create a New Gig</h1>
        <p className="text-muted-foreground mt-2">
          Offer your services to clients. Be descriptive to attract the right projects.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gig Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., I will build a responsive Next.js application" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3 Days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revisions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Included Revisions</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Gig Description</FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{field.value.length}/2000</span>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showMarkdownPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showMarkdownPreview ? "Edit" : "Preview"}
                    </button>
                  </div>
                </div>
                <FormControl>
                  {showMarkdownPreview ? (
                    <div className="min-h-[200px] rounded-md border border-input bg-background p-4 text-sm prose dark:prose-invert max-w-none whitespace-pre-wrap">
                      {field.value || <span className="text-muted-foreground italic">Nothing to preview</span>}
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Describe what you will do, your process, and what the client will receive..."
                      className="resize-none h-48"
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <Controller
            control={form.control}
            name="tags"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type a tag and press Enter..."
                    maxTags={10}
                  />
                </FormControl>
                {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end pt-6 border-t border-border">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publish Gig
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
