"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
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
import { FreelancerCard, FreelancerCardSkeleton } from "@/components/hire-talent/FreelancerCard";
import { Freelancer } from "@/components/hire-talent/FreelancerCard";
import { categoryNames } from "@/data/categories";

const CATEGORIES = categoryNames;

interface HireTalentClientProps {
  freelancers: Freelancer[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function HireTalentClient({ freelancers, total, currentPage, totalPages }: HireTalentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const initialSearch = searchParams.get("search") || "";
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const initialSort = searchParams.get("sort") || "best_match";
  const initialMinRate = searchParams.get("minRate") || "5";
  const initialMaxRate = searchParams.get("maxRate") || "200";
  const initialMinRating = searchParams.get("rating") || "0";
  const initialAvailableNow = searchParams.get("available") === "true";

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [hourlyRate, setHourlyRate] = useState<number[]>([
    parseInt(initialMinRate, 10), 
    parseInt(initialMaxRate, 10)
  ]);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [availableNow, setAvailableNow] = useState(initialAvailableNow);
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
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (hourlyRate[0] !== undefined && hourlyRate[0] > 5) params.set("minRate", hourlyRate[0].toString());
    if (hourlyRate[1] !== undefined && hourlyRate[1] < 200) params.set("maxRate", hourlyRate[1].toString());
    if (minRating !== "0") params.set("rating", minRating);
    if (availableNow) params.set("available", "true");
    if (sortBy !== "best_match") params.set("sort", sortBy);

    router.replace(`/client/find-freelancers?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedCategories, hourlyRate, minRating, availableNow, sortBy, router, isClient]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setExperienceLevel("Any");
    setHourlyRate([5, 200]);
    setMinRating("0");
    setAvailableNow(false);
    setSearchQuery("");
    setSortBy("best_match");
    router.push("/client/find-freelancers");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/client/find-freelancers?${params.toString()}`);
  };

  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Hire Top Talent</h1>
        <p className="text-muted-foreground">
          Showing {freelancers.length} of {total} freelancers
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
              hourlyRate={hourlyRate}
              onHourlyRateChange={setHourlyRate}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              availableNow={availableNow}
              onAvailableNowChange={setAvailableNow}
              onClearAll={clearAllFilters}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name, title, or skills..."
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
                      hourlyRate={hourlyRate}
                      onHourlyRateChange={setHourlyRate}
                      minRating={minRating}
                      onMinRatingChange={setMinRating}
                      availableNow={availableNow}
                      onAvailableNowChange={setAvailableNow}
                      onClearAll={clearAllFilters}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best_match">Best Match</SelectItem>
                  <SelectItem value="highest_rated">Highest Rated</SelectItem>
                  <SelectItem value="most_reviews">Most Reviews</SelectItem>
                  <SelectItem value="lowest_rate">Lowest Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {!freelancers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <FreelancerCardSkeleton key={i} />
              ))}
            </div>
          ) : freelancers.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearAllFilters} variant="outline">Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
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
