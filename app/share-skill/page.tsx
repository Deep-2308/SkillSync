"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export default function ShareSkillPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        experience: "",
        rate: "",
        description: "",
    })

    // Redirect non-experts
    if (user && user.role !== "expert") {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-background">
                    <Navigation />
                    <div className="container mx-auto py-20 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-6">
                            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                            <h1 className="text-2xl font-bold">Access Restricted</h1>
                            <p className="text-muted-foreground">
                                Only Experts can share skills. You are currently logged in as a Learner.
                            </p>
                            <Button onClick={() => router.push("/hire-talent")}>
                                Browse Talent
                            </Button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </ProtectedRoute>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/share-skill", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit skill")
            }

            toast({
                title: "Skill Shared Successfully!",
                description: "Your service is now visible to learners.",
            })

            // In a real app, redirect to profile or listing
            router.push("/hire-talent")
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8F9FA]">
                <Navigation />

                <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <AnimatedSection animation="slideUp" delay={0}>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-foreground">Share Your Expertise</h1>
                            <p className="mt-2 text-muted-foreground">
                                Create a listing to offer your skills to the SkillSync community.
                            </p>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection animation="fadeIn" delay={100}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Skill Details</CardTitle>
                                <CardDescription>
                                    Provide clear and accurate information about what you offer.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Skill Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. Senior React Developer, AI Consultant"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="development">Development</SelectItem>
                                                    <SelectItem value="design">Design</SelectItem>
                                                    <SelectItem value="marketing">Marketing</SelectItem>
                                                    <SelectItem value="ai">AI / Machine Learning</SelectItem>
                                                    <SelectItem value="business">Business</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rate">Hourly Rate ($)</Label>
                                            <Input
                                                id="rate"
                                                type="number"
                                                placeholder="50"
                                                value={formData.rate}
                                                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Years of Experience</Label>
                                        <Select
                                            value={formData.experience}
                                            onValueChange={(val) => setFormData({ ...formData, experience: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                                                <SelectItem value="mid">Mid-Level (3-7 years)</SelectItem>
                                                <SelectItem value="senior">Senior (7+ years)</SelectItem>
                                                <SelectItem value="expert">Expert (10+ years)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe your service, what you deliver, and your process..."
                                            className="min-h-[150px]"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Publishing..." : "Publish Skill"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </AnimatedSection>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
