"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  experienceLevel: string;
  onExperienceChange: (level: string) => void;
  hourlyRate: number[];
  onHourlyRateChange: (rate: number[]) => void;
  minRating: string;
  onMinRatingChange: (rating: string) => void;
  availableNow: boolean;
  onAvailableNowChange: (available: boolean) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  experienceLevel,
  onExperienceChange,
  hourlyRate,
  onHourlyRateChange,
  minRating,
  onMinRatingChange,
  availableNow,
  onAvailableNowChange,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 text-muted-foreground text-xs">
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryChange(category)}
              />
              <Label
                htmlFor={`cat-${category}`}
                className="text-sm font-normal text-muted-foreground"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Experience Level</h4>
        <RadioGroup value={experienceLevel} onValueChange={onExperienceChange}>
          {["Any", "Junior", "Mid", "Senior"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={`exp-${level}`} />
              <Label htmlFor={`exp-${level}`} className="text-sm font-normal text-muted-foreground">
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-foreground">Hourly Rate</h4>
          <span className="text-xs text-muted-foreground">${hourlyRate[0]} - ${hourlyRate[1]}</span>
        </div>
        <Slider
          defaultValue={[5, 200]}
          value={hourlyRate}
          onValueChange={onHourlyRateChange}
          max={200}
          min={5}
          step={5}
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Minimum Rating</h4>
        <RadioGroup value={minRating} onValueChange={onMinRatingChange}>
          {[
            { value: "0", label: "Any Rating" },
            { value: "4", label: "4+ Stars" },
            { value: "3", label: "3+ Stars" },
          ].map((rating) => (
            <div key={rating.value} className="flex items-center space-x-2">
              <RadioGroupItem value={rating.value} id={`rating-${rating.value}`} />
              <Label htmlFor={`rating-${rating.value}`} className="text-sm font-normal text-muted-foreground">
                {rating.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-foreground">Availability</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available-now"
            checked={availableNow}
            onCheckedChange={(checked) => onAvailableNowChange(checked as boolean)}
          />
          <Label
            htmlFor="available-now"
            className="text-sm font-normal text-muted-foreground"
          >
            Available Now
          </Label>
        </div>
      </div>
    </div>
  );
}
