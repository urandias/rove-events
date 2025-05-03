import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <main
        className="container mx-auto px-4 py-8 flex-grow"
        aria-label="Main content">
        <Outlet />
      </main>
    </div>
  );
};