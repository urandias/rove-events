import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format, parseISO, isPast } from "date-fns";
import supabase from "../utils/supabase";
import { PropagateLoader } from "react-spinners";

export const Event = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user, isAuthenticated, showAuthModal } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      setIsLoading(true);
      setError(null); 
      
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            date,
            time,
            location,
            max_attendees,
            current_attendees,
            image_url,
            organizer:profiles!events_organizer_id_fkey(id, name),
            registrations:event_registrations(user_id)
          `)
          .eq("id", eventId)
          .single();

        if (error) throw error;
        
        if (data) {
          const formattedEvent = {
            ...data,
            organizer: data.organizer || { name:"Unknown Organizer" },
            date: new Date(data.date).toISOString(),
            current_attendees: data.current_attendees || 0,
            max_attendees: data.max_attendees || undefined,
            registrations: data.registrations || []
          };
          
          setEvent(formattedEvent);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId]);

  const handleAddToCalendar = () => {
    if (!event) return;

    if (isPast(parseISO(event.date))) {
      setError("This event has already passed.");
      return;
    }

    try {
      const eventDate = new Date(event.date);
      const [hours, minutes] = event.time.split(":").map(Number);

      const startDate = new Date(eventDate);
      startDate.setUTCHours(hours);
      startDate.setUTCMinutes(minutes);
      startDate.setUTCSeconds(0);

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const formatGoogleDate = (date: Date) => {
        return (
          date
            .toISOString()
            .replace(/[-:]/g, "")
            .split(".")[0]
            .replace("T", "") + "Z"
        );
      };

      const start = formatGoogleDate(startDate);
      const end = formatGoogleDate(endDate);

      const url = new URL("https://calendar.google.com/calendar/render");
      url.searchParams.set("action", "TEMPLATE");
      url.searchParams.set("dates", `${start}/${end}`);
      url.searchParams.set("text", event.title);
      url.searchParams.set("details", event.description || "");
      url.searchParams.set("location", event.location);
      url.searchParams.set("sf", "true");
      url.searchParams.set("output", "xml");

      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating calendar link:", error);
      setError(
        "Failed to generate calendar event. Please check event details."
      );
    }
  };

  const handleRegistration = async () => {
    if (!isAuthenticated || !user) {
      sessionStorage.setItem("redirectEventId", eventId!);
      showAuthModal();
      return;
    }
    try {
      const { error: insertError } = await supabase
        .from("event_registrations")
        .insert([
          { event_id: eventId, user_id: user.id }
        ]);
      
      if (insertError) throw insertError;
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          date,
          time,
          location,
          max_attendees,
          current_attendees,
          image_url,
          organizer:profiles!events_organizer_id_fkey(id, name),
          registrations:event_registrations(user_id)
        `)
        .eq("id", eventId!)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedEvent = {
          ...data,
          organizer: data.organizer || { name: "Unknown Organizer" },
          date: new Date(data.date).toISOString(),
          current_attendees: data.current_attendees || 0,
          max_attendees: data.max_attendees || undefined,
          registrations: data.registrations || []
        };
        
        setEvent(formattedEvent);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleUnregistration = async () => {
    if (!isAuthenticated || !user || !eventId) return;
    try {
      const { error: deleteError } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      
      if (deleteError) throw deleteError;
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          date,
          time,
          location,
          max_attendees,
          current_attendees,
          image_url,
          organizer:profiles!events_organizer_id_fkey(id, name),
          registrations:event_registrations(user_id)
        `)
        .eq("id", eventId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedEvent = {
          ...data,
          organizer: data.organizer || { name: "Unknown Organizer" },
          date: new Date(data.date).toISOString(),
          current_attendees: data.current_attendees || 0,
          max_attendees: data.max_attendees || undefined,
          registrations: data.registrations || []
        };
        
        setEvent(formattedEvent);
      }
    } catch (err) {
      console.error("Unregistration error:", err);
      setError(err instanceof Error ? err.message : "Unregistration failed");
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId!);
        
        if (error) throw error;
        
        navigate("/events");
      } catch (err) {
        console.error("Delete error:", err);
        setError(err instanceof Error ? err.message : "Failed to delete event");
      }
    }
  };

  if (!eventId) {
    return (
      <div className="text-center py-12 text-red-500">Event not found</div>
    );
  }

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh]">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center">
          <PropagateLoader size={16}/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="text-red-600 dark:text-red-400 font-medium mb-2">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12 text-red-500">Event not found</div>
    );
  }

  const isRegistered = event.registrations?.some(
    (reg: any) => reg.user_id === user?.id
  );
  const isEventFull =
    event.max_attendees && event.current_attendees >= event.max_attendees;
  const isEventPast = isPast(parseISO(event.date));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border-8 border-[#4056f4] shadow-lg p-6 relative">
        
          <div className="absolute top-4 right-4" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-[#3245c2] bg-[#4056f4] rounded-full transition-colors">
              <svg
                className="w-6 h-6 text-white font-extrabold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-3xl shadow-lg z-10 border-4 border-[#3245c2]">
                <Link
                  to={`/events/${eventId}/edit`}
                  className="flex items-center px-4 py-2 text-[#06BA63]  hover:bg-[#06BA63] hover:text-white font-bold rounded-3xl">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                    Edit
                </Link>
                <button
                  onClick={handleDeleteEvent}
                  className="flex items-center w-full px-4 py-2 text-[#D62839] hover:bg-[#D62839] hover:text-white font-bold rounded-3xl ">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                    Delete
                </button>
              </div>
            )}
          </div>


        <h1 className="text-3xl font-bold mb-4 text-black">
          {event.title}
        </h1>
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-6 border-4 border-[#4056f4]"
          />
        )}
        <div className="text-black space-y-4 mb-6">
          <p>{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-[#4056f4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {format(parseISO(event.date), "MMM d, yyyy")} at {event.time}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-[#4056f4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{event.location}</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-[#4056f4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>
              {event.current_attendees} / {event.max_attendees || "∞"} attendees
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Hosted by {event.organizer?.name || "Unknown"}</span>
          </div>
        </div>

        {!isEventPast && (
          <div className="mt-8 space-y-4">
            {isRegistered ? (
              <button
                onClick={handleUnregistration}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-3xl transition-all hover:shadow-3xl hover:-translate-y-0.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Unregister from Event
              </button>
            ) : (
              <button
                onClick={handleRegistration}
                disabled={isEventFull || !isAuthenticated}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 ${
                  isEventFull || !isAuthenticated
                    ? "bg-gray-400 cursor-not-allowed opacity-75"
                    : "bg-[#4056f4] hover:bg-[#3245c2]"
                } text-white font-extrabold rounded-3xl transition-all`}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                {isEventFull
                  ? "Event Full"
                  : !isAuthenticated
                  ? "Sign In to Register"
                  : "Register Now"}
              </button>
            )}
            <button
              onClick={handleAddToCalendar}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#06BA63] hover:bg-green-600 text-white font-extrabold rounded-3xl transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Add to Google Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};