"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Copy,
  Archive,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  UserCheck,
  Film,
  Camera,
  Check,
  PlusCircle,
  Users,
  Layers,
  Radio,
  PackageCheck,
  FileUp,
  Paperclip,
  ExternalLink,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

export interface EventItem {
  eventType?: string;
  customEventType?: string;
  location?: string;

  photographyEventType?: string;
  photographySubEventType?: string;
  photographyCustomEventType?: string;
  photographyLocation?: string;
  photographyLead?: string;
  photographyCrew?: string[];
  photographyCrewBride?: string[];
  photographyCrewGroom?: string[];

  videographyEventType?: string;
  videographySubEventType?: string;
  videographyCustomEventType?: string;
  videographyLocation?: string;
  videographyLead?: string;
  videographyCrew?: string[];
  videographyCrewBride?: string[];
  videographyCrewGroom?: string[];

  droneEventType?: string;
  droneSubEventType?: string;
  droneCustomEventType?: string;
  droneLocation?: string;
  droneLead?: string;
  droneCrew?: string[];
  droneCrewBride?: string[];
  droneCrewGroom?: string[];

  // Fallbacks
  assignedLead?: string;
  crewMembers?: string[];
}

export interface DateSchedule {
  date: string; // YYYY-MM-DD
  events: EventItem[];
}

export interface Booking {
  _id?: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // Primary Date YYYY-MM-DD
  weddingTime?: string;
  venue: string;
  city?: string;
  state?: string;
  country?: string;
  phone: string;
  email: string;
  package?: string;
  budget?: string;
  services?: string[];
  photographer?: string;
  videographer?: string;
  paymentStatus?: string;
  advancePayment?: string;
  remainingAmount?: string;
  pdfUrl?: string;
  pdfName?: string;
  notes?: string;
  internalNotes?: string;
  status: "confirmed" | "cancelled" | "sdp" | "all_delivered" | string;
  archived?: boolean;
  dateSchedules?: DateSchedule[];
  createdAt?: string;
  updatedAt?: string;
}

const EVENT_TYPE_OPTIONS = ["None", "Bride", "Groom", "Both"];

// Used by the "Event / Occasion Type" field on each Occasion within the
// Department Production Schedule Builder (covers every occasion type that
// isn't specifically Bride / Groom / Both).
const OTHER_EVENT_TYPE_OPTIONS = [
  "Pre-Wedding",
  "Save The Date",
  "Engagement",
  "Mehendi",
  "Haldi",
  "Wedding",
  "Reception",
  "Other",
];

const DEFAULT_BOOKING: Partial<Booking> = {
  brideName: "",
  groomName: "",
  weddingDate: new Date().toISOString().split("T")[0],
  weddingTime: "10:00 AM",
  venue: "",
  city: "",
  state: "",
  country: "India",
  package: "Standard",
  budget: "₹2,50,000 - ₹5,00,000",
  photographer: "Ashif",
  videographer: "Adhil",
  paymentStatus: "unpaid",
  advancePayment: "0",
  remainingAmount: "0",
  pdfUrl: "",
  pdfName: "",
  notes: "",
  internalNotes: "",
  status: "confirmed",
  dateSchedules: [
    {
      date: new Date().toISOString().split("T")[0],
      events: [
        {
          photographyEventType: "Bride",
          photographyLocation: "Ponnani",
          photographyCrew: [],

          videographyEventType: "Groom",
          videographyLocation: "Calicut",
          videographyCrew: [],

          droneEventType: "Both",
          droneLocation: "Kochi",
          droneCrewBride: [],
          droneCrewGroom: [],
        },
      ],
    },
  ],
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  confirmed: {
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
    label: "Confirmed",
  },
  cancelled: {
    bg: "bg-rose-400/10",
    text: "text-rose-300",
    border: "border-rose-400/30",
    label: "Cancelled",
  },
  sdp: {
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    border: "border-amber-400/30",
    label: "SDP",
  },
  all_delivered: {
    bg: "bg-sky-400/10",
    text: "text-sky-300",
    border: "border-sky-400/30",
    label: "All Delivered",
  },
  // Legacy status fallbacks
  new: {
    bg: "bg-emerald-400/10",
    text: "text-emerald-300",
    border: "border-emerald-400/30",
    label: "Confirmed",
  },
  pending: {
    bg: "bg-amber-400/10",
    text: "text-amber-300",
    border: "border-amber-400/30",
    label: "SDP",
  },
  completed: {
    bg: "bg-sky-400/10",
    text: "text-sky-300",
    border: "border-sky-400/30",
    label: "All Delivered",
  },
};

