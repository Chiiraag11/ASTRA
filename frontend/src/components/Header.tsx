import React, { useState } from "react";
import { Shield, UserPlus, LogIn, User, LogOut } from "lucide-react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ⬅️ get logged-in user + logout
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              A.S.T.R.A
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            
            {/* IF USER NOT LOGGED IN → Show Sign In / Sign Up */}
            {!user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => navigate("/signin")}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/signup")}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}

            {/* IF USER LOGGED IN → Show Profile Dropdown */}
            {user && (
  <div className="relative">
    
    {/* 🔥 PREMIUM PROFILE BUTTON */}
    <button
      onClick={() => setOpen(!open)}
      className="flex items-center space-x-2 px-4 py-2 rounded-xl 
      bg-gradient-to-r from-blue-600/20 to-purple-600/20 
      border border-blue-500/30 
      backdrop-blur-md
      hover:from-blue-600/30 hover:to-purple-600/30 
      hover:border-blue-400/60
      transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
        <User className="w-4 h-4 text-white" />
      </div>

      {/* Name */}
      <span className="text-gray-200 font-medium">
        {user.fullName}
      </span>
    </button>

               {open && (
  <div className="absolute right-0 mt-3 w-48 
    bg-gray-900/80 backdrop-blur-xl 
    border border-blue-500/20 
    rounded-xl shadow-2xl p-2
    animate-fadeIn"
  >
    
    {/* Dashboard */}
    <button
      onClick={() => {
        navigate("/dashboard");
        setOpen(false);
      }}
      className="flex items-center w-full px-3 py-2 text-gray-300 
      hover:bg-blue-500/10 hover:text-blue-400 rounded-md transition"
    >
      <User className="w-4 h-4 mr-2" />
      Dashboard
    </button>

    {/* Divider */}
    <div className="border-t border-gray-700 my-1" />

    {/* Logout */}
    <button
      onClick={() => {
        logout();
        navigate("/");
      }}
      className="flex items-center w-full px-3 py-2 text-red-400 
      hover:bg-red-500/10 rounded-md transition"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </button>
  </div>
)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
