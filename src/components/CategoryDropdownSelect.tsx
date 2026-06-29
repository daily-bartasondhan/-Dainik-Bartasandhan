import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

// Convert Bangla numbers to English for formatting
const convertToEnglishNumber = (val: string | undefined): string => {
  if (!val) return "";
  const mappings: { [key: string]: string } = {
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
    "০": "0"
  };
  return val.split("").map(char => mappings[char] || char).join("");
};

// Subcategories mapping
const nestedSubcategories: { [key: string]: string[] } = {
  "বিনোদন": ["ঢালিউড", "বলিউড", "হলিউড", "অন্যান্য"],
  "খেলা": ["ক্রিকেট", "ফুটবল", "অন্যান্য"],
  "খেলাধুলা": ["ক্রিকেট", "ফুটবল", "অন্যান্য"]
};

interface CategoryGroup {
  numValue: string; // "১", "২", "৩", "৪", "৯"
  mainName: string; // Default selection when clicking the main button
  items: string[]; // List of categories shown when expanded
}

interface CategoryDropdownSelectProps {
  value: string;
  subcategoryValue?: string;
  onChange: (category: string, subcategory?: string) => void;
  categories?: { name: string; code: string; hasNumBox?: boolean; numValue?: string }[];
  placeholder?: string;
  className?: string;
}

