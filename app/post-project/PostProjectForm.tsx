"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Award,
  Users,
  Pencil,
  DollarSign,
  Info,
} from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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

const TIMELINES = [
  { value: "less_than_1_week", label: "Less than 1 week" },
  { value: "1_to_2_weeks", label: "1–2 weeks" },
  { value: "1_month", label: "About 1 month" },
  { value: "3_plus_months", label: "3+ months" },
];

const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const BUDGET_TIPS: Record<string, string> = {
  "Web Development": "Typical web dev projects range $500–$5,000 depending on complexity.",
  "UI/UX Design": "Design projects typically run $300–$3,000 for a full set of screens.",
  "Mobile Apps": "Mobile apps usually range $2,000–$15,000 for MVP builds.",
  "Data Science": "Data science projects typically cost $1,000–$8,000.",
  "Digital Marketing": "Marketing campaigns range $500–$5,000/month.",
  "Content Writing": "Content projects typically cost $100–$2,000.",
  "Video Editing": "Video editing projects range $200–$3,000.",
  "Translation": "Translation projects typically cost $100–$1,500.",
};

/* -------------------------------------------------------------------------- */
/*                                 Zod Schema                                 */
/* -------------------------------------------------------------------------- */

const projectSchema = z.object({
  // Step 1
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(30, "Description must be at least 30 characters").max(2000, "Description is too long"),
  skills: z.array(z.string()).min(1, "Add at least one skill").max(10),

  // Step 2
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]),
  timeline: z.string().min(1, "Timeline is required"),
  // Files are managed outside zod (File objects aren't serializable)

  // Step 3
  budgetType: z.enum(["fixed", "hourly"]),
  fixedMin: z.coerce.number().optional(),
  fixedMax: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  estimatedHours: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
  if (data.budgetType === "fixed") {
    if (!data.fixedMin || data.fixedMin < 5) {
      ctx.addIssue({ code: "custom", path: ["fixedMin"], message: "Minimum budget must be at least $5" });
    }
    if (!data.fixedMax || data.fixedMax < (data.fixedMin ?? 0)) {
      ctx.addIssue({ code: "custom", path: ["fixedMax"], message: "Maximum must be greater than minimum" });
    }
  }
  if (data.budgetType === "hourly") {
    if (!data.hourlyRate || data.hourlyRate < 5) {
      ctx.addIssue({ code: "custom", path: ["hourlyRate"], message: "Hourly rate must be at least $5" });
    }
    if (!data.estimatedHours || data.estimatedHours < 1) {
      ctx.addIssue({ code: "custom", path: ["estimatedHours"], message: "Estimated hours must be at least 1" });
    }
  }
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const STEP_FIELDS: (keyof ProjectFormValues)[][] = [
  ["title", "category", "description", "skills"],
  ["experienceLevel", "timeline"],
  ["budgetType", "fixedMin", "fixedMax", "hourlyRate", "estimatedHours"],
  [], // Review step has no fields to validate individually
];

const STEPS = ["Basics", "Requirements", "Budget", "Review"];

/* -------------------------------------------------------------------------- */
/*                                   Files                                    */
/* -------------------------------------------------------------------------- */

