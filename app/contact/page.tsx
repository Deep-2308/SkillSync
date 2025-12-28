import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDF5F2]">
      <Navigation />

      <main className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left Side: Info */}
          <AnimatedSection animation="slideInLeft" delay={0}>
            <div>
            <h1 className="text-5xl md:text-7xl font-serif text-[#2D2D2D] mb-8 leading-tight">
              Get in <br />
              <span className="italic text-[#FF7F50]">Touch</span>
            </h1>

            <p className="text-xl text-[#4A4A4A] mb-12 max-w-md leading-relaxed">
              If you would like to discuss a project or just say hi, I'm always down to chat.
            </p>

            <div className="space-y-10">
              <div className="group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2 block">Email</span>
                <a
                  href="mailto:hello@skillsync.com"
                  className="text-2xl font-medium text-[#2D2D2D] hover:text-[#FF7F50] transition-colors flex items-center"
                >
                  hello@skillsync.com
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
              </div>

              <div className="group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2 block">Socials</span>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {["Linkedin", "Instagram", "Github", "Twitter"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-lg font-medium text-[#2D2D2D] hover:text-[#FF7F50] transition-colors"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </AnimatedSection>

          {/* Right Side: Form */}
          <AnimatedSection animation="slideInRight" delay={100}>
            <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#EEE]">
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-8">Send a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                    First Name
                  </Label>
                  <Input
                    id="first-name"
                    placeholder="Jane"
                    className="border-0 border-b border-[#DDD] rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-[#FF7F50] bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                    Last Name
                  </Label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    className="border-0 border-b border-[#DDD] rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-[#FF7F50] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="border-0 border-b border-[#DDD] rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-[#FF7F50] bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                  How can we help?
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project..."
                  className="border-0 border-b border-[#DDD] rounded-none px-0 min-h-[120px] focus-visible:ring-0 focus-visible:border-[#FF7F50] bg-transparent resize-none"
                />
              </div>

              <Button className="w-full bg-[#2D2D2D] hover:bg-[#1A1A1A] text-white font-bold py-6 h-auto text-lg uppercase tracking-wide rounded-none group">
                Submit Message
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  )
}
