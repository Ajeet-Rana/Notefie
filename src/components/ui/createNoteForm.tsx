"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import { createNote } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { generateExplanation } from "@/lib/auth";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  explanation: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateNoteForm() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      explanation: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("User not logged in");
      setLoading(true);
      const note = await createNote({ ...data, user_id: user.id });
      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created!");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create note.");
    },
    onSettled: () => setLoading(false),
  });

  const handleGenerateExplanation = async () => {
    try {
      setGenerating(true);
      const title = form.getValues("title");
      const content = form.getValues("content");

      if (!title || !content) {
        toast.error("Please enter both title and content first.");
        return;
      }

      const explanation = await generateExplanation(title, content);
      form.setValue("explanation", explanation);
    } catch (err) {
      console.error("Failed to generate explanation", err);
      toast.error("AI failed to generate explanation.");
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 border rounded-xl p-4 bg-white shadow"
    >
      <Input placeholder="Title" {...form.register("title")} />
      <Textarea
        placeholder="Write your note..."
        rows={5}
        {...form.register("content")}
      />
      <Textarea
        placeholder="Write explanation or click 'Generate Explanation'"
        rows={4}
        {...form.register("explanation")}
      />
      <div className="flex gap-4">
        <Button
          type="button"
          onClick={handleGenerateExplanation}
          disabled={generating}
          variant="secondary"
        >
          {generating ? "Generating..." : "Generate Explanation"}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Note"}
        </Button>
      </div>
    </form>
  );
}
