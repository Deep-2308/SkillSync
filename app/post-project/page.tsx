import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function PostProjectPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFFBF0]">
        <Navigation />

        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-[#1A1A1A] uppercase tracking-tight mb-2">Step 1: Project Details</h1>
              <p className="text-[#4A4A4A] mb-6">
                Describe your project requirements. The more detail you provide, the better our AI can match you with the
                right talent.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-[#1A1A1A] bg-white p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-bold uppercase text-sm">Upload brief / files</span>
                </div>
                <div className="border-2 border-[#1A1A1A] border-dashed bg-white p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-[#666]">Drag & Drop project docs here</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button className="bg-[#FF7F50] hover:bg-[#E06F45] text-white border-2 border-[#1A1A1A] font-bold uppercase rounded-none px-8 py-6 h-auto">
                  Analyze with AI
                </Button>
                <span className="text-sm text-[#666] italic">Extracting requirements...</span>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slideUp" delay={100}>
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-[#1A1A1A] uppercase tracking-tight mb-2">
                Step 2: Input Project Info
              </h1>
              <p className="text-[#4A4A4A] mb-6">
                Adjust these fields to refine your project scope and get an estimated quote.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs tracking-wider">Project Duration (Days):</Label>
                  <Input
                    type="number"
                    defaultValue="20"
                    className="border-2 border-[#1A1A1A] rounded-none bg-white h-12 focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs tracking-wider">Expertise Level:</Label>
                  <Select defaultValue="mid">
                    <SelectTrigger className="border-2 border-[#1A1A1A] rounded-none bg-white h-12 focus-visible:ring-0">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                      <SelectItem value="mid">Mid-Level (3-7 years)</SelectItem>
                      <SelectItem value="senior">Senior (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-[#4A4A4A] mt-1">
                    *Not sure? Check our <span className="font-bold underline cursor-pointer">level comparison guide.</span>
                  </p>
                </div>
              </div>

              <div className="border-2 border-[#1A1A1A] p-1 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="bg-white p-6 border border-[#1A1A1A]">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="font-bold uppercase text-xl">Pricing Generated:</h2>
                    <Badge className="bg-[#FF7F50] text-white border-none rounded-none text-[10px] font-bold uppercase">
                      Estimate*
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="border border-[#FF7F50]/30 bg-[#FF7F50]/5 p-4">
                        <span className="text-[10px] font-bold uppercase text-[#FF7F50]">Base Project Cost</span>
                      </div>
                      <div className="border border-[#FF7F50]/30 bg-[#FF7F50]/5 p-4">
                        <span className="text-[10px] font-bold uppercase text-[#FF7F50]">Platform Fee (Escrow)</span>
                      </div>
                    </div>
                    <div className="border-4 border-[#FF7F50]/50 bg-[#FF7F50]/5 p-6 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-[#FF7F50] uppercase mb-1">Total Estimated Cost</span>
                      <span className="text-5xl font-bold text-[#FF7F50]">$0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slideUp" delay={200}>
            <div className="mb-12">
              <p className="text-center font-medium mb-6">
                Want to have this formally evaluated for AI Matching & Final Quote?
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label className="font-bold uppercase text-xs tracking-wider mb-2 block">Email Address</Label>
                  <Input
                    placeholder="Your Email"
                    className="border-2 border-[#1A1A1A] rounded-none bg-white h-12 focus-visible:ring-0"
                  />
                </div>
                <Button className="bg-[#FF7F50] hover:bg-[#E06F45] text-white border-2 border-[#1A1A1A] font-bold uppercase rounded-none px-12 h-12 self-end">
                  Post Project
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
