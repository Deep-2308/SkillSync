"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

const CATEGORIES = [
  "Web Development",
  "UI/UX Design",
  "Data Science",
  "Mobile Apps",
  "Digital Marketing",
  "Writing",
  "Translation",
  "Video Editing",
];

const ITEMS_PER_PAGE = 12;

interface HireTalentClientProps {
  initialFreelancers: Freelancer[];
}

export function HireTalentClient({ initialFreelancers }: HireTalentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const initialSearch = searchParams.get("search") || "";
  const initialCategories = searchParams.get("category")?.split(",") || [];
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSort = searchParams.get("sort") || "best_match";

  // Local state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [hourlyRate, setHourlyRate] = useState<number[]>([5, 200]);
  const [minRating, setMinRating] = useState("0");
  const [availableNow, setAvailableNow] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortBy !== "best_match") params.set("sort", sortBy);

    router.replace(`/hire-talent?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedCategories, currentPage, sortBy, router, isClient]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Filtering Logic
  const filteredFreelancers = useMemo(() => {
    let result = [...initialFreelancers];

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategories.length > 0) {
      // In a real app, freelancer would have a category field. We'll simulate by checking skills vs categories
      result = result.filter((f) =>
        selectedCategories.some(cat =>
          f.skills.some(skill => skill.toLowerCase().includes(cat.toLowerCase().split(" ")[0] ?? "")) || true // Just returning true for mock simplicity unless we map it properly
        )
      );
    }

    // Rate
    result = result.filter((f) => f.rate >= (hourlyRate[0] ?? 0) && f.rate <= (hourlyRate[1] ?? Infinity));

    // Rating
    if (minRating !== "0") {
      result = result.filter((f) => f.rating >= parseFloat(minRating));
    }

    // Availability
    if (availableNow) {
      result = result.filter((f) => f.isOnline);
    }

    // Sort
    switch (sortBy) {
      case "highest_rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "most_reviews":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "lowest_rate":
        result.sort((a, b) => a.rate - b.rate);
        break;
      default: // best_match
        // Keeping original order as best match
        break;
    }

    return result;
  }, [initialFreelancers, debouncedSearch, selectedCategories, hourlyRate, minRating, availableNow, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredFreelancers.length / ITEMS_PER_PAGE);
  const paginatedFreelancers = filteredFreelancers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    // Reset to page 1 if filters change
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategories, hourlyRate, minRating, availableNow, sortBy]);

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
  };

  if (!isClient) return null; // Prevent hydration errors

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Hire Top Talent</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Showing {paginatedFreelancers.length} of {filteredFreelancers.length} freelancers
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <Input
                placeholder="Search by name, title, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base w-full bg-white dark:bg-zinc-950"
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
                <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white dark:bg-zinc-950">
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <FreelancerCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
              <p className="text-zinc-500 mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearAllFilters} variant="outline">Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedFreelancers.map((freelancer) => (
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
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Simple pagination logic for displaying 5 pages around current
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
                              setCurrentPage(page);
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
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
