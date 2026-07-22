import React, { useState, useEffect } from "react";
import { Camera, Trash2, Check, LoaderCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import UserIdentity, { getUserFullName } from "../../../components/user/UserIdentity";
import SettingsCard from "./SettingsCard";
import { isValidPhoneNumber } from "libphonenumber-js";
import COUNTRIES from "../../../constants/countries";

const ProfileSettings = () => {
  const { profile, user, session, updateProfile } = useAuth();
  const token = session?.access_token;
  
  const currentFullName = getUserFullName({ profile, user });
  
  const [form, setForm] = useState({
    fullName: currentFullName || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    country: profile?.country || "",
    bio: profile?.bio || "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (fileDataUrl) => {
    // Convert data URL to file blob for upload
    const res = await fetch(fileDataUrl);
    const blob = await res.blob();
    const formData = new FormData();
    formData.append("file", blob, "avatar.jpg");
    
    const response = await fetch("/api/upload/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) throw new Error("Avatar upload failed");
    const data = await response.json();
    return data.avatarUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (form.phone && !isValidPhoneNumber(form.phone)) {
      setError("Invalid phone number format. Please check the country and number.");
      return;
    }

    try {
      setLoading(true);
      let finalAvatarUrl = profile?.avatar_url;

      // Only upload if it's a new base64 image (not an existing URL)
      if (avatarPreview && avatarPreview.startsWith("data:")) {
        finalAvatarUrl = await handleAvatarUpload(avatarPreview);
      } else if (!avatarPreview) {
        finalAvatarUrl = null; // User removed their avatar
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          country: form.country,
          bio: form.bio,
          avatar: finalAvatarUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      
      // Update the context state globally
      if (updateProfile) await updateProfile(data.user);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                ? "h-20 w-20 shrink-0 rounded-full border border-border object-cover"
                : "flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent/15 text-2xl font-bold text-accent"
            }
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="my-transition inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-light hover:border-accent hover:text-white">
              <Camera size={14} />
              Upload new photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={loading} />
            </label>
            <button
              type="button"
              onClick={() => setAvatarPreview(null)}
              disabled={!avatarPreview || loading}
              className="my-transition inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Personal Information" description="Update your name and contact details.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="John DOe"
              disabled={loading}
              className="my-transition w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Email Address</label>
            <input
              type="email"
              value={form.email}
              disabled
              placeholder="JohnDoe01.com"
              className="w-full cursor-not-allowed rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text opacity-60 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="1234567890"
              disabled={loading}
              className="my-transition w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Country</label>
            <select
              value={form.country}
              onChange={update("country")}
              disabled={loading}
              className="my-transition w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent disabled:opacity-60 [&>option]:bg-surface"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
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
              disabled={loading}
              className="my-transition w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent placeholder:text-text-muted/50 disabled:opacity-60"
            />
          </div>
        </div>
      </SettingsCard>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success animate-in fade-in">
            <Check size={14} />
            Changes saved
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="my-transition flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileSettings;