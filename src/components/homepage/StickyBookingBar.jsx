import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/useUpcomingClasses";

export default function StickyBookingBar({ onRequestTraining }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl gap-3">
        <Button
          className="flex-1 bg-red-600 text-white hover:bg-red-700"
          onClick={() =>
            onRequestTraining?.({
              topic: "cpr",
              sourceSection: "sticky_booking_bar",
              leadIntent: "general_training",
              serviceNeeded: "Not sure yet",
              ctaLabel: "Request Training",
            })
          }
        >
          Request Training
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={() => scrollToSection("#schedule")}
        >
          Schedule
        </Button>
      </div>
    </div>
  );
}
