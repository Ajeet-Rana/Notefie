import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import { useNotes } from "@/hooks/useNotes";
import LogoutButton from "@/components/logoutButton";
import NoteCard from "@/components/noteCard";

export default function NotesPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const { data: notes, isLoading } = useNotes(user?.id || "");

  if (loading || isLoading || !user)
    return <p className="text-center mt-20">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Notes</h1>
      <LogoutButton />
      <div className="space-y-4">
        {notes?.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </main>
  );
}
