"use client";

import React, { useEffect, useState } from "react";
import {
    Search, UserPlus, ShieldCheck, Globe, ArrowUpRight, Building2, MapPin, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import OdooRegisterForm from "@/components/auth/register";

export default function AdminEmployeeDirectory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getEmployee = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/admin/employees/list", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch employees");

            const data = await response.json();

            const employeeData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
            console.log(employeeData);
            setEmployees(employeeData);

        } catch (error) {
            console.error("Fetch error:", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEmployee();
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const nameMatch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = emp.user?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || idMatch;
    });

    return (
        <div className="mx-auto space-y-10 p-8 bg-[#0A0A0A] min-h-screen text-zinc-400">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Employee Directory</h1>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Management & Oversight</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#017E84] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-[#017E84]/50 transition-all text-white font-medium"
                        />
                    </div>
                    <button className="bg-[#017E84] text-white p-3 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#017E84]/20">
                        <OdooRegisterForm onRefresh={() => getEmployee} />
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                    <Loader2 className="animate-spin" size={24} />
                </div>
            )}

            {/* --- CARD GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                        <div
                            key={emp.id}
                            onClick={() => router.push(`/admin/profile/${emp.id}`)}
                            className="group cursor-pointer"
                        >
                            <Card className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 transition-all duration-300 group-hover:bg-[#161616] group-hover:border-[#017E84]/30 group-hover:-translate-y-1 relative overflow-hidden shadow-2xl">

                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#017E84]/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-[#017E84]/10 transition-colors" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 p-1 group-hover:border-[#017E84]/50 transition-colors">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                                                alt={emp.name}
                                                className="rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className="border-none px-3 py-1 text-[8px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-500">
                                                {emp.user?.role || "STAFF"}
                                            </Badge>
                                            <span className="text-[9px] font-mono text-zinc-700 font-bold tracking-tighter">
                                                {emp.user?.employeeId || "NO ID"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-white tracking-tight group-hover:text-[#017E84] transition-colors">
                                                {emp.name}
                                            </h3>
                                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-zinc-600 translate-y-1 group-hover:translate-y-0" />
                                        </div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">
                                            {emp.designation?.name || "Role Not Set"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 truncate">
                                            <Building2 size={12} className="text-[#017E84] shrink-0" />
                                            {emp.designation?.description || "No Description"}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600">
                                            <MapPin size={12} className="text-[#017E84] shrink-0" />
                                            {emp.address || "Remote"}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-[#0A0A0A] flex items-center justify-center"><ShieldCheck size={10} /></div>
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-[#0A0A0A] flex items-center justify-center"><Globe size={10} /></div>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-zinc-700 group-hover:text-white transition-colors">
                                            View Full Dossier
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No employees found</p>
                    </div>
                )}
            </div>
        </div>
    );
}