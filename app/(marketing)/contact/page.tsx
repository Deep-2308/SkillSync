"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedSection } from "@/components/animated-section";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const subjects = [
  "General Inquiry",
  "Technical Support",
  "Partnership Opportunity",
  "Billing Question",
  "Report a Bug",
  "Feature Request",
];

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setIsSuccess(true);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </AnimatedSection>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatedSection animation="slideInLeft">
              <div className="rounded-2xl border bg-card p-8">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                    </div>
                    <Button variant="outline" onClick={() => { setIsSuccess(false); form.reset(); }}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>Message</FormLabel>
                            <span className="text-xs text-zinc-400">{field.value.length}/2000</span>
                          </div>
                          <FormControl><Textarea placeholder="Tell us how we can help..." className="resize-none h-36" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Send Message
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection animation="slideInRight">
              <div className="rounded-2xl border bg-card p-8 space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                {[
                  { icon: Mail, label: "Email", value: "hello@skillsync.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Address", value: "123 Innovation Drive\nSan Francisco, CA 94102" },
                  { icon: Clock, label: "Office Hours", value: "Mon–Fri: 9am – 6pm PST" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl border bg-zinc-200 dark:bg-zinc-800 h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Map Placeholder</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
