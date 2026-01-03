"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  Plus,
  Sparkles,
  TrendingUp,
  Video,
  MapPin,
  ExternalLink,
  Bell,
  FileText,
  Target,
  Zap,
  Award,
  Info,
  CalendarDays,
  History
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProfessionalDashboard() {
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [checkedOutAt, setCheckedOutAt] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = !!checkedInAt && !checkedOutAt;
  const isCheckedOut = !!checkedOutAt;

  const handleCheckIn = () => !checkedInAt && setCheckedInAt(new Date());
  const handleCheckOut = () => checkedInAt && !checkedOutAt && setCheckedOutAt(new Date());

  const workingDuration = useMemo(() => {
    if (!checkedInAt) return "00h 00m";
    const end = checkedOutAt ?? currentTime;
    const diff = Math.floor((end.getTime() - checkedInAt.getTime()) / 60000);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }, [checkedInAt, checkedOutAt, currentTime]);

  const meetings = [
    { id: 1, title: "Design System Sync", time: "10:30 AM", type: "Remote", category: "Product" },
    { id: 2, title: "Quarterly Review", time: "02:00 PM", type: "Conference Room B", category: "Management" },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-300 selection:bg-[#017E84]/30">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#017E84] border-[#017E84]/30 bg-[#017E84]/5 font-black tracking-widest text-[10px] px-3 py-1">
                SYSTEM OPERATIONAL
              </Badge>
              <span className="flex h-2 w-2 rounded-full bg-[#017E84] animate-pulse" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Hello, <span className="bg-gradient-to-r from-[#017E84] to-[#714B67] bg-clip-text text-transparent">Rahul Singh</span>
            </h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Sparkles size={14} className="text-[#714B67]" />
              Enterprise Administrator • <span className="text-zinc-400">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-[#017E84] hover:bg-[#019A9E] text-white font-bold shadow-[0_0_20px_rgba(1,126,132,0.3)] px-6 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Attendance Card */}
          <Card className="bg-[#1B1B1B]/40 border-white/10 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
            <CardHeader className="relative z-10 pb-2">
              <CardDescription className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-black">Shift Status</CardDescription>
              <CardTitle className="text-4xl text-white font-black tracking-tighter">
                {checkedInAt ? checkedInAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Ready"}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className={isCheckedIn ? "text-emerald-400 font-bold" : "text-zinc-500"}>{isCheckedIn ? "● Online" : "○ Offline"}</span>
                <span className="text-white font-mono">{workingDuration}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleCheckIn} disabled={!!checkedInAt} className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 font-bold h-9 text-xs transition-all">
                  Check In
                </Button>
                <Button onClick={handleCheckOut} disabled={!isCheckedIn} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 font-bold h-9 text-xs transition-all">
                  Check Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed PTO Card */}
          <Card className="bg-[#1B1B1B]/40 border-white/10 backdrop-blur-sm relative overflow-hidden group hover:bg-[#1B1B1B]/60 transition-all">
            <CalendarDays className="absolute -right-6 -bottom-6 text-[#714B67]/5 group-hover:text-[#714B67]/10 transition-colors" size={100} />

            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest text-[10px] text-zinc-500 font-bold">
                Monthly Remaining
              </CardDescription>
              <CardTitle className="text-4xl text-white font-black">
                1.5 <span className="text-xs text-zinc-500 font-normal uppercase">Days</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
              {/* Simplified Progress Bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#714B67] w-[33%]" />
              </div>

              {/* Leave Types Breakdown */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Paid</p>
                  <p className="text-sm text-white font-bold tracking-tight">8.5</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Sick</p>
                  <p className="text-sm text-white font-bold tracking-tight">4.0</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Unpaid</p>
                  <p className="text-sm text-white font-bold tracking-tight">2.0</p>
                </div>
              </div>

              {/* Simple Pending Status */}
              <div className="flex items-center justify-center gap-2 py-1 px-2 bg-yellow-500/5 rounded border border-yellow-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">1 Request Pending</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Work Hours */}
          <Card className="bg-[#1B1B1B]/40 border-white/10 backdrop-blur-sm hover:bg-[#1B1B1B]/60 transition-all">
            <CardHeader>
              <div className="h-8 w-8 rounded-lg bg-[#017E84]/20 flex items-center justify-center mb-2"><Zap size={16} className="text-[#017E84]" /></div>
              <CardDescription className="uppercase tracking-widest text-[10px] text-zinc-500 font-bold">Monthly Hours</CardDescription>
              <CardTitle className="text-4xl text-white font-black">164.2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp size={10} /> +4.1% vs last month
              </p>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-gradient-to-br from-[#1B1B1B] to-black border-white/10 relative overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Award size={16} className="text-emerald-500" /></div>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[9px] font-black tracking-tighter uppercase">Exceeding</Badge>
              </div>
              <CardDescription className="uppercase tracking-widest text-[10px] text-zinc-500 font-bold mt-2">Efficiency Rating</CardDescription>
              <CardTitle className="text-4xl text-white font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">98.4</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1 shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[98%]" />
              </div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase mt-2 tracking-widest">Next Review: Oct 20</p>
            </CardContent>
          </Card>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Meeting Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1">
              <Target className="text-[#017E84]" size={20} /> Operational Agenda
            </h2>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id} className="bg-[#1B1B1B]/40 border-white/5 hover:border-[#017E84]/40 transition-all group overflow-hidden">
                  <div className="flex items-center p-5 gap-6">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-black text-white">{meeting.time.split(' ')[0]}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase">{meeting.time.split(' ')[1]}</p>
                    </div>
                    <Separator orientation="vertical" className="h-10 bg-white/10" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-white group-hover:text-[#017E84] transition-colors">{meeting.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">{meeting.type === "Remote" ? <Video size={12} /> : <MapPin size={12} />} {meeting.type}</span>
                        <Badge className="bg-white/5 text-[9px] text-zinc-400 border-none px-2">{meeting.category}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 hover:bg-[#017E84] hover:text-white transition-all text-[10px] font-black uppercase px-4">Join</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Management Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start border-white/5 bg-[#1B1B1B]/40 text-zinc-400 hover:text-white gap-3 h-12 transition-all group">
                <FileText size={16} className="text-[#714B67] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Payroll & Tax Forms</span>
              </Button>
              <Button variant="outline" className="justify-start border-white/5 bg-[#1B1B1B]/40 text-zinc-400 hover:text-white gap-3 h-12 transition-all group">
                <Bell size={16} className="text-[#017E84] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Internal Broadcasts</span>
              </Button>
              <Button variant="outline" className="justify-start border-white/5 bg-[#1B1B1B]/40 text-zinc-400 hover:text-white gap-3 h-12 transition-all group">
                <ExternalLink size={16} className="text-zinc-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Support Knowledge Base</span>
              </Button>
            </div>

            <Card className="bg-gradient-to-br from-[#714B67]/20 to-[#0F0F0F] border-[#714B67]/20">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-[#714B67] text-[9px] mb-2 uppercase font-black tracking-tighter">New Bulletin</Badge>
                <CardTitle className="text-md font-bold text-white leading-tight">Policy Update v2.4</CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">Revised remote work guidelines are now available for review in the HR portal.</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button variant="link" className="p-0 h-auto text-[#714B67] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Download PDF</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <footer className="text-center pt-8 opacity-30 border-t border-white/5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Odoo ERP Systems • 2026</p>
        </footer>
      </div>
    </div>
  );
}