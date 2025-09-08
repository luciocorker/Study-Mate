import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export const AddExamForm = ({ userId, onExamAdded }) => {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("exams").insert({
      user_id: userId,
      subject,
      date,
      type,
      priority,
      study_progress: 0
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Exam added!", description: "Your exam was saved." });
      setSubject(""); setDate(""); setType(""); setPriority("medium");
      if (onExamAdded) onExamAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Subject</Label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} required />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <Label>Type</Label>
        <Input value={type} onChange={e => setType(e.target.value)} required />
      </div>
      <div>
        <Label>Priority</Label>
        <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border rounded px-2 py-1">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Exam"}</Button>
    </form>
  );
};
