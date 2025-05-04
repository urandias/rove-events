import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [showEventMessage, setShowEventMessage] = useState(false);
  const { signIn, signUp, error, message, isAuthenticated, isLoading } =
    useAuth();

  const navigate = useNavigate();

  const handleClose = () => {
    sessionStorage.removeItem("redirectEventId");
    onClose();
  };

  useEffect(() => {
    setShowEventMessage(!!sessionStorage.getItem("redirectEventId"));
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      onClose();
      resetForm();

      const redirectEventId = sessionStorage.getItem("redirectEventId");
      if (redirectEventId) {
        sessionStorage.removeItem("redirectEventId");
        navigate(`/events/${redirectEventId}`);
      }
    }
  }, [isAuthenticated, isLoading, onClose, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      const { email, password, name } = formData;
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", name: "" });
  };

  const handleToggle = () => {
    setIsSignIn(!isSignIn);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-slate-900/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-xl shadow-slate-900/50"
        onClick={(e) => e.stopPropagation()}
      >
        {showEventMessage && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-sm flex justify-center">
            Sign in to register for events
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-black">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl text-white font-extrabold bg-[#D62839] hover:bg-red-700 transition-colors px-2 rounded-full hover"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isSignIn && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-black focus:border-[#4056f4] focus:ring-2 focus:ring-[#4056f4]  transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-2xl border border-black focus:border-[#4056f4] focus:ring-2 focus:ring-[#4056f4]  transition-colors"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-2xl border border-black focus:border-[#4056f4] focus:ring-2 focus:ring-[#4056f4]  transition-colors"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-30 py-3 px-4 rounded-3xl bg-[#4056f4] hover:bg-[#3245c2] text-white font-extrabold transition-colors hover:ring-4 hover:ring-[#3245c2] hover:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing..."
                : isSignIn
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading}
              className="text-black hover:text-red-600 font-medium transition-colors disabled:opacity-50"
            >
              {isSignIn
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}