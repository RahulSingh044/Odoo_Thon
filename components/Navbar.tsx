"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { User } from "lucide-react";

export default function OdooNavbar() {
    const pathname = usePathname();

    // ⛔ Hide navbar on auth pages
    if (pathname === "/Login" || pathname === "/register") {
        return null;
    }

    const [activeTab, setActiveTab] = useState("Home");
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", link: "/" },
        { name: "Attendance", link: "/attendance" },
        { name: "Leaves", link: "/employeeLeave" },
    ];

    const router = useRouter();

    const redirect = (name: string, link: string) => {
        setActiveTab(name);
        router.push(link);
    };

    return (
        <nav
            className={`w-full z-50 sticky top-0 flex justify-center transition-all duration-500
            ${isScrolled ? "py-3" : "py-6"}`}
        >
            <div
                className={`flex items-center backdrop-blur-2xl border rounded-full p-1.5 transition-all duration-500
                ${isScrolled
                        ? "bg-[#1B1B1B]/40 border-white/5 shadow-2xl scale-95"
                        : "bg-[#1B1B1B]/80 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    }`}
            >
                {/* Logo */}
                <div className="px-4 border-r border-white/10 mr-2">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={60}
                        height={40}
                        className="brightness-0 invert opacity-90"
                    />
                </div>

                {/* Links */}
                <ul className="flex items-center gap-1">
                    {navItems.map(item => (
                        <li key={item.name}>
                            <button
                                onClick={() => redirect(item.name, item.link)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${activeTab === item.name
                                        ? "bg-[#714B67] text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Profile */}
                <div className="pl-4 pr-2 border-l border-white/10 ml-2 flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[11px] font-bold text-zinc-100">John Doe</span>
                        <span className="text-[9px] font-bold text-[#017E84] uppercase">Admin</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-[#0F0F0F] flex items-center justify-center">
                        <User size={18} className="text-zinc-400" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
