/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, Search, User, LogOut, Clock, CalendarDays, KeyRound, Building2, Flame, RefreshCw, CloudLightning, CloudRain, CloudSun, Sun, Cloud, Facebook, Linkedin, Youtube, Instagram, ChevronDown } from "lucide-react";
import { getBengaliCalendarDate, getFormattedBengaliEnglishDate, getFormattedBengaliTime, getBengaliWeather } from "../utils";
import { Staff, Article } from "../types";

interface HeaderProps {
  onOpenMegaMenu: () => void;
  onSelectCategory: (category: string) => void;
  onNavigate: (page: string) => void;
  activeUser: Staff | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  activeCategory: string;
  articles?: Article[];
  onSelectArticle?: (id: string) => void;
}

export default function Header({
  onOpenMegaMenu,
  onSelectCategory,
  onNavigate,
  activeUser,
  onLogout,
  onSearch,
  activeCategory,
  articles = [],
  onSelectArticle
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localFeeds, setLocalFeeds] = useState<Article[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [stickyDropdownOpen, setStickyDropdownOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/bangladeshisoftware",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
    whatsapp: "https://whatsapp.com"
  });

  useEffect(() => {
    const saved = localStorage.getItem("footer_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSocialLinks({
          facebook: parsed.facebook || "https://facebook.com/bangladeshisoftware",
          twitter: parsed.twitter || "https://twitter.com",
          linkedin: parsed.linkedin || "https://linkedin.com",
          youtube: parsed.youtube || "https://youtube.com",
          instagram: parsed.instagram || "https://instagram.com",
          whatsapp: parsed.whatsapp || "https://whatsapp.com"
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setLoginDropdownOpen(false);
      setStickyDropdownOpen(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleLoginDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoginDropdownOpen(!loginDropdownOpen);
  };

  const toggleStickyDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStickyDropdownOpen(!stickyDropdownOpen);
  };

  const handleDropdownItemClick = (page: string) => {
    setLoginDropdownOpen(false);
    setStickyDropdownOpen(false);
    onNavigate(page);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // update every second for high accuracy
    return () => clearInterval(interval);
  }, []);

  const formattedTime = getFormattedBengaliTime(currentDate);
  const formattedEngDate = getFormattedBengaliEnglishDate(currentDate);
  const formattedBenDate = getBengaliCalendarDate(currentDate);
  const weather = getBengaliWeather(currentDate);

  const WeatherIcon = () => {
    switch (weather.icon) {
      case "cloud-lightning":
        return <CloudLightning size={14} className="text-amber-500 animate-pulse" />;
      case "cloud-rain":
        return <CloudRain size={14} className="text-blue-400" />;
      case "cloud-sun":
        return <CloudSun size={14} className="text-amber-500" />;
      case "sun":
        return <Sun size={14} className="text-amber-500" />;
      default:
        return <Cloud size={14} className="text-gray-400" />;
    }
  };

  // Fetch standard published news as ticker fallback if parent state is empty
  useEffect(() => {
    if (!articles || articles.length === 0) {
      fetch("/api/news")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLocalFeeds(data.slice(0, 8));
          }
        })
        .catch((err) => console.error("Error loaded ticker feeds", err));
    }
  }, [articles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Top header quick navigation categories
  const [topNavCategories, setTopNavCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("category_order_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.headerCategories && Array.isArray(parsed.headerCategories) && parsed.headerCategories.length > 0) {
          return parsed.headerCategories;
        }
      } catch (e) {
        // ignore
      }
    }
    return ["সর্বশেষ", "জাতীয়", "রাজনীতি", "সারাদেশ", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "মতামত", "ভিডিও"];
  });

  // Listen to storage events to update topNavCategories dynamically in real time
  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem("category_order_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.headerCategories && Array.isArray(parsed.headerCategories) && parsed.headerCategories.length > 0) {
            setTopNavCategories(parsed.headerCategories);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  // Dynamic Header Settings brand logo & title
  const [headerBranding, setHeaderBranding] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          hdrLightLogoFilename: parsed.hdrLightLogoFilename || "a1eda4362ec-c439afe9167-Prothom-Alo-logo.webp",
          hdrLightLogoUrl: parsed.hdrLightLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
          hdrDarkLogoFilename: parsed.hdrDarkLogoFilename || "67517705aa5-prothom-Alo-logo_copy6.webp",
          hdrDarkLogoUrl: parsed.hdrDarkLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
          faviconLogoFilename: parsed.faviconLogoFilename || "67517705aa5-prothom-Alo-logo_copy7.webp",
          faviconLogoUrl: parsed.faviconLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
          settingsSiteTitle: parsed.settingsSiteTitle === "দৈনিক প্রথম আলো" ? "দৈনিক বার্তাসন্ধান" : (parsed.settingsSiteTitle || "দৈনিক বার্তাসন্ধান"),
          settingsSiteEnglishTitle: parsed.settingsSiteEnglishTitle === "Prothom Alo" ? "Dainik Bartasandhan" : (parsed.settingsSiteEnglishTitle || "Dainik Bartasandhan")
        };
      } catch (e) {}
    }
    return {
      hdrLightLogoFilename: "a1eda4362ec-c439afe9167-Prothom-Alo-logo.webp",
      hdrLightLogoUrl: "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
      hdrDarkLogoFilename: "67517705aa5-prothom-Alo-logo_copy6.webp",
      hdrDarkLogoUrl: "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
      faviconLogoFilename: "67517705aa5-prothom-Alo-logo_copy7.webp",
      faviconLogoUrl: "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
      settingsSiteTitle: "দৈনিক বার্তাসন্ধান",
      settingsSiteEnglishTitle: "Dainik Bartasandhan"
    };
  });

  // Listen to storage events to update header branding dynamically in real time
  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem("header_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHeaderBranding({
            hdrLightLogoFilename: parsed.hdrLightLogoFilename || "a1eda4362ec-c439afe9167-Prothom-Alo-logo.webp",
            hdrLightLogoUrl: parsed.hdrLightLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
            hdrDarkLogoFilename: parsed.hdrDarkLogoFilename || "67517705aa5-prothom-Alo-logo_copy6.webp",
            hdrDarkLogoUrl: parsed.hdrDarkLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
            faviconLogoFilename: parsed.faviconLogoFilename || "67517705aa5-prothom-Alo-logo_copy7.webp",
            faviconLogoUrl: parsed.faviconLogoUrl || "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png",
            settingsSiteTitle: parsed.settingsSiteTitle === "দৈনিক প্রথম আলো" ? "দৈনিক বার্তাসন্ধান" : (parsed.settingsSiteTitle || "দৈনিক বার্তাসন্ধান"),
            settingsSiteEnglishTitle: parsed.settingsSiteEnglishTitle === "Prothom Alo" ? "Dainik Bartasandhan" : (parsed.settingsSiteEnglishTitle || "Dainik Bartasandhan")
          });
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  // Sync title and favicon dynamically in the browser
  useEffect(() => {
    if (headerBranding.settingsSiteTitle) {
      document.title = headerBranding.settingsSiteTitle;
    }
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link && headerBranding.faviconLogoUrl) {
      link.href = headerBranding.faviconLogoUrl;
    }
  }, [headerBranding]);

  // Compute active ticker list prioritizing isHeadline === true
  const baseList = (articles && articles.length > 0) ? articles : localFeeds;
  const headlineArticles = baseList.filter(art => art.isHeadline);
  const activeTickerList = headlineArticles.length > 0 ? headlineArticles : baseList;

  // Static fallback headlines if no dynamic database news exists in database
  const defaultHeadlines = [
    { id: "fb-1", title: "দৈনিক বার্তাসন্ধান: ঐতিহ্যের ধারক ও সত্যের বাহক হিসেবে দেশজুড়ে আমাদের গৌরবময় যাত্রা।" },
    { id: "fb-2", title: "সত্যের সন্ধানে অবিরাম: বস্তুনিষ্ঠ ও স্বাধীন সাংবাদিকতার নিরলস অঙ্গীকারে দৈনিক বার্তাসন্ধান।" },
    { id: "fb-3", title: "আমাদের সংবাদ কক্ষে সরাসরি ইমেইল বা ফোন নম্বরে আপনার এলাকার জনগুরুত্বপূর্ণ খবর পাঠান।" },
    { id: "fb-4", title: "সরাসরি মাঠ পর্যায় থেকে সত্য ও নিরপেক্ষ সংবাদ পরিবেশনে আমাদের প্রতিনিধিরা দিন-রাত কাজ করছেন।" }
  ];


  const XIcon = () => (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.06 1.053 11.45 1.053c-5.442 0-9.866 4.372-9.87 9.802 0 1.772.465 3.502 1.344 5.014l-.99 3.614 3.713-.965zm11.367-7.405c-.3-.15-1.772-.875-2.047-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.24-1.106-1.554-1.631-1.802-2.03-.248-.4-.027-.615.123-.763.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.493-.508-.675-.518-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.228 5.125 4.53.716.31 1.275.495 1.71.635.72.23 1.375.197 1.892.12.576-.087 1.772-.725 2.022-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/>
    </svg>
  );

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative z-40" id="main-header">
      {/* 1. Main Hub: Date-Box (Left) | Brand Logo (Center) | Social & Buttons (Right) */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white">
        {/* Left Subsection: Date, Time & Weather Container */}
        <div className="w-full md:w-auto flex md:justify-start justify-center">
          <div className="border border-gray-200 bg-white rounded p-2 text-[11px] leading-tight font-display text-gray-600 max-w-[280px] w-full shadow-sm">
            {/* Top Row */}
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 gap-2">
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-gray-400 shrink-0" />
                <span className="text-red-600 font-bold tracking-tight">{formattedTime}</span>
              </div>
              <span className="text-gray-300 select-none">|</span>
              <div className="flex items-center gap-1 overflow-hidden">
                <CalendarDays size={13} className="text-emerald-500 shrink-0" />
                <span className="text-gray-700 font-medium truncate">{formattedEngDate}</span>
              </div>
            </div>
            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-1.5 gap-2">
              <div className="text-orange-700 font-bold tracking-tight shrink-0">
                {formattedBenDate} বঙ্গাব্দ
              </div>
              <span className="text-gray-300 select-none">|</span>
              <div className="flex items-center gap-1 text-gray-700 truncate">
                <WeatherIcon />
                <span className="truncate">{weather.city} {weather.temp}°সে. ({weather.condition})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Subsection: Large Brand Identity Callout */}
        <div className="flex flex-col items-center justify-center cursor-pointer flex-1" onClick={() => onNavigate("home")}>
          <img
            src={headerBranding.hdrLightLogoUrl || undefined}
            alt={headerBranding.settingsSiteTitle || "লোগো"}
            className="h-16 md:h-20 object-contain hover:scale-102 transition-transform duration-200"
            referrerPolicy="no-referrer"
            id="barat-logo"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const label = document.getElementById("barat-logo-fallback");
              if (label) label.style.display = "block";
            }}
          />
          <div id="barat-logo-fallback" className="hidden text-center">
            <h1 className="text-3xl md:text-4xl font-black font-display text-[#801818] tracking-tight">
              {headerBranding.settingsSiteTitle}
            </h1>
          </div>
        </div>

        {/* Right Subsection: Social Links + Special Buttons */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {socialLinks.facebook && socialLinks.facebook !== "#" && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="Facebook">
                <Facebook size={14} />
              </a>
            )}
            {socialLinks.twitter && socialLinks.twitter !== "#" && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="X">
                <XIcon />
              </a>
            )}
            {socialLinks.linkedin && socialLinks.linkedin !== "#" && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="LinkedIn">
                <Linkedin size={14} />
              </a>
            )}
            {socialLinks.youtube && socialLinks.youtube !== "#" && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="YouTube">
                <Youtube size={14} />
              </a>
            )}
            {socialLinks.instagram && socialLinks.instagram !== "#" && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="Instagram">
                <Instagram size={14} />
              </a>
            )}
            {socialLinks.whatsapp && socialLinks.whatsapp !== "#" && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 shadow-sm bg-white" title="WhatsApp">
                <WhatsAppIcon />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-display font-semibold text-xs rounded transition-all shadow-sm border border-gray-200/60 cursor-pointer">
              ই-পেপার
            </button>
            <button className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-sans font-semibold text-xs rounded transition-all shadow-sm border border-gray-200/60 cursor-pointer">
              English
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Bar: Mega-Menu Triggers + Search Bar + Dashboard/Logout Links */}
      <div className="border-t border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between w-full">
          {/* Main List of categories */}
          <div className="flex items-center overflow-x-auto scrollbar-none flex-1">
            <button
              onClick={onOpenMegaMenu}
              className="flex items-center gap-2 px-5 py-3.5 bg-[#801818] hover:bg-red-950 text-white font-display font-bold text-sm tracking-wide transition-all shrink-0 cursor-pointer"
              id="all-categories-hamburger"
            >
              <Menu size={18} />
              <span>সকল ক্যাটাগরি</span>
            </button>

            <nav className="flex-1 overflow-x-auto scrollbar-none flex items-center pr-4">
              <ul className="flex items-center whitespace-nowrap">
                {topNavCategories.map((cat) => (
                  <li key={cat} className="flex items-center">
                    <button
                      onClick={() => onSelectCategory(cat)}
                      className={`px-4 py-3.5 font-display font-semibold text-sm transition-all text-gray-700 hover:text-red-700 hover:bg-gray-50/70 cursor-pointer ${
                        activeCategory === cat ? "text-red-700 bg-red-50/50 font-bold border-b-2 border-red-700" : ""
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Search Bar Input & Admin Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 px-4 md:px-0 py-2 md:py-0 border-t md:border-t-0 border-gray-100 shrink-0 md:mr-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[180px] md:w-44">
              <input
                type="text"
                placeholder="সংবাদ খুঁজুন"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-display rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-700 transition-all bg-white"
                id="header-search-input"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-all cursor-pointer"
                id="header-search-submit"
              >
                <Search size={13} />
              </button>
            </form>

            <div className="flex items-center gap-3 relative">
              {activeUser ? (
                <div className="relative">
                  <button
                    id="login-dropdown-btn"
                    onClick={toggleLoginDropdown}
                    className="flex items-center gap-1.5 font-display font-bold text-gray-950 hover:text-red-700 transition-colors cursor-pointer text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <Building2 size={15} className="text-gray-800 shrink-0" />
                    <span>ড্যাশবোর্ড (Admin)</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {loginDropdownOpen && (
                    <div
                      id="login-dropdown-menu"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1 animate-fade-in"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-left">
                        <p className="text-[10px] text-gray-400 font-display">লগইন করা আছে</p>
                        <p className="text-xs font-bold text-slate-800 font-display truncate mt-0.5">{activeUser.name}</p>
                        <p className="text-[10px] text-blue-600 font-mono mt-0.5">{activeUser.designation}</p>
                      </div>
                      <button
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          const isAdmin = activeUser.userId === "admin" || activeUser.designation === "সম্পাদক";
                          onNavigate(isAdmin ? "admin" : "staffuser");
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-gray-800 hover:bg-gray-100 hover:text-red-700 font-display font-bold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Building2 size={13} className="text-gray-500" />
                        <span>আমার প্যানেল ড্যাশবোর্ড</span>
                      </button>
                      <button
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-650 hover:bg-red-50 font-display font-bold flex items-center gap-2 border-t border-gray-100 transition-colors cursor-pointer"
                      >
                        <LogOut size={13} className="text-red-500" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    id="login-dropdown-btn"
                    onClick={toggleLoginDropdown}
                    className="flex items-center gap-1.5 font-display font-bold text-gray-950 hover:text-red-700 transition-colors cursor-pointer text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <Building2 size={15} className="text-gray-800 shrink-0" />
                    <span>Login (Admin)</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {loginDropdownOpen && (
                    <div
                      id="login-dropdown-menu"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in"
                    >
                      <button
                        onClick={() => handleDropdownItemClick("staffuser")}
                        className="w-full px-4 py-2.5 text-left text-xs text-gray-800 hover:bg-gray-50 hover:text-blue-700 font-display font-bold flex items-center gap-3 transition-colors cursor-pointer border-b border-gray-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <div className="flex flex-col text-left">
                          <span>সংবাদ কর্মী প্যানেল</span>
                          <span className="text-[9px] text-gray-400 font-sans tracking-wide">Journalist Panel</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDropdownItemClick("admin")}
                        className="w-full px-4 py-2.5 text-left text-xs text-gray-800 hover:bg-gray-50 hover:text-red-700 font-display font-bold flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-650"></span>
                        <div className="flex flex-col text-left">
                          <span>সম্পাদক প্যানেল</span>
                          <span className="text-[9px] text-gray-400 font-sans tracking-wide">Editor Panel</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scrolling Headlines (Breaking News Ticker) */}
      <div className="bg-red-50/55 border-b border-red-100/70 h-10 flex items-center overflow-hidden max-w-7xl mx-auto w-full font-display">
        {/* Ticker Title Badge */}
        <div className="bg-[#801818] text-white text-xs font-bold px-4 h-full flex items-center gap-1.5 shrink-0 z-10 shadow-[4px_0_10px_rgba(140,29,29,0.15)] relative">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
          </span>
          <Flame size={14} className="fill-white animate-pulse" />
          <span className="tracking-wide text-[13px]">সর্বশেষ সংবাদ</span>
        </div>

        {/* Marquee Track Container */}
        <div className="flex-grow overflow-hidden h-full relative flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center h-full gap-12" style={{ willChange: "transform" }}>
            {/* Duplicated list elements for infinite loop marquee layout */}
            {[...(activeTickerList.length > 0 ? activeTickerList : defaultHeadlines), ...(activeTickerList.length > 0 ? activeTickerList : defaultHeadlines)].map((item, index) => {
              const isDatabaseItem = 'status' in item;
              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => {
                    if (isDatabaseItem && onSelectArticle) {
                      onSelectArticle(item.id);
                    }
                  }}
                  className={`inline-flex items-center gap-2.5 text-xs md:text-sm font-semibold transition-colors ${
                    isDatabaseItem ? "text-gray-800 hover:text-red-700 cursor-pointer" : "text-gray-700 select-none"
                  }`}
                >
                  <span className="text-red-700 font-extrabold text-sm select-none">✦</span>
                  <span className="font-display tracking-wide">{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>

    {/* 2. Sticky Compact Navigation Bar (Scroll State) */}
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md transform transition-all duration-300 ${
        isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`} 
      id="sticky-compact-header"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full px-4 h-[56px]">
        {/* Left Part: Small Logo */}
        <div className="flex items-center cursor-pointer shrink-0 mr-4" onClick={() => onNavigate("home")} id="sticky-logo-container">
          <img
            src={headerBranding.hdrLightLogoUrl || undefined}
            alt={headerBranding.settingsSiteTitle || "লোগো"}
            className="h-10 md:h-12 w-auto object-contain hover:scale-[1.02] transition-transform duration-200"
            referrerPolicy="no-referrer"
            id="barat-logo-sticky"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const label = document.getElementById("barat-logo-sticky-fallback");
              if (label) label.style.display = "block";
            }}
          />
          <div id="barat-logo-sticky-fallback" className="hidden">
            <span className="text-sm md:text-base font-bold font-display text-red-700 tracking-tight whitespace-nowrap">
              {headerBranding.settingsSiteTitle}
            </span>
          </div>
        </div>

        {/* Center Part: Hamburger + Categories Navigator List */}
        <div className="flex items-center overflow-x-auto scrollbar-none flex-1">
          <button
            onClick={onOpenMegaMenu}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#801818] hover:bg-red-950 text-white font-display font-bold text-xs tracking-wide transition-all shrink-0 cursor-pointer rounded-sm"
            id="sticky-categories-hamburger"
          >
            <Menu size={16} />
            <span>সকল ক্যাটাগরি</span>
          </button>

          <nav className="flex-1 overflow-x-auto scrollbar-none flex items-center pr-4">
            <ul className="flex items-center whitespace-nowrap">
              {topNavCategories.map((cat) => (
                <li key={cat} className="flex items-center">
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-2.5 font-display font-semibold text-xs transition-all text-gray-700 hover:text-red-700 hover:bg-gray-50/70 cursor-pointer ${
                      activeCategory === cat ? "text-red-700 bg-red-50/50 font-bold border-b-2 border-red-700" : ""
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right Part: Search & Admin Action Shortcuts */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <form onSubmit={handleSearchSubmit} className="relative w-28 md:w-40">
            <input
              type="text"
              placeholder="সংবাদ খুঁজুন"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-2.5 pr-7 py-1.5 text-xs font-display rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-700 transition-all bg-white"
              id="sticky-search-input"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-700 transition-all cursor-pointer"
              id="sticky-search-submit"
            >
              <Search size={12} />
            </button>
          </form>

          <div className="flex items-center gap-2 relative">
            {activeUser ? (
              <div className="relative">
                <button
                  id="login-dropdown-btn-sticky"
                  onClick={toggleStickyDropdown}
                  className="flex items-center gap-1 font-display font-bold text-gray-950 hover:text-red-700 transition-colors cursor-pointer text-xs whitespace-nowrap px-1.5 py-1 rounded hover:bg-gray-100"
                >
                  <Building2 size={14} className="text-gray-800 shrink-0" />
                  <span>ড্যাশবোর্ড</span>
                  <ChevronDown size={12} className={`text-gray-500 transition-transform ${stickyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {stickyDropdownOpen && (
                  <div
                    id="login-dropdown-menu-sticky"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in"
                  >
                    <div className="px-4 py-1.5 border-b border-gray-100 bg-gray-50/50 text-left">
                      <p className="text-[10px] text-gray-400 font-display">লগইন করা আছে</p>
                      <p className="text-xs font-bold text-slate-800 font-display truncate mt-0.5">{activeUser.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setStickyDropdownOpen(false);
                        const isAdmin = activeUser.userId === "admin" || activeUser.designation === "সম্পাদক";
                        onNavigate(isAdmin ? "admin" : "staffuser");
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-800 hover:bg-gray-100 hover:text-red-700 font-display font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Building2 size={13} className="text-gray-500" />
                      <span>আমার প্যানেল ড্যাশবোর্ড</span>
                    </button>
                    <button
                      onClick={() => {
                        setStickyDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-655 hover:bg-red-50 font-display font-bold flex items-center gap-2 border-t border-gray-100 transition-colors cursor-pointer"
                    >
                      <LogOut size={13} className="text-red-500" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  id="login-dropdown-btn-sticky"
                  onClick={toggleStickyDropdown}
                  className="flex items-center gap-1.5 font-display font-bold text-gray-950 hover:text-red-700 transition-colors cursor-pointer text-xs whitespace-nowrap px-1.5 py-1 rounded hover:bg-gray-100"
                >
                  <Building2 size={14} className="text-gray-800 shrink-0" />
                  <span>ড্যাশবোর্ড</span>
                  <ChevronDown size={12} className={`text-gray-500 transition-transform ${stickyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {stickyDropdownOpen && (
                  <div
                    id="login-dropdown-menu-sticky"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in"
                  >
                    <button
                      onClick={() => {
                        setStickyDropdownOpen(false);
                        onNavigate("staffuser");
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-800 hover:bg-gray-50 hover:text-blue-700 font-display font-bold flex items-center gap-3 transition-colors cursor-pointer border-b border-gray-50"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 text-left"></span>
                      <div className="flex flex-col text-left">
                        <span>সংবাদ কর্মী প্যানেল</span>
                        <span className="text-[9px] text-gray-400 font-sans">Journalist Panel</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setStickyDropdownOpen(false);
                        onNavigate("admin");
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-800 hover:bg-gray-55 hover:text-red-700 font-display font-bold flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-650 text-left"></span>
                      <div className="flex flex-col text-left">
                        <span>সম্পাদক প্যানেল</span>
                        <span className="text-[9px] text-gray-400 font-sans">Editor Panel</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
);
}
