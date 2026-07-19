"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Clock, DollarSign, Star, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/hire-talent/FilterSidebar";
import { categoryNames } from "@/data/categories";
import { cn } from "@/lib/utils";

const CATEGORIES = categoryNames;

type Project = {
  id: string;
  title: string;
  description: string;
  budgetType: "fixed" | "hourly";
  budgetMin: number;
  budgetMax: number;
  hourlyRate: number;
  estimatedHours: number;
  skills: string[];
  experienceLevel: string;
  createdAt: string;
  proposalCount: number;
  client: { name: string; rating: number };
};

interface FindWorkClientProps {
  projects: Project[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function FindWorkClient({ projects, total, currentPage, totalPages }: FindWorkClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const initialSearch = searchParams.get("q") || "";
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const initialSort = searchParams.get("sort") || "newest";
  const initialBudgetType = searchParams.get("budgetType") || "Any";
  const initialMinBudget = searchParams.get("minBudget") || "0";
  const initialMaxBudget = searchParams.get("maxBudget") || "0";
  const initialExperience = searchParams.get("experienceLevel") || "Any";

  // Local state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [budgetType, setBudgetType] = useState(initialBudgetType);
  // Reusing FilterSidebar's hourlyRate array for budget range [min, max]
  const [budgetRange, setBudgetRange] = useState<number[]>([
    parseInt(initialMinBudget, 10), 
    parseInt(initialMaxBudget, 10) > 0 ? parseInt(initialMaxBudget, 10) : 5000
  ]);
  const [experienceLevel, setExperienceLevel] = useState(initialExperience);
  const [sortBy, setSortBy] = useState(initialSort);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    if (!isClient) return;
    
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (budgetType !== "Any") params.set("budgetType", budgetType);
    if (experienceLevel !== "Any") params.set("experienceLevel", experienceLevel);
    if (budgetRange[0] !== undefined && budgetRange[0] > 0) params.set("minBudget", budgetRange[0].toString());
    if (budgetRange[1] !== undefined && budgetRange[1] > 0 && budgetRange[1] < 10000) params.set("maxBudget", budgetRange[1].toString()); // Assuming 10000 is max range slider
    
    if (sortBy !== "newest") params.set("sort", sortBy);
    
    // Always reset to page 1 on filter change, handled implicitly if we don't set page. 
    // We only set page if navigating pages.
    // Wait, the user might click next page. 
    // This effect runs when filters change. If filters change, we shouldn't append `page`.
    
    router.replace(`/freelancer/find-work?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedCategories, budgetType, experienceLevel, budgetRange, sortBy, router, isClient]);

  useEffect(() => {
    // Only update if something changed from what is in searchParams
    updateUrlParams();
  }, [updateUrlParams]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setBudgetType("Any");
    setExperienceLevel("Any");
    setBudgetRange([0, 10000]);
    setSearchQuery("");
    setSortBy("newest");
    router.push("/freelancer/find-work");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/freelancer/find-work?${params.toString()}`);
  };

  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Find Work</h1>
        <p className="text-muted-foreground">
          Showing {projects.length} of {total} open projects
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar
              categories={CATEGORIES}
              selectedCategories={selectedCategories}
              onCategoryChange={toggleCategory}
              experienceLevel={experienceLevel}
              onExperienceChange={setExperienceLevel}
              // We reuse the hourlyRate prop to represent the budget range filter for projects
              hourlyRate={budgetRange}
              onHourlyRateChange={setBudgetRange}
              // We don't have minRating/availableNow on projects, but we can pass dummy or extend FilterSidebar
              minRating={"0"}
              onMinRatingChange={() => {}}
              availableNow={false}
              onAvailableNowChange={() => {}}
              onClearAll={clearAllFilters}
            />
            {/* Adding Budget Type Filter inside sidebar area or above it */}
            <div className="mt-6 border-t pt-6">
               <h3 className="font-semibold mb-4 text-foreground">Budget Type</h3>
               <div className="space-y-2">
                 {["Any", "Fixed", "Hourly"].map((type) => (
                   <label key={type} className="flex items-center gap-2 cursor-pointer group">
                     <div className="relative flex items-center justify-center w-4 h-4 rounded border border-border group-hover:border-brand transition-colors">
                       {budgetType.toLowerCase() === type.toLowerCase() && (
                         <div className="w-2 h-2 rounded-sm bg-brand" />
                       )}
                     </div>
                     <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                       {type}
                     </span>
                     <input
                       type="radio"
                       name="budgetType"
                       value={type}
                       checked={budgetType.toLowerCase() === type.toLowerCase()}
                       onChange={() => setBudgetType(type)}
                       className="hidden"
                     />
                   </label>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search projects by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base w-full bg-card"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Sheet */}
              <div className="lg:hidden w-full sm:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full h-12">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar
                      categories={CATEGORIES}
                      selectedCategories={selectedCategories}
                      onCategoryChange={toggleCategory}
                      experienceLevel={experienceLevel}
                      onExperienceChange={setExperienceLevel}
                      hourlyRate={budgetRange}
                      onHourlyRateChange={setBudgetRange}
                      minRating={"0"}
                      onMinRatingChange={() => {}}
                      availableNow={false}
                      onAvailableNowChange={() => {}}
                      onClearAll={clearAllFilters}
                    />
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold mb-4 text-foreground">Budget Type</h3>
                      <div className="space-y-2">
                        {["Any", "Fixed", "Hourly"].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center w-4 h-4 rounded border border-border group-hover:border-brand transition-colors">
                              {budgetType.toLowerCase() === type.toLowerCase() && (
                                <div className="w-2 h-2 rounded-sm bg-brand" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {type}
                            </span>
                            <input
                              type="radio"
                              name="budgetTypeMobile"
                              value={type}
                              checked={budgetType.toLowerCase() === type.toLowerCase()}
                              onChange={() => setBudgetType(type)}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget">Highest Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {projects.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/30">
              <h3 className="text-xl font-bold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">No matches, try adjusting your filters or search query.</p>
              <Button onClick={clearAllFilters} variant="outline">Clear all filters</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-card rounded-2xl border p-6 hover:shadow-md transition-shadow group">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand transition-colors">
                          {project.title}
                        </h2>
                      </Link>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {project.budgetType === "fixed" 
                            ? `Fixed: $${project.budgetMin} - $${project.budgetMax}` 
                            : `Hourly: $${project.hourlyRate}/hr`}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase className="w-3.5 h-3.5" />
                          {project.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
                        {project.skills.map((skill) => (
                          <span key={skill} className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium text-foreground/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:w-48 lg:border-l lg:pl-6 flex flex-col gap-4 justify-center">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground mb-1">Client Rating</p>
                        <div className="flex items-center justify-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold text-sm text-foreground">{project.client.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground mb-1">Proposals</p>
                        <p className="text-sm text-muted-foreground">{project.proposalCount}</p>
                      </div>

                      <Button className="w-full mt-2" asChild>
                         <Link href={`/projects/${project.id}`}>View Project</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            href="#" 
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
