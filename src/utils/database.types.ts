export interface Database {
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
      };
    };
  }