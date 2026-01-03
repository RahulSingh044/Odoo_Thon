"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function OdooNavbar() {
    const [activeTab, setActiveTab] = useState("Home");
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
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
    const redirect = (name: string, Link: string) => {
        setActiveTab(name);
        router.push(Link);
    }

    return (
        <nav
            className={`w-full z-50 sticky top-0 flex justify-center transition-all duration-500 bg-transparent ${isScrolled ? "py-3" : "py-6"
                }`}
        >
            <div className={`
                flex items-center backdrop-blur-2xl border rounded-full p-1.5 transition-all duration-500
                ${isScrolled
                    ? "bg-[#1B1B1B]/40 border-white/5 shadow-2xl scale-95"
                    : "bg-[#1B1B1B]/80 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"}
            `}>

                {/* Left: Odoo Logo Section */}
                <div className="px-4 border-r border-white/10 mr-2">
                    <Image
                        src="/logo.png"
                        alt="Odoo Logo"
                        width={60}
                        height={40}
                        className="brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                    />
                </div>

                {/* Center: Navigation Links */}
                <ul className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.name;
                        return (
                            <li key={item.name}>
                                <button
                                    onClick={() => redirect(item.name, item.link)}
                                    className={`
                                        relative cursor-pointer flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300
                                        ${isActive
                                            ? "bg-[#714B67] text-white shadow-[0_0_15px_rgba(113,75,103,0.4)]"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"}
                                    `}
                                >
                                    {item.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Right: Profile Section */}
                <div className="pl-4 pr-2 border-l border-white/10 ml-2 flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[11px] font-bold text-zinc-100 leading-none tracking-tight">John Doe</span>
                        <span className="text-[9px] font-bold text-[#017E84] uppercase tracking-wider mt-1">Admin</span>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#714B67] to-[#8E5E82] p-[1.5px] transition-all group-hover:shadow-[0_0_15px_rgba(113,75,103,0.5)]">
                            <div className="w-full h-full rounded-full bg-[#0F0F0F] overflow-hidden flex items-center justify-center">
                                <User size={18} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#017E84] border-2 border-[#1B1B1B] rounded-full shadow-sm" />
                    </div>
                </div>
            </div>
        </nav>
    );
}