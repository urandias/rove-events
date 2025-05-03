import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">Events Platform</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-200">Events</Link>
          
          {user ? (
            <>
              <Link to="/my-events" className="hover:text-blue-200">My Events</Link>
              <Link to="/create-event" className="hover:text-blue-200">Create Event</Link>
              <button 
                onClick={() => signOut()} 
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="hover:text-blue-200">Sign In</Link>
              <Link 
                to="/signup" 
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};