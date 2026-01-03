"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    FileSpreadsheet,
    ArrowLeft,
    ArrowUpRight,
    X,
    Loader2,
} from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function AdminAttendanceDashboard() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [today, setToday] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState([]);

    // 1. Static Fallback Data
    const employeeLogs = [
        { id: "1", name: "John Doe", role: "UI Designer", checkIn: "08:55 AM", checkOut: "06:05 PM", status: "On Time", hours: "9.1h" },
        { id: "2", name: "Sarah Smith", role: "DevOps", checkIn: "09:45 AM", checkOut: "07:00 PM", status: "Late", hours: "9.2h" },
        { id: "3", name: "Mike Ross", role: "Backend Dev", checkIn: "09:02 AM", checkOut: "06:15 PM", status: "On Time", hours: "9.2h" },
        { id: "4", name: "Harvey Specter", role: "Manager", checkIn: "08:30 AM", checkOut: "08:00 PM", status: "On Time", hours: "11.5h" },
        { id: "5", name: "Rachel Zane", role: "Researcher", checkIn: "09:00 AM", checkOut: "05:00 PM", status: "On Time", hours: "8.0h" },
    ];

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setToday(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 2. Fetch API Data
    const getAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/attendance", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const result = await response.json();
            if (result.data) setApiData(result.data);
        } catch (error) {
            console.error("API Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAttendance();
    }, []);

    // 3. Determine source of truth (API or Fallback)
    const sourceData = apiData.length > 0 ? apiData : employeeLogs;

    // 4. Search Filter
    const filteredEmployees = useMemo(() => {
        return sourceData.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, sourceData]);

    // 5. EXPORT FUNCTION
    const handleExport = () => {
        if (filteredEmployees.length === 0) return;
        setIsExporting(true);

        // Define Headers
        const headers = ["ID", "Name", "Role", "Check In", "Check Out", "Status", "Total Hours"];

        // Map data to rows
        const rows = filteredEmployees.map(emp => [
            emp.id,
            `"${emp.name}"`, // Wrap in quotes to handle names with commas
            `"${emp.role}"`,
            emp.checkIn,
            emp.checkOut,
            emp.status,
            emp.hours
        ]);

        // Combine into CSV string
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        // Create blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        const fileName = `Attendance_Log_${today.toISOString().split('T')[0]}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // UI feedback delay
        setTimeout(() => setIsExporting(false), 800);
    };

    const formattedDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-300 p-6 md:p-10 selection:bg-[#017E84]/30">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-[#017E84] transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <ArrowLeft size={14} /> Back to Command
                        </button>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            Personnel <span className="text-[#017E84]">Logs</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-[#017E84]/10 border-[#017E84]/20 text-[#017E84] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                {formattedDay}
                            </Badge>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-70">
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-[#017E84]' : 'text-zinc-600'}`} size={16} />
                            <Input
                                placeholder="Search by name or role..."
                                className="bg-white/5 border-white/10 w-80 pl-12 pr-10 rounded-2xl h-12 focus:border-[#017E84] transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting || filteredEmployees.length === 0}
                            className="bg-white text-black hover:bg-zinc-200 h-12 rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileSpreadsheet size={16} className="mr-2" />}
                            {isExporting ? "Processing..." : "Export Logs"}
                        </Button>
                    </div>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Matrix Data", val: loading ? "..." : sourceData.length.toString().padStart(2, '0'), sub: "Total Personnel", color: "text-[#017E84]" },
                        { label: "Late Entries", val: loading ? "..." : sourceData.filter(e => e.status === "Late").length.toString().padStart(2, '0'), sub: "Flagged Today", color: "text-orange-500" },
                        { label: "Matches", val: filteredEmployees.length.toString().padStart(2, '0'), sub: "Filtered View", color: "text-white" }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-[#111] border-white/5 group">
                            <CardHeader className="pb-4">
                                <CardDescription className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] group-hover:text-[#017E84] transition-colors">{stat.label}</CardDescription>
                                <CardTitle className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.val}</CardTitle>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{stat.sub}</p>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Table Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Daily Log Matrix</h2>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            {loading && <Loader2 size={10} className="animate-spin" />}
                            Showing {filteredEmployees.length} of {sourceData.length}
                        </span>
                    </div>

                    <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <Table>
                            <TableHeader className="bg-white/[0.02] border-b border-white/5">
                                <TableRow className="border-none">
                                    <TableHead className="text-[10px] font-black uppercase text-zinc-500 py-6 px-8">Employee Identity</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-zinc-500">Entry</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-zinc-500">Exit</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-zinc-500">Active Time</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-zinc-500">Status</TableHead>
                                    <TableHead className="text-right px-8"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[11px] font-black text-[#017E84] group-hover:border-[#017E84]/50 transition-colors">
                                                        {log.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white tracking-tight">{log.name}</p>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">{log.role}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-zinc-500">{log.checkIn}</TableCell>
                                            <TableCell className="font-mono text-xs text-zinc-500">{log.checkOut}</TableCell>
                                            <TableCell className="font-mono text-xs text-white font-bold">{log.hours}</TableCell>
                                            <TableCell>
                                                <Badge className={`bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest ${log.status === 'Late' ? 'text-orange-500' : 'text-[#017E84]'}`}>
                                                    ● {log.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#017E84] hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                                    <ArrowUpRight size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {loading ? "Decrypting Live Data..." : `No records found matching "${searchQuery}"`}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}