export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  /** 1–5 star rating. */
  rating: number;
  quote: string;
  /** Avatar image URL (host must be allowlisted in next.config.mjs). */
  avatar: string;
}

/** Demo testimonials for the home page social-proof carousel. */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Amara Okafor",
    role: "Product Designer",
    company: "Northwind",
    rating: 5,
    quote:
      "I found a senior React freelancer within a day and shipped my portfolio redesign in a week. SkillSync made the whole process effortless.",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "t2",
    name: "Diego Martins",
    role: "Founder",
    company: "Loopware",
    rating: 5,
    quote:
      "We hired three vetted engineers for a sprint. The matching was scary-accurate — every candidate was exactly what we needed.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "t3",
    name: "Priya Nair",
    role: "Data Scientist",
    company: "Helix Labs",
    rating: 5,
    quote:
      "As a freelancer I love how transparent contracts and payments are. My calendar fills up and I never chase invoices.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "t4",
    name: "Marcus Bell",
    role: "Marketing Lead",
    company: "Brightside",
    rating: 4,
    quote:
      "The real-time chat and clear reviews took all the guesswork out of hiring freelancers. Onboarding took minutes.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "t5",
    name: "Sofia Alvarez",
    role: "Frontend Engineer",
    company: "Cadence",
    rating: 5,
    quote:
      "From first message to paid session in under an hour. The polish of this platform makes it feel genuinely premium.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
  },
];
