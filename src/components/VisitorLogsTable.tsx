/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { VisitorLog } from "../types";
import { Search, Calendar, Trash2, ArrowLeft, RefreshCw, PlusCircle, Check } from "lucide-react";

interface VisitorLogsTableProps {
  metricLabel: string;
  onBack: () => void;
  logs: VisitorLog[];
  onDeleteLog: (id: string) => void;
}

export default function VisitorLogsTable({
  metricLabel,
  onBack,
  logs,
  onDeleteLog
}: VisitorLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // empty means no filter on this date picker

  // Filter logs based on the metric category
  const filterByMetric = (item: VisitorLog) => {
    // Current simulated date is 2026-06-07 (matching the metadata and screenshot)
    const todayStr = "2026-06-07";
    const yesterdayStr = "2026-06-06";
    
    const label = metricLabel.toLowerCase();

    if (label.includes("today")) {
      return item.rawDate === todayStr;
    }
    if (label.includes("yesterday")) {
      return item.rawDate === yesterdayStr;
    }
    if (label.includes("this week")) {
      // 2026-06-01 to 2026-06-07
      return item.rawDate >= "2026-06-01" && item.rawDate <= "2026-06-07";
    }
    if (label.includes("last week")) {
      // Previous week: 2026-05-24 to 2026-05-31
      return item.rawDate >= "2026-05-24" && item.rawDate <= "2026-05-31";
    }
    if (label.includes("this month")) {
      // June 2026
      return item.rawDate.startsWith("2026-06");
    }
    if (label.includes("last month")) {
      // May 2026
      return item.rawDate.startsWith("2026-05");
    }
    if (label.includes("this year")) {
      // Year 2026
      return item.rawDate.startsWith("2026");
    }
    if (label.includes("last year")) {
      // Year 2025
      return item.rawDate.startsWith("2025");
    }
    if (label.includes("total")) {
      return true; // No filter
    }

    // Handle Region/Country Filters (e.g., "Dhaka, Dhaka Division, BD Visitors")
    if (label.includes("dhaka") && label.includes("bd")) {
      return item.location.toLowerCase().includes("dhaka");
    }
    if (label.includes("taiyuan") || label.includes("shanxi")) {
      return item.location.toLowerCase().includes("taiyuan");
    }
    if (label.includes("charlotte") || label.includes("north carolina")) {
      return item.location.toLowerCase().includes("charlotte");
    }
    if (label.includes("social circle") || label.includes("georgia")) {
      return item.location.toLowerCase().includes("social circle");
    }
    if (label.includes("ashburn") || label.includes("virginia")) {
      return item.location.toLowerCase().includes("ashburn");
    }
    if (label.includes("chattogram") || label.includes("chittagong")) {
      return item.location.toLowerCase().includes("chattogram");
    }

    return true; // fallback
  };

  const getFilteredLogs = () => {
    let filtered = logs.filter(filterByMetric);

    // Apply text search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.sl.toString().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q) ||
          item.visitorsCount.toString().includes(q)
      );
    }

    // Apply specific Date picker filter if set
    if (dateFilter) {
      // Convert rawDate '2026-06-07' format to filter raw date picker format
      filtered = filtered.filter((item) => item.rawDate === dateFilter);
    }

    return filtered;
  };

  const filteredLogs = getFilteredLogs();
  
  // Compute sum of visitors
  const totalVisitorsCount = filteredLogs.reduce((sum, item) => sum + item.visitorsCount, 0);

  // Simple date formatter to '7 June 2026' from '2026-06-07'
  const formatDateToReadable = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16" id="visitor-logs-panel">
      {/* Detail View Header / Back bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-slate-900 transition-colors"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold font-display text-gray-800 flex items-center gap-2">
              <span>{metricLabel}</span>
              <span className="text-xs font-normal text-gray-500 font-sans">
                (বিস্তারিত ট্রাফিক পরিসংখ্যান)
              </span>
            </h2>
            <p className="text-xs text-gray-400 font-display">
              আইপি সূচক, ভৌগোলিক অবস্থান ও সেশন ভিত্তিক ভিজিটর রেকর্ড সমূহ
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-display text-xs">
          <span className="text-gray-500 font-medium">পরিসংখ্যান ফিল্টার:</span>
          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded border border-blue-100">
            {metricLabel}
          </span>
        </div>
      </div>

      {/* Primary Filtering and Search Controls (Layout matches screenshot) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-transparent">
        {/* Search Input & Total Visitors Badge */}
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              style={{ minHeight: '38px' }}
            />
          </div>

          {/* Total Visitors Badge */}
          <div className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white flex items-center font-semibold text-gray-700 shadow-sm h-[38px]">
            <span>Total Visitors: <strong className="ml-1 text-slate-900">{totalVisitorsCount}</strong></span>
          </div>

          {/* Clear Filter button if active */}
          {(searchQuery || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDateFilter("");
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 bg-white border border-gray-305 rounded-md px-2.5 py-1.5 shadow-sm hover:bg-gray-50 transition-colors h-[38px]"
            >
              <RefreshCw size={12} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Date Container Selector on the Right */}
        <div className="relative shrink-0 flex items-center">
          <div className="relative flex items-center bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm shadow-sm h-[38px] min-w-[150px] cursor-pointer hover:bg-gray-55 transition-all text-gray-700">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <span className="font-semibold text-gray-700 mr-1">
              {dateFilter ? formatDateToReadable(dateFilter) : "7 June 2026"}
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              max="2026-12-31"
              min="2025-01-01"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Table Structure (Matches screenshot exactly) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-205 text-gray-600 font-bold bg-white h-11 text-[13px]">
                <th className="py-2 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    readOnly
                  />
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-800 w-24">SL N.</th>
                <th className="py-2.5 px-4 font-semibold text-slate-800 w-40">Date</th>
                <th className="py-2.5 px-6 font-semibold text-slate-800">City / Region / Country</th>
                <th className="py-2.5 px-4 font-semibold text-slate-800 w-28 text-center">Visitors</th>
                <th className="py-2.5 px-4 font-semibold text-slate-800 w-36 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-display">
                    কোনো ভিজিটর লগ রেকর্ড খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 bg-white transition-colors h-12 text-[13px] text-gray-700 font-medium">
                    {/* Checkbox column */}
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        readOnly
                      />
                    </td>
                    
                    {/* SL N. column */}
                    <td className="py-2 px-4 text-gray-500 font-mono text-xs">
                      {item.sl}
                    </td>

                    {/* Date column */}
                    <td className="py-2 px-4 text-gray-600 font-sans">
                      {item.date}
                    </td>

                    {/* Location column */}
                    <td className="py-2 px-6 font-semibold text-gray-800">
                      {item.location}
                    </td>

                    {/* Visitors Count column */}
                    <td className="py-2 px-4 text-center font-mono font-bold text-gray-800">
                      {item.visitorsCount}
                    </td>

                    {/* Actions column with RED delete button matching screenshot */}
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => onDeleteLog(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dc2626] hover:bg-red-700 text-white font-bold text-[11px] rounded transition-colors tracking-wide shadow-sm font-sans"
                        style={{ minHeight: '28px' }}
                      >
                        <Trash2 size={12} className="shrink-0" />
                        <span>DELETE</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
