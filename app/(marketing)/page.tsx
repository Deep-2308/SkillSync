import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { CategoriesStrip } from "@/components/home/categories-strip";
import { FinalCta } from "@/components/home/final-cta";

/**
 * SkillSync home page.
 *
 * Composed of self-contained section components under components/home/. Most
 * are Server Components; only the interactive ones (hero's demo dialog,
 * testimonials carousel) opt into the client. Section order matches the brief.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CategoriesStrip />
      <FinalCta />
    </>
  );
}
