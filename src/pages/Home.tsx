import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../logo-black.svg";

export const Home = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center py-20 px-4 -translate-y-44">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="relative space-y-8">
          <img
            src={Logo}
            alt="Rove Logo"
            className="h-96 w-auto block mx-auto"
          />

          <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed font-extrabold">
            Discover events... book... Enjoy
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-4 border-[#4056f4] bg-[#4056f4] hover:bg-[#3245c2] text-white font-extrabold rounded-full transform transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Browse Events
            </Link>

            {user?.isStaff && window.innerWidth > 640 && (
              <span className="text-gray-500 dark:text-gray-400 mx-2">or</span>
            )}

            {user?.isStaff && (
              <Link
                to="/events/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-4 font-extrabold rounded-full bg-white border-[#06BA63] text-[#06BA63] hover:bg-[#06BA63] hover:text-white transform transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Event
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
