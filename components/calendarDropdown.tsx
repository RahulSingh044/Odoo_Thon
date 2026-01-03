"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

/* =======================
   Types
======================= */
type Calendar22Props = {
    value: Date | null;
    onChange: (date: Date | null) => void;
};

export function Calendar22({ value, onChange }: Calendar22Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start bg-white/5 border-white/10 text-left text-zinc-400"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : "Pick a date"}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 bg-[#1B1B1B] border-white/10">
                <Calendar
                    mode="single"
                    selected={value ?? undefined}
                    onSelect={(date) => {
                        onChange(date ?? null);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
