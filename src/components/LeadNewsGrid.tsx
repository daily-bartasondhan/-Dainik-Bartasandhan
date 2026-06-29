/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Article } from "../types";
import { getBengaliTimeAgo, toBengaliDigits } from "../utils";
import { Clock, Flame } from "lucide-react";

// Bengali digit translations for sidebar list prefixing
const BENGALI_NUMBERS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০"];

// High-fidelity Safe HTML Ad component matching the mockup's clean layout precisely
function SafeHTMLAd({ html }: { html?: string }) {
  if (html && html.trim().length > 0) {
    return (
      <div 
        className="ad-container flex justify-center items-center overflow-hidden my-4 mx-auto max-w-full bg-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  
  return null;
}

function stripHtmlTags(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// 11 Fallback articles pre-seeded to precisely match the graphic mockup
const FALLBACK_ARTICLES: Article[] = [
  {
    id: "fb-0",
    title: "কক্সবাজারে প্রধানমন্ত্রী",
    subtitle: "একদিনের সফরে পর্যটন নগরী কক্সবাজারে পৌঁছেছেন প্রধানমন্ত্রী তারেক রহমান। আজ শনিবার কাল ১০টায় প্রধানমন্ত্রী বহনকারী বিমান কক্সবাজার বিমানবন্দরে অবতরণ করে।",
    description: "একদিনের সফরে পর্যটন নগরী কক্সবাজারে পৌঁছেছেন প্রধানমন্ত্রী তারেক রহমান। আজ শনিবার কাল ১০টায় প্রধানমন্ত্রী বহনকারী বিমান কক্সবাজার বিমানবন্দরে অবতরণ করে। এর আগে স...",
    content: "একদিনের সফরে পর্যটন নগরী কক্সবাজারে পৌঁছেছেন প্রধানমন্ত্রী তারেক রহমান। বিস্তারিত খবর খুব দ্রুত আসছে...",
    category: "জাতীয়",
    publicationDate: new Date(Date.now() - 19 * 60000).toISOString(), // 19m ago
    status: "Published",
    views: 1240,
    images: ["https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-1",
    title: "প্যারাগুয়েকে বিধ্বস্ত করে যুক্তরাষ্ট্রের শুরু",
    subtitle: "শুরুতেই আক্রমণাত্মক ফুটবলে উড়ন্ত জয় নিশ্চিত করলো লাতিন পরাশক্তিরা।",
    description: "খেলার শুরু থেকেই চমৎকার আক্রমণভাগে প্যারাগুয়ের রক্ষণভাগকে কাবু করে তিন গোলের বড় ব্যবধানে জয় ছিনিয়ে নিলো দল।",
    content: "প্যারাগুয়েকে বিধ্বস্ত করে জয়যাত্রা শুরু করলো লাতিন আমেরিকান বিশ্ব চ্যাম্পিয়ন দলটি। অত্যন্ত চমৎকার ফুটবলের মহড়া দেখিয়ে তারা জয়ী হয়েছে।",
    category: "খেলা",
    publicationDate: new Date(Date.now() - 26 * 60000).toISOString(), // 26m ago
    status: "Published",
    views: 890,
    images: ["https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-2",
    title: "বার কাউন্সিলের এমসিকিউতে পাস করলেন জাইমা রহমান",
    subtitle: "সফলভাবে বার কাউন্সিলের প্রথম ধাপ অতিক্রম করে প্রশংসায় ভাসছেন এই কৃতি সন্তান।",
    description: "এবারের বার কাউন্সিলের এমসিকিউ পরীক্ষায় ভালো ফলাফল করে তিনি তার পরিবার ও শিক্ষক সমাজকে গর্বিত করেছেন।",
    content: "বার কাউন্সিলের এমসিকিউ পাস করার পর অনুভূতি প্রকাশ করে জাইমা বলেন, 'এটি দীর্ঘ সাধনার ফল। সবার দোয়া ও সহযোগিতায় আজ এটি সম্ভব হয়েছে।' ",
    category: "জাতীয়",
    publicationDate: new Date(Date.now() - 60 * 60000).toISOString(), // 1h ago
    status: "Published",
    views: 1540,
    images: ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-3",
    title: "ব্রাজিলের প্রথম ম্যাচেই মরক্কো চ্যালেঞ্জ",
    subtitle: "লাতিন আমেরিকার শক্তিশালী দলের মুখোমুখি মরুভূমির সিংহরা।",
    description: "নতুন কোচের অধীনে ব্রাজিল তাদের গ্রুপ পর্বের প্রীতি ম্যাচে কঠিন লড়াইয়ের মুখোমুখি হতে যাচ্ছে মরক্কোর বিপক্ষে।",
    content: "ব্রাজিলের প্রথম ম্যাচেই মরক্কো চ্যালেঞ্জ। দুই দলের মুখোমুখি লড়াই দেখতে কোটি ফুটবলপ্রেমী অপেক্ষা করে আছেন।",
    category: "খেলা",
    publicationDate: new Date(Date.now() - 60 * 60000).toISOString(), // 1h ago
    status: "Published",
    views: 2310,
    images: ["https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-4",
    title: "বিনিয়োগ পরিবেশের উদ্যোগ থাকলেও সংশয় কাটছে না",
    subtitle: "শিল্পখাতে টেকসই বিনিয়োগ বাড়াতে কার্যকর নীতি সংস্কার প্রয়োজন বলে মন্তব্য বিশেষজ্ঞদের।",
    description: "অর্থনৈতিক অস্থিরতা ও দীর্ঘস্থায়ী অবকাঠামোগত সমস্যার কারণে ব্যবসা পরিচালনায় জটিলতা এখনও অপরিবর্তিত রয়েছে।",
    content: "বিনিয়োগ পরিবেশের উদ্যোগ থমকে ও সংশয় কাটে নাই। দেশের শীর্ষ ব্যবসায়ী নেতৃবৃন্দ কর কাঠামো সংস্কার করার জোর দাবি জানিয়েছেন।",
    category: "অর্থনীতি",
    publicationDate: new Date(Date.now() - 60 * 60000).toISOString(), // 1h ago
    status: "Published",
    views: 1120,
    images: ["https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "অনলাইন ডেস্ক",
    tags: []
  },
  {
    id: "fb-5",
    title: "বিশ্বক্যাপে যুক্তরাষ্ট্রের ভিসা পাননি ফিলিস্তিন ফুটবল প্রধান",
    subtitle: "যুক্তরাষ্ট্র দূতাবাসের এহেন সিদ্ধান্তে ক্রীড়ামহলে বইছে নিন্দার ঝড়।",
    description: "আসন্ন বিশ্বকাপ ফুটবল প্রতিযোগিতায় দলের সাথে অংশগ্রহণের টিকিট ও ভিসা না মেলায় ফিলিস্তিনের ক্রীড়াপ্রেমীরা ক্ষুব্ধ প্রতিক্রিয়া ব্যক্ত করেছেন।",
    content: "ভিসা না পাওয়ার বিষয়ে ফিলিস্তিন ফুটবল ফেডারেশন জানিয়েছিল যে এটি অপ্রয়োজনীয় এবং ক্রীড়াঙ্গনকে কলঙ্কিত করবে।",
    category: "খেলা",
    publicationDate: new Date(Date.now() - 300 * 60000).toISOString(), // 5h ago
    status: "Published",
    views: 3100,
    images: ["https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "বার্তা ডেস্ক",
    tags: []
  },
  {
    id: "fb-6",
    title: "নিত্যপণ্যের দাম কমবে এই বাজেটের ফলে: স্বরাষ্ট্রমন্ত্রী",
    subtitle: "বাজেট পাশের সুফল সাধারণ মানুষের দোরগোড়ায় পৌঁছে দেওয়া হবে বলে ঘোষণা মন্ত্রীর।",
    description: "নিত্যপ্রয়োজনীয় চাল, ডাল ও তেলের ওপর আমদানি শুল্ক ছাড় দেওয়ায় অতি শীঘ্রই বাজারদর উল্লেখযোগ্য হারে কমতি দেখাবে বলে আশ্বাস দেওয়া হয়েছে।",
    content: "স্বরাষ্ট্রমন্ত্রী বলেছেন, আমরা সিন্ডিকেট নিয়ন্ত্রণে জিরো টলারেন্স নীতি গ্রহণ করেছি। সাধারণ মানুষ স্বস্তিতে বাজার করতে পারবে।",
    category: "রাজনীতি",
    publicationDate: new Date(Date.now() - 400 * 60000).toISOString(), // 6.6h ago
    status: "Published",
    views: 4200,
    images: ["https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-7",
    title: "হাটে-ঘাটে বিশ্বকাপ উন্মাদনা",
    subtitle: "সারাদেশের আনাচে-কানাচে বইছে বিশ্বকাপ ফুটবলের তুমুল উত্তেজনা ও বড় পর্দায় রাত জেগে খেলা দেখার ধূম।",
    description: "গ্রামাঞ্চলের ছোট চায়ের দোকান থেকে শুরু করে শহরের সুউচ্চ বাড়ির চূড়ায় বিশাল পতাকার ওড়ানো আর সমর্থকদের প্রিয় দল নিয়ে তর্ক-বিতর্ক এখন তুঙ্গে।",
    content: "প্রতিটি ঘরে ঘরে প্রিয় দলের জার্সি গায়ে দিয়ে রাতের শিফটে খেলা দেখতে বসে পড়ছেন footballপ্রেমী মানুষজন। হাটে-ঘাটে বইছে বিশ্বকাপ উন্মাদনা।",
    category: "খেলা",
    publicationDate: new Date(Date.now() - 500 * 60000).toISOString(), // 8.3h ago
    status: "Published",
    views: 5200,
    images: ["https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "বিনোদন ডেস্ক",
    tags: []
  },
  {
    id: "fb-8",
    title: "ড্র দিয়ে কানাডার বিশ্বকাপ মিশন শুরু",
    subtitle: "অপেক্ষাকৃত শক্তিশালী দলের রক্ষণভাগ চুরমার করে সমান তালেই লড়ে ড্র তুললো কানাডা ফরোয়ার্ডরা।",
    description: "বিপক্ষ দলের মারমুখী প্রথমার্ধ কাটিয়ে দ্বিতীয়ার্ধে দুর্দান্ত এক হেডে গোল করে লড়াইয়ে সমতা ফিরিয়ে পয়েন্ট ভাগাভাগি করলো তারা।",
    content: "কানাডা কোচ উচ্ছ্বাস প্রকাশ করে বলেন, 'এই পয়েন্ট আমাদের গ্রুপ পর্বের কঠিন লড়াইয়ে টিকে থাকতে অনুপ্রেরণা জোগাবে। আমরা জয়ের মতনই খেলেছি।'",
    category: "খেলা",
    publicationDate: new Date(Date.now() - 600 * 60000).toISOString(), // 10h ago
    status: "Published",
    views: 2980,
    images: ["https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্পোর্টস ডেস্ক",
    tags: []
  },
  {
    id: "fb-9",
    title: "বাজেটে কালো টাকা সাদা করার সুযোগ রাখা হয়নি: এনবিআর চেয়ারম্যান",
    subtitle: "দুর্নীতি দমন ও স্বচ্ছতা বজায় রাখতে এবার আপোসহীন অবস্থানে কর কমিশন প্রশাসন।",
    description: "আইনসম্মতভাবে কর পরিশোধকারী সৎ নাগরিকদের উৎসাহ প্রদান এবং কর ফাঁকিবাজদের শাস্তির আওতায় আনতে নতুন কঠোর সংস্কার আনা হচ্ছে।",
    content: "জাতীয় রাজস্ব বোর্ডের চেয়ারম্যান পরিষ্কার বার্তা দিয়ে বলেছেন, এই বাজেটে কালো টাকা সাদা করার কোনো ধরনের অনৈতিক পথ সচল রাখা হয়নি।",
    category: "অর্থনীতি",
    publicationDate: new Date(Date.now() - 700 * 60000).toISOString(), // 11.6h ago
    status: "Published",
    views: 3150,
    images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "স্টাফ রিপোর্টার",
    tags: []
  },
  {
    id: "fb-10",
    title: "সরকার জামায়াত ও ১১ দলীয় জোটকে কোণঠাসা করার চেষ্টা চালাচ্ছে: নাহিদ ইসলাম",
    subtitle: "সাংবাদিকদের এক প্রেস ব্রিফিংয়ে ঐক্যবদ্ধ প্রতিরোধের জোর ডাক দিলেন জোট সমন্বয়ক।",
    description: "সরকার পক্ষ থেকে বিরোধী মতামত দমন করার জন্য বিভিন্ন প্রতিবন্ধকতা ও অন্যায় বিধিনিষেধ আরোপ করা হচ্ছে বলে গুরুতর অভিযোগ করা হয়।",
    content: "তিনি আরো বলেন, 'আমরা শান্তিপূর্ণ রাজনৈতিক কর্মসূচি পালনে অঙ্গীকারবদ্ধ, কিন্তু গণতান্ত্রিক মূল্যবোধকে জলাঞ্জলি দিতে দেওয়া হবে না।' ",
    category: "রাজনীতি",
    publicationDate: new Date(Date.now() - 800 * 60000).toISOString(), // 13h ago
    status: "Published",
    views: 4500,
    images: ["https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80"],
    reporterId: "admin",
    reporterName: "রাজনীতি ডেস্ক",
    tags: []
  }
];

// Beautiful high-fidelity default mock list shown exactly in the sidebar tab 'সর্বশেষ সংবাদ'
const DEFAULT_SIDEBAR_LATEST = [
  {
    id: "side-0",
    title: "সীমান্তে পুশ ইন ইস্যু আলোচনা হবে বিজিবি-বিএসএফ বৈঠকে: স্বরাষ্ট্রমন্ত্রী",
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "side-1",
    title: "রুদ্ধশ্বাস ম্যাচে টাইগারদের ঐতিহাসিক সিরিজ জয়: বিশ্বমঞ্চে লাল সবুজের নতুন গর্জন",
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "side-2",
    title: "ঈদ ধামাকা হিসেবে বড় পর্দায় শাকিব খানের নতুন ছবি 'তুফান-২' আসছে",
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "side-3",
    title: "নির্বাচনী সংস্কার ও অবাধ-সুষ্ঠু ভোটের দাবিতে আজ রাজধানীতে মহাসমাবেশ",
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "side-4",
    title: "জাতীয় সংসদে নতুন বাজেট পেশ: শিক্ষা, স্বাস্থ্য ও প্রযুক্তিতে সর্বোচ্চ অগ্রাধিকার বরাদ্দ",
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  }
];

interface LeadNewsGridProps {
  articles: Article[];
  popularArticles: Article[];
  onSelectArticle: (id: string) => void;
  onSelectCategory: (category: string) => void;
}

export default function LeadNewsGrid({
  articles,
  popularArticles,
  onSelectArticle,
  onSelectCategory
}: LeadNewsGridProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");

  const [adSettings, setAdSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("ad_settings");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("ad_settings");
        if (saved) {
          setAdSettings(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // -------------------------------------------------------------
  // DYNAMIC CONTINUOUS AUTO-SHIFTING CHAIN LOGIC (1 to 10 shift)
  // -------------------------------------------------------------
  const combined: Article[] = [...articles];
  for (let i = 0; i < FALLBACK_ARTICLES.length; i++) {
    if (combined.length <= i) {
      combined.push(FALLBACK_ARTICLES[i]);
    }
  }

  // Assign the exact sequence nodes dynamically
  const leadStory = combined[0]; 
  const leftStack = combined.slice(1, 5);
  const bottomGrid = combined.slice(5, 11);

  // Fallback sidebar handlers
  const sidebarList = activeTab === "latest" 
    ? DEFAULT_SIDEBAR_LATEST 
    : (popularArticles.length > 0 ? popularArticles.slice(0, 5) : DEFAULT_SIDEBAR_LATEST);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans space-y-8" id="master-shift-grid-container">
      
      {/* 1. TOP NEWS MAIN ROW LAYOUT (Left Stack List + Center Spotlight + Right Tabbed Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==============================================================
            LEFT SECTION (Col Span 3): Vertically Stacked News List (1-4)
            ============================================================== */}
        <div className="order-2 lg:order-1 lg:col-span-3 lg:border-r lg:border-gray-200 lg:pr-6">
          <div className="space-y-0.5 divide-y divide-gray-100">
            {leftStack.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item.id)}
                className="group cursor-pointer flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Thumbnail image on left */}
                <div className="w-24 aspect-[4/3] overflow-hidden shrink-0 bg-gray-50 rounded-sm">
                  <img
                    src={item.images[0] || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Title & Timeago on right */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <h4 className="text-[14px] md:text-[15px] font-display font-bold text-gray-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-sans mt-1 self-end">
                    {getBengaliTimeAgo(item.publicationDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==============================================================
            CENTER SECTION (Col Span 5): Spotlight Article
            ============================================================== */}
        <div className="order-1 lg:order-2 lg:col-span-5 lg:border-r lg:border-gray-200 lg:px-6">
          
          {/* Main heading category tab styled as a professional bookmark tab */}
          <div className="border-b border-gray-200 mb-4">
            <span className="bg-[#8c1d1d] text-white py-1.5 px-4 text-xs font-bold font-display inline-block rounded-t-md tracking-wide">
              প্রধান খবর
            </span>
          </div>

          {leadStory && (
            <div
              onClick={() => onSelectArticle(leadStory.id)}
              className="group cursor-pointer space-y-4"
              id="lead-story-main"
            >
              {/* Dynamic Aspect Ratio Cover Image */}
              <div className="overflow-hidden aspect-[16/10] bg-gray-50 rounded-sm">
                <img
                  src={leadStory.images[0] || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80"}
                  alt={leadStory.title}
                  className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-101"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title, description & date aligned exactly on right */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-display font-extrabold text-gray-950 group-hover:text-[#8c1d1d] transition-colors leading-tight">
                  {leadStory.title}
                </h2>
                
                {leadStory.subtitle ? (
                  <p className="text-sm text-gray-600 font-shonar leading-relaxed line-clamp-3">
                    {leadStory.subtitle}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 font-shonar leading-relaxed line-clamp-3">
                    {stripHtmlTags(leadStory.description)}
                  </p>
                )}
                
                <div className="flex justify-end">
                  <span className="text-[11px] text-gray-400 font-sans font-medium">
                    {getBengaliTimeAgo(leadStory.publicationDate)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==============================================================
            RIGHT SECTION (Col Span 4): Tab Selection List & Red Ads Logo
            ============================================================== */}
        <div className="order-3 lg:order-3 lg:col-span-4 lg:pl-6 space-y-6">
          
          {/* Latest vs Popular Ticker Tabs with proper red underline */}
          <div id="tabbed-ticker-feed" className="space-y-3">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("latest")}
                className={`pb-2.5 pr-4 font-display font-extrabold text-sm flex items-center gap-2 border-b-2 -mb-[1px] transition-all ${
                  activeTab === "latest"
                    ? "border-red-700 text-red-700"
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
                id="tab-latest"
              >
                <Clock size={15} />
                <span>সর্বশেষ সংবাদ</span>
              </button>
              <button
                onClick={() => setActiveTab("popular")}
                className={`pb-2.5 px-4 font-display font-extrabold text-sm flex items-center gap-2 border-b-2 -mb-[1px] transition-all ${
                  activeTab === "popular"
                    ? "border-red-700 text-red-700"
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
                id="tab-popular"
              >
                <Flame size={15} />
                <span>জনপ্রিয় সংবাদ</span>
              </button>
            </div>

            {/* List display with stylized custom Arabic digits prefix */}
            <div className="divide-y divide-gray-100">
              {sidebarList.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => item.id.startsWith("side") ? null : onSelectArticle(item.id)}
                  className="flex gap-3 py-3.5 first:pt-1 last:pb-0 cursor-pointer group"
                >
                  <span className="font-serif text-[28px] font-black text-slate-300 w-8 text-center shrink-0 leading-none group-hover:text-red-700 transition-colors pt-0.5">
                    {BENGALI_NUMBERS[index + 1] || toBengaliDigits(index + 1)}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[13px] md:text-[14px] font-display font-bold text-gray-900 group-hover:text-[#8c1d1d] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-sans block">
                      {getBengaliTimeAgo(item.publicationDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC EDITABLE RIGHT SIDEBAR AD SPACE (as requested by user) */}
          <SafeHTMLAd html={adSettings.adSidebar1} />

        </div>

      </div>

      {/* Clean horizontal divider from the mockup */}
      <hr className="border-t border-gray-200/80 my-8" />

      {/* ==============================================================
          2. BOTTOM GRID ROW SECTION (Col Span 12): Chain Nodes 5 to 10
          ============================================================== */}
      <div>
        {/* Strictly matches the mockup grid: image + bold title, no category tags, no footer, no description */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bottomGrid.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item.id)}
              className="group cursor-pointer bg-white transition-all duration-300 flex flex-col"
            >
              {/* Top Image Cover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 rounded-sm">
                <img
                  src={item.images[0] || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-101"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title right below image - No extra descriptions, categories, authors, or times! */}
              <h3 className="text-[15px] font-display font-extrabold text-gray-900 mt-3 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
