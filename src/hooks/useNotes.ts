import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export async function fetchNotes(userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export function useNotes(userId: string) {
  return useQuery({
    queryKey: ["notes", userId],
    queryFn: () => fetchNotes(userId),
    enabled: !!userId,
  });
}
