
# Rove

An events platform that allows users to discover, register and manage events. Also, as a staff member you can create and manage events that users can browse and join.




## Tech Stack

**Client:** 
- React (TypeScript)
- Tailwind CSS
- React Router

**Server:**
- Supabase (Database and Authentication)


## Features

- Supabase authentication for secure sign-up/in
- Responsive design from mobile-first approach via Tailwind CSS
- Users can browse upcoming events, register/unregister from events, add events to Google Calendar through custom links
- Staff members can do all of the above and create, edit and delete events
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

`VITE_SUPABASE_URL`

`VITE_SUPABASE_ANON_KEY`


## Database setup

Run the following SQL commands into your Supabase project:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  max_attendees INT,
  current_attendees INT DEFAULT 0 CHECK (current_attendees >= 0),
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event registrations table
CREATE TABLE event_registrations (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Attendee count functions
CREATE OR REPLACE FUNCTION increment_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_attendees = current_attendees + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_attendees = GREATEST(current_attendees - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Enable read access" ON events
FOR SELECT USING (true);

CREATE POLICY "Allow staff management" ON events
FOR ALL USING (
  (SELECT is_staff FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Allow attendee updates" ON events
FOR UPDATE USING (true) WITH CHECK (
  current_attendees BETWEEN 0 AND COALESCE(max_attendees, 999999)
);

-- Registrations policies
CREATE POLICY "Enable user registrations" ON event_registrations
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  (SELECT max_attendees FROM events WHERE id = event_id) >
  (SELECT current_attendees FROM events WHERE id = event_id)
);

CREATE POLICY "Enable user unregistrations" ON event_registrations
FOR DELETE USING (user_id = auth.uid());
```
## Test Account

- **Email:** test@rove.com
- **Password:** password123

> **Note:** Set `is_staff` to `TRUE` in the Supabase `profiles` table for staff features
