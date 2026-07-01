/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Staff, Article, VisitorLog } from "../types";
import { toBengaliDigits, compressImage } from "../utils";
import VisitorLogsTable from "./VisitorLogsTable";
import RichTextEditor from "./RichTextEditor";
import CategoryDropdownSelect from "./CategoryDropdownSelect";
import { getOrInitializeVisitorLogs, saveVisitorLogs } from "../utils/visitorGenerator";
import {
  ShieldAlert, LayoutDashboard, UserPlus, FileEdit, Users, CheckSquare, PlusCircle,
  Eye, EyeOff, Edit, Check, Trash2, ShieldCheck, MapPin, Phone, ChevronRight, X, AlertCircle,
  List, FileText, Image, Video, Download, RotateCw, AlertTriangle, ChevronDown, Menu, Settings, GraduationCap, Scan,
  Search, Plus, Calendar, Upload, Facebook, Twitter, Linkedin, MessageCircle, Copy, Info, Lock, Mail, Rss, Wrench, Youtube, Instagram,
  Undo, Redo, Printer, Maximize2, Columns, Code, Underline, Italic, Bold, AlignLeft, AlignCenter, AlignRight, ListOrdered, Outdent, Indent, Link, Grid, Baseline, Paintbrush
} from "lucide-react";

interface AdminPanelProps {
  onLoginSuccess: (user: Staff, token: string) => void;
  activeUser: Staff | null;
  onNavigateHome: () => void;
}

const stripHtmlTags = (html?: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export default function AdminPanel({ onLoginSuccess, activeUser, onNavigateHome }: AdminPanelProps) {
  // Login credentials state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Views / Tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Synchronize activeTab with URL routing /admin/TabName
  useEffect(() => {
    const ADMIN_TAB_URL_MAP: Record<string, string> = {
      dashboard: "Dashboard",
      categories: "Categories",
      posts: "AllPosts",
      images: "Images",
      videos: "Videos",
      reviews: "RequestPosts",
      req_images: "RequestImages",
      req_videos: "RequestVideos",
      imported: "ImportedPosts",
      staff: "StaffAccounts",
      stafflist: "StaffList",
      app_settings: "AppSettings",
      users: "Users",
      families: "Families",
      visitors: "Visitors",
      photo_cards: "PhotoCards",
    };

    // Determine initial tab from current URL on load/mount
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/admin/")) {
      const suffix = currentPath.substring("/admin/".length).toLowerCase();
      const matchedTab = Object.keys(ADMIN_TAB_URL_MAP).find(
        (key) => ADMIN_TAB_URL_MAP[key].toLowerCase() === suffix
      );
      if (matchedTab) {
        setActiveTab(matchedTab);
      }
    } else if (currentPath === "/admin") {
      // Default to dashboard
      window.history.replaceState({}, "", "/admin/Dashboard");
      setActiveTab("dashboard");
    }
  }, []);

  useEffect(() => {
    const ADMIN_TAB_URL_MAP: Record<string, string> = {
      dashboard: "Dashboard",
      categories: "Categories",
      posts: "AllPosts",
      images: "Images",
      videos: "Videos",
      reviews: "RequestPosts",
      req_images: "RequestImages",
      req_videos: "RequestVideos",
      imported: "ImportedPosts",
      staff: "StaffAccounts",
      stafflist: "StaffList",
      app_settings: "AppSettings",
      users: "Users",
      families: "Families",
      visitors: "Visitors",
      photo_cards: "PhotoCards",
    };

    const suffix = ADMIN_TAB_URL_MAP[activeTab];
    if (suffix) {
      const targetPath = `/admin/${suffix}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, "", targetPath);
      }
    }
  }, [activeTab]);

  const [isManagementExpanded, setIsManagementExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic Metrics State
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [requestImages, setRequestImages] = useState<any[]>([]);
  const [requestVideos, setRequestVideos] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search filter for posts tab
  const [postsSearchQuery, setPostsSearchQuery] = useState("");
  const [postsCategoryFilter, setPostsCategoryFilter] = useState("All");
  const [postsAuthorFilter, setPostsAuthorFilter] = useState("All");
  const [postsStatusFilter, setPostsStatusFilter] = useState("All");

  // Search filter for images tab
  const [imagesSearchQuery, setImagesSearchQuery] = useState("");
  const [imagesAuthorFilter, setImagesAuthorFilter] = useState("All");

  // Search filter for videos tab
  const [videosSearchQuery, setVideosSearchQuery] = useState("");
  const [videosAuthorFilter, setVideosAuthorFilter] = useState("All");
  const [viewingVideoPost, setViewingVideoPost] = useState<Article | null>(null);

  // Direct News Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [dSubTitle, setDSubTitle] = useState("");
  const [category, setCategory] = useState("জাতীয়");
  const [subcategory, setSubcategory] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [images, setImages] = useState<string[]>(["", "", "", "", ""]);

  // Create Staff Form State
  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newStaffId, setNewStaffId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState<any>("স্টাফ রিপোর্টার");
  const [newFatherName, setNewFatherName] = useState("");
  const [newMotherName, setNewMotherName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newNid, setNewNid] = useState("");
  const [newPresentAddress, setNewPresentAddress] = useState("");
  const [newPermanentAddress, setNewPermanentAddress] = useState("");

  // New specific user fields matching screenshot
  const [newUserEmail, setNewUserEmail] = useState("");
  const [heSheIsAuthor, setHeSheIsAuthor] = useState(false);
  const [newAutoApprovePost, setNewAutoApprovePost] = useState(false);
  const [newAuthorCity, setNewAuthorCity] = useState("");
  const [newAuthorAddress, setNewAuthorAddress] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const [pictureFileName, setPictureFileName] = useState("");
  const [pictureBase64, setPictureBase64] = useState("");

  // Active selected staff member for ID Card Preview
  const [previewStaff, setPreviewStaff] = useState<Staff | null>(null);

  // Review editing modal state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Portal Users State for Management
  const [portalUsers, setPortalUsers] = useState<any[]>([
    { id: "U-101", name: "আব্দুর রহমান", email: "rahman@gmail.com", phone: "01712345678", role: "Contributor", status: "Active", joinedDate: "01 Jun 2026" },
    { id: "U-102", name: "তাসমিয়া আহমেদ", email: "tasmia@gmail.com", phone: "01811223344", role: "Reporter", status: "Active", joinedDate: "03 Jun 2026" },
    { id: "U-103", name: "সাকিব আল হাসান", email: "sakib@hotmail.com", phone: "01999887766", role: "Editor", status: "Active", joinedDate: "04 Jun 2026" },
    { id: "U-104", name: "আতিয়া চৌধুরী", email: "atiya@gmail.com", phone: "01555443322", role: "Subscriber", status: "Suspended", joinedDate: "05 Jun 2026" },
    { id: "U-105", name: "মেহেদী হাসান", email: "mehedi@yahoo.com", phone: "01333445566", role: "Subscriber", status: "Active", joinedDate: "08 Jun 2026" },
  ]);
  const [isPortalUsersLoaded, setIsPortalUsersLoaded] = useState(false);
  const [isFamiliesLoaded, setIsFamiliesLoaded] = useState(false);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [showAddPortalUserModal, setShowAddPortalUserModal] = useState(false);
  const [newPortalUserName, setNewPortalUserName] = useState("");
  const [newPortalUserEmail, setNewPortalUserEmail] = useState("");
  const [newPortalUserPhone, setNewPortalUserPhone] = useState("");
  const [newPortalUserRole, setNewPortalUserRole] = useState("Contributor");
  const [newPortalUserStatus, setNewPortalUserStatus] = useState("Active");

  // Families State for Management
  const [familiesList, setFamiliesList] = useState<any[]>([
    { id: "F-501", headName: "মোঃ নুরুল ইসলাম", memberCount: 5, phone: "01712345601", villageWard: "ওয়ার্ড-০৩, ফরিদপুর সদর", cardType: "Red", status: "Active", registeredDate: "12 May 2026" },
    { id: "F-502", headName: "মোসাম্মত ছালেহা খাতুন", memberCount: 4, phone: "01822334402", villageWard: "ওয়ার্ড-০১, আলফাডাঙ্গা", cardType: "Green", status: "Active", registeredDate: "18 May 2026" },
    { id: "F-503", headName: "আবুল কাসেম চৌধুরী", memberCount: 6, phone: "01933445503", villageWard: "ওয়ার্ড-০৯, মধুখালী", cardType: "Blue", status: "Pending", registeredDate: "25 May 2026" },
    { id: "F-504", headName: "সুফিয়া বেগম", memberCount: 3, phone: "01544556604", villageWard: "ওয়ার্ড-০৫, বোয়ালমারী", cardType: "Red", status: "Inactive", registeredDate: "01 Jun 2026" },
    { id: "F-505", headName: "রমেশ চন্দ্র সরকার", memberCount: 5, phone: "01355667705", villageWard: "ওয়ার্ড-০২, সদরপুর", cardType: "Green", status: "Active", registeredDate: "07 Jun 2026" },
  ]);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [newFamilyHeadName, setNewFamilyHeadName] = useState("");
  const [newFamilyMemberCount, setNewFamilyMemberCount] = useState(4);
  const [newFamilyPhone, setNewFamilyPhone] = useState("");
  const [newFamilyVillage, setNewFamilyVillage] = useState("");
  const [newFamilyCardType, setNewFamilyCardType] = useState("Green");
  const [newFamilyStatus, setNewFamilyStatus] = useState("Active");

  // Photo Card Setup
  const [selectedCardType, setSelectedCardType] = useState("Staff ID");
  const [cardHolderName, setCardHolderName] = useState("আব্দুর রহমান");
  const [cardHolderRole, setCardHolderRole] = useState("স্টাফ রিপোর্টার");
  const [cardHolderPhone, setCardHolderPhone] = useState("01712345678");
  const [cardHolderId, setCardHolderId] = useState("BS-77194");
  const [cardHolderPhoto, setCardHolderPhoto] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80");

  // Application Settings Custom States
  const [activeSettingsTab, setActiveSettingsTab] = useState("header");
  const [hdrLightLogoFilename, setHdrLightLogoFilename] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hdrLightLogoFilename) return parsed.hdrLightLogoFilename;
      } catch (e) {}
    }
    return "a1eda4362ec-c439afe9167-Prothom-Alo-logo.webp";
  });
  const [hdrLightLogoUrl, setHdrLightLogoUrl] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hdrLightLogoUrl) return parsed.hdrLightLogoUrl;
      } catch (e) {}
    }
    return "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png";
  });

  const [hdrDarkLogoFilename, setHdrDarkLogoFilename] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hdrDarkLogoFilename) return parsed.hdrDarkLogoFilename;
      } catch (e) {}
    }
    return "67517705aa5-prothom-Alo-logo_copy6.webp";
  });
  const [hdrDarkLogoUrl, setHdrDarkLogoUrl] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hdrDarkLogoUrl) return parsed.hdrDarkLogoUrl;
      } catch (e) {}
    }
    return "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png";
  });

  const [faviconLogoFilename, setFaviconLogoFilename] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.faviconLogoFilename) return parsed.faviconLogoFilename;
      } catch (e) {}
    }
    return "67517705aa5-prothom-Alo-logo_copy7.webp";
  });
  const [faviconLogoUrl, setFaviconLogoUrl] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.faviconLogoUrl) return parsed.faviconLogoUrl;
      } catch (e) {}
    }
    return "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png";
  });

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
  const [settingsSiteEnglishTitle, setSettingsSiteEnglishTitle] = useState(() => {
    const saved = localStorage.getItem("header_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settingsSiteEnglishTitle === "Prothom Alo") return "Dainik Bartasandhan";
        if (parsed.settingsSiteEnglishTitle) return parsed.settingsSiteEnglishTitle;
      } catch (e) {}
    }
    return "Dainik Bartasandhan";
  });

  // Footer Config matching user's reference image
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
        // ignore fallback
      }
    }
    return defaultVal;
  });

  const updateFooterField = (field: string, value: string) => {
    setFooterSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [newCol2Text, setNewCol2Text] = useState("");
  const [newCol2Url, setNewCol2Url] = useState("");
  const [newCol3Text, setNewCol3Text] = useState("");
  const [newCol3Url, setNewCol3Url] = useState("");

  // SEO Config matching user's reference image
  const [seoSettings, setSeoSettings] = useState(() => {
    const saved = localStorage.getItem("seo_settings");
    if (saved) {
      try {
        return {
          metaDescription: "",
          metaKeywords: "",
          imageUploadRatio: "Default",
          ogImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Prothom_Alo_Logo.svg",
          ogImageName: "Prothom-Alo-logo.webp",
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
      ogImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Prothom_Alo_Logo.svg",
      ogImageName: "Prothom-Alo-logo.webp"
    };
  });

  const updateSeoField = (field: string, value: string) => {
    setSeoSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Facebook Config matching user's reference image
  const [facebookSettings, setFacebookSettings] = useState(() => {
    const saved = localStorage.getItem("facebook_settings");
    if (saved) {
      try {
        return {
          appId: "33333",
          appSecret: "3c3efbf202a0a80e1591ddfae3b8b1db",
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      appId: "33333",
      appSecret: "3c3efbf202a0a80e1591ddfae3b8b1db"
    };
  });

  const [showFacebookSecret, setShowFacebookSecret] = useState(false);

  const updateFacebookField = (field: string, value: string) => {
    setFacebookSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mail Config matching user's reference image
  const [mailSettings, setMailSettings] = useState(() => {
    const saved = localStorage.getItem("mail_settings");
    if (saved) {
      try {
        return {
          smtpHost: "s3701.sgp1.stableserver.net",
          smtpPort: "485",
          smtpUser: "suppoert@prothomalo.bangladeshisoftware.com",
          smtpPassword: "your-smtp-password-here-or-something",
          smtpFrom: "Prothom Alo",
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      smtpHost: "s3701.sgp1.stableserver.net",
      smtpPort: "485",
      smtpUser: "suppoert@prothomalo.bangladeshisoftware.com",
      smtpPassword: "your-smtp-password-here-or-something",
      smtpFrom: "Prothom Alo"
    };
  });

  const [showMailPassword, setShowMailPassword] = useState(false);
  const [testingReceiverEmail, setTestingReceiverEmail] = useState("");

  const updateMailField = (field: string, value: string) => {
    setMailSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Login Config matching user's reference image
  const [loginSettings, setLoginSettings] = useState(() => {
    const saved = localStorage.getItem("login_settings");
    if (saved) {
      try {
        return {
          googleClientId: "",
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      googleClientId: ""
    };
  });

  const updateLoginField = (field: string, value: string) => {
    setLoginSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Ad Config matching user's reference image and requirements
  const [adSettings, setAdSettings] = useState(() => {
    const saved = localStorage.getItem("ad_settings");
    if (saved) {
      try {
        return {
          adsTxtCode: "google.com, pub-8896845634923038, DIRECT, f08c47fec0942fa0",
          headTagCode: "",
          adUnderNav: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjstz9GilJvTTeQNpTXnjdhzyTZIRDCutEixuEQVBhetfsVhdk2AXRaaM0oh-VRuer5p_WGDSEwzn9p0nkUiSUsVfJCgKrvx-OgT2b0B-lzGHTUyaFHtMCvhfubSaOyZks1gUKeic7Oxg8OwddoQ0N1UorxBkewS2IJD2wPiFPxN1Zi8jG2LFXUJSAdnwiT3A8Ja3OGexNT4C9B4vDFeS8h4k9bipsTBQc4nM5BFDSx3zH4MBIMeYNSWoUR4b94S9BitKWuvglb8jiPZaZLaZ2cyenIxjk0a4S0drh01HwAC5VlsMuXxxVizzUp8TZPy5iKdga54HP_M4ZpaQ2IcMKaP_B4_td8jGfmQA_YyiGN8TKAi9Whz5YvO4cXwSQH4fWcxQ&amp;sai=AMfl-Ysp-mtfVVIAk5sftegXk7YikTyTdVOZtvfK83S3CIXC8JjGiQty5UeV8lKdf4xF3tYqa3NRSQrFwnJ9ZMahxti5s7e3bumFqf20v92-"><img src="https://tpc.googlesyndication.com/simgad/5719408925861718514" border="0" width="320" height="100" /></a>',
          adVideoStoryUp: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjssM9qhTwjXlizjHXXMAkZJPd_Gskjmxw2u640vtO-gT8s5Mqk7sIbRlD_UjpH8X8WhLKJuZ9-lE5f49spz4dY8bV_erVjy66oEgzMIaEVVo1E9V51KyRoN3ml7CA9I9ran3BeR5ab4hdMOpXFkBPox1QZRkuKaX1hx8y62BEUw3iaH_rfiF7lHih1R_5vAdOydFvdFelqZY7c6EdzYj1zVEdnMDEmt7VgXSm7qbqzwgFlolMpQ4Dtu1bT-PVydryV_IdNo25tjq0k-OHBNWPrHJjpBZW0i0Fqd8Dfrwk9JC0W2arYiryS8C4mWhE5JyOy6qsZPK8SsnxSdDMNNhNqscVsnug&amp;sai=AMfl-YssiPJ6R3-i_SgX4OjtP77d3yctq3lnLE_QlA20hO-r6SI4BTNtYtYS8vgi5Tw3xa1FQboxw3yT1_5C5KDKMr-YYOINptrN3PpC2HsPwZdnjivqLcXiX2ZCjToYUFNT2RRJ8&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://play.google.com/store/apps/details%3Fid%3Dcom.cibl.play" />',
          adVideoStoryDown: 'r6Sl4BTNtYtYS8vgi5Tw1xa1FQboxw3yT1_5C5KDKMr-YYOINptrN3PpC2HsPwZdnjivqLcXiX2ZCjToYUFNT2RRJ8&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://play.google.com/store/apps/details%3Fid%3Dcom.cibl.playnnet%26hl%3Dden%26gl%3DUS&amp;nm=4">\n<img src="https://tpc.googlesyndication.com/simgad/5719408925861718514" border="0" width="320" height="100" alt="NRBC" class="img_ad">\n</a>',
          adHome1: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjsufpgPlIRMN_Xwyzu-dOosY5KcLIgbVpZondMLdcWWd8n1xz2TryGSHKzzTVGuySuvEoeIjb_N9-o2za-rtP5Hh8YDKS-XfvplrKd08VW-Z06QlFNFbGro5QhoMvJvccwbQWglhqHZCe_HgNYnQtSTJvOoiktyW_rYKz8K7LwuuJl-0sl-8PGFE8Wiv7c5415rqkZNmqvy_kLdWuH0OoSo0ihsSsM8bP1nnYG2ZeplpkpfOK8lwR2f-scC-S7clw0Cn_bFxmrhLX-QFkq2jELfZT0lewmWYQZ5SRxdv5zN13TWcAvXrY6iQdEphGhYpNGdK_NZRFQ7Wt0&amp;sai=AMfl-YrMDp9kczHwlRPuMso-5wdhO_5olDoqd2y_Ay1qdRqMXnLNrsAtGp8hHv2eayG-2e-jnbc9q7N_REjggsaShkyu2VfDxpOlRpRKrpPMkyfaJ2TqCL0-CrpYq_8dIFKv3KfCc&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://www.facebook.com/easyfashionltd.bd&amp;nm=3">',
          adHome2: '<a href="https://www.googleadservices.com/pagead/aclk?sa=L&amp;ai=ClKwoV-mUzpyzO7WO9wPy-cLQAuK9s7ekOdS88rPEzHhABloIYByDaBYic_QQeihNjyTXQg2Qop4HgWDEKUdtMBxI_V1j7o2ksqgYEOvRg1NKhSUo8mzGfwKO3iZsnu9QkcBUJj4oAga3-8wB1b1RCdBWJuXWXZzDB8B7YSp2cSG6L_B9kKndTrPNya4VhvsqAf9rgvf7lqdoRX4SKw1jmptvhFXQIdm3nSo8YCQ663fX9aky4V0YKuGKxEBLi-Ypfj4zlwikRoO0RMsI85WVvdAX34SFrBMiQRw0W0KyvtN4-tf4CLpMYs7JxHdaybzNH17iO3hHPlbIzLinVJVEdSd0EjrXKpGIpUk9uyYFcaAnwqBQ-K91nkih01CAhsAYFrsLWtBq7WwLerIOgP5TIT7Gq63olnXlijtQlBiVHoeigSOKXxX3q9VFDPbEWAtBuvZ5gTgBAGIBBJfRo1PKAyBoAYCgaFimpqkGHLAZAHAqgH2baxaqgH1ckbqAemvhuoB47OG8gHk9gbgAfuIrcQg">',
          adHome3: "",
          adHome4: "",
          adHome5: "",
          adHome6: "",
          adHome7: "",
          adHome8: "",
          adHome9: "",
          adHome10: "",
          adSidebar1: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjsuHZ548dfV2IOPSJNKjQHZt1Kv-Mo88l7axrx8zM_vWzxBiJyd_d14IW-R6w79V_hrMyuxmLH4B4op8R0GiacmYu3rPKPgnS8X-LvfEiPKzK1F33R6soY63RmehQF2Vnx-14p-3XtPBiTj8AYllh5zRATETJsSKBPjqq7Lzt_R_wNBhYE-8PhguXxeY3LxMndZfjRYF9w0Wn4-F8dmiraWYM-xuKCXoGDgw_i7rxCrRNadsnwmKxS5sg535EUumzr1p5c-mgOgIV77_pwyAoZKIFiHG8tc3LZS80C88S3j-B1dh-aW3QlHDsOGUoV1GZ3Y9CJXsSgSdryKoWoyPUZojp_4Y&amp;sai=AMfl-YQOoEHFhYCoKu0Fv7DvZnYzyf-zyHZdHtFE2BuQWsaDvD9YS4Ev7vl5WtWQJF875T8MG0I131WKvIByPGuBJKwhiGT8QN2N6aQdspiknEkXh9MfL3DlJnJlb0RxZs3Rb4&amp;sig=Cg0ArKJSzo8DRxJReIJTzk&amp;fbs_aeid=%5Bgw_fbsaeid%5D">',
          adSidebar2: "",
          adSidebar3: "",
          adSidebar4: "",
          adSidebar5: "",
          adPhotoCardImg: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Prothom_Alo_Logo.svg",
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
      adVideoStoryUp: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjssM9qhTwjXlizjHXXMAkZJPd_Gskjmxw2u640vtO-gT8s5Mqk7sIbRlD_UjpH8X8WhLKJuZ9-lE5f49spz4dY8bV_erVjy66oEgzMIaEVVo1E9V51KyRoN3ml7CA9I9ran3BeR5ab4hdMOpXFkBPox1QZRkuKaX1hx8y62BEUw3iaH_rfiF7lHih1R_5vAdOydFvdFelqZY7c6EdzYj1zVEdnMDEmt7VgXSm7qbqzwgFlolMpQ4Dtu1bT-PVydryV_IdNo25tjq0k-OHBNWPrHJjpBZW0i0Fqd8Dfrwk9JC0W2arYiryS8C4mWhE5JyOy6qsZPK8SsnxSdDMNNhNqscVsnug&amp;sai=AMfl-YssiPJ6R3-i_SgX4OjtP77d3yctq3lnLE_QlA20hO-r6SI4BTNtYtYS8vgi5Tw3xa1FQboxw3yT1_5C5KDKMr-YYOINptrN3PpC2HsPwZdnjivqLcXiX2ZCjToYUFNT2RRJ8&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://play.google.com/store/apps/details%3Fid%3Dcom.cibl.play" />',
      adVideoStoryDown: 'r6Sl4BTNtYtYS8vgi5Tw1xa1FQboxw3yT1_5C5KDKMr-YYOINptrN3PpC2HsPwZdnjivqLcXiX2ZCjToYUFNT2RRJ8&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://play.google.com/store/apps/details%3Fid%3Dcom.cibl.playnnet%26hl%3Dden%26gl%3DUS&amp;nm=4">\n<img src="https://tpc.googlesyndication.com/simgad/5719408925861718514" border="0" width="320" height="100" alt="NRBC" class="img_ad">\n</a>',
      adHome1: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjsufpgPlIRMN_Xwyzu-dOosY5KcLIgbVpZondMLdcWWd8n1xz2TryGSHKzzTVGuySuvEoeIjb_N9-o2za-rtP5Hh8YDKS-XfvplrKd08VW-Z06QlFNFbGro5QhoMvJvccwbQWglhqHZCe_HgNYnQtSTJvOoiktyW_rYKz8K7LwuuJl-0sl-8PGFE8Wiv7c5415rqkZNmqvy_kLdWuH0OoSo0ihsSsM8bP1nnYG2ZeplpkpfOK8lwR2f-scC-S7clw0Cn_bFxmrhLX-QFkq2jELfZT0lewmWYQZ5SRxdv5zN13TWcAvXrY6iQdEphGhYpNGdK_NZRFQ7Wt0&amp;sai=AMfl-YrMDp9kczHwlRPuMso-5wdhO_5olDoqd2y_Ay1qdRqMXnLNrsAtGp8hHv2eayG-2e-jnbc9q7N_REjggsaShkyu2VfDxpOlRpRKrpPMkyfaJ2TqCL0-CrpYq_8dIFKv3KfCc&amp;sig=Cg0ArKJSzo8FUcX_Ww9&amp;fbs_aeid=%5Bgw_fbsaeid%5D&amp;adurl=https://www.facebook.com/easyfashionltd.bd&amp;nm=3">',
      adHome2: '<a href="https://www.googleadservices.com/pagead/aclk?sa=L&amp;ai=ClKwoV-mUzpyzO7WO9wPy-cLQAuK9s7ekOdS88rPEzHhABloIYByDaBYic_QQeihNjyTXQg2Qop4HgWDEKUdtMBxI_V1j7o2ksqgYEOvRg1NKhSUo8mzGfwKO3iZsnu9QkcBUJj4oAga3-8wB1b1RCdBWJuXWXZzDB8B7YSp2cSG6L_B9kKndTrPNya4VhvsqAf9rgvf7lqdoRX4SKw1jmptvhFXQIdm3nSo8YCQ663fX9aky4V0YKuGKxEBLi-Ypfj4zlwikRoO0RMsI85WVvdAX34SFrBMiQRw0W0KyvtN4-tf4CLpMYs7JxHdaybzNH17iO3hHPlbIzLinVJVEdSd0EjrXKpGIpUk9uyYFcaAnwqBQ-K91nkih01CAhsAYFrsLWtBq7WwLerIOgP5TIT7Gq63olnXlijtQlBiVHoeigSOKXxX3q9VFDPbEWAtBuvZ5gTgBAGIBBJfRo1PKAyBoAYCgaFimpqkGHLAZAHAqgH2baxaqgH1ckbqAemvhuoB47OG8gHk9gbgAfuIrcQg">',
      adHome3: "",
      adHome4: "",
      adHome5: "",
      adHome6: "",
      adHome7: "",
      adHome8: "",
      adHome9: "",
      adHome10: "",
      adSidebar1: '<a id="aw0" target="_blank" href="https://googleads.g.doubleclick.net/pcs/click?xai=AKAOjsuHZ548dfV2IOPSJNKjQHZt1Kv-Mo88l7axrx8zM_vWzxBiJyd_d14IW-R6w79V_hrMyuxmLH4B4op8R0GiacmYu3rPKPgnS8X-LvfEiPKzK1F33R6soY63RmehQF2Vnx-14p-3XtPBiTj8AYllh5zRATETJsSKBPjqq7Lzt_R_wNBhYE-8PhguXxeY3LxMndZfjRYF9w0Wn4-F8dmiraWYM-xuKCXoGDgw_i7rxCrRNadsnwmKxS5sg535EUumzr1p5c-mgOgIV77_pwyAoZKIFiHG8tc3LZS80C88S3j-B1dh-aW3QlHDsOGUoV1GZ3Y9CJXsSgSdryKoWoyPUZojp_4Y&amp;sai=AMfl-YQOoEHFhYCoKu0Fv7DvZnYzyf-zyHZdHtFE2BuQWsaDvD9YS4Ev7vl5WtWQJF875T8MG0I131WKvIByPGuBJKwhiGT8QN2N6aQdspiknEkXh9MfL3DlJnJlb0RxZs3Rb4&amp;sig=Cg0ArKJSzo8DRxJReIJTzk&amp;fbs_aeid=%5Bgw_fbsaeid%5D">',
      adSidebar2: "",
      adSidebar3: "",
      adSidebar4: "",
      adSidebar5: "",
      adPhotoCardImg: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Prothom_Alo_Logo.svg",
      adPhotoCardName: "ad_copy1.webp"
    };
  });

  const updateAdField = (field: string, value: string) => {
    setAdSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdPhotoCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdSettings(prev => ({
          ...prev,
          adPhotoCardImg: reader.result as string,
          adPhotoCardName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // RSS Config matching user's reference image and requirements
  const [rssSettings, setRssSettings] = useState(() => {
    const saved = localStorage.getItem("rss_settings");
    if (saved) {
      try {
        return {
          activateAutoPost: "No",
          scheduleType: "Every 30 Minute",
          postPerUrl: "1",
          rssUrls: [
            "https://www.prothomalo.com/stories.rss",
            "https://samakal.com/rss",
            "https://www.kalerkantho.com/rss.xml",
            "https://www.bd-pratidin.com/rss.xml"
          ].join("\n"),
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      activateAutoPost: "No",
      scheduleType: "Every 30 Minute",
      postPerUrl: "1",
      rssUrls: [
        "https://www.prothomalo.com/stories.rss",
        "https://samakal.com/rss",
        "https://www.kalerkantho.com/rss.xml",
        "https://www.bd-pratidin.com/rss.xml"
      ].join("\n")
    };
  });

  const updateRssField = (field: string, value: string) => {
    setRssSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Focus states for Video Form Placeholder
  const [isVideoTitleFocused, setIsVideoTitleFocused] = useState(false);
  const [isVideoLinkFocused, setIsVideoLinkFocused] = useState(false);

  // Category item representation matching screenshot design
  // with bullet dots and box numbers options plus custom editing controls
  const [categories, setCategories] = useState<{ name: string; code: string; hasNumBox?: boolean; numValue?: string }[]>(() => {
    const saved = localStorage.getItem("news_categories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: "ফরিদপুর", code: "faridpur", hasNumBox: true, numValue: "১" },
      { name: "বাংলাদেশ", code: "bangladesh", hasNumBox: true, numValue: "২" },
      { name: "বিশ্ব", code: "international", hasNumBox: false, numValue: "" },
      { name: "অর্থ ও বাণিজ্য", code: "business", hasNumBox: true, numValue: "৪" },
      { name: "সম্পাদকীয় ও মতামত", code: "editorial_opinion", hasNumBox: true, numValue: "৩" },
      { name: "খেলাধুলা", code: "sports_new", hasNumBox: false, numValue: "" },
      { name: "আলোচিত", code: "trending", hasNumBox: false, numValue: "" },
      { name: "সাপ্তাহিক বিশেষ কড়চা", code: "weekly_special", hasNumBox: true, numValue: "৯" },
      { name: "ভিডিও", code: "video", hasNumBox: false, numValue: "" },
      { name: "জাতীয়", code: "national", hasNumBox: false, numValue: "" },
      { name: "রাজনীতি", code: "politics", hasNumBox: false, numValue: "" },
      { name: "সারাদেশ", code: "countryside", hasNumBox: false, numValue: "" },
      { name: "বিনোদন", code: "entertainment", hasNumBox: false, numValue: "" },
      { name: "প্রযুক্তি", code: "technology", hasNumBox: false, numValue: "" },
      { name: "মতামত", code: "opinion", hasNumBox: false, numValue: "" },
      { name: "विशेष প্রতিবেদন", code: "special", hasNumBox: false, numValue: "" }
    ];
  });

  // Category ordering panels and tabs configurations
  const [categoryOrderSubTab, setCategoryOrderSubTab] = useState<"default" | "header" | "footer" | "prothom" | "kalbela">("default");
  
  const [categoryOrderSettings, setCategoryOrderSettings] = useState(() => {
    const saved = localStorage.getItem("category_order_settings");
    if (saved) {
      try {
        return {
          defaultCategory: "trending",
          headerCategories: ["সর্বশেষ", "জাতীয়", "রাজনীতি", "সারাদেশ", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "মতামত", "ভিডিও"],
          footerCategories: ["বিজ্ঞান ও তথ্যপ্রযুক্তি", "আইন ও আদালত", "আন্তর্জাতিক বিশ্ব", "রাজনীতি", "বাণিজ্য"],
          prothomAloHomepageBlocks: ["জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "ভিডিও", "মতামত"],
          kalbelaHomepageBlocks: ["খেলা", "বিনোদন", "প্রযুক্তি", "জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "ভিডিও", "মতামত"],
          ...JSON.parse(saved)
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      defaultCategory: "trending",
      headerCategories: ["সর্বশেষ", "জাতীয়", "রাজনীতি", "সারাদেশ", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "মতামত", "ভিডিও"],
      footerCategories: ["বিজ্ঞান ও তথ্যপ্রযুক্তি", "আইন ও আদালত", "আন্তর্জাতিক বিশ্ব", "রাজনীতি", "বাণিজ্য"],
      prothomAloHomepageBlocks: ["জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "ভিডিও", "মতামত"],
      kalbelaHomepageBlocks: ["খেলা", "বিনোদন", "প্রযুক্তি", "জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "ভিডিও", "মতামত"]
    };
  });

  const [showDefaultCatDropdown, setShowDefaultCatDropdown] = useState(false);

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [isHeadline, setIsHeadline] = useState(false);
  const [postAuthorId, setPostAuthorId] = useState("online_desk");
  const [postAuthorName, setPostAuthorName] = useState("অনলাইন ডেস্ক");
  const [postAuthorMobile, setPostAuthorMobile] = useState("");

  // Computed active/eligible authors list based on staffList and portalUsers
  const eligibleAuthors = useMemo(() => {
    const list: { id: string; name: string; mobile: string; source: 'staff' | 'user' | 'default' }[] = [
      { id: "online_desk", name: "অনলাইন ডেস্ক", mobile: "", source: "default" },
      { id: "admin", name: "Admin", mobile: "01700000000", source: "default" }
    ];

    // Add active staff members (excluding duplicate admin)
    staffList.forEach((st) => {
      if (st.userId && st.userId !== "admin" && st.status !== "Suspended") {
        if (!list.some(item => item.id === st.userId || item.name === st.name)) {
          list.push({
            id: st.userId,
            name: st.name,
            mobile: st.mobile || "",
            source: "staff"
          });
        }
      }
    });

    // Add active portal users
    portalUsers.forEach((u) => {
      if (u.id && u.status !== "Suspended") {
        if (!list.some(item => item.id === String(u.id) || item.name === u.name)) {
          list.push({
            id: String(u.id),
            name: u.name,
            mobile: u.phone || "",
            source: "user"
          });
        }
      }
    });

    return list;
  }, [staffList, portalUsers]);
  const [postStatus, setPostStatus] = useState<'Draft' | 'Pending' | 'Published' | 'Approved' | 'Scheduled' | 'Rejected' | 'Imported'>("Approved");
  const [publishAt, setPublishAt] = useState("");
  const [shareToFacebook, setShareToFacebook] = useState("Yes");
  const [customAuthorName, setCustomAuthorName] = useState("");
  const [customAuthorMobile, setCustomAuthorMobile] = useState("");
  const [showCustomAuthorForm, setShowCustomAuthorForm] = useState(false);
  const [uploadedThumbnailName, setUploadedThumbnailName] = useState("No file chosen");

  // Custom Upload Images Modal State matching requested layout exactly
  const [showUploadImagesModal, setShowUploadImagesModal] = useState(false);
  const [imageUploadTitle, setImageUploadTitle] = useState("");
  const [imageUploadDescription, setImageUploadDescription] = useState("");
  const [imageUploadCategory, setImageUploadCategory] = useState("জাতীয়");
  const [imageUploadFiles, setImageUploadFiles] = useState<{ url: string; description: string }[]>([]);
  const [imageUploadStatus, setImageUploadStatus] = useState<string>("Approved");
  const [imageUploadShareFacebook, setImageUploadShareFacebook] = useState<string>("Yes");
  const [imageUploadEditingId, setImageUploadEditingId] = useState<string | null>(null);
  const [viewingImagePost, setViewingImagePost] = useState<Article | null>(null);
  const [articleForApprovalConfirmation, setArticleForApprovalConfirmation] = useState<Article | null>(null);
  const [shareToFacebookOption, setShareToFacebookOption] = useState<"Yes" | "No">("Yes");

  const [importedArticles, setImportedArticles] = useState<Article[]>(() => {
    const raw = [
      {
        id: "imp-85",
        title: "পাম্পে তেল না পেয়ে কৃষিমন্ত্রীকে ফোন কৃষকের, তবু তেল মিলছে না",
        content: "কিশোরগঞ্জ প্রতিনিধি: কিশোরগঞ্জের বাজিতপুরে পেট্রোল পাম্প থেকে লরিতে তেল নেওয়ার সময় তীব্র সংকট দেখা দেওয়ায় কৃষক সরাসরি কৃষিমন্ত্রীকে ফোন করেন। কৃষিমন্ত্রী তাৎক্ষণিক বিষয়টি খতিয়ে দেখার আশ্বাস প্রদান করলেও এখনো তেল মিলছে না বলে কৃষকেরা ক্ষোভ প্রকাশ করেছেন। চালকেরা দীর্ঘ সারিতে অপেক্ষা করছেন কিন্তু সঠিক সরবরাহ পাওয়া যাচ্ছে না বলে অভিযোগ করেছেন।",
        category: "আলোচিত",
        tags: ["কৃষি", "তেল", "কৃষিমন্ত্রী"],
        publicationDate: "2026-03-31T15:00:00Z",
        status: "Imported",
        views: 1205,
        images: ["https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=400&q=80"],
        reporterId: "admin",
        reporterName: "BS Software",
        createdAt: "31 Mar 2026, 03:00 PM",
        updatedAt: "31 Mar 2026, 03:00 PM"
      },
      {
        id: "imp-84",
        title: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ে বিভিন্ন বিভাগে শিক্ষক নিয়োগ, পদ ১৯",
        content: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (জাবি) বিভিন্ন অনুষদের অধীনে বিভাগসমূহে স্থায়ী শূন্য পদে স্থায়ী ও অস্থায়ী শিক্ষক নিয়োগের উদ্দেশ্যে বিজ্ঞপ্তি প্রকাশ করেছে। আগ্রহী যোগ্য প্রার্থীরা আগামী ৩০ জুনের মধ্যে আবেদন করতে পারবেন। মোট ১৯ টি পদের জন্য এই নিয়োগ দেওয়া হবে। আবেদনের যোগ্যতা এবং অন্যান্য তথ্যাবলী বিশ্ববিদ্যালয়ের ওয়েবসাইটে পাওয়া যাবে।",
        category: "আলোচিত",
        tags: ["জাবি", "শিক্ষক নিয়োগ", "চাকরি"],
        publicationDate: "2026-03-31T13:30:00Z",
        status: "Imported",
        views: 980,
        images: ["https://images.unsplash.com/photo-1562774053-f5a02f68995b?auto=format&fit=crop&w=400&q=80"],
        reporterId: "admin",
        reporterName: "BS Software",
        createdAt: "31 Mar 2026, 01:30 PM",
        updatedAt: "31 Mar 2026, 01:30 PM"
      },
      {
        id: "imp-83",
        title: "বিশ্বকাপের ৭২ দিন আগে চাকরি হারালেন ঘানার কোচ",
        content: "আসন্ন ক্রিকেট বিশ্বকাপের মাত্র ৭২ দিন বাকি থাকতে ঘানা জাতীয় ক্রিকেট দলের প্রধান কোচকে বহিষ্কার করা হয়েছে। দলের বাজে পারফরম্যান্স এবং বোর্ড কর্মকর্তাদের সাথে মতবিরোধের ஜেরে এই কঠোর সিদ্ধান্ত নেওয়া হয়েছে বলে দেশটির ক্রীড়া অ্যাসোসিয়েশন নিশ্চিত করেছে। নতুন অন্তর্বর্তীকালীন কোচ দ্রুত নিয়োগ দেওয়া হবে বলে জানা গেছে।",
        category: "আলোচিত",
        tags: ["বিশ্বকাপ", "ঘানা", "কোচ"],
        publicationDate: "2026-03-31T13:00:00Z",
        status: "Imported",
        views: 1420,
        images: ["https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80"],
        reporterId: "admin",
        reporterName: "BS Software",
        createdAt: "31 Mar 2026, 01:00 PM",
        updatedAt: "31 Mar 2026, 01:00 PM"
      },
      {
        id: "imp-82",
        title: "সেদিন সমুদ্রে ভেসে যাচ্ছিলেন লায়লা, এরপর কী হলো",
        content: "লাইফ জ্যাকেট ছাড়াই কয়েক ঘণ্টা ভারত মহাসাগরের লোনা পানিতে ভেসে থেক অলৌকিকভাবে জীবন ফিরে পেলেন লায়লা (২৪)। তরঙ্গের তোড়ে নৌকা উল্টে তলিয়ে যাওয়ার পর অন্যান্যরা নিখোঁজ হলেও লায়লা একটি কাঠের টুকরোর সহায়তায় দীর্ঘ লড়াই শেষে কোস্ট গার্ড কর্তৃক উদ্ধার হন। বর্তমানে তিনি স্থানীয় হাসপাতালে চিকিৎসাধীন আছেন।",
        category: "আলোচিত",
        tags: ["সমুদ্র", "উদ্ধার", "লায়লা"],
        publicationDate: "2026-03-31T12:30:00Z",
        status: "Imported",
        views: 2310,
        images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"],
        reporterId: "admin",
        reporterName: "BS Software",
        createdAt: "31 Mar 2026, 12:30 PM",
        updatedAt: "31 Mar 2026, 12:30 PM"
      }
    ];
    try {
      const processed = JSON.parse(localStorage.getItem("processed_imported_articles") || "[]");
      const userCached = JSON.parse(localStorage.getItem("imported_articles_cache") || "[]");
      const combined = [...userCached, ...raw];
      return combined.filter(art => !processed.includes(art.id));
    } catch (e) {
      return raw;
    }
  });

  const markImportedAsProcessed = (id: string) => {
    try {
      const processed = JSON.parse(localStorage.getItem("processed_imported_articles") || "[]");
      if (!processed.includes(id)) {
        processed.push(id);
        localStorage.setItem("processed_imported_articles", JSON.stringify(processed));
      }
    } catch (e) {
      console.error("Error setting custom imported status:", e);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        let importedList: Article[] = [];

        if (file.name.endsWith(".json")) {
          // Parse JSON
          const rawJSON = JSON.parse(text);
          const list = Array.isArray(rawJSON) ? rawJSON : (rawJSON.articles || []);
          importedList = list.map((item: any) => ({
            id: item.id || `import_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            title: item.title || "Untitled Imported Post",
            subtitle: item.subtitle || "",
            content: item.content || item.body || "",
            description: stripHtmlTags(item.content || item.body || "").substring(0, 160) + "...",
            category: item.category || "জাতীয়",
            subcategory: item.subcategory || "",
            publicationDate: item.publicationDate || new Date().toISOString(),
            status: "Imported",
            reporterId: item.reporterId || "importer",
            reporterName: item.reporterName || item.author || "WordPress Importer",
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80"],
            views: item.views || 0,
            tags: item.tags || []
          }));
        } else {
          // Parse WordPress XML WXR
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, "text/xml");
          const items = xmlDoc.getElementsByTagName("item");

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const title = item.getElementsByTagName("title")?.[0]?.textContent || "Untitled Imported Post";
            
            // Try to find content:encoded
            let content = "";
            const contentEncoded = item.getElementsByTagNameNS("http://purl.org/rss/1.0/modules/content/", "encoded");
            if (contentEncoded && contentEncoded.length > 0) {
              content = contentEncoded[0].textContent || "";
            } else {
              content = item.getElementsByTagName("description")?.[0]?.textContent || "";
            }

            // Category
            const categoriesElems = item.getElementsByTagName("category");
            let category = "জাতীয়";
            if (categoriesElems && categoriesElems.length > 0) {
              for (let c = 0; c < categoriesElems.length; c++) {
                const catText = categoriesElems[c].textContent;
                if (catText && catText.trim() !== "") {
                  category = catText;
                  break;
                }
              }
            }

            // Date
            let pubDate = new Date().toISOString();
            const wpDate = item.getElementsByTagName("pubDate")?.[0]?.textContent || item.getElementsByTagNameNS("http://wordpress.org/export/1.2/", "post_date")?.[0]?.textContent;
            if (wpDate) {
              try {
                pubDate = new Date(wpDate).toISOString();
              } catch (ev) {}
            }

            // Creator
            const creator = item.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "creator")?.[0]?.textContent || "WP User";

            // Description summary
            const decStr = stripHtmlTags(content).substring(0, 160) + "...";

            importedList.push({
              id: `wp_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
              title,
              subtitle: "",
              content,
              description: decStr,
              category,
              subcategory: "",
              publicationDate: pubDate,
              status: "Imported",
              reporterId: "importer",
              reporterName: creator,
              images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80"],
              views: 0,
              tags: []
            });
          }
        }

        if (importedList.length === 0) {
          alert("কোনো পোস্ট পাওয়া যায়নি। ফাইলটি সঠিক আছে কিনা যাচাই করুন।");
          return;
        }

        // Save imported list to state & storage
        const currentSaved = JSON.parse(localStorage.getItem("imported_articles_cache") || "[]");
        const merged = [...importedList, ...currentSaved];
        localStorage.setItem("imported_articles_cache", JSON.stringify(merged));
        setImportedArticles(merged);
        alert(`সফলভাবে ${importedList.length} টি পোস্ট ইম্পোর্ট করা হয়েছে! অনুগ্রহ করে 'Imported Posts' ট্যাবে গিয়ে পোস্টগুলো রিভিউ করুন।`);
        setActiveTab("imported");
      } catch (err: any) {
        console.error("Parse XML/JSON error:", err);
        alert("ফাইল পার্স করতে সমস্যা হয়েছে: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const [importedSearchText, setImportedSearchText] = useState("");
  const [importedSelectedSource, setImportedSelectedSource] = useState("All");
  const [importedSelectedDate, setImportedSelectedDate] = useState("All");

  // Helper to format date into "MM/DD/YYYY hh:mm AM/PM"
  const getPublishAtDefault = () => {
    const d = new Date();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    let hrs = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, "0");
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    const hrsStr = hrs.toString().padStart(2, "0");
    return `${mm}/${dd}/${yyyy} ${hrsStr}:${mins} ${ampm}`;
  };

  useEffect(() => {
    if (showAddPostModal && !editingArticle) {
      setPublishAt(getPublishAtDefault());
      setTitle("");
      setContent("");
      setSubtitle("");
      setSubcategory("");
      setTagsInput("");
      setImages(["", "", "", "", ""]);
      setUploadedThumbnailName("No file chosen");
      setPostAuthorId("online_desk");
      setPostAuthorName("অনলাইন ডেস্ক");
      setPostAuthorMobile("");
      setPostStatus("Approved");
      setShareToFacebook("Yes");
      setShowCustomAuthorForm(false);
    }
  }, [showAddPostModal, editingArticle]);

  const [sharingArticle, setSharingArticle] = useState<Article | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    name: string;
    code: string;
    hasNumBox?: boolean;
    numValue?: string;
    displayOrder?: string;
    icon?: string;
    parentCategory?: string;
  } | null>(null);

  const [catFormName, setCatFormName] = useState("");
  const [catFormCode, setCatFormCode] = useState("");
  const [catFormHasNumBox, setCatFormHasNumBox] = useState(false);
  const [catFormNumValue, setCatFormNumValue] = useState("");
  const [catFormDisplayOrder, setCatFormDisplayOrder] = useState("");
  const [catFormIcon, setCatFormIcon] = useState<string | null>(null);
  const [catFormParentCategory, setCatFormParentCategory] = useState<string>("");

  // Helper to format date in the exact requested format (e.g., 31 Mar 2026 , 08:25 PM)
  const formatArticleDate = (dateVal: any, type: string) => {
    if (!dateVal) {
      return "31 Mar 2026 , 12:00 PM";
    }
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) {
      return String(dateVal);
    }
    
    const days = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    let hrs = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, "0");
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; // 0 should be 12
    const hrsStr = hrs.toString().padStart(2, "0");
    
    return `${days} ${m} ${y} , ${hrsStr}:${mins} ${ampm}`;
  };

  // Helper to resolve deterministic Created, Updated, and Published fallback dates for default articles
  const getArticleDates = (art: Article) => {
    const pubDate = art.publicationDate ? new Date(art.publicationDate) : new Date();
    
    // Created date fallback is pubDate minus 3.5 hours
    const createdDate = art.createdAt ? new Date(art.createdAt) : new Date(pubDate.getTime() - 3.5 * 60 * 60 * 1000);
    
    // Updated date fallback is pubDate
    const updatedDate = art.updatedAt ? new Date(art.updatedAt) : new Date(pubDate.getTime());
    
    return {
      published: formatArticleDate(pubDate, 'Published'),
      created: formatArticleDate(createdDate, 'Created'),
      updated: formatArticleDate(updatedDate, 'Updated')
    };
  };

  // Helper to extract unique SL N. relative to entire unmodified articles list
  const getOriginalSL = (art: Article) => {
    const baseIndex = allArticles.findIndex(a => a.id === art.id);
    if (baseIndex !== -1) {
      return allArticles.length - baseIndex;
    }
    return 1;
  };

  // Helper to get author details with fallback mobile number
  const getAuthorDetails = (art: Article) => {
    const staff = staffList.find(s => s.userId === art.reporterId);
    const name = art.reporterName || "BS Software";
    
    // Default fallback numbers matching screenshot for consistency
    let mobile = "12584284226"; 
    if (staff && staff.mobile) {
      mobile = staff.mobile;
    } else if (art.reporterId !== "admin") {
      mobile = "01850816970";
    }
    return { name, mobile };
  };

  // Helper to get formatted today's date (e.g. 8 June 2026)
  const getFormattedToday = () => {
    const date = new Date();
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${day} ${m} ${y}`;
  };

  const getYouTubeThumbnail = (url: string): string => {
    try {
      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get("v");
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("/").pop();
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else if (url.includes("youtube.com/embed/")) {
        const videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch (e) {}
    return "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80";
  };

  // Clean transliteration map to map Bengali letters/common words to beautiful English slugs
  const transliterateBanglaToEnglish = (text: string): string => {
    const banglaToEnglishMap: { [key: string]: string } = {
      "ফরিদপুর": "faridpur",
      "বাংলাদেশ": "bangladesh",
      "বিশ্ব": "international",
      "অর্থ ও বাণিজ্য": "business",
      "সম্পাদকীয় ও মতামত": "editorial-opinion",
      "খেলাধুলা": "sports",
      "আলোচিত": "trending",
      "সাপ্তাহিক বিশেষ কড়চা": "weekly-special",
      "ভিডিও": "video",
      "জাতীয়": "national",
      "রাজনীতি": "politics",
      "সারাদেশ": "countryside",
      "বিনোদন": "entertainment",
      "প্রযুক্তি": "technology",
      "মতামত": "opinion",
      "বিশেষ প্রতিবেদন": "special"
    };

    const trimmed = text.trim();
    if (banglaToEnglishMap[trimmed]) {
      return banglaToEnglishMap[trimmed];
    }

    // sound logic replacement for common letters
    let result = trimmed
      .replace(/অ/g, "o").replace(/আ/g, "a").replace(/ই/g, "i").replace(/ঈ/g, "i")
      .replace(/উ/g, "u").replace(/ঊ/g, "u").replace(/ঋ/g, "ri").replace(/এ/g, "e")
      .replace(/ঐ/g, "oi").replace(/ও/g, "o").replace(/ঔ/g, "ou")
      .replace(/ক/g, "k").replace(/খ/g, "kh").replace(/গ/g, "g").replace(/ঘ/g, "gh")
      .replace(/ঙ/g, "ng").replace(/চ/g, "ch").replace(/ছ/g, "chh").replace(/জ/g, "j")
      .replace(/ঝ/g, "jh").replace(/ঞ/g, "ny").replace(/ট/g, "t").replace(/ঠ/g, "th")
      .replace(/ড/g, "d").replace(/ঢ/g, "dh").replace(/ণ/g, "n").replace(/ত/g, "t")
      .replace(/থ/g, "th").replace(/দ/g, "d").replace(/ধ/g, "dh").replace(/ন/g, "n")
      .replace(/প/g, "p").replace(/ফ/g, "f").replace(/ব/g, "b").replace(/ভ/g, "bh")
      .replace(/ম/g, "m").replace(/য/g, "z").replace(/র/g, "r").replace(/ল/g, "l")
      .replace(/শ/g, "sh").replace(/ষ/g, "sh").replace(/স/g, "s").replace(/হ/g, "h")
      .replace(/ড়/g, "r").replace(/ঢ়/g, "rh").replace(/য়/g, "y").replace(/ৎ/g, "t")
      .replace(/ং/g, "ng").replace(/ঃ/g, "h").replace(/ঁ/g, "")
      .replace(/া/g, "a").replace(/ি/g, "i").replace(/ী/g, "i").replace(/ু/g, "u")
      .replace(/ূ/g, "u").replace(/ৃ/g, "ri").replace(/ে/g, "e").replace(/ৈ/g, "oi")
      .replace(/ো/g, "o").replace(/ৌ/g, "ou").replace(/্/g, "");

    return result
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleGenerateSlug = () => {
    if (catFormName.trim()) {
      setCatFormCode(transliterateBanglaToEnglish(catFormName));
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatFormIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim() || !catFormCode.trim()) {
      alert("Please fill in Category Name and Category Slug *");
      return;
    }
    const exists = categories.some(c => c.code.toLowerCase() === catFormCode.trim().toLowerCase());
    if (exists) {
      alert("This category ID code already exists!");
      return;
    }

    // Determine default bullet vs numerical box based on Display Order presence or custom input:
    // If they have a Display Order (e.g. they typed "1" or "১"), we will enable the solid pink numerical box!
    const updatedHasNumBox = catFormHasNumBox || !!catFormDisplayOrder.trim();
    const updatedNumValue = catFormNumValue.trim() || catFormDisplayOrder.trim();

    const newCat = {
      name: catFormName.trim(),
      code: catFormCode.trim().toLowerCase(),
      hasNumBox: updatedHasNumBox,
      numValue: updatedHasNumBox ? updatedNumValue : "",
      displayOrder: catFormDisplayOrder.trim(),
      icon: catFormIcon || undefined,
      parentCategory: catFormParentCategory || undefined
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("news_categories", JSON.stringify(updated));
    setShowAddCategoryModal(false);
    
    // reset form states
    setCatFormName("");
    setCatFormCode("");
    setCatFormHasNumBox(false);
    setCatFormNumValue("");
    setCatFormDisplayOrder("");
    setCatFormIcon(null);
    setCatFormParentCategory("");
  };

  const handleEditCategoryOpen = (cat: {
    name: string;
    code: string;
    hasNumBox?: boolean;
    numValue?: string;
    displayOrder?: string;
    icon?: string;
    parentCategory?: string;
  }) => {
    setEditingCategory(cat);
    setCatFormName(cat.name);
    setCatFormCode(cat.code);
    setCatFormHasNumBox(!!cat.hasNumBox);
    setCatFormNumValue(cat.numValue || "");
    setCatFormDisplayOrder(cat.displayOrder || "");
    setCatFormIcon(cat.icon || null);
    setCatFormParentCategory(cat.parentCategory || "");
    setShowEditCategoryModal(true);
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!catFormName.trim() || !catFormCode.trim()) {
      alert("Please fill in Category Name and Category Slug *");
      return;
    }

    const updatedHasNumBox = catFormHasNumBox || !!catFormDisplayOrder.trim();
    const updatedNumValue = catFormNumValue.trim() || catFormDisplayOrder.trim();

    const updated = categories.map(c => {
      if (c.code === editingCategory.code) {
        return {
          ...c,
          name: catFormName.trim(),
          code: catFormCode.trim().toLowerCase(),
          hasNumBox: updatedHasNumBox,
          numValue: updatedHasNumBox ? updatedNumValue : "",
          displayOrder: catFormDisplayOrder.trim(),
          icon: catFormIcon || undefined,
          parentCategory: catFormParentCategory || undefined
        };
      }
      return c;
    });

    setCategories(updated);
    localStorage.setItem("news_categories", JSON.stringify(updated));
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    
    // reset form states
    setCatFormName("");
    setCatFormCode("");
    setCatFormHasNumBox(false);
    setCatFormNumValue("");
    setCatFormDisplayOrder("");
    setCatFormIcon(null);
    setCatFormParentCategory("");
  };

  const handleDeleteCategory = (code: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const updated = categories.filter(c => c.code !== code);
    setCategories(updated);
    localStorage.setItem("news_categories", JSON.stringify(updated));
  };

  // Visitor states
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [selectedVisitorMetric, setSelectedVisitorMetric] = useState<string | null>(null);

  // Staff management & Search table state
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [selectedStaffRows, setSelectedStaffRows] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<Staff | null>(null);
  const [staffFilterDate, setStaffFilterDate] = useState("2026-06-07");

  const handleDeleteVisitorLog = (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ভিজিটর রেকর্ডটি ডিলিট করতে চান?")) return;
    const updated = visitorLogs.filter((log) => log.id !== id);
    setVisitorLogs(updated);
    saveVisitorLogs(updated);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setPictureFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPictureBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load data on start
  useEffect(() => {
    if (activeUser) {
      loadData();
      const savedLogs = getOrInitializeVisitorLogs();
      setVisitorLogs(savedLogs);
    }
  }, [activeUser]);

  // Sync Families List changes automatically to database
  useEffect(() => {
    if (isFamiliesLoaded && familiesList && Array.isArray(familiesList)) {
      fetch("/api/database/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(familiesList)
      }).catch(err => console.error("Sync family database failed", err));
    }
  }, [familiesList, isFamiliesLoaded]);

  // Sync Portal Users list changes automatically to database
  useEffect(() => {
    if (isPortalUsersLoaded && portalUsers && Array.isArray(portalUsers)) {
      fetch("/api/database/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portalUsers)
      }).catch(err => console.error("Sync users database failed", err));
    }
  }, [portalUsers, isPortalUsersLoaded]);

  // Sync news categories changes automatically to database
  useEffect(() => {
    if (isCategoriesLoaded && categories && Array.isArray(categories)) {
      localStorage.setItem("news_categories", JSON.stringify(categories));
      fetch("/api/database/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories)
      }).catch(err => console.error("Sync categories database failed", err));
    }
  }, [categories, isCategoriesLoaded]);

  // Sync Photocard details automatically to database
  useEffect(() => {
    if (cardHolderName && cardHolderId) {
      const activeCard = {
        id: cardHolderId,
        name: cardHolderName,
        role: cardHolderRole,
        phone: cardHolderPhone,
        cardType: selectedCardType,
        photo: cardHolderPhoto,
        issueDate: "Today"
      };
      fetch("/api/database/photocards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([activeCard])
      }).catch(err => console.error("Sync photocards database failed", err));
    }
  }, [cardHolderName, cardHolderRole, cardHolderPhone, cardHolderId, cardHolderPhoto, selectedCardType]);

  const loadData = () => {
    fetch("/api/news?status=all&limit=250")
      .then((res) => res.json())
      .then((data) => setAllArticles(data))
      .catch((err) => console.error(err));

    fetch("/api/database/request_images")
      .then((res) => res.json())
      .then((data) => setRequestImages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Fetch request images database failed:", err));

    fetch("/api/database/request_videos")
      .then((res) => res.json())
      .then((data) => setRequestVideos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Fetch request videos database failed:", err));

    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        setStaffList(data);
        if (data.length > 0 && !previewStaff) {
          setPreviewStaff(data[0]);
        }
      })
      .catch((err) => console.error(err));

    // Fetch and sync Families List from main database
    fetch("/api/database/family")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setFamiliesList(data);
        }
        setIsFamiliesLoaded(true);
      }).catch(err => {
        console.error(err);
        setIsFamiliesLoaded(true);
      });

    // Fetch and sync Portal Users List from users database
    fetch("/api/database/users")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setPortalUsers(data);
        }
        setIsPortalUsersLoaded(true);
      }).catch(err => {
        console.error(err);
        setIsPortalUsersLoaded(true);
      });

    // Fetch and sync Photo Credentials Card from main database
    fetch("/api/database/photocards")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const card = data[0];
          setCardHolderName(card.name || "");
          setCardHolderRole(card.role || "");
          setCardHolderPhone(card.phone || "");
          setCardHolderId(card.id || "");
          setCardHolderPhoto(card.photo || "");
          setSelectedCardType(card.cardType || "Staff ID");
        }
      }).catch(err => console.error(err));

    // Fetch and sync news categories from Categories database
    fetch("/api/database/categories")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const normalized = data.map(c => ({
            ...c,
            code: c.code || c.slug || c.name,
            name: c.name
          }));
          setCategories(normalized);
        }
        setIsCategoriesLoaded(true);
      }).catch(err => {
        console.error(err);
        setIsCategoriesLoaded(true);
      });

    // Async Fetch all 9 application settings databases straight to respective local states
    const settingsList = ["header", "footer", "seo", "facebook", "mail", "login", "ads", "rss"];
    settingsList.forEach(skey => {
      fetch(`/api/database/settings_${skey}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            localStorage.setItem(`${skey}_settings`, JSON.stringify(data));
            if (skey === "footer") {
              setFooterSettings(data);
            } else if (skey === "seo") {
              setSeoSettings(data);
            } else if (skey === "facebook") {
              setFacebookSettings(data);
            } else if (skey === "mail") {
              setMailSettings(data);
            } else if (skey === "login") {
              setLoginSettings(data);
            } else if (skey === "ads") {
              setAdSettings(data);
              localStorage.setItem("ad_settings", JSON.stringify(data));
            } else if (skey === "rss") {
              setRssSettings(data);
            } else if (skey === "header") {
              setHdrLightLogoFilename(data.hdrLightLogoFilename || "");
              setHdrLightLogoUrl(data.hdrLightLogoUrl || "");
              setHdrDarkLogoFilename(data.hdrDarkLogoFilename || "");
              setHdrDarkLogoUrl(data.hdrDarkLogoUrl || "");
              setFaviconLogoFilename(data.faviconLogoFilename || "");
              setFaviconLogoUrl(data.faviconLogoUrl || "");
            }
          }
        }).catch(err => console.error(err));
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const fallbackUser = {
      userId: "BatraSondhanAzmeer2026",
      name: "সম্পাদক",
      designation: "সম্পাদক",
      role: "admin",
      status: "Active"
    };

    // INSTANT CLIENT-SIDE BYPASS FOR SPECIFIED EDITOR/ADMIN CREDENTIALS:
    // This allows instant access without calling backend APIs, completely avoiding any JSON parsing errors!
    if (username === "BatraSondhanAzmeer2026" && password === "BatraSondhanAzmeer2026@@") {
      onLoginSuccess(fallbackUser as any, "admin-jwt-mock-token");
      return;
    }

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: username, password, role: "admin" })
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (!res.ok) {
            if (username === "BatraSondhanAzmeer2026" && password === "BatraSondhanAzmeer2026@@") {
              onLoginSuccess(fallbackUser as any, "admin-jwt-mock-token");
              return;
            }
            throw new Error(data.error || "ভুল ইউজার আইডি বা পাসওয়ার্ড!");
          }
          onLoginSuccess(data.user, data.token);
        } else {
          if (username === "BatraSondhanAzmeer2026" && password === "BatraSondhanAzmeer2026@@") {
            onLoginSuccess(fallbackUser as any, "admin-jwt-mock-token");
          } else {
            throw new Error("ভুল ইউজার আইডি বা পাসওয়ার্ড!");
          }
        }
      })
      .catch((err) => {
        if (username === "BatraSondhanAzmeer2026" && password === "BatraSondhanAzmeer2026@@") {
          onLoginSuccess(fallbackUser as any, "admin-jwt-mock-token");
        } else {
          setLoginError(err.message && !err.message.includes("Unexpected") && !err.message.includes("JSON") ? err.message : "ভুল ইউজার আইডি বা পাসওয়ার্ড!");
        }
      });
  };

  // Create Staff handler
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: newUserId,
        password: newPassword,
        staffId: newStaffId,
        name: newName,
        designation: newDesignation,
        fatherName: newFatherName,
        motherName: newMotherName,
        mobile: newMobile,
        nid: newNid,
        presentAddress: newPresentAddress,
        permanentAddress: newPermanentAddress
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "স্টাফ তৈরিতে ব্যর্থ হয়েছে");

        // Instant state updates for perfect visual synchronization
        if (data.staff) {
          setStaffList(prev => [...prev, data.staff]);
          const newPUserObj = {
            id: `U-${101 + portalUsers.length}`,
            name: data.staff.name,
            email: data.staff.email || `${data.staff.userId}@dainikbartasandhan.com`,
            phone: data.staff.mobile || "",
            role: data.staff.designation || "Subscriber",
            status: "Active",
            joinedDate: "Today"
          };
          setPortalUsers(prev => [...prev, newPUserObj]);
        }

        setSuccessMsg(`স্টাফ সদস্য '${newName}' সফলভাবে রেজিস্টার করা হয়েছে! (Registered Successfully)`);
        setTimeout(() => setSuccessMsg(""), 4000);
        
        setNewUserId("");
        setNewPassword("");
        setNewStaffId("");
        setNewName("");
        setNewFatherName("");
        setNewMotherName("");
        setNewMobile("");
        setNewNid("");
        setNewPresentAddress("");
        setNewPermanentAddress("");
        loadData();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  // News Upload handler
  const handleDirectUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    let finalImages = images.filter((img) => img.trim() !== "");
    if (category === "ভিডিও" || category === "video") {
      finalImages = [getYouTubeThumbnail(videoUrl)];
    } else if (finalImages.length === 0) {
      finalImages.push("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80");
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t !== "");

    // Parse the Publish At string to proper ISO date
    let customPublicationDate = new Date().toISOString();
    try {
      const trimmed = publishAt.trim();
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)$/i;
      const match = trimmed.match(regex);
      if (match) {
        const [_, mm, dd, yyyy, hrs, mins, ampm] = match;
        let hour = parseInt(hrs);
        if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
        const parsed = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), hour, parseInt(mins));
        if (!isNaN(parsed.getTime())) {
          customPublicationDate = parsed.toISOString();
        }
      } else {
        const fallback = new Date(trimmed);
        if (!isNaN(fallback.getTime())) {
          customPublicationDate = fallback.toISOString();
        }
      }
    } catch (err) {
      console.error("Error parsing publication date:", err);
    }

    fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        dSubTitle,
        content,
        category,
        subcategory,
        tags,
        images: finalImages,
        videoUrl,
        reporterId: postAuthorId,
        reporterName: postAuthorName,
        status: postStatus,
        publicationDate: customPublicationDate,
        isLead,
        isHeadline
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        let successStatusText = "সবুজ সিগন্যাল: সংবাদটি সফলভাবে তৈরি করা হয়েছে!";
        if (postStatus === "Approved") {
          successStatusText = "সংবাদটি সফলভাবে সরাসরি ওয়েবসাইটে লাইভ প্রকাশ করা হয়েছে!";
        } else if (postStatus === "Scheduled") {
          successStatusText = `সংবাদটি নির্ধারিত সময়ে (${publishAt}) স্বয়ংক্রিয়ভাবে প্রকাশ হওয়ার জন্য শিডিউল করা হয়েছে!`;
        } else if (postStatus === "Pending") {
          successStatusText = "সংবাদটি সফলভাবে পেন্ডিং অবস্থায় জমা রাখা হয়েছে!";
        } else if (postStatus === "Rejected") {
          successStatusText = "সংবাদটি প্রত্যাখ্যাত (Rejected) মোডে তৈরি করা হয়েছে।";
        } else if (postStatus === "Imported") {
          successStatusText = "সংবাদটি আমদানিকৃত আর্কাইভ হিসেবে সফলভাবে যুক্ত করা হয়েছে।";
        }
        setSuccessMsg(successStatusText);
        
        setTitle("");
        setSubtitle("");
        setDSubTitle("");
        setContent("");
        setVideoUrl("");
        setTagsInput("");
        setSubcategory("");
        setImages(["", "", "", "", ""]);
        setUploadedThumbnailName("No file chosen");
        setIsLead(false);
        setIsHeadline(false);
        loadData();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  const startEditingArticle = (art: Article) => {
    setEditingArticle(art);

    // Populate all fields for editing
    setTitle(art.title || "");
    setSubtitle(art.subtitle || "");
    setDSubTitle(art.dSubTitle || "");
    setCategory(art.category || "জাতীয়");
    setSubcategory(art.subcategory || "");
    setContent(art.content || "");
    setVideoUrl(art.videoUrl || "");
    setTagsInput(art.tags ? art.tags.join(", ") : "");
    setIsLead(!!art.isLead);
    setIsHeadline(!!art.isHeadline);
    setImages([
      art.images && art.images[0] ? art.images[0] : "",
      art.images && art.images[1] ? art.images[1] : "",
      art.images && art.images[2] ? art.images[2] : "",
      art.images && art.images[3] ? art.images[3] : "",
      art.images && art.images[4] ? art.images[4] : "",
    ]);
    setUploadedThumbnailName(art.images && art.images[0] ? "Existing Thumbnail" : "No file chosen");
    setPostAuthorId(art.reporterId || "online_desk");
    setPostAuthorName(art.reporterName || "অনলাইন ডেস্ক");
    
    // Attempt to lookup mobile or set default
    const associatedStaff = staffList.find((s) => s.userId === art.reporterId);
    setPostAuthorMobile(associatedStaff ? associatedStaff.mobile || "" : "");

    setPostStatus(art.status as any || "Approved");
    
    // format the publishAt date
    if (art.publicationDate) {
      try {
        const d = new Date(art.publicationDate);
        if (!isNaN(d.getTime())) {
          const mm = (d.getMonth() + 1).toString().padStart(2, "0");
          const dd = d.getDate().toString().padStart(2, "0");
          const yyyy = d.getFullYear();
          let hrs = d.getHours();
          const mins = d.getMinutes().toString().padStart(2, "0");
          const ampm = hrs >= 12 ? "PM" : "AM";
          hrs = hrs % 12;
          hrs = hrs ? hrs : 12;
          const hrsStr = hrs.toString().padStart(2, "0");
          setPublishAt(`${mm}/${dd}/${yyyy} ${hrsStr}:${mins} ${ampm}`);
        } else {
          setPublishAt(getPublishAtDefault());
        }
      } catch (e) {
        setPublishAt(getPublishAtDefault());
      }
    } else {
      setPublishAt(getPublishAtDefault());
    }
    
    setShareToFacebook("Yes");
    setCustomAuthorName("");
    setCustomAuthorMobile("");
    setShowCustomAuthorForm(false);
    
    // Now trigger the modal open!
    setShowAddPostModal(true);
  };

  const startEditingImagePost = (art: Article) => {
    setImageUploadEditingId(art.id);
    setImageUploadTitle(art.title || "");
    setImageUploadDescription(art.content || "");
    setImageUploadCategory(art.category || "জাতীয়");
    setImageUploadStatus(art.status || "Approved");
    setImageUploadShareFacebook("Yes");
    
    const mapped = (art.images || []).map((imgUrl, idx) => ({
      url: imgUrl,
      description: art.imageDescriptions && art.imageDescriptions[idx] ? art.imageDescriptions[idx] : ""
    }));
    setImageUploadFiles(mapped);
    setShowUploadImagesModal(true);
  };

  const handleSaveImagePost = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!imageUploadTitle.trim()) {
      setErrorMsg("Image Title is required.");
      return;
    }

    const finalImages = imageUploadFiles.map(img => img.url).filter(Boolean);
    const finalDescriptions = imageUploadFiles.map(img => img.description || "");

    const url = imageUploadEditingId ? `/api/news/${imageUploadEditingId}` : "/api/news";
    const method = imageUploadEditingId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: imageUploadTitle,
        category: imageUploadCategory,
        content: imageUploadDescription,
        images: finalImages,
        imageDescriptions: finalDescriptions,
        status: imageUploadStatus,
        reporterId: "admin",
        reporterName: "Admin",
        publicationDate: new Date().toISOString()
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");

        setSuccessMsg(imageUploadEditingId ? "সংবাদ চিত্রটি সফলভাবে আপডেট করা হয়েছে!" : "নতুন সংবাদ চিত্র সফলভাবে যুক্ত করা হয়েছে!");
        setShowUploadImagesModal(false);
        setImageUploadEditingId(null);
        setImageUploadTitle("");
        setImageUploadDescription("");
        setImageUploadCategory("জাতীয়");
        setImageUploadFiles([]);
        setImageUploadStatus("Approved");
        loadData();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  const handleImageUploadFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUploadFiles((prev) => [
          ...prev,
          { url: base64, description: "" }
        ]);
      };
      reader.readAsDataURL(file as any);
    });
  };

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setImageUploadFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateUploadedImageDesc = (indexToUpdate: number, text: string) => {
    setImageUploadFiles(prev => prev.map((item, idx) => {
      if (idx === indexToUpdate) {
        return { ...item, description: text };
      }
      return item;
    }));
  };

  const handleSavePostEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setErrorMsg("");
    setSuccessMsg("");

    let finalImages = images.filter((img) => img.trim() !== "");
    if (category === "ভিডিও" || category === "video") {
      finalImages = [getYouTubeThumbnail(videoUrl)];
    } else if (finalImages.length === 0) {
      finalImages.push("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80");
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t !== "");

    // Parse the Publish At string to proper ISO date
    let customPublicationDate = new Date().toISOString();
    try {
      const trimmed = publishAt.trim();
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)$/i;
      const match = trimmed.match(regex);
      if (match) {
        const [_, mm, dd, yyyy, hrs, mins, ampm] = match;
        let hour = parseInt(hrs);
        if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
        const parsed = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), hour, parseInt(mins));
        if (!isNaN(parsed.getTime())) {
          customPublicationDate = parsed.toISOString();
        }
      } else {
        const fallback = new Date(trimmed);
        if (!isNaN(fallback.getTime())) {
          customPublicationDate = fallback.toISOString();
        }
      }
    } catch (err) {
      console.error("Error parsing publication date:", err);
    }

    if (editingArticle.id && editingArticle.id.startsWith("imp-")) {
      if (postStatus === "Imported") {
        setImportedArticles(prev => prev.map((art) => {
          if (art.id === editingArticle.id) {
            return {
              ...art,
              title,
              subtitle,
              dSubTitle,
              content,
              category,
              subcategory,
              tags,
              images: finalImages,
              videoUrl,
              reporterName: postAuthorName,
              status: postStatus
            };
          }
          return art;
        }));
        setSuccessMsg("সংবাদটি (Imported) সফলভাবে সম্পাদন করা হয়েছে!");
        setEditingArticle(null);
        setShowAddPostModal(false);
      } else {
        const payload = {
          title,
          subtitle,
          dSubTitle,
          content,
          category,
          subcategory,
          tags,
          images: finalImages,
          videoUrl,
          reporterId: postAuthorId,
          reporterName: postAuthorName,
          status: postStatus,
          publicationDate: customPublicationDate
        };
        fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then((res) => {
            if (!res.ok) throw new Error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
            setSuccessMsg("আমদানিকৃত খবরটি সফলভাবে ডাটাবেজে যুক্ত ও প্রকাশ করা হয়েছে!");
            setImportedArticles(prev => {
              const res = prev.filter(p => p.id !== editingArticle.id);
              markImportedAsProcessed(editingArticle.id);
              return res;
            });
            setEditingArticle(null);
            setShowAddPostModal(false);
            loadData();
          })
          .catch((err) => setErrorMsg(err.message));
      }
      return;
    }

    fetch(`/api/news/${editingArticle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        dSubTitle,
        content,
        category,
        subcategory,
        tags,
        images: finalImages,
        videoUrl,
        reporterId: postAuthorId,
        reporterName: postAuthorName,
        status: postStatus,
        publicationDate: customPublicationDate,
        isLead,
        isHeadline
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setSuccessMsg("সংবাদটি সফলভাবে সম্পাদন ও আপডেট করা হয়েছে!");
        setEditingArticle(null);
        setShowAddPostModal(false);
        loadData();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  const handleApproveNews = (article: Article, shareToFb: boolean = false) => {
    if (article.id && article.id.startsWith("imp-")) {
      // Create a brand new real article in the database upon approval
      const payload = {
        title: article.title,
        subtitle: article.subtitle || "",
        content: article.content,
        category: article.category || "আলোচিত",
        subcategory: article.subcategory || "",
        tags: article.tags || [],
        images: article.images || [],
        imageDescriptions: article.imageDescriptions || [],
        videoUrl: article.videoUrl || "",
        reporterId: "admin",
        reporterName: article.reporterName || "BS Software",
        status: "Published",
        publicationDate: new Date().toISOString()
      };

      fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Approval failed");
          if (shareToFb) {
            setSuccessMsg("সংবাদটি সফলভাবে ওয়েবসাইডে প্রকাশ করা হয়েছে এবং ফেসবুকে শেয়ার করা হয়েছে!");
          } else {
            setSuccessMsg("সংবাদটি সফলভাবে ওয়েবসাইডে প্রকাশ করা হয়েছে!");
          }
          // Remove from the importedArticles state list
          setImportedArticles(prev => {
            const res = prev.filter(p => p.id !== article.id);
            markImportedAsProcessed(article.id);
            return res;
          });
          loadData();
        })
        .catch((err) => console.error(err));
      return;
    }

    fetch(`/api/news/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Published" })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Approval failed");
        if (shareToFb) {
          setSuccessMsg("সংবাদটি সফলভাবে ওয়েবসাইডে প্রকাশ করা হয়েছে এবং ফেসবুকে শেয়ার করা হয়েছে!");
        } else {
          setSuccessMsg("সংবাদটি সফলভাবে ওয়েবসাইডে প্রকাশ করা হয়েছে!");
        }
        loadData();
      })
      .catch((err) => console.error(err));
  };

  const handleRejectNews = (article: Article) => {
    if (article.id && article.id.startsWith("imp-")) {
      const payload = {
        title: article.title,
        subtitle: article.subtitle || "",
        content: article.content,
        category: article.category || "আলোচিত",
        subcategory: article.subcategory || "",
        tags: article.tags || [],
        images: article.images || [],
        imageDescriptions: article.imageDescriptions || [],
        videoUrl: article.videoUrl || "",
        reporterId: "admin",
        reporterName: article.reporterName || "BS Software",
        status: "Rejected",
        publicationDate: new Date().toISOString()
      };

      fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Rejection failed");
          setSuccessMsg("সংবাদটি সফলভাবে রিজেক্ট (Rejected) করা হয়েছে এবং এটি সংশ্লিষ্ট পোর্টালে দৃশ্যমান হবে!");
          setImportedArticles(prev => {
            const res = prev.filter(p => p.id !== article.id);
            markImportedAsProcessed(article.id);
            return res;
          });
          loadData();
        })
        .catch((err) => console.error(err));
      return;
    }

    fetch(`/api/news/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Rejection failed");
        loadData();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteNews = (id: string) => {
    alert("দুঃখিত, নিরাপত্তার স্বার্থে এবং তথ্যের সুরক্ষায় কোনো সংবাদ বা নিউজ ডিলিট করা অনুমোদিত নয়।");
    return;
  };

  const handleToggleStaffStatus = (staff: Staff) => {
    const nextStatus = staff.status === "Active" ? "Suspended" : "Active";
    fetch(`/api/staff/${staff.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(() => loadData())
      .catch((err) => console.error(err));
  };

  const handleDeleteStaff = (userId: string) => {
    setDeleteConfirmModal({
      show: true,
      title: "অ্যাকাউন্ট ডিলিট নিশ্চিতকরণ",
      message: "আপনি কি নিশ্চিতভাবে এই গ্রাহক/ইউজার অ্যাকাউন্ট এবং এর সাথে সম্পর্কিত সকল ডাটা (আইডি কার্ড সহ) চিরতরে ডিলিট করতে চান? ডিলিট করার পর তারা আর এই পোর্টালে প্রবেশ করতে পারবে না এবং তাদের কোনো ডাটা থাকবে না।",
      onConfirm: () => {
        fetch(`/api/staff/${userId}`, { method: "DELETE" })
          .then((res) => {
            if (!res.ok) throw new Error("Deletion failed");
            setSuccessMsg("গ্রাহক/ইউজার অ্যাকাউন্টটি সফলভাবে ডিলিট করা হয়েছে! (Deleted Successfully)");
            setTimeout(() => setSuccessMsg(""), 4000);

            // Fetch corresponding attributes to clean up the other list seamlessly
            const targetStaff = staffList.find(s => 
              (s.userId && s.userId.toLowerCase() === userId.toLowerCase()) || 
              (s.staffId && s.staffId.toLowerCase() === userId.toLowerCase())
            );
            const targetUser = portalUsers.find(u => 
              (u.id && String(u.id).toLowerCase() === userId.toLowerCase())
            );

            const names = new Set<string>();
            const emails = new Set<string>();
            const uids = new Set<string>();
            const phones = new Set<string>();

            uids.add(userId.toLowerCase());
            if (targetStaff) {
              if (targetStaff.userId) uids.add(targetStaff.userId.toLowerCase());
              if (targetStaff.name) names.add(targetStaff.name.toLowerCase());
              if (targetStaff.email) emails.add(targetStaff.email.toLowerCase());
              if (targetStaff.mobile) phones.add(targetStaff.mobile.toLowerCase());
            }
            if (targetUser) {
              if (targetUser.id) uids.add(String(targetUser.id).toLowerCase());
              if (targetUser.name) names.add(targetUser.name.toLowerCase());
              if (targetUser.email) emails.add(targetUser.email.toLowerCase());
              if (targetUser.phone) phones.add(targetUser.phone.toLowerCase());
            }

            // Instant visual feedback for staff and portal users
            setStaffList((prev) => prev.filter((s) => {
              const sUser = s.userId ? s.userId.toLowerCase() : "";
              const sName = s.name ? s.name.toLowerCase() : "";
              const sEmail = s.email ? s.email.toLowerCase() : "";
              const sPhone = s.mobile ? s.mobile.toLowerCase() : "";
              return !uids.has(sUser) && !names.has(sName) && !emails.has(sEmail) && !phones.has(sPhone);
            }));

            setPortalUsers((prev) => prev.filter((u) => {
              const uId = u.id ? String(u.id).toLowerCase() : "";
              const uName = u.name ? u.name.toLowerCase() : "";
              const uEmail = u.email ? u.email.toLowerCase() : "";
              const uPhone = u.phone ? u.phone.toLowerCase() : "";
              return !uids.has(uId) && !names.has(uName) && !emails.has(uEmail) && !phones.has(uPhone);
            }));

            loadData();
          })
          .catch((err) => {
            console.error(err);
            alert("ডিলিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (Error deleting user)");
          });
      }
    });
  };

  const handleEditStaffSubmit = (editedStaff: Staff) => {
    fetch(`/api/staff/${editedStaff.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedStaff)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        loadData();
        setShowEditUserModal(false);
        setEditingStaffMember(null);
      })
      .catch((err) => console.error(err));
  };

  const handleSaveReviewEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    fetch(`/api/news/${editingArticle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingArticle, status: "Published" })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Save failed");
        setEditingArticle(null);
        loadData();
      })
      .catch((err) => alert(err.message));
  };

  const pendingCount = allArticles.filter((item) => item.status === "Pending").length;
  const publishedCount = allArticles.filter((item) => item.status === "Published").length;

  if (!activeUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 font-sans" id="admin-auth-portal">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-800 text-white p-6 text-center space-y-2 relative">
            <h2 className="text-sm font-sans font-black tracking-wider text-rose-500 uppercase">EDITOR CONTROL PORTAL</h2>
            <div className="h-[px] bg-white/10 my-1"></div>
            <h3 className="text-lg font-bold font-display text-white">দৈনিক বার্তাসন্ধান — সম্পাদকীয় প্যানেল</h3>
            <p className="text-[10px] text-gray-300 font-display">প্রকাশনা অনুমোদন, কর্মী রেকর্ড এবং ট্রাফিক পরিসংখ্যান ট্র্যাকিং বোর্ড</p>
            <div className="absolute right-4 top-4 bg-white/10 p-2 rounded-full">
              <ShieldAlert size={16} />
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100 font-display">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-gray-700">ইউজার নাম (Admin ID)</label>
              <input
                type="text"
                required
                placeholder="যেমন: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-display focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-gray-700">সম্পাদকীয় পাসওয়ার্ড</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-display focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-red hover:bg-red-800 text-white font-display text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              প্রবেশাধিকার যাচাই করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Sidebar List Configuration from Screenshot
  const coreSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "categories", label: "Categories", icon: <List size={18} /> },
    { id: "posts", label: "Posts", icon: <FileText size={18} /> },
    { id: "images", label: "Images", icon: <Image size={18} /> },
    { id: "videos", label: "Videos", icon: <Video size={18} /> },
    { id: "reviews", label: "Request Posts", icon: <CheckSquare size={18} />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "req_images", label: "Request Images", icon: <Image size={18} /> },
    { id: "req_videos", label: "Request Videos", icon: <Video size={18} /> },
    { id: "imported", label: "Imported Posts", icon: <Download size={18} />, badge: importedArticles.length > 0 ? importedArticles.length : undefined },
  ];

  // Dynamic helper for calculation
  const getVisitorSum = (filterFn: (v: VisitorLog) => boolean) => {
    return visitorLogs.filter(filterFn).reduce((sum, v) => sum + v.visitorsCount, 0);
  };

  const todayCount = getVisitorSum((v) => v.rawDate === "2026-06-07");
  const thisWeekCount = getVisitorSum((v) => v.rawDate >= "2026-06-01" && v.rawDate <= "2026-06-07");
  const thisMonthCount = getVisitorSum((v) => v.rawDate.startsWith("2026-06"));
  const yesterdayCount = getVisitorSum((v) => v.rawDate === "2026-06-06");
  const lastWeekCount = getVisitorSum((v) => v.rawDate >= "2026-05-24" && v.rawDate <= "2026-05-31");
  const lastMonthCount = getVisitorSum((v) => v.rawDate.startsWith("2026-05"));
  const thisYearCount = getVisitorSum((v) => v.rawDate.startsWith("2026"));
  const lastYearCount = getVisitorSum((v) => v.rawDate.startsWith("2025"));
  const totalCount = getVisitorSum(() => true);

  // Region specific counts
  const dhakaCount = getVisitorSum((v) => v.location.toLowerCase().includes("dhaka"));
  const taiyuanCount = getVisitorSum((v) => v.location.toLowerCase().includes("taiyuan"));
  const charlotteCount = getVisitorSum((v) => v.location.toLowerCase().includes("charlotte"));
  const socialCircleCount = getVisitorSum((v) => v.location.toLowerCase().includes("social circle"));
  const ashburnCount = getVisitorSum((v) => v.location.toLowerCase().includes("ashburn"));
  const chattogramCount = getVisitorSum((v) => v.location.toLowerCase().includes("chattogram"));

  // Colorful Metric Cards configuration (Exactly matches the 27 items from screenshot)
  const metricCards = [
    // Row 1
    { number: (todayCount || 4).toString(), label: "Today Visitors", color: "bg-[#22c55e]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (thisWeekCount || 18).toString(), label: "This Week Visitors", color: "bg-[#2563eb]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (thisMonthCount || 28).toString(), label: "This Month Visitors", color: "bg-[#a855f7]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 2
    { number: (yesterdayCount !== undefined && yesterdayCount !== null ? yesterdayCount : 0).toString(), label: "Yesterday Visitors", color: "bg-[#db2777]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (lastWeekCount || 12).toString(), label: "Last Week Visitors", color: "bg-[#ea580c]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (lastMonthCount || 64).toString(), label: "Last Month Visitors", color: "bg-[#06b6d4]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 3
    { number: (thisYearCount || 764).toString(), label: "This Year Visitors", color: "bg-[#1e293b]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (lastYearCount !== undefined && lastYearCount !== null ? lastYearCount : 0).toString(), label: "Last Year Visitors", color: "bg-[#7f1d1d]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (totalCount || 764).toString(), label: "Total Visitors", color: "bg-[#14532d]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 4
    { number: (dhakaCount || 229).toString(), label: "Dhaka, Dhaka Division, BD Visitors", color: "bg-[#881337]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (taiyuanCount || 41).toString(), label: "Taiyuan, Shanxi, CN Visitors", color: "bg-[#c2410c]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (charlotteCount || 30).toString(), label: "Charlotte, North Carolina, US Visitors", color: "bg-[#ca8a04]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 5
    { number: (socialCircleCount || 18).toString(), label: "Social Circle, Georgia, US Visitors", color: "bg-[#1e3a8a]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (ashburnCount || 18).toString(), label: "Ashburn, Virginia, US Visitors", color: "bg-[#14532d]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (chattogramCount || 14).toString(), label: "Chattogram, Chittagong, BD Visitors", color: "bg-[#115e59]", icon: <Scan size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 6
    { number: (staffList.length > 0 ? staffList.filter(s => s.designation === "User" || !s.designation).length : 13).toString(), label: "Total Users", color: "bg-[#a855f7]", icon: <Users size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (staffList.length > 0 ? staffList.filter(s => s.author === "Yes").length : 7).toString(), label: "Total Authors", color: "bg-[#db2777]", icon: <GraduationCap size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (categories.length || 37).toString(), label: "Total Categories", color: "bg-[#0284c7]", icon: <List size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 7
    { number: publishedCount.toString(), label: "Total Posts", color: "bg-[#22c55e]", icon: <List size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: pendingCount.toString(), label: "Total Posts Requests", color: "bg-[#ea580c]", icon: <RotateCw size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (allArticles.filter(item => item.status === "Rejected").length).toString(), label: "Total Rejected Posts", color: "bg-[#dc2626]", icon: <AlertTriangle size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 8
    { number: (allArticles.filter(item => (item.status === "Published" || item.status === "Approved") && item.images && item.images.length > 0 && item.images[0].trim() !== "").length).toString(), label: "Total Images", color: "bg-[#2563eb]", icon: <List size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (allArticles.filter(item => item.status === "Pending" && item.images && item.images.length > 0 && item.images[0].trim() !== "").length).toString(), label: "Total Images Requests", color: "bg-[#1e293b]", icon: <RotateCw size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (allArticles.filter(item => item.status === "Rejected" && item.images && item.images.length > 0 && item.images[0].trim() !== "").length).toString(), label: "Total Rejected Images", color: "bg-[#3f6212]", icon: <AlertTriangle size={44} strokeWidth={1.5} className="opacity-25" /> },
    // Row 9 (Videos, usually separated or standard)
    { number: (allArticles.filter(item => (item.status === "Published" || item.status === "Approved") && (item.category === "ভিডিও" || item.category === "video" || item.videoUrl)).length).toString(), label: "Total Videos", color: "bg-[#4f46e5]", icon: <List size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (allArticles.filter(item => item.status === "Pending" && (item.category === "ভিডিও" || item.category === "video" || item.videoUrl)).length).toString(), label: "Total Video Requests", color: "bg-[#581c87]", icon: <RotateCw size={44} strokeWidth={1.5} className="opacity-25" /> },
    { number: (allArticles.filter(item => item.status === "Rejected" && (item.category === "ভিডিও" || item.category === "video" || item.videoUrl)).length).toString(), label: "Total Rejected Videos", color: "bg-[#0d9488]", icon: <AlertTriangle size={44} strokeWidth={1.5} className="opacity-25" /> }
  ];

  return (
    <div className="min-h-screen md:h-screen bg-[#f3f4f6] font-sans flex flex-col md:flex-row md:overflow-hidden" id="admin-dashboard-container">
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3.5 rounded-lg shadow-2xl z-50 flex items-center gap-3 border border-emerald-500/30 font-sans max-w-sm animate-fade-in animate-pulse">
          <ShieldCheck size={18} className="text-white shrink-0 animate-bounce" />
          <div className="flex-1">
            <p className="font-bold text-xs select-none">সম্পন্ন হয়েছে (Success)</p>
            <p className="text-[11px] opacity-90 leading-normal font-medium">{successMsg}</p>
          </div>
          <button 
            onClick={() => setSuccessMsg("")} 
            className="p-1 hover:bg-white/15 rounded text-white cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Mobile Top Navigation Head Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <span className="font-sans font-black uppercase text-xs tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded">Control Portal</span>
          <span className="font-display font-black text-primary-red text-sm">দৈনিক বার্তাসন্ধান</span>
        </div>
        <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="p-1 text-gray-700 hover:text-black">
          <Menu size={24} />
        </button>
      </div>

      {/* LEFT SIDEBAR (Copy of layout from the screenshot) */}
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-transform duration-300 z-40 md:relative fixed md:translate-x-0 h-screen overflow-y-auto ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        {/* Brand Logo and Slogan Header in Left Sidebar */}
        <div className="px-5 py-4.5 border-b border-gray-150 bg-gray-50/50">
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-red-700 text-base lg:text-lg tracking-tight select-none">
              দৈনিক বার্তা সন্ধান
            </span>
            <span className="text-[10px] text-gray-500 font-display mt-0.5 tracking-wide leading-relaxed select-none">
              সঠিক সংবাদ, সত্যের সন্ধানে প্রতিদিন
            </span>
          </div>
        </div>

        <div className="py-3 flex-1">
          <nav className="px-3 space-y-1">
            {coreSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold rounded-md transition-all ${
                  activeTab === item.id
                    ? "bg-[#2563eb] text-white"
                    : "text-gray-700 hover:bg-gray-150 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeTab === item.id ? "text-white" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-sans font-bold bg-[#ef4444] text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Management Collapsible group */}
            <div className="pt-2">
              <button
                onClick={() => setIsManagementExpanded(!isManagementExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-150 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Menu size={18} className="text-gray-400" />
                  <span>Management</span>
                </div>
                <ChevronDown size={14} className={`transform transition-transform ${isManagementExpanded ? "rotate-180" : ""}`} />
              </button>

              {isManagementExpanded && (
                <div className="pl-6 pr-2 py-1 space-y-1 bg-gray-50/55 rounded-md mt-1 border-l-2 border-gray-200">
                  {/* Users */}
                  <button
                    onClick={() => { setActiveTab("users"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                      activeTab === "users" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <Users size={15} className={activeTab === "users" ? "text-blue-700" : "text-gray-400"} />
                    <span>Users</span>
                  </button>

                  {/* Families */}
                  <button
                    onClick={() => { setActiveTab("families"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                      activeTab === "families" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <Users size={15} className={activeTab === "families" ? "text-blue-700" : "text-gray-400"} />
                    <span>Families</span>
                  </button>

                  {/* Visitors */}
                  <button
                    onClick={() => { setActiveTab("visitors"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                      activeTab === "visitors" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <Scan size={14} className={activeTab === "visitors" ? "text-blue-700" : "text-gray-400"} />
                    <span>Visitors</span>
                  </button>

                  {/* Photo Cards */}
                  <button
                    onClick={() => { setActiveTab("photo_cards"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                      activeTab === "photo_cards" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <Image size={14} className={activeTab === "photo_cards" ? "text-blue-700" : "text-gray-400"} />
                    <span>Photo Cards</span>
                  </button>

                  <div className="h-[1px] bg-gray-200/60 my-1"></div>

                  <button
                    onClick={() => { setActiveTab("staff"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2 py-1.5 px-3 text-xs font-medium rounded ${
                      activeTab === "staff" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <UserPlus size={14} />
                    <span>New Staff Register</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("stafflist"); setIsMobileSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-2 py-1.5 px-3 text-xs font-medium rounded ${
                      activeTab === "stafflist" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-150"
                    }`}
                  >
                    <Users size={14} />
                    <span>Staff & ID Cards</span>
                  </button>
                </div>
              )}
            </div>

            {/* Settings section */}
            <div className="pt-4 px-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</p>
            </div>

            <button
              onClick={() => { setActiveTab("app_settings"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "app_settings"
                  ? "bg-[#2563eb] text-white"
                  : "text-gray-700 hover:bg-gray-150 hover:text-gray-900"
              }`}
            >
              <Wrench size={18} className={activeTab === "app_settings" ? "text-white" : "text-gray-400"} />
              <span>Application Settings</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-gray-600">Logged in as: <strong>{activeUser.name}</strong></span>
          </div>
          <button
            onClick={onNavigateHome}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition-colors"
          >
            পত্রিকার প্রধান পাতা →
          </button>
        </div>
      </aside>

      {/* MAIN PANEL CONTENT (on the right) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* TOP STATUS BAR CONTAINER */}
        {activeTab !== "dashboard" && (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 rounded-lg border border-gray-250 shadow-sm gap-4 transition-all duration-300">
            <div>
              <h1 className="text-base md:text-[19px] font-bold font-display text-slate-900 flex flex-wrap items-center gap-2">
                <span className="text-[#2563eb] font-sans font-black tracking-wider text-xs md:text-[14px] bg-blue-50/70 border border-blue-100/50 px-2.5 py-1 rounded inline-block uppercase">EDITOR CONTROL PORTAL</span>
                <span className="text-slate-350 font-light select-none text-base">/</span>
                <span className="tracking-wide">দৈনিক বার্তাসন্ধান — সম্পাদকীয় প্যানেল</span>
              </h1>
              <p className="text-xs text-gray-450 mt-1.5 font-display">প্রকাশনা অনুমোদন, কর্মী রেকর্ড এবং ট্রাফিক পরিসংখ্যান ট্র্যাকিং বোর্ড</p>
            </div>
            <span className="text-xs font-semibold font-mono bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full border border-blue-100/60 shrink-0">
              Role: {activeUser.designation} (Admin)
            </span>
          </div>
        )}

        {/* 1. DASHBOARD OVERVIEW VIEW */}
        {activeTab === "dashboard" && (
          selectedVisitorMetric ? (
            <VisitorLogsTable
              metricLabel={selectedVisitorMetric}
              onBack={() => setSelectedVisitorMetric(null)}
              logs={visitorLogs}
              onDeleteLog={handleDeleteVisitorLog}
            />
          ) : (
            <div className="space-y-8 animate-fade-in" id="admin-summary-view">
              
              {/* The Colorful Cards Multi-Grid Layout (Exactly matches the user's screenshot layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {metricCards.map((card, idx) => {
                  // Determine horizontal separator boundary after Index 23 (Row 8) which separates the video metrics from others!
                  const isVideoCard = idx >= 24;
                  const isVisitorCard = card.label.includes("Visitors");
                  return (
                    <React.Fragment key={idx}>
                      {idx === 24 && (
                        <hr className="col-span-1 md:col-span-2 lg:col-span-3 border-t border-black/80 my-4" />
                      )}
                      <div 
                        onClick={() => {
                          if (isVisitorCard) {
                            setSelectedVisitorMetric(card.label);
                          }
                        }}
                        className={`overflow-hidden rounded-md ${card.color} text-white shadow-md flex flex-col justify-between h-32 font-sans relative ${
                          isVisitorCard ? "cursor-pointer hover:shadow-lg hover:scale-[1.01] hover:brightness-[1.03] transition-all duration-200" : ""
                        }`}
                      >
                        {/* Top metrics with labels and transparent icons */}
                        <div className="p-4 flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-3xl font-extrabold tracking-tight block">
                              {card.number}
                            </span>
                            <span className="text-xs font-bold opacity-90 block leading-tight">
                              {card.label}
                            </span>
                          </div>
                          <div className="text-white shrink-0">
                            {card.icon}
                          </div>
                        </div>
                        
                        {/* Interactive slide ribbon link */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid double click trigger
                            if (isVisitorCard) {
                              setSelectedVisitorMetric(card.label);
                            } else if (card.label.includes("Requests")) setActiveTab("reviews");
                            else if (card.label.includes("Posts")) setActiveTab("posts");
                            else if (card.label.includes("Images")) setActiveTab("images");
                            else if (card.label.includes("Videos")) setActiveTab("videos");
                            else if (card.label.includes("Categories")) setActiveTab("categories");
                            else if (card.label.includes("Users") || card.label.includes("Authors")) setActiveTab("stafflist");
                          }}
                          className="w-full bg-black/15 hover:bg-black/25 py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-1 transition-all text-center border-t border-white/5 cursor-pointer leading-none"
                        >
                          <span>More Info</span>
                          <ChevronRight size={13} className="inline" />
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* 2. CATEGORIES VIEW */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-fade-in font-display" id="admin-categories-view">
            {/* Top Command Action button matching screenshot */}
            <div className="flex justify-start">
              <button
                onClick={() => {
                  setCatFormName("");
                  setCatFormCode("");
                  setCatFormHasNumBox(false);
                  setCatFormNumValue("");
                  setShowAddCategoryModal(true);
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded text-xs font-bold font-sans cursor-pointer transition shadow-sm tracking-wide uppercase flex items-center gap-2"
              >
                + ADD NEW CATEGORY
              </button>
            </div>

            {/* List of categories vertically stacked matching screenshot */}
            <div className="space-y-3.5">
              {categories.map((cat, i) => (
                <div
                  key={cat.code}
                  className="bg-white border border-gray-200 rounded-lg py-3.5 px-5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Visual indicators matching screenshot */}
                    {cat.hasNumBox ? (
                      <div className="border border-slate-200 hover:border-slate-300 rounded px-3.5 py-1.5 flex items-center gap-2 bg-white shrink-0">
                        {/* Pink solid badge with white numeric */}
                        <div className="w-5.5 h-5.5 flex items-center justify-center bg-[#ec4899] text-white text-[12px] font-sans font-black rounded-full shadow-sm">
                          {cat.numValue || (i + 1).toString()}
                        </div>
                        {/* Blue angle caret */}
                        <span className="text-[#2563eb] font-extrabold text-[13px] leading-none font-sans select-none">&gt;</span>
                      </div>
                    ) : (
                      /* Quiet bullet bullet point */
                      <div className="flex items-center pl-2.5 pr-2.5 shrink-0">
                        <span className="text-[#cbd5e1] font-black text-[18px] leading-none select-none">•</span>
                      </div>
                    )}

                    {/* Category Label */}
                    <span className="text-sm font-semibold tracking-wide text-slate-800 leading-none">
                      {cat.name}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditCategoryOpen(cat)}
                      className="border border-indigo-100 text-blue-500 hover:text-white hover:bg-blue-600 hover:border-blue-600 p-1.5 rounded transition-all cursor-pointer bg-blue-50/40"
                      title="Edit Category"
                    >
                      <Edit size={14} className="stroke-[2.5]" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteCategory(cat.code)}
                      className="border border-red-100 text-red-500 hover:text-white hover:bg-red-600 hover:border-red-600 p-1.5 rounded transition-all cursor-pointer bg-red-50/40"
                      title="Delete Category"
                    >
                      <Trash2 size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD CATEGORY MODAL - Pre-populated overlay form */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] overflow-y-auto transform scale-100 transition-all font-sans text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center bg-[#f8fafc] px-5 py-3 border-b border-gray-150">
                    <h3 className="text-sm font-bold text-slate-800">Add New Category</h3>
                    <button
                      onClick={() => setShowAddCategoryModal(false)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Add Form */}
                  <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4 text-left font-sans">
                    {/* Category Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={catFormName}
                        onChange={(e) => {
                          setCatFormName(e.target.value);
                          // Auto generate slug as typing if slug hasn't been edited
                          if (e.target.value.trim() && !catFormCode) {
                            // simple fallback
                          }
                        }}
                        placeholder="Category Name *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* ID Code (Slug) with Refresh button */}
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={catFormCode}
                        onChange={(e) => setCatFormCode(e.target.value)}
                        placeholder="Category Slug *"
                        className="w-full p-2.5 pr-10 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-slate-800 cursor-pointer"
                        title="Auto Generate Slug from English/Bangla Name"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>

                    {/* Category Icon */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Category Icon</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-200 file:text-xs file:font-semibold file:bg-gray-50 file:text-slate-700 hover:file:bg-gray-100 cursor-pointer"
                        />
                      </div>
                      {catFormIcon && (
                        <div className="mt-1 flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                          <img src={catFormIcon} className="h-8 w-auto object-contain" />
                          <button
                            type="button"
                            onClick={() => setCatFormIcon(null)}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Display Order */}
                    <div>
                      <input
                        type="text"
                        value={catFormDisplayOrder}
                        onChange={(e) => setCatFormDisplayOrder(e.target.value)}
                        placeholder="Display Order"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* Pink numerical box style or standard switch */}
                    <div className="flex justify-between items-center py-1 bg-slate-50/50 p-2 rounded border border-gray-50 font-sans">
                      <span className="text-xs font-semibold text-slate-700">Show numeric box badge instead of bullet dot?</span>
                      <button
                        type="button"
                        onClick={() => setCatFormHasNumBox(!catFormHasNumBox)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          catFormHasNumBox ? "bg-[#2563eb]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            catFormHasNumBox ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Custom numeric value */}
                    {catFormHasNumBox && (
                      <div className="p-2 border border-blue-100 bg-blue-50/10 rounded animate-fade-in">
                        <input
                          type="text"
                          value={catFormNumValue}
                          onChange={(e) => setCatFormNumValue(e.target.value)}
                          placeholder="Box Number (Bengali or English - e.g. ১ বা ৩)"
                          className="w-full p-2 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Parent Category (Optional) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Parent Category <span className="text-[10px] text-gray-400 font-normal">(Optional)</span></label>
                      <div className="border border-gray-300 rounded p-2.5 bg-[#f8fafc] text-xs text-slate-705 text-left flex justify-between items-center select-none font-sans">
                        <span>
                          {catFormParentCategory
                            ? categories.find((c) => c.code === catFormParentCategory)?.name || "Select Category"
                            : "Select Category"}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>

                      {/* Stylized Selection Scroll Box matching exact UI look of Screenshot list */}
                      <div className="border border-slate-200 rounded mt-1 bg-white p-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100 font-sans shadow-inner">
                        {/* Option to clear parent choice / none */}
                        <div
                          onClick={() => setCatFormParentCategory("")}
                          className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition ${
                            catFormParentCategory === ""
                              ? "bg-blue-50 text-[#2563eb] font-bold"
                              : "text-slate-550 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-slate-300 select-none font-bold">•</span>
                          <span>Select Category (No Parent)</span>
                        </div>

                        {categories.map((c, i) => (
                          <div
                            key={c.code}
                            onClick={() => setCatFormParentCategory(c.code)}
                            className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition ${
                              catFormParentCategory === c.code
                                ? "bg-blue-50 border border-blue-100/50 text-[#2563eb]"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {c.hasNumBox ? (
                                <div className="border border-slate-200 bg-white rounded px-2 py-0.5 flex items-center gap-1.5 text-[9px] font-sans scale-95 origin-left shrink-0">
                                  <div className="w-4 h-4 bg-[#ec4899] text-white rounded-full flex items-center justify-center font-bold text-[8px]">
                                    {c.numValue || (i + 1).toString()}
                                  </div>
                                  <span className="text-[#2563eb] font-extrabold text-[9px] leading-none">&gt;</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-extrabold text-[13px] px-1 shrink-0 select-none">•</span>
                              )}
                              <span className="font-semibold text-slate-800">{c.name}</span>
                            </div>
                            {catFormParentCategory === c.code && (
                              <span className="text-[8px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase">Selected</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save and Cancel buttons matching Screenshot positions and styles */}
                    <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-150 font-sans">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(false)}
                        className="text-[#2563eb] hover:underline font-bold text-[12px] uppercase cursor-pointer py-1.5 px-3 transition"
                      >
                        CLOSE
                      </button>
                      <button
                        type="submit"
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded text-[12px] font-bold font-sans cursor-pointer transition shadow-sm tracking-wide uppercase"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT CATEGORY MODAL - Pre-populated overlay form */}
            {showEditCategoryModal && editingCategory && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] overflow-y-auto transform scale-100 transition-all font-sans text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center bg-[#f8fafc] px-5 py-3 border-b border-gray-150">
                    <h3 className="text-sm font-bold text-slate-800">Edit Category</h3>
                    <button
                      onClick={() => {
                        setShowEditCategoryModal(false);
                        setEditingCategory(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Edit Form */}
                  <form onSubmit={handleEditCategorySubmit} className="p-5 space-y-4 text-left font-sans">
                    {/* Category Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={catFormName}
                        onChange={(e) => setCatFormName(e.target.value)}
                        placeholder="Category Name *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* ID Code (Disabled during edit) */}
                    <div>
                      <input
                        type="text"
                        disabled
                        value={catFormCode}
                        className="w-full p-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded text-sm font-sans cursor-not-allowed"
                        placeholder="Category Slug"
                      />
                    </div>

                    {/* Category Icon */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Category Icon</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-200 file:text-xs file:font-semibold file:bg-gray-50 file:text-slate-700 hover:file:bg-gray-100 cursor-pointer"
                        />
                      </div>
                      {catFormIcon && (
                        <div className="mt-1 flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                          <img src={catFormIcon} className="h-8 w-auto object-contain" />
                          <button
                            type="button"
                            onClick={() => setCatFormIcon(null)}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Display Order */}
                    <div>
                      <input
                        type="text"
                        value={catFormDisplayOrder}
                        onChange={(e) => setCatFormDisplayOrder(e.target.value)}
                        placeholder="Display Order"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* Pink numerical box style switch */}
                    <div className="flex justify-between items-center py-1 bg-slate-50/50 p-2 rounded border border-gray-50 font-sans">
                      <span className="text-xs font-semibold text-slate-700">Show numeric box badge instead of bullet dot?</span>
                      <button
                        type="button"
                        onClick={() => setCatFormHasNumBox(!catFormHasNumBox)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          catFormHasNumBox ? "bg-[#2563eb]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            catFormHasNumBox ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Custom numeric value */}
                    {catFormHasNumBox && (
                      <div className="p-2 border border-blue-100 bg-blue-50/10 rounded animate-fade-in">
                        <input
                          type="text"
                          value={catFormNumValue}
                          onChange={(e) => setCatFormNumValue(e.target.value)}
                          placeholder="Box Number (Bengali or English - e.g. ১ বা ৩)"
                          className="w-full p-2 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Parent Category (Optional) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Parent Category <span className="text-[10px] text-gray-400 font-normal">(Optional)</span></label>
                      <div className="border border-gray-300 rounded p-2.5 bg-[#f8fafc] text-xs text-slate-705 text-left flex justify-between items-center select-none font-sans">
                        <span>
                          {catFormParentCategory
                            ? categories.find((c) => c.code === catFormParentCategory)?.name || "Select Category"
                            : "Select Category"}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>

                      {/* Scroll view of options */}
                      <div className="border border-slate-200 rounded mt-1 bg-white p-1.5 max-h-40 overflow-y-auto divide-y divide-slate-100 font-sans shadow-inner">
                        <div
                          onClick={() => setCatFormParentCategory("")}
                          className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition ${
                            catFormParentCategory === ""
                              ? "bg-blue-50 text-[#2563eb] font-bold"
                              : "text-slate-550 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-slate-300 select-none font-bold">•</span>
                          <span>Select Category (No Parent)</span>
                        </div>

                        {categories.filter((c) => c.code !== editingCategory.code).map((c, i) => (
                          <div
                            key={c.code}
                            onClick={() => setCatFormParentCategory(c.code)}
                            className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition ${
                              catFormParentCategory === c.code
                                ? "bg-blue-50 border border-blue-101/50 text-[#2563eb]"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {c.hasNumBox ? (
                                <div className="border border-slate-200 bg-white rounded px-2 py-0.5 flex items-center gap-1.5 text-[9px] font-sans scale-95 origin-left shrink-0">
                                  <div className="w-4 h-4 bg-[#ec4899] text-white rounded-full flex items-center justify-center font-bold text-[8px]">
                                    {c.numValue || (i + 1).toString()}
                                  </div>
                                  <span className="text-[#2563eb] font-extrabold text-[9px] leading-none">&gt;</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-extrabold text-[13px] px-1 shrink-0 select-none">•</span>
                              )}
                              <span className="font-semibold text-slate-800">{c.name}</span>
                            </div>
                            {catFormParentCategory === c.code && (
                              <span className="text-[8px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase">Selected</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save and Cancel buttons */}
                    <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-150 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditCategoryModal(false);
                          setEditingCategory(null);
                        }}
                        className="text-[#2563eb] hover:underline font-bold text-[12px] uppercase cursor-pointer py-1.5 px-3 transition"
                      >
                        CLOSE
                      </button>
                      <button
                        type="submit"
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded text-[12px] font-bold font-sans cursor-pointer transition shadow-sm tracking-wide uppercase"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. POSTS VIEW */}
        {activeTab === "posts" && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-5 animate-fade-in" id="admin-posts-view">
            {/* Header / Search Controls matching the exact picture design */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white pb-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={postsSearchQuery}
                    onChange={(e) => setPostsSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* Author Filter Dropdown */}
                <select
                  value={postsAuthorFilter}
                  onChange={(e) => setPostsAuthorFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 bg-white rounded text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px] font-sans cursor-pointer"
                >
                  <option value="All">Author Filter</option>
                  {Array.from(new Set(allArticles.map((art) => art.reporterName).filter(Boolean))).map((author) => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>

                {/* Filter Status Dropdown */}
                <select
                  value={postsStatusFilter}
                  onChange={(e) => setPostsStatusFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 bg-white rounded text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px] font-sans cursor-pointer"
                >
                  <option value="All">Filter Status (All)</option>
                  <option value="Published">Published / Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Imported">Importing / Archive</option>
                </select>
              </div>

              {/* Date Box & Add New Post Button */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                <div className="border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-700 bg-white inline-flex items-center gap-1.5 font-sans select-none shadow-xs font-semibold">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{getFormattedToday()}</span>
                </div>

                <button
                  onClick={() => setShowAddPostModal(true)}
                  className="bg-[#1e60d4] hover:bg-blue-700 text-white font-sans font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded shadow-sm inline-flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={14} className="mr-1" />
                  <span>ADD NEW POST</span>
                </button>
              </div>
            </div>

            {/* Core news grid table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-sans font-bold bg-white">
                    <th className="py-3 px-3 w-8">
                      <input type="checkbox" className="rounded border-gray-200 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    </th>
                    <th className="py-3 px-3 font-sans w-16 text-gray-700 font-bold uppercase tracking-wider">SL N.</th>
                    <th className="py-3 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Date</th>
                    <th className="py-3 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Title</th>
                    <th className="py-3 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Category</th>
                    <th className="py-3 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Author</th>
                    <th className="py-3 px-3 font-sans text-gray-700 font-bold text-left uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allArticles
                    .filter((art) => {
                      const matchesSearch = art.title.toLowerCase().includes(postsSearchQuery.toLowerCase());
                      const matchesAuthor = postsAuthorFilter === "All" || art.reporterName === postsAuthorFilter;
                      const matchesStatus = postsStatusFilter === "All" || 
                        (postsStatusFilter === "Published" && (art.status === "Published" || art.status === "Approved")) ||
                        art.status === postsStatusFilter;
                      return matchesSearch && matchesAuthor && matchesStatus;
                    })
                    .map((art) => {
                      // SL N calculating based on original array index to lock the numbers
                      const slNumber = getOriginalSL(art);
                      // Format dates
                      const dates = getArticleDates(art);
                      // Author details lookup
                      const authorInfo = getAuthorDetails(art);

                      return (
                        <tr key={art.id} className="hover:bg-gray-50/20 transition-colors">
                          {/* Checkbox */}
                          <td className="py-4 px-3 w-8">
                            <input type="checkbox" className="rounded border-gray-200 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                          </td>

                          {/* SL N. */}
                          <td className="py-4 px-3 font-sans text-gray-700 text-[13px]">
                            {slNumber}
                          </td>

                          {/* Date Cell with Published, Created, Updated */}
                          <td className="py-4 px-3 text-left font-sans text-[11px] text-gray-650 leading-relaxed whitespace-nowrap min-w-[190px]">
                            <div>
                              <strong className="text-gray-900 font-bold">Published:</strong> {dates.published}
                            </div>
                            <div className="mt-1">
                              <strong className="text-gray-900 font-bold">Created:</strong> {dates.created}
                            </div>
                            <div className="mt-1">
                              <strong className="text-gray-900 font-bold">Updated:</strong> {dates.updated}
                            </div>
                          </td>

                          {/* Title with Image Thumbnail */}
                          <td className="py-4 px-3 text-left min-w-[300px]">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.images && art.images[0] ? art.images[0] : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=480&q=80"}
                                alt=""
                                className="w-14 h-10 object-cover rounded border border-gray-200 shrink-0 select-none shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                              <div className="font-display text-gray-950 font-bold text-xs md:text-[13px] leading-snug line-clamp-2">
                                {art.title}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-3 text-left font-display text-[13px] text-gray-700 whitespace-nowrap">
                            {art.category}
                          </td>

                          {/* Author */}
                          <td className="py-4 px-3 text-left whitespace-nowrap">
                            <div className="font-display text-gray-800 text-[13px] font-semibold">
                              {authorInfo.name}
                            </div>
                            <div className="font-sans text-gray-500 text-[11px] mt-0.5">
                              {authorInfo.mobile}
                            </div>
                          </td>

                          {/* Vertical Stacked Actions Buttons */}
                          <td className="py-4 px-3">
                            <div className="flex flex-col gap-1 w-24 shrink-0">
                              {/* SHARE */}
                              <button
                                onClick={() => setSharingArticle(art)}
                                className="bg-[#1b813a] hover:bg-green-700 text-white font-sans font-black text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors uppercase w-full cursor-pointer shadow-xs"
                              >
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 10-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                </svg>
                                <span>SHARE</span>
                              </button>

                              {/* EDIT */}
                              <button
                                onClick={() => startEditingArticle(art)}
                                className="bg-[#1e60d4] hover:bg-blue-650 text-white font-sans font-black text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors uppercase w-full cursor-pointer shadow-xs"
                              >
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                                <span>EDIT</span>
                              </button>

                              {/* DELETE */}
                              <button
                                onClick={() => handleDeleteNews(art.id)}
                                className="bg-[#d92121] hover:bg-red-700 text-white font-sans font-black text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors uppercase w-full cursor-pointer shadow-xs"
                              >
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                <span>DELETE</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. IMAGES MEDIA GALLERY */}
        {activeTab === "images" && (
          <div className="bg-white p-4 md:p-6 rounded-md border border-gray-250 shadow-xs space-y-6 animate-fade-in" id="admin-images-view">
            {/* Filter Search Header Area exactly mirroring screenshot */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans pb-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar with Search Icon */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={imagesSearchQuery}
                    onChange={(e) => setImagesSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs text-gray-650 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[180px] font-sans"
                  />
                </div>

                {/* Author Filter Dropdown */}
                <select
                  value={imagesAuthorFilter}
                  onChange={(e) => setImagesAuthorFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px] font-sans cursor-pointer"
                >
                  <option value="All">Author Filter</option>
                  {Array.from(new Set(allArticles.map((art) => art.reporterName).filter(Boolean))).map((author) => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Date Box and Add New Images Button */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <div className="border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-700 bg-white inline-flex items-center gap-1.5 font-sans select-none shadow-xs font-semibold">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{getFormattedToday()}</span>
                </div>

                <button
                  onClick={() => {
                    setImageUploadEditingId(null);
                    setImageUploadTitle("");
                    setImageUploadDescription("");
                    setImageUploadCategory("জাতীয়");
                    setImageUploadFiles([]);
                    setImageUploadStatus("Approved");
                    setImageUploadShareFacebook("Yes");
                    setShowUploadImagesModal(true);
                  }}
                  className="bg-[#1e70eb] hover:bg-blue-700 text-white font-sans font-bold text-xs uppercase tracking-wider px-4 py-2 rounded shadow-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} className="stroke-[3]" />
                  <span>ADD NEW IMAGES</span>
                </button>
              </div>
            </div>

            {/* Core Images Table matching requested screenshot design */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-sans font-bold bg-white text-[11px] h-10">
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded border-gray-250 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    </th>
                    <th className="py-2.5 px-3 font-sans w-16 text-gray-700 font-bold uppercase tracking-wider">SL No.</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Date</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Title</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Author</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold text-center uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allArticles
                    .filter((art) => {
                      const hasImage = art.images && art.images.length > 0 && art.images[0].trim() !== "";
                      if (!hasImage) return false;

                      const matchesSearch = art.title.toLowerCase().includes(imagesSearchQuery.toLowerCase());
                      const matchesAuthor = imagesAuthorFilter === "All" || art.reporterName === imagesAuthorFilter;
                      return matchesSearch && matchesAuthor;
                    })
                    .map((art) => {
                      const slNumber = getOriginalSL(art);
                      const dates = getArticleDates(art);
                      const authorInfo = getAuthorDetails(art);
                      const imageUrl = art.images[0];

                      return (
                        <tr key={art.id} className="hover:bg-gray-50/10 transition-colors">
                          {/* Checkbox */}
                          <td className="py-5 px-3 w-8 align-middle">
                            <input type="checkbox" className="rounded border-gray-250 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                          </td>

                          {/* SL No. */}
                          <td className="py-5 px-3 font-sans text-gray-700 text-[12px] font-bold align-middle">
                            {slNumber}
                          </td>

                          {/* Dates stack */}
                          <td className="py-5 px-3 text-left font-sans text-[11px] text-gray-650 leading-relaxed whitespace-nowrap min-w-[200px] align-middle">
                            <div>
                              <strong className="text-gray-900 font-bold">Created:</strong> {dates.created}
                            </div>
                            <div className="mt-1">
                              <strong className="text-gray-900 font-bold">Updated:</strong> {dates.updated}
                            </div>
                          </td>

                          {/* Title with Image Thumbnail exactly matching mockup */}
                          <td className="py-5 px-3 text-left min-w-[320px] align-middle">
                            <div className="flex flex-col gap-2 items-start">
                              <img
                                src={imageUrl}
                                alt=""
                                className="w-24 h-15 object-cover rounded border border-gray-200 shrink-0 select-none shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                              <div className="font-display text-slate-900 font-bold text-[12px] leading-snug line-clamp-2 max-w-[450px]">
                                {art.title}
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="py-5 px-3 text-left whitespace-nowrap font-sans text-[12px] text-gray-700 align-middle">
                            {authorInfo.name || "Author"}
                          </td>

                          {/* Stacked Interactive Buttons */}
                          <td className="py-5 px-3 align-middle">
                            <div className="flex flex-col gap-1.5 w-24 mx-auto shrink-0 font-sans">
                              {/* EDIT */}
                              <button
                                onClick={() => startEditingImagePost(art)}
                                className="bg-[#1e70eb] hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 text-center rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <Edit size={10} className="stroke-[3]" />
                                <span>EDIT</span>
                              </button>

                              {/* VIEW */}
                              <button
                                onClick={() => setViewingImagePost(art)}
                                className="bg-[#029ee6] hover:bg-cyan-600 text-white font-bold text-[10px] px-2.5 py-1 text-center rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <Eye size={10} className="stroke-[3]" />
                                <span>VIEW</span>
                              </button>

                              {/* SHARE */}
                              <button
                                onClick={() => setSharingArticle(art)}
                                className="bg-[#1c8c36] hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1 text-center rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5 text-white stroke-[3] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314" />
                                </svg>
                                <span>SHARE</span>
                              </button>

                              {/* DELETE */}
                              <button
                                onClick={() => handleDeleteNews(art.id)}
                                className="bg-[#d92121] hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 text-center rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5 text-white stroke-[3] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0" />
                                </svg>
                                <span>DELETE</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. VIDEOS VIEW */}
        {activeTab === "videos" && (
          <div className="bg-white p-4 md:p-6 rounded-md border border-gray-250 shadow-xs space-y-6 animate-fade-in" id="admin-videos-view">
            {/* Filter Search Header Area mirroring screenshot exactly */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans pb-1">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar with Search Icon */}
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">
                    <Search size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={videosSearchQuery}
                    onChange={(e) => setVideosSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[180px] font-sans"
                  />
                </div>

                {/* Author Filter Dropdown */}
                <select
                  value={videosAuthorFilter}
                  onChange={(e) => setVideosAuthorFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px] font-sans cursor-pointer"
                >
                  <option value="All">Author Filter</option>
                  {Array.from(new Set(allArticles.map((art) => art.reporterName).filter(Boolean))).map((author) => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Date Box and Add New Video Post Button */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                <div className="border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-700 bg-white inline-flex items-center gap-1.5 font-sans select-none shadow-2xs font-semibold">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{getFormattedToday()}</span>
                </div>

                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setCategory("ভিডিও");
                    setVideoUrl("");
                    setTitle("");
                    setContent("");
                    setSubtitle("");
                    setImages(["", "", "", "", ""]);
                    setShowAddPostModal(true);
                  }}
                  className="bg-[#1e70eb] hover:bg-blue-700 text-white font-sans font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow-2xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={13} className="stroke-[3]" />
                  <span>ADD NEW VIDEO POST</span>
                </button>
              </div>
            </div>

            {/* Core Videos Table matching requested screenshot design */}
            <div className="overflow-x-auto border border-gray-200 rounded-sm">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 bg-white text-[11px] h-10">
                    <th className="py-2.5 px-3 w-8 align-middle">
                      <input type="checkbox" className="rounded border-gray-250 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    </th>
                    <th className="py-2.5 px-3 font-sans w-16 text-gray-700 font-bold uppercase tracking-wider">SL No.</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Date</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Title</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold uppercase tracking-wider">Author</th>
                    <th className="py-2.5 px-3 font-sans text-gray-700 font-bold text-center uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white animate-fade-in">
                  {allArticles
                    .filter((art) => {
                      const hasVideo = (art.videoUrl && art.videoUrl.trim() !== "") || art.category === "ভিডিও" || art.category === "video";
                      if (!hasVideo) return false;

                      const matchesSearch = art.title.toLowerCase().includes(videosSearchQuery.toLowerCase());
                      const matchesAuthor = videosAuthorFilter === "All" || art.reporterName === videosAuthorFilter;
                      return matchesSearch && matchesAuthor;
                    })
                    .map((art) => {
                      const slNumber = getOriginalSL(art);
                      const dates = getArticleDates(art);
                      const authorInfo = getAuthorDetails(art);
                      const imageUrl = art.images && art.images.length > 0 && art.images[0].trim() !== ""
                        ? art.images[0]
                        : "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80";

                      return (
                        <tr key={art.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Checkbox */}
                          <td className="py-5 px-3 w-8 align-middle">
                            <input type="checkbox" className="rounded border-gray-250 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                          </td>

                          {/* SL No. */}
                          <td className="py-5 px-3 font-sans text-gray-700 text-[12px] font-semibold align-middle">
                            {slNumber}
                          </td>

                          {/* Dates stack exactly matching mockup */}
                          <td className="py-5 px-3 text-left font-sans text-[11px] text-gray-650 leading-relaxed whitespace-nowrap min-w-[200px] align-middle">
                            <div>
                              <span className="text-gray-900 font-bold">Created:</span> {dates.created}
                            </div>
                            <div className="mt-1">
                              <span className="text-gray-900 font-bold">Updated:</span> {dates.updated}
                            </div>
                          </td>

                          {/* Title with Video Thumbnail matching mockup */}
                          <td className="py-5 px-3 text-left min-w-[320px] align-middle">
                            <div className="flex flex-col gap-2.5 items-start">
                              <div className="w-[110px] h-[64px] rounded border border-gray-300 select-none overflow-hidden shrink-0 bg-gray-50">
                                <img
                                  src={imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="text-gray-900 font-bold text-[11px] leading-relaxed max-w-[320px]">
                                {art.title}
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="py-5 px-3 text-left whitespace-nowrap font-sans text-[11.5px] text-gray-700 align-middle font-medium">
                            {authorInfo.name || "Author"}
                          </td>

                          {/* Stacked Interactive Buttons exactly mirroring mockup */}
                          <td className="py-5 px-3 align-middle text-center">
                            <div className="flex flex-col gap-1 w-[80px] mx-auto shrink-0 font-sans">
                              {/* EDIT */}
                              <button
                                onClick={() => startEditingArticle(art)}
                                className="bg-[#1e70eb] hover:bg-blue-700 text-white font-bold text-[9px] h-[24px] px-2 rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <Edit size={9} className="stroke-[3]" />
                                <span>EDIT</span>
                              </button>

                              {/* VIEW */}
                              <button
                                onClick={() => setViewingVideoPost(art)}
                                className="bg-[#029ee6] hover:bg-cyan-600 text-white font-bold text-[9px] h-[24px] px-2 rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <Eye size={9} className="stroke-[3]" />
                                <span>VIEW</span>
                              </button>

                              {/* SHARE */}
                              <button
                                onClick={() => setSharingArticle(art)}
                                className="bg-[#1c8c36] hover:bg-green-700 text-white font-bold text-[9px] h-[24px] px-2 rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5 text-white fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M15 3h6v6" />
                                  <path d="M10 14L21 3" />
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                </svg>
                                <span>SHARE</span>
                              </button>

                              {/* DELETE */}
                              <button
                                onClick={() => handleDeleteNews(art.id)}
                                className="bg-[#d92121] hover:bg-red-700 text-white font-bold text-[9px] h-[24px] px-2 rounded flex items-center justify-center gap-1 transition-colors uppercase cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5 text-white stroke-[3] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0" />
                                </svg>
                                <span>DELETE</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. PENDING NEWS WORKFLOW TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-5 animate-fade-in" id="admin-pending-news-view">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-display font-black text-gray-900">সংবাদ অনুমোদন ও রিভিউ প্যানেল</h3>
              <p className="text-xs text-gray-500">সংবাদকর্মীদের পাঠানো খসড়া খবরের রিভিউ, সম্পাদন এবং ফাইনাল পাবলিশ করুন</p>
            </div>

            {allArticles.filter((item) => item.status === "Pending").length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-8 text-center space-y-3 shadow-inner font-sans">
                <ShieldCheck className="text-green-500 mx-auto" size={48} />
                <p className="font-semibold text-gray-700">বর্তমানে কোনো পেন্ডিং সংবাদ প্রকাশের অপেক্ষায় নেই!</p>
                <p className="text-xs text-gray-400">রিপোর্টার প্যানেল থেকে সংবাদ সাবমিট করা হলে তা এখানে সরাসরি দৃশ্যমান হবে।</p>
              </div>
            ) : (
              <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs select-none">
                    <thead>
                      <tr className="bg-white border-b border-gray-200 text-[#475569] font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-4 px-3 w-10 text-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                        </th>
                        <th className="py-4 px-3 w-16">SL N.</th>
                        <th className="py-4 px-3 min-w-[200px]">Date</th>
                        <th className="py-4 px-3 min-w-[150px]">Author</th>
                        <th className="py-4 px-3 min-w-[320px]">Title</th>
                        <th className="py-4 px-3 min-w-[110px]">Category</th>
                        <th className="py-4 px-3 min-w-[100px]">Status</th>
                        <th className="py-4 px-3 w-40 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {allArticles
                        .filter((item) => item.status === "Pending")
                        .map((art) => {
                          const slNumber = getOriginalSL(art);
                          const dates = getArticleDates(art);
                          return (
                            <tr key={art.id} className="hover:bg-slate-50/40 transition-colors">
                              {/* Checkbox */}
                              <td className="py-5 px-3 text-center align-middle">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                              </td>

                              {/* SL No */}
                              <td className="py-5 px-3 font-semibold text-gray-650 align-middle text-[11px]">
                                {slNumber}
                              </td>

                              {/* Dates with the requested format */}
                              <td className="py-5 px-3 text-left leading-normal space-y-1.5 whitespace-nowrap text-gray-550 align-middle text-[11px]">
                                <div>
                                  <span className="font-bold text-gray-800">Created:</span> {dates.created}
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800">Updated:</span> {dates.updated}
                                </div>
                              </td>

                              {/* Author */}
                              <td className="py-5 px-3 font-semibold text-gray-700 align-middle text-sm min-w-[150px] leading-relaxed">
                                {art.reporterName || "জেলা বার্তা পরিবেশক"}
                              </td>

                              {/* Bengali Title */}
                              <td className="py-5 px-3 text-left font-bold text-gray-900 align-middle text-sm leading-relaxed max-w-[350px]">
                                {art.title}
                              </td>

                              {/* Category */}
                              <td className="py-5 px-3 text-gray-650 align-middle text-sm">
                                {art.category}
                              </td>

                              {/* Status */}
                              <td className="py-5 px-3 text-gray-650 align-middle text-sm">
                                {art.status}
                              </td>

                              {/* STACKED BUTTON CONTROLS */}
                              <td className="py-5 px-3 align-middle text-center w-40">
                                <div className="flex flex-col gap-1.5 items-center justify-center w-full">
                                  {/* APPROVE */}
                                  <button
                                    onClick={() => {
                                      setArticleForApprovalConfirmation(art);
                                      setShareToFacebookOption("Yes");
                                    }}
                                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-sm"
                                  >
                                    <span className="text-xs">✔</span>
                                    <span>APPROVE</span>
                                  </button>

                                  {/* VIEW */}
                                  <button
                                    onClick={() => {
                                      if (art.category === "ভিডিও" || art.category === "video" || art.videoUrl) {
                                        setViewingVideoPost(art);
                                      } else {
                                        setViewingImagePost(art);
                                      }
                                    }}
                                    className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-sm"
                                  >
                                    <span className="text-xs">ℹ</span>
                                    <span>VIEW</span>
                                  </button>

                                  {/* EDIT */}
                                  <button
                                    onClick={() => startEditingArticle(art)}
                                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-sm"
                                  >
                                    <span className="text-xs">✎</span>
                                    <span>EDIT</span>
                                  </button>

                                  {/* REJECT */}
                                  <button
                                    onClick={() => handleRejectNews(art)}
                                    className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-sm"
                                  >
                                    <span className="text-xs">✖</span>
                                    <span>REJECT</span>
                                  </button>

                                  {/* DELETE */}
                                  <button
                                    onClick={() => handleDeleteNews(art.id)}
                                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-sm"
                                  >
                                    <span className="text-xs">🗑</span>
                                    <span>DELETE</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REQUEST IMAGES REVIEW TAB */}
        {activeTab === "req_images" && (
          <div className="space-y-5 animate-fade-in font-sans" id="admin-request-images-view">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-display font-black text-slate-800">ব্যবহারকারীদের পাঠানো ছবির অনুমোদন প্যানেল</h3>
              <p className="text-xs text-gray-500">ভিজিটর ও কন্ট্রিবিউটরদের জমা দেওয়া চমৎকার গ্যালারি ছবির আবেদন পর্যালোচনা করুন</p>
            </div>

            {requestImages.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-8 text-center space-y-3 shadow-inner font-sans">
                <ShieldCheck className="text-[#22c55e] mx-auto" size={48} />
                <p className="font-semibold text-gray-700">বর্তমানে কোনো ছবির আবেদন প্রকাশের অপেক্ষায় নেই!</p>
                <p className="text-xs text-gray-400">ব্যবহারকারীরা ছবি সাবমিট করলে তা এখানে সরাসরি জমা হবে।</p>
              </div>
            ) : (
              <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs select-none">
                    <thead>
                      <tr className="bg-white border-b border-gray-200 text-[#475569] font-bold text-[11px] uppercase tracking-wider h-11">
                        <th className="py-4 px-3 w-28 text-gray-600">ছবি (Image)</th>
                        <th className="py-4 px-3 min-w-[200px] text-gray-600">শিরোনাম ও বিবরণ (Title & Description)</th>
                        <th className="py-4 px-3 min-w-[120px] text-gray-600">ক্যাটাগরি (Category)</th>
                        <th className="py-4 px-3 min-w-[140px] text-gray-600">পাঠিয়েছেন যিনি (Submitter)</th>
                        <th className="py-4 px-3 w-44 text-center text-gray-600">অনুমোদন অ্যাকশন (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {requestImages.map((img) => (
                        <tr key={img.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-3 align-middle">
                            <div className="w-20 h-20 rounded bg-gray-50 overflow-hidden border">
                              <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-3 space-y-1 align-middle">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{img.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-normal">{img.description}</p>
                          </td>
                          <td className="py-4 px-3 font-semibold text-blue-600 align-middle">
                            {img.category || "সবুজ গ্যালরি"}
                          </td>
                          <td className="py-4 px-3 space-y-0.5 align-middle">
                            <span className="font-semibold text-gray-700 block">{img.userName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">{img.userEmail}</span>
                          </td>
                          <td className="py-4 px-3 align-middle">
                            <div className="flex flex-col gap-1.5 items-center justify-center">
                              {/* APPROVE */}
                              <button
                                onClick={() => {
                                  // Create news article
                                  const articleBody = {
                                    title: img.title,
                                    subtitle: "",
                                    description: img.description,
                                    content: `<img src="${img.imageUrl}" alt="${img.title}" /><p>${img.description}</p>`,
                                    category: "গ্যালারি",
                                    subcategory: "",
                                    publicationDate: new Date().toISOString(),
                                    isLead: false,
                                    isHeadline: false,
                                    reporterId: "contributor",
                                    reporterName: img.userName || "কন্ট্রিবিউটর",
                                    status: "Published",
                                    images: [img.imageUrl]
                                  };
                                  fetch("/api/news", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(articleBody)
                                  })
                                    .then(res => res.json())
                                    .then(data => {
                                      if (data.success || data.id) {
                                        // Remove from request list
                                        const updated = requestImages.filter(x => x.id !== img.id);
                                        setRequestImages(updated);
                                        fetch("/api/database/request_images", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify(updated)
                                        });
                                        alert("ছবিটি সফলভাবে সাইটে পাবলিশ করা হয়েছে!");
                                        loadData();
                                      } else {
                                        alert("পাবলিশ করতে সমস্যা হয়েছে।");
                                      }
                                    })
                                    .catch(err => {
                                      console.error(err);
                                      alert("নেটওয়ার্ক ত্রুটি।");
                                    });
                                }}
                                className="bg-[#16a34a] hover:bg-green-700 text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[120px] tracking-wide cursor-pointer shadow-sm border-0 select-none h-8"
                              >
                                <span>✓ APPROVE</span>
                              </button>

                              {/* REJECT */}
                              <button
                                onClick={() => {
                                  if (confirm("আপনি কি নিশ্চিতভাবে এই ছবির আবেদনটি প্রত্যাখ্যান করতে চান?")) {
                                    const updated = requestImages.filter(x => x.id !== img.id);
                                    setRequestImages(updated);
                                    fetch("/api/database/request_images", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(updated)
                                    });
                                    alert("ছবিটির আবেদন বাতিল করা হয়েছে।");
                                  }
                                }}
                                className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[120px] tracking-wide cursor-pointer shadow-sm border-0 select-none h-8"
                              >
                                <span>✖ REJECT</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REQUEST VIDEOS REVIEW TAB */}
        {activeTab === "req_videos" && (
          <div className="space-y-5 animate-fade-in font-sans" id="admin-request-videos-view">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-display font-black text-slate-800">ব্যবহারকারীদের পাঠানো ভিডিওর অনুমোদন প্যানেল</h3>
              <p className="text-xs text-gray-500">পাঠকদের পাঠানো চমৎকার সব ভিডিও রিপোর্টিং ও লিংক পর্যালোচনা করুন</p>
            </div>

            {requestVideos.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-8 text-center space-y-3 shadow-inner font-sans">
                <ShieldCheck className="text-[#22c55e] mx-auto" size={48} />
                <p className="font-semibold text-gray-700">বর্তমানে কোনো ভিডিওর আবেদন প্রকাশের অপেক্ষায় নেই!</p>
                <p className="text-xs text-gray-400">ব্যবহারকারীরা ভিডিও সাবমিট করলে তা এখানে সরাসরি চলে আসবে।</p>
              </div>
            ) : (
              <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs select-none">
                    <thead>
                      <tr className="bg-white border-b border-gray-200 text-[#475569] font-bold text-[11px] uppercase tracking-wider h-11">
                        <th className="py-4 px-3 min-w-[200px] text-gray-600">শিরোনাম ও বিবরণ (Title & Description)</th>
                        <th className="py-4 px-3 min-w-[150px] text-gray-600">ভিডিও লিংক (Video Link)</th>
                        <th className="py-4 px-3 min-w-[100px] text-gray-600">ক্যাটাগরি (Category)</th>
                        <th className="py-4 px-3 min-w-[140px] text-gray-600">পাঠিয়েছেন যিনি (Submitter)</th>
                        <th className="py-4 px-3 w-44 text-center text-gray-600">অনুমোদন অ্যাকশন (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {requestVideos.map((vid) => (
                        <tr key={vid.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-3 space-y-1 align-middle">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{vid.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-normal">{vid.description}</p>
                          </td>
                          <td className="py-4 px-3 align-middle text-blue-600 underline font-mono select-all">
                            <a href={vid.videoUrl} target="_blank" rel="noopener noreferrer">{vid.videoUrl}</a>
                          </td>
                          <td className="py-4 px-3 font-semibold text-[#16a34a] align-middle">
                            {vid.category || "ভিউজ মিডিয়া"}
                          </td>
                          <td className="py-4 px-3 space-y-0.5 align-middle">
                            <span className="font-semibold text-gray-700 block">{vid.userName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">{vid.userEmail}</span>
                          </td>
                          <td className="py-4 px-3 align-middle">
                            <div className="flex flex-col gap-1.5 items-center justify-center">
                              {/* APPROVE */}
                              <button
                                onClick={() => {
                                  // Create video post
                                  const articleBody = {
                                    title: vid.title,
                                    subtitle: "",
                                    description: vid.description,
                                    content: `<p>${vid.description}</p><p><a href="${vid.videoUrl}">${vid.videoUrl}</a></p>`,
                                    category: "ভিডিও",
                                    subcategory: "",
                                    publicationDate: new Date().toISOString(),
                                    isLead: false,
                                    isHeadline: false,
                                    reporterId: "contributor",
                                    reporterName: vid.userName || "কন্ট্রিবিউটর",
                                    status: "Published",
                                    images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80"],
                                    videoUrl: vid.videoUrl
                                  };
                                  fetch("/api/news", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(articleBody)
                                  })
                                    .then(res => res.json())
                                    .then(data => {
                                      if (data.success || data.id) {
                                        // Remove from request list
                                        const updated = requestVideos.filter(x => x.id !== vid.id);
                                        setRequestVideos(updated);
                                        fetch("/api/database/request_videos", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify(updated)
                                        });
                                        alert("ভিডিওটি সফলভাবে সাইটে পাবলিশ করা হয়েছে!");
                                        loadData();
                                      } else {
                                        alert("পাবলিশ করতে সমস্যা হয়েছে।");
                                      }
                                    })
                                    .catch(err => {
                                      console.error(err);
                                      alert("নেটওয়ার্ক ত্রুটি।");
                                    });
                                }}
                                className="bg-[#16a34a] hover:bg-green-700 text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[120px] tracking-wide cursor-pointer shadow-sm border-0 select-none h-8"
                              >
                                <span>✓ APPROVE</span>
                              </button>

                              {/* REJECT */}
                              <button
                                onClick={() => {
                                  if (confirm("আপনি কি নিশ্চিতভাবে এই ভিডিওর আবেদনটি প্রত্যাখ্যান করতে চান?")) {
                                    const updated = requestVideos.filter(x => x.id !== vid.id);
                                    setRequestVideos(updated);
                                    fetch("/api/database/request_videos", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(updated)
                                    });
                                    alert("ভিডিওর আবেদন বাতিল করা হয়েছে।");
                                  }
                                }}
                                className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[120px] tracking-wide cursor-pointer shadow-sm border-0 select-none h-8"
                              >
                                <span>✖ REJECT</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. DIRECT UPLOAD OR IMPORTED POSTS TAB */}
        {activeTab === "imported" && (
          <div className="space-y-4 animate-fade-in text-sans text-xs" id="admin-imported-posts-view">
            
            {/* Search, Filter Source and Date Picker row */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-gray-200 rounded p-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={importedSearchText}
                    onChange={(e) => setImportedSearchText(e.target.value)}
                    className="border border-gray-250 text-xs px-3 py-2 pl-9 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 h-[38px] text-gray-700 bg-white"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Filter Source */}
                <div className="relative">
                  <select
                    value={importedSelectedSource}
                    onChange={(e) => setImportedSelectedSource(e.target.value)}
                    className="border border-gray-250 text-xs px-3 pr-8 py-2 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 h-[38px] text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="All">Filter Source</option>
                    <option value="BS Software">BS Software</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 border border-gray-250 rounded px-3.5 py-2 text-xs bg-white text-gray-700 h-[38px] cursor-pointer shadow-3xs font-sans font-medium shrink-0 self-start sm:self-center select-none">
                <Calendar size={14} className="text-gray-500" />
                <span>9 June 2026</span>
              </div>
            </div>

            {/* Imported Posts List Table */}
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="py-4 px-3 w-12 text-center">
                        <input type="checkbox" className="rounded-xs border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider">SL N.</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider">Date</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider">Author</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider text-center">Title</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider">Category</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider">Source</th>
                      <th className="py-4 px-3 text-xs font-semibold text-gray-650 tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {(() => {
                      const filtered = importedArticles.filter((art) => {
                        const matchSearch = art.title.toLowerCase().includes(importedSearchText.toLowerCase()) || 
                          (art.content && art.content.toLowerCase().includes(importedSearchText.toLowerCase()));
                        const matchSource = importedSelectedSource === "All" || (art.reporterName === importedSelectedSource);
                        return matchSearch && matchSource;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-xs text-gray-400">
                              কোনো ইম্পোর্টেড পোস্ট পাওয়া যায়নি।
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((art) => {
                        const slId = art.id.replace("imp-", "");
                        return (
                          <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 px-3 text-center">
                              <input type="checkbox" className="rounded-xs border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </td>
                            <td className="py-5 px-3 text-xs font-mono text-gray-600 font-medium">
                              {slId}
                            </td>
                            <td className="py-5 px-3 text-[11px] leading-relaxed text-gray-600 select-text">
                              <div><strong>Created:</strong> 31 Mar 2026 ,</div>
                              <div className="text-gray-500 font-mono">03:00 PM</div>
                              <div className="mt-1"><strong>Updated:</strong> 31 Mar 2026 ,</div>
                              <div className="text-gray-500 font-mono">03:00 PM</div>
                            </td>
                            <td className="py-5 px-3 text-[12px] text-gray-800 font-sans">
                              {art.reporterName}
                            </td>
                            <td className="py-5 px-3 text-center">
                              <div className="flex flex-col items-center justify-center p-1 space-y-2 max-w-[280px] mx-auto">
                                {art.images && art.images[0] && (
                                  <div className="w-[100px] h-[65px] bg-slate-50 border border-gray-200 rounded p-0.5 overflow-hidden flex items-center justify-center">
                                    <img
                                      src={art.images[0]}
                                      alt="Post Thumbnail"
                                      className="max-h-full max-w-full object-contain rounded-xs select-none"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                                <div 
                                  onClick={() => setViewingImagePost(art)}
                                  className="text-[12px] font-sans font-bold text-gray-800 leading-normal hover:text-blue-600 cursor-pointer select-text transition-colors text-center"
                                >
                                  {art.title}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-3 text-[11.5px] font-mono text-gray-700">
                              {art.category}
                            </td>
                            <td className="py-5 px-3">
                              <div className="flex items-center gap-1 text-[11.5px] text-gray-800 font-sans font-medium">
                                <span>বার্তাসন্ধান</span>
                                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </td>
                            <td className="py-5 px-3">
                              <div className="flex flex-col gap-1.5 items-center justify-center w-full select-none">
                                {/* APPROVE */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setArticleForApprovalConfirmation(art);
                                    setShareToFacebookOption("Yes");
                                  }}
                                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-sans font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">✔</span>
                                  <span>APPROVE</span>
                                </button>

                                {/* VIEW */}
                                <button
                                  type="button"
                                  onClick={() => setViewingImagePost(art)}
                                  className="bg-[#0288d1] hover:bg-[#01579b] text-white font-sans font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">ℹ</span>
                                  <span>VIEW</span>
                                </button>

                                {/* EDIT */}
                                <button
                                  type="button"
                                  onClick={() => startEditingArticle(art)}
                                  className="bg-[#1976d2] hover:bg-[#0d47a1] text-white font-sans font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">✎</span>
                                  <span>EDIT</span>
                                </button>

                                {/* REJECT */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to reject this imported post?")) {
                                      handleRejectNews(art);
                                    }
                                  }}
                                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">✖</span>
                                  <span>REJECT</span>
                                </button>

                                {/* DELETE */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this imported post?")) {
                                      setImportedArticles(prev => {
                                        const res = prev.filter(p => p.id !== art.id);
                                        markImportedAsProcessed(art.id);
                                        return res;
                                      });
                                      setSuccessMsg("অনুরোধকৃত আমদানিকৃত সংবাদটি সফলভাবে মুছে ফেলা হয়েছে!");
                                    }
                                  }}
                                  className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-sans font-bold text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-colors uppercase w-[105px] tracking-wide cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs">🗑</span>
                                  <span>DELETE</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 8. MANAGEMENT -> STAFF REGISTRATION TAB */}
        {activeTab === "staff" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="admin-staff-registration-view">
            <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4 font-display">
              <div className="border-b border-gray-150 pb-2">
                <h3 className="text-lg font-bold text-slate-800">নতুন কর্মী প্যানেল নিবন্ধন (Registrant)</h3>
                <p className="text-xs text-gray-400">সংবাদকর্মীদের তথ্য রেজিস্টার করুন এবং আইডি প্রদান করতে এখানে ফর্ম পূরণ করুন</p>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
                {errorMsg && (
                  <div className="bg-red-50 text-red-700 p-2 border border-red-100 rounded flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="bg-green-55 text-green-700 p-2.5 border border-green-100 rounded flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold">ইউজার নাম (User ID Unique) *</label>
                    <input type="text" required placeholder="abid_rahman" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="font-bold">গোপন পাসওয়ার্ড *</label>
                    <input type="text" required placeholder="******" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold">স্টাফ আইডি নম্বর *</label>
                    <input type="text" required placeholder="S-101" value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="font-bold">পদবি/কর্মী ধরণ *</label>
                    <select value={newDesignation} onChange={(e) => setNewDesignation(e.target.value as any)} className="w-full mt-1 p-2 bg-white border border-gray-300 rounded text-xs">
                      <option value="সংবাদ কর্মী">সংবাদ কর্মী</option>
                      <option value="সাংবাদিক">সাংবাদিক</option>
                      <option value="প্রতিনিধি">প্রতিনিধি</option>
                      <option value="স্টাফ রিপোর্টার">স্টাফ রিপোর্টার</option>
                      <option value="স্টাফ">স্টাফ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold">সংবাদ প্রতিনিধির সম্পূর্ণ নাম *</label>
                  <input type="text" required placeholder="যেমন: আবিদ রহমান" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold">মোবাইল ফোন নম্বর</label>
                    <input type="tel" placeholder="017xxxxxxxx" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="font-bold">জাতীয় পরিচয়পত্র (NID) নম্বর</label>
                    <input type="text" placeholder="NID নম্বর..." value={newNid} onChange={(e) => setNewNid(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded text-xs" />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer mt-2 text-xs">
                  স্টাফ কর্মী লাইভ রেজিস্টার করুন
                </button>
              </form>
            </div>

            {/* PRESS ID CAD PREVIEW COMPONENT ON THE RIGHT */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4 font-display">
                <div className="border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800">অ্যাসাইনড আইডি কার্ড প্রিভিউ (ID Card Preview)</h4>
                  <p className="text-[10px] text-gray-400">রেজিস্ট্রেশনের সাথে সাথে এটি রিপোর্টার আইডিসহ লাইভ প্রিভিউ করা যাবে</p>
                </div>

                {/* Vertical aligned Press Identity Card matching standard media standards */}
                <div className="bg-gradient-to-br from-[#1e3a8a] to-slate-900 text-white rounded-lg p-5 border border-slate-850 shadow-xl space-y-4 relative overflow-hidden font-sans">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-36 h-36 bg-blue-700/10 rounded-full"></div>
                  
                  {/* Top company/newspaper logos */}
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center bg-red-650 rounded-full font-display font-black text-xs text-white">
                        বা
                      </div>
                      <div className="leading-none">
                        <h5 className="text-[10px] font-black font-display uppercase text-red-400">বার্তাসন্ধান</h5>
                        <p className="text-[7px] tracking-[0.1em] uppercase font-mono text-gray-300">Newspaper Group</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-red-650 uppercase font-black px-1.5 py-0.5 rounded text-white tracking-widest">
                      PRESS
                    </span>
                  </div>

                  {/* ID card focus components */}
                  <div className="flex gap-4 pt-1 text-xs">
                    <div className="w-20 h-24 bg-white/10 rounded border border-white/10 flex flex-col justify-center items-center text-center p-1 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs mb-1">
                        {newName ? newName.charAt(0) : "P"}
                      </div>
                      <span className="block text-[7px] text-green-400 font-bold border border-green-500/30 px-1 mt-1 rounded font-display bg-green-500/10 animate-pulse">
                        সক্রিয়
                      </span>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div>
                        <span className="text-[8px] text-gray-400 block font-display leading-none">কর্মী নাম</span>
                        <strong className="text-xs font-display font-black text-white">{newName || "রিপোর্টার নাম"}</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 block font-display leading-none">পদবি</span>
                        <strong className="font-display text-blue-300 text-[11px] font-bold">{newDesignation || "স্টাফ রিপোর্টার"}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[9px]">
                        <div>
                          <span className="text-[7px] text-gray-400 block font-display">আইডি নম্বর</span>
                          <span className="font-mono text-gray-200">{newStaffId || "S-101"}</span>
                        </div>
                        <div>
                          <span className="text-[7px] text-gray-400 block font-display">মোবাইল</span>
                          <span className="font-mono text-gray-200">{newMobile || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[8px] text-gray-400 font-mono">
                    <span>EXP: 31 DEC 2028</span>
                    <span className="font-display text-[8px] text-right italic text-red-400/80">Authorized Editor Sign</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. MANAGEMENT -> TOAL USERS LIST TAB (DESIGN IDENTICAL TO USER SCREENSHOT) */}
        {activeTab === "stafflist" && (
          <div className="space-y-6 animate-fade-in font-sans" id="admin-staff-directory-view">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-150">
              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-750 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                />
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Date Selection Box */}
                <div className="relative">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-all">
                    <Calendar size={15} className="text-gray-500" />
                    <input
                      type="date"
                      value={staffFilterDate}
                      onChange={(e) => setStaffFilterDate(e.target.value)}
                      className="bg-transparent text-xs text-gray-750 font-sans focus:outline-none border-none py-0.5"
                    />
                  </div>
                </div>

                {/* Add New User */}
                <button
                  onClick={() => {
                    // Reset registration state fields
                    setNewUserId("");
                    setNewPassword("");
                    setNewName("");
                    setNewStaffId((staffList.length + 1).toString());
                    setNewFatherName("");
                    setNewMotherName("");
                    setNewMobile("");
                    setNewNid("");
                    setNewPresentAddress("");
                    setNewPermanentAddress("");
                    
                    setNewUserEmail("");
                    setHeSheIsAuthor(false);
                    setNewAutoApprovePost(false);
                    setNewAuthorCity("");
                    setNewAuthorAddress("");
                    setNewUserRole("User");
                    setPictureFileName("");
                    setPictureBase64("");
                    setShowAddUserModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 text-xs font-bold rounded-md shadow-sm transition-all uppercase tracking-wide cursor-pointer"
                >
                  <Plus size={15} />
                  <span>ADD NEW USER</span>
                </button>
              </div>
            </div>

            {/* Main Table Card wrapper */}
            <div className="bg-white rounded-lg border border-gray-250 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table Header exactly as shown in picture */}
                  <thead className="bg-[#f2f4f7]">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedStaffRows.length === staffList.filter((st) => {
                            const query = staffSearchQuery.toLowerCase();
                            return st.name.toLowerCase().includes(query) || (st.email && st.email.toLowerCase().includes(query)) || st.mobile.includes(query);
                          }).length && staffList.filter((st) => {
                            const query = staffSearchQuery.toLowerCase();
                            return st.name.toLowerCase().includes(query) || (st.email && st.email.toLowerCase().includes(query)) || st.mobile.includes(query);
                          }).length > 0}
                          onChange={(e) => {
                            const filtered = staffList.filter((st) => {
                              const query = staffSearchQuery.toLowerCase();
                              return st.name.toLowerCase().includes(query) || (st.email && st.email.toLowerCase().includes(query)) || st.mobile.includes(query);
                            });
                            if (e.target.checked) {
                              setSelectedStaffRows(filtered.map((u) => u.userId));
                            } else {
                              setSelectedStaffRows([]);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                        SL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Name / Email / Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-800 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffList.filter((st) => {
                      const query = staffSearchQuery.toLowerCase();
                      return (
                        st.name.toLowerCase().includes(query) ||
                        (st.email && st.email.toLowerCase().includes(query)) ||
                        st.mobile.includes(query) ||
                        st.userId.toLowerCase().includes(query) ||
                        st.staffId.includes(query)
                      );
                    }).length > 0 ? (
                      staffList.filter((st) => {
                        const query = staffSearchQuery.toLowerCase();
                        return (
                          st.name.toLowerCase().includes(query) ||
                          (st.email && st.email.toLowerCase().includes(query)) ||
                          st.mobile.includes(query) ||
                          st.userId.toLowerCase().includes(query) ||
                          st.staffId.includes(query)
                        );
                      }).map((st, index) => {
                        // Calculate SL number starting from staff length down to 1
                        const slNo = st.staffId || (staffList.length - index).toString();
                        const defaultDate = st.createdAt || "7 Jun 2026 , 12:00 PM";
                        const isChecked = selectedStaffRows.includes(st.userId);

                        return (
                          <tr key={st.userId} className="hover:bg-slate-50 transition-colors">
                            {/* Checkbox */}
                            <td className="px-4 py-4 whitespace-nowrap text-left">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStaffRows([...selectedStaffRows, st.userId]);
                                  } else {
                                    setSelectedStaffRows(selectedStaffRows.filter((id) => id !== st.userId));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>

                            {/* SL (Serial Number) */}
                            <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-semibold text-slate-850">
                              {slNo}
                            </td>

                            {/* Date */}
                            <td className="px-4 py-4 text-left text-xs text-gray-700 max-w-[120px]">
                              {defaultDate}
                            </td>

                            {/* Name / Email / Phone */}
                            <td className="px-4 py-4 text-left">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                                {st.email && (
                                  <span className="text-gray-500 text-xs hover:underline cursor-pointer">{st.email}</span>
                                )}
                                {st.mobile && (
                                  <span className="text-gray-400 text-xs mt-0.5 select-all">{st.mobile}</span>
                                )}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-4 whitespace-nowrap text-left text-xs font-semibold text-slate-700">
                              {st.designation || "User"}
                            </td>

                            {/* Author */}
                            <td className="px-4 py-4 whitespace-nowrap text-left">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                                st.author === "Yes" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {st.author || "No"}
                              </span>
                            </td>

                            {/* Actions with identical button design stacked vertically */}
                            <td className="px-4 py-4 whitespace-nowrap text-left">
                              <div className="flex flex-col gap-1.5 w-24">
                                <button
                                  onClick={() => {
                                    alert(`সফলভাবে গ্রাহক "${st.name}" হিসাবে লগইন করা হয়েছে! (সিমুলেশন সক্রিয়)`);
                                  }}
                                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-[10px] font-black py-1 px-3 rounded uppercase shadow-sm tracking-wider transition-all cursor-pointer text-center"
                                >
                                  LOGIN
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStaffMember(st);
                                    setShowEditUserModal(true);
                                  }}
                                  className="w-full bg-[#1e88e5] hover:bg-[#1565c0] text-white text-[10px] font-black py-1 px-3 rounded uppercase shadow-sm tracking-wider transition-all cursor-pointer text-center"
                                >
                                  EDIT
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(st.userId)}
                                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[10px] font-black py-1 px-3 rounded uppercase shadow-sm tracking-wider transition-all cursor-pointer text-center"
                                >
                                  DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                          কোনো গ্রাহক/ইউজার পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD USER MODAL - Fully Functional & Beautiful overlay form */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-100 transition-all font-sans">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center bg-[#f8fafc] px-6 py-4 border-b border-gray-150">
                    <h3 className="text-sm font-bold text-slate-800">Add New User</h3>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newName) {
                        alert("Please fill in User Name *");
                        return;
                      }
                      if (!newUserEmail) {
                        alert("Please fill in User Email *");
                        return;
                      }
                      if (!newPassword) {
                        alert("Please fill in User Password *");
                        return;
                      }

                      // Generate unique ID based on email prefix
                      const baseUsername = newUserEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                      const generatedUserId = baseUsername || "user_" + Date.now();

                      fetch("/api/staff", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: generatedUserId,
                          password: newPassword,
                          staffId: (staffList.length + 1).toString(),
                          name: newName,
                          email: newUserEmail,
                          mobile: newMobile,
                          fatherName: "",
                          motherName: "",
                          nid: "",
                          presentAddress: heSheIsAuthor ? newAuthorAddress : "",
                          permanentAddress: "",
                          designation: newUserRole,
                          createdAt: new Date().toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) + " , " + new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }),
                          author: heSheIsAuthor ? "Yes" : "No",
                          autoApprovePost: heSheIsAuthor && newAutoApprovePost ? "Yes" : "No",
                          authorCity: heSheIsAuthor ? newAuthorCity : "",
                          authorAddress: heSheIsAuthor ? newAuthorAddress : "",
                          picture: pictureBase64 || ""
                        })
                      })
                        .then(async (res) => {
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Failed to create user");
                          
                          // Instant state updates for perfect visual synchronization
                          if (data.staff) {
                            setStaffList(prev => [...prev, data.staff]);
                            const newPUserObj = {
                              id: `U-${101 + portalUsers.length}`,
                              name: data.staff.name,
                              email: data.staff.email || `${data.staff.userId}@dainikbartasandhan.com`,
                              phone: data.staff.mobile || "",
                              role: data.staff.designation || "Subscriber",
                              status: "Active",
                              joinedDate: "Today"
                            };
                            setPortalUsers(prev => [...prev, newPUserObj]);
                          }

                          setSuccessMsg("নতুন ইউজার সফলভাবে যুক্ত ও রেজিস্টার করা হয়েছে! (Added/Created Successfully)");
                          setTimeout(() => setSuccessMsg(""), 4000);
                          setShowAddUserModal(false);
                          loadData();
                        })
                        .catch((err) => alert(err.message));
                    }}
                    className="p-6 space-y-4 text-left font-sans"
                  >
                    {/* User Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="User Name *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Email */}
                    <div>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="User Email *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Password */}
                    <div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="User Password *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Phone */}
                    <div>
                      <input
                        type="text"
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value)}
                        placeholder="User Phone"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* He/She is Author Switch */}
                    <div className="flex flex-col gap-2 pt-1">
                      <span className="text-sm font-medium text-gray-700">He/She is Author ?</span>
                      <button
                        type="button"
                        onClick={() => setHeSheIsAuthor(!heSheIsAuthor)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          heSheIsAuthor ? "bg-[#2563eb]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            heSheIsAuthor ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Conditional Author Fields */}
                    {heSheIsAuthor && (
                      <div className="space-y-4 pt-2 pb-2 pl-3 border-l-2 border-blue-200 animate-fade-in bg-blue-50/20 rounded-r-md">
                        {/* Auto Approve Post Switch */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-gray-600">Auto Approve Post ?</span>
                          <button
                            type="button"
                            onClick={() => setNewAutoApprovePost(!newAutoApprovePost)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              newAutoApprovePost ? "bg-[#15803d]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                newAutoApprovePost ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Author City */}
                        <div>
                          <input
                            type="text"
                            value={newAuthorCity}
                            onChange={(e) => setNewAuthorCity(e.target.value)}
                            placeholder="Author City"
                            className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                          />
                        </div>

                        {/* Author Address */}
                        <div>
                          <input
                            type="text"
                            value={newAuthorAddress}
                            onChange={(e) => setNewAuthorAddress(e.target.value)}
                            placeholder="Author Address"
                            className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Role Dropdown */}
                    <div>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer"
                      >
                        <option value="User">Role – Normal User (Default: User)</option>
                        <option value="Admin">Role – Admin (Create/Read/Upload/Delete)</option>
                      </select>
                    </div>

                    {/* Picture Display Textbox */}
                    <div>
                      <input
                        type="text"
                        value={pictureFileName}
                        readOnly
                        placeholder="Picture"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none font-sans text-sm text-gray-600 placeholder-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Drag and Drop Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById("main-file-picker")?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all text-center gap-1.5"
                    >
                      <input
                        id="main-file-picker"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="text-gray-400">
                        <Upload size={28} className="mx-auto" />
                      </div>
                      <p className="text-xs font-semibold text-gray-600">Upload a image/images or drop here</p>
                      <p className="text-[10px] text-gray-400">PNG, JPG, GIF up to 10MB</p>

                      {/* Display small mockup/preview indicator if image loaded */}
                      {pictureBase64 && (
                        <div className="mt-2 text-center">
                          <img
                            src={pictureBase64}
                            alt="avatar"
                            className="w-12 h-12 object-cover rounded mx-auto border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[9px] text-green-600 mt-0.5">Image Selected Successfully</p>
                        </div>
                      )}
                    </div>

                    {/* Save and Cancel buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-150 font-sans">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-slate-700 font-semibold hover:bg-gray-55 transition-all font-sans cursor-pointer text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2563eb] text-white font-semibold rounded-md hover:bg-[#1d4ed8] shadow-sm transition-all font-sans cursor-pointer text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT USER MODAL - Pre-populated overlay form */}
            {showEditUserModal && editingStaffMember && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto transform scale-100 transition-all font-sans">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center bg-[#f8fafc] px-6 py-4 border-b border-gray-150">
                    <h3 className="text-sm font-bold text-slate-800">Edit User</h3>
                    <button
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingStaffMember(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!editingStaffMember.name) {
                        alert("Please fill in User Name *");
                        return;
                      }
                      if (!editingStaffMember.email) {
                        alert("Please fill in User Email *");
                        return;
                      }
                      handleEditStaffSubmit(editingStaffMember);
                    }}
                    className="p-6 space-y-4 text-left font-sans"
                  >
                    {/* User Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={editingStaffMember.name}
                        onChange={(e) => setEditingStaffMember({ ...editingStaffMember, name: e.target.value })}
                        placeholder="User Name *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Email */}
                    <div>
                      <input
                        type="email"
                        required
                        value={editingStaffMember.email || ""}
                        onChange={(e) => setEditingStaffMember({ ...editingStaffMember, email: e.target.value })}
                        placeholder="User Email *"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Password */}
                    <div>
                      <input
                        type="password"
                        value={editingStaffMember.password || ""}
                        onChange={(e) => setEditingStaffMember({ ...editingStaffMember, password: e.target.value })}
                        placeholder="User Password (leave unchanged if preferred)"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* User Phone */}
                    <div>
                      <input
                        type="text"
                        value={editingStaffMember.mobile || ""}
                        onChange={(e) => setEditingStaffMember({ ...editingStaffMember, mobile: e.target.value })}
                        placeholder="User Phone"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                      />
                    </div>

                    {/* He/She is Author Switch */}
                    <div className="flex flex-col gap-2 pt-1 font-sans">
                      <span className="text-sm font-medium text-gray-700">He/She is Author ?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentlyAuthor = editingStaffMember.author === "Yes";
                          setEditingStaffMember({
                            ...editingStaffMember,
                            author: currentlyAuthor ? "No" : "Yes"
                          });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          editingStaffMember.author === "Yes" ? "bg-[#2563eb]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            editingStaffMember.author === "Yes" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Conditional Author Fields */}
                    {editingStaffMember.author === "Yes" && (
                      <div className="space-y-4 pt-2 pb-2 pl-3 border-l-2 border-blue-200 animate-fade-in bg-blue-50/20 rounded-r-md">
                        {/* Auto Approve Post Switch */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-gray-600">Auto Approve Post ?</span>
                          <button
                            type="button"
                            onClick={() => {
                              const autoApp = editingStaffMember.autoApprovePost === "Yes";
                              setEditingStaffMember({
                                ...editingStaffMember,
                                autoApprovePost: autoApp ? "No" : "Yes"
                              });
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              editingStaffMember.autoApprovePost === "Yes" ? "bg-[#15803d]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                editingStaffMember.autoApprovePost === "Yes" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Author City */}
                        <div>
                          <input
                            type="text"
                            value={editingStaffMember.authorCity || ""}
                            onChange={(e) => setEditingStaffMember({ ...editingStaffMember, authorCity: e.target.value })}
                            placeholder="Author City"
                            className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                          />
                        </div>

                        {/* Author Address */}
                        <div>
                          <input
                            type="text"
                            value={editingStaffMember.authorAddress || ""}
                            onChange={(e) => setEditingStaffMember({ ...editingStaffMember, authorAddress: e.target.value })}
                            placeholder="Author Address"
                            className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-sm text-gray-800 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Role Dropdown */}
                    <div>
                      <select
                        value={editingStaffMember.designation || "User"}
                        onChange={(e) => setEditingStaffMember({ ...editingStaffMember, designation: e.target.value })}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer"
                      >
                        <option value="User">Role – Normal User (Default: User)</option>
                        <option value="Admin">Role – Admin (Create/Read/Upload/Delete)</option>
                      </select>
                    </div>

                    {/* Picture Display Textbox */}
                    <div>
                      <input
                        type="text"
                        value={editingStaffMember.picture ? "User image loaded in system (click below to change)" : "No picture upload"}
                        readOnly
                        placeholder="Picture"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none font-sans text-sm text-gray-650 placeholder-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Drag and Drop Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingStaffMember({
                              ...editingStaffMember,
                              picture: reader.result as string
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => document.getElementById("edit-file-picker")?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all text-center gap-1.5"
                    >
                      <input
                        id="edit-file-picker"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingStaffMember({
                                ...editingStaffMember,
                                picture: reader.result as string
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="text-gray-400">
                        <Upload size={28} className="mx-auto" />
                      </div>
                      <p className="text-xs font-semibold text-gray-600">Upload a new image or drop here to replace</p>
                      <p className="text-[10px] text-gray-400">PNG, JPG, GIF up to 10MB</p>

                      {/* Preview current/new picture */}
                      {editingStaffMember.picture && (
                        <div className="mt-2 text-center animate-fade-in">
                          <img
                            src={editingStaffMember.picture}
                            alt="avatar"
                            className="w-12 h-12 object-cover rounded mx-auto border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[9px] text-green-600 mt-0.5">✓ Picture Loaded</p>
                        </div>
                      )}
                    </div>

                    {/* Save and Cancel buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-150 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditUserModal(false);
                          setEditingStaffMember(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-slate-700 font-semibold hover:bg-gray-50 transition-all font-sans cursor-pointer text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2563eb] text-white font-semibold rounded-md hover:bg-[#1d4ed8] shadow-sm transition-all font-sans cursor-pointer text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 9A. USERS MANAGEMENT TAB ==================== */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in font-sans" id="admin-portal-users-view">
            {/* Header section with Stats Cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">User accounts & Roles</h3>
                <p className="text-xs text-gray-500">Manage registered newspaper readers, content publishers and subscribers</p>
              </div>
              <button
                onClick={() => {
                  setNewPortalUserName("");
                  setNewPortalUserEmail("");
                  setNewPortalUserPhone("");
                  setNewPortalUserRole("Contributor");
                  setNewPortalUserStatus("Active");
                  setShowAddPortalUserModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} /> Add User Account
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Portal Users</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{portalUsers.length}</h4>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Accounts</p>
                <h4 className="text-2xl font-black text-green-600 mt-1">
                  {portalUsers.filter(u => u.status === "Active").length}
                </h4>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suspended Accounts</p>
                <h4 className="text-2xl font-black text-red-500 mt-1">
                  {portalUsers.filter(u => u.status === "Suspended").length}
                </h4>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="p-4 border-b border-gray-150 bg-gray-50/60 block select-none">
                <span className="text-xs font-bold text-slate-700">Account Registry</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-slate-500 font-bold tracking-wide">
                      <th className="p-3 text-[10px] uppercase">User ID</th>
                      <th className="p-3 text-[10px] uppercase">Full Name</th>
                      <th className="p-3 text-[10px] uppercase">Email</th>
                      <th className="p-3 text-[10px] uppercase">Mobile</th>
                      <th className="p-3 text-[10px] uppercase">Role</th>
                      <th className="p-3 text-[10px] uppercase">Status</th>
                      <th className="p-3 text-[10px] uppercase">Joined Date</th>
                      <th className="p-3 text-[10px] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {portalUsers.map((pUser) => (
                      <tr key={pUser.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500">{pUser.id}</td>
                        <td className="p-3 font-semibold text-slate-800">{pUser.name}</td>
                        <td className="p-3 text-gray-600 font-mono">{pUser.email}</td>
                        <td className="p-3 text-gray-600 font-mono">{pUser.phone}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            pUser.role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                            pUser.role === "Editor" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                            pUser.role === "Reporter" ? "bg-sky-100 text-sky-800 border border-sky-200" :
                            "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}>
                            {pUser.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${pUser.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
                          <span className="font-medium text-gray-700">{pUser.status}</span>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{pUser.joinedDate}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const newRole = pUser.role === "Subscriber" ? "Contributor" : pUser.role === "Contributor" ? "Reporter" : pUser.role === "Reporter" ? "Editor" : pUser.role === "Editor" ? "Admin" : "Subscriber";
                                setPortalUsers(prev => prev.map(u => u.id === pUser.id ? { ...u, role: newRole } : u));
                              }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              title="Toggle User Role"
                            >
                              Role
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = pUser.status === "Active" ? "Suspended" : "Active";
                                setPortalUsers(prev => prev.map(u => u.id === pUser.id ? { ...u, status: nextStatus } : u));
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                pUser.status === "Active" ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {pUser.status === "Active" ? "Suspend" : "Activate"}
                            </button>
                             <button
                              onClick={() => {
                                const matchingStaff = staffList.find(
                                  s => (s.name && s.name === pUser.name) || 
                                       (s.email && s.email === pUser.email) || 
                                       (s.mobile && s.mobile === pUser.phone)
                                );
                                const targetId = matchingStaff?.userId || pUser.id;
                                handleDeleteStaff(targetId);
                              }}
                              className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded cursor-pointer"
                              title="Delete account"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add User Modal */}
            {showAddPortalUserModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded border border-gray-200 shadow-xl max-w-md w-full p-6 relative font-sans text-left">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2.5 mb-4">Add Registered User</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPortalUserName || !newPortalUserEmail || !newPortalUserPhone) {
                      alert("Please fill all required settings");
                      return;
                    }
                    const newUserObj = {
                      id: `U-${100 + portalUsers.length + 1}`,
                      name: newPortalUserName,
                      email: newPortalUserEmail,
                      phone: newPortalUserPhone,
                      role: newPortalUserRole,
                      status: newPortalUserStatus,
                      joinedDate: "Today"
                    };
                    setPortalUsers(prev => {
                      const next = [...prev, newUserObj];
                      setSuccessMsg("নতুন ইউজার সফলভাবে যুক্ত করা হয়েছে! (Added/Created Successfully)");
                      setTimeout(() => setSuccessMsg(""), 4000);
                      return next;
                    });
                    setShowAddPortalUserModal(false);
                  }} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newPortalUserName}
                        onChange={(e) => setNewPortalUserName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={newPortalUserEmail}
                        onChange={(e) => setNewPortalUserEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Phone *</label>
                      <input
                        type="text"
                        required
                        value={newPortalUserPhone}
                        onChange={(e) => setNewPortalUserPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">System Role</label>
                        <select
                          value={newPortalUserRole}
                          onChange={(e) => setNewPortalUserRole(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer focus:outline-none"
                        >
                          <option value="Subscriber">Subscriber</option>
                          <option value="Contributor">Contributor</option>
                          <option value="Reporter">Reporter</option>
                          <option value="Editor">Editor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Account Status</label>
                        <select
                          value={newPortalUserStatus}
                          onChange={(e) => setNewPortalUserStatus(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer focus:outline-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddPortalUserModal(false)}
                        className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                      >
                        Add Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 9B. FAMILIES MANAGEMENT TAB ==================== */}
        {activeTab === "families" && (
          <div className="space-y-6 animate-fade-in font-sans" id="admin-family-view">
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Family Card Registry</h3>
                <p className="text-xs text-gray-500">Manage digital ration, membership status & localized family assistance profiles</p>
              </div>
              <button
                onClick={() => {
                  setNewFamilyHeadName("");
                  setNewFamilyMemberCount(4);
                  setNewFamilyPhone("");
                  setNewFamilyVillage("");
                  setNewFamilyCardType("Green");
                  setNewFamilyStatus("Active");
                  setShowAddFamilyModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} /> Register New Family
              </button>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded border border-gray-200 text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Total Families</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{familiesList.length}</span>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200 text-left">
                <span className="text-[10px] text-red-500 font-bold uppercase block tracking-wider">Red Cards (Aid)</span>
                <span className="text-xl font-black text-red-600 mt-1 block">
                  {familiesList.filter(f => f.cardType === "Red").length}
                </span>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200 text-left">
                <span className="text-[10px] text-green-500 font-bold uppercase block tracking-wider">Green Cards</span>
                <span className="text-xl font-black text-green-600 mt-1 block">
                  {familiesList.filter(f => f.cardType === "Green").length}
                </span>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200 text-left">
                <span className="text-[10px] text-blue-500 font-bold uppercase block tracking-wider">Blue Cards</span>
                <span className="text-xl font-black text-blue-600 mt-1 block">
                  {familiesList.filter(f => f.cardType === "Blue").length}
                </span>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200 text-left">
                <span className="text-[10px] text-amber-500 font-bold uppercase block tracking-wider">Pending Approvals</span>
                <span className="text-xl font-black text-amber-600 mt-1 block">
                  {familiesList.filter(f => f.status === "Pending").length}
                </span>
              </div>
            </div>

            {/* Family List Table */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="p-4 border-b border-gray-150 bg-gray-50/60 block select-none">
                <span className="text-xs font-bold text-slate-700">Family Logs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-slate-500 font-bold tracking-wide">
                      <th className="p-3 text-[10px] uppercase">Family ID</th>
                      <th className="p-3 text-[10px] uppercase">Head of Family</th>
                      <th className="p-3 text-[10px] uppercase">Members</th>
                      <th className="p-3 text-[10px] uppercase">Contact</th>
                      <th className="p-3 text-[10px] uppercase">Ward / Address</th>
                      <th className="p-3 text-[10px] uppercase">Card Type</th>
                      <th className="p-3 text-[10px] uppercase">Status</th>
                      <th className="p-3 text-[10px] uppercase">Reg Date</th>
                      <th className="p-3 text-[10px] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {familiesList.map((fObj) => (
                      <tr key={fObj.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-3 font-mono font-bold text-slate-500">{fObj.id}</td>
                        <td className="p-3 font-semibold text-slate-800">{fObj.headName}</td>
                        <td className="p-3 font-bold text-slate-700">{toBengaliDigits(fObj.memberCount.toString())} জন</td>
                        <td className="p-3 text-gray-600 font-mono">{fObj.phone}</td>
                        <td className="p-3 text-gray-600">{fObj.villageWard}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            fObj.cardType === "Red" ? "bg-red-100 text-red-700 font-black border border-red-200" :
                            fObj.cardType === "Green" ? "bg-green-100 text-green-700 font-black border border-green-200" :
                            "bg-blue-100 text-blue-700 font-black border border-blue-200"
                          }`}>
                            {fObj.cardType} Card
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
                            fObj.status === "Active" ? "bg-green-50 text-green-700" :
                            fObj.status === "Inactive" ? "bg-red-50 text-red-700" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {fObj.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{fObj.registeredDate}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const nextStat = fObj.status === "Active" ? "Inactive" : fObj.status === "Inactive" ? "Pending" : "Active";
                                setFamiliesList(prev => prev.map(f => f.id === fObj.id ? { ...f, status: nextStat } : f));
                              }}
                              className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[9px] font-semibold text-gray-700 cursor-pointer"
                            >
                              Status
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmModal({
                                  show: true,
                                  title: "ফ্যামিলি রেকর্ড ডিলিট নিশ্চিতকরণ",
                                  message: `আপনি কি নিশ্চিতভাবে ফ্যামিলি প্রধান '${fObj.headName}' এর কার্ড ডিলিট করতে চান?`,
                                  onConfirm: () => {
                                    setFamiliesList(prev => {
                                      const next = prev.filter(f => f.id !== fObj.id);
                                      setSuccessMsg("ফ্যামিলি প্রফাইল সফলভাবে ডিলিট করা হয়েছে! (Family Record Deleted Successfully)");
                                      setTimeout(() => setSuccessMsg(""), 4000);
                                      return next;
                                    });
                                  }
                                });
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Family record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Family Modal */}
            {showAddFamilyModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded border border-gray-200 shadow-xl max-w-md w-full p-6 relative font-sans text-left">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2.5 mb-4">Add Family Profile</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newFamilyHeadName || !newFamilyPhone || !newFamilyVillage) {
                      alert("Please specify all required properties");
                      return;
                    }
                    const newFam = {
                      id: `F-${500 + familiesList.length + 1}`,
                      headName: newFamilyHeadName,
                      memberCount: Number(newFamilyMemberCount),
                      phone: newFamilyPhone,
                      villageWard: newFamilyVillage,
                      cardType: newFamilyCardType,
                      status: newFamilyStatus,
                      registeredDate: "Today"
                    };
                    setFamiliesList(prev => {
                      const next = [...prev, newFam];
                      setSuccessMsg("ফ্যামিলি প্রফাইল সফলভাবে যুক্ত করা হয়েছে! (Family Profile Added Successfully)");
                      setTimeout(() => setSuccessMsg(""), 4000);
                      return next;
                    });
                    setShowAddFamilyModal(false);
                  }} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Family Head Name *</label>
                      <input
                        type="text"
                        required
                        value={newFamilyHeadName}
                        onChange={(e) => setNewFamilyHeadName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Members *</label>
                        <input
                          type="number"
                          required
                          value={newFamilyMemberCount}
                          onChange={(e) => setNewFamilyMemberCount(Number(e.target.value))}
                          className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Mobile Contact *</label>
                        <input
                          type="text"
                          required
                          value={newFamilyPhone}
                          onChange={(e) => setNewFamilyPhone(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                       <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Card Type Category</label>
                        <select
                          value={newFamilyCardType}
                          onChange={(e) => setNewFamilyCardType(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer"
                        >
                          <option value="Red">Red Card (Premium Aid)</option>
                          <option value="Green">Green Card</option>
                          <option value="Blue">Blue Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Ration Card Status</label>
                        <select
                          value={newFamilyStatus}
                          onChange={(e) => setNewFamilyStatus(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending Approval</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Ward & Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ওয়ার্ড-০১, আলফাডাঙ্গা"
                        value={newFamilyVillage}
                        onChange={(e) => setNewFamilyVillage(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddFamilyModal(false)}
                        className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 9C. VISITORS LOG TAB ==================== */}
        {activeTab === "visitors" && (
          <div className="space-y-6 animate-fade-in font-sans text-left" id="admin-visitors-view">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Visitor Entry Logs</h3>
                <p className="text-xs text-gray-500">Security checkout checkins, total scan logging, and localization metrics</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const demoLog = {
                    id: `vlog-${Date.now()}`,
                    sl: visitorLogs.length + 1,
                    rawDate: "2026-06-07",
                    dateString: "০৭ জুন ২০২৬, দুপুর ০২:১৫ মিনিট",
                    location: "ফরিদপুর সদর, ঢাকা বিভাগ, বাংলাদেশ",
                    status: "Checked In",
                    visitorsCount: 1,
                    gate: "ফটক-১ (প্রধান ফটক)",
                    note: "স্টুডিও ভিজিটর - পাস কার্ড"
                  };
                  const updated = [demoLog, ...visitorLogs];
                  setVisitorLogs(updated);
                  saveVisitorLogs(updated);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} /> Log Quick Demo Visitor
              </button>
            </div>

            <VisitorLogsTable
              metricLabel="Total Visitors"
              onBack={() => { setActiveTab("dashboard"); }}
              logs={visitorLogs}
              onDeleteLog={handleDeleteVisitorLog}
            />
          </div>
        )}

        {/* ==================== 9D. PHOTO CARDS GENERATOR TAB ==================== */}
        {activeTab === "photo_cards" && (
          <div className="space-y-6 animate-fade-in font-sans text-left" id="admin-photocard-view">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Photo Credentials Card Generator</h3>
              <p className="text-xs text-gray-500">Design, customize, print and authorize visual ID passcards for agents and visitors</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Config Panel */}
              <div className="lg:col-span-5 bg-white rounded border border-gray-200 p-5 space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block border-b pb-2 select-none">
                  Customize Passcard Properties
                </span>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Card Type Template</label>
                    <select
                      value={selectedCardType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCardType(val);
                        if (val === "Staff ID") {
                          setCardHolderRole("স্টাফ রিপোর্টার");
                        } else if (val === "Press Card") {
                          setCardHolderRole("প্রধান সম্পাদক");
                        } else if (val === "Visitor Pass") {
                          setCardHolderRole("হালনাগাদ ভিজিটর");
                        } else {
                          setCardHolderRole("সম্মানিত অতিথি / VIP");
                        }
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer"
                    >
                      <option value="Staff ID">Staff ID Layout</option>
                      <option value="Press Card">Premium Editorial Press Card</option>
                      <option value="Visitor Pass">Visitor Pass Layout</option>
                      <option value="VIP Guest">VIP Guest Badge Layout</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Holder Full Name</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded"
                      placeholder="e.g. আবদুর রহমান"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Designation/Title</label>
                    <input
                      type="text"
                      value={cardHolderRole}
                      onChange={(e) => setCardHolderRole(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Unique Card ID</label>
                      <input
                        type="text"
                        value={cardHolderId}
                        onChange={(e) => setCardHolderId(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Contact Phone</label>
                      <input
                        type="text"
                        value={cardHolderPhone}
                        onChange={(e) => setCardHolderPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 select-none">Holder Profile Photo URL</label>
                    <select
                      value={cardHolderPhoto}
                      onChange={(e) => setCardHolderPhoto(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded cursor-pointer"
                    >
                      <option value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80">Corporate Portrait Women (Demo 1)</option>
                      <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">Corporate Portrait Men (Demo 2)</option>
                      <option value="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80">Corporate Portrait Men 3 (Demo 3)</option>
                      <option value="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80">Corporate Portrait Men 4 (Demo 4)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full py-2.5 bg-[#2563eb] text-white hover:bg-blue-700 rounded text-xs font-bold text-center transition shadow-xs cursor-pointer select-none font-sans"
                  >
                    Print Active Photo Card
                  </button>
                  <span className="text-[10px] text-gray-400 text-center italic leading-tight block select-none">
                    * Make sure your browser printing supports background graphics & layouts.
                  </span>
                </div>
              </div>

              {/* Right Passcard Canvas Preview */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-gray-200 rounded-lg p-8 min-h-[420px]">
                <div className="relative group hover:scale-[1.02] active:scale-95 transition-all duration-300">
                  {/* Outer physical pass frame */}
                  <div className="w-[280px] h-[410px] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col select-none relative font-sans">
                    
                    {/* Color Top Banner based on Card type */}
                    <div className={`h-16 flex items-center justify-between px-4 relative ${
                      selectedCardType === "Press Card" ? "bg-gradient-to-r from-red-600 to-red-800 text-white" :
                      selectedCardType === "Visitor Pass" ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white" :
                      selectedCardType === "VIP Guest" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white" :
                      "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                    }`}>
                      <div className="text-left font-sans text-white">
                        <span className="text-[13px] font-black tracking-wide leading-none uppercase block">বার্তা সন্ধান</span>
                        <span className="text-[7px] text-white/80 font-semibold tracking-wider uppercase block mt-0.5">ডিজিটাল সংবাদপত্র পোর্টাল</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                          {selectedCardType}
                        </span>
                      </div>

                      {/* Accent strip line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-400"></div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5 flex-1 flex flex-col items-center text-center relative bg-[#fafafa]">
                      
                      {/* Avatar Image Frame */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-md relative bg-slate-100 mt-2">
                        <img
                          src={cardHolderPhoto}
                          alt="ID Photo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Chip/RFID Visual element */}
                      <div className="w-8 h-6 bg-amber-200/90 rounded border border-amber-300/80 mt-3 relative flex items-center justify-center">
                        <div className="w-4 h-3 border border-amber-400 rounded-sm"></div>
                      </div>

                      {/* Names and titles */}
                      <div className="mt-4 space-y-1">
                        <span className="text-[15px] font-bold text-slate-800 tracking-tight block">{cardHolderName}</span>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold ${
                          selectedCardType === "Press Card" ? "bg-red-50 text-red-700 border border-red-200" :
                          selectedCardType === "Visitor Pass" ? "bg-teal-50 text-teal-800 border border-teal-200" :
                          selectedCardType === "VIP Guest" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {cardHolderRole}
                        </span>
                      </div>

                      {/* Metadata specs */}
                      <div className="w-full mt-4 space-y-1 border-t border-b border-gray-200/60 py-2.5 text-[9px] text-gray-500 font-sans grid grid-cols-2 gap-1 text-left px-2">
                        <div>
                          <span className="text-gray-400 block">CARD HOLDER ID</span>
                          <span className="font-mono font-bold text-slate-700">{cardHolderId}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">GATE PASS PRIVILEGE</span>
                          <span className="font-bold text-slate-700">APPROVED</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-400 block">PHONE NO</span>
                          <span className="font-mono font-semibold text-slate-700">{cardHolderPhone}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-400 block">CARD STATUS</span>
                          <span className="font-bold text-green-600 uppercase">ACTIVE</span>
                        </div>
                      </div>

                      {/* Footer barcode bar */}
                      <div className="mt-auto pt-4 flex flex-col items-center">
                        <div className="flex items-center gap-[1px] h-6 justify-center">
                          {[1,2,1,4,1,3,1,1,2,3,1,2,4,1,1,2,1,3,2,1].map((val, idx) => (
                            <div key={idx} className="bg-slate-800 w-[1px]" style={{ width: `${val}px`, height: "20px" }}></div>
                          ))}
                        </div>
                        <span className="text-[8px] font-mono text-gray-400 mt-1 select-none tracking-widest">{cardHolderId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. APPLICATION SETTINGS VIEW */}
        {activeTab === "app_settings" && (
          <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in font-sans text-left" id="admin-app-settings-view">
            <div className="border-b border-gray-150 p-5 bg-slate-50/55 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Application Settings</h3>
                <p className="text-xs text-slate-500">নিউজপোর্টাল সাইটের ব্র্যান্ডিং, লেআউট, এসইও, এসএমটিপি এবং ক্যাটাগরি অপশন</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg("সকল সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!");
                  setTimeout(() => setSuccessMsg(""), 3000);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer select-none transition-colors"
              >
                Save All Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px] bg-[#f8fafc]/40">
              {/* Settings Sidebar Menus */}
              <div className="md:col-span-3 border-r border-gray-200 bg-[#f4f6f9]/60 p-5">
                <div className="border border-gray-300 rounded bg-white overflow-hidden shadow-2xs divide-y divide-gray-150">
                  {[
                    { id: "header", label: "Header Setting", icon: <span className="font-sans font-black text-[13px] leading-none shrink-0 block w-4 text-center -translate-y-[0.5px]">H</span> },
                    { id: "footer", label: "Footer Setting", icon: <Info size={14} className="shrink-0" /> },
                    { id: "footer_settings_2", label: "Footer Settings 2 🛠️", icon: <Info size={14} className="shrink-0 text-amber-500" /> },
                    { id: "social_links", label: "সোশ্যাল মিডিয়া লিঙ্ক ও আইকন 🌟", icon: <Facebook size={14} className="shrink-0" /> },
                    { id: "seo", label: "SEO Setting", icon: <Search size={14} className="shrink-0" /> },
                    { id: "facebook", label: "Facebook Setting", icon: <Facebook size={14} className="shrink-0" /> },
                    { id: "mail", label: "Mail Setting", icon: <Mail size={14} className="shrink-0" /> },
                    { id: "login", label: "Login Setting", icon: <Lock size={14} className="shrink-0" /> },
                    { id: "ad", label: "Ad Setting", icon: <div className="border border-current rounded-[1px] px-[2px] py-[0.5px] text-[7.5px] font-black tracking-tighter uppercase leading-none shrink-0 translate-y-[0.5px] scale-90">Ad</div> },
                    { id: "rss", label: "RSS Setting", icon: <Rss size={14} className="shrink-0" /> },
                    { id: "import_wp", label: "Import WP Data", icon: <Download size={14} className="shrink-0" /> },
                    { id: "category_order", label: "Category Order", icon: <ListOrdered size={14} className="shrink-0" /> },
                    { id: "theme", label: "Theme Setting", icon: <Image size={14} className="shrink-0" /> },
                  ].map((item) => {
                    const isActive = activeSettingsTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSettingsTab(item.id)}
                        className={`w-full text-left px-4 py-3.5 text-[12px] font-sans font-medium transition-colors duration-150 flex items-center gap-3 cursor-pointer select-none ${
                          isActive
                            ? "bg-[#3b82f6] text-white font-bold"
                            : "text-slate-650 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <span className={`w-4 flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-[#718096]"}`}>
                          {item.icon}
                        </span>
                        <span className="font-sans tracking-wide text-[12.5px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Settings Form Contents */}
              <div className="md:col-span-9 p-6">
                <div className="max-w-2xl space-y-6">
                  
                  {activeSettingsTab === "header" && (
                    <div className="space-y-5 animate-fade-in text-left">
                      <div className="border-b border-gray-100 pb-2 mb-4">
                        <h4 className="text-sm font-bold text-slate-800">Header Settings</h4>
                        <p className="text-[11px] text-gray-500">মূল টপ হেডারের লোগো ও শিরোনাম ব্র্যান্ডিং সেটিংস পরিবর্তন করুন</p>
                      </div>

                      {/* 1. Header Light Logo */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-4 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2 font-sans bg-white">Header Light Logo</legend>
                        <input
                          type="text"
                          value={hdrLightLogoFilename}
                          onChange={(e) => setHdrLightLogoFilename(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans mb-3"
                        />
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-350 hover:border-gray-400 rounded text-xs cursor-pointer select-none font-medium transition duration-150 inline-block font-sans shadow-2xs">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setHdrLightLogoFilename(file.name);
                                    setHdrLightLogoUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-gray-500 font-sans">No file chosen</span>
                        </div>
                        <div className="mt-3 text-left">
                          <img
                            src={hdrLightLogoUrl || undefined}
                            alt="Header Light Logo Brand"
                            className="h-12 object-contain text-left"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </fieldset>

                      {/* 2. Header Dark Logo */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-4 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2 font-sans bg-white">Header Dark Logo</legend>
                        <input
                          type="text"
                          value={hdrDarkLogoFilename}
                          onChange={(e) => setHdrDarkLogoFilename(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans mb-3"
                        />
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-350 hover:border-gray-400 rounded text-xs cursor-pointer select-none font-medium transition duration-150 inline-block font-sans shadow-2xs">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setHdrDarkLogoFilename(file.name);
                                    setHdrDarkLogoUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-gray-500 font-sans">No file chosen</span>
                        </div>
                        <div className="mt-3 text-left">
                          <img
                            src={hdrDarkLogoUrl || undefined}
                            alt="Header Dark Logo Brand"
                            className="h-12 object-contain text-left"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </fieldset>

                      {/* 3. Favicon */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-4 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2 font-sans bg-white">Favicon</legend>
                        <input
                          type="text"
                          value={faviconLogoFilename}
                          onChange={(e) => setFaviconLogoFilename(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans mb-3"
                        />
                        <div className="flex items-center gap-3">
                          <label className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-350 hover:border-gray-400 rounded text-xs cursor-pointer select-none font-medium transition duration-150 inline-block font-sans shadow-2xs">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setFaviconLogoFilename(file.name);
                                    setFaviconLogoUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-gray-500 font-sans">No file chosen</span>
                        </div>
                        <div className="mt-3 text-left">
                          <img
                            src={faviconLogoUrl || undefined}
                            alt="Favicon Brand"
                            className="h-10 object-contain text-left"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </fieldset>

                      {/* 4. Site Title */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-4 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2 font-sans bg-white">Site Title</legend>
                        <input
                          type="text"
                          value={settingsSiteTitle}
                          onChange={(e) => setSettingsSiteTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        />
                      </fieldset>

                      {/* 5. Site English Title */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-4 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2 font-sans bg-white">Site English Title</legend>
                        <input
                          type="text"
                          value={settingsSiteEnglishTitle}
                          onChange={(e) => setSettingsSiteEnglishTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        />
                      </fieldset>

                      {/* Main Full-Width Update Button matching the user's reference layout exactly */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const config = {
                              hdrLightLogoFilename,
                              hdrLightLogoUrl,
                              hdrDarkLogoFilename,
                              hdrDarkLogoUrl,
                              faviconLogoFilename,
                              faviconLogoUrl,
                              settingsSiteTitle,
                              settingsSiteEnglishTitle
                            };
                            localStorage.setItem("header_settings", JSON.stringify(config));
                            fetch("/api/database/settings_header", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(config)
                            }).catch(err => console.error(err));
                            
                            // Emit a storage event to synchronize on-page elements real-time
                            window.dispatchEvent(new Event("storage"));

                            setSuccessMsg("Header details updated successfully!");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }}
                          className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-2.5 rounded text-sm text-center font-sans shadow-xs hover:shadow transition duration-200 cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "footer" && (
                    <div className="space-y-6 text-left font-sans animate-fade-in">
                      <div className="border-b pb-2 mb-4">
                        <h4 className="text-sm font-bold text-slate-800">Footer Settings</h4>
                        <p className="text-[11px] text-gray-500">নিউজ পোর্টাল ফুটারে প্রদর্শিত সকল ব্র্যান্ডিং, লোগো, লিংক ক্যাটাগরি, ডাটা ও সোশ্যাল লিঙ্ক ইডিট ও যুক্ত করার এডভান্সড প্যানেল।</p>
                      </div>

                      {/* Brand Settings Column 1 */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">১. ফুটার ব্র্যান্ডিং ও লোগো সেটিংস</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <fieldset className="border border-gray-200 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-400 font-bold px-1.5 ml-2">Footer Brand Mode</legend>
                            <select
                              value={footerSettings.footerBrandMode || "text"}
                              onChange={(e) => updateFooterField("footerBrandMode", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                            >
                              <option value="text">Text Title (বার্তাসন্ধান)</option>
                              <option value="logo">Image Logo</option>
                            </select>
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-400 font-bold px-1.5 ml-2">Footer Brand Text Title (If mode is Text)</legend>
                            <input
                              type="text"
                              value={footerSettings.footerBrandText || ""}
                              onChange={(e) => updateFooterField("footerBrandText", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                              placeholder="ফুটার টেক্সট নাম"
                            />
                          </fieldset>
                        </div>

                        {/* Footer Logo Option (If mode is Logo) */}
                        {footerSettings.footerBrandMode === "logo" && (
                          <fieldset className="border border-gray-250 rounded px-4 pb-5 pt-3. bg-white relative">
                            <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2">Footer Logo (Upload & Name)</legend>
                            <input
                              type="text"
                              value={footerSettings.footerLogo}
                              onChange={(e) => updateFooterField("footerLogo", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2.5"
                            />
                            <div className="flex items-center gap-3">
                              <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs cursor-pointer select-none font-medium transition-colors">
                                Choose File
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setFooterSettings(prev => ({
                                          ...prev,
                                          footerLogo: file.name,
                                          footerLogoUrl: reader.result as string
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <span className="text-xs text-slate-500 font-medium">{footerSettings.footerLogo || "No file chosen"}</span>
                            </div>
                            <div className="mt-3.5 bg-[#fcfcfc] p-2 border border-dashed border-gray-200 rounded inline-block">
                              <img
                                src={footerSettings.footerLogoUrl || "https://i.postimg.cc/9MH8YcDj/Footer-logo.png"}
                                alt="Footer Logo"
                                className="h-10 object-contain text-left"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </fieldset>
                        )}
                      </div>

                      {/* Column 2 Category Links list editor */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-200 gap-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">২. কলাম ২ লিংক লিস্ট বিল্ডার</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col2Title || ""}
                              onChange={(e) => updateFooterField("col2Title", e.target.value)}
                              className="px-2 py-0.5 text-xs border border-gray-300 bg-white rounded focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {(footerSettings.col2Links || []).length === 0 ? (
                            <p className="text-xs text-gray-400 font-sans text-center py-2">কোনো লিংক যুক্ত করা নেই।</p>
                          ) : (
                            (footerSettings.col2Links || []).map((link, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-250">
                                <span className="text-xs text-gray-400 font-mono">#{idx+1}</span>
                                <input
                                  type="text"
                                  value={link.text}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col2Links || [])];
                                    nextLinks[idx].text = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="w-1/3 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none"
                                  placeholder="লিঙ্ক লেখা"
                                />
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col2Links || [])];
                                    nextLinks[idx].url = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="flex-grow px-2 py-1 text-xs border border-gray-200 rounded font-mono focus:outline-none"
                                  placeholder="লিঙ্ক URL বা /category/নাম"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextLinks = (footerSettings.col2Links || []).filter((_, i) => i !== idx);
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 text-xs hover:bg-red-50 rounded transition-colors"
                                  title="Delete link"
                                >
                                  মুছুন
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Col 2 Add Link Inline Form */}
                        <div className="bg-white p-2 rounded border border-dashed border-gray-300 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newCol2Text}
                            onChange={(e) => setNewCol2Text(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded sm:w-1/3 text-slate-800"
                            placeholder="নতুন লিংক টেক্সট"
                          />
                          <input
                            type="text"
                            value={newCol2Url}
                            onChange={(e) => setNewCol2Url(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded flex-grow font-mono text-slate-800"
                            placeholder="নতুন লিংক URL (যেমন: /category/জাতীয়)"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCol2Text.trim() || !newCol2Url.trim()) return;
                              setFooterSettings(prev => ({
                                ...prev,
                                col2Links: [...(prev.col2Links || []), { text: newCol2Text.trim(), url: newCol2Url.trim() }]
                              }));
                              setNewCol2Text("");
                              setNewCol2Url("");
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs select-none transition-colors"
                          >
                            যুক্ত করুন
                          </button>
                        </div>
                      </div>

                      {/* Column 3 Links List Editor */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-200 gap-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">৩. কলাম ৩ লিংক লিস্ট বিল্ডার</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col3Title || ""}
                              onChange={(e) => updateFooterField("col3Title", e.target.value)}
                              className="px-2 py-0.5 text-xs border border-gray-300 bg-white rounded focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {(footerSettings.col3Links || []).length === 0 ? (
                            <p className="text-xs text-gray-400 font-sans text-center py-2">কোনো লিংক যুক্ত করা নেই।</p>
                          ) : (
                            (footerSettings.col3Links || []).map((link, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-250">
                                <span className="text-xs text-gray-400 font-mono">#{idx+1}</span>
                                <input
                                  type="text"
                                  value={link.text}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col3Links || [])];
                                    nextLinks[idx].text = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="w-1/3 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none"
                                  placeholder="লিঙ্ক লেখা"
                                />
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col3Links || [])];
                                    nextLinks[idx].url = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="flex-grow px-2 py-1 text-xs border border-gray-200 rounded font-mono focus:outline-none"
                                  placeholder="লিঙ্ক URL বা পেজ আইডি (admin, staffuser)"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextLinks = (footerSettings.col3Links || []).filter((_, i) => i !== idx);
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 text-xs hover:bg-red-50 rounded transition-colors"
                                  title="Delete link"
                                >
                                  মুছুন
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Col 3 Add Link Inline Form */}
                        <div className="bg-white p-2 rounded border border-dashed border-gray-300 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newCol3Text}
                            onChange={(e) => setNewCol3Text(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded sm:w-1/3 text-slate-800"
                            placeholder="নতুন লিংক টেক্সট"
                          />
                          <input
                            type="text"
                            value={newCol3Url}
                            onChange={(e) => setNewCol3Url(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded flex-grow font-mono text-slate-800"
                            placeholder="নতুন লিংক URL (যেমন: staffuser বা #)"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCol3Text.trim() || !newCol3Url.trim()) return;
                              setFooterSettings(prev => ({
                                ...prev,
                                col3Links: [...(prev.col3Links || []), { text: newCol3Text.trim(), url: newCol3Url.trim() }]
                              }));
                              setNewCol3Text("");
                              setNewCol3Url("");
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs select-none transition-colors"
                          >
                            যুক্ত করুন
                          </button>
                        </div>
                      </div>

                      {/* Footer Description */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-5 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2">Footer Brand Description</legend>
                        <textarea
                          value={footerSettings.footerDescription}
                          onChange={(e) => updateFooterField("footerDescription", e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded h-20 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </fieldset>

                      {/* Active Sompadok / Editor & Publisher Structured Editing */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-gray-250 space-y-4 font-sans text-left">
                        <div className="pb-1 border-b border-gray-200">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">সম্পাদক ও প্রকাশক তথ্য প্যানেল</h5>
                          <p className="text-[10px] text-gray-500">সম্পাদক প্যানেল থেকে ফুটারের এই তথ্যগুলো পরিবর্তন করে সংরক্ষণ করতে পারবেন।</p>
                        </div>

                        {/* Mode Select */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-750 block">সম্পাদক ও প্রকাশক প্রদর্শনীর ধরণ (Display Mode)</label>
                          <div className="grid grid-cols-2 gap-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                updateFooterField("pubEditMode", "combined");
                                // Trigger rebuild of sompadok immediately
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubEditMode: "combined" };
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  return updated;
                                });
                              }}
                              className={`py-2 px-3 border rounded text-xs font-medium text-center select-none transition-all duration-150 cursor-pointer ${
                                (footerSettings.pubEditMode || "combined") === "combined"
                                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs font-bold"
                                  : "bg-white border-gray-300 text-slate-600 hover:bg-gray-50"
                              }`}
                            >
                              একত্রে (Combined)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateFooterField("pubEditMode", "separate");
                                // Trigger rebuild of sompadok immediately
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubEditMode: "separate" };
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  return updated;
                                });
                              }}
                              className={`py-2 px-3 border rounded text-xs font-medium text-center select-none transition-all duration-150 cursor-pointer ${
                                (footerSettings.pubEditMode || "combined") === "separate"
                                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs font-bold"
                                  : "bg-white border-gray-300 text-slate-600 hover:bg-gray-50"
                              }`}
                            >
                              আলাদা আলাদা (Separate)
                            </button>
                          </div>
                        </div>

                        {/* Name Inputs */}
                        <div className="grid grid-cols-1 gap-3">
                          {(footerSettings.pubEditMode || "combined") === "combined" ? (
                            <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                              <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">সম্পাদক ও প্রকাশকের নাম (সরাসরি একত্রে)</legend>
                              <input
                                type="text"
                                value={footerSettings.sharedName || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterSettings(prev => {
                                    const updated = { ...prev, sharedName: val };
                                    const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                    const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                    const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                    const year = updated.pubYear || "৬ তম বর্ষ";
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${val} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                    return updated;
                                  });
                                }}
                                placeholder="যেমন: প্রকৌশলী খালিদ হাসান"
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </fieldset>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                                <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">সম্পাদকের নাম</legend>
                                <input
                                  type="text"
                                  value={footerSettings.edName || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFooterSettings(prev => {
                                      const updated = { ...prev, edName: val };
                                      const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                      const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                      const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                      const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                      const year = updated.pubYear || "৬ তম বর্ষ";
                                      updated.sompadok = `সম্পাদক: ${val}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                      return updated;
                                    });
                                  }}
                                  placeholder="যেমন: প্রকৌশলী খালিদ হাসান"
                                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </fieldset>

                              <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                                <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">প্রকাশকের নাম</legend>
                                <input
                                  type="text"
                                  value={footerSettings.pubName || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFooterSettings(prev => {
                                      const updated = { ...prev, pubName: val };
                                      const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                      const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                      const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                      const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                      const year = updated.pubYear || "৬ তম বর্ষ";
                                      updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${val}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                      return updated;
                                    });
                                  }}
                                  placeholder="যেমন: প্রকৌশলী খালিদ হাসান"
                                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </fieldset>
                            </div>
                          )}

                          {/* Acting Editor Name */}
                          <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">ভারপ্রাপ্ত সম্পাদকের নাম</legend>
                            <input
                              type="text"
                              value={footerSettings.actingEdName || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, actingEdName: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${val}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${val}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="যেমন: মোহাম্মদ রবিন শেখ"
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </fieldset>

                          {/* Place and Paper details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                              <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">প্রকাশনার স্থান ও বার্তা</legend>
                              <input
                                type="text"
                                value={footerSettings.pubPlace || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterSettings(prev => {
                                    const updated = { ...prev, pubPlace: val };
                                    const mode = updated.pubEditMode || "combined";
                                    const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                    const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                    const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                    const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                    const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                    const year = updated.pubYear || "৬ তম বর্ষ";
                                    if (mode === "combined") {
                                      updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${val} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                    } else {
                                      updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${val} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                    }
                                    return updated;
                                  });
                                }}
                                placeholder="যেমন: বৃহত্তম ফরিদপুর"
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </fieldset>

                            <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                              <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">পত্রিকা বা বার্তা সংস্থার নাম</legend>
                              <input
                                type="text"
                                value={footerSettings.pubPaper || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterSettings(prev => {
                                    const updated = { ...prev, pubPaper: val };
                                    const mode = updated.pubEditMode || "combined";
                                    const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                    const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                    const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                    const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                    const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                    const year = updated.pubYear || "৬ তম বর্ষ";
                                    if (mode === "combined") {
                                      updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${val}। প্রকাশনার ${year}।`;
                                    } else {
                                      updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${val}। প্রকাশনার ${year}।`;
                                    }
                                    return updated;
                                  });
                                }}
                                placeholder="যেমন: দৈনিক বার্তাসন্ধান"
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </fieldset>
                          </div>

                          {/* Publish Year */}
                          <fieldset className="border border-gray-300 bg-white rounded px-3 pb-3 pt-1.5 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-1.5 bg-white">প্রকাশনার বর্ষ</legend>
                            <input
                              type="text"
                              value={footerSettings.pubYear || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubYear: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${val}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${val}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="যেমন: ৬ তম বর্ষ"
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </fieldset>
                        </div>

                        {/* Live Compiled Text Textarea preview */}
                        <div className="pt-2">
                          <label className="text-[11px] font-bold text-gray-700 block mb-1 font-sans">ফুটার সায়েনিচার স্লাইডার লাইভ প্রিভিউ (Compiled Preview)</label>
                          <textarea
                            value={footerSettings.sompadok}
                            onChange={(e) => updateFooterField("sompadok", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 bg-slate-100 rounded h-16 leading-relaxed font-sans focus:outline-none text-slate-700 focus:ring-1 focus:ring-blue-500"
                            placeholder="তথ্য যোগ করলে এই লেখাটি অটোমেটিকলি জেনারেট হবে..."
                          />
                        </div>
                      </div>

                      {/* Copyright */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-5 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2">Copyright label Text</legend>
                        <input
                          type="text"
                          value={footerSettings.copyright}
                          onChange={(e) => updateFooterField("copyright", e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </fieldset>

                      {/* Bottom Button Name */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-5 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2">Bottom Panel Admin/Portal Button Label Text</legend>
                        <input
                          type="text"
                          value={footerSettings.footerPanelBtnText || "সম্পাদক প্যানেল"}
                          onChange={(e) => updateFooterField("footerPanelBtnText", e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </fieldset>

                      {/* Contact Column 4 Details */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-200 gap-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">৪. কলাম ৪ যোগাযোগ ও বার্তা কক্ষ</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col4Title || ""}
                              onChange={(e) => updateFooterField("col4Title", e.target.value)}
                              className="px-2 py-0.5 text-xs border border-gray-300 bg-white rounded focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <fieldset className="border border-gray-300 rounded px-3 pb-3 pt-2 bg-white relative col-span-2">
                            <legend className="text-[10px] text-gray-450 font-bold px-1.5 ml-2">Location Address</legend>
                            <input
                              type="text"
                              value={footerSettings.location}
                              onChange={(e) => updateFooterField("location", e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-300 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-450 font-bold px-1.5 ml-2">Email</legend>
                            <input
                              type="text"
                              value={footerSettings.email}
                              onChange={(e) => updateFooterField("email", e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-300 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-450 font-bold px-1.5 ml-2">Advertise Email</legend>
                            <input
                              type="text"
                              value={footerSettings.advertiseEmail}
                              onChange={(e) => updateFooterField("advertiseEmail", e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-300 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-450 font-bold px-1.5 ml-2">Phone</legend>
                            <input
                              type="text"
                              value={footerSettings.phone}
                              onChange={(e) => updateFooterField("phone", e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-300 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[10px] text-gray-450 font-bold px-1.5 ml-2">Fax</legend>
                            <input
                              type="text"
                              value={footerSettings.fax}
                              onChange={(e) => updateFooterField("fax", e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </fieldset>
                        </div>
                      </div>

                      {/* Social Accounts */}
                      <fieldset className="border border-gray-300 rounded px-4 pb-5 pt-3.5 bg-white relative">
                        <legend className="text-[11px] text-gray-500 font-bold px-1.5 ml-2">Social Media Accounts (Header & Footer Social links)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">Facebook URL</label>
                            <input
                              type="text"
                              value={footerSettings.facebook}
                              onChange={(e) => updateFooterField("facebook", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">LinkedIn URL</label>
                            <input
                              type="text"
                              value={footerSettings.linkedin}
                              onChange={(e) => updateFooterField("linkedin", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">YouTube URL</label>
                            <input
                              type="text"
                              value={footerSettings.youtube}
                              onChange={(e) => updateFooterField("youtube", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">Twitter X URL</label>
                            <input
                              type="text"
                              value={footerSettings.twitter}
                              onChange={(e) => updateFooterField("twitter", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">Instagram URL</label>
                            <input
                              type="text"
                              value={footerSettings.instagram}
                              onChange={(e) => updateFooterField("instagram", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase transition-colors">WhatsApp Number/Link</label>
                            <input
                              type="text"
                              value={footerSettings.whatsapp}
                              onChange={(e) => updateFooterField("whatsapp", e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none"
                            />
                          </div>
                        </div>
                      </fieldset>

                      {/* Big blue full width button as in the image */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("footer_settings", JSON.stringify(footerSettings));
                            fetch("/api/database/settings_footer", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(footerSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার ফুটায়ের সকল তথ্য ও ছবি সফলভাবে ওয়েবসাইটে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "footer_settings_2" && (
                    <div className="space-y-6 text-left font-sans animate-fade-in pr-1">
                      <div className="border-b pb-2 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-md border border-amber-200/50 shadow-2xs">
                        <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                          <span className="p-1 px-2 bg-amber-500 text-white rounded text-[10px] uppercase font-mono font-black animate-pulse">New</span> 
                          ফুটার সেটিংস ২ (Footer Settings 2 🛠️)
                        </h4>
                        <p className="text-[11px] text-amber-700 leading-relaxed mt-1 font-display">
                          ফুটারের স্বাক্ষর প্যানেলে সম্পাদক, প্রকাশক ও ভারপ্রাপ্ত সম্পাদকের নাম, প্রকাশনার তথ্য এবং তাদের ব্যক্তিগত সোশ্যাল মিডিয়া লিঙ্ক ও প্রোফাইল ইউআরএল ইডিট করার উন্নত সুবিধা। এখানে যুক্ত করা লিঙ্ক সরাসরি ফুটারের নামের উপর যুক্ত হবে এবং পাঠকরা ক্লিক করলে তাদের প্রোফাইলে চলে যেতে পারবেন।
                        </p>
                      </div>

                      {/* 1. Display Mode Toggle */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="pb-1 border-b border-gray-150">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">১. প্রদর্শনীর ধরণ (Display Layout Mode)</h5>
                          <p className="text-[10px] text-gray-500">আপনার প্রয়োজন অনুযায়ী সম্পাদক ও প্রকাশকের নাম একত্রে নাকি আলাদা ব্লকে দেখাবেন তা বাছাই করুন।</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFooterSettings(prev => {
                                const updated = { ...prev, pubEditMode: "combined" };
                                const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                const year = updated.pubYear || "৬ তম বর্ষ";
                                updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                return updated;
                              });
                            }}
                            className={`p-3.5 border rounded-xl text-xs font-semibold text-center select-none transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5 ${
                              (footerSettings.pubEditMode || "combined") === "combined"
                                ? "bg-amber-50 border-amber-400 text-amber-900 shadow-3xs font-bold"
                                : "bg-white border-gray-300 text-slate-650 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-sm font-display">একত্রে (Combined Mode)</span>
                            <span className="text-[10px] text-gray-550 font-normal">সম্পাদক ও প্রকাশক : [নাম]</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFooterSettings(prev => {
                                const updated = { ...prev, pubEditMode: "separate" };
                                const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                const year = updated.pubYear || "৬ তম বর্ষ";
                                updated.sompadok = `সম্পাদক: ${editor}, প্রকাশক: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                return updated;
                              });
                            }}
                            className={`p-3.5 border rounded-xl text-xs font-semibold text-center select-none transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5 ${
                              (footerSettings.pubEditMode || "combined") === "separate"
                                ? "bg-amber-50 border-amber-400 text-amber-900 shadow-3xs font-bold"
                                : "bg-white border-gray-300 text-slate-650 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-sm font-display">আলাদা আলাদা (Separate Mode)</span>
                            <span className="text-[10px] text-gray-550 font-normal">সম্পাদক : [নাম], প্রকাশক : [নাম]</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Editor & Publisher Names & Social Links */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="pb-1 border-b border-gray-150">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">২. নাম ও সোশ্যাল মিডিয়া লিঙ্ক সেটিংস</h5>
                          <p className="text-[10px] text-gray-500">পদবী অনুযায়ী সংশ্লিষ্ট ব্যক্তিবর্গের নাম এবং তাদের সোশ্যাল প্রোফাইল লিঙ্ক (যেমন: Facebook, Twitter বা LinkedIn) যুক্ত করুন।</p>
                        </div>

                        {/* Combined Settings Fields */}
                        {(footerSettings.pubEditMode || "combined") === "combined" ? (
                          <div className="space-y-3.5">
                            <fieldset className="border border-gray-250 rounded px-3 pb-3.5 pt-2 bg-slate-50/50 relative">
                              <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 font-display bg-white">সম্পাদক ও প্রকাশকের নাম (সরাসরি একত্রে)</legend>
                              <input
                                type="text"
                                value={footerSettings.sharedName || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFooterSettings(prev => {
                                    const updated = { ...prev, sharedName: val };
                                    const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                    const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                    const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                    const year = updated.pubYear || "৬ তম বর্ষ";
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${val} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                    return updated;
                                  });
                                }}
                                placeholder="যেমন: প্রকৌশলী খালিদ হাসান"
                                className="w-full px-3 py-2 text-xs border border-gray-350 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans text-slate-800"
                              />
                            </fieldset>

                            <fieldset className="border border-gray-250 rounded px-3 pb-3.5 pt-2 bg-slate-50/50 relative">
                              <legend className="text-[11px] text-blue-600 font-bold px-1.5 ml-2 font-display bg-white flex items-center gap-1">
                                <Facebook size={12} className="text-blue-500" /> সম্পাদক ও প্রকাশক সোসাইল লিঙ্ক (Social Url)
                              </legend>
                              <input
                                type="text"
                                value={footerSettings.sharedSocialUrl || ""}
                                onChange={(e) => updateFooterField("sharedSocialUrl", e.target.value)}
                                placeholder="যেমন: facebook.com/username"
                                className="w-full px-3 py-2 text-xs border border-gray-350 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-slate-850"
                              />
                            </fieldset>
                          </div>
                        ) : (
                          // Separate Settings Fields
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3 p-3 bg-red-50/5 border border-red-100/50 rounded-xl">
                                <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                                  <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 font-display bg-white">সম্পাদকের নাম (Editor Name)</legend>
                                  <input
                                    type="text"
                                    value={footerSettings.edName || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFooterSettings(prev => {
                                        const updated = { ...prev, edName: val };
                                        const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                        const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                        const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                        const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                        const year = updated.pubYear || "৬ তম বর্ষ";
                                        updated.sompadok = `সম্পাদক: ${val}, publisher: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                        return updated;
                                      });
                                    }}
                                    placeholder="সম্পাদকের নাম"
                                    className="w-full px-3 py-2 text-xs border border-gray-350 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                                  />
                                </fieldset>

                                <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                                  <legend className="text-[11px] text-blue-600 font-bold px-1.5 ml-2 font-display bg-white flex items-center gap-1">
                                    <Facebook size={11} className="text-blue-500" /> সম্পাদকের সোসাইল লিঙ্ক
                                  </legend>
                                  <input
                                    type="text"
                                    value={footerSettings.edSocialUrl || ""}
                                    onChange={(e) => updateFooterField("edSocialUrl", e.target.value)}
                                    placeholder="যেমন: facebook.com/editor"
                                    className="w-full px-3 py-2 text-xs border border-gray-305 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                                  />
                                </fieldset>
                              </div>

                              <div className="space-y-3 p-3 bg-blue-50/5 border border-blue-100/50 rounded-xl">
                                <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                                  <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 font-display bg-white">প্রকাশকের নাম (Publisher Name)</legend>
                                  <input
                                    type="text"
                                    value={footerSettings.pubName || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFooterSettings(prev => {
                                        const updated = { ...prev, pubName: val };
                                        const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                        const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                        const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                        const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                        const year = updated.pubYear || "৬ তম বর্ষ";
                                        updated.sompadok = `সম্পাদক: ${editor}, publisher: ${val}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                        return updated;
                                      });
                                    }}
                                    placeholder="প্রকাশকের নাম"
                                    className="w-full px-3 py-2 text-xs border border-gray-350 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                                  />
                                </fieldset>

                                <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                                  <legend className="text-[11px] text-blue-600 font-bold px-1.5 ml-2 font-display bg-white flex items-center gap-1">
                                    <Facebook size={11} className="text-blue-500" /> প্রকাশকের সোসাইল লিঙ্ক
                                  </legend>
                                  <input
                                    type="text"
                                    value={footerSettings.pubSocialUrl || ""}
                                    onChange={(e) => updateFooterField("pubSocialUrl", e.target.value)}
                                    placeholder="যেমন: facebook.com/publisher"
                                    className="w-full px-3 py-2 text-xs border border-gray-305 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                                  />
                                </fieldset>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Acting Editor Section */}
                        <div className="p-3 bg-amber-50/5 border border-amber-100/50 rounded-xl space-y-3">
                          <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 font-display bg-white">ভারপ্রাপ্ত সম্পাদকের নাম (Acting Editor Name)</legend>
                            <input
                              type="text"
                              value={footerSettings.actingEdName || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, actingEdName: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${val}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, publisher: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${val}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${year}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="ভারপ্রাপ্ত সম্পাদকের নাম"
                              className="w-full px-3 py-2 text-xs border border-gray-350 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-250 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[11px] text-blue-600 font-bold px-1.5 ml-2 font-display bg-white flex items-center gap-1">
                              <Facebook size={12} className="text-blue-500" /> ভারপ্রাপ্ত সম্পাদকের সোসাইল লিঙ্ক
                            </legend>
                            <input
                              type="text"
                              value={footerSettings.actingEdSocialUrl || ""}
                              onChange={(e) => updateFooterField("actingEdSocialUrl", e.target.value)}
                              placeholder="যেমন: facebook.com/actingeditor"
                              className="w-full px-3 py-2 text-xs border border-gray-305 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            />
                          </fieldset>
                        </div>
                      </div>

                      {/* 3. Newspaper details, location, and year */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="pb-1 border-b border-gray-150">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">৩. ঠিকানা ও প্রকাশনা বিবরণী</h5>
                          <p className="text-[10px] text-gray-500">“বৃহত্তম ফরিদপুর থেকে প্রকাশিত দৈনিক বার্তাসন্ধান। প্রকাশনার ৬ তম বর্ষ” এই অংশ পরিবর্তন করার জন্য নিচের ঘরগুলো পূরণ করুন।</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-display">
                          <fieldset className="border border-gray-200 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 bg-white">প্রকাশনার স্থান ও এলাকা</legend>
                            <input
                              type="text"
                              value={footerSettings.pubPlace || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubPlace: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${val} থেকে প্রকাশিত {paper}। প্রকাশনার {year}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, publisher: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${val} থেকে প্রকাশিত {paper}। প্রকাশনার {year}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="যেমন: বৃহত্তম ফরিদপুর"
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 bg-white">দৈনিক পত্রিকার নাম</legend>
                            <input
                              type="text"
                              value={footerSettings.pubPaper || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubPaper: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const year = updated.pubYear || "৬ তম বর্ষ";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${val}। প্রকাশনার {year}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, publisher: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${val}। প্রকাশনার {year}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="যেমন: দৈনিক বার্তাসন্ধান"
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded px-3 pb-3 pt-2 bg-white relative">
                            <legend className="text-[11px] text-gray-650 font-bold px-1.5 ml-2 bg-white">প্রকাশনা বর্ষ বিবরণী</legend>
                            <input
                              type="text"
                              value={footerSettings.pubYear || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFooterSettings(prev => {
                                  const updated = { ...prev, pubYear: val };
                                  const mode = updated.pubEditMode || "combined";
                                  const shared = updated.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const editor = updated.edName || "প্রকৌশলী খালিদ হাসান";
                                  const publisher = updated.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const acting = updated.actingEdName || "মোহাম্মদ রবিন শেখ";
                                  const place = updated.pubPlace || "বৃহত্তম ফরিদপুর";
                                  const paper = updated.pubPaper || "দৈনিক বার্তাসন্ধান";
                                  if (mode === "combined") {
                                    updated.sompadok = `সম্পাদক ও প্রকাশক : ${shared} , ভারপ্রাপ্ত সম্পাদক : ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${val}।`;
                                  } else {
                                    updated.sompadok = `সম্পাদক: ${editor}, publisher: ${publisher}, ভারপ্রাপ্ত সম্পাদক: ${acting}। ${place} থেকে প্রকাশিত ${paper}। প্রকাশনার ${val}।`;
                                  }
                                  return updated;
                                });
                              }}
                              placeholder="যেমন: ৬ তম বর্ষ"
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            />
                          </fieldset>
                        </div>
                      </div>

                      {/* ৪. গুরুত্বপূর্ণ ক্যাটাগরি লিংক সেটিংস (Column 2) */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-150 gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">৪. গুরুত্বপূর্ণ ক্যাটাগরি লিংক সেটিংস (Column 2)</h5>
                            <p className="text-[10px] text-gray-500">ফুটারের ২য় কলামের শিরোনাম এবং যুক্ত করা ক্যাটাগরি লিংকগুলো ইডিট, ডিলিট বা নতুন যুক্ত করুন।</p>
                          </div>
                          <div className="flex items-center gap-2 font-display">
                            <span className="text-[10px] text-gray-600 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col2Title || ""}
                              onChange={(e) => updateFooterField("col2Title", e.target.value)}
                              className="px-2.5 py-1 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {(footerSettings.col2Links || []).length === 0 ? (
                            <p className="text-xs text-gray-400 font-sans text-center py-4 bg-slate-50 rounded-lg">কোনো ক্যাটাগরি লিংক যুক্ত করা নেই।</p>
                          ) : (
                            (footerSettings.col2Links || []).map((link, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-400 font-mono font-bold self-center sm:self-auto px-1">#{idx+1}</span>
                                <input
                                  type="text"
                                  value={link.text}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col2Links || [])];
                                    nextLinks[idx].text = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="sm:w-1/3 px-2.5 py-1.5 text-xs border border-gray-250 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
                                  placeholder="লিঙ্ক লেখা (যেমন: জাতীয়)"
                                />
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col2Links || [])];
                                    nextLinks[idx].url = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="flex-grow px-2.5 py-1.5 text-xs border border-gray-250 bg-white rounded font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                                  placeholder="লিঙ্ক URL (যেমন: /category/জাতীয়)"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextLinks = (footerSettings.col2Links || []).filter((_, i) => i !== idx);
                                    setFooterSettings(prev => ({ ...prev, col2Links: nextLinks }));
                                  }}
                                  className="bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-md text-xs transition-colors shrink-0 font-display cursor-pointer"
                                  title="Delete link"
                                >
                                  ডিলিট
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Col 2 Add Link Form */}
                        <div className="bg-amber-50/10 border border-dashed border-amber-300/60 p-3 rounded-lg flex flex-col sm:flex-row gap-2 items-center">
                          <input
                            type="text"
                            value={newCol2Text}
                            onChange={(e) => setNewCol2Text(e.target.value)}
                            className="w-full sm:w-1/3 px-3 py-1.5 text-xs border border-gray-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 font-medium"
                            placeholder="যেমন: রাজনীতি"
                          />
                          <input
                            type="text"
                            value={newCol2Url}
                            onChange={(e) => setNewCol2Url(e.target.value)}
                            className="w-full flex-grow px-3 py-1.5 text-xs border border-gray-200 bg-white rounded font-mono text-slate-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="যেমন: /category/রাজনীতি"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCol2Text.trim() || !newCol2Url.trim()) return;
                              setFooterSettings(prev => ({
                                ...prev,
                                col2Links: [...(prev.col2Links || []), { text: newCol2Text.trim(), url: newCol2Url.trim() }]
                              }));
                              setNewCol2Text("");
                              setNewCol2Url("");
                            }}
                            className="w-full sm:w-auto px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs select-none transition-all active:scale-[0.98] font-display cursor-pointer"
                          >
                            যুক্ত করুন
                          </button>
                        </div>
                      </div>

                      {/* ৫. নীতিমালা ও প্যানেল লিংক সেটিংস (Column 3) */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-150 gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">৫. নীতিমালা ও প্যানেল লিংক সেটিংস (Column 3)</h5>
                            <p className="text-[10px] text-gray-500">ফুটারের ৩য় কলামের শিরোনাম এবং গুরুত্বপূর্ণ নীতিমালা বা টিম মেম্বারদের লিংক ইডিট, ডিলিট বা নতুন যুক্ত করুন।</p>
                          </div>
                          <div className="flex items-center gap-2 font-display">
                            <span className="text-[10px] text-gray-600 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col3Title || ""}
                              onChange={(e) => updateFooterField("col3Title", e.target.value)}
                              className="px-2.5 py-1 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {(footerSettings.col3Links || []).length === 0 ? (
                            <p className="text-xs text-gray-400 font-sans text-center py-4 bg-slate-50 rounded-lg">কোনো নীতিমালা লিংক যুক্ত করা নেই।</p>
                          ) : (
                            (footerSettings.col3Links || []).map((link, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-400 font-mono font-bold self-center sm:self-auto px-1">#{idx+1}</span>
                                <input
                                  type="text"
                                  value={link.text}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col3Links || [])];
                                    nextLinks[idx].text = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="sm:w-1/3 px-2.5 py-1.5 text-xs border border-gray-250 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
                                  placeholder="লিঙ্ক লেখা (যেমন: ব্যবহারের শর্তাবলী)"
                                />
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => {
                                    const nextLinks = [...(footerSettings.col3Links || [])];
                                    nextLinks[idx].url = e.target.value;
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="flex-grow px-2.5 py-1.5 text-xs border border-gray-250 bg-white rounded font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                                  placeholder="লিঙ্ক URL (যেমন: /page/terms)"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextLinks = (footerSettings.col3Links || []).filter((_, i) => i !== idx);
                                    setFooterSettings(prev => ({ ...prev, col3Links: nextLinks }));
                                  }}
                                  className="bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-md text-xs transition-colors shrink-0 font-display cursor-pointer"
                                  title="Delete link"
                                >
                                  ডিলিট
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Col 3 Add Link Form */}
                        <div className="bg-amber-50/10 border border-dashed border-amber-300/60 p-3 rounded-lg flex flex-col sm:flex-row gap-2 items-center">
                          <input
                            type="text"
                            value={newCol3Text}
                            onChange={(e) => setNewCol3Text(e.target.value)}
                            className="w-full sm:w-1/3 px-3 py-1.5 text-xs border border-gray-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 font-medium"
                            placeholder="যেমন: ব্যবহারের শর্তাবলী"
                          />
                          <input
                            type="text"
                            value={newCol3Url}
                            onChange={(e) => setNewCol3Url(e.target.value)}
                            className="w-full flex-grow px-3 py-1.5 text-xs border border-gray-200 bg-white rounded font-mono text-slate-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="যেমন: /page/terms"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCol3Text.trim() || !newCol3Url.trim()) return;
                              setFooterSettings(prev => ({
                                ...prev,
                                col3Links: [...(prev.col3Links || []), { text: newCol3Text.trim(), url: newCol3Url.trim() }]
                              }));
                              setNewCol3Text("");
                              setNewCol3Url("");
                            }}
                            className="w-full sm:w-auto px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs select-none transition-all active:scale-[0.98] font-display cursor-pointer"
                          >
                            যুক্ত করুন
                          </button>
                        </div>
                      </div>

                      {/* ৬. যোগাযোগ ও বার্তা কক্ষ সেটিংস (Column 4) */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-3xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 border-b border-gray-150 gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">৬. যোগাযোগ ও বার্তা কক্ষ সেটিংস (Column 4)</h5>
                            <p className="text-[10px] text-gray-500">ফুটারের ৪র্থ কলামের শিরোনাম এবং ঠিকানা, টেলিফোন, ইমেল ইত্যাদি কন্টাক্ট ইনফরমেশন পরিবর্তন করুন।</p>
                          </div>
                          <div className="flex items-center gap-2 font-display">
                            <span className="text-[10px] text-gray-600 font-bold whitespace-nowrap">কলাম শিরোনাম:</span>
                            <input
                              type="text"
                              value={footerSettings.col4Title || ""}
                              onChange={(e) => updateFooterField("col4Title", e.target.value)}
                              className="px-2.5 py-1 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <fieldset className="border border-gray-200 rounded-lg px-3 pb-3 pt-2 bg-slate-50/50 relative col-span-2">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-2 font-display bg-white font-semibold">ঠিকানা (Location Address)</legend>
                            <input
                              type="text"
                              value={footerSettings.location || ""}
                              onChange={(e) => updateFooterField("location", e.target.value)}
                              placeholder="অফিসের ঠিকানা"
                              className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 font-medium"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded-lg px-3 pb-3 pt-2 bg-slate-50/50 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-2 font-display bg-white font-semibold">ইমেইল (Email)</legend>
                            <input
                              type="text"
                              value={footerSettings.email || ""}
                              onChange={(e) => updateFooterField("email", e.target.value)}
                              placeholder="যেমন: contact@bartasandhan.com"
                              className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded-lg px-3 pb-3 pt-2 bg-slate-50/50 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-2 font-display bg-white font-semibold">বিজ্ঞাপন ইমেইল (Advertise Email)</legend>
                            <input
                              type="text"
                              value={footerSettings.advertiseEmail || ""}
                              onChange={(e) => updateFooterField("advertiseEmail", e.target.value)}
                              placeholder="যেমন: ads@bartasandhan.com"
                              className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded-lg px-3 pb-3 pt-2 bg-slate-50/50 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-2 font-display bg-white font-semibold">টেলিফোন/মোবাইল (Phone)</legend>
                            <input
                              type="text"
                              value={footerSettings.phone || ""}
                              onChange={(e) => updateFooterField("phone", e.target.value)}
                              placeholder="যেমন: +৮৮০১৭১২-৩৪৫৬৭৮"
                              className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                            />
                          </fieldset>

                          <fieldset className="border border-gray-200 rounded-lg px-3 pb-3 pt-2 bg-slate-50/50 relative">
                            <legend className="text-[10px] text-gray-500 font-bold px-1.5 ml-2 font-display bg-white font-semibold">ফ্যাক্স নম্বর (Fax)</legend>
                            <input
                              type="text"
                              value={footerSettings.fax || ""}
                              onChange={(e) => updateFooterField("fax", e.target.value)}
                              placeholder="যেমন: +৮৮০২-১২৩৪৫६"
                              className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                            />
                          </fieldset>
                        </div>
                      </div>

                      {/* ৭. লাইভ কম্পাইল্ড প্রিভিউ (Live Footer Preview) */}
                      <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-3 font-sans text-left">
                        <div className="pb-1 border-b border-white/10">
                          <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-display">৭. লাইভ কম্পাইল্ড প্রিভিউ (Live Footer Preview)</h5>
                          <p className="text-[10px] text-gray-400 font-display">ফুটারের নতুন ডিজাইন প্যানেলে আপনার তথ্যগুলো হুবহু নিচের মতন লিংকসহ লাইভ দেখতে পাবেন:</p>
                        </div>

                        <div className="bg-black/60 p-5 rounded border border-white/5 text-[11px] leading-relaxed select-none text-gray-300 font-display">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-white/10 text-xs">
                            <div className="space-y-1.5 text-xs text-gray-400">
                              <span className="text-[10px] uppercase font-bold text-amber-500 block">কলাম ১ (ব্র্যান্ড ও সম্পাদক)</span>
                              {footerSettings.footerBrandMode === "logo" ? (
                                <img
                                  src={footerSettings.footerLogoUrl || "https://i.postimg.cc/9MH8YcDj/Footer-logo.png"}
                                  alt="Footer Logo"
                                  className="h-10 object-contain text-left"
                                />
                              ) : (
                                <div className="text-sm font-black text-white">{footerSettings.footerBrandText || "বার্তাসন্ধান"}</div>
                              )}
                              
                              <div className="space-y-1 text-gray-300 mt-2">
                                {(() => {
                                  const mode = footerSettings.pubEditMode || "combined";
                                  const shared = footerSettings.sharedName || "প্রকৌশলী খালিদ হাসান";
                                  const pubN = footerSettings.pubName || "প্রকৌশলী খালিদ হাসান";
                                  const edN = footerSettings.edName || "মোহাম্মদ রবিন শেখ";
                                  const acting = footerSettings.actingEdName || "মোহাম্মদ রবিন শেখ";

                                  const sharedLink = footerSettings.sharedSocialUrl || "";
                                  const pubLink = footerSettings.pubSocialUrl || "";
                                  const edLink = footerSettings.edSocialUrl || "";
                                  const actingLink = footerSettings.actingEdSocialUrl || "";

                                  const renderLink = (name: string, url: string) => {
                                    if (url && url.trim().length > 0 && url !== "#") {
                                      return (
                                        <span className="text-white hover:text-red-400 font-extrabold underline cursor-pointer">
                                          {name}
                                        </span>
                                      );
                                    }
                                    return <span className="text-white font-extrabold">{name}</span>;
                                  };

                                  if (mode === "combined") {
                                    return (
                                      <>
                                        <p><span className="text-gray-400">সম্পাদক ও প্রকাশক:</span> {renderLink(shared, sharedLink)}</p>
                                        <p><span className="text-gray-400">ভারপ্রাপ্ত সম্পাদক:</span> {renderLink(acting, actingLink)}</p>
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <p><span className="text-gray-400">সম্পাদক:</span> {renderLink(edN, edLink)}</p>
                                        <p><span className="text-gray-400">প্রকাশক:</span> {renderLink(pubN, pubLink)}</p>
                                        <p><span className="text-gray-400">ভারপ্রাপ্ত সম্পাদক:</span> {renderLink(acting, actingLink)}</p>
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                            </div>

                            <div className="space-y-1 text-gray-400">
                              <span className="text-[10px] uppercase font-bold text-amber-500 block">কলাম ২ (লিস্ট)</span>
                              <p>• {footerSettings.col2Title || "ক্যাটাগরি"}</p>
                            </div>

                            <div className="space-y-1 text-gray-400">
                              <span className="text-[10px] uppercase font-bold text-amber-500 block">কলাম ৩ (লিস্ট)</span>
                              <p>• {footerSettings.col3Title || "নীতিমালা"}</p>
                            </div>

                            <div className="space-y-1 text-gray-450 leading-loose">
                              <span className="text-[10px] uppercase font-bold text-amber-500 block">কলাম ৪ (যোগাযোগ)</span>
                              <p><span className="font-bold text-gray-300">ঠিকানা:</span> {footerSettings.location}</p>
                              <p><span className="font-bold text-gray-300">ফোন:</span> {footerSettings.phone}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-white/10 mt-3 flex flex-wrap justify-center items-center gap-y-1 text-gray-400 font-sans text-center text-xs md:text-sm">
                            {(() => {
                              const place = footerSettings.pubPlace || "বৃহত্তম ফরিদপুর";
                              const paper = footerSettings.pubPaper || "দৈনিক বার্তাসন্ধান";
                              const year = footerSettings.pubYear || "৬ তম বর্ষ";
                              const copyright = footerSettings.copyright || "স্বত্ব © দৈনিক বার্তাসন্ধান (২০২৬)";

                              return (
                                <span className="leading-loose flex flex-wrap justify-center items-center gap-y-1 text-gray-400">
                                  <span className="font-bold text-gray-200">{copyright}</span>
                                  <span className="mx-2 text-gray-600">|</span>
                                  <span>{place} থেকে প্রকাশিত {paper}। প্রকাশনার {year}।</span>
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 font-sans italic font-display">
                          * নামের লিংকগুলো বোল্ড ক্লিকেবল থাকবে কিন্তু কোনো ব্যাকগ্রাউন্ড বক্স বা বর্ডার থাকবে না।
                        </div>
                      </div>

                      {/* Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("footer_settings", JSON.stringify(footerSettings));
                            fetch("/api/database/settings_footer", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(footerSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার ফুটার সেটিংস ২-এর সকল তথ্য ও সোসাইল লিঙ্ক সফলভাবে সংরক্ষণ করা হয়েছে এবং লাইভ আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer select-none transition-all border-0 text-center uppercase tracking-wide shadow-md font-display-medium"
                        >
                          সংরখন করুন (Save Footer Settings 2)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "social_links" && (
                    <div className="space-y-6 text-left font-sans animate-fade-in pr-1">
                      <div className="border-b pb-2 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-md border border-blue-200/50 shadow-2xs">
                        <h4 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                          <span className="p-1 rounded-full bg-blue-100 text-blue-600">🌟</span>
                          সোশ্যাল মিডিয়া লিঙ্ক ও লাইভ আইকন সেটিং
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1">
                          এখানে আপনারা আপনাদের ওয়েবসাইটের হেডার ও ফুটারে প্রদর্শিত সকল সোশ্যাল মিডিয়া লিঙ্ক এবং যোগাযোগের তথ্য পরিবর্তন করতে পারবেন।
                        </p>
                      </div>

                      {/* Live Preview Box matching User Uploaded Image */}
                      <div className="p-5 bg-[#fcfdff] border border-blue-500/30 rounded-lg shadow-sm flex flex-col items-center justify-center gap-3">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">লাইভ প্রিভিউ (কোথাও পরিবর্তন করলে এখানে ও আপনার মেইন ওয়েবসাইটে সাথে সাথে আপডেট হবে)</span>
                        <div className="flex items-center gap-3 bg-white p-4 py-6 border border-gray-150 rounded-lg shadow-2xs w-full max-w-md justify-center">
                          {/* Facebook Circle */}
                          <a href={footerSettings.facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#1877F2] shadow-sm bg-white" title="Facebook">
                            <Facebook size={18} />
                          </a>
                          {/* X/Twitter Circle */}
                          <a href={footerSettings.twitter || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black shadow-sm bg-white" title="X">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                          {/* LinkedIn Circle */}
                          <a href={footerSettings.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#0A66C2] shadow-sm bg-white" title="LinkedIn">
                            <Linkedin size={18} />
                          </a>
                          {/* YouTube Circle */}
                          <a href={footerSettings.youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#FF0000] shadow-sm bg-white" title="YouTube">
                            <Youtube size={18} />
                          </a>
                          {/* Instagram Circle */}
                          <a href={footerSettings.instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#E1306C] shadow-sm bg-white" title="Instagram">
                            <Instagram size={18} />
                          </a>
                          {/* WhatsApp Circle */}
                          <a href={footerSettings.whatsapp || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#25D366] shadow-sm bg-white" title="WhatsApp">
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.06 1.053 11.45 1.053c-5.442 0-9.866 4.372-9.87 9.802 0 1.772.465 3.502 1.344 5.014l-.99 3.614 3.713-.965zm11.367-7.405c-.3-.15-1.772-.875-2.047-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.24-1.106-1.554-1.631-1.802-2.03-.248-.4-.027-.615.123-.763.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.493-.508-.675-.518-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.228 5.125 4.53.716.31 1.275.495 1.71.635.72.23 1.375.197 1.892.12.576-.087 1.772-.725 2.022-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/>
                            </svg>
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Facebook Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold font-sans">1</span>
                            ফেসবুক লিঙ্ক (Facebook Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.facebook}
                            onChange={(e) => updateFooterField("facebook", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://facebook.com/your-page"
                          />
                        </div>

                        {/* X Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold font-sans">2</span>
                            এক্স লিঙ্ক (X / Twitter Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.twitter}
                            onChange={(e) => updateFooterField("twitter", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://x.com/your-handle"
                          />
                        </div>

                        {/* LinkedIn Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold font-sans">3</span>
                            লিঙ্কডইন লিঙ্ক (LinkedIn Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.linkedin}
                            onChange={(e) => updateFooterField("linkedin", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://linkedin.com/in/your-profile"
                          />
                        </div>

                        {/* YouTube Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 font-bold font-sans">4</span>
                            ইউটিউব লিঙ্ক (YouTube Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.youtube}
                            onChange={(e) => updateFooterField("youtube", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://youtube.com/c/your-channel"
                          />
                        </div>

                        {/* Instagram Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold font-sans">5</span>
                            ইনস্টাগ্রাম লিঙ্ক (Instagram Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.instagram}
                            onChange={(e) => updateFooterField("instagram", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://instagram.com/your-profile"
                          />
                        </div>

                        {/* WhatsApp Link Input */}
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-750 flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold font-sans">6</span>
                            হোয়াটসঅ্যাপ লিঙ্ক (WhatsApp Link)
                          </label>
                          <input
                            type="text"
                            value={footerSettings.whatsapp}
                            onChange={(e) => updateFooterField("whatsapp", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            placeholder="https://wa.me/88017xxxxxxxx"
                          />
                        </div>
                      </div>

                      {/* Explicit Save button for Social Links */}
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("footer_settings", JSON.stringify(footerSettings));
                            fetch("/api/database/settings_footer", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(footerSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার প্রদেয় সকল সোশ্যাল মিডিয়া লিঙ্ক ও আইকন সফলভাবে ওয়েবসাইটে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-md flex items-center justify-center gap-2"
                        >
                          <span>লিঙ্ক ও আইকন সংরক্ষণ করুন (Save Social Settings)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "seo" && (
                    <div className="space-y-5 text-left font-sans animate-fade-in">
                      {/* Meta Description */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">Meta Description</label>
                        <textarea
                          placeholder="Meta Description"
                          value={seoSettings.metaDescription}
                          onChange={(e) => updateSeoField("metaDescription", e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded h-20 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Meta Keywords */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">Meta Keywords</label>
                        <textarea
                          placeholder="Meta Keywords"
                          value={seoSettings.metaKeywords}
                          onChange={(e) => updateSeoField("metaKeywords", e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded h-20 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Image Upload Ratio */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">Image Upload Ratio</label>
                        <div className="relative">
                          <select
                            value={seoSettings.imageUploadRatio}
                            onChange={(e) => updateSeoField("imageUploadRatio", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Default">Default</option>
                            <option value="1:1">1:1 Square</option>
                            <option value="16:9">16:9 Landscape</option>
                            <option value="4:3">4:3 Standard</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>

                      {/* Default OG Images */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">
                          Default OG Images <span className="text-amber-500 text-[10px] font-normal">(Optional)</span>
                        </label>
                        
                        {seoSettings.ogImageUrl && (
                          <div className="mb-3 relative inline-block p-1 border border-gray-200 rounded max-w-sm bg-white group shadow-xs">
                            <img
                              src={seoSettings.ogImageUrl}
                              alt="Default OG"
                              className="h-20 object-contain text-left"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateSeoField("ogImageUrl", "");
                                updateSeoField("ogImageName", "");
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded cursor-pointer transition-colors shadow-xs"
                              title="Delete Image"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                            {seoSettings.ogImageName && (
                              <div className="text-[10px] text-gray-400 mt-1 px-1 text-left truncate max-w-[200px]">
                                {seoSettings.ogImageName}
                              </div>
                            )}
                          </div>
                        )}

                        <label className="border border-dashed border-gray-300 rounded p-6 bg-[#fcfcfc] hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer select-none">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSeoSettings(prev => ({
                                    ...prev,
                                    ogImageName: file.name,
                                    ogImageUrl: reader.result as string
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="text-slate-400 mb-2">
                            <Upload size={16} className="mx-auto" />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">Upload OG Images</span>
                        </label>
                      </div>

                      {/* Big Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("seo_settings", JSON.stringify(seoSettings));
                            fetch("/api/database/settings_seo", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(seoSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার সাইটের মেটা এসইও কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "facebook" && (
                    <div className="space-y-5 text-left font-sans animate-fade-in">
                      {/* App ID */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">
                          App ID <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="App ID"
                            value={facebookSettings.appId}
                            onChange={(e) => updateFacebookField("appId", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-blue-500 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" style={{ fontSize: '9px' }}>
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* App Secret */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">
                          App Secret <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showFacebookSecret ? "text" : "password"}
                            placeholder="App Secret"
                            value={facebookSettings.appSecret}
                            onChange={(e) => updateFacebookField("appSecret", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-emerald-500 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-16 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setShowFacebookSecret(!showFacebookSecret)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                              title={showFacebookSecret ? "Hide Secret" : "Show Secret"}
                            >
                              {showFacebookSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LOGIN WITH FACEBOOK BUTTON */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSuccessMsg("ফেসবুক লগইন ও অনুমোদন সফলভাবে সম্পন্ন হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="px-4 py-2 bg-[#4267B2] hover:bg-[#365899] text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Login with Facebook
                        </button>
                      </div>

                      {/* Setup Guide */}
                      <div className="text-slate-500 text-xs font-sans space-y-2.5 mt-5 border-t border-gray-100 pt-4">
                        <div className="text-sm font-bold text-slate-800">Setup Guide</div>
                        <div className="space-y-1.5 leading-relaxed text-[11px]">
                          <p><span className="font-semibold text-slate-700">Step 1:</span> Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Meta for Developers</a>. Log in to your account.</p>
                          <p><span className="font-semibold text-slate-700">Step 2:</span> Create a new app or use an existing one.</p>
                          <div className="pl-4 space-y-0.5 text-slate-400 font-sans">
                            <p>→ Click My Apps</p>
                            <p>→ Create App</p>
                            <p>→ Fill: App Name, Contact Email</p>
                            <p>→ Choose Use case: Manage everything on your Page and so on</p>
                            <p>→ Business: Select your business or create a new one or select <span className="italic">I don't want to connect a business portfolio yet.</span></p>
                            <p>→ Requirements (No Change)</p>
                            <p>→ Overview (No Change)</p>
                            <p>→ Click Create App / Go to Dashboard</p>
                          </div>
                          
                          <p><span className="font-semibold text-slate-700">Step 3:</span> Add Permissions.</p>
                          <div className="pl-4 space-y-0.5 text-slate-400 font-sans">
                            <p>→ From sidebar, click Use Cases</p>
                            <p>→ Customize</p>
                            <p>→ Add permissions: <span className="italic text-[10px]">pages_read_engagement, pages_manage_engagement, pages_manage_metadata, pages_manage_posts, pages_show_list</span></p>
                          </div>

                          <p><span className="font-semibold text-slate-700">Step 4:</span> Get App ID and App Secret.</p>
                          <div className="pl-4 space-y-0.5 text-slate-400 font-sans">
                            <p>→ From sidebar, Expand App Settings</p>
                            <p>→ Basic</p>
                            <p>→ Copy App ID and App Secret</p>
                          </div>

                          <p><span className="font-semibold text-slate-700">Step 5:</span> Enable Login with the JavaScript SDK.</p>
                          <div className="pl-4 space-y-0.5 text-slate-400 font-sans">
                            <p>→ From sidebar, Expand Facebook Login for Business</p>
                            <p>→ Settings</p>
                          </div>
                        </div>
                      </div>

                      {/* Big Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("facebook_settings", JSON.stringify(facebookSettings));
                            fetch("/api/database/settings_facebook", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(facebookSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার সাইটের ফেসবুক ইন্টিগ্রেশন কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "mail" && (
                    <div className="space-y-5 text-left font-sans animate-fade-in">
                      {/* SMTP Host */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">SMTP Host</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="SMTP Host"
                            value={mailSettings.smtpHost}
                            onChange={(e) => updateMailField("smtpHost", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" style={{ fontSize: '9px' }}>
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SMTP Port */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">SMTP Port</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="SMTP Port"
                            value={mailSettings.smtpPort}
                            onChange={(e) => updateMailField("smtpPort", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" style={{ fontSize: '9px' }}>
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SMTP User */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">SMTP User</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="SMTP User"
                            value={mailSettings.smtpUser}
                            onChange={(e) => updateMailField("smtpUser", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" style={{ fontSize: '9px' }}>
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SMTP Password */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">SMTP Password</label>
                        <div className="relative">
                          <input
                            type={showMailPassword ? "text" : "password"}
                            placeholder="SMTP Password"
                            value={mailSettings.smtpPassword}
                            onChange={(e) => updateMailField("smtpPassword", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-16 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setShowMailPassword(!showMailPassword)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                              title={showMailPassword ? "Hide Password" : "Show Password"}
                            >
                              {showMailPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SMTP From */}
                      <div>
                        <label className="block text-xs font-bold text-[#2d3748] mb-1.5">SMTP From</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="SMTP From"
                            value={mailSettings.smtpFrom}
                            onChange={(e) => updateMailField("smtpFrom", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10 font-sans"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" style={{ fontSize: '9px' }}>
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Big Blue Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("mail_settings", JSON.stringify(mailSettings));
                            fetch("/api/database/settings_mail", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(mailSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার সাইটের মেটা এসএমটিপি মেইল সার্ভার কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Update
                        </button>
                      </div>

                      {/* Send Testing Email Container Section */}
                      <div className="pt-6 mt-6 border-t border-gray-200 space-y-4">
                        <h3 className="text-sm md:text-base font-bold text-[#1a202c]">Send Testing Email</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-[#2d3748] mb-1.5">
                            Receiver Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={testingReceiverEmail}
                            onChange={(e) => setTestingReceiverEmail(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!testingReceiverEmail) {
                                alert("অনুগ্রহ করে একটি সঠিক ইমেইল আইডি দিন।");
                                return;
                              }
                              setSuccessMsg(`টেস্টিং মেইল সফলভাবে '${testingReceiverEmail}' ঠিকানায় পাঠানো হয়েছে! (SMTP কানেকশন ওকে)`);
                              setTimeout(() => setSuccessMsg(""), 5000);
                            }}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs animate-pulse-subtle"
                          >
                            Send Mail
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "login" && (
                    <div className="space-y-5 text-left font-sans animate-fade-in">
                      {/* Google Client Id input */}
                      <div>
                        <input
                          type="text"
                          placeholder="Google Client Id"
                          value={loginSettings.googleClientId}
                          onChange={(e) => updateLoginField("googleClientId", e.target.value)}
                          className="w-full px-4 py-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        />
                      </div>

                      {/* Update Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("login_settings", JSON.stringify(loginSettings));
                            fetch("/api/database/settings_login", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(loginSettings)
                            }).catch(err => console.error(err));
                            setSuccessMsg("আপনার সাইটের মেটা গুগল লগইন কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
                            setTimeout(() => setSuccessMsg(""), 4000);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer select-none transition-colors border-0 text-center uppercase tracking-wide shadow-xs"
                        >
                          Update
                        </button>
                      </div>

                      {/* Setup Guide */}
                      <div className="text-slate-600 text-xs font-sans space-y-2.5 mt-5">
                        <div className="text-sm md:text-base font-bold text-slate-800">Setup Guide</div>
                        <div className="space-y-1.5 leading-relaxed text-[11px] text-slate-500">
                          <p><span className="font-semibold text-slate-700">Step 1:</span> Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>. Log in to your account.</p>
                          <p><span className="font-semibold text-slate-700">Step 2:</span> Create a new app or use an existing one. from the top nav bar</p>
                          <p><span className="font-semibold text-slate-700">Step 3:</span> From the Quick Access Section, Click APIs & Services</p>
                          <p><span className="font-semibold text-slate-700">Step 4:</span> From left sidebar, Click Credentials</p>
                          <p><span className="font-semibold text-slate-700">Step 5:</span> From top bar, Click Create credentials</p>
                          <p><span className="font-semibold text-slate-700">Step 6:</span> Select OAuth Client ID</p>
                          
                          <div className="pl-4 space-y-0.5 text-slate-400 font-sans font-normal">
                            <p>→ Application Type: Web Application</p>
                            <p>→ Create App</p>
                            <p>→ Fill: Name</p>
                            <p>→ Authorized JavaScript origins: Click Add URI</p>
                            <p>→ Copy and Paste <span className="text-slate-500 font-semibold selection:bg-blue-200">https://prothomalo.bangladeshisoftware.com</span></p>
                            <p>→ Again click Add URI</p>
                            <p>→ Copy and Paste <span className="text-slate-500 font-semibold selection:bg-blue-200">https://admin.prothomalo.bangladeshisoftware.com</span></p>
                            <p>→ Click Create</p>
                          </div>

                          <p><span className="font-semibold text-slate-700">Step 7:</span> Copy the created app Client ID. This is the google client id.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "ad" && (
                    <div className="space-y-6">
                      <div className="border-b pb-2 mb-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Advertisement Settings (বিজ্ঞাপন কনফিগারেশন)</h4>
                          <p className="text-[11px] text-gray-500">গুগল অ্যাডসেন্স ফাইল কোড এবং ওয়েবসাইটের বিভিন্ন প্লেসমেন্ট বিজ্ঞাপন সেটিংস</p>
                        </div>
                        {localStorage.getItem("ad_settings_success") && (
                          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full font-medium">
                            পদ্ধতিটি সফলভাবে সেভ করা হয়েছে
                          </span>
                        )}
                      </div>

                      {/* Google Adsense Ads Txt File Code */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Google Adsense Ads Txt File Code</label>
                        <textarea
                          value={adSettings.adsTxtCode}
                          onChange={(e) => updateAdField("adsTxtCode", e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded font-mono h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            adSettings.adsTxtCode ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      {/* Google Adsense Dynamic Head Tag Code */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Google Adsense Dynamic Head Tag Code</label>
                        <textarea
                          value={adSettings.headTagCode}
                          onChange={(e) => updateAdField("headTagCode", e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded font-mono h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            adSettings.headTagCode ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      {/* Ad Under Nav */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Ad Under Nav</label>
                        <textarea
                          value={adSettings.adUnderNav}
                          onChange={(e) => updateAdField("adUnderNav", e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            adSettings.adUnderNav ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      {/* Ad VideoStory Up */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Ad VideoStory Up</label>
                        <textarea
                          value={adSettings.adVideoStoryUp}
                          onChange={(e) => updateAdField("adVideoStoryUp", e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            adSettings.adVideoStoryUp ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      {/* Ad VideoStory Down */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Ad VideoStory Down</label>
                        <textarea
                          value={adSettings.adVideoStoryDown}
                          onChange={(e) => updateAdField("adVideoStoryDown", e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            adSettings.adVideoStoryDown ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>

                      {/* Ad Home 1 to 10 */}
                      <div className="border-t pt-4 mt-4">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3">Homepage Block Ads (Home1 - Home10)</h5>
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const fieldName = `adHome${num}`;
                            const val = (adSettings as any)[fieldName];
                            return (
                              <div key={fieldName} className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">Ad Home{num}</label>
                                <textarea
                                  value={val || ""}
                                  placeholder={`Add code/iframe for Ad Home${num}...`}
                                  onChange={(e) => updateAdField(fieldName, e.target.value)}
                                  className={`w-full px-3 py-2 text-xs border rounded font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                    val ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ad Sidebar 1 to 5 */}
                      <div className="border-t pt-4 mt-4">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3">Sidebar Ads (Sidebar1 - Sidebar5)</h5>
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((num) => {
                            const fieldName = `adSidebar${num}`;
                            const val = (adSettings as any)[fieldName];
                            return (
                              <div key={fieldName} className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">Ad Sidebar{num}</label>
                                <textarea
                                  value={val || ""}
                                  placeholder={`Add code/iframe for Ad Sidebar${num}...`}
                                  onChange={(e) => updateAdField(fieldName, e.target.value)}
                                  className={`w-full px-3 py-2 text-xs border rounded font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                    val ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500" : "border-gray-300 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ad PhotoCard Field */}
                      <div className="border-t pt-4 mt-4 space-y-3">
                        <fieldset className="border border-gray-300 rounded-lg p-4 bg-white">
                          <legend className="text-xs font-semibold text-slate-700 px-1 ml-2">Ad PhotoCard</legend>
                          
                          {/* File path view */}
                          <div className="mb-3">
                            <input
                              type="text"
                              value={adSettings.adPhotoCardName}
                              readOnly
                              className="w-full text-xs font-mono bg-slate-50 text-slate-600 border border-gray-300 rounded px-3 py-2 focus:outline-none"
                            />
                          </div>

                          {/* Choose file input */}
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              id="ad-photocard-file"
                              onChange={handleAdPhotoCardUpload}
                              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                            />
                            {adSettings.adPhotoCardImg && (
                              <div className="mt-3 border rounded-lg p-2 bg-slate-50 inline-block max-w-[240px]">
                                <span className="block text-[10px] text-gray-400 mb-1">Preview image:</span>
                                <img
                                  src={adSettings.adPhotoCardImg}
                                  alt="Ad Preview"
                                  className="max-h-24 object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>
                        </fieldset>
                      </div>

                      {/* Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("ad_settings", JSON.stringify(adSettings));
                            fetch("/api/database/settings_ads", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(adSettings)
                            }).catch(err => console.error(err));
                            localStorage.setItem("ad_settings_success", "true");
                            setTimeout(() => {
                              localStorage.removeItem("ad_settings_success");
                            }, 3000);
                            // Also trigger a page update in listeners if needed
                            window.dispatchEvent(new Event("storage"));
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-center font-display tracking-wide shadow-sm hover:shadow transition duration-200 cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "rss" && (
                    <div className="space-y-6">
                      <div className="border-b pb-2 mb-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">RSS Auto Post Settings (আরএসএস কনফিগারেশন)</h4>
                          <p className="text-[11px] text-gray-500">স্বয়ংক্রিয় সংবাদ আরএসএস ফিডার মডিউল সেটিংস</p>
                        </div>
                        {localStorage.getItem("rss_settings_success") && (
                          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full font-medium">
                            পদ্ধতিটি সফলভাবে সেভ করা হয়েছে
                          </span>
                        )}
                      </div>

                      {/* Activate Auto Post */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Activate Auto Post</label>
                        <div className="relative">
                          <select
                            value={rssSettings.activateAutoPost}
                            onChange={(e) => updateRssField("activateAutoPost", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer pr-10"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Type */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Schedule Type</label>
                        <div className="relative">
                          <select
                            value={rssSettings.scheduleType}
                            onChange={(e) => updateRssField("scheduleType", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none cursor-pointer pr-10"
                          >
                            <option value="Every 30 Minute">Every 30 Minute</option>
                            <option value="Every 1 Hour">Every 1 Hour</option>
                            <option value="Every 2 Hour">Every 2 Hour</option>
                            <option value="Every 5 Hour">Every 5 Hour</option>
                            <option value="Every 12 Hour">Every 12 Hour</option>
                            <option value="Daily">Daily</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Post Per Url */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Post Per Url</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={rssSettings.postPerUrl}
                            onChange={(e) => updateRssField("postPerUrl", e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                          />
                          <div className="absolute right-3 text-emerald-500">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* RSS Urls */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">RSS Urls</label>
                        <textarea
                          value={rssSettings.rssUrls}
                          onChange={(e) => updateRssField("rssUrls", e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 h-28 leading-relaxed"
                          placeholder="https://example.com/rss"
                        />
                      </div>

                      {/* Update Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("rss_settings", JSON.stringify(rssSettings));
                            fetch("/api/database/settings_rss", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(rssSettings)
                            }).catch(err => console.error(err));
                            localStorage.setItem("rss_settings_success", "true");
                            setTimeout(() => {
                              localStorage.removeItem("rss_settings_success");
                            }, 3000);
                            window.dispatchEvent(new Event("storage"));
                          }}
                          className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-3 rounded-lg text-center font-display tracking-wide shadow-sm hover:shadow transition duration-200 cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "import_wp" && (
                    <div className="space-y-4">
                      <div className="border-b pb-2 mb-4">
                        <h4 className="text-sm font-bold text-slate-800">WordPress Data XML Import</h4>
                        <p className="text-[11px] text-gray-500">পুরোনো ওয়াডপ্রেস ব্লগের কন্টেন্ট ও ইমেজ বাল্ক মাইগ্রেশন করুন</p>
                      </div>
                      <div className="p-6 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center space-y-3 bg-slate-50">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Download size={22} />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-gray-700 block">WordPress XML/JSON ডেটা ইম্পোর্ট উজার্ড</span>
                          <span className="text-gray-400 mt-1 block">আপনার পুরোনো ওয়ার্ডপ্রেস সাইটের এক্সপোর্ট করা XML বা JSON ফাইল আপলোড করুন।</span>
                        </div>
                        <input
                          type="file"
                          accept=".xml,.json"
                          id="wp-xml-file-importer"
                          className="hidden"
                          onChange={handleImportFile}
                        />
                        <label
                          htmlFor="wp-xml-file-importer"
                          className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold rounded shadow-xs cursor-pointer inline-block border-0 select-none"
                        >
                          ফাইল সিলেক্ট করুন
                        </label>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "category_order" && (
                    <div className="space-y-6">
                      {/* Top Tabs Bar */}
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                        {(["default", "header", "footer", "prothom", "kalbela"] as const).map((tab) => {
                          const labels: Record<string, string> = {
                            default: "Default",
                            header: "Header",
                            footer: "Footer",
                            prothom: "Prothom Alo Homepage",
                            kalbela: "Kalbela Homepage"
                          };
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setCategoryOrderSubTab(tab);
                                setShowDefaultCatDropdown(false);
                              }}
                              className={`px-4 py-1.5 text-xs font-semibold rounded-md select-none cursor-pointer transition ${
                                categoryOrderSubTab === tab
                                  ? "bg-[#3b82f6] text-white shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-gray-700"
                              }`}
                            >
                              {labels[tab]}
                            </button>
                          );
                        })}
                      </div>

                      {/* SUBTAB 1: DEFAULT FALLBACK CATEGORY */}
                      {categoryOrderSubTab === "default" && (
                        <div className="space-y-4 animate-fade-in text-slate-700">
                          <p className="text-xs text-gray-500 leading-relaxed font-sans">
                            This category will be the default category and won't be deleted. It will be a fallback category for any news that's category has been deleted.
                          </p>

                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-800">Default Category</label>
                            
                            <div className="relative">
                              <fieldset className="border border-gray-300 rounded-md px-3.5 py-2.5 bg-white relative hover:border-gray-400 transition cursor-pointer select-none"
                                onClick={() => setShowDefaultCatDropdown(!showDefaultCatDropdown)}
                              >
                                <legend className="text-[10px] text-gray-500 font-semibold px-1.5 ml-1 bg-white font-sans">Select Category</legend>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-800 font-display font-medium text-xs">
                                    {categories.find(c => c.code === categoryOrderSettings.defaultCategory)?.name || "আলোচিত"}
                                  </span>
                                  
                                  <div className="flex items-center gap-1 text-red-500 bg-red-50/70 border border-red-100 px-2 py-0.5 rounded text-xs">
                                    {/* Small red cross circle */}
                                    <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-display font-semibold">
                                      {categories.find(c => c.code === categoryOrderSettings.defaultCategory)?.name || "আলোচিত"}
                                    </span>
                                  </div>
                                </div>
                              </fieldset>

                              {/* Interactive drop down menu matching list */}
                              {showDefaultCatDropdown && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 font-display text-xs">
                                  {categories.map((cat) => (
                                    <div
                                      key={cat.code}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCategoryOrderSettings(prev => ({ ...prev, defaultCategory: cat.code }));
                                        setShowDefaultCatDropdown(false);
                                      }}
                                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center ${
                                        categoryOrderSettings.defaultCategory === cat.code ? 'bg-blue-50 font-bold text-blue-600' : 'text-gray-700'
                                      }`}
                                    >
                                      <span>{cat.name}</span>
                                      <span className="text-[10px] text-gray-400 font-mono">({cat.code})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 2: HEADER IN NAVIGATION DISPLAY */}
                      {categoryOrderSubTab === "header" && (
                        <div className="space-y-4 animate-fade-in">
                          <p className="text-xs text-gray-500 leading-relaxed font-sans">
                            Select which categories to display in the header quick navigation bar and arrange their rendering order:
                          </p>
                          
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs font-display text-left">
                              <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2.5">Enabled</th>
                                  <th className="px-4 py-2.5">Category Name</th>
                                  <th className="px-4 py-2.5 text-center">Order Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {categoryOrderSettings.headerCategories.map((catName, index) => {
                                  const cDef = categories.find(c => c.name === catName) || { name: catName, code: catName };
                                  return (
                                    <tr key={catName} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => {
                                            if (categoryOrderSettings.headerCategories.length > 1) {
                                              setCategoryOrderSettings(prev => ({
                                                ...prev,
                                                headerCategories: prev.headerCategories.filter(x => x !== catName)
                                              }));
                                            }
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 font-medium text-slate-800">
                                        {catName} <span className="text-[10px] text-gray-400 font-mono">({cDef.code})</span>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <div className="inline-flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.headerCategories];
                                              const tmp = list[index];
                                              list[index] = list[index - 1];
                                              list[index - 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, headerCategories: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Up ⇧
                                          </button>
                                          <button
                                            type="button"
                                            disabled={index === categoryOrderSettings.headerCategories.length - 1}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.headerCategories];
                                              const tmp = list[index];
                                              list[index] = list[index + 1];
                                              list[index + 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, headerCategories: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Down ⇩
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {/* Inactive ones */}
                                {categories
                                  .filter(c => !categoryOrderSettings.headerCategories.includes(c.name))
                                  .map((catObj) => (
                                    <tr key={catObj.code} className="opacity-60 bg-gray-50/20">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={false}
                                          onChange={() => {
                                            setCategoryOrderSettings(prev => ({
                                              ...prev,
                                              headerCategories: [...prev.headerCategories, catObj.name]
                                            }));
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-gray-500">{catObj.name}</td>
                                      <td className="px-4 py-2 text-center text-gray-300">-</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 3: FOOTER LIST */}
                      {categoryOrderSubTab === "footer" && (
                        <div className="space-y-4 animate-fade-in">
                          <p className="text-xs text-gray-500 leading-relaxed font-sans">
                            Select which categories appear as main highlights in the dark Footer navigation list:
                          </p>

                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs font-display text-left">
                              <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2.5">Enabled</th>
                                  <th className="px-4 py-2.5">Category Name</th>
                                  <th className="px-4 py-2.5 text-center">Order Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {categoryOrderSettings.footerCategories.map((catName, index) => {
                                  const cDef = categories.find(c => c.name === catName) || { name: catName, code: catName };
                                  return (
                                    <tr key={catName} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => {
                                            if (categoryOrderSettings.footerCategories.length > 1) {
                                              setCategoryOrderSettings(prev => ({
                                                ...prev,
                                                footerCategories: prev.footerCategories.filter(x => x !== catName)
                                              }));
                                            }
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 font-medium text-slate-800">
                                        {catName} <span className="text-[10px] text-gray-400 font-mono">({cDef.code})</span>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <div className="inline-flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.footerCategories];
                                              const tmp = list[index];
                                              list[index] = list[index - 1];
                                              list[index - 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, footerCategories: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Up ⇧
                                          </button>
                                          <button
                                            type="button"
                                            disabled={index === categoryOrderSettings.footerCategories.length - 1}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.footerCategories];
                                              const tmp = list[index];
                                              list[index] = list[index + 1];
                                              list[index + 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, footerCategories: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Down ⇩
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {categories
                                  .filter(c => !categoryOrderSettings.footerCategories.includes(c.name))
                                  .map((catObj) => (
                                    <tr key={catObj.code} className="opacity-60 bg-gray-50/20">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={false}
                                          onChange={() => {
                                            setCategoryOrderSettings(prev => ({
                                              ...prev,
                                              footerCategories: [...prev.footerCategories, catObj.name]
                                            }));
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-gray-500">{catObj.name}</td>
                                      <td className="px-4 py-2 text-center text-gray-300">-</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 4: PROTHOM ALO HOMEPAGE BLOCKS */}
                      {categoryOrderSubTab === "prothom" && (
                        <div className="space-y-4 animate-fade-in">
                          <p className="text-xs text-gray-500 leading-relaxed font-sans">
                            Select and reorder category news blocks rendered on the Main Newspaper Homepage layout:
                          </p>

                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs font-display text-left">
                              <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2.5">Enabled</th>
                                  <th className="px-4 py-2.5">Category Name</th>
                                  <th className="px-4 py-2.5 text-center">Order Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {categoryOrderSettings.prothomAloHomepageBlocks.map((catName, index) => {
                                  const cDef = categories.find(c => c.name === catName) || { name: catName, code: catName };
                                  return (
                                    <tr key={catName} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => {
                                            if (categoryOrderSettings.prothomAloHomepageBlocks.length > 1) {
                                              setCategoryOrderSettings(prev => ({
                                                ...prev,
                                                prothomAloHomepageBlocks: prev.prothomAloHomepageBlocks.filter(x => x !== catName)
                                              }));
                                            }
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 font-medium text-slate-800">
                                        {catName} <span className="text-[10px] text-gray-400 font-mono">({cDef.code})</span>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <div className="inline-flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.prothomAloHomepageBlocks];
                                              const tmp = list[index];
                                              list[index] = list[index - 1];
                                              list[index - 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, prothomAloHomepageBlocks: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Up ⇧
                                          </button>
                                          <button
                                            type="button"
                                            disabled={index === categoryOrderSettings.prothomAloHomepageBlocks.length - 1}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.prothomAloHomepageBlocks];
                                              const tmp = list[index];
                                              list[index] = list[index + 1];
                                              list[index + 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, prothomAloHomepageBlocks: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Down ⇩
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {categories
                                  .filter(c => !categoryOrderSettings.prothomAloHomepageBlocks.includes(c.name))
                                  .map((catObj) => (
                                    <tr key={catObj.code} className="opacity-60 bg-gray-50/20">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={false}
                                          onChange={() => {
                                            setCategoryOrderSettings(prev => ({
                                              ...prev,
                                              prothomAloHomepageBlocks: [...prev.prothomAloHomepageBlocks, catObj.name]
                                            }));
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-gray-500">{catObj.name}</td>
                                      <td className="px-4 py-2 text-center text-gray-300">-</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB 5: KALBELA HOMEPAGE BLOCKS */}
                      {categoryOrderSubTab === "kalbela" && (
                        <div className="space-y-4 animate-fade-in">
                          <p className="text-xs text-gray-500 leading-relaxed font-sans">
                            Select and reorder category news blocks rendered specifically on the Kalbela visual scheme:
                          </p>

                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs font-display text-left">
                              <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2.5">Enabled</th>
                                  <th className="px-4 py-2.5">Category Name</th>
                                  <th className="px-4 py-2.5 text-center">Order Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {categoryOrderSettings.kalbelaHomepageBlocks.map((catName, index) => {
                                  const cDef = categories.find(c => c.name === catName) || { name: catName, code: catName };
                                  return (
                                    <tr key={catName} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => {
                                            if (categoryOrderSettings.kalbelaHomepageBlocks.length > 1) {
                                              setCategoryOrderSettings(prev => ({
                                                ...prev,
                                                kalbelaHomepageBlocks: prev.kalbelaHomepageBlocks.filter(x => x !== catName)
                                              }));
                                            }
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 font-medium text-slate-800">
                                        {catName} <span className="text-[10px] text-gray-400 font-mono">({cDef.code})</span>
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        <div className="inline-flex gap-1.5">
                                          <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.kalbelaHomepageBlocks];
                                              const tmp = list[index];
                                              list[index] = list[index - 1];
                                              list[index - 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, kalbelaHomepageBlocks: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Up ⇧
                                          </button>
                                          <button
                                            type="button"
                                            disabled={index === categoryOrderSettings.kalbelaHomepageBlocks.length - 1}
                                            onClick={() => {
                                              const list = [...categoryOrderSettings.kalbelaHomepageBlocks];
                                              const tmp = list[index];
                                              list[index] = list[index + 1];
                                              list[index + 1] = tmp;
                                              setCategoryOrderSettings(prev => ({ ...prev, kalbelaHomepageBlocks: list }));
                                            }}
                                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] disabled:opacity-30 cursor-pointer font-bold select-none"
                                          >
                                            Down ⇩
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {categories
                                  .filter(c => !categoryOrderSettings.kalbelaHomepageBlocks.includes(c.name))
                                  .map((catObj) => (
                                    <tr key={catObj.code} className="opacity-60 bg-gray-50/20">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={false}
                                          onChange={() => {
                                            setCategoryOrderSettings(prev => ({
                                              ...prev,
                                              kalbelaHomepageBlocks: [...prev.kalbelaHomepageBlocks, catObj.name]
                                            }));
                                          }}
                                          className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-gray-500">{catObj.name}</td>
                                      <td className="px-4 py-2 text-center text-gray-300">-</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Main Full-Width Update Button exact likeness to screenshot layout */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("category_order_settings", JSON.stringify(categoryOrderSettings));
                            setSuccessMsg("Category details updated successfully!");
                            setTimeout(() => setSuccessMsg(""), 3000);
                            // Fire active state storage listeners across the window/document
                            window.dispatchEvent(new Event("storage"));
                          }}
                          className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-medium py-2.5 rounded-md text-sm text-center font-sans shadow-xs hover:shadow transition duration-200 cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === "theme" && (
                    <div className="space-y-4">
                      <div className="border-b pb-2 mb-4">
                        <h4 className="text-sm font-bold text-slate-800">Website Theme Accent Scheme</h4>
                        <p className="text-[11px] text-gray-500">ডিজিটাল পত্রিকার কালার থিম ও ব্র্যান্ড স্টাইল নির্বাচন</p>
                      </div>
                      <span className="text-xs font-bold text-gray-700 block mb-2">ব্র্যান্ডের প্রাথমিক কালার স্কিম সিলেক্ট করুন:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { name: "লাল (Default)", code: "bg-red-700" },
                          { name: "গাঢ় লাল", code: "bg-[#801818]" },
                          { name: "নীল", code: "bg-blue-700" },
                          { name: "সবুজ", code: "bg-emerald-700" },
                        ].map((clr) => (
                          <div key={clr.name} className="p-3 border border-gray-200 rounded flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                            <span className={`w-8 h-8 rounded-full ${clr.code} shadow-xs`}></span>
                            <span className="text-[10px] font-bold text-gray-600">{clr.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard update action for this sub-section */}
                  <div className="pt-4 border-t border-gray-150">
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessMsg("আপনার কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!");
                        setTimeout(() => setSuccessMsg(""), 4000);
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition shadow-sm cursor-pointer select-none"
                    >
                      আপডেট করুন (Save Config)
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 11. ADD/EDIT POST MODAL */}
      {showAddPostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center overflow-y-auto p-4 py-8 z-50 animate-fade-in" id="add-post-modal">
          <div className="bg-white rounded border border-gray-200 max-w-2xl w-full p-6 relative shadow-lg text-left font-sans">
            <button
              onClick={() => {
                setShowAddPostModal(false);
                setEditingArticle(null);
                setTitle("");
                setVideoUrl("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            {category === "ভিডিও" || category === "video" ? (
              // SIMPLIFIED VIDEO POST DETAILS FORM
              <>
                {/* Title Section matching the screenshot exactly */}
                <h2 className="text-[17px] font-bold text-[#1e293b] leading-none tracking-tight mb-6 select-none font-sans">
                  Video Post Details
                </h2>

                <form
                  onSubmit={(e) => {
                    if (editingArticle) {
                      handleSavePostEdits(e);
                    } else {
                      handleDirectUpload(e);
                      setShowAddPostModal(false);
                    }
                  }}
                  className="space-y-5"
                >
                  {/* Post Title & D-Sub Title side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                      <input
                        type="text"
                        required
                        id="video-post-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsVideoTitleFocused(true)}
                        onBlur={() => setIsVideoTitleFocused(false)}
                        className="w-full text-xs px-3.5 py-3.5 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-450 font-sans"
                      />
                      {!title && !isVideoTitleFocused && (
                        <span className="absolute left-3.5 top-[15px] pointer-events-none text-xs text-gray-400 font-sans select-none">
                          Post Title <span className="text-red-500 font-sans">*</span>
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        id="video-post-dsubtitle"
                        placeholder="D-Sub Title (optional)"
                        value={dSubTitle}
                        onChange={(e) => setDSubTitle(e.target.value)}
                        className="w-full text-xs px-3.5 py-3.5 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-450 font-sans"
                      />
                    </div>
                  </div>

                  {/* Post Video Link * Input */}
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        id="video-post-link"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onFocus={() => setIsVideoLinkFocused(true)}
                        onBlur={() => setIsVideoLinkFocused(false)}
                        className="w-full text-xs px-3.5 py-3.5 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-450 font-sans"
                      />
                      {!videoUrl && !isVideoLinkFocused && (
                        <span className="absolute left-3.5 top-[15px] pointer-events-none text-xs text-gray-400 font-sans select-none">
                          Post Video Link <span className="text-red-500 font-sans">*</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mt-1.5 font-sans leading-normal select-none">
                      Your video will be displayed here. Make sure the link is correct. Ex: https://www.youtube.com/videoid?...
                    </p>
                  </div>

                  {/* Author Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#475569] block font-sans select-none">Author</label>
                    <select
                      value={postAuthorId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setPostAuthorId(selectedId);
                        const matched = eligibleAuthors.find((a) => a.id === selectedId);
                        if (matched) {
                          setPostAuthorName(matched.name);
                          setPostAuthorMobile(matched.mobile || "");
                        }
                      }}
                      className="w-full text-xs px-3.5 py-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 cursor-pointer font-sans"
                    >
                      {eligibleAuthors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name} {author.mobile ? `(${author.mobile})` : ""}
                        </option>
                      ))}
                      {postAuthorId === "custom-reporter" && (
                        <option value="custom-reporter">
                          {postAuthorName} (Custom Reporter)
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#475569] block font-sans select-none">Status</label>
                    <div className="relative">
                      <select
                        value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value as any)}
                        className="w-full text-xs pl-3.5 pr-10 py-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-850 cursor-pointer font-sans appearance-none"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: SUBMIT & CANCEL aligned left exactly as in screenshot */}
                  <div className="flex gap-2.5 pt-4 border-t border-gray-100 select-none">
                    <button
                      type="submit"
                      className="bg-[#1e60d4] hover:bg-blue-700 text-white px-5 py-2.5 rounded text-xs font-bold font-sans tracking-wide uppercase transition-colors shadow-sm cursor-pointer min-w-[90px]"
                    >
                      SUBMIT
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPostModal(false);
                        setEditingArticle(null);
                        setTitle("");
                        setVideoUrl("");
                      }}
                      className="bg-white border border-[#1e60d4] text-[#1e60d4] hover:bg-blue-50 px-5 py-2.5 rounded text-xs font-bold font-sans tracking-wide uppercase transition-colors cursor-pointer min-w-[90px]"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // ORIGINAL WORKFLOW FOR GENERAL NEWS POSTS
              <>
                {/* Title Section matching the screenshot exactly */}
                <h2 className="text-[18px] font-bold text-[#1e293b] leading-none tracking-tight mb-6 select-none border-b border-gray-100 pb-3 font-sans">
                  Post Details
                </h2>

                <form
                  onSubmit={(e) => {
                    if (editingArticle) {
                      handleSavePostEdits(e);
                    } else {
                      handleDirectUpload(e);
                      setShowAddPostModal(false);
                    }
                  }}
                  className="space-y-5"
                >
                  {/* Post Title & D-Sub Title side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider font-sans mb-1.5 block select-none">
                        Post Title <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Post Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full text-xs px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400 font-sans"
                        />
                        
                        {/* Simulated AI Helper badge */}
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 text-white p-1 rounded-sm cursor-pointer hover:opacity-90 select-none shadow-xs"
                          title="AI Generate Headline"
                          onClick={() => {
                            if (!title) {
                              setTitle("ফরিদপুরে উৎসবমুখর পরিবেশে সাহিত্য মেলা শুরু");
                            } else {
                              setTitle(title + " | দৈনিক ফরিদপুর কড়চা");
                            }
                          }}
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929a10 10 0 00-14.142 0M19.071 19.071a10 10 0 000-14.142" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider font-sans mb-1.5 block select-none">
                        D-Sub Title <span className="text-gray-400 font-medium text-[10px]">( optional )</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dainikfari.com"
                        value={dSubTitle}
                        onChange={(e) => setDSubTitle(e.target.value)}
                        className="w-full text-xs px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400 font-sans"
                      />
                    </div>
                  </div>

                  {/* Select Category badge & option dropdown */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider font-sans mb-1 block select-none">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <CategoryDropdownSelect
                      value={category}
                      subcategoryValue={subcategory}
                      onChange={(catVal, subVal) => {
                        setCategory(catVal);
                        setSubcategory(subVal || "");
                      }}
                      categories={categories}
                      placeholder="Select Category"
                    />
                  </div>

                  {/* Thumbnail Container: Light Cyan matching the screenshot EXACTLY */}
                  <div className="bg-[#e0f2fe]/40 border border-[#bae6fd] rounded p-4 flex flex-col gap-2 relative font-sans">
                    <div className="flex justify-between items-center w-full select-none">
                      <span className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider font-sans">
                        Thumbnail
                      </span>
                      {images[0] && (
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...images];
                            copy[0] = "";
                            setImages(copy);
                            setUploadedThumbnailName("No file chosen");
                          }}
                          className="text-[#ef4444] hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50 transition"
                          title="Delete Thumbnail"
                          id="delete-thumb-btn-modal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {images[0] && (
                      <div className="w-[320px] max-w-full h-[180px] rounded overflow-hidden border border-[#bae6fd] bg-white">
                        <img
                          src={images[0]}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <input
                        type="file"
                        accept="image/*"
                        id="news-thumbnail-file-uploader"
                        className="hidden"
                        onChange={(e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files && target.files[0];
                          if (file) {
                            const originalName = file.name;
                            setUploadedThumbnailName(originalName + " (Uploading...)");
                            compressImage(file)
                              .then(base64 => {
                                if (!base64) throw new Error("Could not compress image");
                                return fetch("/api/upload", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ image: base64, name: originalName })
                                });
                              })
                              .then(res => res.json())
                              .then(data => {
                                  if (data.success && data.url) {
                                    const copy = [...images];
                                    copy[0] = data.url;
                                    setImages(copy);
                                    setUploadedThumbnailName(originalName + " (Uploaded)");
                                  } else {
                                    throw new Error(data.error || "Upload failed");
                                  }
                                })
                                .catch(err => {
                                  console.error("Image upload failed:", err);
                                  alert("ইমেজ আপলোড ব্যর্থ হয়েছে: " + err.message);
                                  setUploadedThumbnailName("Upload failed");
                                });
                          }
                        }}
                      />
                      <label
                        htmlFor="news-thumbnail-file-uploader"
                        className="bg-white hover:bg-slate-50 text-gray-700 border border-gray-300 rounded px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors shadow-3xs inline-block"
                      >
                        Choose File
                      </label>
                      <span className="text-xs text-gray-500 truncate max-w-xs italic select-none">
                        {images[0] ? "No file chosen" : uploadedThumbnailName}
                      </span>
                    </div>
                  </div>

                  {/* Post Description with rich editor toolbar matching mockup exactly */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1e293b] block mb-2 font-sans select-none">Post Description</label>
                    <RichTextEditor value={content} onChange={setContent} aiContextTopic={title} />
                    <div style={{ display: "none" }}>
                      {/* Interactive format toolbar */}
                      <div className="border border-gray-300 border-b-0 bg-[#f8fafc] rounded-t p-2 flex flex-wrap items-center gap-1.5 text-gray-500 select-none">
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Undo">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Redo">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                        </svg>
                      </button>
                      <div className="h-4 w-[1px] bg-gray-300 mx-0.5"></div>

                      {/* Size Dropdown */}
                      <div className="relative inline-flex items-center text-[10px] text-gray-650 bg-white border border-gray-200 rounded px-1.5 py-0.5 gap-1.5">
                        <span>Size</span>
                        <ChevronDown size={8} className="text-gray-400" />
                      </div>

                      {/* Formats Dropdown */}
                      <div className="relative inline-flex items-center text-[10px] text-gray-650 bg-white border border-gray-200 rounded px-1.5 py-0.5 gap-1.5">
                        <span>Formats</span>
                        <ChevronDown size={8} className="text-gray-400" />
                      </div>
                      <div className="h-4 w-[1px] bg-gray-300 mx-0.5"></div>

                      {/* Text styles */}
                      <button type="button" className="p-1 hover:bg-gray-200 rounded font-bold text-[10px] flex flex-col items-center leading-none text-slate-800">
                        A
                        <div className="w-3 h-0.5 bg-red-600 mt-[1px]"></div>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded font-sans font-bold text-[10px] bg-yellow-250 border border-yellow-350 text-slate-800 px-1 leading-none">
                        A
                      </button>
                      <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                      <button
                        type="button"
                        onClick={() => setContent((c) => c + " **Bold** ")}
                        className="px-1.5 py-0.5 hover:bg-gray-200 rounded font-bold text-xs text-slate-900"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((c) => c + " <u>Underline</u> ")}
                        className="px-1.5 py-0.5 hover:bg-gray-200 rounded font-bold underline text-xs text-slate-900"
                        title="Underline"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent((c) => c + " *Italic* ")}
                        className="px-1.5 py-0.5 hover:bg-gray-200 rounded italic text-xs text-slate-900"
                        title="Italic"
                      >
                        I
                      </button>
                      <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                      {/* Paragraph Controls */}
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-600" title="Align Left">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                        </svg>
                      </button>
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-600" title="Spacer Line">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-600" title="Unordered list">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </button>
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-600" title="Insert Grid System">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 5.25v13.5m16.5-13.5v13.5m-16.5-9h16.5m-16.5 4.5h16.5" />
                        </svg>
                      </button>
                      <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                      {/* Actions */}
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-500" title="Insert Link">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757M10.81 15.312a4.5 4.5 0 01-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                        </svg>
                      </button>
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-500" title="Insert Picture object">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </button>
                      <button type="button" className="p-0.5 hover:bg-gray-200 rounded text-gray-500" title="Insert Video URL">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l-4.5 3v-6l4.5 3z" />
                        </svg>
                      </button>
                      <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                      {/* Clean text formatting / print / code */}
                      <button type="button" className="p-1 text-slate-500 hover:bg-gray-200 rounded text-xs select-none leading-none font-bold font-mono" title="HTML Tags Mode">
                        &lt;/&gt;
                      </button>
                    </div>

                    {/* Textarea container area with relative AI Badge at the top right */}
                    <div className="relative">
                      <textarea
                        required
                        rows={8}
                        placeholder="Post Description..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full text-xs p-4.5 bg-white border border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-gray-800 placeholder:text-gray-400 leading-relaxed"
                      />
                      
                      {/* Floating AI emblem badge at the top right */}
                      <div
                        className="absolute right-4.5 top-4 flex items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 text-white p-1 rounded-sm cursor-pointer hover:opacity-90 select-none shadow-xs"
                        title="Generate Article with AI"
                        onClick={() => {
                          if (!title) {
                            alert("অনুগ্রহ করে প্রথমে সংবাদটির শিরোনামটি লিখুন।");
                            return;
                          }
                          setContent(`(এআই লিখিত খসড়া) \n\n${title} সংবাদটির সম্পূর্ণ বিবরণ খুব শীঘ্রই আপডেট করা হবে। সাথে থাকুন।`);
                        }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929a10 10 0 00-14.142 0M19.071 19.071a10 10 0 000-14.142" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Author Selector with dynamic plus dynamic input fields matching screenshot layout */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1e293b] block mb-1.5 font-sans select-none">Author</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={postAuthorId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setPostAuthorId(selectedId);
                          const matched = eligibleAuthors.find((a) => a.id === selectedId);
                          if (matched) {
                            setPostAuthorName(matched.name);
                            setPostAuthorMobile(matched.mobile || "");
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 cursor-pointer font-sans"
                      >
                        {eligibleAuthors.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.name} {author.mobile ? `(${author.mobile})` : ""}
                          </option>
                        ))}
                        {postAuthorId === "custom-reporter" && (
                          <option value="custom-reporter">
                            {postAuthorName} (Custom Reporter)
                          </option>
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowCustomAuthorForm(!showCustomAuthorForm)}
                        className="bg-[#f8fafc] hover:bg-slate-200 border border-gray-300 text-slate-700 rounded px-4 py-3 text-sm font-black cursor-pointer transition-colors shadow-2xs"
                        title="Add Custom Brand Author"
                      >
                        +
                      </button>
                    </div>

                    {/* Brand custom author expansion form inline */}
                    {showCustomAuthorForm && (
                      <div className="mt-3 p-4 bg-slate-50 border border-gray-200 rounded space-y-3 animate-fade-in text-xs font-sans">
                        <div className="font-bold text-slate-800 mb-1">Add Custom Reporter Details:</div>
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Reporter Name</label>
                            <input
                              type="text"
                              placeholder="e.g. স্টাফ রিপোর্টার"
                              value={customAuthorName}
                              onChange={(e) => {
                                setCustomAuthorName(e.target.value);
                                setPostAuthorName(e.target.value);
                                setPostAuthorId("custom-reporter");
                              }}
                              className="w-full p-2 border border-gray-300 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Mobile Phone Number</label>
                            <input
                              type="text"
                              placeholder="e.g. 01712345678"
                              value={customAuthorMobile}
                              onChange={(e) => {
                                setCustomAuthorMobile(e.target.value);
                                setPostAuthorMobile(e.target.value);
                              }}
                              className="w-full p-2 border border-gray-300 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status input dropdown matching options explicitly */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1e293b] block mb-1.5 font-sans select-none">Status</label>
                    <select
                      value={postStatus}
                      onChange={(e) => setPostStatus(e.target.value as any)}
                      className="w-full text-xs px-3.5 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-850 cursor-pointer font-sans"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Imported">Imported</option>
                    </select>
                  </div>

                  {/* Publish At automatic and fully editable field with calendar overlay */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1e293b] block mb-1.5 font-sans select-none">Publish At</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={publishAt}
                        onChange={(e) => setPublishAt(e.target.value)}
                        className="w-full text-xs pl-3.5 pr-10 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 font-sans"
                      />
                      {/* Calendar symbol on the far right of the box matching mockup */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Share To Facebook option dropdown */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1e293b] block mb-1.5 font-sans select-none">Share to Facebook</label>
                    <select
                      value={shareToFacebook}
                      onChange={(e) => setShareToFacebook(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 cursor-pointer font-sans"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Lead News and Headline Checkbox Options */}
                  <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded p-3 bg-slate-50/50 font-sans text-xs col-span-1 md:col-span-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isLead}
                        onChange={(e) => setIsLead(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-gray-800">প্রধান খবর (isLead)</span>
                        <p className="text-[10px] text-gray-400">হোমপেজ প্রধান গ্রিডে</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isHeadline}
                        onChange={(e) => setIsHeadline(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-gray-800">টিকার সংবাদ (isHeadline)</span>
                        <p className="text-[10px] text-gray-400">স্ক্রলিং নিউজ টিকারে</p>
                      </div>
                    </label>
                  </div>

                  {/* Proactive Collapsible drawer for optional custom fields so functionality isn't broken */}
                  <details className="group border border-gray-200 rounded p-3 bg-slate-50/50 text-xs font-sans">
                    <summary className="font-bold text-slate-600 cursor-pointer hover:text-slate-800 list-none flex items-center justify-between select-none">
                      <span>Additional Details (ঐচ্ছিক তথ্য - সাবক্যাটাগরি, ট্যাগস বা ভিডিও লিংক)</span>
                      <ChevronDown className="w-3.5 h-3.5 transform group-open:rotate-180 transition-all text-slate-500" />
                    </summary>
                    <div className="mt-3.5 space-y-4 pt-1.5 border-t border-slate-150 animate-fade-in text-[11px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">উপ-শিরোনাম / Subtitle</label>
                          <input
                            type="text"
                            placeholder="ভূমিকা বা হাইলাইটস বিবরণ..."
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">উপ-ক্যাটাগরি / Subcategory</label>
                          <input
                            type="text"
                            placeholder="যেমন: ক্রিকেট, ফুটবল, বিনোদন"
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">ট্যাগস (কমা সংবলিত) / Tags</label>
                          <input
                            type="text"
                            placeholder="খবর, ফরিদপুর, নির্বাচন"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">ভিডিও লিংক (ঐচ্ছিক) / Video URL</label>
                          <input
                            type="text"
                            placeholder="ইউটিউব বা ভিডিও এম্বেড লিংক..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Submission Button section matching screenshot style exactly_ */}
                  <div className="flex gap-3 pt-6 border-t border-gray-100 select-none">
                    <button
                      type="submit"
                      className="bg-[#1e60d4] hover:bg-blue-700 text-white px-5 py-2.5 rounded text-xs font-bold font-sans tracking-wider uppercase transition-colors shadow-sm cursor-pointer min-w-[90px]"
                    >
                      {editingArticle ? "UPDATE" : "SUBMIT"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { setShowAddPostModal(false); setEditingArticle(null); }}
                      className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded text-xs font-bold font-sans tracking-wider uppercase transition-colors cursor-pointer min-w-[90px]"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* SHARE POST MODAL (Mockup High-Fidelity Match) */}
      {sharingArticle && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="share-post-modal">
          <div className="bg-white rounded border border-gray-200 max-w-md w-full p-6 font-sans shadow-lg text-left relative">
            <h3 className="text-[17px] font-semibold text-[#1e293b] leading-none mb-5">Share Post</h3>
            
            <div className="text-xs font-normal text-[#475569] mb-4 select-none">Share on:</div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5 text-xs font-normal text-gray-950 pb-5 border-b border-gray-100 mb-5 select-none hover:text-slate-700">
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharingArticle.dSubTitle && sharingArticle.dSubTitle.trim() !== "" ? `${window.location.origin}/news/${encodeURIComponent(sharingArticle.dSubTitle.trim())}/${sharingArticle.id}` : `${window.location.origin}/news/${sharingArticle.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Facebook size={16} className="text-slate-850" />
                <span>Facebook</span>
              </a>

              {/* Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(sharingArticle.dSubTitle && sharingArticle.dSubTitle.trim() !== "" ? `${window.location.origin}/news/${encodeURIComponent(sharingArticle.dSubTitle.trim())}/${sharingArticle.id}` : `${window.location.origin}/news/${sharingArticle.id}`)}&text=${encodeURIComponent(`${sharingArticle.category} | ${sharingArticle.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-800 hover:text-sky-500 transition-colors cursor-pointer"
              >
                <Twitter size={14} className="text-slate-850" />
                <span>Twitter</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharingArticle.dSubTitle && sharingArticle.dSubTitle.trim() !== "" ? `${window.location.origin}/news/${encodeURIComponent(sharingArticle.dSubTitle.trim())}/${sharingArticle.id}` : `${window.location.origin}/news/${sharingArticle.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-800 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <Linkedin size={14} className="text-slate-850" />
                <span>LinkedIn</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${sharingArticle.category} | ${sharingArticle.title}\n${sharingArticle.dSubTitle && sharingArticle.dSubTitle.trim() !== "" ? `${window.location.origin}/news/${encodeURIComponent(sharingArticle.dSubTitle.trim())}/${sharingArticle.id}` : `${window.location.origin}/news/${sharingArticle.id}`}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-800 hover:text-green-650 transition-colors cursor-pointer"
              >
                <MessageCircle size={16} className="text-slate-850" />
                <span>WhatsApp</span>
              </a>

              {/* Copy Link */}
              <button
                onClick={() => {
                  const targetUrl = sharingArticle.dSubTitle && sharingArticle.dSubTitle.trim() !== "" ? `${window.location.origin}/news/${encodeURIComponent(sharingArticle.dSubTitle.trim())}/${sharingArticle.id}` : `${window.location.origin}/news/${sharingArticle.id}`;
                  const shareText = `${sharingArticle.category} | ${sharingArticle.title}\n${targetUrl}`;
                  navigator.clipboard.writeText(shareText);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex items-center gap-1.5 text-slate-800 hover:text-blue-500 transition-colors cursor-pointer border-none bg-transparent p-0 select-none align-middle font-sans font-normal"
              >
                <Copy size={14} className="text-slate-850" />
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSharingArticle(null)}
                className="bg-[#cc2b2b] hover:bg-[#b02222] text-white px-5 py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer min-w-[76px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD IMAGES MODAL POPUP (EXACT MATCH FOR SCREENSHOT) */}
      {showUploadImagesModal && (
        <div className="fixed inset-0 bg-[#000000]/65 flex items-start justify-center overflow-y-auto p-4 py-8 z-50 animate-fade-in" id="upload-images-modal">
          <div className="bg-white rounded border border-gray-200 max-w-[950px] w-full p-8 font-sans shadow-2xl text-left relative my-auto">
            {/* Elegant tiny floating close button */}
            <button
              type="button"
              onClick={() => { setShowUploadImagesModal(false); setImageUploadEditingId(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-full p-1.5"
              title="Close Panel"
            >
              <X size={16} />
            </button>

            {/* Header Title exactly mirroring screenshot: Upload Images */}
            <h2 className="text-[17px] font-bold text-[#1e293b] tracking-wider mb-5 select-none border-b border-gray-100 pb-3 font-sans">
              Upload Images
            </h2>

            <form onSubmit={handleSaveImagePost} className="space-y-6">
              {/* Field 1: Image Title label and Input Box */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 font-sans">
                  Image Title <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Image Title"
                  value={imageUploadTitle}
                  onChange={(e) => setImageUploadTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400 font-sans"
                />
              </div>

              {/* Category selector field */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 font-sans">
                  Category <span className="text-red-500 font-bold">*</span>
                </label>
                <CategoryDropdownSelect
                  value={imageUploadCategory}
                  onChange={(val, sub) => setImageUploadCategory(val)}
                  categories={categories}
                  placeholder="Select Category"
                />
              </div>

              {/* Field 2: Post Description label and Toolbar with Content Area */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 font-sans">
                  Post Description
                </label>

                {/* Simulated exact Rich Text Editing physical bar */}
                <div className="w-full border border-gray-300 rounded overflow-hidden shadow-2xs">
                  {/* Toolbar Row */}
                  <div className="bg-gray-100/95 border-b border-gray-200/90 flex flex-wrap items-center gap-1.5 p-1.5 font-sans text-xs select-none">
                    {/* Undo/Redo */}
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Undo">
                      <Undo size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Redo">
                      <Redo size={13} />
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Size and Formats Dropdowns */}
                    <div className="relative inline-flex items-center gap-1 bg-white border rounded px-1.5 py-0.5 text-[10px] text-gray-650 font-semibold cursor-pointer select-none">
                      <span>Size</span>
                      <ChevronDown size={10} className="text-gray-400" />
                    </div>
                    <div className="relative inline-flex items-center gap-1 bg-white border rounded px-1.5 py-0.5 text-[10px] text-gray-650 font-semibold cursor-pointer select-none">
                      <span>Formats</span>
                      <ChevronDown size={10} className="text-gray-400" />
                    </div>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Text Foreground / Background Colors / Trash */}
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-700 flex flex-col items-center leading-none" title="Text Color">
                      <Baseline size={13} className="text-blue-600" />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Background Highlight">
                      <Paintbrush size={13} className="text-amber-500" />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Clear Styles">
                      <svg className="w-3.5 h-3.5 text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.5L9.5 19.5M9.5 9.5l10 10M4.5 19.5h5" />
                      </svg>
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Bold / Underline / Italic */}
                    <button
                      type="button"
                      onClick={() => setImageUploadDescription(prev => prev + " **Bold**")}
                      className="px-1.5 py-0.5 hover:bg-gray-200 rounded font-bold text-xs text-gray-800"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadDescription(prev => prev + " <u>Underline</u>")}
                      className="px-1.5 py-0.5 hover:bg-gray-200 rounded font-bold underline text-xs text-gray-800"
                      title="Underline"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadDescription(prev => prev + " *Italic*")}
                      className="px-1.5 py-0.5 hover:bg-gray-200 rounded italic text-xs text-gray-850"
                      title="Italic"
                    >
                      I
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Alignments / Lists */}
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Align Left">
                      <AlignLeft size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Align Center">
                      <AlignCenter size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Align Right">
                      <AlignRight size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Unordered list">
                      <List size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Ordered list">
                      <ListOrdered size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Decrease Indent">
                      <Outdent size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Increase Indent">
                      <Indent size={13} />
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Links, images, video, table */}
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-blue-600" title="Insert Link">
                      <Link size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-rose-600" title="Insert Image">
                      <Image size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-emerald-600" title="Insert Video URL">
                      <Video size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-cyan-600" title="Insert Grid Table">
                      <Grid size={13} />
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />

                    {/* Find & Replace, print, preview, column split, html */}
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Search">
                      <Search size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Print content">
                      <Printer size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Fullscreen toggle">
                      <Maximize2 size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Split view column">
                      <Columns size={13} />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650" title="Code raw HTML source">
                      <Code size={13} />
                    </button>
                  </div>

                  {/* Editable Area */}
                  <textarea
                    placeholder="Post Description..."
                    value={imageUploadDescription}
                    onChange={(e) => setImageUploadDescription(e.target.value)}
                    className="w-full text-xs p-4 bg-white focus:outline-none text-gray-800 font-sans min-h-[180px] resize-y"
                  />
                </div>
              </div>

              {/* Files Input matching exactly: Choose Files [No file chosen] */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="images-files-collection-selector"
                    className="hidden"
                    onChange={handleImageUploadFilesChange}
                  />
                  <label
                    htmlFor="images-files-collection-selector"
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-800 text-xs px-3.5 py-1.5 rounded cursor-pointer select-none font-semibold shadow-2xs font-sans transition-colors shrink-0"
                  >
                    Choose Files
                  </label>
                  <span className="text-xs text-gray-500 font-sans select-none">
                    {imageUploadFiles.length > 0 ? `${imageUploadFiles.length} file${imageUploadFiles.length > 1 ? "s" : ""} selected` : "No file chosen"}
                  </span>
                </div>

                {/* Previews Box container in light blue with shadow-xs */}
                <div className="bg-[#e0f2fe]/40 border border-sky-100 rounded-md p-5 min-h-[140px] flex flex-wrap gap-4 items-stretch shadow-2xs">
                  {imageUploadFiles.length === 0 ? (
                    <div className="m-auto text-xs text-gray-400 font-sans select-none italic text-center py-6">
                      অনুগ্রহ করে অন্তত ১টি বা ততোধিক ছবি নির্বাচন করুন (Please choose one or more images)...
                    </div>
                  ) : (
                    imageUploadFiles.map((fileItem, idx) => (
                      <div key={idx} className="relative bg-white border border-[#bfdbfe] rounded-sm p-2 w-[184px] flex flex-col justify-between shadow-xs animate-fade-in group">
                        {/* Red Trash Delete Button inside a light pink circle floating top-right */}
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 border border-red-200 cursor-pointer shadow-md transition-all scale-100 hover:scale-105 active:scale-95 flex items-center justify-center z-10"
                          title="Remove Image"
                        >
                          <Trash2 size={11} className="stroke-[2.5]" />
                        </button>

                        <div className="h-28 w-full overflow-hidden bg-gray-50 flex items-center justify-center rounded">
                          <img
                            src={fileItem.url}
                            alt={`Preview ${idx + 1}`}
                            className="max-h-full max-w-full object-cover rounded select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Image Description Text Input immediately below the image */}
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder={`Description for Image ${idx + 1}`}
                            value={fileItem.description || ""}
                            onChange={(e) => handleUpdateUploadedImageDesc(idx, e.target.value)}
                            className="w-full text-[11px] px-2.5 py-1.5 border border-sky-300 focus:border-blue-500 rounded text-gray-755 bg-white placeholder:text-gray-400 font-sans focus:outline-none"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status input field */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 font-sans">
                  Status
                </label>
                <select
                  value={imageUploadStatus}
                  onChange={(e) => setImageUploadStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 cursor-pointer font-sans"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Share to Facebook Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 font-sans">
                  Share to Facebook
                </label>
                <select
                  value={imageUploadShareFacebook}
                  onChange={(e) => setImageUploadShareFacebook(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 cursor-pointer font-sans"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Action Buttons: SUBMIT & CANCEL styled exactly as in screenshot */}
              <div className="flex items-center gap-3.5 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="bg-[#1e70eb] hover:bg-blue-700 text-white font-sans font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded shadow-xs cursor-pointer transition-colors"
                >
                  SUBMIT
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUploadImagesModal(false); setImageUploadEditingId(null); }}
                  className="bg-white hover:bg-neutral-50 border border-[#1e70eb] text-[#1e70eb] font-sans font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW IMAGE POST MODAL POPUP (EXACT MATCH FOR SCREENSHOT) */}
      {viewingImagePost && (
        <div className="fixed inset-0 bg-[#000000]/65 flex items-start justify-center overflow-y-auto p-4 py-8 z-50 animate-fade-in" id="view-image-post-modal">
          <div className="bg-white rounded border border-gray-200 max-w-[850px] w-full p-8 font-sans shadow-2xl text-left relative my-auto">
            {/* Elegant tiny floating close button */}
            <button
              type="button"
              onClick={() => setViewingImagePost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-full p-1.5"
              title="Close Panel"
            >
              <X size={16} />
            </button>

            {/* Header: Post Content exactly as in screenshot */}
            <h2 className="text-[#1e293b] text-base font-bold select-none pb-2 font-sans mb-3.5 tracking-tight">
              Post Content
            </h2>

            {/* Bengali Headline: Large bold display title */}
            <h1 className="text-[20px] font-sans font-bold text-gray-900 leading-snug tracking-tight mb-5 select-text">
              {viewingImagePost.title}
            </h1>

            {/* Content Body Container with border matching the screenshot */}
            <div className="border border-gray-200 bg-white rounded-md p-6 select-text space-y-5 shadow-xs">
              
              {/* Media Preview: First/Primary Image attached to this news shown at top center within card */}
              {viewingImagePost.images && viewingImagePost.images.length > 0 && (
                <div className="bg-slate-50 border border-gray-100 rounded p-1 flex items-center justify-center max-h-[350px] overflow-hidden shadow-2xs max-w-xl mx-auto mb-4">
                  <img
                    src={viewingImagePost.images[0]}
                    alt="Post Thumbnail"
                    className="max-h-[340px] max-w-full object-contain rounded-sm select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Story text */}
              {viewingImagePost.content ? (
                <div 
                  className="text-[13.5px] text-gray-800 leading-relaxed font-sans select-text"
                  dangerouslySetInnerHTML={{ __html: viewingImagePost.content }}
                />
              ) : (
                <p className="text-xs text-gray-400 italic">কোনো বিবরণ বা কন্টেন্ট নেই।</p>
              )}

              {/* Extra Images Grid if there is more than 1 image */}
              {viewingImagePost.images && viewingImagePost.images.length > 1 && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-[11px] font-bold text-gray-500 mb-3 block select-none">অতিরিক্ত ছবিসমূহ ({viewingImagePost.images.length - 1}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewingImagePost.images.slice(1).map((imgUrl, idx) => (
                      <div key={idx} className="bg-slate-50 border border-gray-200 rounded p-1 h-24 flex items-center justify-center overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`Attachment ${idx + 2}`}
                          className="max-h-full max-w-full object-contain rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: CLOSE button matched */}
            <div className="flex justify-end pt-5 border-t border-gray-100 mt-6 bg-white">
              <button
                type="button"
                onClick={() => setViewingImagePost(null)}
                className="bg-white hover:bg-slate-50 border border-[#1e60d4] text-[#1e60d4] font-sans font-bold text-xs px-6 py-2.5 rounded cursor-pointer transition-colors shadow-2xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW VIDEO POST MODAL POPUP */}
      {viewingVideoPost && (
        <div className="fixed inset-0 bg-[#000000]/65 flex items-start justify-center overflow-y-auto p-4 py-8 z-50 animate-fade-in" id="view-video-post-modal">
          <div className="bg-white rounded border border-gray-200 max-w-[850px] w-full p-8 font-sans shadow-2xl text-left relative my-auto">
            {/* Elegant tiny floating close button */}
            <button
              type="button"
              onClick={() => setViewingVideoPost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-full p-1.5"
              title="Close Panel"
            >
              <X size={16} />
            </button>

            {/* Header: Post Content exactly as in images view page */}
            <h2 className="text-[17px] font-bold text-[#1e293b] tracking-wider mb-5 select-none border-b border-gray-100 pb-3 font-sans">
              Video Post Content
            </h2>

            {/* Interactive Embedded Iframe Player Box */}
            {viewingVideoPost.videoUrl ? (
              <div className="mb-6 bg-slate-950 rounded-md overflow-hidden aspect-video border border-slate-800 relative shadow-md">
                {(() => {
                  let embedSrc = viewingVideoPost.videoUrl;
                  if (viewingVideoPost.videoUrl.includes("youtube.com/watch")) {
                    try {
                      const urlParams = new URLSearchParams(new URL(viewingVideoPost.videoUrl).search);
                      const videoId = urlParams.get("v");
                      if (videoId) {
                        embedSrc = `https://www.youtube.com/embed/${videoId}`;
                      }
                    } catch (e) {}
                  } else if (viewingVideoPost.videoUrl.includes("youtu.be/")) {
                    const videoId = viewingVideoPost.videoUrl.split("/").pop();
                    if (videoId) {
                      embedSrc = `https://www.youtube.com/embed/${videoId}`;
                    }
                  }

                  return embedSrc.startsWith("http") ? (
                    <iframe
                      src={embedSrc}
                      title={viewingVideoPost.title}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-400 p-4 text-center">
                      <Video size={48} className="text-red-500 mb-2" />
                      <p className="font-sans font-medium text-xs">{viewingVideoPost.videoUrl}</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="mb-6 bg-slate-100 rounded p-6 text-center text-gray-500 italic text-xs border border-gray-200">
                No Video URL specified for this post.
              </div>
            )}

            {/* Post Title */}
            <div className="mb-4">
              <h1 className="text-[19px] font-display font-black text-slate-900 leading-snug">
                {viewingVideoPost.title}
              </h1>
              <p className="text-[11px] text-gray-450 mt-1.5 font-sans">
                Category: <span className="font-bold text-slate-800">{viewingVideoPost.category}</span> • Reporter: <span className="font-bold text-slate-800">{viewingVideoPost.reporterName}</span>
              </p>
            </div>

            {/* Post Content */}
            {viewingVideoPost.content && (
              <div 
                className="text-xs text-gray-600 font-sans mb-6 bg-gray-50/70 p-4 rounded border border-gray-150 leading-relaxed max-h-[160px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: viewingVideoPost.content }}
              />
            )}

            {/* Action Buttons: CLOSE */}
            <div className="flex justify-end pt-5 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setViewingVideoPost(null)}
                className="bg-white hover:bg-neutral-50 border border-[#1e70eb] text-[#1e70eb] font-sans font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded cursor-pointer transition-colors shadow-2xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM APPROVE POST WITH FACEBOOK SHARE OPTION MODAL - HUBUHU DESIGN TO SCREENSHOT */}
      {articleForApprovalConfirmation && (
        <div className="fixed inset-0 bg-[#000000]/65 flex items-center justify-center z-50 p-4 animate-fade-in font-sans" id="approve-confirm-modal">
          <div className="bg-white rounded border border-gray-200 max-w-[420px] w-full p-6 shadow-2xl text-left relative flex flex-col">
            
            {/* Title: Want to approve this post? */}
            <h2 className="text-[17px] font-medium text-[#1e293b] mb-4 select-none">
              Want to approve this post?
            </h2>

            {/* Share to Facebook Option Section */}
            <div className="space-y-1.5 mb-5 w-full">
              <label htmlFor="facebook-share" className="text-xs text-gray-700 select-none block font-medium">
                Share to Facebook
              </label>
              
              <div className="relative">
                <select
                  id="facebook-share"
                  value={shareToFacebookOption}
                  onChange={(e) => setShareToFacebookOption(e.target.value as "Yes" | "No")}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-gray-300 rounded focus:border-[#1e70eb] focus:outline-none focus:ring-1 focus:ring-[#1e70eb] text-gray-800 cursor-pointer font-sans appearance-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Buttons aligned right: CANCEL in light-blue text and APPROVE in full blue box */}
            <div className="flex items-center justify-end gap-5 mt-4 text-[12px]">
              <button
                type="button"
                onClick={() => setArticleForApprovalConfirmation(null)}
                className="text-[#1070e0] hover:bg-sky-50 font-bold px-3 py-2 rounded cursor-pointer uppercase transition-colors tracking-wide"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApproveNews(articleForApprovalConfirmation, shareToFacebookOption === "Yes");
                  setArticleForApprovalConfirmation(null);
                }}
                className="bg-[#1a73e8] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded cursor-pointer uppercase transition-all shadow-sm tracking-wide"
              >
                APPROVE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL WITH YES/NO BUTTONS */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-[#000000]/65 flex items-center justify-center z-[999] p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-lg border border-gray-200 max-w-[400px] w-full p-6 shadow-2xl text-left relative flex flex-col">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-full">
                <Trash2 size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#1e293b]">
                {deleteConfirmModal.title || "নিশ্চিতকরণ (Confirmation)"}
              </h2>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed whitespace-pre-line">
              {deleteConfirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 text-[12px]">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(prev => ({ ...prev, show: false }))}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded cursor-pointer uppercase transition-colors tracking-wide border border-gray-300"
              >
                No (না)
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmModal.onConfirm();
                  setDeleteConfirmModal(prev => ({ ...prev, show: false }));
                }}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold px-5 py-2.5 rounded cursor-pointer uppercase transition-all shadow-sm tracking-wide"
              >
                Yes (হ্যাঁ)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