export default function CategoryDropdownSelect({ 
  value, 
  subcategoryValue, 
  onChange, 
  categories: propCategories, 
  placeholder, 
  className 
}: CategoryDropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    "৯": true // Pre-expand Group 9 by default to show rich active settings
  });
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    "বিনোদন": true,
    "খেলা": true,
    "খেলাধুলা": true
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Grouped Categories exactly matching custom numbering schemes
  const groups: CategoryGroup[] = [
    {
      numValue: "১",
      mainName: "ফরিদপুর",
      items: ["ফরিদপুর", "সারাদেশ", "চট্টগ্রাম সারাবেলা", "প্রবাস"]
    },
    {
      numValue: "২",
      mainName: "বাংলাদেশ",
      items: ["বাংলাদেশ", "জাতীয়", "রাজনীতি", "নির্বাচন"]
    },
    {
      numValue: "৩",
      mainName: "সম্পাদকীয় ও মতামত",
      items: ["সম্পাদকীয় ও মতামত", "মতামত"]
    },
    {
      numValue: "৪",
      mainName: "অর্থ ও বাণিজ্য",
      items: ["অর্থ ও বাণিজ্য", "বাণিজ্য", "মূলধন", "কর্পোরেট"]
    },
    {
      numValue: "৯",
      mainName: "সাপ্তাহিক বিশেষ কড়চা",
      items: [
        "বাণিজ্য", 
        "বিনোদন",
        "মতামত",
        "আইন-আদালত",
        "অপরাধ",
        "স্বাস্থ্য",
        "ধর্ম",
        "মূলধন",
        "শিল্প-সাহিত্য",
        "প্রবাস",
        "প্রযুক্তি",
        "চাকরি",
        "লাইফস্টাইল",
        "নারী-শিশু",
        "আইন ও পরামর্শ",
        "সোশ্যাল মিডিয়া",
        "বিচিত্র",
        "কর্পোরেট",
        "পরিবেশ ও জলবায়ু",
        "পিএসআই"
      ]
    }
  ];

  // Standalone list (shown as direct • bullet items in lists)
  const standalones = ["বিশ্ব", "খেলা", "খেলাধুলা", "ভিডিও", "আলোচিত", "বিশেষ প্রতিবেদন"];

  // Compute dynamic categories not present in standard groups or standalones
  const dynamicCategories = propCategories || [];
  const knownItems = new Set<string>();
  groups.forEach(g => {
    knownItems.add(g.mainName);
    g.items.forEach(it => knownItems.add(it));
  });
  standalones.forEach(it => knownItems.add(it));

  const extraStandalones: string[] = [];
  dynamicCategories.forEach(cat => {
    if (cat.name && !knownItems.has(cat.name)) {
      extraStandalones.push(cat.name);
    }
  });

  // Toggle group expansion
  const toggleGroup = (num: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroups(prev => ({
      ...prev,
      [num]: !prev[num]
    }));
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle category & subcategory selection
  const handleSelect = (categoryName: string, subCategoryName: string = "") => {
    onChange(categoryName, subCategoryName);
    setIsOpen(false);
  };

  // Helper to determine if a selected value matches any displayed item
  const findValueInConfig = () => {
    if (!value) return null;
    
    // Determine if we belong to a group
    let parentNum: string | undefined = undefined;
    for (const g of groups) {
      if (g.mainName === value || g.items.includes(value)) {
        parentNum = g.numValue;
        break;
      }
    }

    return {
      category: value,
      subcategory: subcategoryValue,
      parentNum: parentNum
    };
  };

  const activeMatch = findValueInConfig();

  // Unified renderer for sub-group list items to avoid code duplication
  const renderSubGroupItem = (itemName: string) => {
    const hasSub = !!nestedSubcategories[itemName];
    const subItems = nestedSubcategories[itemName] || [];
    const isCatExpanded = !!expandedCategories[itemName];
    const isSubSelected = (subName: string) => value === itemName && subcategoryValue === subName;

    return (
      <div key={itemName} className="space-y-1">
        <div
          onClick={() => handleSelect(itemName, "")}
          className={`flex items-center justify-between py-1.5 px-3 rounded text-xs cursor-pointer transition-colors ${
            value === itemName && !subcategoryValue
              ? "bg-blue-100 text-[#1d4ed8] font-bold" 
              : "text-gray-700 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <span className="text-gray-300 font-bold select-none">•</span>
            <span className="truncate font-medium">{itemName}</span>
          </div>

          {hasSub && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCategories(prev => ({
                  ...prev,
                  [itemName]: !prev[itemName]
                }));
              }}
              className="w-5 h-5 border border-blue-200 rounded-full flex items-center justify-center text-[#2563eb] hover:bg-blue-50 transition-all shrink-0 cursor-pointer shadow-3xs"
              title="Toggle child subcategories"
            >
              <span className="text-[8px] font-black leading-none select-none">
                {isCatExpanded ? "▼" : "▶"}
              </span>
            </button>
          )}
        </div>

        {/* Nested child options list inside Group */}
        {hasSub && isCatExpanded && (
          <div className="pl-5 space-y-1.5 py-1 border-l border-dashed border-blue-250 ml-5 transition-all">
            {subItems.map((sub) => {
              const selected = isSubSelected(sub);
              return (
                <div
                  key={sub}
                  onClick={() => handleSelect(itemName, sub)}
                  className={`flex items-center gap-2 py-1 px-2.5 rounded text-[11px] cursor-pointer transition-colors ${
                    selected 
                      ? "bg-blue-50 text-blue-700 font-black border-l-2 border-blue-600 pl-2" 
                      : "text-gray-600 hover:bg-gray-10/70 hover:text-gray-950"
                  }`}
                >
                  <span className="text-blue-400 font-bold select-none">&gt;</span>
                  <span className="truncate">{sub}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Reusable standalone category card block
  const renderStandaloneItem = (itemName: string) => {
    const hasSub = !!nestedSubcategories[itemName];
    const subItems = nestedSubcategories[itemName] || [];
    const isCatExpanded = !!expandedCategories[itemName];
    const isSubSelected = (subName: string) => value === itemName && subcategoryValue === subName;

    return (
      <div key={itemName} className="space-y-1">
        <div 
          onClick={() => handleSelect(itemName, "")}
          className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
            value === itemName && !subcategoryValue
              ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
              : "bg-white border-gray-200 hover:bg-slate-5/40 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-[#cbd5e1] font-black text-[18px] leading-none select-none pl-3.5">•</span>
              <span className="text-xs font-bold text-slate-800">
                {itemName}
              </span>
            </div>

            {hasSub && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCategories(prev => ({
                    ...prev,
                    [itemName]: !prev[itemName]
                  }));
                }}
                className="w-5.5 h-5.5 border border-blue-300 rounded-full flex items-center justify-center text-[#2563eb] hover:bg-blue-50 transition-all shrink-0 mr-1 shadow-3xs cursor-pointer"
                title="Toggle deep options"
              >
                <span className="text-[8px] font-black leading-none select-none">
                  {isCatExpanded ? "▼" : "▶"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Subcategories list for standard row */}
        {hasSub && isCatExpanded && (
          <div className="pl-6 space-y-1 py-1 border-l-2 border-dashed border-blue-100 ml-5 transition-all">
            {subItems.map((sub) => {
              const selected = isSubSelected(sub);
              return (
                <div
                  key={sub}
                  onClick={() => handleSelect(itemName, sub)}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded text-xs cursor-pointer transition-colors ${
                    selected 
                      ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 pl-2" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                >
                  <span className="text-blue-300 font-black text-xs select-none">&gt;</span>
                  <span>{sub}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative font-sans text-left ${className || ""}`} ref={dropdownRef}>
      {/* Search selection trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-xs px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 cursor-pointer flex items-center justify-between shadow-2xs hover:border-gray-400 transition-all font-sans"
      >
        <span className="text-gray-800 font-medium truncate flex-1 block">
          {activeMatch ? (
            <span className="flex items-center gap-2">
              {activeMatch.parentNum ? (
                <span className="border border-slate-200 rounded px-2 py-0.5 flex items-center gap-1.5 bg-white shrink-0 select-none text-[#2563eb]">
                  <span className="w-4.5 h-4.5 flex items-center justify-center bg-[#ec4899] text-white text-[10px] font-sans font-black rounded-full">
                    {convertToEnglishNumber(activeMatch.parentNum)}
                  </span>
                  <span className="text-[#2563eb] font-black text-[10px] leading-none select-none">&gt;</span>
                </span>
              ) : (
                <span className="text-[#cbd5e1] font-black text-[14px] leading-none select-none pl-1">•</span>
              )}
              <span className="text-xs font-semibold text-slate-855">
                {activeMatch.category}
                {activeMatch.subcategory && (
                  <span className="text-slate-500 font-normal">
                    {" "}&gt;{" "}
                    <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200/50 rounded px-1.5 py-0.2">
                      {activeMatch.subcategory}
                    </span>
                  </span>
                )}
              </span>
            </span>
          ) : (
            placeholder || "Select Category"
          )}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
      </button>

      {/* Dropdown popup overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-blue-400 rounded-md shadow-lg z-[999] p-3 max-h-96 flex flex-col w-full">
          {/* Header row exactly mirroring screenshot */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-150 mb-2 select-none">
            <span className="text-xs font-semibold text-gray-500 font-sans pl-1">Select Category</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 bg-red-400 hover:bg-red-500 text-white flex items-center justify-center rounded transition-colors cursor-pointer text-[12px] font-black"
              title="Close Dropdown"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>

          {/* List items with custom scrollbar */}
          <div 
            className="overflow-y-auto space-y-2 pr-1 max-h-80" 
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Group 1 (১) */}
            {(() => {
              const g = groups[0];
              const isExpanded = !!expandedGroups[g.numValue];
              const isSelected = value === g.mainName;
              return (
                <div className="space-y-1">
                  <div 
                    onClick={() => handleSelect(g.mainName)}
                    className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
                        : "bg-white border-gray-200 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="border border-slate-200 rounded px-3 py-1 flex items-center gap-2 bg-white shrink-0 shadow-3xs">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#ec4899] text-white text-[11px] font-sans font-black rounded-full select-none">
                          {convertToEnglishNumber(g.numValue)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleGroup(g.numValue, e)}
                          className="text-[#2563eb] font-black text-[12px] hover:bg-blue-50 p-1 rounded leading-none transition-colors select-none ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? "v" : ">"}
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-850">
                        {g.mainName}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 py-1 border-l-2 border-dashed border-gray-250 ml-5 transition-all">
                      {g.items.map((item) => renderSubGroupItem(item))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Group 2 (২) */}
            {(() => {
              const g = groups[1];
              const isExpanded = !!expandedGroups[g.numValue];
              const isSelected = value === g.mainName;
              return (
                <div className="space-y-1">
                  <div 
                    onClick={() => handleSelect(g.mainName)}
                    className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
                        : "bg-white border-gray-200 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="border border-slate-200 rounded px-3 py-1 flex items-center gap-2 bg-white shrink-0 shadow-3xs">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#ec4899] text-white text-[11px] font-sans font-black rounded-full select-none">
                          {convertToEnglishNumber(g.numValue)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleGroup(g.numValue, e)}
                          className="text-[#2563eb] font-black text-[12px] hover:bg-blue-50 p-1 rounded leading-none transition-colors select-none ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? "v" : ">"}
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-850">
                        {g.mainName}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 py-1 border-l-2 border-dashed border-gray-250 ml-5 transition-all">
                      {g.items.map((item) => renderSubGroupItem(item))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Standalone: World ("বিশ্ব") */}
            {renderStandaloneItem(standalones[0])}

            {/* Group 9 (৯) */}
            {(() => {
              const g = groups[4]; // Group 9
              const isExpanded = !!expandedGroups[g.numValue];
              const isSelected = value === g.mainName;
              return (
                <div className="space-y-1">
                  <div 
                    onClick={() => handleSelect(g.mainName)}
                    className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
                        : "bg-white border-gray-200 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="border border-slate-200 rounded px-3 py-1 flex items-center gap-2 bg-white shrink-0 shadow-3xs">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#ec4899] text-white text-[11px] font-sans font-black rounded-full select-none">
                          {convertToEnglishNumber(g.numValue)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleGroup(g.numValue, e)}
                          className="text-[#2563eb] font-black text-[12px] hover:bg-blue-50 p-1 rounded leading-none transition-colors select-none ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? "v" : ">"}
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-850">
                        {g.mainName}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-1.5 py-1 border-l-2 border-dashed border-gray-250 ml-5 transition-all">
                      {g.items.map((item) => renderSubGroupItem(item))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Group 3 (৩) */}
            {(() => {
              const g = groups[2];
              const isExpanded = !!expandedGroups[g.numValue];
              const isSelected = value === g.mainName;
              return (
                <div className="space-y-1">
                  <div 
                    onClick={() => handleSelect(g.mainName)}
                    className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
                        : "bg-white border-gray-200 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="border border-slate-200 rounded px-3 py-1 flex items-center gap-2 bg-white shrink-0 shadow-3xs">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#ec4899] text-white text-[11px] font-sans font-black rounded-full select-none">
                          {convertToEnglishNumber(g.numValue)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleGroup(g.numValue, e)}
                          className="text-[#2563eb] font-black text-[12px] hover:bg-blue-50 p-1 rounded leading-none transition-colors select-none ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? "v" : ">"}
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-850">
                        {g.mainName}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 py-1 border-l-2 border-dashed border-gray-255 ml-5 transition-all">
                      {g.items.map((item) => renderSubGroupItem(item))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Standalones Support: Sports ("খেলা" / "খেলাধুলা") */}
            {renderStandaloneItem(standalones[1])}
            {renderStandaloneItem(standalones[2])}

            {/* Group 4 (৪) */}
            {(() => {
              const g = groups[3];
              const isExpanded = !!expandedGroups[g.numValue];
              const isSelected = value === g.mainName;
              return (
                <div className="space-y-1">
                  <div 
                    onClick={() => handleSelect(g.mainName)}
                    className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-50/60 border-blue-400 shadow-3xs" 
                        : "bg-white border-gray-200 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="border border-slate-200 rounded px-3 py-1 flex items-center gap-2 bg-white shrink-0 shadow-3xs">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#ec4899] text-white text-[11px] font-sans font-black rounded-full select-none">
                          {convertToEnglishNumber(g.numValue)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleGroup(g.numValue, e)}
                          className="text-[#2563eb] font-black text-[12px] hover:bg-blue-50 p-1 rounded leading-none transition-colors select-none ml-0.5 cursor-pointer flex items-center justify-center"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? "v" : ">"}
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-855">
                        {g.mainName}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 space-y-1 py-1 border-l-2 border-dashed border-gray-255 ml-5 transition-all">
                      {g.items.map((item) => renderSubGroupItem(item))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Other standalones */}
            {standalones.slice(3).map((item) => renderStandaloneItem(item))}
            {extraStandalones.map((item) => renderStandaloneItem(item))}
          </div>
        </div>
      )}
    </div>
  );
}
