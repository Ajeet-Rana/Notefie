import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import AuthForm from "@/components/authForm";

export default function LoginPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/notes"); // Redirect if already logged in
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4 border rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Welcome to Notefie
        </h1>
        <AuthForm />
      </div>
    </main>
  );
}
