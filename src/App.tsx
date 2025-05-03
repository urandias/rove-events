// src/App.tsx
import { useEffect, useState } from 'react'
import './index.css'
import { Navbar } from './components/Navbar'
import { EventCard } from './components/EventCard'
import { eventService } from './utils/eventService'
import { EventWithRegistrationStatus } from './types/app.types'

function App() {
  const [events, setEvents] = useState<EventWithRegistrationStatus[]>([])

  const fetchEvents = async () => {
    const eventsData = await eventService.getEventsWithStatus()
    setEvents(eventsData)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <>
      <Navbar />
      <div className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} refreshEvents={fetchEvents} />
        ))}
      </div>
    </>
  )
}

export default App