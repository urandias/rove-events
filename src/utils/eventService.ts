import { supabase } from './supabase'
import {
  Event,
  EventRegistration,
  EventWithRegistrationStatus,
  InsertEvent,
  UpdateEvent,
} from '../types/app.types'

export const eventService = {
  async getEventsWithStatus(userId?: string): Promise<EventWithRegistrationStatus[]> {
    return eventService.getAllEvents(userId)
  },

  async getAllEvents(userId?: string): Promise<EventWithRegistrationStatus[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error || !events) return []

    if (!userId)
      return events.map((e) => ({
        ...e,
        isRegistered: false,
        isOrganizer: false,
      }))

    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', userId)

    const registeredIds = new Set((registrations ?? []).map((r) => r.event_id))

    return events.map((e) => ({
      ...e,
      isRegistered: registeredIds.has(e.id),
      isOrganizer: e.organizer_id === userId,
    }))
  },

  async getEventById(eventId: string, userId?: string): Promise<EventWithRegistrationStatus | null> {
    const { data: event, error } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (error || !event) return null

    if (!userId)
      return {
        ...event,
        isRegistered: false,
        isOrganizer: false,
      }

    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    return {
      ...event,
      isRegistered: !!registration,
      isOrganizer: event.organizer_id === userId,
    }
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('date', { ascending: true })
    return error ? [] : (data ?? [])
  },

  async getUserRegisteredEvents(userId: string): Promise<EventWithRegistrationStatus[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', userId)
    if (error || !(data?.length)) return []

    const eventIds = data.map((r) => r.event_id)

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('date', { ascending: true })

    if (eventsError || !events) return []

    return events.map((e) => ({
      ...e,
      isRegistered: true,
      isOrganizer: e.organizer_id === userId,
    }))
  },

  async createEvent(eventData: InsertEvent): Promise<Event | null> {
    const { data, error } = await supabase.from('events').insert(eventData).select().single()
    return error ? null : data
  },

  async updateEvent(eventId: string, eventData: UpdateEvent): Promise<Event | null> {
    const { data, error } = await supabase.from('events').update(eventData).eq('id', eventId).select().single()
    return error ? null : data
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    return !error
  },

  async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('event_registrations').insert({ event_id: eventId, user_id: userId })
    return !error
  },

  async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
    return !error
  },

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase.from('event_registrations').select('*').eq('event_id', eventId)
    return error ? [] : (data ?? [])
  },
}