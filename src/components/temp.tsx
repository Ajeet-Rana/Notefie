"use client";
import { useRouter } from "next/router";

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
      const { data, error } =
        authType === "sign-up"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Additional check for sign-up success
      if (authType === "sign-up" && data?.user?.identities?.length === 0) {
        setErrorMessage("User already registered");
        return;
      }

      router.push("/note");
    } catch (error: unknown) {
      // Proper error typing
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-sm mx-auto"
      >
        <h2 className="text-xl font-semibold text-center">
          {authType === "sign-up" ? "Create Account" : "Welcome Back"}
        </h2>

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Processing..."
            : authType === "sign-up"
            ? "Sign Up"
            : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
