import React from "react";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import useUpcomingClasses, {
  buildEventTimeRange,
  buildSelectedClassLabel,
  formatEventDate,
  scrollToSection,
} from "@/lib/useUpcomingClasses";
import { getServiceByKey, getServiceKeyFromClassType } from "@/data/services";

function classTypeToService(classType) {
  const key = getServiceKeyFromClassType(classType);
  return key ? getServiceByKey(key).title : classType || "Class Inquiry";
}

export default function UpcomingClasses({ onRequestTraining }) {
  const { events: loadedEvents = [], status } = useUpcomingClasses();
  const events = Array.isArray(loadedEvents) ? loadedEvents : [];

  return (
    <section id="schedule" className="scroll-mt-28 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl reveal-on-scroll">
          <p className="text-sm font-bold uppercase tracking-wide text-red-600">
            Upcoming Classes
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            View upcoming BetterBodies training dates
          </h2>

          <p className="mt-4 text-slate-700">
            Public class dates will appear here as they are scheduled. If you do
            not see a date that works, send a request and Sheldon will follow up
            with available options.
          </p>
        </div>

        {status === "loading" && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            Loading upcoming classes…
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            Upcoming classes could not be loaded right now. Please send a class
            request and we’ll follow up.
          </div>
        )}

        {status === "ready" && events.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm reveal-on-scroll">
            <h3 className="text-xl font-extrabold text-slate-950">
              Upcoming classes are being scheduled.
            </h3>

            <p className="mt-2 text-slate-700">
              Need CPR, BLS, or group training soon? Send a request and we’ll
              follow up with available options.
            </p>

            <Button
              className="mt-5 bg-red-600 hover:bg-red-700"
              onClick={() => scrollToSection("#contact")}
            >
              Request Class Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {status === "ready" && events.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="reveal-on-scroll rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-red-700">
                    {event.classType || "Class"}
                  </span>

                  {event.seatsAvailable && (
                    <span className="text-xs font-bold text-slate-500">
                      {event.seatsAvailable} seats
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-extrabold text-slate-950">
                  {event.title || "BetterBodies Training Class"}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p className="flex gap-2">
                    <CalendarDays className="h-5 w-5 shrink-0 text-red-600" />
                    <span>
                      {formatEventDate(event.date)} ·{" "}
                      {buildEventTimeRange(event)}
                    </span>
                  </p>

                  <p className="flex gap-2">
                    <MapPin className="h-5 w-5 shrink-0 text-red-600" />
                    <span>{event.locationLabel || "Location TBD"}</span>
                  </p>

                  {event.price && (
                    <p className="flex gap-2">
                      <Users className="h-5 w-5 shrink-0 text-red-600" />
                      <span>{event.price}</span>
                    </p>
                  )}
                </div>

                {event.notes && (
                  <p className="mt-4 text-sm text-slate-600">{event.notes}</p>
                )}

                <div className="mt-6">
                  {event.registrationUrl ? (
                    <Button
                      asChild
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Register / Request Class
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() =>
                        onRequestTraining?.({
                          topic: getServiceKeyFromClassType(
                            event.classType
                          ) ?? "cpr",
                          sourceSection: "upcoming_classes",
                          leadIntent: "specific_class",
                          serviceNeeded: classTypeToService(event.classType),
                          selectedClass: buildSelectedClassLabel(event),
                          selectedClassId: event.id,
                          ctaLabel: "Request This Class",
                        })
                      }
                    >
                      Request This Class
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
