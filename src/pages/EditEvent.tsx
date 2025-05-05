import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsApi } from "../utils/api/events";
import { useAuth } from "../context/AuthContext";

export const EditEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    imageUrl: "",
    category: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.isStaff) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await eventsApi.getEvent(eventId!);
        setFormData({
          title: event.title,
          description: event.description || "",
          date: event.date.split("T")[0],
          time: event.time,
          location: event.location,
          maxAttendees: event.max_attendees?.toString() || "",
          imageUrl: event.image_url || "",
          category: event.category || "",
        });
      } catch (err) {
        setError("Failed to load event details");
      }
    };
    loadEvent();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await eventsApi.updateEvent(eventId!, {
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        max_attendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
        image_url: formData.imageUrl || null,
        category: formData.category || null,
      });
      navigate(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user?.isStaff) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Edit Event
        </h1>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors h-32"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="maxAttendees"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Maximum Attendees (optional)
            </label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Category (optional)
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400/50 dark:bg-slate-700 dark:text-white transition-colors">
              <option value="">Select a category</option>
              <option value="Tech">Tech</option>
              <option value="Art">Art</option>
              <option value="Sports">Sports</option>
              <option value="Social">Social</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Updating Event..." : "Update Event"}
          </button>
        </form>
      </div>
    </div>
  );
};