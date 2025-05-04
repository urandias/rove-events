import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#efefef] text-black">
      <header className="relative z-10">
        <Navbar />
      </header>
      <main
        className="container mx-auto px-4 py-8 flex-grow"
        aria-label="Main content">
        <Outlet />
      </main>
    </div>
  );
};