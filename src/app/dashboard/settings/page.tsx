"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

interface Program {
  id: string;
  name: string;
  stampsRequired: number;
  rewardText: string;
  cardColor: string;
  textColor: string;
}

export default function SettingsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editing, setEditing] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => {
        setPrograms(data.programs || []);
        if (data.programs?.length > 0) setEditing(data.programs[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSuccess("");

    try {
      const res = await fetch(`/api/programs/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        setSuccess("Settings saved!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!editing) {
    return <p className="text-foreground/50">No program to edit. Create one first.</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Program Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        {success && (
          <div className="text-sm text-success bg-success/10 px-3 py-2 rounded-lg">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Program name</label>
          <input
            type="text"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Stamps required</label>
          <input
            type="number"
            min="2"
            max="50"
            value={editing.stampsRequired}
            onChange={(e) => setEditing({ ...editing, stampsRequired: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Reward text</label>
          <input
            type="text"
            value={editing.rewardText}
            onChange={(e) => setEditing({ ...editing, rewardText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Card color</label>
          <input
            type="color"
            value={editing.cardColor}
            onChange={(e) => setEditing({ ...editing, cardColor: e.target.value })}
            className="w-16 h-10 rounded-lg border border-foreground/15 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
