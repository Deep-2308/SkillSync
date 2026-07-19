import { redirect } from "next/navigation";
// import { auth } from "@/auth"; // In a real app we'd import the auth method
import { HireTalentClient } from "./HireTalentClient";
import { Freelancer } from "@/components/hire-talent/FreelancerCard";

// Mock data generator for freelancers
const generateMockFreelancers = (): Freelancer[] => {
  const titles = [
    "Senior Full Stack Developer", "UX/UI Designer", "Data Scientist", 
    "Mobile App Developer", "Digital Marketing Specialist", "SEO Expert",
    "Content Writer", "React Developer", "Python Engineer", "Product Designer"
  ];
  
  const skillsList = [
    "React", "Node.js", "TypeScript", "Python", "Figma", "UI Design",
    "SEO", "Marketing", "Copywriting", "Swift", "Kotlin", "Machine Learning",
    "Data Analysis", "SQL", "MongoDB", "AWS", "Docker"
  ];
  
  const locations = ["New York, USA", "London, UK", "Remote", "Berlin, Germany", "Toronto, Canada", "Sydney, Australia"];

  const freelancers: Freelancer[] = [];
  
  for (let i = 1; i <= 48; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)] ?? "Freelancer";
    // Assign 3 to 6 random skills
    const numSkills = Math.floor(Math.random() * 4) + 3;
    const shuffledSkills = [...skillsList].sort(() => 0.5 - Math.random());
    const skills = shuffledSkills.slice(0, numSkills);
    
    freelancers.push({
      id: `f-${i}`,
      name: `Freelancer ${i}`,
      title,
      location: locations[Math.floor(Math.random() * locations.length)] ?? "Remote",
      rate: Math.floor(Math.random() * 150) + 15, // $15 to $165
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
      reviewCount: Math.floor(Math.random() * 200) + 5,
      skills,
      isOnline: Math.random() > 0.5,
      // Uses UI Avatars for mock images
      avatarUrl: `https://ui-avatars.com/api/?name=Freelancer+${i}&background=random`,
    });
  }
  
  return freelancers;
};

export default async function HireTalentPage() {
  // Authentication check (Mocked for now since NextAuth is just being set up)
  // const session = await auth();
  // if (!session) {
  //   redirect("/login");
  // }
  
  // Note: For testing the UI without full auth working yet, I am commenting out the redirect.
  // Uncomment the above in a real environment to protect this route.

  const freelancers = generateMockFreelancers();

  return (
    <main className="min-h-screen bg-muted/40 pt-20">
      <HireTalentClient initialFreelancers={freelancers} />
    </main>
  );
}
