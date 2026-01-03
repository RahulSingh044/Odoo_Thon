"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/authContext";

export default function OdooNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    /* =======================
       Hide navbar on auth pages
    ======================= */
    if (
        pathname === "/Login" ||
        pathname === "/register" ||
        pathname === "/profile"
    ) {
        return null;
    }

    if (loading) return null;

    console.log("nav user", user);

    /* =======================
       Scroll state
    ======================= */
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* =======================
       Role-based Navigation
    ======================= */
    const navItems =
        user.role === "HR"
            ? [
                { name: "Employee", link: "/admin/employee" },
                { name: "Attendance", link: "/admin/attendance" },
                { name: "Leaves", link: "/admin/leaves" },
            ]
            : [
                { name: "Home", link: "/" },
                { name: "Attendance", link: "/attendance" },
                { name: "Leaves", link: "/employeeLeave" },
            ];

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
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.link ||
                            (item.link !== "/" && pathname.startsWith(item.link));

                        return (
                            <li key={item.name}>
                                <button
                                    onClick={() => router.push(item.link)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                    ${isActive
                                            ? "bg-[#714B67] text-white shadow-[0_0_15px_rgba(113,75,103,0.4)]"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {item.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Profile */}
                <div
                    onClick={() => router.push("/profile")}
                    className="pl-4 pr-2 border-l border-white/10 ml-2 flex items-center gap-3 cursor-pointer"
                >
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[11px] font-bold text-zinc-100">
                            {user?.name}
                        </span>
                        <span className="text-[9px] font-bold text-[#017E84] uppercase">
                            {user?.role}
                        </span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-[#0F0F0F] flex items-center justify-center">
                        <UserIcon size={18} className="text-zinc-400" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
