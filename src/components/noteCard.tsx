type Note = {
  id: string;
  title: string;
  content: string;
  explanation?: string;
  created_at: string;
};

export default function NoteCard({ note }: { note: Note }) {
  return (
    <div className="p-4 border rounded-xl shadow-md">
      <h3 className="text-xl font-semibold">{note.title}</h3>
      <p className="mt-2">{note.content}</p>
      <p className="mt-4 text-sm text-gray-500">
        {note.explanation || "No explanation yet"}
      </p>
    </div>
  );
}
