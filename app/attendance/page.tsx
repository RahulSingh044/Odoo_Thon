"use client";

import React, { useState } from "react";
import {
    Clock,
    Calendar,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Timer,
    CheckCircle2,
    AlertCircle,
    FileSpreadsheet,
    MapPin,
    Monitor
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
    const router = useRouter();
    const [view, setView] = useState("monthly");

    const attendanceData = [
        { date: "Oct 24, 2025", day: "Friday", checkIn: "09:02 AM", checkOut: "06:15 PM", total: "09h 13m", status: "On Time" },
        { date: "Oct 23, 2025", day: "Thursday", checkIn: "09:45 AM", checkOut: "06:30 PM", total: "08h 45m", status: "Late" },
        { date: "Oct 22, 2025", day: "Wednesday", checkIn: "08:55 AM", checkOut: "05:55 PM", total: "09h 00m", status: "On Time" },
        { date: "Oct 21, 2025", day: "Tuesday", checkIn: "09:10 AM", checkOut: "06:45 PM", total: "09h 35m", status: "On Time" },
        { date: "Oct 20, 2025", day: "Monday", checkIn: "09:00 AM", checkOut: "06:00 PM", total: "09h 00m", status: "On Time" },
    ];

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-zinc-300 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <button onClick={() => router.push("/")} className="flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            Attendance <span className="text-[#017E84]">Logs</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-400 font-bold text-xs h-10 hover:text-white">
                            <FileSpreadsheet size={16} className="mr-2 text-[#017E84]" /> Export CSV
                        </Button>
                    </div>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-[#1B1B1B]/40 border-white/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-black uppercase text-zinc-500">Avg. Check-In</CardDescription>
                            <CardTitle className="text-2xl text-white font-black">09:12 AM</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-[#1B1B1B]/40 border-white/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-black uppercase text-zinc-500">Working Days</CardDescription>
                            <CardTitle className="text-2xl text-white font-black">18 / 22</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-[#1B1B1B]/40 border-white/10">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-[10px] font-black uppercase text-zinc-500">Overtime (MTD)</CardDescription>
                            <CardTitle className="text-2xl text-[#017E84] font-black">+12h 40m</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* View Switcher Tabs */}
                <Tabs defaultValue="monthly" className="w-full space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-white/5 border border-white/10 p-1">
                            <TabsTrigger value="monthly" className="data-[state=active]:bg-[#017E84] data-[state=active]:text-white text-xs font-bold px-6">Monthly View</TabsTrigger>
                            <TabsTrigger value="weekly" className="data-[state=active]:bg-[#017E84] data-[state=active]:text-white text-xs font-bold px-6">Weekly View</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <button className="text-zinc-500 hover:text-white"><ChevronLeft size={18} /></button>
                            <span className="text-xs font-black uppercase tracking-widest text-white">October 2025</span>
                            <button className="text-zinc-500 hover:text-white"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <TabsContent value="monthly" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* LEFT: High-Density Calendar Matrix (8 Columns) */}
                            <Card className="lg:col-span-8 bg-[#1B1B1B]/40 border-white/10 backdrop-blur-sm overflow-hidden">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Monthly Attendance Matrix</h3>
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px]">18 Present</Badge>
                                        <Badge className="bg-red-500/10 text-red-500 border-none text-[9px]">2 Late</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 border-collapse">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                                        <div key={d} className="py-2 text-center border-b border-white/5 bg-white/[0.02]">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase">{d}</span>
                                        </div>
                                    ))}

                                    {/* Calendar Cells */}
                                    {Array.from({ length: 31 }).map((_, i) => {
                                        const day = i + 1;
                                        const isSelected = day === 24;
                                        const hasData = day >= 20 && day <= 24;
                                        const isLate = day === 23;

                                        return (
                                            <div
                                                key={i}
                                                className={`h-24 border-r border-b border-white/5 p-2 transition-all cursor-pointer group relative
                ${isSelected ? 'bg-[#017E84]/10' : 'hover:bg-white/[0.03]'}
              `}
                                            >
                                                <span className={`text-[10px] font-bold ${isSelected ? 'text-[#017E84]' : 'text-zinc-500'}`}>
                                                    {day.toString().padStart(2, '0')}
                                                </span>

                                                {hasData && (
                                                    <div className="mt-2 space-y-1">
                                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div className={`h-full ${isLate ? 'bg-orange-500' : 'bg-[#017E84]'} w-full`} />
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">09:00</span>
                                                            {isLate && <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />}
                                                        </div>
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div className="absolute top-0 right-0 p-1">
                                                        <div className="w-1 h-1 rounded-full bg-[#017E84]" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* RIGHT: Detail & Shift Insights (4 Columns) */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="bg-[#1B1B1B]/60 border-[#017E84]/30 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Clock size={80} strokeWidth={1} />
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-[10px] font-black uppercase text-[#017E84]">Selected Day Details</CardDescription>
                                        <CardTitle className="text-xl text-white font-black">Friday, Oct 24</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase">Check In</p>
                                                <p className="text-sm font-mono text-white font-bold">09:02 AM</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase">Check Out</p>
                                                <p className="text-sm font-mono text-white font-bold">06:15 PM</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span className="text-zinc-500">Shift Completion</span>
                                                <span className="text-emerald-500">102%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-full" />
                                            </div>
                                        </div>

                                        <Separator className="bg-white/5" />

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs">
                                                <Monitor size={14} className="text-zinc-500" />
                                                <span className="text-zinc-300">Logged via <b className="text-white">Web Terminal</b></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <MapPin size={14} className="text-zinc-500" />
                                                <span className="text-zinc-300">Office Location: <b className="text-white">HQ - Pune</b></span>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] py-6">
                                            Raise Correction Request
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Monthly Accumulation Card */}
                                <Card className="bg-[#714B67]/10 border-[#714B67]/20 p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="p-2 bg-[#714B67]/20 rounded-lg">
                                            <Timer size={20} className="text-[#714B67]" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase">Total Working Hours</p>
                                            <p className="text-xl font-black text-white">168.5h</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                                        You have completed 92% of your required monthly hours. 12h remaining to meet target.
                                    </p>
                                </Card>
                            </div>

                        </div>
                    </TabsContent>

                    <TabsContent value="weekly" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <Card key={day} className={`border-white/10 ${i > 4 ? 'bg-black/40 opacity-50' : 'bg-[#1B1B1B]/40'}`}>
                                    <CardHeader className="p-4 text-center border-b border-white/5">
                                        <CardTitle className="text-xs font-black uppercase tracking-widest">{day}</CardTitle>
                                        <p className="text-[10px] text-zinc-500">Oct {20 + i}</p>
                                    </CardHeader>
                                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[120px] space-y-2">
                                        {i < 5 ? (
                                            <>
                                                <div className="h-12 w-12 rounded-full border-2 border-[#017E84] flex items-center justify-center text-[10px] font-black text-white">
                                                    9.2h
                                                </div>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase">Regular</span>
                                            </>
                                        ) : (
                                            <span className="text-[9px] font-black text-zinc-600 uppercase italic">Weekend</span>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}