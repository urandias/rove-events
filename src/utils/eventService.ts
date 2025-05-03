import { supabase } from './supabase';
import { Event, EventRegistration, EventWithRegistrationStatus, InsertEvent, UpdateEvent } from '../types/app.types';

export const eventService = {
  async getAllEvents(userId?: string): Promise<EventWithRegistrationStatus[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    if (!userId) {
      return events.map(event => ({
        ...event,
        isRegistered: false,
        isOrganizer: false
      }));
    }

    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', userId);

    const registeredEventIds = new Set(registrations?.map(reg => reg.event_id) || []);

    return events.map(event => ({
      ...event,
      isRegistered: registeredEventIds.has(event.id),
      isOrganizer: event.organizer_id === userId
    }));
  },

  async getEventById(eventId: string, userId?: string): Promise<EventWithRegistrationStatus | null> {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      console.error('Error fetching event:', error);
      return null;
    }

    if (!userId) {
      return {
        ...event,
        isRegistered: false,
        isOrganizer: false
      };
    }

    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    return {
      ...event,
      isRegistered: !!registration,
      isOrganizer: event.organizer_id === userId
    };
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }

    return data;
  },

  async getUserRegisteredEvents(userId: string): Promise<EventWithRegistrationStatus[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', userId);

    if (error || !data.length) {
      if (error) console.error('Error fetching user registrations:', error);
      return [];
    }

    const eventIds = data.map(reg => reg.event_id);
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching registered events:', eventsError);
      return [];
    }

    return events.map(event => ({
      ...event,
      isRegistered: true,
      isOrganizer: event.organizer_id === userId
    }));
  },

  async createEvent(eventData: InsertEvent): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data;
  },

  async updateEvent(eventId: string, eventData: UpdateEvent): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }

    return data;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  },

  async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId
      });

    if (error) {
      console.error('Error registering for event:', error);
      return false;
    }

    return true;
  },

  async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unregistering from event:', error);
      return false;
    }

    return true;
  },

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event registrations:', error);
      return [];
    }

    return data;
  }
};