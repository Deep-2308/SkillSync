export interface Freelancer {
    id: string
    name: string
    role: string
    skills: string[]
    rating: number
    reviewCount: number
    location: string
    image: string
}

export const freelancers: Freelancer[] = [
    {
        id: "1",
        name: "Kabariya Deep",
        role: "Full-Stack Developer",
        skills: ["React", "Node.js", "AI"],
        rating: 4.9,
        reviewCount: 124,
        location: "Berlin, DE",
        image: "/professional-developer-portrait.png",
    },
    {
        id: "2",
        name: "Dangodara Pradip",
        role: "UI/UX Designer",
        skills: ["Figma", "Web Design", "Branding"],
        rating: 5.0,
        reviewCount: 89,
        location: "Toronto, CA",
        image: "/professional-designer-portrait.png",
    },
    {
        id: "3",
        name: "Gajera Akshit",
        role: "Content Strategist",
        skills: ["SEO", "Copywriting", "AI Tools"],
        rating: 4.8,
        reviewCount: 56,
        location: "London, UK",
        image: "/professional-man-strategist-portrait.jpg",
    },
    {
        id: "4",
        name: "Pipaliya Hardik",
        role: "Data Scientist",
        skills: ["Python", "ML", "DataViz"],
        rating: 4.9,
        reviewCount: 42,
        location: "Milan, IT",
        image: "/professional-man-scientist-portrait.jpg",
    },
]
