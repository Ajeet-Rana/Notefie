"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";

const authFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
  authType: "sign-in" | "sign-up";
}

export function AuthForm({ authType }: AuthFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    setErrorMessage("");
    const { email, password } = values;

    try {
      if (authType === "sign-up") {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data?.user?.identities?.length === 0) {
          setErrorMessage("User already registered");
          return;
        }

        router.push("/note");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("invalid login credentials")
          ) {
            router.push("/register");
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (!data.session || !data.user) {
          setErrorMessage("No user session found");
          return;
        }

        router.push("/note");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000/note`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {authType === "sign-up" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-500 text-sm">
          {authType === "sign-up"
            ? "Start your journey with us."
            : "Log in to continue."}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-zinc-800 rounded-xl"
            >
              {loading
                ? "Processing..."
                : authType === "sign-up"
                ? "Sign Up"
                : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-gray-300" />
          <span className="absolute bg-white px-3 text-gray-500 text-sm">
            OR
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center gap-2 justify-center"
        >
          <FcGoogle className="h-5 w-5" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
