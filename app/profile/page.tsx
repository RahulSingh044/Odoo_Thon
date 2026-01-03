"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Lock,
    Pencil,
    ShieldCheck,
    CheckCircle2,
    Mail,
    Smartphone,
    ShieldAlert,
    Fingerprint,
    Save,
    CreditCard,
    Wallet,
    Award,
    X,
    FileUp,
    Download,
    User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function RefinedProfileDashboard() {
    const [activeTab, setActiveTab] = useState("resume");
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const currentUserRole = "user";

    // --- EDIT & LOCK STATES ---
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [isBankLocked, setIsBankLocked] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Form Data States
    const [personalInfo, setPersonalInfo] = useState({
        dob: "14 May 1992",
        nationality: "Indian",
        gender: "Male",
        maritalStatus: "Single",
        personalEmail: "",
        doj: "12 June 2021",
        employeeId: "",
        role: "",
        phone: ""
    });

    const [bankInfo, setBankInfo] = useState({
        accountHolder: "",
        bankName: "",
        accountNumber: "",
        ifsc: ""
    });
    const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(true);
    const [bankDetailsExist, setBankDetailsExist] = useState(false);

    // Salary state
    const [salaryData, setSalaryData] = useState<{
        monthlyWage: number;
        grossSalary: number;
        netSalary: number;
    } | null>(null);
    const [isLoadingSalary, setIsLoadingSalary] = useState(true);

    const handleBankSave = async () => {
        try {
            // Prepare the data for the API (map ifsc back to ifscCode)
            const bankData = {
                accountNumber: bankInfo.accountNumber,
                bankName: bankInfo.bankName,
                ifscCode: bankInfo.ifsc
            };

            // Try to update first if bank details exist, otherwise create
            const method = bankDetailsExist ? "PATCH" : "POST";
            const response = await fetch("/api/profile/bank-details", {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bankData),
            });

            const result = await response.json();

            if (result.success) {
                setIsEditingBank(false);
                setIsBankLocked(true); // Lock the details after saving
                setBankDetailsExist(true);
            } else {
                console.error("Failed to save bank details:", result.message);
                // You might want to show an error toast here
            }
        } catch (error) {
            console.error("Error saving bank details:", error);
            // You might want to show an error toast here
        }
    };

    const tabContentVariants = {
        initial: { opacity: 0, y: 10, filter: "blur(4px)" },
        enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } }
    };

    const EditInput = ({ label, value, onChange, type = "text", disabled = false }: any) => (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    );

    // Helper function to mask account number for display
    const maskAccountNumber = (accountNumber: string): string => {
        if (!accountNumber) return "";
        if (accountNumber.length <= 4) return accountNumber;
        const last4 = accountNumber.slice(-4);
        const masked = "•••• •••• " + last4;
        return masked;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);

            // Simulate a 2-second "AI Parsing" delay to reveal details
            setTimeout(() => {
                setResumeFile(file);
                setIsUploading(false);
                // Optional: Automatically switch to a "Success" view
                console.log("Resume parsed: ", file.name);
            }, 2000);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch("/api/profile/");
            const result = await response.json();
            console.log(result);
            
            if (result.success && result.data) {
                const data = result.data;
                setPersonalInfo({
                    dob: "14 May 1992",
                    nationality: "Indian",
                    gender: "Male",
                    maritalStatus: "Single",
                    personalEmail: data.email || "",
                    doj: "12 June 2021",
                    employeeId: data.employeeId || data.profile?.employeeId || "",
                    role: data.role || "",
                    phone: data.profile?.phone || "+91 9920 123 456"
                });
            } else {
                console.error("Failed to fetch profile data:", result.message);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                setIsLoadingBankDetails(true);
                const response = await fetch("/api/profile/bank-details");
                const result = await response.json();
                
                if (result.success && result.data) {
                    const bankData = result.data;
                    setBankDetailsExist(true);
                    
                    // Get account holder name from profile
                    const profileResponse = await fetch("/api/profile/");
                    const profileResult = await profileResponse.json();
                    const accountHolderName = profileResult.success && profileResult.data?.profile?.name 
                        ? profileResult.data.profile.name 
                        : "";

                    setBankInfo({
                        accountHolder: accountHolderName,
                        bankName: bankData.bankName || "",
                        accountNumber: bankData.accountNumber || "",
                        ifsc: bankData.ifscCode || ""
                    });
                    
                    // Set lock status based on verified field if available
                    if (bankData.verified !== undefined) {
                        setIsBankLocked(bankData.verified);
                    }
                } else {
                    // Bank details don't exist yet, keep default empty values
                    setBankDetailsExist(false);
                    setIsBankLocked(false); // Allow editing when no bank details exist
                    console.log("No bank details found:", result.message);
                }
            } catch (error) {
                console.error("Failed to fetch bank details:", error);
            } finally {
                setIsLoadingBankDetails(false);
            }
        };
        fetchBankDetails();
    }, []);

    useEffect(() => {
        const fetchSalary = async () => {
            try {
                setIsLoadingSalary(true);
                const response = await fetch("/api/profile/salary");
                const result = await response.json();
                
                if (result.success && result.data) {
                    setSalaryData(result.data);
                } else {
                    console.log("No salary data found:", result.message);
                }
            } catch (error) {
                console.error("Failed to fetch salary:", error);
            } finally {
                setIsLoadingSalary(false);
            }
        };
        fetchSalary();
    }, []);

    // Helper function to format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Helper function to format number with commas
    const formatNumber = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-400 p-4 md:p-8 font-sans selection:bg-[#017E84]/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- HEADER --- */}
                <header className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-[#141414]/80 backdrop-blur-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#017E84]/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#714B67]/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 justify-between items-center lg:items-start">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left w-full lg:w-auto">
                            <div className="relative">
                                <div className="w-44 h-44 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-black p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <div className="w-full h-full rounded-[2.3rem] bg-[#1A1A1A] overflow-hidden flex items-center justify-center border border-white/5">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Employee" className="w-36 h-36" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 p-3 bg-emerald-500 rounded-2xl text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border-4 border-[#141414]">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <div>
                                    <h1 className="text-5xl font-black text-white tracking-tighter mb-1">Rahul Singh</h1>
                                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                                        <Badge className="bg-[#017E84]/20 text-[#017E84] border-[#017E84]/30 px-3 font-bold">SENIOR DEVELOPER</Badge>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Employee since 2021</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-xl">
                                    {[
                                        { label: "Internal ID", val: personalInfo.employeeId, icon: <Fingerprint size={12} /> },
                                        { label: "Work Email", val: personalInfo.personalEmail, icon: <Mail size={12} /> },
                                        { label: "Direct Line", val: personalInfo.phone, icon: <Smartphone size={12} /> },
                                        { label: "Access Level", val: personalInfo.role, icon: <Lock size={12} /> },
                                    ].map((item, i) => (
                                        <div key={i} className="border-l-2 border-zinc-800 pl-4 py-1 hover:border-[#017E84] transition-colors">
                                            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-tighter flex items-center gap-2">
                                                {item.icon} {item.label}
                                            </p>
                                            <p className="text-sm text-zinc-300 font-bold font-mono">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-80 bg-white/[0.03] border border-white/5 rounded-3xl p-6 self-stretch flex flex-col justify-between shadow-inner">
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Department</span>
                                    <span className="text-xs text-white font-bold">Engineering</span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Manager</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-zinc-700" />
                                        <span className="text-xs text-white font-bold">Priya Sharma</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <ShieldAlert size={16} className="text-zinc-500 shrink-0" />
                                <p className="text-[10px] leading-tight text-zinc-500 italic">
                                    {isBankLocked ? "Bank details are locked for security. Contact HR for updates." : "Review and lock your sensitive financial information."}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="resume" onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center border-b border-zinc-800/50 mb-8 px-2 relative">
                        <TabsList className="bg-transparent h-12 p-0 gap-8 relative">
                            {[
                                { id: "resume", label: "Resume", color: "#017E84" },
                                { id: "personal", label: "Personal Info", color: "#f59e0b" },
                                { id: "salary", label: "Salary Info", color: "#714B67" }
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="relative rounded-none bg-transparent text-md font-black uppercase tracking-widest px-3 cursor-pointer h-full shadow-none data-[state=active]:text-white transition-colors border-none"
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{ backgroundColor: tab.color }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} variants={tabContentVariants} initial="initial" animate="enter" exit="exit">

                            {/* --- RESUME TAB --- */}
                            <TabsContent value="resume">
                                <AnimatePresence mode="wait">
                                    {!resumeFile ? (
                                        // --- UPLOAD STATE ---
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="relative group"
                                        >
                                            <div className="text-center py-20 bg-zinc-900/20 rounded-[2rem] border-2 border-dashed border-zinc-800 hover:border-[#017E84]/50 transition-all cursor-pointer relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx"
                                                />
                                                <div className="relative z-10">
                                                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#017E84]/20 transition-transform">
                                                        <FileUp className="text-zinc-500 group-hover:text-[#017E84]" size={32} />
                                                    </div>
                                                    <p className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Click to Upload Resume</p>
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-2">PDF, DOCX up to 10MB</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        // --- DATA DISPLAY STATE ---
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                                        >
                                            {/* Left Column: About & Skills */}
                                            <div className="lg:col-span-8 space-y-6">
                                                <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl relative overflow-hidden">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-[10px] font-black text-[#017E84] uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <User size={14} /> Professional Summary
                                                        </h3>
                                                        <button onClick={() => setResumeFile(null)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                                        Senior Full-Stack Developer with 4+ years of experience in building scalable web applications.
                                                        Specialized in React, Node.js, and Cloud Architecture. Passionate about clean code,
                                                        mentoring junior developers, and optimizing system performance for high-traffic environments.
                                                    </p>

                                                    <Separator className="my-8 bg-white/5" />

                                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Technical Arsenal</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {["React/Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "Tailwind CSS"].map((skill) => (
                                                            <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:border-[#017E84]/50 hover:bg-[#017E84]/5 transition-all cursor-default">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Right Column: Certifications */}
                                            <div className="lg:col-span-4">
                                                <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl h-full relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                                        <Award size={80} className="text-[#017E84]" />
                                                    </div>
                                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                                        <Award size={14} /> Certifications
                                                    </h3>

                                                    <div className="space-y-6">
                                                        {[
                                                            { title: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2024" },
                                                            { title: "Advanced React Patterns", issuer: "Frontend Masters", date: "2023" },
                                                            { title: "PostgreSQL Expert", issuer: "Udemy Professional", date: "2022" }
                                                        ].map((cert, i) => (
                                                            <div key={i} className="relative pl-6 border-l border-zinc-800 hover:border-[#017E84] transition-colors group">
                                                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-[#017E84] transition-colors shadow-[0_0_10px_rgba(1,126,132,0)] group-hover:shadow-[0_0_10px_rgba(1,126,132,0.5)]" />
                                                                <p className="text-xs font-black text-white mb-1 uppercase tracking-tight">{cert.title}</p>
                                                                <p className="text-[10px] text-zinc-500 font-bold uppercase">{cert.issuer}</p>
                                                                <p className="text-[9px] text-[#017E84] font-black mt-2 tracking-widest">{cert.date}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button className="w-full mt-12 flex items-center justify-center gap-2 py-4 bg-[#017E84]/10 border border-[#017E84]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#017E84] hover:bg-[#017E84] hover:text-white transition-all">
                                                        <Download size={14} /> Download CV.pdf
                                                    </button>
                                                </Card>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </TabsContent>

                            {/* --- PERSONAL INFO TAB --- */}
                            <TabsContent value="personal">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-7 space-y-6">
                                        <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Identity Profile
                                                </h3>
                                                <button
                                                    onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                                                >
                                                    {isEditingPersonal ? <><Save size={14} /> Save</> : <><Pencil size={14} /> Edit Access</>}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                                {isEditingPersonal ? (
                                                    <>
                                                        <EditInput label="Date of Birth" value={personalInfo.dob} onChange={(e: any) => setPersonalInfo({ ...personalInfo, dob: e.target.value })} />
                                                        <EditInput label="Nationality" value={personalInfo.nationality} onChange={(e: any) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })} />
                                                        <EditInput label="Gender" value={personalInfo.gender} onChange={(e: any) => setPersonalInfo({ ...personalInfo, gender: e.target.value })} />
                                                        <EditInput label="Marital Status" value={personalInfo.maritalStatus} onChange={(e: any) => setPersonalInfo({ ...personalInfo, maritalStatus: e.target.value })} />
                                                        <EditInput label="Personal Email" value={personalInfo.personalEmail} type="email" onChange={(e: any) => setPersonalInfo({ ...personalInfo, personalEmail: e.target.value })} />
                                                        <EditInput label="Date of Joining" value={personalInfo.doj} onChange={(e: any) => setPersonalInfo({ ...personalInfo, doj: e.target.value })} />
                                                    </>
                                                ) : (
                                                    [
                                                        { label: "Date of Birth", value: personalInfo.dob },
                                                        { label: "Nationality", value: personalInfo.nationality },
                                                        { label: "Gender", value: personalInfo.gender },
                                                        { label: "Marital Status", value: personalInfo.maritalStatus },
                                                        { label: "Personal Email", value: personalInfo.personalEmail },
                                                        { label: "Date of Joining", value: personalInfo.doj },
                                                    ].map((item, i) => (
                                                        <div key={i} className="group/item">
                                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{item.label}</p>
                                                            <p className="text-sm text-zinc-300 font-bold tracking-tight">{item.value}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>
                                        <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl relative overflow-hidden">
                                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Residing Address</h3>
                                            <div className="flex gap-6">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <div className="w-[1px] h-full bg-zinc-800 my-1" />
                                                </div>
                                                <div>
                                                    <Badge className="bg-amber-500/10 text-amber-500 mb-3 border-none text-[8px] font-black">CURRENT RESIDENCE</Badge>
                                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                                        402, Skyline Residency, Near Tech Park,<br />
                                                        Kalyani Nagar, Pune, Maharashtra - 411006
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* BANK DETAILS SECTION (With Lock Feature) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <Card className={`bg-[#141414] border-white/5 p-8 rounded-3xl relative overflow-hidden ${isBankLocked ? 'ring-1 ring-emerald-500/20' : ''}`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Bank Details</h3>
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase">Payroll Disbursement</p>
                                                </div>
                                                {!isBankLocked ? (
                                                    <button
                                                        onClick={isEditingBank ? handleBankSave : () => setIsEditingBank(true)}
                                                        className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/10"
                                                    >
                                                        {isEditingBank ? <Save size={18} /> : <Pencil size={18} />}
                                                    </button>
                                                ) : (
                                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/10">
                                                        <Lock size={18} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                {isLoadingBankDetails ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="text-zinc-500 text-sm">Loading bank details...</div>
                                                    </div>
                                                ) : isEditingBank ? (
                                                    <div className="space-y-4">
                                                        <EditInput label="Account Holder" value={bankInfo.accountHolder} onChange={(e: any) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })} />
                                                        <EditInput label="Bank Name" value={bankInfo.bankName} onChange={(e: any) => setBankInfo({ ...bankInfo, bankName: e.target.value })} />
                                                        <EditInput label="Account Number" value={bankInfo.accountNumber} onChange={(e: any) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} />
                                                        <EditInput label="IFSC Code" value={bankInfo.ifsc} onChange={(e: any) => setBankInfo({ ...bankInfo, ifsc: e.target.value })} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {bankInfo.accountNumber || bankInfo.bankName ? (
                                                            <>
                                                                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group">
                                                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                                        <CreditCard size={24} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Primary Account</p>
                                                                        <p className="text-white font-bold tracking-wider">{maskAccountNumber(bankInfo.accountNumber)}</p>
                                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{bankInfo.bankName}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                                                                        <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">IFSC Code</p>
                                                                        <p className="text-xs text-zinc-300 font-bold">{bankInfo.ifsc}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                                                                        <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Account Holder</p>
                                                                        <p className="text-xs text-zinc-300 font-bold uppercase">{bankInfo.accountHolder}</p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8 text-zinc-500 text-sm">
                                                                No bank details found. Click edit to add your bank details.
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                                                    <CheckCircle2 size={12} /> KYC Verified
                                                </div>
                                                {isBankLocked && (
                                                    <span className="text-[9px] font-bold text-zinc-600 bg-white/5 px-2 py-1 rounded">LOCKED BY ADMIN</span>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- SALARY INFO TAB --- */}
                            <TabsContent value="salary">
                                {/* ROLE-BASED LOGIC: Change 'admin' to 'user' to test the restricted view */}
                                {currentUserRole === 'admin' ? (
                                    <div className="space-y-6">
                                        {/* Header: High Level Wages */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl flex justify-between items-center group overflow-hidden relative">
                                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                    <Wallet size={120} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Monthly Gross</p>
                                                    <h2 className="text-3xl font-black text-white">
                                                        {isLoadingSalary ? "Loading..." : salaryData ? formatCurrency(salaryData.monthlyWage) : "₹ 0.00"}
                                                    </h2>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Yearly CTC</p>
                                                    <h2 className="text-xl font-black text-[#017E84]">
                                                        {isLoadingSalary ? "Loading..." : salaryData ? formatCurrency(salaryData.grossSalary * 12) : "₹ 0.00"}
                                                    </h2>
                                                </div>
                                            </Card>

                                            <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Working Days</p>
                                                        <p className="text-sm font-bold text-zinc-300">5 Days / Week</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Break Time</p>
                                                        <p className="text-sm font-bold text-zinc-300">1 Hour / Day</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Detailed Components Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* 1. Salary Components (Left) */}
                                            <Card className="lg:col-span-7 bg-[#141414] border-white/5 p-8 rounded-3xl">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Earnings Breakdown</h3>
                                                <div className="space-y-6">
                                                    {[
                                                        { label: "Basic Salary", val: "25,000.00", perc: "50.00%", sub: "50% of monthly wages" },
                                                        { label: "House Rent Allowance", val: "12,500.00", perc: "50.00%", sub: "HRA provided at 50% of basic" },
                                                        { label: "Standard Allowance", val: "4,167.00", perc: "16.67%", sub: "Fixed predetermined amount" },
                                                        { label: "Performance Bonus", val: "2,082.50", perc: "8.33%", sub: "Calculated based on % of basic" },
                                                        { label: "Leave Travel Allowance", val: "2,082.50", perc: "8.33%", sub: "Covers travel expenses" },
                                                        { label: "Fixed Allowance", val: "2,918.00", perc: "11.67%", sub: "Remaining portion of wages" },
                                                    ].map((item, i) => (
                                                        <div key={i} className="group">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <div>
                                                                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-tighter">{item.label}</p>
                                                                    <p className="text-[9px] text-zinc-600 italic uppercase">{item.sub}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-mono font-black text-white">₹ {item.val}</p>
                                                                    <p className="text-[10px] font-mono text-[#017E84]">{item.perc}</p>
                                                                </div>
                                                            </div>
                                                            <div className="h-[1px] w-full bg-white/[0.03] group-hover:bg-[#017E84]/20 transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                            {/* 2. PF & Deductions (Right) */}
                                            <div className="lg:col-span-5 space-y-6">
                                                <Card className="bg-[#141414] border-white/5 p-8 rounded-3xl">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">PF Contributions</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase">Employee (12%)</span>
                                                            <span className="text-sm font-mono font-bold text-zinc-200">₹ 3,000.00</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase">Employer (12%)</span>
                                                            <span className="text-sm font-mono font-bold text-zinc-200">₹ 3,000.00</span>
                                                        </div>
                                                    </div>
                                                </Card>

                                                <Card className="bg-[#714B67]/5 border-[#714B67]/10 p-8 rounded-3xl relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={40} /></div>
                                                    <h3 className="text-xs font-black text-[#714B67] uppercase tracking-widest mb-6">Tax Deductions</h3>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-300">Professional Tax</p>
                                                            <p className="text-[9px] text-zinc-600 uppercase italic">Deducted from gross salary</p>
                                                        </div>
                                                        <span className="text-sm font-mono font-black text-rose-500">- ₹ 200.00</span>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* RESTRICTED VIEW: Only basic 4 details */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <Card className="bg-[#141414] border-white/5 p-6 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Month Wage</p>
                                                <p className="text-lg font-black text-zinc-200">
                                                    {isLoadingSalary ? "Loading..." : salaryData ? formatCurrency(salaryData.monthlyWage) : "₹ 0"}
                                                </p>
                                            </Card>
                                            <Card className="bg-[#141414] border-white/5 p-6 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Gross Salary</p>
                                                <p className="text-lg font-black text-zinc-200">
                                                    {isLoadingSalary ? "Loading..." : salaryData ? formatCurrency(salaryData.grossSalary) : "₹ 0"}
                                                </p>
                                            </Card>
                                            <Card className="bg-[#141414] border-white/5 p-6 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Net Salary</p>
                                                <p className="text-lg font-black text-zinc-200">
                                                    {isLoadingSalary ? "Loading..." : salaryData ? formatCurrency(salaryData.netSalary) : "₹ 0"}
                                                </p>
                                            </Card>
                                            <Card className="bg-[#141414] border-white/5 p-6 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Working Days</p>
                                                <p className="text-lg font-black text-zinc-200">5 Days/Week</p>
                                            </Card>
                                        </div>

                                        <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-[2.5rem] bg-zinc-950/50">
                                            <Lock size={24} className="text-zinc-800 mb-2" />
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Extended Breakdown Restricted</p>
                                            <p className="text-[9px] text-zinc-800 mt-1 uppercase">Contact HR for full audit access</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </div>
        </div>
    );
}