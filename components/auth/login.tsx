"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setLoading(false);
                alert(data.message || "Login failed");
                return;
            }

            console.log("role", data.role)

            if (data.role === "HR") {
                router.replace("/admin/employee");
            } else {
                router.replace("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0F0F0F]">
            {/* Odoo Brand Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#714B67]/20 blur-[130px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#017E84]/15 blur-[130px]" />

            <div className="w-full max-w-md z-10">
                {/* Odoo-Themed Card Container */}
                <div className="bg-[#1B1B1B]/80 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <Image src="/logo.png" alt="Odoo Logo" width={150} height={50} className="" />
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <form onSubmit={handleCredentials} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300 ml-1 font-medium">
                                Email or Employee ID
                            </Label>
                            <Input
                                id="email"
                                placeholder="name@odoo.com"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/40 border-gray-800 text-white focus:ring-[#714B67]/30 focus:border-[#714B67] h-11 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" title="Password" className="text-gray-300 font-medium">
                                    Password
                                </Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-[#017E84] hover:text-[#019A9E] transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-black/40 border-gray-800 text-white focus:ring-[#714B67]/30 focus:border-[#714B67] h-11 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in zoom-in duration-200">
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full h-11  bg-[#714B67] hover:bg-[#8E5E82] text-white font-bold shadow-[0_0_20px_rgba(113,75,103,0.3)] transition-all active:scale-[0.98]"
                            type="submit"
                            disabled={loading || !email || !password}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}