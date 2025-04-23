"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp) {
        alert("Check your email for confirmation.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? "Already have an account?" : "Create a new account"}
      </Button>
    </div>
  );
}
