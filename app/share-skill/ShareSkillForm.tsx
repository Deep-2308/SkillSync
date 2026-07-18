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
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  "Web Development",
  "UI/UX Design",
  "Mobile Apps",
  "Data Science",
  "Digital Marketing",
  "Content Writing",
  "Video Editing",
  "Translation",
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "Web Development": ["Frontend", "Backend", "Full Stack", "CMS", "E-commerce"],
  "UI/UX Design": ["Web Design", "App Design", "Brand Design", "Prototyping"],
  "Mobile Apps": ["iOS", "Android", "Cross-platform", "React Native", "Flutter"],
  "Data Science": ["Machine Learning", "Data Analysis", "Visualization", "NLP"],
  "Digital Marketing": ["SEO", "PPC", "Social Media", "Email Marketing"],
  "Content Writing": ["Blog Posts", "Copywriting", "Technical Writing", "Ghostwriting"],
  "Video Editing": ["YouTube", "Social Media", "Corporate", "Animation"],
  "Translation": ["Documents", "Localization", "Subtitles", "Transcription"],
};

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
];

/* -------------------------------------------------------------------------- */
/*                                 Zod Schema                                 */
/* -------------------------------------------------------------------------- */

const shareSkillSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  yearsOfExperience: z.coerce.number().min(0, "Must be 0 or more").max(50, "Must be 50 or less"),
  hourlyRate: z.coerce.number().min(1, "Rate must be at least 1"),
  currency: z.string().default("USD"),
  description: z.string().min(20, "Description must be at least 20 characters").max(3000),
  portfolioUrls: z.array(z.object({
    url: z.string().url("Must be a valid URL"),
  })).optional(),
  isAvailable: z.boolean().default(true),
  tags: z.array(z.string()).min(1, "Add at least one tag").max(10),
});

type ShareSkillFormValues = z.infer<typeof shareSkillSchema>;

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function ShareSkillForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  const form = useForm<ShareSkillFormValues>({
    resolver: zodResolver(shareSkillSchema),
    defaultValues: {
      title: "",
      category: "",
      subCategory: "",
      experienceLevel: "",
      yearsOfExperience: 0,
      hourlyRate: 25,
      currency: "USD",
      description: "",
      portfolioUrls: [],
      isAvailable: true,
      tags: [],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "portfolioUrls",
  });

  const watchCategory = form.watch("category");
  const watchDescription = form.watch("description");
  const subCategories = watchCategory ? SUB_CATEGORIES[watchCategory] || [] : [];

  const onSubmit = async (data: ShareSkillFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Skill data:", data);
      toast.success("Skill shared successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to share skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Share Your Skill</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Let the community know what you can offer. Fill out the details below and start getting hired.
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
                <FormLabel>Skill Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Full Stack Web Development with React & Node" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category + Sub-category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("subCategory", "");
                    }}
                    value={field.value}
                  >
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
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={subCategories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subCategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Experience + Years */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
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

            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rate + Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((cur) => (
                        <SelectItem key={cur.value} value={cur.value}>{cur.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description with markdown preview */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Description</FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{field.value.length}/3000</span>
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
                      placeholder="Describe your skill, what you offer, your methodology, and what clients can expect..."
                      className="resize-none h-48"
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Portfolio URLs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Portfolio URLs (optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ url: "" })}
                disabled={fields.length >= 5}
                className="h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add URL
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="text-sm text-zinc-400">No portfolio URLs added yet.</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`portfolioUrls.${index}.url`}
                    render={({ field: urlField }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input placeholder="https://your-portfolio.com" className="pl-9" {...urlField} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-10 w-10 flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-zinc-400" />
                </Button>
              </div>
            ))}
          </div>

          {/* Availability */}
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Availability</FormLabel>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {field.value ? "You are currently accepting new clients" : "You are not accepting new clients"}
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Skills Tags */}
          <Controller
            control={form.control}
            name="tags"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Skills Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type a skill and press Enter..."
                    maxTags={10}
                  />
                </FormControl>
                {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Share Skill
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
