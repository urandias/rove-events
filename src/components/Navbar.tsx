import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import Logo from "../logo-white.svg"

export const Navbar = () => {
  const {
    user,
    isAuthenticated,
    signOut,
    isLoading,
    hideAuthModal,
    isAuthModalOpen,
    showAuthModal,
  } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    console.log("Sign out completed");
  };

  return (
    <>
      <nav className="bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 group">
                <img src={Logo} alt="Rove Logo" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/events"
                  className="px-3 py-2 rounded-3xl font-bold border-2 border-[#4056f4] bg-[#4056f4] text-white hover:bg-[#3245c2] transition-colors">
                  Events
                </Link>
                {user?.isStaff && (
                  <Link
                    to="/events/create"
                    className="px-3 py-2 rounded-3xl font-bold border-2 bg-white border-[#06BA63] text-[#06BA63] hover:bg-[#06BA63] hover:text-white transition-colors">
                    Create Event
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg
                    className="animate-spin h-5 w-5 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">
                    Welcome, <span className="font-medium">{user.name}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-3xl bg-white hover:bg-[#D62839] hover:text-white text-[#D62839] border-2 border-[#D62839] hover:border-[#D62839] font-bold transition-colors">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={showAuthModal}
                  className="px-4 py-2 rounded-3xl bg-[#D62839] hover:bg-white hover:text-[#D62839] text-white font-bold transition-colors">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={hideAuthModal} />
    </>
  );
};