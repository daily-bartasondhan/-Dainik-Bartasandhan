/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Article, Staff, StaffRole } from "./src/types";
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, doc, setDoc, getDocs, deleteDoc, setLogLevel } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Storage as GcsStorage } from "@google-cloud/storage";
import xhr2 from "xhr2";

(global as any).XMLHttpRequest = xhr2;

setLogLevel("error");

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");
const DATABASES_DIR = path.join(process.cwd(), "databases");

// --- Firebase Configuration & Initialization ---
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseApp: any = null;
let firestoreDb: any = null;
let firebaseStorage: any = null;
let gcsStorageBucket: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const configRaw = fs.readFileSync(firebaseConfigPath, "utf8");
    const config = JSON.parse(configRaw);
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };
    firebaseApp = initializeApp(firebaseConfig);
    const settings = {
      experimentalForceLongPolling: true,
    };
    if (config.firestoreDatabaseId) {
      firestoreDb = initializeFirestore(firebaseApp, settings, config.firestoreDatabaseId);
    } else {
      firestoreDb = initializeFirestore(firebaseApp, settings);
    }
    if (config.storageBucket) {
      firebaseStorage = getStorage(firebaseApp);
      console.log("Firebase Storage initialized successfully with bucket:", config.storageBucket);
      try {
        const gcs = new GcsStorage({ projectId: config.projectId });
        gcsStorageBucket = gcs.bucket(config.storageBucket);
        console.log("Google Cloud Storage SDK initialized with bucket:", config.storageBucket);
      } catch (gcsInitErr: any) {
        console.error("Failed to initialize Google Cloud Storage Node SDK:", gcsInitErr.message);
      }
    }
    console.log("Firebase initialized successfully with project ID:", config.projectId);
  } catch (error: any) {
    console.error("Error initializing Firebase:", error.message);
  }
}

// Function to synchronize Firestore articles to local filesystem DB (for backup/restore)
async function syncFromFirebase() {
  if (!firestoreDb) {
    console.log("Firebase Firestore not available for synchronization.");
    return;
  }
  try {
    console.log("Syncing articles from Firebase Firestore...");
    const querySnapshot = await getDocs(collection(firestoreDb, "articles"));
    const firebaseArticles: Article[] = [];
    querySnapshot.forEach((doc) => {
      firebaseArticles.push(doc.data() as Article);
    });

    console.log(`Fetched ${firebaseArticles.length} articles from Firestore.`);

    if (firebaseArticles.length > 0) {
      const db = readDB();
      // Set Firestore as the absolute source of truth
      db.articles = firebaseArticles;
      writeDB(db);
      console.log("Firebase synchronization completed. Local database updated from Firestore successfully.");
    } else {
      const db = readDB();
      if (db.articles.length > 0) {
        console.log(`Firestore is empty. Seeding ${db.articles.length} local articles to Firestore...`);
        for (const art of db.articles) {
          if (art && art.id) {
            await setDoc(doc(firestoreDb, "articles", String(art.id)), art);
          }
        }
        console.log("Firestore seeding completed.");
      }
    }
  } catch (error: any) {
    console.error("Error syncing articles from Firebase:", error.message);
  }
}

// Robust JSON parse helper with automatic clean up of trailing non-whitespace noise
function safeParseJSON(rawStr: string, defaultVal: any = []) {
  if (!rawStr || !rawStr.trim()) return defaultVal;
  try {
    return JSON.parse(rawStr);
  } catch (err) {
    console.error("JSON parse error, attempting to clean content. Raw length:", rawStr.length);
    try {
      const firstCurly = rawStr.indexOf('{');
      const firstSquare = rawStr.indexOf('[');
      let startIndex = -1;
      let endIndex = -1;
      if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        startIndex = firstCurly;
        endIndex = rawStr.lastIndexOf('}');
      } else if (firstSquare !== -1) {
        startIndex = firstSquare;
        endIndex = rawStr.lastIndexOf(']');
      }
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const cleaned = rawStr.substring(startIndex, endIndex + 1);
        return JSON.parse(cleaned);
      }
    } catch (cleanErr) {
      console.error("Failed to parse cleaned JSON:", cleanErr);
    }
    return defaultVal;
  }
}

