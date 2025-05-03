import { Link } from 'react-router-dom'
import { EventWithRegistrationStatus } from '../types/app.types'
import { useAuth } from '../context/AuthContext'
import { eventService } from '../utils/eventService'
import { useState } from 'react'

type EventCardProps = {
  event: EventWithRegistrationStatus
  refreshEvents?: () => void
}

export const EventCard: React.FC<EventCardProps> = ({ event: evt, refreshEvents }) => {
  const { user } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)

  if (!evt) return null

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    return `${hours}:${minutes}`
  }

  const handleRegister = async () => {
    if (!user) return
    setIsRegistering(true)
    try {
      if (evt.is_registered) {
        await eventService.unregisterFromEvent(evt.id, user.id)
      } else {
        await eventService.registerForEvent(evt.id, user.id)
      }
      refreshEvents?.()
    } finally {
      setIsRegistering(false)
    }
  }

  const isAtCapacity =
    evt.max_attendees !== null && evt.current_attendees >= evt.max_attendees
  const isOrganizer = user && user.id === evt.organizer_id
  const canRegister = user && !isOrganizer && !isAtCapacity

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {evt.image_url ? (
        <img src={evt.image_url} alt={evt.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-blue-100 flex items-center justify-center">
          <span className="text-blue-500 text-xl font-medium">{evt.title}</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{evt.title}</h3>

        <div className="text-gray-600 mb-4 space-y-1">
          <p>
            <span className="font-medium">Date:</span> {formatDate(evt.date)}
          </p>
          <p>
            <span className="font-medium">Time:</span> {formatTime(evt.time)}
          </p>
          <p>
            <span className="font-medium">Location:</span> {evt.location}
          </p>
          <p>
            <span className="font-medium">Attendees:</span> {evt.current_attendees}
            {evt.max_attendees !== null && ` / ${evt.max_attendees}`}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Link to={`/events/${evt.id}`} className="text-blue-600 hover:text-blue-800">
            View Details
          </Link>

          {isOrganizer ? (
            <Link
              to={`/events/${evt.id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              Edit
            </Link>
          ) : (
            user && (
              <button
                onClick={handleRegister}
                disabled={isRegistering || !canRegister}
                className={`px-3 py-1 rounded ${
                  evt.is_registered
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : canRegister
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isRegistering
                  ? 'Processing...'
                  : evt.is_registered
                  ? 'Unregister'
                  : isAtCapacity
                  ? 'At Capacity'
                  : 'Register'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard