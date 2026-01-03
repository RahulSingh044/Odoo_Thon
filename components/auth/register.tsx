"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Loader2, User, Mail, Shield, UserPlus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RegisterEmployeeDialog({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        designationId: "",
        role: "EMPLOYEE"
    });

    const generateSecurePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        const length = 16;
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }
        setFormData(prev => ({ ...prev, password }));
    };

    const getDesignations = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/designation");
            const data = await response.json();
            setDesignations(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error("Error fetching designations:", error);
        }
    };

    useEffect(() => {
        if (open) {
            getDesignations();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    designationId: formData.designationId,
                    role: formData.role
                }),
            });

            console.log("emp", await response.json())

            if (response.ok) {
                setOpen(false); // Close dialog
                onRefresh();    // Trigger list refresh in parent
                // Reset form
                setFormData({ firstName: "", lastName: "", email: "", password: "", designationId: "", role: "EMPLOYEE" });
            }
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-[#017E84] text-white p-3 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#017E84]/20">
                    <UserPlus size={20} />
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl bg-[#0D0D0D] border-white/5 p-0 overflow-hidden rounded-[2.5rem] outline-none">
                <div className="relative p-10">
                    {/* Background Accents */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#714B67]/10 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#017E84]/10 blur-[80px] pointer-events-none" />

                    <DialogHeader className="relative z-10 flex flex-col items-center mb-8 text-center">
                        <div className="w-14 h-14 bg-[#714B67]/20 rounded-2xl flex items-center justify-center mb-4 text-[#714B67]">
                            <Plus size={28} />
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tighter text-white uppercase">Register Employee</DialogTitle>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">Initial Personnel Onboarding</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">First Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <Input
                                    placeholder="John"
                                    className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-2xl focus:border-[#714B67] transition-all"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Last Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <Input
                                    placeholder="Doe"
                                    className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-2xl focus:border-[#714B67] transition-all"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Corporate Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <Input
                                    type="email"
                                    placeholder="john.doe@odoo.com"
                                    className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-2xl transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Secure Password</Label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <Input
                                    type="text"
                                    value={formData.password}
                                    placeholder="••••••••••••••••"
                                    className="bg-white/5 border-white/10 text-white pl-12 pr-32 h-12 rounded-2xl transition-all font-mono"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={generateSecurePassword}
                                    className="absolute right-2 top-2 bg-[#714B67] hover:bg-[#8e5e82] text-white text-[9px] px-3 py-2 rounded-xl transition-all uppercase font-black flex items-center gap-2"
                                >
                                    <RefreshCw size={12} /> Gen
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                                Official Designation
                            </Label>

                            <Select
                                value={formData.designationId}
                                onValueChange={(value) => setFormData({ ...formData, designationId: value })}
                                required
                            >
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-12 rounded-2xl px-4 focus:ring-0 focus:ring-offset-0 focus:border-[#017E84] transition-all">
                                    <SelectValue placeholder="Select Position..." />
                                </SelectTrigger>

                                <SelectContent className="bg-[#0D0D0D] border-white/10 text-white rounded-xl">
                                    {designations.map((d: any) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.id}
                                            className="focus:bg-[#714B67]/20 focus:text-white cursor-pointer uppercase text-[10px] font-bold tracking-wider py-3"
                                        >
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 w-full h-14 bg-[#714B67] hover:bg-[#8e5e82] text-white font-black uppercase text-xs tracking-[0.2em] mt-4 rounded-2xl shadow-xl shadow-[#714B67]/20 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Authorize & Register"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}