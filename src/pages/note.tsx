import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNotes } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import CreateNoteForm from "@/components/ui/createNoteForm";
import { deleteNote } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateNote } from "@/lib/auth";
import { generateExplanation } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Notes() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const { isLoading, data, error } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted!");
    },
    onError: () => {
      toast.error("Failed to delete note.");
    },
  });

  type UpdateNotePayload = {
    id: string;
    title: string;
    content: string;
  };
  type Note = {
    id: string;
    title: string;
    content: string;
    explanation?: string;
    created_at: string;
  };

  const updateMutation = useMutation<void, Error, UpdateNotePayload>({
    mutationFn: ({ id, title, content }) => updateNote(id, { title, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note updated!");
    },
    onError: () => {
      toast.error("Failed to update note.");
    },
  });

  const updateExplanationMutation = useMutation({
    mutationFn: async ({
      id,
      explanation,
    }: {
      id: string;
      explanation: string;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ explanation })
        .eq("id", id);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const handleSelectNote = (noteId: string) => {
    // Toggle selection of the note
    setSelectedNoteId(selectedNoteId === noteId ? null : noteId);
  };

  const handleGenerateExplanation = async (note: Note) => {
    try {
      const explanation = await generateExplanation(note.title, note.content);

      updateExplanationMutation.mutate({
        id: note.id,
        explanation,
      });
    } catch (err) {
      console.error("Failed to generate or save explanation", err);
    }
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Notes</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add"}
          </Button>
        </div>
        {showForm && <CreateNoteForm />}

        {data?.notes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-20 space-y-6">
            <Image
              src="/empty.jpg"
              alt="No Notes"
              width={192}
              height={192}
              className="opacity-80"
              priority
            />
            <h2 className="text-2xl font-semibold text-gray-800">Welcome 👋</h2>
            <p className="text-gray-600 max-w-md">
              You don’t have any notes yet. Click the{" "}
              <span className="font-semibold">Add</span> button to start your
              first note!
            </p>
            <Button onClick={() => setShowForm(true)}>
              Create Your First Note
            </Button>
          </div>
        ) : (
          <>
            {selectedNoteId && (
              <div className="mt-8 p-4 border rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-bold">Note Details</h2>

                {data?.notes
                  ?.filter((note: Note) => note.id === selectedNoteId)
                  .map((note: Note) => (
                    <div key={note.id}>
                      <h3 className="text-xl font-semibold">{note.title}</h3>
                      <p className="text-sm text-gray-700">{note.content}</p>
                      {note.explanation && (
                        <div className="mt-4 p-2 bg-stone-100 rounded text-sm text-gray-800">
                          <strong>Explanation:</strong> {note.explanation}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </div>

                      <div className="mt-3 flex gap-4 text-sm">
                        <button
                          onClick={() => deleteMutation.mutate(note.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2 text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditTitle(note.title);
                            setEditContent(note.content);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {!note.explanation && (
                          <button
                            onClick={() => handleGenerateExplanation(note)}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm"
                          >
                            Generate Explanation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {data?.notes?.map((note: Note) => (
                <div
                  key={note.id}
                  className="border rounded-xl p-4 shadow-sm bg-white space-y-2"
                  onClick={() => handleSelectNote(note.id)}
                >
                  {editingNoteId === note.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateMutation.mutate({
                          id: note.id,
                          title: editTitle,
                          content: editContent,
                        });
                        setEditingNoteId(null);
                      }}
                      className="space-y-2"
                    >
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          type="button"
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-xl px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold">{note.title}</h2>
                      <p className="text-sm text-gray-700">{note.content}</p>
                      {note.explanation && (
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          <strong>Explanation:</strong> {note.explanation}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </div>
                      <div className="mt-3 flex gap-4 text-sm">
                        <button
                          onClick={() => deleteMutation.mutate(note.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditTitle(note.title);
                            setEditContent(note.content);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {!note.explanation && (
                          <button
                            onClick={() => handleGenerateExplanation(note)}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm"
                          >
                            Generate Explanation
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
