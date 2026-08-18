"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Save,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Sparkles,
  Camera,
  Layers,
  MessageSquare,
  Aperture,
  CheckCircle2,
  AlertCircle,
  Home,
  FileText,
  Settings as SettingsIcon,
  Calendar,
  Film,
  Plus,
  PlusCircle,
  X,
  RefreshCw,
  PlusSquare,
  TrendingUp,
  UserCheck,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import BookingManager from "@/components/admin/BookingManager";
import CrewManager from "@/components/admin/CrewManager";

// Interfaces matching Mongoose Models
interface Slide {
  _id?: string;
  image: string;
  tag: string;
  title: string;
  layoutClass: string;
  tagClass: string;
  positionClass: string;
}

interface Gallery {
  _id?: string;
  couple: string;
  location: string;
  date: string;
  quote: string;
  storySnippet: string;
  heroImage: string;
  images: string[];
  galleryPreview: string[];
  featured: boolean;
  hidden: boolean;
}

interface Review {
  _id?: string;
  names: string;
  venue: string;
  quote: string;
  rating: number;
  approved: boolean;
  hidden: boolean;
}

interface Booking {
  _id?: string;
  brideName: string;
  groomName: string;
  phone: string;
  email: string;
  weddingDate: string;
  venue: string;
  package: string;
  budget: string;
  notes?: string;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

interface Contact {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "resolved";
  createdAt: string;
}

interface Settings {
  heroTitle: string;
  heroSubtitle: string;
  heroVideo: string;
  logo: string;
  instagramUrl: string;
  whatsappNumber: string;
  contactEmail: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "slides" | "stories" | "reviews" | "bookings" | "crew" | "contacts" | "settings"
  >("slides");

  // DB States
  const [slides, setSlides] = useState<Slide[]>([]);
  const [stories, setStories] = useState<Gallery[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<Settings>({
    heroTitle: "",
    heroSubtitle: "",
    heroVideo: "",
    logo: "",
    instagramUrl: "",
    whatsappNumber: "",
    contactEmail: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modal / Editing states
  const [editingStory, setEditingStory] = useState<Partial<Gallery> | null>(null);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            fetchAllData();
          } else {
            router.push("/admin/login");
          }
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        router.push("/admin/login");
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success("Welcome back, director!");
        setIsAuthenticated(true);
        fetchAllData();
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid username or password");
      }
    } catch (error) {
      setLoginError("Failed to connect to authentication server");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Logged out successfully");
        setIsAuthenticated(false);
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      toast.error("Logout request failed");
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch slides
      const resSlides = await fetch("/api/slides");
      if (resSlides.ok) setSlides(await resSlides.json());

      // 2. Fetch galleries/stories
      const resStories = await fetch("/api/galleries");
      if (resStories.ok) setStories(await resStories.json());

      // 3. Fetch reviews
      const resReviews = await fetch("/api/reviews");
      if (resReviews.ok) setReviews(await resReviews.json());

      // 4. Fetch bookings
      const resBookings = await fetch("/api/bookings");
      if (resBookings.ok) setBookings(await resBookings.json());

      // 5. Fetch contacts
      const resContacts = await fetch("/api/contacts");
      if (resContacts.ok) setContacts(await resContacts.json());

      // 6. Fetch settings
      const resSettings = await fetch("/api/settings");
      if (resSettings.ok) setSettings(await resSettings.json());

    } catch (error) {
      toast.error("Failed to load CMS data collections.");
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload helper using secure Cloudinary API route
  const uploadImage = async (file: File, folder: string = "kopiko"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading asset...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Asset upload failed");
      }

      const data = await res.json();
      toast.dismiss(loadingToast);
      toast.success("Asset uploaded successfully!");
      return data.url;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Asset upload failed.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // ----------------------------------------------------
  // SLIDES CRUD HANDLERS
  // ----------------------------------------------------
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide || !editingSlide.image || !editingSlide.tag || !editingSlide.title) {
      toast.error("Please fill in all slide details.");
      return;
    }