// Helper to initialize 24 separate databases
function initializeDatabases() {
  try {
    if (!fs.existsSync(DATABASES_DIR)) {
      fs.mkdirSync(DATABASES_DIR, { recursive: true });
      console.log("Databases directory created successfully.");
    }

    // Read current master db.json to seed from if exists
    let masterArticles: Article[] = [];
    let masterStaff: Staff[] = [];
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, "utf8");
        const parsed = safeParseJSON(raw, {});
        masterArticles = parsed.articles || [];
        masterStaff = parsed.staff || [];
      } catch (e) {
        console.error("Error parsing db.json during migration:", e);
      }
    }

    // 1. Live published posts database (db_posts)
    const postsPath = path.join(DATABASES_DIR, "db_posts.json");
    if (!fs.existsSync(postsPath)) {
      const posts = masterArticles.filter(item => item.status === "Published" || item.status === "Approved" || item.status === "Imported");
      fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), "utf8");
    }

    // 2. Request posts database (db_request_posts)
    const requestPostsPath = path.join(DATABASES_DIR, "db_request_posts.json");
    if (!fs.existsSync(requestPostsPath)) {
      const requestPosts = masterArticles.filter(item => item.status === "Pending" || item.status === "Draft" || item.status === "Rejected");
      fs.writeFileSync(requestPostsPath, JSON.stringify(requestPosts, null, 2), "utf8");
    }

    // 3. Master reporters database (db_reporters)
    const reportersPath = path.join(DATABASES_DIR, "db_reporters.json");
    if (!fs.existsSync(reportersPath)) {
      fs.writeFileSync(reportersPath, JSON.stringify(masterStaff, null, 2), "utf8");
    }

    // 4. Individual reporter database for each member (reporter_{userId})
    for (const reporter of masterStaff) {
      const repPath = path.join(DATABASES_DIR, `reporter_${reporter.userId}.json`);
      if (!fs.existsSync(repPath)) {
        const reporterArticles = masterArticles.filter(art => art.reporterId === reporter.userId);
        fs.writeFileSync(repPath, JSON.stringify({
          profile: reporter,
          articles: reporterArticles,
          lastAccessedAt: new Date().toISOString()
        }, null, 2), "utf8");
      }
    }

    // 5. Family database (db_family)
    const familyPath = path.join(DATABASES_DIR, "db_family.json");
    if (!fs.existsSync(familyPath)) {
      const defaultFamilies = [
        { id: "F-501", headName: "মোঃ নুরুল ইসলাম", memberCount: 5, phone: "01712345601", villageWard: "ওয়ার্ড-০৩, ফরিদপুর সদর", cardType: "Red", status: "Active", registeredDate: "12 May 2026" },
        { id: "F-502", headName: "মোসাম্মত ছালেহা খাতুন", memberCount: 4, phone: "01822334402", villageWard: "ওয়ার্ড-০১, আলফাডাঙ্গা", cardType: "Green", status: "Active", registeredDate: "18 May 2026" },
        { id: "F-503", headName: "আবুল কাসেম চৌধুরী", memberCount: 6, phone: "01933445503", villageWard: "ওয়ার্ড-০৯, মধুখালী", cardType: "Blue", status: "Pending", registeredDate: "25 May 2026" },
        { id: "F-504", headName: "সুফিয়া বেগম", memberCount: 3, phone: "01544556604", villageWard: "ওয়ার্ড-০৫, বোয়ালমারী", cardType: "Red", status: "Inactive", registeredDate: "01 Jun 2026" },
        { id: "F-505", headName: "রমেশ চন্দ্র সরকার", memberCount: 5, phone: "01355667705", villageWard: "ওয়ার্ড-০২, সদরপুর", cardType: "Green", status: "Active", registeredDate: "07 Jun 2026" },
      ];
      fs.writeFileSync(familyPath, JSON.stringify(defaultFamilies, null, 2), "utf8");
    }

    // 6. Photo Cards database (db_photocards)
    const photocardsPath = path.join(DATABASES_DIR, "db_photocards.json");
    if (!fs.existsSync(photocardsPath)) {
      const defaultPhotoCards = [
        { id: "BS-77194", name: "আবদুর রহমান", role: "স্টাফ রিপোর্টার", phone: "01712345678", cardType: "Staff ID", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", issueDate: "01 Jun 2026" }
      ];
      fs.writeFileSync(photocardsPath, JSON.stringify(defaultPhotoCards, null, 2), "utf8");
    }

    // 7. New staff register database (db_new_staff_register)
    const registerPath = path.join(DATABASES_DIR, "db_new_staff_register.json");
    if (!fs.existsSync(registerPath)) {
      const defaultApplications = [
        { id: "S-101", name: "কাজী রাজিব হাসান", email: "kazi.rajib@example.com", phone: "01711223344", selectedRole: "স্টাফ রিপোর্টার", status: "Pending", submitDate: "10 Jun 2026" }
      ];
      fs.writeFileSync(registerPath, JSON.stringify(defaultApplications, null, 2), "utf8");
    }

    // 8. Staff ID Cards tracker database (db_staff_idcards)
    const staffIdCardsPath = path.join(DATABASES_DIR, "db_staff_idcards.json");
    if (!fs.existsSync(staffIdCardsPath)) {
      const defaultIdCards = [
        { id: "9", staffId: "9", name: "আবিদ রহমান", role: "স্টাফ রিপোর্টার", email: "abid@dainikbartasandhan.com", status: "Active" }
      ];
      fs.writeFileSync(staffIdCardsPath, JSON.stringify(defaultIdCards, null, 2), "utf8");
    }

    // 9. Editor profile/configs database (db_editor)
    const editorDBPath = path.join(DATABASES_DIR, "db_editor.json");
    if (!fs.existsSync(editorDBPath)) {
      fs.writeFileSync(editorDBPath, JSON.stringify({
        userId: "admin",
        name: "বার্তা সম্পাদক",
        designation: "সম্পাদক",
        fatherName: "কামাল হোসেন",
        motherName: "ফাতেমা বেগম",
        nid: "19924455668844",
        status: "Active",
        lastLogin: new Date().toISOString()
      }, null, 2), "utf8");
    }

    // 10. Dashboard analytics database (db_dashboard)
    const dashboardPath = path.join(DATABASES_DIR, "db_dashboard.json");
    if (!fs.existsSync(dashboardPath)) {
      const defaultDashboard = {
        todayCount: 4,
        thisWeekCount: 18,
        thisMonthCount: 28,
        yesterdayCount: 1,
        lastWeekCount: 12,
        lastMonthCount: 64,
        thisYearCount: 764,
        lastYearCount: 0,
        totalCount: 764,
        dhakaCount: 229,
        taiyuanCount: 41,
        charlotteCount: 30,
        socialCircleCount: 18,
        ashburnCount: 18,
        visitorLogs: [
          { id: "v-1", sl: 1, date: "11 Jun 2026 , 10:42 AM", location: "Dhaka, Dhaka Division, BD", visitorsCount: 1 },
          { id: "v-2", sl: 2, date: "11 Jun 2026 , 08:15 AM", location: "Charlotte, North Carolina, US", visitorsCount: 1 }
        ]
      };
      fs.writeFileSync(dashboardPath, JSON.stringify(defaultDashboard, null, 2), "utf8");
    }

    // 11. News Categories database (db_categories)
    const categoriesPath = path.join(DATABASES_DIR, "db_categories.json");
    if (!fs.existsSync(categoriesPath)) {
      const defaultCategories = [
        { "id": 1, "name": "জাতীয়", "slug": "national", "count": 18 },
        { "id": 2, "name": "রাজনীতি", "slug": "politics", "count": 12 },
        { "id": 3, "name": "আন্তর্জাতিক", "slug": "international", "count": 15 },
        { "id": 4, "name": "অর্থনীতি", "slug": "economy", "count": 9 },
        { "id": 5, "name": "সারাদেশ", "slug": "countrywide", "count": 22 },
        { "id": 6, "name": "খেলা", "slug": "sports", "count": 14 },
        { "id": 7, "name": "বিনোদন", "slug": "entertainment", "count": 11 }
      ];
      fs.writeFileSync(categoriesPath, JSON.stringify(defaultCategories, null, 2), "utf8");
    }

    // 12. Public Live Images gallery database (db_images)
    const imagesPath = path.join(DATABASES_DIR, "db_images.json");
    if (!fs.existsSync(imagesPath)) {
      const defaultImages = [
        { id: "img-1", title: "জাতীয় বাজেট সম্মেলন", url: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80", uploader: "admin", uploadedAt: "07 Jun 2026" },
        { id: "img-2", title: "ঢাকা-কক্সবাজার এক্সপ্রেস সংযোগ", url: "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80", uploader: "reporter1", uploadedAt: "07 Jun 2026" }
      ];
      fs.writeFileSync(imagesPath, JSON.stringify(defaultImages, null, 2), "utf8");
    }

    // 13. Public Live Videos gallery database (db_videos)
    const videosPath = path.join(DATABASES_DIR, "db_videos.json");
    if (!fs.existsSync(videosPath)) {
      const defaultVideos = [
        { id: "vid-1", title: "পদ্মা সেতু উদ্বোধনী প্রামাণ্যচিত্র", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", uploader: "admin", uploadedAt: "06 Jun 2026" }
      ];
      fs.writeFileSync(videosPath, JSON.stringify(defaultVideos, null, 2), "utf8");
    }

    // 14. Requested Image Uploads database (db_request_images)
    const reqImgPath = path.join(DATABASES_DIR, "db_request_images.json");
    if (!fs.existsSync(reqImgPath)) {
      fs.writeFileSync(reqImgPath, JSON.stringify([], null, 2), "utf8");
    }

    // 15. Requested Video uploads database (db_request_videos)
    const reqVidPath = path.join(DATABASES_DIR, "db_request_videos.json");
    if (!fs.existsSync(reqVidPath)) {
      fs.writeFileSync(reqVidPath, JSON.stringify([], null, 2), "utf8");
    }

    // 16. WordPress imported posts database (db_imported_posts)
    const importedPostsPath = path.join(DATABASES_DIR, "db_imported_posts.json");
    if (!fs.existsSync(importedPostsPath)) {
      fs.writeFileSync(importedPostsPath, JSON.stringify([], null, 2), "utf8");
    }

    // 17. Settings - Header settings database (db_settings_header)
    const settingsHeaderPath = path.join(DATABASES_DIR, "db_settings_header.json");
    if (!fs.existsSync(settingsHeaderPath)) {
      const defaultHeader = {
        hdrLightColor: "bg-[#2563eb]",
        hdrDarkColor: "bg-slate-900",
        hdrLanguageButton: "Yes",
        hdrTickerSpeed: "Normal",
        hdrStickyNavbar: "Yes",
        hdrLiveTvButton: "Yes"
      };
      fs.writeFileSync(settingsHeaderPath, JSON.stringify(defaultHeader, null, 2), "utf8");
    }

    // 18. Settings - Footer settings database (db_settings_footer)
    const settingsFooterPath = path.join(DATABASES_DIR, "db_settings_footer.json");
    if (!fs.existsSync(settingsFooterPath)) {
      const defaultFooter = {
        footerTextColor: "text-gray-400",
        copyrightText: "© ২০২৬ দৈনিক বার্তা সন্ধান | সর্বস্বত্ব সংরক্ষিত",
        editorName: "কামাল হোসেন",
        showSocialLinks: "Yes"
      };
      fs.writeFileSync(settingsFooterPath, JSON.stringify(defaultFooter, null, 2), "utf8");
    }

    // 19. Settings - SEO settings database (db_settings_seo)
    const settingsSeoPath = path.join(DATABASES_DIR, "db_settings_seo.json");
    if (!fs.existsSync(settingsSeoPath)) {
      const defaultSeo = {
        siteTitle: "দৈনিক বার্তা সন্ধান - সত্যের সন্ধানে সার্বক্ষণিক",
        metaDescription: "বাংলাদেশের অন্যতম সেরা অনলাইন সংবাদপত্র পোর্টাল যেখানে পাবেন বিশ্বস্ত সত্য খবর ২৪ ঘণ্টা।",
        metaKeywords: "বাংলাদেশ, সংবাদ, খবর, রাজনীতি, খেলাধুলা, জাতীয় বাজেট"
      };
      fs.writeFileSync(settingsSeoPath, JSON.stringify(defaultSeo, null, 2), "utf8");
    }

    // 20. Settings - Facebook settings database (db_settings_facebook)
    const settingsFacebookPath = path.join(DATABASES_DIR, "db_settings_facebook.json");
    if (!fs.existsSync(settingsFacebookPath)) {
      const defaultFacebook = {
        fbPageUrl: "https://facebook.com/dainikbartasandhan",
        fbAppId: "123456789123",
        autoShareToFB: "No"
      };
      fs.writeFileSync(settingsFacebookPath, JSON.stringify(defaultFacebook, null, 2), "utf8");
    }

    // 21. Settings - Mail/SMTP settings database (db_settings_mail)
    const settingsMailPath = path.join(DATABASES_DIR, "db_settings_mail.json");
    if (!fs.existsSync(settingsMailPath)) {
      const defaultMail = {
        smtpHost: "smtp.mailtrap.io",
        smtpPort: "2525",
        smtpUser: "test-user-smtp",
        senderEmail: "no-reply@dainikbartasandhan.com"
      };
      fs.writeFileSync(settingsMailPath, JSON.stringify(defaultMail, null, 2), "utf8");
    }

    // 22. Settings - Login portal control database (db_settings_login)
    const settingsLoginPath = path.join(DATABASES_DIR, "db_settings_login.json");
    if (!fs.existsSync(settingsLoginPath)) {
      const defaultLogin = {
        allowRegistration: "Yes",
        twoFactorAuth: "No",
        sessionTimeout: "30"
      };
      fs.writeFileSync(settingsLoginPath, JSON.stringify(defaultLogin, null, 2), "utf8");
    }

    // 23. Settings - Advertisements settings database (db_settings_ads)
    const settingsAdsPath = path.join(DATABASES_DIR, "db_settings_ads.json");
    if (!fs.existsSync(settingsAdsPath)) {
      const defaultAds = {
        adUnderNav: `<div className="w-full h-24 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">
            Banner Promotion Space (728 x 90px)
          </span>
        </div>`,
        adSidebar: `<div className="w-full h-80 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">
            Square Sidebar ad Space (300 x 250px)
          </span>
        </div>`
      };
      fs.writeFileSync(settingsAdsPath, JSON.stringify(defaultAds, null, 2), "utf8");
    }

    // 24. Settings - RSS Feed database (db_settings_rss)
    const settingsRssPath = path.join(DATABASES_DIR, "db_settings_rss.json");
    if (!fs.existsSync(settingsRssPath)) {
      const defaultRss = {
        rssLimit: "50",
        rssFeedUrl: "/feed.xml",
        syndicationActive: "Yes"
      };
      fs.writeFileSync(settingsRssPath, JSON.stringify(defaultRss, null, 2), "utf8");
    }

    // 25. Settings - Import WordPress database (db_settings_import_wp)
    const settingsImportWpPath = path.join(DATABASES_DIR, "db_settings_import_wp.json");
    if (!fs.existsSync(settingsImportWpPath)) {
      const defaultImportWp = {
        wpUrl: "https://wordpress.org",
        wpApiKey: "wp_779310"
      };
      fs.writeFileSync(settingsImportWpPath, JSON.stringify(defaultImportWp, null, 2), "utf8");
    }

    console.log("All 24 distinct databases initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize separate databases:", error);
  }
}

// Ensure execution of db creation on boot and restore/backup from Firebase Firestore
initializeDatabases();
syncFromFirebase()
  .then(() => console.log("Initial Firestore-to-Local sync done."))
  .catch((e) => console.error("Initial Firestore sync error:", e));

// Middleware to parse JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images statically
app.use("/uploads", express.static(UPLOADS_DIR));

function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Helper to read database (combining split databases in real-time)
function readDB(): { articles: Article[]; staff: Staff[] } {
  try {
    const postsPath = path.join(DATABASES_DIR, "db_posts.json");
    const requestPostsPath = path.join(DATABASES_DIR, "db_request_posts.json");
    let articles: Article[] = [];

    if (fs.existsSync(postsPath)) {
      try {
        const postsRaw = fs.readFileSync(postsPath, "utf8");
        articles = articles.concat(safeParseJSON(postsRaw, []));
      } catch (e) {}
    }
    if (fs.existsSync(requestPostsPath)) {
      try {
        const reqRaw = fs.readFileSync(requestPostsPath, "utf8");
        articles = articles.concat(safeParseJSON(reqRaw, []));
      } catch (e) {}
    }

    // If both files empty or non-existent, try reading root db.json as backup
    if (articles.length === 0 && fs.existsSync(DB_PATH)) {
      try {
        const rootRaw = fs.readFileSync(DB_PATH, "utf8");
        articles = safeParseJSON(rootRaw, {}).articles || [];
      } catch (e) {}
    }

    let staffArray: Staff[] = [];
    const reportersPath = path.join(DATABASES_DIR, "db_reporters.json");
    if (fs.existsSync(reportersPath)) {
      try {
        const raw = fs.readFileSync(reportersPath, "utf8");
        staffArray = safeParseJSON(raw, []);
      } catch (e) {}
    }

    if (staffArray.length === 0 && fs.existsSync(DB_PATH)) {
      try {
        const rootRaw = fs.readFileSync(DB_PATH, "utf8");
        staffArray = safeParseJSON(rootRaw, {}).staff || [];
      } catch (e) {}
    }

    return { articles, staff: staffArray };
  } catch (error) {
    console.error("Error reading databases:", error);
    return { articles: [], staff: [] };
  }
}

// Helper to write database (writing partition sets to different database files)
function writeDB(data: { articles: Article[]; staff: Staff[] }) {
  try {
    // 1. Maintain back-up on main db.json
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

    // 2. Split articles into Live Published vs review/requests databases
    const posts = data.articles.filter(item => item.status === "Published" || item.status === "Approved" || item.status === "Imported");
    const requestPosts = data.articles.filter(item => item.status === "Pending" || item.status === "Draft" || item.status === "Rejected");

    fs.writeFileSync(path.join(DATABASES_DIR, "db_posts.json"), JSON.stringify(posts, null, 2), "utf8");
    fs.writeFileSync(path.join(DATABASES_DIR, "db_request_posts.json"), JSON.stringify(requestPosts, null, 2), "utf8");

    // 3. Save master staff list
    fs.writeFileSync(path.join(DATABASES_DIR, "db_reporters.json"), JSON.stringify(data.staff, null, 2), "utf8");

    // 4. Save independent database for EACH individual reporter (প্রতি সংবাদ কর্মীর আলাদা ডাটাবেস)
    for (const reporter of data.staff) {
      const repPath = path.join(DATABASES_DIR, `reporter_${reporter.userId}.json`);
      const reporterArticles = data.articles.filter(art => art.reporterId === reporter.userId);
      const reporterDB = {
        profile: reporter,
        articles: reporterArticles,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(repPath, JSON.stringify(reporterDB, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Error partitioning database writes:", error);
  }
}

// API Routes
// AI Endpoints for WYSIWYG Editor Support
app.post("/api/ai/generate", async (req, res) => {
  const { prompt, topic, type } = req.body;
  try {
    const ai = getGemini();
    let sysInstruction = "You are a professional assistant and editor.";
    let contents = "";

    if (type === "article") {
      sysInstruction = "You are a highly professional journalist. Write a detailed, realistic news article report in Bengali based on the provided title or instructions. The response must be formatted with elegant HTML, paragraphs (<p>), and occasional subheadings (<h3>). Output only the rich HTML text itself, no markdown wrappers, no backticks, no external code block blocks.";
      contents = `Create a realistic Bengali news article, rich in detail, based on this title or instruction: "${prompt || topic || "ফরিদপুরে নতুন প্রযুক্তি মেলার আয়োজন"}"`;
    } else if (type === "summarize") {
      sysInstruction = "You are an expert news analyst. Write a highly concise summary of the provided text in Bengali, within 2-3 paragraphs. Return rich HTML (<p> and <strong>). Do not return markdown wrappers or backticks.";
      contents = `Summarize this text in Bengali: "${prompt}"`;
    } else if (type === "headline") {
      sysInstruction = "You are an expert copywriter. Generate 3 catchy, high-impact headlines in Bengali for the provided article content or topic. Return them in a clean HTML list (<ul> with <li>). No markdown wrappers.";
      contents = `Input: "${prompt || topic}"`;
    } else {
      sysInstruction = "You are a writing assistant. Improve the text, outputting pure elegant HTML. No markdown wrappers.";
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: sysInstruction,
      },
    });

    const resultText = response.text || "";
    // Clean up any stray markdown wrappers just in case
    const cleanedResult = resultText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    return res.json({ text: cleanedResult });

  } catch (error: any) {
    console.warn("Gemini API skipped or errored. Using fallback. Error:", error.message);
    
    // Fallback content in Bengali so that the application works seamlessly
    let fallbackText = "";
    if (type === "article") {
      fallbackText = `<h3>ফরিদপুরে নতুন উদ্যোগ: অগ্রগতির পথে এক নতুন দিগন্ত</h3>
<p>আজ ফরিদপুর কড়চা প্রতিনিধি জানিয়েছেন যে, অত্র অঞ্চলের সাধারণ মানুষের অর্থনৈতিক এবং সামাজিক উন্নয়নে এক যুগান্তকারী পদক্ষেপ গ্রহণ করা হয়েছে। সভায় উপস্থিত বিশিষ্টজনরা বলেন, এ উদ্যোগের মাধ্যমে কর্মসংস্থান সৃষ্টি ও শিক্ষার মানোন্নয়ন আশানুরূপ গতি পাবে।</p>
<p>স্থানীয় প্রশাসনের বিশেষ তদারকিতে এই প্রকল্পের সফল বাস্তবায়নে আশাবাদী সকল মহল। আগামী সপ্তাহ থেকেই এর প্রারম্ভিক কার্যক্রম শুরু হবে বলে বিশ্বস্ত সূত্রে জানা গেছে।</p>`;
    } else if (type === "summarize") {
      fallbackText = `<p><strong>সংক্ষিপ্তসার:</strong> নিবন্ধটিতে ফরিদপুর অঞ্চলের নতুন সামাজিক ও অর্থনৈতিক উন্নয়ন পদক্ষেপ নিয়ে বিস্তারিত আলোকপাত করা হয়েছে। কর্মসংস্থান সৃষ্টি ও শিক্ষার প্রসারে প্রশাসনের ইতিবাচক অবদানের প্রশংসা করা হয়েছে এখানে।</p>`;
    } else if (type === "headline") {
      fallbackText = `<ul>
  <li>ফরিদপুরে নতুন সূচনা: সম্ভাবনার এক নতুন দুয়ার</li>
  <li>উন্নয়নে নব জোয়ার: ফরিদপুর জেলা প্রশাসনের নতুন মহাপরিকল্পনা</li>
  <li>কর্মসংস্থানে সাফল্য: স্বাবলম্বী হচ্ছে ফরিদপুরের তরুণ সমাজ</li>
</ul>`;
    } else {
      fallbackText = `<p>(এআই সহকারী) আপনার লেখার গুণগত মান উন্নয়নে আমরা প্রতিজ্ঞাবদ্ধ। অনুগ্রহ করে Settings > Secrets প্যানেলে আপনার GEMINI_API_KEY প্রদান করুন যেন সম্পূর্ণ সক্রিয় এআই রাইটার কাজ করতে পারে।</p>`;
    }
    
    return res.json({ 
      text: fallbackText, 
      warning: "Running in fallback mode. To enable full AI functionality, please configure your GEMINI_API_KEY in Settings > Secrets." 
    });
  }
});

app.post("/api/ai/improve", async (req, res) => {
  const { text, command } = req.body;
  try {
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Improve or modify this text based on the request: "${command}". Return the result in pure elegant rich HTML format. Do not use markdown backticks or wrappers. Existing text: "${text}"`,
      config: {
        systemInstruction: "You are a professional editor. Improve the provided HTML copy while keeping its semantic tags and structure intact. Return only clean HTML code, no markdown block wrapper, no backticks.",
      },
    });

    const resultText = response.text || "";
    const cleanedResult = resultText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    return res.json({ text: cleanedResult });
  } catch (error: any) {
    console.warn("Gemini API skipped/errored during improve. Error:", error.message);
    return res.json({ 
      text: `<p><strong>(সংশোধিত রূপ)</strong> ${text || "কোনো লেখা প্রদান করা হয়নি।"}</p><p class="text-xs text-red-500 italic mt-2">নোট: এআই পোলিশিং সক্রিয় করতে Settings এ আপনার GEMINI_API_KEY যুক্ত করুন।</p>`,
      warning: "Settings এ আপনার GEMINI_API_KEY যুক্ত করুন।"
    });
  }
});

// 1. Auth Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { userId, password, role } = req.body; // role: admin or staff
    const db = readDB();

    // UNCONDITIONAL PERMANENT ADMIN BYPASS
    if (userId === "BatraSondhanAzmeer2026" && password === "BatraSondhanAzmeer2026@@") {
      let adminAccount = (db.staff || []).find((s) => s.userId === "BatraSondhanAzmeer2026" || s.userId === "admin");
      if (!adminAccount) {
        adminAccount = {
          userId: "BatraSondhanAzmeer2026",
          name: "সম্পাদক",
          designation: "সম্পাদক",
          role: "admin",
          status: "Active"
        } as any;
      }
      const { passwordHash, ...safeProfile } = adminAccount;
      safeProfile.designation = "সম্পাদক";
      safeProfile.userId = "BatraSondhanAzmeer2026";
      safeProfile.status = "Active";
      return res.json({ success: true, user: safeProfile, token: "admin-jwt-mock-token" });
    }

    if (userId === "BatraSondhanAzmeer2026" && password !== "BatraSondhanAzmeer2026@@") {
      return res.status(401).json({ error: "ভুল ইউজার আইডি অথবা পাসওয়ার্ড" });
    }

    if (role === "admin" || role === "editor" || userId === "admin" || userId === "BatraSondhanAzmeer2026") {
      // Admin / Editor login
      const adminAccount = (db.staff || []).find((s) => s.userId === "admin" || s.userId === "BatraSondhanAzmeer2026");
      if (adminAccount && (adminAccount.passwordHash === password || password === "BatraSondhanAzmeer2026@@" || password === "admin123")) {
        if (adminAccount.status === "Suspended") {
          return res.status(403).json({ error: "Your account is suspended." });
        }
        const { passwordHash, ...safeProfile } = adminAccount;
        safeProfile.designation = "সম্পাদক";
        // Ensure the return profile uses the requested custom userId
        safeProfile.userId = "BatraSondhanAzmeer2026";
        return res.json({ success: true, user: safeProfile, token: "admin-jwt-mock-token" });
      }
    } else {
      // Staff login
      const staffAccount = (db.staff || []).find((s) => s.userId === userId);
      const isPasswordValid = staffAccount && (
        staffAccount.passwordHash === password ||
        (staffAccount.userId === "reporter1" && (password === "reporter123" || password === "admin123"))
      );
      if (staffAccount && isPasswordValid) {
        if (staffAccount.status === "Suspended") {
          return res.status(403).json({ error: "Your account is currently suspended. Please contact Admin." });
        }
        const { passwordHash, ...safeProfile } = staffAccount;
        return res.json({ success: true, user: safeProfile, token: `staff-jwt-mock-${userId}` });
      }
    }

    return res.status(401).json({ error: "ভুল ইউজার আইডি অথবা পাসওয়ার্ড" });
  } catch (error: any) {
    console.error("Login endpoint crash:", error);
    return res.status(500).json({ error: "সার্ভারে একটি ত্রুটি ঘটেছে, অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
});

// 2. Refresh / Verify auth mock token
app.get("/api/auth/me", (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const db = readDB();
    if (token === "admin-jwt-mock-token") {
      let admin = (db.staff || []).find(s => s.userId === "admin" || s.userId === "BatraSondhanAzmeer2026");
      if (!admin) {
         admin = {
           userId: "BatraSondhanAzmeer2026",
           name: "সম্পাদক",
           designation: "সম্পাদক",
           role: "admin",
           status: "Active"
         } as any;
       }
      const { passwordHash, ...safe } = admin;
      safe.userId = "BatraSondhanAzmeer2026"; // Ensure consistent userId
      safe.designation = "সম্পাদক";
      safe.status = "Active";
      return res.json({ user: safe });
    } else if (token.startsWith("staff-jwt-mock-")) {
      const userId = token.replace("staff-jwt-mock-", "");
      const staff = (db.staff || []).find(s => s.userId === userId);
      if (staff) {
        if (staff.status === "Suspended") {
          return res.status(403).json({ error: "Suspended" });
        }
        const { passwordHash, ...safe } = staff;
        return res.json({ user: safe });
      }
    }
    return res.status(401).json({ error: "Invalid token" });
  } catch (error: any) {
    console.error("Auth me verify crash:", error);
    return res.status(500).json({ error: "সার্ভার যাচাইকরণ ত্রুটি।" });
  }
});

// 3. News Feed & Search Routes
app.get("/api/news", (req, res) => {
  const db = readDB();
  let news = db.articles;

  // Query filters
  const { category, subcategory, status, search, limit } = req.query;

  // Filter out status (by default only published shown for public, unless specified)
  if (status && status !== "all") {
    news = news.filter((item) => item.status === status);
  } else if (!status) {
    // Public Feed: Show if Published, Approved, Imported, or Scheduled (in the past)
    const now = Date.now();
    news = news.filter((item) => {
      if (item.status === "Published" || item.status === "Approved" || item.status === "Imported") {
        return true;
      }
      if (item.status === "Scheduled") {
        const pubTime = new Date(item.publicationDate).getTime();
        return !isNaN(pubTime) && pubTime <= now;
      }
      return false;
    });
  }

  if (category) {
    news = news.filter((item) => item.category === category);
  }

  if (subcategory) {
    news = news.filter((item) => item.subcategory === subcategory);
  }

  if (search) {
    const q = String(search).toLowerCase();
    news = news.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.content.toLowerCase().includes(q)
    );
  }

  // Sort by reverse publication date (newest first)
  news.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

  if (limit) {
    news = news.slice(0, Number(limit));
  }

  res.json(news);
});

// 4. Get most popular news (sorted by views)
app.get("/api/news/popular", (req, res) => {
  const db = readDB();
  const publishedNews = db.articles.filter((item) => item.status === "Published" || item.status === "Approved");
  publishedNews.sort((a, b) => b.views - a.views);
  res.json(publishedNews.slice(0, 10));
});

// 5. Single item detail with dynamic views counter increment
app.get("/api/news/:id", (req, res) => {
  const id = req.params.id;
  const db = readDB();
  const articleIndex = db.articles.findIndex((item) => String(item.id) === String(id));

  if (articleIndex === -1) {
    return res.status(404).json({ error: "পদ্ধতিগত সংবাদ খুঁজে পাওয়া যায়নি" });
  }

  // Increment view counter and save
  db.articles[articleIndex].views += 1;
  writeDB(db);

  const updatedArticle = db.articles[articleIndex];
  if (firestoreDb && updatedArticle.id) {
    setDoc(doc(firestoreDb, "articles", String(updatedArticle.id)), updatedArticle)
      .catch((err: any) => console.error(`Failed to update article views in Firestore:`, err.message));
  }

  res.json(db.articles[articleIndex]);
});

// 6. Submit or Upload News Article (Direct from Admin / Reporter)
app.post("/api/news", (req, res) => {
  const { title, subtitle, dSubTitle, content, category, subcategory, tags, images, imageDescriptions, videoUrl, reporterId, reporterName, status, publicationDate, createdAt, updatedAt, isLead, isHeadline } = req.body;
  const db = readDB();

  if (!title || !content || !category) {
    return res.status(400).json({ error: "শিরোনাম, বিস্তারিত বিবরণ এবং ক্যাটাগরি আবশ্যক।" });
  }

  const nowStr = new Date().toISOString();
  const finalPubDate = publicationDate ? new Date(publicationDate).toISOString() : nowStr;
  const cleanDescription = stripHtmlTags(content).substring(0, 160) + "...";

  const newArticle: Article = {
    id: Date.now().toString(),
    title,
    subtitle: subtitle || "",
    dSubTitle: dSubTitle || "",
    description: cleanDescription,
    content,
    category,
    subcategory: subcategory || "",
    tags: tags || [],
    publicationDate: finalPubDate,
    createdAt: createdAt ? new Date(createdAt).toISOString() : nowStr,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : nowStr,
    status: status || "Pending", // Admin sets status
    views: 0,
    images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"], // default fallback
    imageDescriptions: Array.isArray(imageDescriptions) ? imageDescriptions : [],
    videoUrl: videoUrl || "",
    reporterId: reporterId || "admin",
    reporterName: reporterName || "বার্তা ডেস্ক",
    isLead: !!isLead,
    isHeadline: !!isHeadline
  };

  db.articles.push(newArticle);
  writeDB(db);

  if (firestoreDb && newArticle.id) {
    setDoc(doc(firestoreDb, "articles", String(newArticle.id)), newArticle)
      .then(() => console.log(`Article ${newArticle.id} successfully backed up to Firestore.`))
      .catch((err: any) => console.error(`Failed to backup article ${newArticle.id} to Firestore:`, err.message));
  }

  res.status(201).json({ success: true, article: newArticle });
});

// 7. Edit / Review / Approve Article (Put Route)
app.put("/api/news/:id", (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const db = readDB();

  const index = db.articles.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: "নিউজ আর্টিকেল খুঁজে পাওয়া যায়নি।" });
  }

  const nowStr = new Date().toISOString();

  let description = updateData.description || db.articles[index].description;
  if (updateData.content && !updateData.description) {
    description = stripHtmlTags(updateData.content).substring(0, 160) + "...";
  }

  db.articles[index] = {
    ...db.articles[index],
    ...updateData,
    description,
    updatedAt: nowStr,
    publicationDate: (updateData.status === "Published" && db.articles[index].status !== "Published")
      ? nowStr
      : (updateData.publicationDate || db.articles[index].publicationDate || nowStr),
    id
  };

  writeDB(db);

  const updatedArticle = db.articles[index];
  if (firestoreDb && updatedArticle.id) {
    setDoc(doc(firestoreDb, "articles", String(updatedArticle.id)), updatedArticle)
      .then(() => console.log(`Article ${updatedArticle.id} successfully updated in Firestore.`))
      .catch((err: any) => console.error(`Failed to update article ${updatedArticle.id} in Firestore:`, err.message));
  }

  res.json({ success: true, article: db.articles[index] });
});

// 8. Delete Article (Disabled for security and data protection)
app.delete("/api/news/:id", (req, res) => {
  return res.status(403).json({ error: "নিরাপত্তার স্বার্থে এবং তথ্যের সুরক্ষায় কোনো সংবাদ বা নিউজ ডিলিট করা অনুমোদিত নয়।" });
});

// 8b. Upload Image to Storage (Base64 to Local static file & Google Cloud Storage)
app.post("/api/upload", async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ error: "কোন ছবি বা ইমেজ পাঠানো হয়নি।" });
    }

    // Support both simple dataURL formats and raw base64 data, as well as video uploads
    const matches = image.match(/^data:(image|video)\/([A-Za-z-+\/0-9]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "jpg";
    let contentType = "image/jpeg";
    let isVideo = false;

    if (matches && matches.length === 4) {
      const type = matches[1]; // "image" or "video"
      const subType = matches[2]; // "jpeg", "png", "mp4" etc.
      ext = subType === "jpeg" ? "jpg" : subType;
      if (ext.includes("svg")) ext = "svg";
      buffer = Buffer.from(matches[3], "base64");
      contentType = `${type}/${subType}`;
      if (type === "video") isVideo = true;
    } else {
      // Fallback: treat as raw base64 png
      buffer = Buffer.from(image, "base64");
      ext = "png";
      contentType = "image/png";
    }

    const prefix = isVideo ? "vid" : "img";
    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Save locally as backup
    fs.writeFileSync(filePath, buffer);

    let fileUrl = `/uploads/${filename}`;

    // 1. Try to upload using Google Cloud Storage SDK
    if (gcsStorageBucket) {
      try {
        const file = gcsStorageBucket.file(`uploads/${filename}`);
        await file.save(buffer, {
          metadata: {
            contentType: contentType,
          },
          resumable: false,
        });

        // Try making public. It can fail if Uniform bucket-level access is active.
        try {
          await file.makePublic();
          fileUrl = `https://storage.googleapis.com/${gcsStorageBucket.name}/uploads/${filename}`;
          console.log(`Successfully uploaded ${filename} to GCS (Direct Public Link):`, fileUrl);
        } catch (pubErr: any) {
          // If Uniform access is enabled, makePublic fails, so we use the Firebase Storage public proxy URL format:
          const encodedPath = encodeURIComponent(`uploads/${filename}`);
          fileUrl = `https://firebasestorage.googleapis.com/v0/b/${gcsStorageBucket.name}/o/${encodedPath}?alt=media`;
          console.log(`Successfully uploaded ${filename} to GCS (Proxy URL):`, fileUrl);
        }
      } catch (gcsError: any) {
        console.error("GCS Node SDK Upload failed, attempting Web SDK fallback:", gcsError.message);
        
        // 2. Fallback to Firebase Web Client SDK upload
        if (firebaseStorage) {
          try {
            const sRef = storageRef(firebaseStorage, `uploads/${filename}`);
            await uploadBytes(sRef, buffer, { contentType });
            const downloadUrl = await getDownloadURL(sRef);
            fileUrl = downloadUrl;
            console.log(`Successfully uploaded ${filename} using Firebase Web SDK fallback:`, fileUrl);
          } catch (webErr: any) {
            console.error("Firebase Web SDK fallback upload also failed:", webErr.message);
          }
        }
      }
    } else if (firebaseStorage) {
      // If GCS Node SDK is not available, try Firebase Web SDK
      try {
        const sRef = storageRef(firebaseStorage, `uploads/${filename}`);
        await uploadBytes(sRef, buffer, { contentType });
        const downloadUrl = await getDownloadURL(sRef);
        fileUrl = downloadUrl;
        console.log(`Successfully uploaded ${filename} using Firebase Web SDK (No GCS SDK):`, fileUrl);
      } catch (webErr: any) {
        console.error("Firebase Web SDK Upload failed:", webErr.message);
      }
    }

    // If we fell back to a local URL because cloud storage upload failed or wasn't configured,
    // we return the original base64 string (image) so it gets stored persistently in the database as a Base64 string.
    // This prevents images from breaking when the container/server restarts or local disk is cleared.
    if (fileUrl.startsWith("/uploads/")) {
      console.log(`Cloud storage was not available or failed. Returning persistent Base64 string fallback for ${filename}`);
      fileUrl = image;
    }

    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "ফাইল সংরক্ষণ করতে ব্যর্থ হয়েছে: " + error.message });
  }
});

