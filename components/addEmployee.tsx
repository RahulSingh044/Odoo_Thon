"use client";

import React, { useEffect, useState } from "react";
import {
    UserPlus, Mail, Briefcase, Shield,
    PlusCircle, User, Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AddEmployeeDialog({ onRefresh }: { onRefresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [designation, setDesignation] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "EMPLOYEE",
        designationId: "",
    });

    const getDesignation = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/admin/designation");
            const data = await response.json();
            setDesignation(data.data);
        } catch (error) {
            console.error("Error fetching designations:", error);
            return [];
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/api/admin/employees/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsOpen(false);
                onRefresh(); // Refresh the list after adding
                setFormData({ name: "", email: "", role: "EMPLOYEE", designationId: "" });
            }
        } catch (error) {
            console.error("Error creating employee:", error);
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon: Icon, ...props }: any) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#017E84] transition-colors">
                    <Icon size={16} />
                </div>
                <input
                    {...props}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#017E84]/50 transition-all placeholder:text-zinc-700"
                />
            </div>
        </div>
    );

    useEffect(() => {
        getDesignation();
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="bg-[#017E84] text-white cursor-pointer rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#017E84]/20 flex items-center gap-2 px-6">
                    <UserPlus size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Employee</span>
                </button>
            </DialogTrigger>

            <DialogContent className="bg-[#0D0D0D] border-white/10 text-white max-w-lg rounded-[2.5rem] p-8 outline-none">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#017E84]/10 flex items-center justify-center text-[#017E84] mb-2">
                        <PlusCircle size={28} />
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                        Onboard Personnel
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Enter core credentials to initialize employee profile
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 gap-5">
                        <InputField
                            label="Full Name"
                            icon={User}
                            placeholder="e.g. Omkar Jadhav"
                            required
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <InputField
                            label="Corporate Email"
                            icon={Mail}
                            type="email"
                            placeholder="name@company.com"
                            required
                            value={formData.email}
                            onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    System Role
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#017E84]/50 appearance-none transition-all"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Designation ID
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                    <input
                                        placeholder="UUID..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#017E84]/50 transition-all"
                                        value={formData.designationId}
                                        onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#017E84] hover:bg-[#019ea5] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] text-white transition-all shadow-xl shadow-[#017E84]/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : (
                                "Initialize Profile"
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}