    try {
      const isNew = !editingSlide._id;
      const url = isNew ? "/api/slides" : `/api/slides/${editingSlide._id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });

      if (res.ok) {
        toast.success(isNew ? "Slide created successfully!" : "Slide updated successfully!");
        setEditingSlide(null);
        fetchAllData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save slide.");
      }
    } catch (error) {
      toast.error("Failed to save slide due to connection error.");
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const res = await fetch(`/api/slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Slide deleted successfully");
        fetchAllData();
      } else {
        toast.error("Failed to delete slide.");
      }
    } catch (error) {
      toast.error("Delete request failed.");
    }
  };

  // ----------------------------------------------------
  // STORIES (GALLERIES) CRUD HANDLERS
  // ----------------------------------------------------
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editingStory.couple || !editingStory.location || !editingStory.date || !editingStory.heroImage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const isNew = !editingStory._id;
      const url = isNew ? "/api/galleries" : `/api/galleries/${editingStory._id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStory),
      });

      if (res.ok) {
        toast.success(isNew ? "Story created successfully!" : "Story updated successfully!");
        setEditingStory(null);
        fetchAllData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save story.");
      }
    } catch (error) {
      toast.error("Failed to save story due to connection error.");
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this love story?")) return;

    try {
      const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Love story deleted");
        fetchAllData();
      } else {
        toast.error("Failed to delete story.");
      }
    } catch (error) {
      toast.error("Delete request failed.");
    }
  };

  // ----------------------------------------------------
  // REVIEWS HANDLERS
  // ----------------------------------------------------
  const handleToggleReviewVisibility = async (review: Review) => {
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !review.hidden }),
      });
      if (res.ok) {
        toast.success(review.hidden ? "Review is now visible" : "Review has been hidden");
        fetchAllData();
      } else {
        toast.error("Failed to update review visibility.");
      }
    } catch (error) {
      toast.error("Request failed.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        fetchAllData();
      } else {
        toast.error("Failed to delete review.");
      }
    } catch (error) {
      toast.error("Delete request failed.");
    }
  };

  // ----------------------------------------------------
  // BOOKINGS HANDLERS
  // ----------------------------------------------------
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Booking status updated to ${status}`);
        fetchAllData();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("Request failed.");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Delete this booking inquiry?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Booking inquiry deleted");
        fetchAllData();
      } else {
        toast.error("Failed to delete booking.");
      }
    } catch (error) {
      toast.error("Request failed.");
    }
  };

  // ----------------------------------------------------
  // CONTACTS HANDLERS
  // ----------------------------------------------------
  const handleUpdateContactStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Inquiry status updated to ${status}`);
        fetchAllData();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("Request failed.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Delete this contact inquiry?")) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Contact inquiry deleted");
        fetchAllData();
      } else {
        toast.error("Failed to delete contact.");
      }
    } catch (error) {
      toast.error("Request failed.");
    }
  };

  // ----------------------------------------------------
  // SETTINGS HANDLERS
  // ----------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Global site settings updated successfully!");
        fetchAllData();
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      toast.error("Failed to save settings due to connection error.");
    }
  };

  // ----------------------------------------------------
  // RENDER LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2d2a24] flex flex-col justify-center items-center p-6 text-white selection:bg-amber-300 selection:text-zinc-900">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs uppercase tracking-widest text-zinc-300 hover:text-white"
        >
          <Home className="w-3.5 h-3.5" /> Home Page
        </Link>

        <div className="w-full max-w-md bg-[#464239] rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-amber-200/10 border border-amber-200/35 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-amber-200" />
          </div>

          <h1 className="font-serif-primary text-3xl font-light text-amber-100 text-center mb-2">
            Studio CMS Portal
          </h1>
          <p className="font-sans-clean text-xs text-zinc-300 text-center mb-8 tracking-wider uppercase font-light">
            Authorized Directors Access Only
          </p>

          {loginError && (
            <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2 mb-6 animate-pulse-slow">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-amber-200 font-semibold font-sans-clean">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="kopiko_wedd"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-black/25 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-sm transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-amber-200 font-semibold font-sans-clean">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-black/25 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 mt-2 rounded-xl bg-amber-300 hover:bg-amber-200 disabled:bg-amber-300/40 text-zinc-950 font-semibold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Vows...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="text-[11px] uppercase tracking-widest text-zinc-400 hover:text-amber-200 transition-colors mt-8 font-sans-clean"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER CMS CONTROL BOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#2d2a24] text-white flex flex-col selection:bg-amber-300 selection:text-zinc-900 font-sans-clean">
      {/* Persistent Nav Header */}
      <header className="sticky top-0 z-40 bg-[#464239] border-b border-white/10 px-6 md:px-12 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-200/10 border border-amber-200/30 flex items-center justify-center">
            <Aperture className="w-5 h-5 text-amber-200 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-serif-primary text-xl font-light text-amber-100 leading-none">
              KOPIKO Studio
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-amber-200/60 font-semibold mt-0.5 block">
              Control Panel CMS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 text-zinc-300 hover:text-white"
          >
            <Home className="w-3.5 h-3.5" /> View Home
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/25 text-red-200 hover:bg-red-500/20 text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> End Session
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-2.5">
          <button
            onClick={() => setActiveTab("slides")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
              activeTab === "slides"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Viewfinder Slides</span>
          </button>

          <button
            onClick={() => setActiveTab("stories")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
              activeTab === "stories"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Love Stories</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
              activeTab === "reviews"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Story Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 relative ${
              activeTab === "bookings"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Date Bookings</span>
            {bookings.filter((b) => b.status === "new").length > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-zinc-900 rounded-full text-[9px] font-bold">
                {bookings.filter((b) => b.status === "new").length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("crew")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
              activeTab === "crew"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Crew Management</span>
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 relative ${
              activeTab === "contacts"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Inquiries</span>
            {contacts.filter((c) => c.status === "new").length > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-zinc-900 rounded-full text-[9px] font-bold">
                {contacts.filter((c) => c.status === "new").length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
              activeTab === "settings"
                ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold shadow-lg scale-102"
                : "bg-[#464239] text-zinc-300 border-white/5 hover:border-amber-300/30"
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest">Site Configuration</span>
          </button>
        </div>

        {/* CMS Data Panel Views */}
        <div className="lg:col-span-9 bg-[#464239] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-zinc-400">
              <RefreshCw className="w-10 h-10 animate-spin text-amber-200" />
              <p className="text-xs uppercase tracking-widest font-light">Loading database files...</p>
            </div>
          ) : (
            <>
              {/* ----------------------------------------------------
                  SLIDESHOW PANELS (Leica Viewfinder Slideshow)
                  ---------------------------------------------------- */}
              {activeTab === "slides" && (
                <div>
                  <div className="mb-8 border-b border-white/10 pb-4">
                    <h2 className="font-serif-primary text-2xl font-light text-amber-100">
                      Viewfinder Slideshow
                    </h2>
                    <p className="text-xs text-zinc-300 font-light mt-1">
                      Directly change the background photos and alignment styles for the Leica Viewfinder.
                    </p>
                  </div>

                  {editingSlide ? (
                    <form onSubmit={handleSaveSlide} className="flex flex-col gap-5 bg-black/15 p-6 rounded-2xl border border-white/5 mb-8 animate-fadeIn">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-serif-primary text-lg font-light text-amber-100">
                          Edit Viewfinder Slide Details
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingSlide(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">Tag Label</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. POETIC ROMANCE"
                            value={editingSlide.tag || ""}
                            onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">Slide Title (\n for breaks)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Traditional\nGrandeur"
                            value={editingSlide.title || ""}
                            onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">Alignment Layout Class</label>
                          <select
                            value={editingSlide.layoutClass || "items-start justify-start text-left"}
                            onChange={(e) => setEditingSlide({ ...editingSlide, layoutClass: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                          >
                            <option value="items-start justify-start text-left">Top Left</option>
                            <option value="items-start justify-end text-left">Top Right</option>
                            <option value="items-end justify-start text-right">Bottom Left</option>
                            <option value="items-end justify-end text-right">Bottom Right</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">Image Alignment Class (Object position)</label>
                          <select
                            value={editingSlide.positionClass || "object-center"}
                            onChange={(e) => setEditingSlide({ ...editingSlide, positionClass: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                          >
                            <option value="object-center">Center</option>
                            <option value="object-[center_18%]">Top Crops (Leica default)</option>
                            <option value="object-[center_50%]">Middle Portrait Crops</option>
                            <option value="object-[center_75%]">Low Portrait Crops</option>
                            <option value="object-[center_85%]">Deep Low Crops</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">Viewfinder Image Asset</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            required
                            placeholder="CDN Image URL"
                            value={editingSlide.image || ""}
                            onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              id="slide-uploader"
                              className="hidden"
                              disabled={isUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadImage(file, "slideshow");
                                  setEditingSlide({ ...editingSlide, image: url });
                                }
                              }}
                            />
                            <label
                              htmlFor="slide-uploader"
                              className="px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5" /> Upload File
                            </label>
                          </div>
                        </div>
                        {editingSlide.image && (
                          <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
                            <img src={editingSlide.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="py-3 bg-amber-300 hover:bg-amber-200 text-zinc-950 rounded-xl text-xs uppercase tracking-widest font-semibold mt-4 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save Slide Changes
                      </button>
                    </form>
                  ) : null}

                  {/* Slides Grid */}
                  {slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-white/10 rounded-2xl mt-6">
                      <Camera className="w-10 h-10 text-amber-200/40" />
                      <p className="text-zinc-300 text-sm font-light">No slides found in database.</p>
                      <p className="text-zinc-500 text-xs max-w-xs">Database seeding runs automatically on first connection. Make sure your MongoDB is connected, then refresh this page.</p>
                      <button
                        onClick={fetchAllData}
                        className="px-5 py-2.5 rounded-full bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs uppercase tracking-widest font-semibold transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />Retry Load
                      </button>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {slides.map((slide, idx) => (
                      <div key={slide._id || idx} className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div className="relative aspect-[16/10] bg-zinc-800">
                          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 bg-black/60 text-amber-200 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">
                            {slide.tag}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                          <h4 className="font-serif-primary text-lg font-light text-zinc-200 leading-tight whitespace-pre-line">
                            {slide.title}
                          </h4>
                          <div className="border-t border-white/5 pt-3">
                            <button
                              onClick={() => setEditingSlide(slide)}
                              className="w-full text-center px-4 py-2.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-102"
                            >
                              Edit Details &amp; Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* ----------------------------------------------------
                  LOVE STORIES (GALLERIES CRUD)
                  ---------------------------------------------------- */}
              {activeTab === "stories" && (
                <div>
                  <div className="mb-8 border-b border-white/10 pb-4">
                    <h2 className="font-serif-primary text-2xl font-light text-amber-100">
                      Featured Love Stories
                    </h2>
                    <p className="text-xs text-zinc-300 font-light mt-1">
                      Directly manage details, hero cover photos, and carousel galleries for love stories.
                    </p>
                  </div>

                  {editingStory ? (
                    <form onSubmit={handleSaveStory} className="flex flex-col gap-5 bg-black/15 p-6 rounded-2xl border border-white/5 mb-8 animate-fadeIn">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-serif-primary text-lg font-light text-amber-100">
                          Edit Love Story details & photos
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingStory(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Couples *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aanya & Dev"
                            value={editingStory.couple || ""}
                            onChange={(e) => setEditingStory({ ...editingStory, couple: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Location *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Udaipur, Rajasthan"
                            value={editingStory.location || ""}
                            onChange={(e) => setEditingStory({ ...editingStory, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Wedding Date *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. November 2025"
                            value={editingStory.date || ""}
                            onChange={(e) => setEditingStory({ ...editingStory, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Client Quote/Vow</label>
                        <input
                          type="text"
                          placeholder="e.g. Kopiko didn't just take pictures; they preserved the exact magic..."
                          value={editingStory.quote || ""}
                          onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs font-sans-clean"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Story Summary snippet</label>
                        <textarea
                          rows={2}
                          placeholder="Provide a short poetic overview of the wedding day, styles, and vibe..."
                          value={editingStory.storySnippet || ""}
                          onChange={(e) => setEditingStory({ ...editingStory, storySnippet: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs resize-none font-sans-clean"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Primary Hero Image (Cover Photo)</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            required
                            placeholder="CDN image URL"
                            value={editingStory.heroImage || ""}
                            onChange={(e) => setEditingStory({ ...editingStory, heroImage: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs font-sans-clean"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id="story-hero-uploader"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file, "love-stories");
                                setEditingStory({ ...editingStory, heroImage: url });
                              }
                            }}
                          />
                          <label
                            htmlFor="story-hero-uploader"
                            className="px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold cursor-pointer font-sans-clean transition-colors"
                          >
                            Upload Hero
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Gallery Carousel Images (Delete existing, click Add to add new ones)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(editingStory.images || []).map((img, index) => (
                            <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/15 group bg-zinc-800">
                              <img src={img} alt="carousel" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingStory.images || []).filter((_, i) => i !== index);
                                  setEditingStory({ ...editingStory, images: updated });
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <label className="w-16 h-16 rounded-lg border border-dashed border-white/20 hover:border-amber-200 cursor-pointer flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors">
                            <PlusCircle className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px] uppercase">Add</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (files) {
                                  const urls: string[] = [];
                                  for (let i = 0; i < files.length; i++) {
                                    const u = await uploadImage(files[i], "love-stories");
                                    urls.push(u);
                                  }
                                  setEditingStory({
                                    ...editingStory,
                                    images: [...(editingStory.images || []), ...urls],
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold font-sans-clean">Mini Gallery Previews (3 vertical previews)</label>
                        <div className="flex flex-wrap gap-2">
                          {(editingStory.galleryPreview || []).map((img, index) => (
                            <div key={index} className="relative w-16 h-20 rounded-lg overflow-hidden border border-white/15 group bg-zinc-800">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingStory.galleryPreview || []).filter((_, i) => i !== index);
                                  setEditingStory({ ...editingStory, galleryPreview: updated });
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <label className="w-16 h-20 rounded-lg border border-dashed border-white/20 hover:border-amber-200 cursor-pointer flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors font-sans-clean">
                            <PlusCircle className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px] uppercase">Add</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (files) {
                                  const urls: string[] = [];
                                  for (let i = 0; i < files.length; i++) {
                                    const u = await uploadImage(files[i], "love-stories");
                                    urls.push(u);
                                  }
                                  setEditingStory({
                                    ...editingStory,
                                    galleryPreview: [...(editingStory.galleryPreview || []), ...urls],
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-2">
                        <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingStory.hidden || false}
                            onChange={(e) => setEditingStory({ ...editingStory, hidden: e.target.checked })}
                            className="rounded bg-black/20 border-white/10 text-amber-300 focus:ring-0 w-4 h-4"
                          />
                          Hide from front page
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="py-3 bg-amber-300 hover:bg-amber-200 text-zinc-950 rounded-xl text-xs uppercase tracking-widest font-semibold mt-4 transition-all duration-300 flex items-center justify-center gap-2 font-sans-clean"
                      >
                        <Save className="w-4 h-4" /> Save Love Story Changes
                      </button>
                    </form>
                  ) : null}

                  {/* Stories list */}
                  {stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-white/10 rounded-2xl">
                      <Layers className="w-10 h-10 text-amber-200/40" />
                      <p className="text-zinc-300 text-sm font-light">No love stories found in database.</p>
                      <p className="text-zinc-500 text-xs max-w-xs">Database seeding runs automatically on first connection. Make sure your MongoDB is connected, then refresh this page.</p>
                      <button
                        onClick={fetchAllData}
                        className="px-5 py-2.5 rounded-full bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs uppercase tracking-widest font-semibold transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />Retry Load
                      </button>
                    </div>
                  ) : (
                  <div className="flex flex-col gap-4">
                    {stories.map((story, idx) => (
                      <div key={story._id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-black/15 border border-white/5 rounded-2xl gap-4 font-sans-clean">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                            <img src={story.heroImage} alt={story.couple} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-serif-primary text-xl font-light text-zinc-100 flex items-center gap-2">
                              {story.couple}
                              {story.hidden && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px] uppercase tracking-wider font-semibold">
                                  Hidden
                                </span>
                              )}
                            </h3>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                              {story.location} — {story.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => setEditingStory(story)}
                            className="px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 hover:scale-102"
                          >
                            Edit Details &amp; Photos
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* ----------------------------------------------------
                  CLIENT REVIEWS MODERATION
                  ---------------------------------------------------- */}
              {activeTab === "reviews" && (
                <div>
                  <h2 className="font-serif-primary text-2xl font-light text-amber-100 mb-2 border-b border-white/10 pb-4">
                    Client Story Reviews
                  </h2>
                  <p className="text-xs text-zinc-300 font-light mt-1 mb-6">
                    Review submissions from couples. Enable, disable, or delete feedback entries.
                  </p>

                  <div className="flex flex-col gap-4">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="p-5 bg-black/15 border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-amber-300 text-xs font-semibold">
                              {"★".repeat(rev.rating)}
                              {"☆".repeat(5 - rev.rating)}
                            </span>
                            <h3 className="font-serif-primary text-lg font-light text-zinc-200 mt-1">
                              {rev.names}
                            </h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                              {rev.venue}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleReviewVisibility(rev)}
                              className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-colors ${
                                rev.hidden
                                  ? "bg-amber-300/10 border border-amber-300/30 text-amber-200 hover:bg-amber-300/20"
                                  : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                              }`}
                            >
                              {rev.hidden ? "Show Review" : "Hide Review"}
                            </button>
                            <button
                              onClick={() => rev._id && handleDeleteReview(rev._id)}
                              className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="font-sans-clean text-xs text-zinc-300 leading-relaxed italic font-light pl-4 border-l border-amber-300/35">
                          "{rev.quote}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  DATE BOOKINGS INQUIRIES & CALENDAR MANAGEMENT
                  ---------------------------------------------------- */}
              {activeTab === "bookings" && <BookingManager />}

              {/* ----------------------------------------------------
                  CREW MANAGEMENT
                  ---------------------------------------------------- */}
              {activeTab === "crew" && <CrewManager />}

              {/* ----------------------------------------------------
                  CONTACT INQUIRIES PANELS
                  ---------------------------------------------------- */}
              {activeTab === "contacts" && (
                <div>
                  <h2 className="font-serif-primary text-2xl font-light text-amber-100 mb-2 border-b border-white/10 pb-4">
                    Contact & Journal Subscriptions
                  </h2>
                  <p className="text-xs text-zinc-300 font-light mt-1 mb-6">
                    Inquiries and Journal subscribers submitted from the footer newsletter and contact forms.
                  </p>

                  <div className="flex flex-col gap-4">
                    {contacts.map((c) => (
                      <div key={c._id} className="p-5 bg-black/20 border border-white/5 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-serif-primary text-lg font-light text-zinc-100">
                              {c.name}
                            </h3>
                            <a href={`mailto:${c.email}`} className="text-xs text-amber-200 hover:underline">
                              {c.email}
                            </a>
                            <span className="text-[10px] text-zinc-500 block mt-1 font-mono">
                              Received {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={c.status}
                              onChange={(e) => c._id && handleUpdateContactStatus(c._id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button
                              onClick={() => c._id && handleDeleteContact(c._id)}
                              className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 bg-black/10 p-3 rounded-xl border border-white/5">
                          {c.message}
                        </p>
                      </div>
                    ))}

                    {contacts.length === 0 && (
                      <p className="text-center py-10 text-zinc-500 text-xs uppercase tracking-widest font-light">
                        No contact inquiries found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  SITE CONFIGURATION SETTINGS
                  ---------------------------------------------------- */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="font-serif-primary text-2xl font-light text-amber-100 mb-2 border-b border-white/10 pb-4">
                    Global Site Configuration
                  </h2>
                  <p className="text-xs text-zinc-300 font-light mt-1 mb-6">
                    Customize titles, taglines, phone lines, and general branding.
                  </p>

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-2xl">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-amber-200/80">Hero Tagline Title (\n for breaks)</label>
                      <textarea
                        rows={3}
                        required
                        value={settings.heroTitle}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-xs resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-amber-200/80">Hero Subtitle</label>
                      <input
                        type="text"
                        required
                        value={settings.heroSubtitle}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80">WhatsApp Contact Link Number</label>
                        <input
                          type="text"
                          required
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-amber-200/80">Instagram Profile Link</label>
                        <input
                          type="url"
                          required
                          value={settings.instagramUrl}
                          onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-3 bg-amber-300 hover:bg-amber-200 text-zinc-950 rounded-xl text-xs uppercase tracking-widest font-semibold mt-4 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Save Site Settings
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