// 9. Admin route: Get all staff profiles
app.get("/api/staff", (req, res) => {
  const db = readDB();
  const safeStaffList = db.staff.map(({ passwordHash, ...safe }) => safe);
  res.json(safeStaffList);
});

// 10. Admin route: Create new staff profile
app.post("/api/staff", (req, res) => {
  const {
    userId,
    password,
    staffId,
    name,
    designation,
    fatherName,
    motherName,
    mobile,
    nid,
    presentAddress,
    permanentAddress,
    email,
    createdAt,
    author,
    autoApprovePost,
    authorCity,
    authorAddress,
    picture
  } = req.body;
  const db = readDB();

  if (!userId || !password || !staffId || !name || !designation) {
    return res.status(400).json({ error: "ইউজার আইডি, পাসওয়ার্ড, স্টাফ আইডি, নাম এবং পদবী আবশ্যক।" });
  }

  // Check if userId already exists
  if (db.staff.some((s) => s.userId === userId)) {
    return res.status(400).json({ error: "দুঃখিত, এই ইউজার আইডিটি ইতিমধ্যেই নিবন্ধিত।" });
  }

  const newStaff: Staff = {
    userId,
    passwordHash: password, // Store password plain comparison in simulated database
    staffId,
    name,
    designation,
    fatherName: fatherName || "",
    motherName: motherName || "",
    mobile: mobile || "",
    nid: nid || "",
    presentAddress: presentAddress || "",
    permanentAddress: permanentAddress || "",
    status: "Active",
    email,
    createdAt,
    author,
    autoApprovePost,
    authorCity,
    authorAddress,
    picture
  };

  db.staff.push(newStaff);
  writeDB(db);

  const todayStr = new Date();
  const dayStr = todayStr.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthStr = monthNames[todayStr.getMonth()];
  const yearStr = todayStr.getFullYear();
  const submitDate = `${dayStr} ${monthStr} ${yearStr}`;

  // CONCURRENT SAVE: Add to db_new_staff_register.json
  try {
    const registerPath = path.join(DATABASES_DIR, "db_new_staff_register.json");
    let registerList = [];
    if (fs.existsSync(registerPath)) {
      const raw = fs.readFileSync(registerPath, "utf8");
      registerList = safeParseJSON(raw, []);
    }

    registerList.push({
      id: staffId,
      name: name,
      email: email || `${userId}@dainikbartasandhan.com`,
      phone: mobile || "",
      selectedRole: designation,
      status: "Active",
      submitDate: submitDate
    });
    fs.writeFileSync(registerPath, JSON.stringify(registerList, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to append to db_new_staff_register.json:", err);
  }

  // CONCURRENT SAVE: Add to db_staff_idcards.json
  try {
    const idcardsPath = path.join(DATABASES_DIR, "db_staff_idcards.json");
    let idcardsList = [];
    if (fs.existsSync(idcardsPath)) {
      const raw = fs.readFileSync(idcardsPath, "utf8");
      idcardsList = safeParseJSON(raw, []);
    }

    idcardsList.push({
      id: staffId,
      staffId: staffId,
      name: name,
      role: designation,
      email: email || `${userId}@dainikbartasandhan.com`,
      status: "Active"
    });
    fs.writeFileSync(idcardsPath, JSON.stringify(idcardsList, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to append to db_staff_idcards.json:", err);
  }

  // CONCURRENT SAVE: Add to db_users.json (Users Database)
  try {
    const usersPath = path.join(DATABASES_DIR, "db_users.json");
    let usersList = [];
    if (fs.existsSync(usersPath)) {
      const raw = fs.readFileSync(usersPath, "utf8");
      usersList = safeParseJSON(raw, []);
    } else {
      usersList = [
        { "id": "U-101", "name": "আব্দুর রহমান", "email": "rahman@gmail.com", "phone": "01712345678", "role": "Contributor", "status": "Active", "joinedDate": "01 Jun 2026" },
        { "id": "U-102", "name": "তাসমিয়া আহমেদ", "email": "tasmia@gmail.com", "phone": "01811223344", "role": "Reporter", "status": "Active", "joinedDate": "03 Jun 2026" },
        { "id": "U-103", "name": "সাকিব আল হাসান", "email": "sakib@hotmail.com", "phone": "01999887766", "role": "Editor", "status": "Active", "joinedDate": "04 Jun 2026" },
        { "id": "U-104", "name": "আতিয়া চৌধুরী", "email": "atiya@gmail.com", "phone": "01555443322", "role": "Subscriber", "status": "Suspended", "joinedDate": "05 Jun 2026" },
        { "id": "U-105", "name": "মেহেদী হাসান", "email": "mehedi@yahoo.com", "phone": "01333445566", "role": "Subscriber", "status": "Active", "joinedDate": "08 Jun 2026" }
      ];
    }

    usersList.push({
      id: `U-${101 + usersList.length}`,
      name: name,
      email: email || `${userId}@dainikbartasandhan.com`,
      phone: mobile || "",
      role: designation.toLowerCase().includes("editor") || designation.toLowerCase().includes("সম্পাদক") ? "Editor" :
            designation.toLowerCase().includes("reporter") || designation.toLowerCase().includes("রিপোর্টার") ? "Reporter" :
            "Contributor",
      status: "Active",
      joinedDate: submitDate
    });
    fs.writeFileSync(usersPath, JSON.stringify(usersList, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to append to db_users.json:", err);
  }

  const { passwordHash, ...safeProfile } = newStaff;
  res.status(201).json({ success: true, staff: safeProfile });
});

// 11. Admin route: Toggle or update staff details/status
app.put("/api/staff/:userId", (req, res) => {
  const userId = req.params.userId;
  const updateData = req.body;
  const db = readDB();

  const index = db.staff.findIndex((s) => s.userId === userId);
  if (index === -1) {
    return res.status(404).json({ error: "স্টাফ সদস্য খুঁজে পাওয়া যায়নি" });
  }

  db.staff[index] = {
    ...db.staff[index],
    ...updateData,
    userId // prevent changing userId
  };

  writeDB(db);
  const { passwordHash, ...safeProfile } = db.staff[index];
  res.json({ success: true, staff: safeProfile });
});

// 11.5. Admin route: Delete a staff / user profile completely
app.delete("/api/staff/:userId", (req, res) => {
  const userId = req.params.userId;
  const db = readDB();

  // Find users in db_users.json to join fields
  const usersPath = path.join(DATABASES_DIR, "db_users.json");
  let usersList: any[] = [];
  if (fs.existsSync(usersPath)) {
    try {
      usersList = safeParseJSON(fs.readFileSync(usersPath, "utf8"), []);
    } catch (err) {
      console.error(err);
    }
  }

  // Find candidate in db_users.json
  const matchedUser = usersList.find((u: any) => 
    (u.id && String(u.id).toLowerCase() === userId.toLowerCase()) ||
    (u.email && String(u.email).toLowerCase() === userId.toLowerCase()) ||
    (u.name && String(u.name).toLowerCase() === userId.toLowerCase()) ||
    (u.phone && String(u.phone).toLowerCase() === userId.toLowerCase())
  );

  // Find candidate in db.staff
  const targetStaff = db.staff.find((s) => {
    const cleanUserId = userId.toLowerCase();
    const matchDirect = 
      (s.userId && s.userId.toLowerCase() === cleanUserId) ||
      (s.staffId && s.staffId.toLowerCase() === cleanUserId) ||
      (s.name && s.name.toLowerCase() === cleanUserId) ||
      (s.email && s.email.toLowerCase() === cleanUserId) ||
      (s.mobile && s.mobile.toLowerCase() === cleanUserId);
    
    if (matchDirect) return true;
    
    if (matchedUser) {
      const uName = matchedUser.name ? matchedUser.name.toLowerCase() : "";
      const uEmail = matchedUser.email ? matchedUser.email.toLowerCase() : "";
      const uPhone = matchedUser.phone ? matchedUser.phone.toLowerCase() : "";
      return (
        (s.name && s.name.toLowerCase() === uName) ||
        (s.email && s.email.toLowerCase() === uEmail) ||
        (s.mobile && s.mobile.toLowerCase() === uPhone)
      );
    }
    return false;
  });

  // Set of linked identifiers to cascade delete
  const searchNames = new Set<string>();
  const searchEmails = new Set<string>();
  const searchUserIds = new Set<string>();
  const searchStaffIds = new Set<string>();
  const searchPhones = new Set<string>();

  // Base input
  searchUserIds.add(userId.toLowerCase());

  if (matchedUser) {
    if (matchedUser.id) searchUserIds.add(String(matchedUser.id).toLowerCase());
    if (matchedUser.name) searchNames.add(matchedUser.name.toLowerCase());
    if (matchedUser.email) searchEmails.add(matchedUser.email.toLowerCase());
    if (matchedUser.phone) searchPhones.add(matchedUser.phone.toLowerCase());
  }

  if (targetStaff) {
    if (targetStaff.userId) searchUserIds.add(targetStaff.userId.toLowerCase());
    if (targetStaff.staffId) searchStaffIds.add(targetStaff.staffId.toLowerCase());
    if (targetStaff.name) searchNames.add(targetStaff.name.toLowerCase());
    if (targetStaff.email) searchEmails.add(targetStaff.email.toLowerCase());
    if (targetStaff.mobile) searchPhones.add(targetStaff.mobile.toLowerCase());
  }

  // 1. Filter staff from db.staff (db.json)
  db.staff = db.staff.filter((s) => {
    const sUser = s.userId ? s.userId.toLowerCase() : "";
    const sStaff = s.staffId ? s.staffId.toLowerCase() : "";
    const sName = s.name ? s.name.toLowerCase() : "";
    const sEmail = s.email ? s.email.toLowerCase() : "";
    const sPhone = s.mobile ? s.mobile.toLowerCase() : "";
    
    return !searchUserIds.has(sUser) &&
           !searchStaffIds.has(sStaff) &&
           !searchNames.has(sName) &&
           !searchEmails.has(sEmail) &&
           !searchPhones.has(sPhone);
  });
  writeDB(db);

  // 2. Cascade delete from db_users.json
  try {
    if (fs.existsSync(usersPath)) {
      usersList = usersList.filter((item: any) => {
        const itemId = item.id ? String(item.id).toLowerCase() : "";
        const itemName = item.name ? String(item.name).toLowerCase() : "";
        const itemEmail = item.email ? String(item.email).toLowerCase() : "";
        const itemPhone = item.phone ? String(item.phone).toLowerCase() : "";
        
        return !searchUserIds.has(itemId) &&
               !searchNames.has(itemName) &&
               !searchEmails.has(itemEmail) &&
               !searchPhones.has(itemPhone);
      });
      fs.writeFileSync(usersPath, JSON.stringify(usersList, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to delete from db_users.json:", err);
  }

  // 3. Cascade delete from db_new_staff_register.json
  try {
    const registerPath = path.join(DATABASES_DIR, "db_new_staff_register.json");
    if (fs.existsSync(registerPath)) {
      let registerList = safeParseJSON(fs.readFileSync(registerPath, "utf8"), []);
      registerList = registerList.filter((item: any) => {
        const itemId = item.id ? String(item.id).toLowerCase() : "";
        const itemName = item.name ? String(item.name).toLowerCase() : "";
        const itemEmail = item.email ? String(item.email).toLowerCase() : "";
        return !searchUserIds.has(itemId) &&
               !searchNames.has(itemName) &&
               !searchEmails.has(itemEmail);
      });
      fs.writeFileSync(registerPath, JSON.stringify(registerList, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to delete from db_new_staff_register.json:", err);
  }

  // 4. Cascade delete from db_staff_idcards.json
  try {
    const idcardsPath = path.join(DATABASES_DIR, "db_staff_idcards.json");
    if (fs.existsSync(idcardsPath)) {
      let idcardsList = safeParseJSON(fs.readFileSync(idcardsPath, "utf8"), []);
      idcardsList = idcardsList.filter((item: any) => {
        const itemStaffId = item.staffId ? String(item.staffId).toLowerCase() : "";
        const itemId = item.id ? String(item.id).toLowerCase() : "";
        const itemName = item.name ? String(item.name).toLowerCase() : "";
        const itemEmail = item.email ? String(item.email).toLowerCase() : "";
        return !searchStaffIds.has(itemStaffId) &&
               !searchUserIds.has(itemId) &&
               !searchNames.has(itemName) &&
               !searchEmails.has(itemEmail);
      });
      fs.writeFileSync(idcardsPath, JSON.stringify(idcardsList, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to delete from db_staff_idcards.json:", err);
  }

  // 5. Cascade delete from db_photocards.json
  try {
    const photocardsPath = path.join(DATABASES_DIR, "db_photocards.json");
    if (fs.existsSync(photocardsPath)) {
      let photocardsList = safeParseJSON(fs.readFileSync(photocardsPath, "utf8"), []);
      photocardsList = photocardsList.filter((item: any) => {
        const itemId = item.id ? String(item.id).toLowerCase() : "";
        const itemName = item.name ? String(item.name).toLowerCase() : "";
        return !searchUserIds.has(itemId) &&
               !searchNames.has(itemName);
      });
      fs.writeFileSync(photocardsPath, JSON.stringify(photocardsList, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to delete from db_photocards.json:", err);
  }

  // 6. Clean up individual reporter files
  searchUserIds.forEach((uId) => {
    try {
      const repPath = path.join(DATABASES_DIR, `reporter_${uId}.json`);
      if (fs.existsSync(repPath)) {
        fs.unlinkSync(repPath);
      }
    } catch (err) {}
  });

  res.json({ success: true });
});

// 12. Public API for home page news groups (Bento visual aggregation)
app.get("/api/home-groups", (req, res) => {
  const db = readDB();
  const published = db.articles.filter((item) => item.status === "Published" || item.status === "Approved");

  // Sorted by newest
  const sorted = [...published].sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

  // Filter out videos from standard article news so that videos don't become standard leadStory / latestNews.
  const articleNews = sorted.filter(item => !item.videoUrl || item.videoUrl.trim() === "");

  // Lead Story is the newest article marked isLead, or the first article if none
  const leadNews = articleNews.find(item => item.isLead) || articleNews[0] || null;

  // Latest news is the latest standard articles, ensuring leadNews is the first item if it exists
  let latestNews = [...articleNews];
  if (leadNews) {
    latestNews = [leadNews, ...articleNews.filter(item => item.id !== leadNews.id)].slice(0, 20);
  } else {
    latestNews = latestNews.slice(0, 20);
  }

  // Video news comes first!
  const videoNews = sorted.filter(item => item.videoUrl && item.videoUrl.trim() !== "");

  // Popular news (views based)
  const popularNews = [...published].sort((a, b) => b.views - a.views).slice(0, 8);

  // Category based blocks to display
  const categories = ["জাতীয়", "সারাদেশ", "রাজনীতি", "বিশ্ব", "খেলা", "বিনোদন", "প্রযুক্তি", "ভিডিও", "মতামত"];
  const categoryBlocks: Record<string, Article[]> = {};

  categories.forEach((cat) => {
    categoryBlocks[cat] = sorted.filter((item) => item.category === cat).slice(0, 4);
  });

  res.json({
    leadNews,
    latestNews,
    popularNews,
    videoNews,
    categoryBlocks
  });
});


// ==========================================
// DYNAMIC GENERIC & CUSTOM DATABASE ENDPOINTS
// ==========================================

app.get("/api/database/:dbname", (req, res) => {
  const dbname = req.params.dbname;
  const targetPath = path.join(DATABASES_DIR, `db_${dbname}.json`);
  if (!fs.existsSync(targetPath)) {
    if (dbname === "users") {
      const defaultUsers = [
        { "id": "U-101", "name": "আব্দুর রহমান", "email": "rahman@gmail.com", "phone": "01712345678", "role": "Contributor", "status": "Active", "joinedDate": "01 Jun 2026" },
        { "id": "U-102", "name": "তাসমিয়া আহমেদ", "email": "tasmia@gmail.com", "phone": "01811223344", "role": "Reporter", "status": "Active", "joinedDate": "03 Jun 2026" },
        { "id": "U-103", "name": "সাকিব আল হাসান", "email": "sakib@hotmail.com", "phone": "01999887766", "role": "Editor", "status": "Active", "joinedDate": "04 Jun 2026" },
        { "id": "U-104", "name": "আতিয়া চৌধুরী", "email": "atiya@gmail.com", "phone": "01555443322", "role": "Subscriber", "status": "Suspended", "joinedDate": "05 Jun 2026" },
        { "id": "U-105", "name": "মেহেদী হাসান", "email": "mehedi@yahoo.com", "phone": "01333445566", "role": "Subscriber", "status": "Active", "joinedDate": "08 Jun 2026" }
      ];
      try {
        fs.writeFileSync(targetPath, JSON.stringify(defaultUsers, null, 2), "utf8");
      } catch (err) {
        console.error("Failed to seed db_users.json:", err);
      }
    } else {
      return res.status(404).json({ error: `Database '${dbname}' not found.` });
    }
  }
  try {
    const raw = fs.readFileSync(targetPath, "utf8");
    return res.json(safeParseJSON(raw, []));
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to read database: " + e.message });
  }
});

app.post("/api/database/:dbname", (req, res) => {
  const dbname = req.params.dbname;
  const targetPath = path.join(DATABASES_DIR, `db_${dbname}.json`);
  try {
    fs.writeFileSync(targetPath, JSON.stringify(req.body, null, 2), "utf8");
    return res.json({ success: true, message: `Database ${dbname} synchronized successfully.` });
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to write database: " + e.message });
  }
});

app.get("/api/database/reporter/:userId", (req, res) => {
  const userId = req.params.userId;
  const targetPath = path.join(DATABASES_DIR, `reporter_${userId}.json`);
  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: `Database for reporter '${userId}' not found.` });
  }
  try {
    const raw = fs.readFileSync(targetPath, "utf8");
    return res.json(safeParseJSON(raw, []));
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to read database: " + e.message });
  }
});

app.post("/api/database/reporter/:userId", (req, res) => {
  const userId = req.params.userId;
  const targetPath = path.join(DATABASES_DIR, `reporter_${userId}.json`);
  try {
    fs.writeFileSync(targetPath, JSON.stringify(req.body, null, 2), "utf8");
    return res.json({ success: true, message: `Database for reporter ${userId} synchronized successfully.` });
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to write database: " + e.message });
  }
});

// Helper to serve index.html with dynamically injected Open Graph / Meta tags for SEO & Social Sharing
function serveIndexWithMeta(req: any, res: any, articleId?: string) {
  const distPath = path.join(process.cwd(), "dist");
  let indexPath = path.join(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(process.cwd(), "index.html");
  }

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send("index.html not found");
  }

  let html = fs.readFileSync(indexPath, "utf8");

  let title = "দৈনিক বার্তাসন্ধান | Dainik Bartasandhan - নির্ভরযোগ্য অনলাইন সংবাদপত্র";
  let description = "সারাদেশের সর্বশেষ খবর, ব্রেকিং নিউজ, রাজনীতি, অর্থনীতি, খেলাধুলা, বিনোদন এবং প্রযুক্তির খবর পেতে ভিজিট করুন দৈনিক বার্তাসন্ধান।";
  let imageUrl = "https://i.postimg.cc/sXj31mRp/Gemini-Generated-Image-mttmdrmttmdrmttm.png";
  
  const host = req.get("host") || "";
  const origin = host.includes("localhost") ? `http://${host}` : `https://${host}`;
  let shareUrl = `${origin}${req.originalUrl}`;
  let siteName = "দৈনিক বার্তাসন্ধান";

  let article: any = null;
  if (articleId) {
    const db = readDB();
    article = db.articles.find((item: any) => String(item.id) === String(articleId));
    if (article) {
      title = `${article.title}`;
      const plainContent = stripHtmlTags(article.content || article.subtitle || article.description || "");
      description = plainContent.substring(0, 160) + "...";
      
      if (article.images && Array.isArray(article.images) && article.images.length > 0) {
        const img = article.images[0];
        if (img && typeof img === "string" && img.trim() !== "") {
          if (img.startsWith("http://") || img.startsWith("https://")) {
            imageUrl = img;
          } else {
            if (img.startsWith("/")) {
              imageUrl = `${origin}${img}`;
            } else {
              imageUrl = `${origin}/${img}`;
            }
          }
        }
      }
      
      if (article.dSubTitle && article.dSubTitle.trim() !== "") {
        siteName = article.dSubTitle.trim();
        shareUrl = `${origin}/news/${encodeURIComponent(article.dSubTitle.trim())}/${article.id}`;
      } else {
        shareUrl = `${origin}/news/${article.id}`;
      }
    }
  }

  // Escape special chars in tags to prevent double quotes breaking HTML
  const escapedTitle = title.replace(/"/g, "&quot;");
  const escapedDesc = description.replace(/"/g, "&quot;");
  const escapedImageUrl = imageUrl.replace(/"/g, "&quot;");
  const escapedShareUrl = shareUrl.replace(/"/g, "&quot;");
  const escapedSiteName = siteName.replace(/"/g, "&quot;");

  // Generate the injection HTML block
  const metaTags = `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}" />
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapedShareUrl}" />
    <meta property="og:site_name" content="${escapedSiteName}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    <meta name="twitter:image" content="${escapedImageUrl}" />
  `;

  // Strip existing <title> and <meta name="description"> if any
  html = html.replace(/<title>[^<]*<\/title>/gi, "");
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/gi, "");
  
  // Inject before </head>
  html = html.replace("</head>", `${metaTags}\n  </head>`);

  res.send(html);
}

// Serve frontend in production or hook Vite development server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Intercept in development for quick testability
    app.get("/news/:param1", (req, res) => {
      serveIndexWithMeta(req, res, req.params.param1);
    });
    app.get("/news/:param1/:param2", (req, res) => {
      const { param1, param2 } = req.params;
      const id = /^\d+$/.test(param2) ? param2 : param1;
      serveIndexWithMeta(req, res, id);
    });
    app.get("/", (req, res, next) => {
      if (req.query.article) {
        return serveIndexWithMeta(req, res, req.query.article as string);
      }
      next();
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    app.get("/news/:param1", (req, res) => {
      serveIndexWithMeta(req, res, req.params.param1);
    });
    app.get("/news/:param1/:param2", (req, res) => {
      const { param1, param2 } = req.params;
      const id = /^\d+$/.test(param2) ? param2 : param1;
      serveIndexWithMeta(req, res, id);
    });
    
    app.get("/", (req, res, next) => {
      if (req.query.article) {
        return serveIndexWithMeta(req, res, req.query.article as string);
      }
      next();
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.query.article) {
        return serveIndexWithMeta(req, res, req.query.article as string);
      }
      const matchNews = req.path.match(/^\/news\/([^\/]+)(?:\/([^\/]+))?/);
      if (matchNews) {
        const param1 = matchNews[1];
        const param2 = matchNews[2];
        const id = (param2 && /^\d+$/.test(param2)) ? param2 : param1;
        return serveIndexWithMeta(req, res, id);
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DAINIK BARTASANDHAN SERVER] Online and serving on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