interface UploadedFile {
  file: File;
  preview: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function PostProjectForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      skills: [],
      experienceLevel: "intermediate",
      timeline: "",
      budgetType: "fixed",
      fixedMin: 100,
      fixedMax: 1000,
      hourlyRate: 25,
      estimatedHours: 40,
    },
    mode: "onTouched",
  });

  const watchCategory = form.watch("category");
  const watchBudgetType = form.watch("budgetType");
  const watchFixedMin = form.watch("fixedMin");
  const watchFixedMax = form.watch("fixedMax");
  const watchHourlyRate = form.watch("hourlyRate");
  const watchEstimatedHours = form.watch("estimatedHours");

  const budgetEstimate = useMemo(() => {
    if (watchBudgetType === "fixed") {
      return `$${watchFixedMin ?? 0} – $${watchFixedMax ?? 0}`;
    }
    const rate = watchHourlyRate ?? 0;
    const hours = watchEstimatedHours ?? 0;
    return `$${rate}/hr × ${hours}h = $${rate * hours}`;
  }, [watchBudgetType, watchFixedMin, watchFixedMax, watchHourlyRate, watchEstimatedHours]);

  /* ---- Dropzone ---- */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES - files.length,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        r.errors.forEach((e) => toast.error(e.message));
      });
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  /* ---- Step navigation ---- */
  const nextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    // trigger() accepts a field-name array; STEP_FIELDS is already keyed to the form values.
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const goToStep = (step: number) => setCurrentStep(step);

  /* ---- Submit ---- */
  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Project data:", data, "Files:", files);
      toast.success("Project posted successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to post project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, i) => (
            <button
              key={step}
              type="button"
              onClick={() => i < currentStep && goToStep(i)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                i < currentStep && "text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline",
                i === currentStep && "text-zinc-900 dark:text-zinc-50",
                i > currentStep && "text-zinc-400 dark:text-zinc-600"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all",
                  i < currentStep && "bg-indigo-600 border-indigo-600 text-white",
                  i === currentStep && "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400",
                  i > currentStep && "border-zinc-300 text-zinc-400 dark:border-zinc-700"
                )}
              >
                {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ========== STEP 1: BASICS ========== */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Project Basics</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Tell us about your project</p>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Build a landing page for my SaaS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description</FormLabel>
                      <span className="text-xs text-zinc-400">{field.value.length}/2000</span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project in detail: goals, deliverables, tech stack..."
                        className="resize-none h-36"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="skills"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Skills Required</FormLabel>
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
            </div>
          )}

          {/* ========== STEP 2: REQUIREMENTS ========== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Requirements</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Define the expertise and timeline</p>
              </div>

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Experience Level</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { value: "beginner", icon: Users, label: "Beginner", desc: "New to the field" },
                          { value: "intermediate", icon: Award, label: "Intermediate", desc: "Some experience" },
                          { value: "expert", icon: Briefcase, label: "Expert", desc: "Highly skilled" },
                        ].map((level) => {
                          const Icon = level.icon;
                          const isSelected = field.value === level.value;
                          return (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => field.onChange(level.value)}
                              className={cn(
                                "flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                                isSelected
                                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-500"
                                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                              )}
                            >
                              <Icon className={cn("w-8 h-8 mb-3", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
                              <span className={cn("font-semibold text-sm", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-50")}>{level.label}</span>
                              <span className="text-xs text-zinc-500 mt-1">{level.desc}</span>
                            </button>
                          );
                        })}
                      </div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMELINES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Attachments (optional)</Label>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    {isDragActive ? "Drop files here..." : "Drag & drop files, or click to browse"}
                  </p>
                  <p className="text-xs text-zinc-400">PDF, DOC, DOCX, PNG, JPG — max 10MB each, up to 5 files</p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {files.map((f, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        {f.preview ? (
                          <img src={f.preview} alt={f.file.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <FileText className="w-10 h-10 text-zinc-400 p-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-50">{f.file.name}</p>
                          <p className="text-xs text-zinc-500">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== STEP 3: BUDGET ========== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Budget</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Set your project budget</p>
              </div>

              {/* Budget type toggle */}
              <FormField
                control={form.control}
                name="budgetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Type</FormLabel>
                    <div className="flex items-center gap-4 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit">
                      <button
                        type="button"
                        onClick={() => field.onChange("fixed")}
                        className={cn(
                          "px-4 py-2 rounded-md text-sm font-medium transition-all",
                          field.value === "fixed"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        Fixed Price
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("hourly")}
                        className={cn(
                          "px-4 py-2 rounded-md text-sm font-medium transition-all",
                          field.value === "hourly"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        Hourly Rate
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              {/* Conditional budget inputs */}
              {watchBudgetType === "fixed" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fixedMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min={5} placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fixedMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min={5} placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-zinc-500 mb-2 block">Budget Range</Label>
                    <Slider
                      value={[watchFixedMin ?? 100, watchFixedMax ?? 1000]}
                      onValueChange={([min, max]) => {
                        form.setValue("fixedMin", min);
                        form.setValue("fixedMax", max);
                      }}
                      min={5}
                      max={10000}
                      step={25}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min={5} placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="40" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Dynamic estimate */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Estimated Budget</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{budgetEstimate}</p>
                </div>
              </div>

              {/* Budget tip */}
              {watchCategory && BUDGET_TIPS[watchCategory] && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Budget Recommendation</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{BUDGET_TIPS[watchCategory]}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== STEP 4: REVIEW ========== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Review & Submit</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Double-check everything before posting</p>
              </div>

              {/* Review cards */}
              {[
                {
                  step: 0,
                  title: "Project Basics",
                  items: [
                    { label: "Title", value: form.getValues("title") },
                    { label: "Category", value: form.getValues("category") },
                    { label: "Description", value: form.getValues("description") },
                    { label: "Skills", value: form.getValues("skills").join(", ") },
                  ],
                },
                {
                  step: 1,
                  title: "Requirements",
                  items: [
                    { label: "Experience", value: form.getValues("experienceLevel") },
                    { label: "Timeline", value: TIMELINES.find((t) => t.value === form.getValues("timeline"))?.label || "" },
                    { label: "Attachments", value: files.length > 0 ? `${files.length} file(s)` : "None" },
                  ],
                },
                {
                  step: 2,
                  title: "Budget",
                  items: [
                    { label: "Type", value: form.getValues("budgetType") === "fixed" ? "Fixed Price" : "Hourly Rate" },
                    { label: "Estimate", value: budgetEstimate },
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{section.title}</h3>
                    <button
                      type="button"
                      onClick={() => goToStep(section.step)}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:w-32 flex-shrink-0">{item.label}</span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-50 break-words">{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== Navigation Buttons ========== */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Post Project
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
