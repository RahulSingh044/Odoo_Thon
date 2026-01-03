"use client";

import React, { useState } from "react";
import {
    CalendarDays,
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
    Filter,
    ArrowLeft,
    ChevronRight,
    Info
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

export default function LeaveManagementPage() {
    const router = useRouter();
    const [activeType, setActiveType] = useState("paid");

    const leaveHistory = [
        { id: 1, type: "Paid Leave", start: "Oct 12, 2025", end: "Oct 14, 2025", days: 3, status: "Approved", reason: "Family Event" },
        { id: 2, type: "Sick Leave", start: "Sep 05, 2025", end: "Sep 05, 2025", days: 1, status: "Approved", reason: "Medical" },
        { id: 3, type: "Unpaid Leave", start: "Aug 20, 2025", end: "Aug 22, 2025", days: 2, status: "Rejected", reason: "Personal" },
        { id: 4, type: "Paid Leave", start: "Nov 01, 2025", end: "Nov 02, 2025", days: 2, status: "Pending", reason: "Vacation" },
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-zinc-300 p-6 md:p-10 selection:bg-[#017E84]/30">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Navigation & Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <button onClick={() => router.push("/")} className="flex items-center cursor-pointer gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            Leave <span className="text-[#714B67]">Management</span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Request time off and track your attendance history.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-400 py-2 px-4">
                            Fiscal Year: 2025-26
                        </Badge>
                    </div>
                </header>

                {/* Top Section: Balances & New Request */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Leave Request Form */}
                    <Card className="lg:col-span-2 bg-[#1B1B1B]/40 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="text-[#017E84]" size={20} /> New Leave Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Leave Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Paid', 'Sick', 'Unpaid'].map((type) => (
                                            <Button
                                                key={type}
                                                variant="outline"
                                                onClick={() => setActiveType(type.toLowerCase())}
                                                className={`text-xs font-bold border-white/5 h-10 transition-all ${activeType === type.toLowerCase()
                                                    ? "bg-[#714B67] text-white border-[#714B67]"
                                                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reason / Note</label>
                                    <Input className="bg-white/5 border-white/10 text-white h-10" placeholder="Briefly explain..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Start Date</label>
                                    <Calendar22 />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">End Date</label>
                                    <Calendar22 />
                                </div>
                            </div>
                            <Button className="w-full bg-[#017E84] hover:bg-[#019A9E] text-white font-black uppercase tracking-[0.2em] h-12 shadow-lg shadow-[#017E84]/20 transition-all">
                                Submit Request
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Balance Sidebar (Detailed Version) */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-[#1B1B1B] to-[#0F0F0F] border-white/10 overflow-hidden relative">
                            <CalendarDays className="absolute -right-6 -bottom-6 text-white/5" size={120} />
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Remaining</CardDescription>
                                <CardTitle className="text-5xl font-black text-white tracking-tighter">12.5 <span className="text-sm font-normal text-zinc-600 uppercase">Days</span></CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="space-y-4">
                                    {[
                                        { label: "Paid Leaves", val: "8.5", total: "15", color: "bg-[#714B67]" },
                                        { label: "Sick Leaves", val: "4.0", total: "10", color: "bg-emerald-500" },
                                        { label: "Unpaid Leaves", val: "2.0", total: "∞", color: "bg-zinc-500" },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span className="text-zinc-400">{item.label}</span>
                                                <span className="text-white">{item.val} / {item.total}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full">
                                                <div className={`h-full ${item.color} rounded-full`} style={{ width: i === 2 ? '20%' : `${(Number(item.val) / Number(item.total)) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-start gap-3">
                                    <Info className="text-yellow-500 shrink-0" size={14} />
                                    <p className="text-[10px] text-yellow-200/70 font-medium leading-relaxed uppercase tracking-tighter">
                                        1 Pending request is currently being reviewed by Rahul Singh (Admin).
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: History Table */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-[#017E84]" size={20} /> Request History
                        </h2>
                        <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-8">
                            <Filter size={12} className="mr-2" /> Filter By Status
                        </Button>
                    </div>

                    <Card className="bg-[#1B1B1B]/40 border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Leave Type</th>
                                        <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Duration</th>
                                        <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Days</th>
                                        <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reason</th>
                                        <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaveHistory.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <span className="text-xs font-bold text-white group-hover:text-[#017E84] transition-colors">{leave.type}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[11px] text-zinc-400 font-medium">{leave.start} - {leave.end}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-white font-bold">{leave.days}d</td>
                                            <td className="p-4 text-xs text-zinc-500">{leave.reason}</td>
                                            <td className="p-4">
                                                <Badge className={`
                          text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 border-none
                          ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        leave.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'}
                        `}>
                                                    {leave.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white">
                                                    <ChevronRight size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}