interface CrewOption {
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
}

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [crewOptions, setCrewOptions] = useState<CrewOption[]>([]);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("dateAsc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<Booking> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Fetch Bookings from API
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      toast.error("Network error loading bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Crew Members from API (for department crew assignment dropdowns)
  const fetchCrewOptions = async () => {
    try {
      const res = await fetch("/api/crew");
      if (res.ok) {
        const data = await res.json();
        setCrewOptions(data);
      }
    } catch (error) {
      // Silently ignore - crew dropdowns will just show as empty/blank
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchCrewOptions();
  }, []);

  // Format Helper: Standardize YYYY-MM-DD
  const formatDateKey = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // PDF File Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBooking) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a valid PDF file");
      return;
    }

    setIsUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "booking_pdfs");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditingBooking({
          ...editingBooking,
          pdfUrl: data.url,
          pdfName: file.name,
        });
        toast.success("PDF contract attached successfully!");
      } else {
        toast.error("Failed to upload PDF file");
      }
    } catch (err) {
      toast.error("Error uploading PDF");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const yearStr = prevDate.getFullYear();
      const monthStr = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(prevDate.getDate()).padStart(2, "0");
      days.push({
        date: prevDate,
        dateKey: `${yearStr}-${monthStr}-${dayStr}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayStr = formatDateKey(new Date().toISOString());
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currDate = new Date(year, month, day);
      const yearStr = currDate.getFullYear();
      const monthStr = String(currDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

      days.push({
        date: currDate,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayStr,
      });
    }

    // Next month trailing days
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextDate = new Date(year, month + 1, day);
      const yearStr = nextDate.getFullYear();
      const monthStr = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(nextDate.getDate()).padStart(2, "0");
      days.push({
        date: nextDate,
        dateKey: `${yearStr}-${monthStr}-${dayStr}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentMonth]);

  // Bookings mapped by date string
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};

    bookings.forEach((b) => {
      const datesToRegister = new Set<string>();

      const primaryKey = formatDateKey(b.weddingDate);
      if (primaryKey) datesToRegister.add(primaryKey);

      if (b.dateSchedules && b.dateSchedules.length > 0) {
        b.dateSchedules.forEach((ds) => {
          const dsKey = formatDateKey(ds.date);
          if (dsKey) datesToRegister.add(dsKey);
        });
      }

      datesToRegister.forEach((dKey) => {
        if (!map[dKey]) map[dKey] = [];
        if (!map[dKey].some((item) => item._id === b._id)) {
          map[dKey].push(b);
        }
      });
    });

    return map;
  }, [bookings]);

  // Metrics Summary
  const metrics = useMemo(() => {
    const todayKey = formatDateKey(new Date().toISOString());
    const now = new Date();

    let todayCount = 0;
    let thisMonthCount = 0;
    let confirmedCount = 0;
    let sdpCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    bookings.forEach((b) => {
      const dateKey = formatDateKey(b.weddingDate);
      const wDate = new Date(b.weddingDate);

      if (dateKey === todayKey) todayCount++;
      if (wDate.getMonth() === now.getMonth() && wDate.getFullYear() === now.getFullYear()) {
        thisMonthCount++;
      }

      if (b.status === "confirmed") confirmedCount++;
      if (b.status === "sdp") sdpCount++;
      if (b.status === "all_delivered") deliveredCount++;
      if (b.status === "cancelled") cancelledCount++;
    });

    return {
      total: bookings.length,
      today: todayCount,
      thisMonth: thisMonthCount,
      confirmed: confirmedCount,
      sdp: sdpCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
    };
  }, [bookings]);

  // Filtered & Sorted Bookings List
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Date Filter
        if (selectedDate) {
          const primaryKey = formatDateKey(b.weddingDate);
          const hasScheduleDate = b.dateSchedules?.some(
            (ds) => formatDateKey(ds.date) === selectedDate
          );
          if (primaryKey !== selectedDate && !hasScheduleDate) return false;
        }

        // Status Filter
        if (statusFilter !== "all") {
          if (b.status !== statusFilter) return false;
        }

        // Payment Status Filter
        if (paymentFilter !== "all") {
          if (b.paymentStatus !== paymentFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBride = b.brideName?.toLowerCase().includes(q);
          const matchGroom = b.groomName?.toLowerCase().includes(q);
          const matchVenue = b.venue?.toLowerCase().includes(q);
          const matchPhone = b.phone?.toLowerCase().includes(q);
          const matchEmail = b.email?.toLowerCase().includes(q);
          const matchCity = b.city?.toLowerCase().includes(q);

          const matchStaff = b.dateSchedules?.some((ds) =>
            ds.events?.some(
              (ev) =>
                ev.photographyCrew?.some((c) => c.toLowerCase().includes(q)) ||
                ev.photographyLocation?.toLowerCase().includes(q) ||
                ev.videographyCrew?.some((c) => c.toLowerCase().includes(q)) ||
                ev.videographyLocation?.toLowerCase().includes(q) ||
                ev.droneCrew?.some((c) => c.toLowerCase().includes(q)) ||
                ev.droneLocation?.toLowerCase().includes(q)
            )
          );

          if (
            !matchBride &&
            !matchGroom &&
            !matchVenue &&
            !matchPhone &&
            !matchEmail &&
            !matchCity &&
            !matchStaff
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "dateAsc") {
          return new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime();
        }
        if (sortOption === "dateDesc") {
          return new Date(b.weddingDate).getTime() - new Date(a.weddingDate).getTime();
        }
        if (sortOption === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortOption === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortOption === "brideName") {
          return a.brideName.localeCompare(b.brideName);
        }
        if (sortOption === "status") {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [bookings, selectedDate, statusFilter, paymentFilter, searchQuery, sortOption]);

  // Calendar Controls
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today.toISOString()));
  };

  // Status Change API
  const handleStatusChange = async (id: string, newStatus: Booking["status"]) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${STATUS_COLORS[newStatus]?.label || newStatus}`);
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Network error updating status");
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking inquiry?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Booking deleted successfully");
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (err) {
      toast.error("Request failed");
    }
  };

  // Duplicate Booking
  const handleDuplicateBooking = async (booking: Booking) => {
    const copy: Partial<Booking> = {
      ...booking,
      _id: undefined,
      brideName: `${booking.brideName} (Copy)`,
      status: "confirmed",
      createdAt: undefined,
      updatedAt: undefined,
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (res.ok) {
        toast.success("Booking duplicated!");
        fetchBookings();
      } else {
        toast.error("Failed to duplicate booking");
      }
    } catch (err) {
      toast.error("Network error duplicating booking");
    }
  };

  // ----------------------------------------------------
  // HIERARCHICAL EVENT BUILDER HELPERS
  // ----------------------------------------------------
  const addDateBlock = () => {
    if (!editingBooking) return;
    const currentSchedules = editingBooking.dateSchedules || [];
    const newDateStr = new Date().toISOString().split("T")[0];
    const newBlock: DateSchedule = {
      date: newDateStr,
      events: [
        {
          photographyEventType: "Bride",
          photographyLocation: "",
          photographyCrew: [],

          videographyEventType: "Groom",
          videographyLocation: "",
          videographyCrew: [],

          droneEventType: "Both",
          droneLocation: "",
          droneCrewBride: [],
          droneCrewGroom: [],
        },
      ],
    };
    setEditingBooking({
      ...editingBooking,
      dateSchedules: [...currentSchedules, newBlock],
    });
  };

  const removeDateBlock = (dateIdx: number) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    currentSchedules.splice(dateIdx, 1);
    setEditingBooking({
      ...editingBooking,
      dateSchedules: currentSchedules,
    });
  };

  const updateDateBlockValue = (dateIdx: number, newDateVal: string) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    if (currentSchedules[dateIdx]) {
      currentSchedules[dateIdx].date = newDateVal;
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  const addEventToDateBlock = (dateIdx: number) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    if (currentSchedules[dateIdx]) {
      const newEvent: EventItem = {
        eventType: "",
        photographyEventType: "Bride",
        photographyLocation: "",
        photographyCrew: [],

        videographyEventType: "Groom",
        videographyLocation: "",
        videographyCrew: [],

        droneEventType: "Both",
        droneLocation: "",
        droneCrew: [],
      };
      currentSchedules[dateIdx].events = [
        ...(currentSchedules[dateIdx].events || []),
        newEvent,
      ];
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  const removeEventFromDateBlock = (dateIdx: number, eventIdx: number) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    if (currentSchedules[dateIdx]) {
      currentSchedules[dateIdx].events.splice(eventIdx, 1);
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  const updateEventField = (
    dateIdx: number,
    eventIdx: number,
    field: keyof EventItem,
    value: any
  ) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    if (currentSchedules[dateIdx] && currentSchedules[dateIdx].events[eventIdx]) {
      currentSchedules[dateIdx].events[eventIdx] = {
        ...currentSchedules[dateIdx].events[eventIdx],
        [field]: value,
      };
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  // Department-wise Crew helpers
  // `side` is only used when the department's Event Type is "Both" - it
  // targets the split Bride-side / Groom-side crew lists instead of the
  // single shared crew list.
  type CrewSide = "bride" | "groom" | undefined;

  const addDeptCrewMember = (
    dateIdx: number,
    eventIdx: number,
    dept: "photography" | "videography" | "drone",
    side?: CrewSide
  ) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    const ev = currentSchedules[dateIdx]?.events[eventIdx];
    if (ev) {
      if (dept === "photography") {
        if (side === "bride") ev.photographyCrewBride = [...(ev.photographyCrewBride || []), ""];
        else if (side === "groom") ev.photographyCrewGroom = [...(ev.photographyCrewGroom || []), ""];
        else ev.photographyCrew = [...(ev.photographyCrew || []), ""];
      } else if (dept === "videography") {
        if (side === "bride") ev.videographyCrewBride = [...(ev.videographyCrewBride || []), ""];
        else if (side === "groom") ev.videographyCrewGroom = [...(ev.videographyCrewGroom || []), ""];
        else ev.videographyCrew = [...(ev.videographyCrew || []), ""];
      } else if (dept === "drone") {
        if (side === "bride") ev.droneCrewBride = [...(ev.droneCrewBride || []), ""];
        else if (side === "groom") ev.droneCrewGroom = [...(ev.droneCrewGroom || []), ""];
        else ev.droneCrew = [...(ev.droneCrew || []), ""];
      }
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  const updateDeptCrewMember = (
    dateIdx: number,
    eventIdx: number,
    dept: "photography" | "videography" | "drone",
    crewIdx: number,
    name: string,
    side?: CrewSide
  ) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    const ev = currentSchedules[dateIdx]?.events[eventIdx];
    if (ev) {
      if (dept === "photography") {
        if (side === "bride" && ev.photographyCrewBride) ev.photographyCrewBride[crewIdx] = name;
        else if (side === "groom" && ev.photographyCrewGroom) ev.photographyCrewGroom[crewIdx] = name;
        else if (!side && ev.photographyCrew) ev.photographyCrew[crewIdx] = name;
      } else if (dept === "videography") {
        if (side === "bride" && ev.videographyCrewBride) ev.videographyCrewBride[crewIdx] = name;
        else if (side === "groom" && ev.videographyCrewGroom) ev.videographyCrewGroom[crewIdx] = name;
        else if (!side && ev.videographyCrew) ev.videographyCrew[crewIdx] = name;
      } else if (dept === "drone") {
        if (side === "bride" && ev.droneCrewBride) ev.droneCrewBride[crewIdx] = name;
        else if (side === "groom" && ev.droneCrewGroom) ev.droneCrewGroom[crewIdx] = name;
        else if (!side && ev.droneCrew) ev.droneCrew[crewIdx] = name;
      }
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  const removeDeptCrewMember = (
    dateIdx: number,
    eventIdx: number,
    dept: "photography" | "videography" | "drone",
    crewIdx: number,
    side?: CrewSide
  ) => {
    if (!editingBooking) return;
    const currentSchedules = [...(editingBooking.dateSchedules || [])];
    const ev = currentSchedules[dateIdx]?.events[eventIdx];
    if (ev) {
      if (dept === "photography") {
        if (side === "bride" && ev.photographyCrewBride) ev.photographyCrewBride.splice(crewIdx, 1);
        else if (side === "groom" && ev.photographyCrewGroom) ev.photographyCrewGroom.splice(crewIdx, 1);
        else if (!side && ev.photographyCrew) ev.photographyCrew.splice(crewIdx, 1);
      } else if (dept === "videography") {
        if (side === "bride" && ev.videographyCrewBride) ev.videographyCrewBride.splice(crewIdx, 1);
        else if (side === "groom" && ev.videographyCrewGroom) ev.videographyCrewGroom.splice(crewIdx, 1);
        else if (!side && ev.videographyCrew) ev.videographyCrew.splice(crewIdx, 1);
      } else if (dept === "drone") {
        if (side === "bride" && ev.droneCrewBride) ev.droneCrewBride.splice(crewIdx, 1);
        else if (side === "groom" && ev.droneCrewGroom) ev.droneCrewGroom.splice(crewIdx, 1);
        else if (!side && ev.droneCrew) ev.droneCrew.splice(crewIdx, 1);
      }
      setEditingBooking({
        ...editingBooking,
        dateSchedules: currentSchedules,
      });
    }
  };

  // Save Modal Submission
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    if (
      !editingBooking.brideName ||
      !editingBooking.groomName ||
      !editingBooking.phone ||
      !editingBooking.email ||
      !editingBooking.weddingDate ||
      !editingBooking.venue
    ) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const isNew = !editingBooking._id;
      const url = isNew ? "/api/bookings" : `/api/bookings/${editingBooking._id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBooking),
      });

      if (res.ok) {
        toast.success(isNew ? "New booking created!" : "Booking updated successfully!");
        setIsModalOpen(false);
        setEditingBooking(null);
        fetchBookings();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save booking");
      }
    } catch (err) {
      toast.error("Failed to submit booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Resolves the display label for a department's Event Type, unwrapping
  // the "Event" option into its selected sub-event (or custom text).
  const getEventTypeLabel = (
    eventType: string | undefined,
    subEventType: string | undefined,
    customEventType: string | undefined,
    fallback: string
  ) => {
    if (eventType === "Event") {
      if (subEventType === "Other") return customEventType || "Custom";
      return subEventType || "Event";
    }
    // Backwards-compat with older bookings saved before the "Event" option
    // existed, where a specific occasion (e.g. "Wedding") was stored directly.
    if (eventType === "Other") return customEventType || "Custom";
    return eventType || fallback;
  };

  return (
    <div className="flex flex-col gap-8 font-sans-clean">
      {/* ----------------------------------------------------
          TOP HEADER SECTION
          ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif-primary text-3xl font-light text-amber-100 flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-amber-300" />
            Date Booking Management
          </h2>
          <p className="text-xs text-zinc-300 font-light mt-1">
            Interactive studio booking calendar, department-wise event types, locations, leads & crew assignments.
          </p>
        </div>

        <button
          onClick={() => {
            const defaultDate = selectedDate || new Date().toISOString().split("T")[0];
            setEditingBooking({
              ...DEFAULT_BOOKING,
              weddingDate: defaultDate,
              dateSchedules: [
                {
                  date: defaultDate,
                  events: [
                    {
                      photographyEventType: "Bride",
                      photographyLocation: "Ponnani",
                      photographyCrew: [],

                      videographyEventType: "Groom",
                      videographyLocation: "Calicut",
                      videographyCrew: [],

                      droneEventType: "Both",
                      droneLocation: "Kochi",
                      droneCrewBride: [],
                      droneCrewGroom: [],
                    },
                  ],
                },
              ],
            });
            setIsModalOpen(true);
          }}
          className="px-6 py-3.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:scale-102 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Add Booking Details
        </button>
      </div>

      {/* ----------------------------------------------------
          METRICS SUMMARY CARDS
          ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-sans-clean">
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Total Bookings</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-amber-200 font-light">{metrics.total}</span>
            <CalendarIcon className="w-4 h-4 text-amber-300/40" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Today</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-emerald-300 font-light">{metrics.today}</span>
            <Clock className="w-4 h-4 text-emerald-300/40" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Confirmed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-emerald-300 font-light">{metrics.confirmed}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-300/40" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">SDP</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-amber-300 font-light">{metrics.sdp}</span>
            <Sparkles className="w-4 h-4 text-amber-300/40" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">All Delivered</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-sky-300 font-light">{metrics.delivered}</span>
            <PackageCheck className="w-4 h-4 text-sky-300/40" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Cancelled</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif-primary text-3xl text-rose-300 font-light">{metrics.cancelled}</span>
            <AlertCircle className="w-4 h-4 text-rose-300/40" />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          LARGE MODERN CALENDAR COMPONENT
          ---------------------------------------------------- */}
      <div className="bg-black/20 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h3 className="font-serif-primary text-2xl font-light text-zinc-100">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-xl p-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-200 uppercase tracking-widest font-semibold transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))
              }
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={(e) =>
                setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))
              }
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
            >
              {Array.from({ length: 6 }, (_, i) => currentMonth.getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <span
              key={dayName}
              className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold py-1"
            >
              {dayName}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((cell) => {
            const dayBookings = bookingsByDate[cell.dateKey] || [];
            const count = dayBookings.length;
            const isSelected = selectedDate === cell.dateKey;

            return (
              <button
                key={cell.dateKey}
                onClick={() => {
                  if (selectedDate === cell.dateKey) {
                    setSelectedDate(null);
                  } else {
                    setSelectedDate(cell.dateKey);
                  }
                }}
                className={`min-h-[80px] p-2 rounded-2xl border transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group ${
                  isSelected
                    ? "bg-amber-300 text-zinc-950 border-amber-200 shadow-lg scale-102 z-10"
                    : cell.isToday
                    ? "bg-amber-300/10 border-amber-400/50 text-amber-200"
                    : cell.isCurrentMonth
                    ? "bg-black/20 border-white/5 hover:border-white/20 text-zinc-200"
                    : "bg-black/10 border-transparent opacity-30 text-zinc-600"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected
                        ? "text-zinc-950 font-bold"
                        : cell.isToday
                        ? "text-amber-300 font-bold"
                        : "text-zinc-300"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {cell.isToday && !isSelected && (
                    <span className="text-[8px] uppercase font-bold tracking-tighter px-1 rounded bg-amber-300/20 text-amber-300">
                      Today
                    </span>
                  )}
                </div>

                {count > 0 && (
                  <div className="mt-1 flex flex-col gap-1 w-full">
                    {isSelected ? (
                      <div className="px-2 py-0.5 rounded-full bg-zinc-950 text-amber-300 text-[9px] font-bold text-center">
                        {count} Booking{count > 1 ? "s" : ""}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold">
                          ● {count}
                        </span>
                        <span className="text-[9px] text-zinc-400 truncate max-w-[80px] hidden md:inline">
                          {dayBookings[0].brideName.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------
          SEARCH, FILTER & SORT TOOLBAR
          ---------------------------------------------------- */}
      <div className="flex flex-col gap-4 bg-black/15 p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {selectedDate ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-300/20 border border-amber-300/40 text-amber-200 text-xs font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Showing Date: <strong>{selectedDate}</strong></span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="hover:text-white p-0.5 rounded-full"
                  title="Clear Date Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-zinc-400 font-light">
                Showing all bookings ({filteredBookings.length} total)
              </span>
            )}

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-amber-300 hover:underline font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search couple, venue, lead staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">Booking Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="sdp">SDP</option>
              <option value="all_delivered">All Delivered</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300"
            >
              <option value="dateAsc">Wedding Date (Soonest)</option>
              <option value="dateDesc">Wedding Date (Furthest)</option>
              <option value="newest">Submission Date (Newest)</option>
              <option value="oldest">Submission Date (Oldest)</option>
              <option value="brideName">Bride Name (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          BOOKING CARDS LIST / EMPTY STATE
          ---------------------------------------------------- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-300" />
          <p className="text-xs uppercase tracking-widest">Loading booking inquiries...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/10 rounded-3xl bg-black/10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-300/10 flex items-center justify-center text-amber-300 mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif-primary text-xl text-zinc-200 font-light">
            {selectedDate ? `No bookings scheduled for ${selectedDate}` : "No bookings found"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-6 font-light">
            {selectedDate
              ? "There are no production events scheduled for this specific date."
              : "No booking entries match your active filters or search query."}
          </p>
          <button
            onClick={() => {
              const dateVal = selectedDate || new Date().toISOString().split("T")[0];
              setEditingBooking({
                ...DEFAULT_BOOKING,
                weddingDate: dateVal,
                dateSchedules: [
                  {
                    date: dateVal,
                    events: [
                      {
                        photographyEventType: "Bride",
                        photographyLocation: "Ponnani",
                        photographyCrew: [],

                        videographyEventType: "Groom",
                        videographyLocation: "Calicut",
                        videographyCrew: [],

                        droneEventType: "Both",
                        droneLocation: "Kochi",
                        droneCrewBride: [],
                        droneCrewGroom: [],
                      },
                    ],
                  },
                ],
              });
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Booking for This Date
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredBookings.map((booking) => {
            const statusConfig = STATUS_COLORS[booking.status] || STATUS_COLORS.confirmed;

            return (
              <motion.div
                key={booking._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/20 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden"
              >
                {/* Top Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>

                    {booking.paymentStatus && (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[9px] uppercase tracking-wider">
                        Payment: {booking.paymentStatus}
                      </span>
                    )}

                    <span className="text-[10px] text-zinc-500 font-mono">
                      Created: {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {booking.pdfUrl && (
                      <a
                        href={booking.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-amber-300/10 hover:bg-amber-300/20 border border-amber-300/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="View PDF Contract"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden md:inline">PDF Contract</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}

                    <select
                      value={booking.status || "confirmed"}
                      onChange={(e) =>
                        booking._id && handleStatusChange(booking._id, e.target.value as Booking["status"])
                      }
                      className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-amber-300 cursor-pointer"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="sdp">SDP</option>
                      <option value="all_delivered">All Delivered</option>
                    </select>

                    <button
                      onClick={() => {
                        setEditingBooking(booking);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="Edit Booking Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicateBooking(booking)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                      title="Duplicate Booking"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => booking._id && handleDeleteBooking(booking._id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: Couple & Venue */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif-primary text-2xl font-light text-zinc-100">
                      {booking.brideName} <span className="text-amber-300/80">&</span> {booking.groomName}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-amber-200 mt-1">
                      <CalendarIcon className="w-4 h-4 text-amber-300" />
                      <span className="font-bold tracking-wide">{booking.weddingDate}</span>
                      {booking.weddingTime && (
                        <span className="text-zinc-400 font-light">({booking.weddingTime})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-300 mt-0.5">
                      <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>
                        {booking.venue}
                        {booking.city ? `, ${booking.city}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Contacts & Financials */}
                  <div className="flex flex-col gap-2 text-xs text-zinc-300 border-l border-white/5 md:pl-6">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <a href={`tel:${booking.phone}`} className="hover:text-amber-200 transition-colors">
                        {booking.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <a href={`mailto:${booking.email}`} className="hover:text-amber-200 transition-colors">
                        {booking.email}
                      </a>
                    </div>

                    {booking.budget && (
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Budget Range: <span className="text-zinc-200 font-medium">{booking.budget}</span>
                      </div>
                    )}

                    {(booking.advancePayment || booking.remainingAmount) && (
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                        <span>Advance: <strong className="text-emerald-300">₹{booking.advancePayment || "0"}</strong></span>
                        <span>Due: <strong className="text-amber-200">₹{booking.remainingAmount || "0"}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ----------------------------------------------------
                    DEPARTMENT-WISE PRODUCTION TEAM ASSIGNMENTS BREAKDOWN
                    ---------------------------------------------------- */}
                {booking.dateSchedules && booking.dateSchedules.length > 0 && (
                  <div className="bg-black/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-300" /> Event Production Schedule & Department Assignments
                    </span>

                    <div className="flex flex-col gap-3">
                      {booking.dateSchedules.map((ds, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex flex-col gap-2 p-3 bg-black/20 border border-white/5 rounded-xl text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-amber-300" /> {ds.date}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {ds.events?.length || 0} Event{(ds.events?.length || 0) > 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="flex flex-col gap-3">
                            {ds.events?.map((ev, evIdx) => (
                              <div
                                key={evIdx}
                                className="flex flex-col gap-2 bg-black/30 p-3 rounded-lg border border-white/5 text-[11px]"
                              >
                                {ev.eventType && (
                                  <div className="text-[10px] text-amber-200 font-semibold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    {ev.eventType === "Other" ? ev.customEventType || "Custom" : ev.eventType}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* 1. Photography Department */}
                                  {ev.photographyEventType !== "None" &&
                                  ((ev.photographyCrew && ev.photographyCrew.length > 0) ||
                                    (ev.photographyCrewBride && ev.photographyCrewBride.length > 0) ||
                                    (ev.photographyCrewGroom && ev.photographyCrewGroom.length > 0) ||
                                    ev.photographyLocation) && (
                                    <div className="flex flex-col gap-1 p-2 bg-black/30 rounded-lg border border-amber-300/20">
                                      <span className="text-amber-300 text-[10px] uppercase font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                          <Camera className="w-3 h-3 text-amber-300" /> Photography
                                        </span>
                                        <span className="text-amber-200 text-[9px]">
                                          {getEventTypeLabel(
                                            ev.photographyEventType,
                                            ev.photographySubEventType,
                                            ev.photographyCustomEventType,
                                            "Bride"
                                          )}
                                        </span>
                                      </span>

                                      {ev.photographyLocation && (
                                        <span className="text-zinc-400 text-[10px]">
                                          📍 {ev.photographyLocation}
                                        </span>
                                      )}

                                      {ev.photographyEventType === "Both" &&
                                      ((ev.photographyCrewBride && ev.photographyCrewBride.length > 0) ||
                                        (ev.photographyCrewGroom && ev.photographyCrewGroom.length > 0)) ? (
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                          {ev.photographyCrewBride && ev.photographyCrewBride.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-amber-300 font-semibold">Bride Crew:</span>
                                              {ev.photographyCrewBride.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          {ev.photographyCrewGroom && ev.photographyCrewGroom.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-amber-300 font-semibold">Groom Crew:</span>
                                              {ev.photographyCrewGroom.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        ev.photographyCrew &&
                                        ev.photographyCrew.length > 0 && (
                                          <div className="flex flex-col gap-0.5 mt-1">
                                            <span className="text-[9px] uppercase text-zinc-400 font-semibold">Crew:</span>
                                            {ev.photographyCrew.map((c, cIdx) => (
                                              <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                • {c}
                                              </span>
                                            ))}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {/* 2. Videography Department */}
                                  {ev.videographyEventType !== "None" &&
                                  ((ev.videographyCrew && ev.videographyCrew.length > 0) ||
                                    (ev.videographyCrewBride && ev.videographyCrewBride.length > 0) ||
                                    (ev.videographyCrewGroom && ev.videographyCrewGroom.length > 0) ||
                                    ev.videographyLocation) && (
                                    <div className="flex flex-col gap-1 p-2 bg-black/30 rounded-lg border border-sky-300/20">
                                      <span className="text-sky-300 text-[10px] uppercase font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                          <Film className="w-3 h-3 text-sky-300" /> Videography
                                        </span>
                                        <span className="text-sky-200 text-[9px]">
                                          {getEventTypeLabel(
                                            ev.videographyEventType,
                                            ev.videographySubEventType,
                                            ev.videographyCustomEventType,
                                            "Groom"
                                          )}
                                        </span>
                                      </span>

                                      {ev.videographyLocation && (
                                        <span className="text-zinc-400 text-[10px]">
                                          📍 {ev.videographyLocation}
                                        </span>
                                      )}

                                      {ev.videographyEventType === "Both" &&
                                      ((ev.videographyCrewBride && ev.videographyCrewBride.length > 0) ||
                                        (ev.videographyCrewGroom && ev.videographyCrewGroom.length > 0)) ? (
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                          {ev.videographyCrewBride && ev.videographyCrewBride.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-sky-300 font-semibold">Bride Crew:</span>
                                              {ev.videographyCrewBride.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          {ev.videographyCrewGroom && ev.videographyCrewGroom.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-sky-300 font-semibold">Groom Crew:</span>
                                              {ev.videographyCrewGroom.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        ev.videographyCrew &&
                                        ev.videographyCrew.length > 0 && (
                                          <div className="flex flex-col gap-0.5 mt-1">
                                            <span className="text-[9px] uppercase text-zinc-400 font-semibold">Crew:</span>
                                            {ev.videographyCrew.map((c, cIdx) => (
                                              <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                • {c}
                                              </span>
                                            ))}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                  {/* 3. Drone Operations Department */}
                                  {ev.droneEventType !== "None" &&
                                  ((ev.droneCrew && ev.droneCrew.length > 0) ||
                                    (ev.droneCrewBride && ev.droneCrewBride.length > 0) ||
                                    (ev.droneCrewGroom && ev.droneCrewGroom.length > 0) ||
                                    ev.droneLocation) && (
                                    <div className="flex flex-col gap-1 p-2 bg-black/30 rounded-lg border border-emerald-300/20">
                                      <span className="text-emerald-300 text-[10px] uppercase font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                          <Radio className="w-3 h-3 text-emerald-300" /> Drone Operations
                                        </span>
                                        <span className="text-emerald-200 text-[9px]">
                                          {getEventTypeLabel(
                                            ev.droneEventType,
                                            ev.droneSubEventType,
                                            ev.droneCustomEventType,
                                            "Both"
                                          )}
                                        </span>
                                      </span>

                                      {ev.droneLocation && (
                                        <span className="text-zinc-400 text-[10px]">
                                          📍 {ev.droneLocation}
                                        </span>
                                      )}

                                      {ev.droneEventType === "Both" &&
                                      ((ev.droneCrewBride && ev.droneCrewBride.length > 0) ||
                                        (ev.droneCrewGroom && ev.droneCrewGroom.length > 0)) ? (
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                          {ev.droneCrewBride && ev.droneCrewBride.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-emerald-300 font-semibold">Bride Crew:</span>
                                              {ev.droneCrewBride.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          {ev.droneCrewGroom && ev.droneCrewGroom.length > 0 && (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[9px] uppercase text-emerald-300 font-semibold">Groom Crew:</span>
                                              {ev.droneCrewGroom.map((c, cIdx) => (
                                                <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                  • {c}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        ev.droneCrew &&
                                        ev.droneCrew.length > 0 && (
                                          <div className="flex flex-col gap-0.5 mt-1">
                                            <span className="text-[9px] uppercase text-zinc-400 font-semibold">Crew:</span>
                                            {ev.droneCrew.map((c, cIdx) => (
                                              <span key={cIdx} className="text-zinc-300 text-[10px] font-mono">
                                                • {c}
                                              </span>
                                            ))}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Notes & Attached PDF Section */}
                {((booking.notes || booking.internalNotes) || booking.pdfUrl) && (
                  <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 text-xs text-zinc-300 font-light">
                    {booking.pdfUrl && (
                      <div className="flex items-center justify-between bg-amber-300/10 border border-amber-300/20 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-300 shrink-0" />
                          <span className="text-amber-200 font-medium truncate max-w-md">
                            {booking.pdfName || "Attached Contract Document.pdf"}
                          </span>
                        </div>
                        <a
                          href={booking.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-amber-300 hover:bg-amber-200 text-zinc-950 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          Open PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.notes && (
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-1">
                            Client Notes
                          </span>
                          <p className="italic">{booking.notes}</p>
                        </div>
                      )}

                      {booking.internalNotes && (
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300 block mb-1">
                            Internal Studio Notes
                          </span>
                          <p className="italic text-zinc-400">{booking.internalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------
          ADD / EDIT BOOKING MODAL
          ---------------------------------------------------- */}
      <AnimatePresence>
        {isModalOpen && editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#1c1a17] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl z-10 my-8 font-sans-clean max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                <div>
                  <h3 className="font-serif-primary text-2xl font-light text-amber-100">
                    {editingBooking._id ? "Edit Booking Details" : "Create New Booking Inquiry"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">
                    Save couple records, multi-date event schedule, PDF contract attachment & crew assignments.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveModal} className="flex flex-col gap-6">
                {/* Couple Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Bride Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aanya Sharma"
                      value={editingBooking.brideName || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, brideName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Groom Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dev Verma"
                      value={editingBooking.groomName || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, groomName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={editingBooking.phone || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="couple@example.com"
                      value={editingBooking.email || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>
                </div>

                {/* Event Primary Date, Time, Venue & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Primary Wedding Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingBooking.weddingDate || ""}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const currentSchedules = editingBooking.dateSchedules || [];
                        if (currentSchedules.length > 0) {
                          currentSchedules[0].date = newDate;
                        }
                        setEditingBooking({
                          ...editingBooking,
                          weddingDate: newDate,
                          dateSchedules: currentSchedules,
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Wedding Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      value={editingBooking.weddingTime || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, weddingTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Primary Venue *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Udaipur Palace"
                      value={editingBooking.venue || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, venue: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-300 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
                      Booking Status *
                    </label>
                    <select
                      value={editingBooking.status || "confirmed"}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          status: e.target.value as Booking["status"],
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300 font-semibold"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="sdp">SDP</option>
                      <option value="all_delivered">All Delivered</option>
                    </select>
                  </div>
                </div>

                {/* City, State, Country & Estimated Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">City</label>
                    <input
                      type="text"
                      placeholder="Udaipur"
                      value={editingBooking.city || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">State</label>
                    <input
                      type="text"
                      placeholder="Rajasthan"
                      value={editingBooking.state || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={editingBooking.country || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      Estimated Budget
                    </label>
                    <input
                      type="text"
                      placeholder="₹2,50,000 - ₹5,00,000"
                      value={editingBooking.budget || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, budget: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                {/* ----------------------------------------------------
                    PDF FILE ATTACHMENT SECTION
                    ---------------------------------------------------- */}
                <div className="flex flex-col gap-2 bg-black/30 border border-white/10 rounded-2xl p-5">
                  <label className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-300" /> PDF Contract / Agreement Attachment
                  </label>

                  {editingBooking.pdfUrl ? (
                    <div className="flex items-center justify-between bg-amber-300/10 border border-amber-300/30 p-3.5 rounded-xl mt-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-300 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs text-amber-100 font-semibold truncate max-w-sm">
                            {editingBooking.pdfName || "Attached Contract Document.pdf"}
                          </span>
                          <span className="text-[10px] text-zinc-400">PDF Document attached</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={editingBooking.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          View PDF <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingBooking({
                              ...editingBooking,
                              pdfUrl: "",
                              pdfName: "",
                            })
                          }
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                          title="Remove PDF Attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-white/15 hover:border-amber-300/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-colors bg-black/20 group cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={isUploadingPdf}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {isUploadingPdf ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                          <span className="text-xs text-amber-200">Uploading PDF document...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-amber-300/10 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                            <FileUp className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-zinc-200 font-medium">
                              Click or Drag & Drop PDF Contract here
                            </span>
                            <span className="text-[10px] text-zinc-400">PDF files up to 50MB</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ----------------------------------------------------
                    DEPARTMENT-WISE PRODUCTION SCHEDULE BUILDER
                    ---------------------------------------------------- */}
                <div className="bg-black/30 border border-amber-300/30 rounded-2xl p-5 flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-amber-200 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-300" /> Department Production Schedule Builder
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                        Each department box contains its own Event Type, Location, Lead & Crew members list.
                      </p>
                    </div>
                  </div>

                  {/* Date Blocks List */}
                  <div className="flex flex-col gap-6">
                    {(editingBooking.dateSchedules || []).map((dateBlock, dateIdx) => (
                      <div
                        key={dateIdx}
                        className="bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative"
                      >
                        {/* Date Block Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] uppercase tracking-widest font-bold text-amber-300">
                              Date #{dateIdx + 1}
                            </span>
                            <input
                              type="date"
                              required
                              value={dateBlock.date || ""}
                              onChange={(e) => updateDateBlockValue(dateIdx, e.target.value)}
                              className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-amber-100 font-medium focus:outline-none focus:border-amber-300"
                            />
                          </div>

                          {(editingBooking.dateSchedules || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDateBlock(dateIdx)}
                              className="text-zinc-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Date Block
                            </button>
                          )}
                        </div>

                        {/* Events Table for this Date */}
                        <div className="flex flex-col gap-4">
                          {(dateBlock.events || []).map((eventRow, eventIdx) => (
                            <div
                              key={eventIdx}
                              className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-4 text-xs relative"
                            >
                              {/* Remove Event Header */}
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                  Occasion #{eventIdx + 1}
                                </span>
                                {(dateBlock.events || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEventFromDateBlock(dateIdx, eventIdx)}
                                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px]"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove Occasion
                                  </button>
                                )}
                              </div>

                              {/* Event / Occasion Type for this Occasion */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] uppercase tracking-widest text-amber-300 font-semibold">
                                    Event / Occasion Type
                                  </label>
                                  <select
                                    value={eventRow.eventType || ""}
                                    onChange={(e) =>
                                      updateEventField(dateIdx, eventIdx, "eventType", e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300"
                                  >
                                    <option value="">Select Event (optional)</option>
                                    {OTHER_EVENT_TYPE_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {eventRow.eventType === "Other" && (
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Custom Event Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ring Ceremony"
                                      value={eventRow.customEventType || ""}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "customEventType", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Department Wise Leads & Crew Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 1. Photography Department Box */}
                                <div className="bg-black/30 border border-amber-300/20 rounded-xl p-3.5 flex flex-col gap-3">
                                  <span className="text-amber-300 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-amber-300/10 pb-1.5">
                                    <Camera className="w-3.5 h-3.5 text-amber-300" /> Photography Department
                                  </span>

                                  {/* Photography Event Type */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Type
                                    </label>
                                    <select
                                      value={eventRow.photographyEventType || "Bride"}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "photographyEventType", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-amber-200 text-xs focus:outline-none focus:border-amber-300"
                                    >
                                      {EVENT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {eventRow.photographyEventType === "None" ? (
                                    <p className="text-[10px] text-zinc-500 italic py-1">
                                      Not applicable for this occasion.
                                    </p>
                                  ) : (
                                    <>
                                  {/* Photography Event Location */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Location
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ponnani"
                                      value={eventRow.photographyLocation || ""}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "photographyLocation", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-amber-300"
                                    />
                                  </div>

                                  {/* Photography Crew Members */}
                                  {eventRow.photographyEventType === "Both" ? (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                        Crew (Bride &amp; Groom Side)
                                      </label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {(["bride", "groom"] as const).map((side) => (
                                          <div key={side} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[9px] uppercase tracking-widest font-semibold text-amber-300">
                                                {side === "bride" ? "Bride" : "Groom"} (
                                                {(side === "bride" ? eventRow.photographyCrewBride : eventRow.photographyCrewGroom)?.length || 0}
                                                )
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "photography", side)}
                                                className="text-amber-300 hover:underline text-[9px] flex items-center"
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                              {((side === "bride" ? eventRow.photographyCrewBride : eventRow.photographyCrewGroom) || []).map(
                                                (crewName, crewIdx) => (
                                                  <div key={crewIdx} className="flex items-center gap-1">
                                                    <select
                                                      value={crewName}
                                                      onChange={(e) =>
                                                        updateDeptCrewMember(
                                                          dateIdx,
                                                          eventIdx,
                                                          "photography",
                                                          crewIdx,
                                                          e.target.value,
                                                          side
                                                        )
                                                      }
                                                      className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                                    >
                                                      <option value="">Select crew...</option>
                                                      {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                        <option value={crewName}>{crewName}</option>
                                                      )}
                                                      {crewOptions.map((c) => (
                                                        <option key={c._id || c.name} value={c.name}>
                                                          {c.name}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeDeptCrewMember(dateIdx, eventIdx, "photography", crewIdx, side)
                                                      }
                                                      className="p-1 text-zinc-500 hover:text-rose-400"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                )
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "photography", side)}
                                                className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-amber-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                              >
                                                <Plus className="w-3 h-3" /> Add
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold flex items-center justify-between">
                                        <span>Crew ({eventRow.photographyCrew?.length || 0})</span>
                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "photography")}
                                          className="text-amber-300 hover:underline text-[9px] flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> Add Crew
                                        </button>
                                      </label>

                                      <div className="flex flex-col gap-1.5">
                                        {(eventRow.photographyCrew || []).map((crewName, crewIdx) => (
                                          <div key={crewIdx} className="flex items-center gap-1">
                                            <select
                                              value={crewName}
                                              onChange={(e) =>
                                                updateDeptCrewMember(
                                                  dateIdx,
                                                  eventIdx,
                                                  "photography",
                                                  crewIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full px-2.5 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                            >
                                              <option value="">Select crew...</option>
                                              {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                <option value={crewName}>{crewName}</option>
                                              )}
                                              {crewOptions.map((c) => (
                                                <option key={c._id || c.name} value={c.name}>
                                                  {c.name}
                                                </option>
                                              ))}
                                            </select>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeDeptCrewMember(dateIdx, eventIdx, "photography", crewIdx)
                                              }
                                              className="p-1 text-zinc-500 hover:text-rose-400"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "photography")}
                                          className="py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-amber-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                        >
                                          <Plus className="w-3 h-3" /> + Add Photography Crew
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                    </>
                                  )}
                                </div>

                                {/* 2. Videography Department Box */}
                                <div className="bg-black/30 border border-sky-300/20 rounded-xl p-3.5 flex flex-col gap-3">
                                  <span className="text-sky-300 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-sky-300/10 pb-1.5">
                                    <Film className="w-3.5 h-3.5 text-sky-300" /> Videography Department
                                  </span>

                                  {/* Videography Event Type */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Type
                                    </label>
                                    <select
                                      value={eventRow.videographyEventType || "Groom"}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "videographyEventType", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-sky-200 text-xs focus:outline-none focus:border-sky-300"
                                    >
                                      {EVENT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {eventRow.videographyEventType === "None" ? (
                                    <p className="text-[10px] text-zinc-500 italic py-1">
                                      Not applicable for this occasion.
                                    </p>
                                  ) : (
                                    <>
                                  {/* Videography Event Location */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Location
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Calicut"
                                      value={eventRow.videographyLocation || ""}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "videographyLocation", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-sky-300"
                                    />
                                  </div>

                                  {/* Videography Crew Members */}
                                  {eventRow.videographyEventType === "Both" ? (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                        Crew (Bride &amp; Groom Side)
                                      </label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {(["bride", "groom"] as const).map((side) => (
                                          <div key={side} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[9px] uppercase tracking-widest font-semibold text-sky-300">
                                                {side === "bride" ? "Bride" : "Groom"} (
                                                {(side === "bride" ? eventRow.videographyCrewBride : eventRow.videographyCrewGroom)?.length || 0}
                                                )
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "videography", side)}
                                                className="text-sky-300 hover:underline text-[9px] flex items-center"
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                              {((side === "bride" ? eventRow.videographyCrewBride : eventRow.videographyCrewGroom) || []).map(
                                                (crewName, crewIdx) => (
                                                  <div key={crewIdx} className="flex items-center gap-1">
                                                    <select
                                                      value={crewName}
                                                      onChange={(e) =>
                                                        updateDeptCrewMember(
                                                          dateIdx,
                                                          eventIdx,
                                                          "videography",
                                                          crewIdx,
                                                          e.target.value,
                                                          side
                                                        )
                                                      }
                                                      className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                                    >
                                                      <option value="">Select crew...</option>
                                                      {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                        <option value={crewName}>{crewName}</option>
                                                      )}
                                                      {crewOptions.map((c) => (
                                                        <option key={c._id || c.name} value={c.name}>
                                                          {c.name}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeDeptCrewMember(dateIdx, eventIdx, "videography", crewIdx, side)
                                                      }
                                                      className="p-1 text-zinc-500 hover:text-rose-400"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                )
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "videography", side)}
                                                className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-sky-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                              >
                                                <Plus className="w-3 h-3" /> Add
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold flex items-center justify-between">
                                        <span>Crew ({eventRow.videographyCrew?.length || 0})</span>
                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "videography")}
                                          className="text-sky-300 hover:underline text-[9px] flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> Add Crew
                                        </button>
                                      </label>

                                      <div className="flex flex-col gap-1.5">
                                        {(eventRow.videographyCrew || []).map((crewName, crewIdx) => (
                                          <div key={crewIdx} className="flex items-center gap-1">
                                            <select
                                              value={crewName}
                                              onChange={(e) =>
                                                updateDeptCrewMember(
                                                  dateIdx,
                                                  eventIdx,
                                                  "videography",
                                                  crewIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full px-2.5 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                            >
                                              <option value="">Select crew...</option>
                                              {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                <option value={crewName}>{crewName}</option>
                                              )}
                                              {crewOptions.map((c) => (
                                                <option key={c._id || c.name} value={c.name}>
                                                  {c.name}
                                                </option>
                                              ))}
                                            </select>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeDeptCrewMember(dateIdx, eventIdx, "videography", crewIdx)
                                              }
                                              className="p-1 text-zinc-500 hover:text-rose-400"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "videography")}
                                          className="py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-sky-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                        >
                                          <Plus className="w-3 h-3" /> + Add Videography Crew
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                    </>
                                  )}
                                </div>

                                {/* 3. Drone Operations Department Box */}
                                <div className="bg-black/30 border border-emerald-300/20 rounded-xl p-3.5 flex flex-col gap-3">
                                  <span className="text-emerald-300 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-emerald-300/10 pb-1.5">
                                    <Radio className="w-3.5 h-3.5 text-emerald-300" /> Drone Department
                                  </span>

                                  {/* Drone Event Type */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Type
                                    </label>
                                    <select
                                      value={eventRow.droneEventType || "Both"}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "droneEventType", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-emerald-200 text-xs focus:outline-none focus:border-emerald-300"
                                    >
                                      {EVENT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {eventRow.droneEventType === "None" ? (
                                    <p className="text-[10px] text-zinc-500 italic py-1">
                                      Not applicable for this occasion.
                                    </p>
                                  ) : (
                                    <>
                                  {/* Drone Event Location */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                      Event Location
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Kochi"
                                      value={eventRow.droneLocation || ""}
                                      onChange={(e) =>
                                        updateEventField(dateIdx, eventIdx, "droneLocation", e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-emerald-300"
                                    />
                                  </div>

                                  {/* Drone Crew Members */}
                                  {eventRow.droneEventType === "Both" ? (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                                        Crew (Bride &amp; Groom Side)
                                      </label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {(["bride", "groom"] as const).map((side) => (
                                          <div key={side} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[9px] uppercase tracking-widest font-semibold text-emerald-300">
                                                {side === "bride" ? "Bride" : "Groom"} (
                                                {(side === "bride" ? eventRow.droneCrewBride : eventRow.droneCrewGroom)?.length || 0}
                                                )
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "drone", side)}
                                                className="text-emerald-300 hover:underline text-[9px] flex items-center"
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                              {((side === "bride" ? eventRow.droneCrewBride : eventRow.droneCrewGroom) || []).map(
                                                (crewName, crewIdx) => (
                                                  <div key={crewIdx} className="flex items-center gap-1">
                                                    <select
                                                      value={crewName}
                                                      onChange={(e) =>
                                                        updateDeptCrewMember(
                                                          dateIdx,
                                                          eventIdx,
                                                          "drone",
                                                          crewIdx,
                                                          e.target.value,
                                                          side
                                                        )
                                                      }
                                                      className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                                    >
                                                      <option value="">Select crew...</option>
                                                      {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                        <option value={crewName}>{crewName}</option>
                                                      )}
                                                      {crewOptions.map((c) => (
                                                        <option key={c._id || c.name} value={c.name}>
                                                          {c.name}
                                                        </option>
                                                      ))}
                                                    </select>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        removeDeptCrewMember(dateIdx, eventIdx, "drone", crewIdx, side)
                                                      }
                                                      className="p-1 text-zinc-500 hover:text-rose-400"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                )
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => addDeptCrewMember(dateIdx, eventIdx, "drone", side)}
                                                className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-emerald-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                              >
                                                <Plus className="w-3 h-3" /> Add
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 pt-1">
                                      <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold flex items-center justify-between">
                                        <span>Crew ({eventRow.droneCrew?.length || 0})</span>
                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "drone")}
                                          className="text-emerald-300 hover:underline text-[9px] flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> Add Crew
                                        </button>
                                      </label>

                                      <div className="flex flex-col gap-1.5">
                                        {(eventRow.droneCrew || []).map((crewName, crewIdx) => (
                                          <div key={crewIdx} className="flex items-center gap-1">
                                            <select
                                              value={crewName}
                                              onChange={(e) =>
                                                updateDeptCrewMember(
                                                  dateIdx,
                                                  eventIdx,
                                                  "drone",
                                                  crewIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full px-2.5 py-1 rounded bg-black/50 border border-white/10 text-zinc-200 text-xs"
                                            >
                                              <option value="">Select crew...</option>
                                              {crewName && !crewOptions.some((c) => c.name === crewName) && (
                                                <option value={crewName}>{crewName}</option>
                                              )}
                                              {crewOptions.map((c) => (
                                                <option key={c._id || c.name} value={c.name}>
                                                  {c.name}
                                                </option>
                                              ))}
                                            </select>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeDeptCrewMember(dateIdx, eventIdx, "drone", crewIdx)
                                              }
                                              className="p-1 text-zinc-500 hover:text-rose-400"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          type="button"
                                          onClick={() => addDeptCrewMember(dateIdx, eventIdx, "drone")}
                                          className="py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-[10px] text-emerald-200 flex items-center gap-1 transition-colors self-start mt-0.5"
                                        >
                                          <Plus className="w-3 h-3" /> + Add Drone Crew
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Event under this Date */}
                        <button
                          type="button"
                          onClick={() => addEventToDateBlock(dateIdx)}
                          className="self-start text-xs text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1.5 mt-1"
                        >
                          <PlusCircle className="w-4 h-4" /> + Add Another Occasion under {dateBlock.date || "this date"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Another Date Block */}
                  <button
                    type="button"
                    onClick={addDateBlock}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs text-amber-200 font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> + Add Another Date Block
                  </button>
                </div>

                {/* Financials & Payment Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                      Advance Received (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="50,000"
                      value={editingBooking.advancePayment || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, advancePayment: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                      Remaining Amount (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="2,00,000"
                      value={editingBooking.remainingAmount || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, remainingAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      Payment Status
                    </label>
                    <select
                      value={editingBooking.paymentStatus || "unpaid"}
                      onChange={(e) =>
                        setEditingBooking({
                          ...editingBooking,
                          paymentStatus: e.target.value as Booking["paymentStatus"],
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial Advance</option>
                      <option value="paid">Fully Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Special Notes & Internal Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      Client Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any specific requests from couple..."
                      value={editingBooking.notes || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      Internal Studio Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Internal team notes, equipment prep..."
                      value={editingBooking.internalNotes || ""}
                      onChange={(e) => setEditingBooking({ ...editingBooking, internalNotes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs resize-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs uppercase tracking-widest font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPdf}
                    className="px-8 py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-zinc-950 text-xs uppercase tracking-widest font-semibold transition-all shadow-lg flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Save Booking Record
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
