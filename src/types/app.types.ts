export type Profile = {
    id: string;
    name: string | null;
    is_staff: boolean;
    created_at: string;
    updated_at: string;
    };
    
    export type Event = {
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
    
export type EventRegistration = {
    event_id: string;
    user_id: string;
    created_at: string;
};

export type InsertEvent = {
    id?: string
    title: string  
    description?: string | null  
    date: string  
    time: string 
    location: string  
    organizer_id: string 
    max_attendees?: number | null
    current_attendees?: number
    image_url?: string | null
    category?: string | null
    created_at?: string
    updated_at?: string
}
      
export type UpdateEvent = Partial<InsertEvent>

export type EventWithRegistrationStatus = Event & {
    is_registered: boolean
}