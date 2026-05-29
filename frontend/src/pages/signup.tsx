import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import Button from "../components/Button";
import { signUpUser } from "../services/auth";

const SignUp = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // ✅ added

  const passwordsMatch = password === confirmPass || confirmPass === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUpUser({
        fullName,
        email,
        password,
      });

      // ✅ show success message
      setSuccess("Account created successfully! Redirecting...");

      // ✅ delay + correct redirect
      setTimeout(() => {
        navigate("/signin");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to sign up");
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
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full pl-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

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
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              className={`w-full pl-10 py-3 bg-gray-900 rounded-xl text-white ${
                passwordsMatch
                  ? "border border-gray-700"
                  : "border border-red-500"
              }`}
            />
          </div>

          {/* Errors */}
          {!passwordsMatch && (
            <p className="text-red-400 text-sm text-center">
              Passwords do not match!
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          {/* ✅ SUCCESS MESSAGE */}
          {success && (
            <p className="text-green-400 text-sm text-center">
              {success}
            </p>
          )}

          <Button
            type="submit"
            className="w-full py-3"
            disabled={!passwordsMatch}
          >
            Create Account
          </Button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-400 cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;