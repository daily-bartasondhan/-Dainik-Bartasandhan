/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CategoryMegaMenu from "./components/CategoryMegaMenu";
import LeadNewsGrid from "./components/LeadNewsGrid";
import ArticleDetail from "./components/ArticleDetail";
import AdminPanel from "./components/AdminPanel";
import StaffPanel from "./components/StaffPanel";
import { Article, Staff } from "./types";
import { getBengaliDateTime, toBengaliDigits, getBengaliTimeAgo } from "./utils";
import { Play, Flame, Search, ChevronRight, PlayCircle, Globe, Award, TrendingUp, AlertCircle, BookOpen } from "lucide-react";

function SafeHTMLAd({ html, className }: { html?: string; className?: string }) {
  if (!html) return null;
  return (
    <div 
      className={`ad-container flex justify-center items-center overflow-hidden my-4 mx-auto max-w-full ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function stripHtmlTags(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function App() {
  const [page, setPage] = useState<string>("home"); // home, category, item-detail, admin, staffuser
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mega Menu State
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Authentication states
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("dainik_token"));
  const [activeUser, setActiveUser] = useState<Staff | null>(null);

  // Footer Dynamic configurations initialized with defaults
  const [footerSettings, setFooterSettings] = useState(() => {
    const defaultVal = {
      footerBrandMode: "logo",
      footerBrandText: "বার্তাসন্ধান",
      footerLogo: "Footer-logo.png",
      footerLogoUrl: "https://i.postimg.cc/9MH8YcDj/Footer-logo.png",
      footerDescription: "সময়ের সাথে তাল মিলিয়ে সর্বশেষ খবরের নির্ভুল গন্তব্য দৈনিক বার্তাসন্ধান। বাংলাদেশ ও বিশ্বমঞ্চের ব্রেকিং নিউজ, রাজনীতি, অর্থনীতি, খেলাধুলা কিংবা বিনোদনের সব খবর—সবার আগে আপনার হাতের মুঠোয়। খবরের নতুন দিগন্ত উন্মোচন করতে এখনই ভিজিট করুন।",
      sompadok: "সম্পাদক ও প্রকাশক : প্রকৌশলী খালিদ হাসান , ভারপ্রাপ্ত সম্পাদক : মোহাম্মদ রবিন শেখ। বৃহত্তম ফরিদপুর থেকে প্রকাশিত দৈনিক বার্তাসন্ধান। প্রকাশনার ৬ তম বর্ষ।",
      copyright: "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)",
      location: "Saudi Arabia & Dhaka",
      email: "bangladeshisoftware@gmail.com",
      phone: "+88 01719498694",
      fax: "+88 01719498694",
      advertiseEmail: "bangladeshisoftware@gmail.com",
      facebook: "https://facebook.com/bangladeshisoftware",
      linkedin: "#",
      youtube: "#",
      twitter: "#",
      instagram: "#",
      whatsapp: "https://whatsapp.com",
      col2Title: "গুরুত্বপূর্ণ ক্যাটাগরি",
      col2Links: [
        { text: "বিজ্ঞান ও তথ্যপ্রযুক্তি", url: "/category/প্রযুক্তি" },
        { text: "আইন ও আদালত", url: "/category/জাতীয়" },
        { text: "আন্তর্জাতিক বিশ্ব", url: "/category/বিশ্ব" },
        { text: "রাজনীতি", url: "/category/রাজনীতি" },
        { text: "বাণিজ্য", url: "/category/জাতীয়" }
      ],
      col3Title: "নীতিমালা ও প্যানেল",
      col3Links: [
        { text: "গোপনীয়তার নীতি (Privacy)", url: "#" },
        { text: "ব্যবহারের শর্তাবলী", url: "#" },
        { text: "সংবাদ কর্মী প্যানেল", url: "staffuser" },
        { text: "সম্পাদক প্যানেল", url: "admin" }
      ],
      col4Title: "যোগাযোগ ও বার্তা কক্ষ",
      footerPanelBtnText: "সম্পাদক প্যানেল",
      pubEditMode: "combined",
      sharedName: "প্রকৌশলী খালিদ হাসান",
      sharedSocialUrl: "",
      pubName: "প্রকৌশলী খালিদ হাসান",
      pubSocialUrl: "",
      edName: "মোহাম্মদ রবিন শেখ",
      edSocialUrl: "",
      actingEdName: "মোহাম্মদ রবিন শেখ",
      actingEdSocialUrl: "",
      pubPlace: "বৃহত্তম ফরিদপুর",
      pubPaper: "দৈনিক বার্তাসন্ধান",
      pubYear: "৬ তম বর্ষ"
    };
    const saved = localStorage.getItem("footer_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.copyright === "স্বত্ব © দৈনিক প্রথম আলো (২০২৬)") {
          parsed.copyright = "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)";
        }
        return {
          ...defaultVal,
          ...parsed
        };
      } catch (e) {
        // ignore
      }
    }
    return defaultVal;
  });

  // Keep footer settings updated when navigation or state changes, and fetch from server
  useEffect(() => {
    const saved = localStorage.getItem("footer_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.copyright === "স্বত্ব © দৈনিক প্রথম আলো (২০২৬)") {
          parsed.copyright = "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)";
        }
        setFooterSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // ignore
      }
    }

    // Fetch live from database
    fetch("/api/database/settings_footer")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.copyright === "স্বত্ব © দৈনিক প্রথম আলো (২০২৬)") {
            data.copyright = "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)";
          }
          localStorage.setItem("footer_settings", JSON.stringify(data));
          setFooterSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Error loading live footer settings:", err));
  }, [page]);

  // SEO Dynamic configurations initialized with defaults
  const [seoSettings, setSeoSettings] = useState(() => {
    const saved = localStorage.getItem("seo_settings");
    if (saved) {
      try {
        return {
          metaDescription: "",
          metaKeywords: "",
          imageUploadRatio: "Default",
          ogImageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          ogImageName: "bartasandhan-meta-logo.webp",
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      metaDescription: "",
      metaKeywords: "",
      imageUploadRatio: "Default",
      ogImageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
      ogImageName: "bartasandhan-meta-logo.webp"
    };
  });

  // Keep seo settings updated and apply metadata to document head
  useEffect(() => {
    const saved = localStorage.getItem("seo_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSeoSettings(prev => ({ ...prev, ...parsed }));

        if (parsed.metaDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', parsed.metaDescription);
        }

        if (parsed.metaKeywords) {
          let metaKeys = document.querySelector('meta[name="keywords"]');
          if (!metaKeys) {
            metaKeys = document.createElement('meta');
            metaKeys.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeys);
          }
          metaKeys.setAttribute('content', parsed.metaKeywords);
        }

        if (parsed.ogImageUrl) {
          let metaOg = document.querySelector('meta[property="og:image"]');
          if (!metaOg) {
            metaOg = document.createElement('meta');
            metaOg.setAttribute('property', 'og:image');
            document.head.appendChild(metaOg);
          }
          metaOg.setAttribute('content', parsed.ogImageUrl);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [page]);

  // Ad settings synchronized with localStorage matching user config
  const [adSettings, setAdSettings] = useState(() => {
    const saved = localStorage.getItem("ad_settings");
    if (saved) {
      try {
        return {
          adsTxtCode: "google.com, pub-8896845634923038, DIRECT, f08c47fec0942fa0",
          headTagCode: "",
          adUnderNav: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjstz9GilJvTTeQNpTXnjdhzyTZIRDCutEixuEQVBhetfsVhdk2AXRaaM0oh-VRuer5p_WGDSEwzn9p0nkUiSUsVfJCgKrvx-OgT2b0B-lzGHTUyaFHtMCvhfubSaOyZks1gUKeic7Oxg8OwddoQ0N1UorxBkewS2IJD2wPiFPxN1Zi8jG2LFXUJSAdnwiT3A8Ja3OGexNT4C9B4vDFeS8h4k9bipsTBQc4nM5BFDSx3zH4MBIMeYNSWoUR4b94S9BitKWuvglb8jiPZaZLaZ2cyenIxjk0a4S0drh01HwAC5VlsMuXxxVizzUp8TZPy5iKdga54HP_M4ZpaQ2IcMKaP_B4_td8jGfmQA_YyiGN8TKAi9Whz5YvO4cXwSQH4fWcxQ&amp;sai=AMfl-Ysp-mtfVVIAk5sftegXk7YikTyTdVOZtvfK83S3CIXC8JjGiQty5UeV8lKdf4xF3tYqa3NRSQrFwnJ9ZMahxti5s7e3bumFqf20v92-"><img src="https://tpc.googlesyndication.com/simgad/5719408925861718514" border="0" width="320" height="100" /></a>',
          adVideoStoryUp: "",
          adVideoStoryDown: "",
          adHome1: "",
          adHome2: "",
          adHome3: "",
          adHome4: "",
          adHome5: "",
          adHome6: "",
          adHome7: "",
          adHome8: "",
          adHome9: "",
          adHome10: "",
          adSidebar1: "",
          adSidebar2: "",
          adSidebar3: "",
          adSidebar4: "",
          adSidebar5: "",
          adPhotoCardImg: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          adPhotoCardName: "ad_copy1.webp",
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      adsTxtCode: "google.com, pub-8896845634923038, DIRECT, f08c47fec0942fa0",
      headTagCode: "",
      adUnderNav: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjstz9GilJvTTeQNpTXnjdhzyTZIRDCutEixuEQVBhetfsVhdk2AXRaaM0oh-VRuer5p_WGDSEwzn9p0nkUiSUsVfJCgKrvx-OgT2b0B-lzGHTUyaFHtMCvhfubSaOyZks1gUKeic7Oxg8OwddoQ0N1UorxBkewS2IJD2wPiFPxN1Zi8jG2LFXUJSAdnwiT3A8Ja3OGexNT4C9B4vDFeS8h4k9bipsTBQc4nM5BFDSx3zH4MBIMeYNSWoUR4b94S9BitKWuvglb8jiPZaZLaZ2cyenIxjk0a4S0drh01HwAC5VlsMuXxxVizzUp8TZPy5iKdga54HP_M4ZpaQ2IcMKaP_B4_td8jGfmQA_YyiGN8TKAi9Whz5YvO4cXwSQH4fWcxQ&amp;sai=AMfl-Ysp-mtfVVIAk5sftegXk7YikTyTdVOZtvfK83S3CIXC8JjGiQty5UeV8lKdf4xF3tYqa3NRSQrFwnJ9ZMahxti5s7e3bumFqf20v92-"><img src="https://tpc.googlesyndication.com/simgad/5719408925861718514" border="0" width="320" height="100" /></a>',
      adVideoStoryUp: "",
      adVideoStoryDown: "",
      adHome1: "",
      adHome2: "",
      adHome3: "",
      adHome4: "",
      adHome5: "",
      adHome6: "",
      adHome7: "",
      adHome8: "",
      adHome9: "",
      adHome10: "",
      adSidebar1: "",
      adSidebar2: "",
      adSidebar3: "",
      adSidebar4: "",
      adSidebar5: "",
      adPhotoCardImg: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
      adPhotoCardName: "ad_copy1.webp"
    };
  });

  useEffect(() => {
    const syncAdSettings = () => {
      const saved = localStorage.getItem("ad_settings");
      if (saved) {
        try {
          setAdSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
          // ignore
        }
      }
    };
    syncAdSettings();
    window.addEventListener("storage", syncAdSettings);
    return () => window.removeEventListener("storage", syncAdSettings);
  }, [page]);

  // Handle Head Tag injection
  useEffect(() => {
    if (adSettings.headTagCode) {
      const existingId = "adsense-head-code-block";
      const oldElement = document.getElementById(existingId);
      if (oldElement) {
        oldElement.remove();
      }

      const div = document.createElement("div");
      div.id = existingId;
      div.innerHTML = adSettings.headTagCode;
      
      const scripts = div.getElementsByTagName("script");
      Array.from(scripts).forEach((script) => {
        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = script.textContent;
        document.head.appendChild(newScript);
      });
      
      const styles = div.getElementsByTagName("style");
      Array.from(styles).forEach(style => {
        document.head.appendChild(style.cloneNode(true));
      });
    }
  }, [adSettings.headTagCode]);

  // Articles & Listings datasets standard states
  const [articles, setArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<any>({
    leadNews: null,
    latestNews: [],
    popularNews: [],
    videoNews: [],
    categoryBlocks: {}
  });

  const [loading, setLoading] = useState(true);

  const [settingsSiteTitle, setSettingsSiteTitle] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settingsSiteTitle === "দৈনিক প্রথম আলো") return "দৈনিক বার্তাসন্ধান";
        if (parsed.settingsSiteTitle) return parsed.settingsSiteTitle;
      } catch (e) {}
    }
    return "দৈনিক বার্তাসন্ধান";
  });

  const [footerCategories, setFooterCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("category_order_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.footerCategories && Array.isArray(parsed.footerCategories) && parsed.footerCategories.length > 0) {
          return parsed.footerCategories;
        }
      } catch (e) {}
    }
    return ["বিজ্ঞান ও তথ্যপ্রযুক্তি", "আইন ও আদালত", "আন্তর্জাতিক বিশ্ব", "রাজনীতি", "বাণিজ্য"];
  });

  const [homeBlockCategories, setHomeBlockCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("category_order_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.prothomAloHomepageBlocks && Array.isArray(parsed.prothomAloHomepageBlocks) && parsed.prothomAloHomepageBlocks.length > 0) {
          return parsed.prothomAloHomepageBlocks;
        }
      } catch (e) {}
    }
    return ["জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "ভিডিও", "মতামত"];
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      const savedCategory = localStorage.getItem("category_order_settings");
      if (savedCategory) {
        try {
          const parsed = JSON.parse(savedCategory);
          if (parsed.footerCategories && Array.isArray(parsed.footerCategories) && parsed.footerCategories.length > 0) {
            setFooterCategories(parsed.footerCategories);
          }
          if (parsed.prothomAloHomepageBlocks && Array.isArray(parsed.prothomAloHomepageBlocks) && parsed.prothomAloHomepageBlocks.length > 0) {
            setHomeBlockCategories(parsed.prothomAloHomepageBlocks);
          }
        } catch (e) {}
      }

      const savedHeader = localStorage.getItem("header_settings");
      if (savedHeader) {
        try {
          const parsed = JSON.parse(savedHeader);
          if (parsed.settingsSiteTitle) {
            setSettingsSiteTitle(parsed.settingsSiteTitle);
          }
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);

  // Synchronize client-side page state with address bar pathnames
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path === "/admin" || path.startsWith("/admin/")) {
        setPage("admin");
      } else if (path === "/staff" || path.startsWith("/staff/") || path === "/staffuser" || path.startsWith("/staffuser/")) {
        setPage("staffuser");
      } else if (path.startsWith("/category/")) {
        const parts = path.split("/");
        const cat = parts[2] ? decodeURIComponent(parts[2]) : "";
        const sub = parts[3] ? decodeURIComponent(parts[3]) : "";
        setActiveCategory(cat);
        setActiveSubcategory(sub);
        setPage("category");
      } else if (path.startsWith("/news/")) {
        const parts = path.split("/").filter(Boolean);
        let id = "";
        if (parts.length >= 3) {
          if (/^\d+$/.test(parts[2])) {
            id = parts[2];
          } else if (/^\d+$/.test(parts[1])) {
            id = parts[1];
          } else {
            id = parts[2] || parts[1];
          }
        } else {
          id = parts[1] || "";
        }
        setSelectedArticleId(id);
        setPage("item-detail");
      } else {
        setPage("home");
      }
    };

    handleUrlRouting();
    window.addEventListener("popstate", handleUrlRouting);
    return () => window.removeEventListener("popstate", handleUrlRouting);
  }, [articles]);

  // Helper mechanism to set page and update address bar state
  const navigateTo = (targetPage: string, params?: { category?: string; subcategory?: string; articleId?: string }) => {
    setPage(targetPage);
    let path = "/";
    if (targetPage === "admin") {
      path = "/admin";
    } else if (targetPage === "staffuser") {
      path = "/staff";
    } else if (targetPage === "category" && params?.category) {
      setActiveCategory(params.category);
      if (params.subcategory) {
        setActiveSubcategory(params.subcategory);
        path = `/category/${encodeURIComponent(params.category)}/${encodeURIComponent(params.subcategory)}`;
      } else {
        setActiveSubcategory("");
        path = `/category/${encodeURIComponent(params.category)}`;
      }
    } else if (targetPage === "item-detail" && params?.articleId) {
      setSelectedArticleId(params.articleId);
      const art = articles.find(a => String(a.id) === String(params.articleId));
      if (art && art.dSubTitle && art.dSubTitle.trim() !== "") {
        path = `/news/${encodeURIComponent(art.dSubTitle.trim())}/${params.articleId}`;
      } else {
        path = `/news/${params.articleId}`;
      }
    } else if (targetPage === "home") {
      setActiveCategory("");
      setActiveSubcategory("");
    }
    
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  const handleFooterLinkClick = (url: string) => {
    if (!url) return;
    if (url === "admin" || url === "/admin") {
      navigateTo("admin");
    } else if (url === "staff" || url === "/staff" || url === "staffuser" || url === "/staffuser") {
      navigateTo("staffuser");
    } else if (url.startsWith("/category/") || url.startsWith("category/")) {
      const parts = url.replace(/^\/?category\//, "").split("/");
      const cat = parts[0] ? decodeURIComponent(parts[0]) : "জাতীয়";
      const sub = parts[1] ? decodeURIComponent(parts[1]) : undefined;
      navigateTo("category", sub ? { category: cat, subcategory: sub } : { category: cat });
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank");
    } else {
      const cleanUrl = url.trim();
      if (cleanUrl && cleanUrl !== "#") {
        navigateTo(cleanUrl);
      }
    }
  };

  // 1. Authenticate user on mount if token exists
  useEffect(() => {
    if (authToken) {
      if (authToken === "admin-jwt-mock-token") {
        const editorUser = {
          userId: "BatraSondhanAzmeer2026",
          name: "সম্পাদক",
          designation: "সম্পাদক",
          role: "admin",
          status: "Active"
        };
        setActiveUser(editorUser as any);
        return;
      }

      if (authToken.startsWith("staff-jwt-mock-")) {
        const uId = authToken.replace("staff-jwt-mock-", "");
        const DEFAULT_STAFF_LIST = [
          {
            "userId": "BatraSondhanAzmeer2026",
            "name": "Admin",
            "designation": "সম্পাদক",
            "role": "admin",
            "status": "Active"
          },
          {
            "userId": "reporter1",
            "name": "আবিদ রহমান",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "reporter2",
            "name": "ফারহানা ইয়াসমিন",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "razib",
            "name": "MOHAMMED RAZIB ALI",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "newuser",
            "name": "newuser",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "test",
            "name": "test",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "kazi",
            "name": "Kazi Anis",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "sabbir",
            "name": "Sabbir Hossain",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "amina",
            "name": "Amina Begum",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "rashed",
            "name": "Rashed Ahmed",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "nusrat",
            "name": "Nusrat Jahan",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "tanvir",
            "name": "Tanvir Islam",
            "designation": "User",
            "status": "Active"
          },
          {
            "userId": "mitu",
            "name": "Mitu Akter",
            "designation": "User",
            "status": "Active"
          }
        ];
        
        let foundStaff = null;
        try {
          const cached = localStorage.getItem("dainik_staff_list");
          if (cached) {
            const list = JSON.parse(cached);
            foundStaff = list.find((s: any) => s.userId === uId);
          }
        } catch (e) {}

        if (!foundStaff) {
          foundStaff = DEFAULT_STAFF_LIST.find((s: any) => s.userId === uId);
        }

        if (foundStaff) {
          setActiveUser(foundStaff as any);
          return;
        }
      }

      fetch("/api/auth/me", {
        headers: { "Authorization": authToken }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Stale session");
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid format");
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.user) {
            setActiveUser(data.user);
          } else {
            throw new Error("No user payload");
          }
        })
        .catch(() => {
          if (authToken === "admin-jwt-mock-token" || authToken.startsWith("staff-jwt-mock-")) {
            return;
          }
          localStorage.removeItem("dainik_token");
          setAuthToken(null);
          setActiveUser(null);
        });
    }
  }, [authToken]);

  // Guard against incorrect routing based on user designation / role
  useEffect(() => {
    if (activeUser) {
      const isAdmin = activeUser.userId === "admin" || activeUser.designation === "সম্পাদক";
      if (isAdmin && page === "staffuser") {
        navigateTo("admin");
      } else if (!isAdmin && page === "admin") {
        navigateTo("staffuser");
      }
    }
  }, [activeUser, page]);

  // 2. Fetch homepage grid blocks & items
  const loadHomeData = () => {
    setLoading(true);
    fetch("/api/home-groups")
      .then((res) => res.json())
      .then((data) => {
        setHomeBlocks(data);
        setArticles(data.latestNews);
        setPopularArticles(data.popularNews);
      })
      .catch((err) => console.error("Error loading home data", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // 3. Keep standard news lists refreshed periodically when adding posts
  useEffect(() => {
    if (page === "home") {
      loadHomeData();
    }
  }, [page]);

  // 4. Fetch category specific news when category is selected
  useEffect(() => {
    if (activeCategory) {
      let url = `/api/news?category=${activeCategory}`;
      if (activeSubcategory) {
        url += `&subcategory=${activeSubcategory}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setCategoryArticles(data);
        })
        .catch((err) => console.error(err));
    }
  }, [activeCategory, activeSubcategory]);

  // 5. Search trigger handler
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setPage("search-results");
    fetch(`/api/news?search=${query}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoryArticles(data);
      })
      .catch((err) => console.error(err));
  };

  // Auth logins SUCCESS callback
  const handleLoginSuccess = (user: Staff, token: string) => {
    localStorage.setItem("dainik_token", token);
    setAuthToken(token);
    setActiveUser(user);
    if (user.userId === "admin" || user.designation === "সম্পাদক") {
      setPage("admin");
    } else {
      setPage("staffuser");
    }
  };

  // Auth Logouts callback
  const handleLogout = () => {
    localStorage.removeItem("dainik_token");
    setAuthToken(null);
    setActiveUser(null);
    setPage("home");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between font-sans">
      {/* Off-canvas Category overlay Mega Menu */}
      <CategoryMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        onSelectCategory={(cat) => {
          navigateTo("category", { category: cat });
        }}
        onSelectSubcategory={(cat, sub) => {
          navigateTo("category", { category: cat, subcategory: sub });
        }}
      />

      {/* Styled top header layout */}
      {page !== "admin" && page !== "staffuser" && (
        <Header
          onOpenMegaMenu={() => setMegaMenuOpen(true)}
          onSelectCategory={(cat) => {
            if (cat === "সর্বশেষ") {
              navigateTo("home");
            } else {
              navigateTo("category", { category: cat });
            }
          }}
          onNavigate={(target) => {
            navigateTo(target);
          }}
          activeUser={activeUser}
          onLogout={handleLogout}
          onSearch={handleSearchSubmit}
          activeCategory={activeCategory}
          articles={articles}
          onSelectArticle={(id) => navigateTo("item-detail", { articleId: id })}
        />
      )}

      {/* Main Newspaper content sections */}
      <main className="flex-grow">
        {/* Ad Under Nav */}
        {page !== "admin" && page !== "staffuser" && (
          <SafeHTMLAd html={adSettings.adUnderNav} className="max-w-7xl px-4 md:px-6 my-2" />
        )}
        
        {page === "home" && (
          <div className="space-y-8 animate-fade-in">
            {/* Lead grid displaying lead news story & top ticker bars */}
            {loading ? (
              <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <div className="w-12 h-12 border-4 border-dotted border-primary-red border-t-transparent animate-spin rounded-full mx-auto"></div>
                <p className="font-display text-gray-500 mt-4 text-base">{settingsSiteTitle || "দৈনিক বার্তাসন্ধান"} লোড হচ্ছে...</p>
              </div>
            ) : (
              <>
                <LeadNewsGrid
                  articles={articles}
                  popularArticles={popularArticles}
                  onSelectArticle={(id) => {
                    navigateTo("item-detail", { articleId: id });
                  }}
                  onSelectCategory={(cat) => {
                    navigateTo("category", { category: cat });
                  }}
                />

                {/* Ad Home 1 */}
                <SafeHTMLAd html={adSettings.adHome1} className="max-w-7xl px-4 md:px-6 my-2" />

                {/* Horizontal Ticker Ribbon (Weather summary + Stock indexes) */}
                <div className="bg-gray-100/80 border-t border-b border-gray-200 py-3 px-4 overflow-hidden mb-4">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-2 font-display">
                    <span className="flex items-center gap-1.5 font-bold text-accent-blue">
                      <Globe size={14} className="text-primary-red" />
                      <span>বৈশ্বিক পূর্বাভাস: আজ ঢাকার সর্বোচ্চ তাপমাত্রা ৩৪° সেলসিয়াস, আকাশ আংশিক মেঘলা থাকতে পারে।</span>
                    </span>
                    <div className="flex gap-4 font-mono text-[11px] text-gray-500 font-semibold items-center">
                      <span>ডিএসইএক্স: ৫,৭৪০ (▲ ১.৬%)</span>
                      <span className="h-2.5 w-px bg-gray-300"></span>
                      <span>ইউএসডি/বিডিটি: ১১৭.৫০ (▼ ০.২%)</span>
                    </div>
                  </div>
                </div>

                {/* Ad Home 2 */}
                <SafeHTMLAd html={adSettings.adHome2} className="max-w-7xl px-4 md:px-6 my-2" />

                {/* Responsive Categories Bento-Grid Columns */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {homeBlockCategories.map((categoryName) => {
                    const blockKey = Object.keys(homeBlocks.categoryBlocks).find(k => k === categoryName) || categoryName;
                    const blockArticles = homeBlocks.categoryBlocks[blockKey] as Article[];
                    if (!blockArticles || blockArticles.length === 0) return null;

                    // First item has photo preview
                    const primaryNews = blockArticles[0];
                    const backupNews = blockArticles.slice(1);

                    return (
                      <div
                        key={categoryName}
                        className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                        id={`category-block-${categoryName}`}
                      >
                        {/* Header title */}
                        <div className="flex justify-between items-center border-b-2 border-red-700 pb-2">
                          <h3 className="text-lg font-display font-black text-accent-blue">{categoryName}</h3>
                          <button
                            onClick={() => {
                              navigateTo("category", { category: categoryName });
                            }}
                            className="text-xs text-primary-red hover:underline font-semibold font-display flex items-center"
                          >
                            <span>সব দেখুন</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>

                        {/* Top primary item visual with mini summary */}
                        {primaryNews && (
                          <div
                            onClick={() => {
                              navigateTo("item-detail", { articleId: primaryNews.id });
                            }}
                            className="group cursor-pointer space-y-2.5"
                          >
                            <div className="aspect-[16/10] overflow-hidden rounded-xl bg-gray-50">
                              <img
                                src={primaryNews.images[0] || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80"}
                                alt={primaryNews.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <h4 className="text-base font-display font-bold text-gray-900 group-hover:text-primary-red transition-colors leading-snug">
                              {primaryNews.title}
                            </h4>
                            <p className="text-xs text-gray-500 font-shonar line-clamp-2 leading-relaxed">
                              {stripHtmlTags(primaryNews.description)}
                            </p>
                          </div>
                        )}

                        {/* Sub headlines listing */}
                        <div className="divide-y divide-gray-100 space-y-2.5 pt-3">
                          {backupNews.map((news) => (
                            <div
                              key={news.id}
                              onClick={() => {
                                navigateTo("item-detail", { articleId: news.id });
                              }}
                              className="pt-2.5 cursor-pointer group flex justify-between items-start gap-4"
                            >
                              <h5 className="text-xs font-display font-medium text-gray-700 group-hover:text-primary-red transition-colors flex-1 leading-relaxed">
                                • {news.title}
                              </h5>
                              <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                {getBengaliTimeAgo(news.publicationDate)}
                              </span>
                            </div>
                          ))}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Ad Home 3 & Ad Home 4 Grid row */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <SafeHTMLAd html={adSettings.adHome3} />
                  <SafeHTMLAd html={adSettings.adHome4} />
                </div>

                {/* Ad VideoStory Up */}
                <SafeHTMLAd html={adSettings.adVideoStoryUp} className="max-w-7xl px-4 md:px-6 my-2" />

                {/* VIDEO GALLERY (ভিডিও গ্যালারি) representing YouTube anchors */}
                <div className="bg-slate-900 text-white py-12 px-4 md:px-6">
                  <div className="max-w-7xl mx-auto space-y-6">
                    
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <PlayCircle size={24} className="text-primary-red" />
                        <h3 className="text-xl font-display font-extrabold text-white">ভিডিও খবর ও প্রতিবেদন গ্যালারি</h3>
                      </div>
                      <span className="text-xs text-gray-400 font-display">লাইভ স্পট লাইট প্রতিবেদন</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {(!homeBlocks.videoNews || homeBlocks.videoNews.length === 0) ? (
                        (() => {
                          const availableVideos = articles.filter(art => art.videoUrl && art.videoUrl.trim() !== "");
                          if (availableVideos.length === 0) {
                            return (
                              <div className="col-span-full py-8 text-center text-gray-400 font-display text-sm">
                                কোনো ভিডিও সংবাদ পাওয়া যায়নি।
                              </div>
                            );
                          }
                          return availableVideos.slice(0, 4).map((art, idx) => (
                            <div
                              key={art.id || idx}
                              onClick={() => {
                                navigateTo("item-detail", { articleId: art.id });
                              }}
                              className="group cursor-pointer bg-white/5 rounded-xl border border-white/5 overflow-hidden hover:bg-white/10 transition-all shadow-md relative"
                            >
                              <div className="aspect-video relative overflow-hidden">
                                <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover grayscale-10 group-hover:grayscale-0 group-hover:scale-103 transition-all duration-300" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="text-white fill-white bg-primary-red/80 p-3 rounded-full w-12 h-12 hover:scale-110 transition-transform" />
                                </div>
                              </div>
                              <div className="p-3.5 space-y-1">
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">{art.category}</span>
                                <h4 className="text-xs font-display font-semibold text-gray-100 group-hover:text-red-300 transition-colors line-clamp-2 leading-relaxed">
                                  {art.title}
                                </h4>
                              </div>
                            </div>
                          ));
                        })()
                      ) : (
                        homeBlocks.videoNews.map((art) => (
                          <div
                            key={art.id}
                            onClick={() => {
                              navigateTo("item-detail", { articleId: art.id });
                            }}
                            className="group cursor-pointer bg-[#ffffff]/5 rounded-xl border border-white/5 overflow-hidden hover:bg-white/10 transition-all shadow-md relative"
                          >
                            <div className="aspect-video relative overflow-hidden">
                              <img src={art.images[0] || (art.videoUrl ? `https://img.youtube.com/vi/${art.videoUrl.split('v=')[1]?.split('&')[0] || art.videoUrl.split('/').pop()?.split('?')[0]}/hqdefault.jpg` : "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80")} alt={art.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="text-white fill-white bg-primary-red/80 p-3 rounded-full w-12 h-12" />
                              </div>
                            </div>
                            <div className="p-3.5 space-y-1">
                              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{art.category}</span>
                              <h4 className="text-xs font-display font-semibold text-gray-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-relaxed">
                                {art.title}
                              </h4>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

                {/* Ad VideoStory Down */}
                <SafeHTMLAd html={adSettings.adVideoStoryDown} className="max-w-7xl px-4 md:px-6 my-2" />

                {/* Additional Home Block Ads (adHome5 - adHome10) */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4 my-2">
                  <SafeHTMLAd html={adSettings.adHome5} />
                  <SafeHTMLAd html={adSettings.adHome6} />
                  <SafeHTMLAd html={adSettings.adHome7} />
                  <SafeHTMLAd html={adSettings.adHome8} />
                  <SafeHTMLAd html={adSettings.adHome9} />
                  <SafeHTMLAd html={adSettings.adHome10} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Category News Listings page */}
        {(page === "category" || page === "search-results") && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 font-sans space-y-6" id="category-listings-page">
            
            {/* Title banner */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-8 bg-primary-red rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-accent-blue uppercase">
                    {page === "search-results" ? "খোঁজার ফলাফল (Search Results)" : activeCategory}
                  </h2>
                  {activeSubcategory && (
                    <span className="text-xs font-display font-bold text-red-800 bg-red-100 px-3 py-0.5 rounded-full mt-1.5 inline-block">
                      {activeSubcategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Subcategories Selector for Sports/Entertainment */}
              {activeCategory === "খেলা" && (
                <div className="flex gap-2 font-display text-xs font-semibold">
                  {["ক্রিকেট", "ফুটবল", "অন্যান্য"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        activeSubcategory === sub
                          ? "bg-primary-red text-white border-primary-red"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                  {activeSubcategory && (
                    <button onClick={() => setActiveSubcategory("")} className="px-2 py-1.5 text-xs text-red-600 font-bold">
                      সমস্ত খেলুন ×
                    </button>
                  )}
                </div>
              )}

              {activeCategory === "বিনোদন" && (
                <div className="flex gap-2 font-display text-xs font-semibold">
                  {["ঢালিউড", "বলিউড", "হলিউড", "অন্যান্য"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        activeSubcategory === sub
                          ? "bg-primary-red text-white border-primary-red"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                  {activeSubcategory && (
                    <button onClick={() => setActiveSubcategory("")} className="px-2 py-1.5 text-xs text-red-600 font-bold">
                      সমস্ত বিনোদন ×
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* List columns */}
            {categoryArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                <AlertCircle className="text-gray-400 mx-auto" size={48} />
                <p className="font-display font-medium text-gray-500">বর্তমানে এই বিভাগে কোনো প্রকাশিত সংবাদ নেই!</p>
                <p className="font-display text-xs text-gray-400">নতুন আপডেট পেতে আমাদের সঙ্গে যুক্ত থাকুন।</p>
                <button
                  onClick={() => navigateTo("home")}
                  className="px-4 py-1.5 bg-primary-red text-white hover:bg-red-800 text-xs font-display rounded-lg transition-colors cursor-pointer"
                >
                  প্রচ্ছদে ফিরে যান
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryArticles.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigateTo("item-detail", { articleId: item.id });
                    }}
                    className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                  >
                    <div className="aspect-video overflow-hidden bg-gray-50">
                      <img
                        src={item.images[0] || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] bg-red-100 text-red-800 font-display font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-display font-bold text-gray-900 group-hover:text-primary-red transition-colors line-clamp-2 leading-relaxed">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-shonar">
                          {stripHtmlTags(item.description)}
                        </p>
                      </div>
                      <div className="text-[10px] text-gray-400 flex justify-between items-center font-mono">
                        <span>{getBengaliTimeAgo(item.publicationDate)}</span>
                        <span>{toBengaliDigits(item.views)} পঠিত</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Article Reading Screen */}
        {page === "item-detail" && (
          <ArticleDetail
            articleId={selectedArticleId}
            onBack={() => navigateTo("home")}
            onSelectArticle={(id) => {
              navigateTo("item-detail", { articleId: id });
            }}
          />
        )}

        {/* Administrator portal */}
        {page === "admin" && (
          <AdminPanel
            onLoginSuccess={handleLoginSuccess}
            activeUser={activeUser}
            onNavigateHome={() => navigateTo("home")}
          />
        )}

        {/* Staff / Reporter Portal route */}
        {page === "staffuser" && (
          <StaffPanel
            onLoginSuccess={handleLoginSuccess}
            activeUser={activeUser}
            onNavigateHome={() => navigateTo("home")}
          />
        )}

      </main>

      {/* FOOTER matching standard detailed Ittefaq structure */}
      {page !== "admin" && page !== "staffuser" && (
        <footer className="bg-slate-900 text-white border-t-4 border-primary-red font-sans pt-12 pb-6 px-4 md:px-6 mt-12" id="main-footer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            
            {/* Logo Slogan column */}
            <div className="space-y-4">
              {footerSettings.footerBrandMode === "logo" ? (
                <img
                  src={footerSettings.footerLogoUrl || "https://i.postimg.cc/9MH8YcDj/Footer-logo.png"}
                  alt="Footer Logo"
                  className="h-14 max-h-16 object-contain text-left"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-2xl font-extrabold tracking-tight text-white font-sans">
                  {footerSettings.footerBrandText || "বার্তাসন্ধান"}
                </div>
              )}

              {/* Editor, Publisher, Acting Editor details below logo (no boxes, bold cyan-like or white links) */}
              <div className="space-y-1.5 pt-1 text-sm font-display border-t border-white/5 mt-2">
                {(() => {
                  const mode = footerSettings.pubEditMode || "combined";
                  const sharedN = footerSettings.sharedName || "প্রকৌশলী খালিদ হাসান";
                  const pubN = footerSettings.pubName || "প্রকৌশলী খালিদ হাসান";
                  const edN = footerSettings.edName || "মোহাম্মদ রবিন শেখ";
                  const actingN = footerSettings.actingEdName || "মোহাম্মদ রবিন শেখ";

                  const sharedLink = footerSettings.sharedSocialUrl || "";
                  const pubLink = footerSettings.pubSocialUrl || "";
                  const edLink = footerSettings.edSocialUrl || "";
                  const actingLink = footerSettings.actingEdSocialUrl || "";

                  const renderLinkInline = (name: string, url: string) => {
                    if (url && url.trim().length > 0 && url !== "#") {
                      return (
                        <a
                          href={url.startsWith("http") ? url : `https://${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white hover:text-red-400 font-extrabold hover:underline transition-colors cursor-pointer duration-150 inline"
                        >
                          {name}
                        </a>
                      );
                    }
                    return <span className="text-white font-extrabold inline">{name}</span>;
                  };

                  if (mode === "combined") {
                    return (
                      <div className="space-y-1">
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <span className="text-gray-300 font-semibold">সম্পাদক ও প্রকাশক:</span> {renderLinkInline(sharedN, sharedLink)}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <span className="text-gray-300 font-semibold">ভারপ্রাপ্ত সম্পাদক:</span> {renderLinkInline(actingN, actingLink)}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-1">
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <span className="text-gray-300 font-semibold">সম্পাদক:</span> {renderLinkInline(edN, edLink)}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <span className="text-gray-300 font-semibold">প্রকাশক:</span> {renderLinkInline(pubN, pubLink)}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <span className="text-gray-300 font-semibold">ভারপ্রাপ্ত সম্পাদক:</span> {renderLinkInline(actingN, actingLink)}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>

              <p className="text-xs text-gray-450 leading-relaxed font-display border-t border-white/5 pt-2">
                {footerSettings.footerDescription}
              </p>
            </div>

            {/* Quick rows column 1 */}
            <div className="space-y-4 font-display">
              <h4 className="text-sm font-extrabold text-red-400 pb-1 border-b border-white/5 uppercase">
                {footerSettings.col2Title || "গুরুত্বপূর্ণ ক্যাটাগরি"}
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                {(footerSettings.col2Links || []).map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleFooterLinkClick(link.url)}
                      className="hover:text-red-400 hover:underline cursor-pointer text-left block"
                    >
                      • {link.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick rows column 2 */}
            <div className="space-y-4 font-display">
              <h4 className="text-sm font-extrabold text-red-400 pb-1 border-b border-white/5 uppercase">
                {footerSettings.col3Title || "নীতিমালা ও প্যানেল"}
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                {(footerSettings.col3Links || []).map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleFooterLinkClick(link.url)}
                      className="hover:text-red-400 hover:underline cursor-pointer text-left block"
                    >
                      • {link.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slogan and addresses */}
            <div className="space-y-4 font-display">
              <h4 className="text-sm font-extrabold text-red-400 pb-1 border-b border-white/5 uppercase">
                {footerSettings.col4Title || "যোগাযোগ ও বার্তা কক্ষ"}
              </h4>
              <div className="space-y-3 text-xs text-gray-400 leading-relaxed font-sans">
                {footerSettings.location && (
                  <div className="space-y-0.5">
                    <span className="text-gray-300 font-extrabold block text-[10px] uppercase">ঠিকানা:</span>
                    <p className="text-gray-400 font-medium">{footerSettings.location}</p>
                  </div>
                )}
                {footerSettings.phone && (
                  <div className="space-y-0.5">
                    <span className="text-gray-300 font-extrabold block text-[10px] uppercase">ফোন ও ফ্যাক্স:</span>
                    <p className="text-gray-400 font-medium">{footerSettings.phone} {footerSettings.fax && footerSettings.fax !== footerSettings.phone && `, ফ্যাক্স: ${footerSettings.fax}`}</p>
                  </div>
                )}
                {footerSettings.email && (
                  <div className="space-y-0.5">
                    <span className="text-gray-300 font-extrabold block text-[10px] uppercase">ইমেইল:</span>
                    <p className="text-gray-400 font-medium">{footerSettings.email}</p>
                  </div>
                )}
                {footerSettings.advertiseEmail && (
                  <div className="space-y-0.5">
                    <span className="text-gray-300 font-extrabold block text-[10px] uppercase">বিজ্ঞাপন মেইল:</span>
                    <p className="text-gray-400 font-medium">{footerSettings.advertiseEmail}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer Credit legal notices */}
          <div className="max-w-7xl mx-auto pt-6 flex justify-center items-center border-t border-white/10 mt-4 text-gray-400 font-sans text-center">
            <div className="text-xs md:text-sm leading-relaxed font-display text-center">
              {(() => {
                const place = footerSettings.pubPlace || "বৃহত্তম ফরিদপুর";
                const paper = footerSettings.pubPaper || "দৈনিক বার্তাসন্ধান";
                const year = footerSettings.pubYear || "৬ তম বর্ষ";
                const copyright = footerSettings.copyright || "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)";

                return (
                  <span className="leading-loose flex flex-wrap justify-center items-center gap-y-1 text-gray-400">
                    <span className="font-semibold text-gray-200">{copyright}</span>
                    <span className="mx-2 text-gray-600">|</span>
                    <span>{place} থেকে প্রকাশিত {paper}। প্রকাশনার {year}।</span>
                  </span>
                );
              })()}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
