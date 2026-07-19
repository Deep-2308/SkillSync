"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * "Watch Demo" CTA + modal.
 *
 * The YouTube iframe is only mounted while the dialog is open, so the video
 * never loads (or autoplays audio) in the background on page load. Radix Dialog
 * handles click-outside / ESC to close.
 */
export function WatchDemoDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="gap-2">
          <Play className="size-4 fill-current" />
          Watch Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>See SkillSync in action</DialogTitle>
          <DialogDescription>
            A 2-minute tour of finding, hiring, and paying a freelancer.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {open ? (
              <iframe
                className="absolute inset-0 size-full"
                // autoplay=1 is why we gate the mount on `open`.
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="SkillSync product demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
