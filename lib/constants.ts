// Mock data for static frontend

export interface Freelancer {
  id: string
  name: string
  role: string
  rating: number
  review_count: number
  location: string
  image_url: string
  verified: boolean
  skills: string[]
}

export const MOCK_FREELANCERS: Freelancer[] = [
  {
    id: "1",
    name: "Kabariya Deep",
    role: "Full-Stack Developer",
    rating: 4.9,
    review_count: 124,
    location: "Berlin, DE",
    image_url: "/professional-developer-portrait.png",
    verified: true,
    skills: ["React", "Node.js", "AI"],
  },
  {
    id: "2",
    name: "Dangodara Pradip",
    role: "UI/UX Designer",
    rating: 5.0,
    review_count: 89,
    location: "Toronto, CA",
    image_url: "/professional-designer-portrait.png",
    verified: true,
    skills: ["Figma", "Web Design", "Branding"],
  },
  {
    id: "3",
    name: "Gajera Akshit",
    role: "Content Strategist",
    rating: 4.8,
    review_count: 56,
    location: "London, UK",
    image_url: "/professional-man-strategist-portrait.jpg",
    verified: true,
    skills: ["SEO", "Copywriting", "AI Tools"],
  },
  {
    id: "4",
    name: "Pipaliya Hardik",
    role: "Data Scientist",
    rating: 4.9,
    review_count: 42,
    location: "Milan, IT",
    image_url: "/professional-man-scientist-portrait.jpg",
    verified: true,
    skills: ["Python", "ML", "DataViz"],
  },
]

