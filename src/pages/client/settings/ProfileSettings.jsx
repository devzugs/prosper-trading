import React, { useState } from "react";
import { Camera, Trash2, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import UserIdentity, { getUserFullName } from "../../../components/user/UserIdentity";
import SettingsCard from "./SettingsCard";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Germany", "France",
  "Australia", "Singapore", "United Arab Emirates", "Nigeria", "South Africa",
];

const ProfileSettings = () => {
  const { profile, user } = useAuth();
  const currentFullName = getUserFullName({ profile, user });
  const [form, setForm] = useState({
    fullName: currentFullName,
    email: user?.email || "",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <SettingsCard title="Profile Photo" description="This is displayed on your account and to support staff.">
        <div className="flex items-center gap-5">
          <UserIdentity
            variant="avatar"
            name={form.fullName}
            avatarSrc={avatarPreview}
            imageAlt="Avatar preview"
            className={
              avatarPreview
                ? "w-20 h-20 rounded-full object-cover shrink-0 border border-border"
                : "w-20 h-20 rounded-full bg-accent/15 text-accent flex items-center justify-center text-2xl font-bold shrink-0"
            }
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-light cursor-pointer hover:border-accent hover:text-white my-transition">
              <Camera size={14} />
              Upload new photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            <button
              type="button"
              onClick={() => setAvatarPreview(null)}
              disabled={!avatarPreview}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted hover:border-danger/40 hover:text-danger my-transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Personal Information" description="Update your name and contact details.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update("fullName")}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Country</label>
            <select
              value={form.country}
              onChange={update("country")}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent [&>option]:bg-surface"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-text-light">Bio (optional)</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={update("bio")}
              placeholder="Tell us a little about yourself"
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent placeholder:text-text-muted/50"
            />
          </div>
        </div>
      </SettingsCard>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <Check size={14} />
            Changes saved
          </span>
        )}
        <button
          type="submit"
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ProfileSettings;
