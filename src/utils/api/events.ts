import supabase from "../supabase";
import type { Database } from "../database.types";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export const eventsApi = {
  async getEvents() {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        organizer:profiles(name)
      `
      )
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEvent(id: string) {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        organizer:profiles(name),
        registrations:event_registrations(user_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createEvent(event: EventInsert) {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(id: string, updates: EventUpdate) {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async registerForEvent(eventId: string, userId: string) {
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: userId,
    });

    if (error) throw error;
  },

  async unregisterFromEvent(eventId: string, userId: string) {
    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async deleteEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
  },
};