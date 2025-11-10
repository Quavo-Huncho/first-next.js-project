"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setSuccessMsg(null);
      setLoading(false);
      return;
    }

    const currentUser = data.user;
    if (currentUser) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ id: currentUser.id, email: currentUser.email }]);

      if (insertError) {
        console.error("Error inserting user record:", insertError);
      }
    }

    setSuccessMsg("Account created! Please check your email to confirm.");
    setErrorMsg(null);
    setLoading(false);

    setTimeout(() => {
      router.push("/sign-in");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/80">Join the community and start learning today</p>
        </div>

        {errorMsg && <Alert message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />}
        {successMsg && <Alert message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />}

        <form onSubmit={handleSignUp} className="space-y-5">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            required
          />
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            required
          />

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-white/70 mt-6 text-sm">
          Already have an account?
          <Link
            href="/sign-in"
            className="text-blue-200 hover:text-white font-semibold transition-colors ml-1"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}