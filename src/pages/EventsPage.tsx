import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../types";
import supabase from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { format, parseISO, isPast, differenceInDays } from "date-fns";
import { PropagateLoader } from "react-spinners";

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isLoading: authLoading, showAuthModal } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadEvents();
    }
  }, [authLoading]);

  const loadEvents = async (attempt = 1) => {
    console.log(`Loading events attempt ${attempt}...`);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          id,
          title,
          description,
          date,
          time,
          location,
          max_attendees,
          current_attendees,
          image_url,
          organizer:profiles!events_organizer_id_fkey(name)
        `
        )
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedEvents = data.map((event: any) => ({
          ...event,
          organizer: event.organizer?.name || "Unknown Organizer",
          date: new Date(event.date).toISOString(),
          current_attendees: event.current_attendees || 0,
          max_attendees: event.max_attendees || undefined,
        }));

        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error("Event load error:", err);

      if (attempt < 3) {
        console.log(`Retrying... (${attempt + 1}/3)`);
        setTimeout(() => loadEvents(attempt + 1), 2000 * attempt);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load events");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = async (eventId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      sessionStorage.setItem("redirectEventId", eventId);
      showAuthModal();
    } else {
      navigate(`/events/${eventId}`);
    }
  };

  const getEventStatus = (date: string) => {
    const eventDate = parseISO(date);
    if (isPast(eventDate)) return "past";
    const daysUntil = differenceInDays(eventDate, new Date());
    if (daysUntil <= 7) return "soon";
    return "upcoming";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh]">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center">
            <PropagateLoader size={16}/>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 font-medium mb-2">
            Failed to load events
          </div>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={(_e) => loadEvents()}
            className="mt-4 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-48 w-48 text-black mb-4">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">
            No upcoming events found
          </h3>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">
            Check back later or create your own event to get started!
          </p>
        </div>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const status = getEventStatus(event.date);
            const eventDate = parseISO(event.date);

            return (
              <div
                key={event.id}
                className="group bg-white rounded-3xl shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden border-8 hover:border-[#3245c2] border-black"
                onClick={() => handleEventClick(event.id)}>
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-56 object-cover rounded-t-xl transition-transform duration-200"
                  />
                ) : (
                  <div className="h-56 bg-gray-100 flex items-center justify-center rounded-t-xl">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{
                        backgroundColor:
                          status === "past"
                            ? "#efefef"
                            : status === "soon"
                            ? "#FFF0F1"
                            : "#EEFAF3",
                        color:
                          status === "past"
                            ? "#333333"
                            : status === "soon"
                            ? "#D62839"
                            : "#06BA63",
                      }}>
                      {status === "past"
                        ? "Past Event"
                        : status === "soon"
                        ? "Soon"
                        : "Upcoming"}
                    </span>
                    <span className="text-sm text-black">
                      {format(eventDate, "MMM d, yyyy")}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold mb-2 text-black">
                    {event.title}
                  </h2>
                  <p className="text-black line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-black">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        {event.current_attendees} / {event.max_attendees || "∞"}{" "}
                        attendees
                      </span>
                    </div>

                    {event.organizer && (
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="truncate">
                          Hosted by {event.organizer}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};