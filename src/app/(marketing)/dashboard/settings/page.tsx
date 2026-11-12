"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParentSpaceSubHeader } from "@/components/parent/ParentSpaceSubHeader";
import { ParentSpaceService, ParentSettingsResponse } from "@/services/parent-space.service";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type SettingsTab = "profiles" | "account" | "pin" | "notifications" | "privacy";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "profiles", label: "Learner profiles" },
  { id: "account", label: "Your account" },
  { id: "pin", label: "Parent PIN" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy & her data" },
];

const AGES = ["9", "10", "11", "12", "13", "14", "15+"];

export default function ParentSettingsPage() {
  const router = useRouter();
  const { clearAuth, setLearners } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ParentSettingsResponse | null>(null);
  const [tab, setTab] = useState<SettingsTab>("profiles");

  // Learner edit state
  const [editingLearnerId, setEditingLearnerId] = useState<string | null>(null);
  const [editKidName, setEditKidName] = useState("");
  const [editKidAge, setEditKidAge] = useState("11");
  const [savingLearner, setSavingLearner] = useState(false);

  // Account edit state
  const [displayName, setDisplayName] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // PIN change state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  // Delete confirmation state
  const [deletingLearnerId, setDeletingLearnerId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ParentSpaceService.getSettings();
      setSettings(res);
      setDisplayName(res.profile?.displayName || "");
      setInvoiceEmail(res.parentEmail || res.email || "");
      if (res.learners) {
        setLearners(
          res.learners.map((l) => ({
            id: l.id,
            name: l.name,
            age: l.age,
            completedLessons: l.completedLessons,
          }))
        );
      }
    } catch {
      toast.error("Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, [setLearners]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const primaryLearner = settings?.learners?.[0];

  const handleSaveLearner = async (learnerId: string) => {
    if (!editKidName.trim()) return;
    setSavingLearner(true);
    try {
      await ParentSpaceService.updateLearner(learnerId, {
        name: editKidName.trim(),
        age: editKidAge,
      });
      await loadSettings();
      setEditingLearnerId(null);
      toast.success("Learner profile updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update learner.");
    } finally {
      setSavingLearner(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const updated = await ParentSpaceService.updateSettings({
        displayName: displayName.trim(),
        email: invoiceEmail.trim(),
      });
      setSettings(updated);
      toast.success("Account details saved!");
    } catch (err: any) {
      toast.error(err?.message || "Could not save account details.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      toast.error("New PIN must be 4 digits.");
      return;
    }
    setSavingPin(true);
    try {
      await ParentSpaceService.changePin(currentPin, newPin);
      setCurrentPin("");
      setNewPin("");
      toast.success("Parent PIN updated!");
    } catch (err: any) {
      toast.error(err?.message || "Could not update PIN.");
    } finally {
      setSavingPin(false);
    }
  };

  const handleToggleSetting = async (field: keyof ParentSettingsResponse, nextVal: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: nextVal });
    try {
      const updated = await ParentSpaceService.updateSettings({ [field]: nextVal } as any);
      setSettings(updated);
    } catch {
      toast.error("Could not save preference.");
      loadSettings();
    }
  };

  const handleDownloadData = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infano-profile-${primaryLearner?.name || "data"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data summary downloaded!");
  };

  const handleClearHealth = async () => {
    if (!primaryLearner) return;
    try {
      await ParentSpaceService.clearLearnerHealthAnswers(primaryLearner.id);
      toast.success("Optional health answers removed.");
      loadSettings();
    } catch {
      toast.error("Could not remove health answers.");
    }
  };

  const handleDeleteProfile = async (learnerId: string) => {
    try {
      await ParentSpaceService.deleteLearner(learnerId);
      setDeletingLearnerId(null);
      setDeleteConfirmText("");
      toast.success("Profile removed.");
      loadSettings();
    } catch {
      toast.error("Could not delete profile.");
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      <ParentSpaceSubHeader />

      <main className="max-w-[1080px] mx-auto px-4 sm:px-5 py-7 sm:py-9 flex flex-col gap-6">
        <h1 className="m-0 font-extrabold text-2xl sm:text-4xl tracking-tight text-[#3D2C4A]">
          Settings
        </h1>

        {loading || !settings ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#C2456A]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Sidebar Tabs (Desktop) / Wrap Pills (Mobile) */}
            <div
              role="tablist"
              aria-label="Settings sections"
              className="lg:col-span-3 flex flex-row lg:flex-col flex-wrap gap-1.5"
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`text-left min-h-[46px] px-4 rounded-2xl text-sm font-semibold cursor-pointer transition-colors ${
                      active
                        ? "bg-[#3D2C4A] text-white"
                        : "bg-white lg:bg-transparent text-[#3D2C4A] hover:bg-white"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="lg:mt-3 min-h-[44px] px-4 text-left font-bold text-sm text-[#A8365A] hover:underline cursor-pointer"
              >
                Log out
              </button>
            </div>

            {/* Right Tab Panel */}
            <section
              role="tabpanel"
              className="lg:col-span-9 bg-white border border-[#F1E4E8] rounded-[24px] p-5 sm:p-7 flex flex-col gap-5 shadow-2xs"
            >
              {/* TAB 1: LEARNER PROFILES */}
              {tab === "profiles" && (
                <div className="flex flex-col gap-4 animate-in fade-in">
                  <div>
                    <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Learner profiles</h2>
                    <p className="mt-0.5 mb-0 text-sm text-[#5E4B6B]">
                      Your account can hold her and one sister, at no extra cost.
                    </p>
                  </div>

                  {settings.learners.map((kid) => {
                    const isEditing = editingLearnerId === kid.id;
                    return (
                      <div key={kid.id} className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3.5 bg-[#FDEFF0] rounded-[20px] p-4">
                          <svg width="58" height="58" viewBox="0 0 80 80" aria-hidden="true" className="shrink-0">
                            <circle cx="40" cy="40" r="40" fill="#F9D5D3" />
                            <circle cx="40" cy="36" r="22" fill="#3D2C4A" />
                            <circle cx="21" cy="20" r="8" fill="#3D2C4A" />
                            <circle cx="59" cy="20" r="8" fill="#3D2C4A" />
                            <circle cx="40" cy="42" r="16" fill="#D9A07E" />
                            <circle cx="34" cy="42" r="2" fill="#3D2C4A" />
                            <circle cx="46" cy="42" r="2" fill="#3D2C4A" />
                            <path d="M35 49 Q40 53 45 49" stroke="#3D2C4A" strokeWidth="2" fill="none" strokeLinecap="round" />
                          </svg>
                          <div className="flex-1 min-w-[160px]">
                            <div className="font-bold text-lg text-[#3D2C4A]">{kid.name}</div>
                            <div className="text-xs sm:text-sm text-[#5E4B6B]">
                              Age {kid.age} · {(kid.completedLessons || []).length} of 15 lessons
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingLearnerId(null);
                              } else {
                                setEditingLearnerId(kid.id);
                                setEditKidName(kid.name);
                                setEditKidAge(kid.age || "11");
                              }
                            }}
                            className="min-h-[42px] px-4 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-xs sm:text-sm cursor-pointer"
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                        </div>

                        {isEditing && (
                          <div className="border-2 border-dashed border-[#EBD9E2] rounded-[20px] p-4 flex flex-col gap-3 animate-in fade-in">
                            <label className="flex flex-col gap-1.5 text-sm font-semibold">
                              First name or nickname
                              <input
                                type="text"
                                value={editKidName}
                                onChange={(e) => setEditKidName(e.target.value)}
                                className="min-h-[46px] rounded-xl border border-[#E9DDE6] px-3 text-base"
                              />
                            </label>
                            <div className="text-sm font-semibold">Age</div>
                            <div className="flex flex-wrap gap-1.5">
                              {AGES.map((a) => (
                                <button
                                  key={a}
                                  type="button"
                                  onClick={() => setEditKidAge(a)}
                                  className={`min-w-[46px] min-h-[42px] rounded-xl font-bold text-sm cursor-pointer border ${
                                    editKidAge === a
                                      ? "bg-[#3D2C4A] text-white border-[#3D2C4A]"
                                      : "bg-white text-[#3D2C4A] border-[#E9DDE6]"
                                  }`}
                                >
                                  {a}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              disabled={savingLearner}
                              onClick={() => handleSaveLearner(kid.id)}
                              className="self-start min-h-[44px] px-5 rounded-full bg-[#C2456A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                            >
                              {savingLearner ? "Saving..." : "Save profile"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    href="/dashboard/picker"
                    className="flex items-center gap-3 border-2 border-dashed border-[#D9C3CF] hover:border-[#C2456A] rounded-[20px] p-4 text-[#3D2C4A] transition-colors"
                  >
                    <span className="w-11 h-11 rounded-full bg-[#FDEFF0] grid place-items-center text-2xl text-[#A8365A] shrink-0">
                      +
                    </span>
                    <span>
                      <strong className="block font-bold text-sm sm:text-base">Add her sister</strong>
                      <span className="text-xs sm:text-sm text-[#5E4B6B]">
                        Her own garden, badges and private journal. No extra cost.
                      </span>
                    </span>
                  </Link>
                </div>
              )}

              {/* TAB 2: YOUR ACCOUNT */}
              {tab === "account" && (
                <form onSubmit={handleSaveAccount} className="flex flex-col gap-4 animate-in fade-in">
                  <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Your account</h2>

                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    Your name
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="min-h-[48px] rounded-xl border border-[#E9DDE6] px-3 text-base"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    Email for invoices
                    <input
                      type="email"
                      value={invoiceEmail}
                      onChange={(e) => setInvoiceEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="min-h-[48px] rounded-xl border border-[#E9DDE6] px-3 text-base"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBF8F6] rounded-2xl p-4">
                    <div>
                      <span className="block text-sm font-semibold text-[#3D2C4A]">
                        Mobile number (your login)
                      </span>
                      <span className="text-sm text-[#5E4B6B]">
                        {settings.phone || "Registered"} · verified
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAccount}
                    className="self-start min-h-[46px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingAccount ? "Saving..." : "Save changes"}
                  </button>
                </form>
              )}

              {/* TAB 3: PARENT PIN */}
              {tab === "pin" && (
                <form onSubmit={handleChangePin} className="flex flex-col gap-4 animate-in fade-in">
                  <div>
                    <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Parent PIN</h2>
                    <p className="mt-0.5 mb-0 text-sm text-[#5E4B6B]">
                      Keeps your Parent space, billing and settings just for you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Current PIN
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="min-h-[48px] rounded-xl border border-[#E9DDE6] px-3 text-lg tracking-[0.4em]"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      New PIN
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="min-h-[48px] rounded-xl border border-[#E9DDE6] px-3 text-lg tracking-[0.4em]"
                      />
                    </label>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Ask for the PIN</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "always" as const, label: "Every time I open Parent space" },
                        { id: "every_24h" as const, label: "Once every 24 hours" },
                      ].map((m) => {
                        const on = settings.pinAskMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleSetting("pinAskMode", m.id)}
                            className={`min-h-[42px] px-4 rounded-full text-sm font-semibold cursor-pointer border ${
                              on
                                ? "bg-[#3D2C4A] text-white border-[#3D2C4A]"
                                : "bg-white text-[#3D2C4A] border-[#E9DDE6]"
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPin}
                    className="self-start min-h-[46px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                  >
                    {savingPin ? "Updating..." : "Update PIN"}
                  </button>
                </form>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {tab === "notifications" && (
                <div className="flex flex-col gap-1 animate-in fade-in">
                  <h2 className="m-0 mb-2 text-xl font-bold text-[#3D2C4A]">Notifications</h2>
                  {[
                    {
                      field: "whatsappWeeklySummary" as const,
                      title: "Weekly progress summary",
                      sub: "Every Sunday on WhatsApp: lessons done and Kitchen Table Talk.",
                    },
                    {
                      field: "whatsappLessonNudge" as const,
                      title: "Gentle lesson reminders",
                      sub: "A warm nudge if she pauses for a few days.",
                    },
                    {
                      field: "notifyOrderUpdates" as const,
                      title: "Gigi book delivery updates",
                      sub: "Shipping, out-for-delivery and delivery confirmations.",
                    },
                    {
                      field: "marketingOptIn" as const,
                      title: "New guides & parent tips",
                      sub: "Occasional articles from our adolescent health team.",
                    },
                  ].map((item) => {
                    const checked = Boolean(settings[item.field]);
                    return (
                      <div
                        key={item.field}
                        className="flex items-center justify-between gap-4 py-3.5 border-b border-[#F3E9EE] last:border-b-0"
                      >
                        <div>
                          <span className="block font-semibold text-sm sm:text-base text-[#3D2C4A]">
                            {item.title}
                          </span>
                          <span className="block text-xs sm:text-sm text-[#5E4B6B]">{item.sub}</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          onClick={() => handleToggleSetting(item.field, !checked)}
                          className={`shrink-0 w-[52px] h-[30px] rounded-full p-0.5 flex items-center cursor-pointer transition-colors ${
                            checked ? "bg-[#2F7F62] justify-end" : "bg-[#D9C8D3] justify-start"
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full bg-white shadow-xs" />
                        </button>
                      </div>
                    );
                  })}
                  <p className="mt-3 mb-0 text-xs sm:text-sm text-[#5E4B6B]">
                    Payment and security messages are always sent.
                  </p>
                </div>
              )}

              {/* TAB 5: PRIVACY & HER DATA */}
              {tab === "privacy" && (
                <div className="flex flex-col gap-4 animate-in fade-in">
                  <div>
                    <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Privacy &amp; her data</h2>
                    <p className="mt-0.5 mb-0 text-sm text-[#5E4B6B]">
                      You&apos;re in control. We never sell data or show ads.
                    </p>
                  </div>

                  <div className="bg-[#EAF7F1] rounded-2xl p-4 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="block font-bold text-sm text-[#3D2C4A]">
                        Parental consent given
                      </span>
                      <span className="text-xs sm:text-sm text-[#24533F]">
                        {new Date(settings.coppaConsentAt || settings.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · by {settings.profile?.displayName || "Parent"}
                      </span>
                    </div>
                    <Link href="/legal" className="text-xs sm:text-sm font-bold text-[#24735A] hover:underline">
                      View privacy policy
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1">
                    <div>
                      <span className="block font-semibold text-sm sm:text-base text-[#3D2C4A]">
                        Help improve the course
                      </span>
                      <span className="block text-xs sm:text-sm text-[#5E4B6B]">
                        Use anonymised, combined quiz results.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.improveCourseOptIn}
                      onClick={() => handleToggleSetting("improveCourseOptIn", !settings.improveCourseOptIn)}
                      className={`shrink-0 w-[52px] h-[30px] rounded-full p-0.5 flex items-center cursor-pointer transition-colors ${
                        settings.improveCourseOptIn ? "bg-[#2F7F62] justify-end" : "bg-[#D9C8D3] justify-start"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadData}
                      className="text-left border border-[#E9DDE6] hover:border-[#3D2C4A] bg-white rounded-2xl p-4 cursor-pointer transition-colors"
                    >
                      <span className="block font-bold text-sm text-[#3D2C4A]">Download her data</span>
                      <span className="block text-xs text-[#5E4B6B] mt-0.5">
                        A JSON copy of her profile and progress.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearHealth}
                      className="text-left border border-[#E9DDE6] hover:border-[#3D2C4A] bg-white rounded-2xl p-4 cursor-pointer transition-colors"
                    >
                      <span className="block font-bold text-sm text-[#3D2C4A]">Remove health answers</span>
                      <span className="block text-xs text-[#5E4B6B] mt-0.5">
                        Deletes optional period onboarding answers right away.
                      </span>
                    </button>
                  </div>

                  {primaryLearner && (
                    <div className="border border-[#F2C9CF] rounded-2xl p-4 flex flex-col gap-3">
                      <div className="font-bold text-sm sm:text-base text-[#3D2C4A]">
                        Delete {primaryLearner.name}&apos;s profile and data
                      </div>
                      <p className="m-0 text-xs sm:text-sm text-[#5E4B6B]">
                        Removes her garden, progress, journal and diary. Your purchase stays; you can create a fresh profile anytime.
                      </p>
                      {deletingLearnerId !== primaryLearner.id ? (
                        <button
                          type="button"
                          onClick={() => setDeletingLearnerId(primaryLearner.id)}
                          className="self-start min-h-[42px] px-4 rounded-full border-2 border-[#A8365A] text-[#A8365A] font-bold text-xs sm:text-sm cursor-pointer hover:bg-[#FDEFF0]"
                        >
                          Delete profile…
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2.5 animate-in fade-in">
                          <label className="text-xs sm:text-sm font-semibold">
                            Type <strong>{primaryLearner.name}</strong> to confirm:
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              className="mt-1.5 w-full min-h-[42px] rounded-xl border border-[#E9DDE6] px-3"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={deleteConfirmText !== primaryLearner.name}
                              onClick={() => handleDeleteProfile(primaryLearner.id)}
                              className="min-h-[42px] px-4 rounded-full bg-[#A8365A] text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-40"
                            >
                              Confirm delete
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingLearnerId(null);
                                setDeleteConfirmText("");
                              }}
                              className="min-h-[42px] px-4 rounded-full text-xs sm:text-sm font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

