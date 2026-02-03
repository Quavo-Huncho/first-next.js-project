"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Signed in successfully. Redirecting...");
      setTimeout(() => router.push("/"), 1200);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Enter your email to reset your password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Password reset link sent. Check your email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-white/70 mb-6">
          Sign in to your account
        </p>

        {errorMsg && (
          <p className="text-red-400 text-sm text-center mb-4">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-green-400 text-sm text-center mb-4">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-400"
          />

          <p
            onClick={handleForgotPassword}
            className="text-right text-sm text-blue-300 hover:text-blue-200 cursor-pointer"
          >
            Forgot password?
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-3 rounded-xl"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-6">
          Don&apos;t have an account?
          <Link
            href="/sign-up"
            className="text-blue-300 hover:text-blue-200 font-semibold ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
