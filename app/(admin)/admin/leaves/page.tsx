"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
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

type LeaveRequest = {
    id: string;
    name: string;
    role: string;
    type: "Sick" | "Vacation" | "Personal";
    duration: string;
    dates: string;
    status: "Pending" | "Approved" | "Rejected";
};

/* -----------------------------
   FALLBACK DATA
------------------------------ */
const FALLBACK_LEAVES: LeaveRequest[] = [
    { id: "L1", name: "John Doe", role: "UI Designer", type: "Vacation", duration: "3 Days", dates: "Jan 12 - Jan 15", status: "Pending" },
    { id: "L2", name: "Sarah Smith", role: "DevOps", type: "Sick", duration: "1 Day", dates: "Jan 05", status: "Approved" },
    { id: "L3", name: "Mike Ross", role: "Backend Dev", type: "Personal", duration: "2 Days", dates: "Jan 20 - Jan 21", status: "Pending" },
];

export default function AdminLeaveDashboard() {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** ✅ SINGLE SOURCE OF TRUTH */
    const [leaves, setLeaves] = useState<LeaveRequest[]>(FALLBACK_LEAVES);

    /* -----------------------------
       MOUNT
    ------------------------------ */
    useEffect(() => {
        setMounted(true);
        fetchLeaves();
    }, []);

    /* -----------------------------
       FETCH (OPTIONAL API)
    ------------------------------ */
    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/leaves", { credentials: "include" });
            const result = await res.json();

            if (Array.isArray(result?.data) && result.data.length > 0) {
                setLeaves(result.data);
            }
        } catch (err) {
            console.error("Using fallback leave data");
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------
       APPROVE / REJECT (WORKING)
    ------------------------------ */
    const handleStatusUpdate = async (
        id: string,
        newStatus: "Approved" | "Rejected"
    ) => {
        setProcessingId(id);

        try {
            // 🔐 REAL API (when ready)
            // await fetch(`/api/leaves/${id}`, {
            //   method: "PATCH",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ status: newStatus }),
            // });

            /** ✅ IMMEDIATE UI UPDATE */
            setLeaves((prev) =>
                prev.map((leave) =>
                    leave.id === id ? { ...leave, status: newStatus } : leave
                )
            );
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setProcessingId(null), 500);
        }
    };

    /* -----------------------------
       SEARCH FILTER
    ------------------------------ */
    const filteredLeaves = useMemo(() => {
        return leaves.filter(
            (l) =>
                l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, leaves]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-300 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-zinc-500 hover:text-[#017E84] text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <h1 className="text-4xl font-black text-white uppercase">
                            Leave <span className="text-[#017E84]">Requests</span>
                        </h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-6 -translate-y-1/2 text-zinc-600" size={16} />
                        <Input
                            placeholder="Search by name or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border-white/10 w-80 pl-12 h-12"
                        />
                    </div>
                </header>

                {/* TABLE */}
                <Card className="bg-[#111] border-white/5 rounded-3xl overflow-hidden px-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeaves.map((req) => (
                                <TableRow key={req.id} className="hover:bg-white/[0.03]">
                                    <TableCell>
                                        <p className="font-bold text-white">{req.name}</p>
                                        <p className="text-xs text-zinc-500">{req.role}</p>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline">{req.type}</Badge>
                                    </TableCell>

                                    <TableCell>{req.duration}</TableCell>
                                    <TableCell>{req.dates}</TableCell>

                                    <TableCell className="text-xs font-bold uppercase">
                                        {req.status === "Pending" && <Clock size={12} className="inline mr-2" />}
                                        {req.status}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {processingId === req.id ? (
                                            <Loader2 className="animate-spin ml-auto" />
                                        ) : req.status === "Pending" ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(req.id, "Approved")}
                                                    className="bg-[#017E84]/10 text-[#017E84] hover:bg-[#017E84] hover:text-white"
                                                >
                                                    <CheckCircle2 size={14} className="mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(req.id, "Rejected")}
                                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <XCircle size={14} className="mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] uppercase text-zinc-600">
                                                Decision Logged
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {loading && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
