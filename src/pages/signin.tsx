import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import Button from "../components/Button";
import { signInUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // ✅ FIXED

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await signInUser({ email, password });

      // save user
      login(res.user);

      // show success message
      setSuccess("Login successful! Redirecting...");

      // delay redirect (better UX)
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {success && (
            <p className="text-green-400 text-sm text-center">
              {success}
            </p>
          )}

          <Button type="submit" className="w-full py-3">
            Sign In
          </Button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-400 cursor-pointer"
          >
            Create one
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignIn;