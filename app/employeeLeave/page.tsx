"use client";

import React, { useState } from "react";
import {
    CalendarDays,
    Clock,
    Plus,
    Filter,
    ArrowLeft,
    ChevronRight,
    Info,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Calendar22 } from "@/components/calendarDropdown";
import { toast } from "react-hot-toast";

/* =======================
   Types
======================= */
type LeaveStatus = "Approved" | "Rejected" | "Pending";

type LeaveHistory = {
    id: number;
    type: string;
    start: string;
    end: string;
    days: number;
    status: LeaveStatus;
    reason: string;
};

export default function LeaveManagementPage() {
    const router = useRouter();

    /* =======================
       State
    ======================= */
    const [activeType, setActiveType] = useState<"paid" | "sick" | "unpaid">("paid");
    const [reason, setReason] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const leaveHistory: LeaveHistory[] = [
        { id: 1, type: "Paid Leave", start: "Oct 12, 2025", end: "Oct 14, 2025", days: 3, status: "Approved", reason: "Family Event" },
        { id: 2, type: "Sick Leave", start: "Sep 05, 2025", end: "Sep 05, 2025", days: 1, status: "Approved", reason: "Medical" },
        { id: 3, type: "Unpaid Leave", start: "Aug 20, 2025", end: "Aug 22, 2025", days: 2, status: "Rejected", reason: "Personal" },
        { id: 4, type: "Paid Leave", start: "Nov 01, 2025", end: "Nov 02, 2025", days: 2, status: "Pending", reason: "Vacation" },
    ];

    /* =======================
       Apply Leave Method
    ======================= */
    const handleLeaveRequest = async () => {
        if (!startDate || !endDate || !reason.trim()) {
            alert("Please fill all required fields");
            return;
        }

        if (endDate < startDate) {
            toast.error("End date cannot be before start date");
            return;
        }

        setSubmitting(true);

        const payload = {
            type: activeType.toUpperCase(), // PAID | SICK | UNPAID
            startDate,
            endDate,
            reason,
        };

        try {
            const res = await fetch("/api/user/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            // console.log("apply leave", await res.json())

            toast.success("Leave applied successfully");

            if (!res.ok) throw new Error("Failed to apply leave");




        } catch (error) {
            console.error(error);
        } finally {
            setReason("");
            setStartDate(null);
            setEndDate(null);
            setActiveType("paid");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-zinc-300 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-4"
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            Leave <span className="text-[#714B67]">Management</span>
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Request time off and track leave history
                        </p>
                    </div>
                </header>

                {/* TOP SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* FORM */}
                    <Card className="lg:col-span-2 bg-[#1B1B1B]/40 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="text-[#017E84]" size={20} /> New Leave Request
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Leave Type */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500">
                                        Leave Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {["paid", "sick", "unpaid"].map((type) => (
                                            <Button
                                                key={type}
                                                variant="outline"
                                                onClick={() => setActiveType(type as any)}
                                                className={`h-10 text-xs font-bold ${activeType === type
                                                    ? "bg-[#714B67] text-white"
                                                    : "bg-white/5 text-zinc-400"
                                                    }`}
                                            >
                                                {type.toUpperCase()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500">
                                        Reason
                                    </label>
                                    <Input
                                        className="bg-white/5 border-white/10 mt-2"
                                        placeholder="Briefly explain..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500">
                                        Start Date
                                    </label>
                                    <Calendar22 value={startDate} onChange={setStartDate} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-500">
                                        End Date
                                    </label>
                                    <Calendar22 value={endDate} onChange={setEndDate} />
                                </div>
                            </div>

                            <Button
                                onClick={handleLeaveRequest}
                                disabled={submitting}
                                className="w-full bg-[#017E84] hover:bg-[#019A9E] font-black uppercase tracking-widest h-12"
                            >
                                {submitting ? "Submitting..." : "Submit Request"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* BALANCE */}
                    <Card className="bg-[#1B1B1B] border-white/10 relative">
                        <CalendarDays className="absolute -right-6 -bottom-6 text-white/5" size={120} />
                        <CardHeader>
                            <CardDescription className="uppercase text-[10px]">
                                Remaining Balance
                            </CardDescription>
                            <CardTitle className="text-5xl">12.5 Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3">
                                <Info size={14} className="text-yellow-500" />
                                <p className="text-[10px] uppercase">
                                    1 request pending admin approval
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HISTORY */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                        <Clock size={20} className="text-[#017E84]" /> Request History
                    </h2>

                    <Card className="bg-[#1B1B1B]/40 border-white/10">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    {["Type", "Duration", "Days", "Reason", "Status", ""].map(h => (
                                        <th key={h} className="p-4 text-[10px] uppercase text-zinc-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leaveHistory.map((leave) => (
                                    <tr key={leave.id} className="border-t border-white/5">
                                        <td className="p-4 font-bold">{leave.type}</td>
                                        <td className="p-4 text-xs text-zinc-400">
                                            {leave.start} - {leave.end}
                                        </td>
                                        <td className="p-4 font-mono">{leave.days}d</td>
                                        <td className="p-4 text-xs text-zinc-500">{leave.reason}</td>
                                        <td className="p-4">
                                            <Badge className={
                                                leave.status === "Approved"
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : leave.status === "Rejected"
                                                        ? "bg-red-500/10 text-red-500"
                                                        : "bg-yellow-500/10 text-yellow-500"
                                            }>
                                                {leave.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight size={16} className="text-zinc-500" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>

            </div>
        </div>
    );
}
