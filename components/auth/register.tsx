"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RefreshCw, Loader2, User, Mail, Building, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function OdooRegisterForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", password: "", department: "", designation: ""
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

    return (
        <div className="dark min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#121212]">
            {/* Odoo Brand Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#714B67]/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#017E84]/20 blur-[120px]" />

            <div className="w-full max-w-2xl z-10">
                <div className="bg-[#1e1e1e]/80 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Register Employee</h1>
                        <p className="text-sm text-gray-400 mt-2">Create & Manage Employee</p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">First Name</Label>
                            <Input placeholder="John" className="bg-[#2a2a2a] border-gray-700 text-white focus:border-[#714B67]" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">Last Name</Label>
                            <Input placeholder="Doe" className="bg-[#2a2a2a] border-gray-700 text-white focus:border-[#714B67]" />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">Email</Label>
                            <Input type="email" placeholder="john.doe@odoo.com" className="bg-[#2a2a2a] border-gray-700 text-white" />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">Secure Password</Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={formData.password}
                                    placeholder="••••••••••••"
                                    className="bg-[#2a2a2a] border-gray-700 text-white pr-28"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={generateSecurePassword}
                                    className="absolute cursor-pointer right-2 top-1.5 bg-[#714B67] hover:bg-[#8e5e82] text-white text-[10px] px-2 py-1.5 rounded transition-all uppercase font-bold flex items-center gap-1 shadow-lg"
                                >
                                    <RefreshCw size={12} /> Crypto Gen
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">Department</Label>
                            <Input placeholder="Sales" className="bg-[#2a2a2a] border-gray-700 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 ml-1 font-medium">Designation</Label>
                            <Input placeholder="Consultant" className="bg-[#2a2a2a] border-gray-700 text-white" />
                        </div>

                        <Button className="md:col-span-2 w-full cursor-pointer h-12 bg-[#714B67] hover:bg-[#8e5e82] text-white font-bold mt-4 shadow-lg transition-transform active:scale-95">
                            Register Now
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}