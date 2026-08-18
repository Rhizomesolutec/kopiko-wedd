"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Phone,
  Mail,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export interface CrewMember {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_CREW: Partial<CrewMember> = {
  name: "",
  phone: "",
  email: "",
};

export default function CrewManager() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Partial<CrewMember> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCrew = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/crew");
      if (res.ok) {
        const data = await res.json();
        setCrewMembers(data);
      } else {
        toast.error("Failed to load crew members");
      }
    } catch (error) {
      toast.error("Network error loading crew members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  const filteredCrew = crewMembers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingCrew({ ...DEFAULT_CREW });
    setIsModalOpen(true);
  };

  const openEditModal = (crew: CrewMember) => {
    setEditingCrew({ ...crew });
    setIsModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Remove this crew member? This won't affect bookings they're already assigned to.")) return;

    try {
      const res = await fetch(`/api/crew/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Crew member removed");
        fetchCrew();
      } else {
        toast.error("Failed to remove crew member");
      }
    } catch (err) {
      toast.error("Network error removing crew member");
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrew) return;

    if (!editingCrew.name || !editingCrew.phone) {
      toast.error("Name and phone number are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const isNew = !editingCrew._id;
      const url = isNew ? "/api/crew" : `/api/crew/${editingCrew._id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCrew),
      });

      if (res.ok) {
        toast.success(isNew ? "Crew member added!" : "Crew member updated!");
        setIsModalOpen(false);
        setEditingCrew(null);
        fetchCrew();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save crew member");
      }
    } catch (err) {
      toast.error("Failed to submit crew member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans-clean">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif-primary text-3xl font-light text-amber-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-300" />
            Crew Management
          </h2>
          <p className="text-xs text-zinc-300 font-light mt-1">
            Add studio crew members here so they can be quickly selected & assigned inside the Booking
            Production Schedule Builder.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-3.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:scale-102 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Add Crew Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search crew by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-300 text-xs"
        />
      </div>

      {/* Crew List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-200" />
          <p className="text-xs uppercase tracking-widest font-light">Loading crew members...</p>
        </div>
      ) : filteredCrew.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <UserCheck className="w-10 h-10 text-amber-200/40" />
          <p className="text-sm text-zinc-400 font-light">
            {searchQuery ? "No crew members match your search." : "No crew members added yet."}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="mt-2 px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold uppercase tracking-widest rounded-full transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add First Crew Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrew.map((crew) => (
            <div
              key={crew._id}
              className="bg-black/20 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-amber-300/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-300/15 border border-amber-300/25 flex items-center justify-center text-amber-200 font-serif-primary text-sm shrink-0">
                    {crew.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm text-amber-100 font-medium">{crew.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(crew)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-200 hover:bg-white/5 transition-colors"
                    title="Edit crew member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(crew._id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Remove crew member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-zinc-300 border-t border-white/5 pt-3">
                <a href={`tel:${crew.phone}`} className="flex items-center gap-2 hover:text-amber-200 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {crew.phone}
                </a>
                {crew.email && (
                  <a href={`mailto:${crew.email}`} className="flex items-center gap-2 hover:text-amber-200 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{crew.email}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingCrew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1c1a17] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl z-10 my-8 font-sans-clean"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                <h3 className="font-serif-primary text-2xl font-light text-amber-100">
                  {editingCrew._id ? "Edit Crew Member" : "Add Crew Member"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                    Crew Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashif"
                    value={editingCrew.name || ""}
                    onChange={(e) => setEditingCrew({ ...editingCrew, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={editingCrew.phone || ""}
                    onChange={(e) => setEditingCrew({ ...editingCrew, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="crew@kopikowedd.com"
                    value={editingCrew.email || ""}
                    onChange={(e) => setEditingCrew({ ...editingCrew, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs uppercase tracking-widest font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs uppercase tracking-widest font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Save Crew Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
