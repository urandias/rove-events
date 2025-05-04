export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    max_attendees?: number;
    current_attendees?: number;
    image_url?: string;
    category?: string;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    isStaff: boolean;
    events: string[];
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error?: string;
  }