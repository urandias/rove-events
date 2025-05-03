import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EventsPage } from "./pages/EventsPage";
import { Home } from "./pages/Home";
import { Event } from "./pages/Event";
import { CreateEvent } from "./pages/CreateEvent";
import { EditEvent } from "./pages/EditEvent";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "events", element: <EventsPage /> },
      { path: "events/:eventId", element: <Event /> },
      { path: "events/create", element: <CreateEvent /> },
      { path: "events/:eventId/edit", element: <EditEvent /> },
    ],
  },
]);