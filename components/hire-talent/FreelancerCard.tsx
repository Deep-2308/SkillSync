"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HireDialog } from "./HireDialog";
import { cn } from "@/lib/utils";

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  location: string;
  rate: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  avatarUrl?: string;
  isOnline: boolean;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const maxSkillsToShow = 4;
  const extraSkillsCount = freelancer.skills.length - maxSkillsToShow;
  
  const initials = freelancer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="group flex flex-col justify-between p-6 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-card shadow-sm">
                <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
                <AvatarFallback className="bg-brand/10 text-brand">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span 
                className={cn(
                  "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
                  freelancer.isOnline ? "bg-green-500" : "bg-muted-foreground/40"
                )}
                title={freelancer.isOnline ? "Online now" : "Offline"}
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-foreground">${freelancer.rate}/hr</span>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                <span className="font-medium text-foreground mr-1">{freelancer.rating}</span>
                <span>({freelancer.reviewCount})</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1">{freelancer.name}</h3>
          <p className="text-muted-foreground mb-2 line-clamp-1">{freelancer.title}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <MapPin className="w-4 h-4 mr-1" />
            {freelancer.location}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {freelancer.skills.slice(0, maxSkillsToShow).map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-muted text-foreground/80 hover:bg-accent">
                {skill}
              </Badge>
            ))}
            {extraSkillsCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{extraSkillsCount} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-auto">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/freelancers/${freelancer.id}`}>View Profile</Link>
          </Button>
          <Button className="flex-1" onClick={() => setIsHireDialogOpen(true)}>
            Hire Now
          </Button>
        </div>
      </div>

      <HireDialog 
        freelancer={freelancer} 
        open={isHireDialogOpen} 
        onOpenChange={setIsHireDialogOpen} 
      />
    </>
  );
}

export function FreelancerCardSkeleton() {
  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl border bg-card animate-pulse">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex flex-col items-end gap-2">
            <div className="w-16 h-6 bg-muted rounded-md" />
            <div className="w-20 h-4 bg-muted rounded-md" />
          </div>
        </div>
        <div className="w-3/4 h-6 bg-muted rounded-md mb-3" />
        <div className="w-1/2 h-4 bg-muted rounded-md mb-4" />
        <div className="w-1/3 h-4 bg-muted rounded-md mb-6" />
        <div className="flex gap-2 mb-6">
          <div className="w-16 h-6 bg-muted rounded-full" />
          <div className="w-20 h-6 bg-muted rounded-full" />
          <div className="w-14 h-6 bg-muted rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 bg-muted rounded-md" />
        <div className="flex-1 h-10 bg-muted rounded-md" />
      </div>
    </div>
  );
}
