import { supabase } from "./supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}

export async function getNotes() {
  const { user, error: authError } = await getCurrentUser();

  if (authError || !user) {
    return {
      notes: [],
      error: authError || new Error("User not authenticated"),
    };
  }

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return { notes, error };
}
export const createNote = async ({
  title,
  content,
  user_id,
  explanation,
}: {
  title: string;
  content: string;
  user_id: string;
  explanation?: string;
}) => {
  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        title,
        content,
        user_id,
        explanation: explanation ?? null,
        created_at: new Date(),
      },
    ])
    .single();

  if (error) {
    throw new Error(`Error creating note: ${error.message}`);
  }

  return data;
};

export async function deleteNote(noteId: string) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}

export async function updateNote(
  noteId: string,
  data: { title: string; content: string }
) {
  const { error } = await supabase
    .from("notes")
    .update({ title: data.title, content: data.content })
    .eq("id", noteId);

  if (error) throw error;
}

export async function generateExplanation(title: string, content: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });

  const prompt = `Explain the following note in simple terms:\nTitle: ${title}\nContent: ${content}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function updateNoteExplanation(
  noteId: string,
  explanation: string
) {
  const { error } = await supabase
    .from("notes")
    .update({ explanation })
    .eq("id", noteId);

  if (error) throw new Error(error.message);
}
