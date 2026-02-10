"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ProfileResponse } from "@/lib/api-types";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [petName, setPetName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()) as Promise<ProfileResponse>,
      fetch("/api/pet").then((r) => (r.ok ? r.json() : Promise.resolve({ petName: null }))) as Promise<{ petName: string | null }>,
    ])
      .then(([profileData, petData]) => {
        if (profileData.displayName != null) setDisplayName(profileData.displayName);
        if (profileData.birthday) setBirthday(profileData.birthday);
        if (petData?.petName != null) setPetName(petData.petName);
      })
      .catch(() => setMessage("error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const [profileRes, petRes] = await Promise.all([
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: displayName.trim() || null,
            birthday: birthday || null,
          }),
        }),
        fetch("/api/pet", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            petName: petName.trim() ? petName.trim().slice(0, 50) : null,
          }),
        }),
      ]);
      if (!profileRes.ok) throw new Error();
      if (!petRes.ok) throw new Error();
      setMessage("saved");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading profile…</div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
      <p className="text-gray-600 mb-6">
        Set the name your penguin will call you and your birthday so it can
        remember and celebrate with you!
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message === "saved" && (
          <p className="text-sm text-green-600 bg-mint-100 rounded-lg px-3 py-2">
            Profile saved!
          </p>
        )}
        {message === "error" && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            Could not save. Try again.
          </p>
        )}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your name (what the penguin calls you)
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-ice-200 bg-white focus:ring-2 focus:ring-ice-400 focus:border-ice-400 outline-none transition"
            placeholder="e.g. Emma"
          />
        </div>
        <div>
          <label
            htmlFor="birthday"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birthday
          </label>
          <input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-ice-200 bg-white focus:ring-2 focus:ring-ice-400 focus:border-ice-400 outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="petName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your penguin&apos;s name
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-2 rounded-xl border border-ice-200 bg-white focus:ring-2 focus:ring-ice-400 focus:border-ice-400 outline-none transition"
            placeholder="e.g. Pingu"
          />
          <p className="text-xs text-gray-500 mt-0.5">Optional. Shown on the dashboard.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-ice-500 text-white font-medium hover:bg-ice-600 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
      <p className="text-center mt-6">
        <Link href="/dashboard" className="text-ice-500 hover:underline text-sm">
          Back to your penguin
        </Link>
      </p>
    </div>
  );
}
