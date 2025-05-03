export type Database = {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            name: string | null;
            is_staff: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            name?: string | null;
            is_staff?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string | null;
            is_staff?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
        events: {
          Row: {
            id: string;
            title: string;
            description: string | null;
            date: string;
            time: string;
            location: string;
            organizer_id: string;
            max_attendees: number | null;
            current_attendees: number;
            image_url: string | null;
            category: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            title: string;
            description?: string | null;
            date: string;
            time: string;
            location: string;
            organizer_id: string;
            max_attendees?: number | null;
            current_attendees?: number;
            image_url?: string | null;
            category?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            title?: string;
            description?: string | null;
            date?: string;
            time?: string;
            location?: string;
            organizer_id?: string;
            max_attendees?: number | null;
            current_attendees?: number;
            image_url?: string | null;
            category?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };
        event_registrations: {
          Row: {
            event_id: string;
            user_id: string;
            created_at: string;
          };
          Insert: {
            event_id: string;
            user_id: string;
            created_at?: string;
          };
          Update: {
            event_id?: string;
            user_id?: string;
            created_at?: string;
          };
        };
      };
    };
  };
  
  export type Profile = Database['public']['Tables']['profiles']['Row'];
  export type Event = Database['public']['Tables']['events']['Row'];
  export type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];
  
  export type InsertEvent = Database['public']['Tables']['events']['Insert'];
  export type UpdateEvent = Database['public']['Tables']['events']['Update'];
  
  export type EventWithRegistrationStatus = Event & {
    isRegistered: boolean;
    isOrganizer: boolean;
  };