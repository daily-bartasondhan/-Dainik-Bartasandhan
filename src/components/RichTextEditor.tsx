import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Subscript,
  Superscript,
  Sparkles,
  CheckSquare,
  MessageSquare,
  Eraser,
  Scissors,
  Copy,
  Clipboard,
  Strikethrough,
  Search,
  Link,
  Link2Off,
  Quote,
  Smile,
  Globe,
  Grid,
  Columns,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Code as CodeIcon,
  Eye,
  EyeOff,
  Terminal,
  Type,
  Baseline,
  ChevronDown,
  Redo,
  Undo,
  Settings,
  HelpCircle,
  Maximize2,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
  Paintbrush
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  aiContextTopic?: string; // Optional context like the title of the article
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "সংবাদপত্রের মূল বিবরণ এখানে বিস্তারিত ও আকর্ষণীয় করে লিখুন...",
  aiContextTopic = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // View mode state: "edit" | "preview" | "code"
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [htmlSource, setHtmlSource] = useState(value);
  
  // Custom dropdown / overlay toggles
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Colors choice
  const textColors = [
    { name: "Slate", code: "#1e293b" },
    { name: "Charcoal", code: "#334155" },
    { name: "Blue Desk", code: "#2563eb" },
    { name: "Crimson Red", code: "#dc2626" },
    { name: "Forest Green", code: "#16a34a" },
    { name: "Purple Royal", code: "#9333ea" },
    { name: "Gold Orange", code: "#ea580c" },
    { name: "Teal Deep", code: "#0d9488" }
  ];

  const bgHighlightColors = [
    { name: "Clear", code: "transparent" },
    { name: "Yellow Highlight", code: "#fef08a" },
    { name: "Blue Highlight", code: "#bfdbfe" },
    { name: "Green Highlight", code: "#bbf7d0" },
    { name: "Pink Highlight", code: "#fbcfe8" },
    { name: "Orange Highlight", code: "#fed7aa" },
    { name: "Purple Highlight", code: "#e9d5ff" }
  ];

  // Font choices
  const fontFamilies = [
    { name: "Inter (UI)", value: "Inter, sans-serif" },
    { name: "SolaimanLipi (Bengali)", value: "'SolaimanLipi', sans-serif" },
    { name: "Kalpurush (Classic)", value: "'Kalpurush', sans-serif" },
    { name: "Playfair Display", value: "'Playfair Display', serif" },
    { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
    { name: "Georgia Elegant", value: "Georgia, serif" },
    { name: "System Sans", value: "system-ui, -apple-system, sans-serif" }
  ];

  // Font sizes
  const fontSizes = [
    { name: "Tiny (10px)", value: "1" },
    { name: "Small (12px)", value: "2" },
    { name: "Standard (14px)", value: "3" },
    { name: "Medium Heading (18px)", value: "4" },
    { name: "Large Heading (24px)", value: "5" },
    { name: "Huge Title (32px)", value: "6" },
    { name: "Giant Hero (48px)", value: "7" }
  ];

  // Emojis list grouped
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", 
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "🔔", "📢", "🇧🇩", "🚨", "🗞️", "🖊️", "📷", "🎥", "🔥", "⭐", "✅", "❌", "📌", "🌍", "💻", "🤝"
  ];

  // Bengali specific helper punctuation / special characters
  const specialChars = [
    "৳", "।", "—", "–", "“", "”", "‘", "’", "…", "©", "®", "™", "°", "±", "÷", "×", "≠", "≤", "≥", "∞", "✓"
  ];

  // Document skeletons / Templates
  const templates = [
    {
      name: "Breaking News Report",
      description: "আকস্মিক বা চাঞ্চল্যকর সংবাদের জন্য মানসম্মত বিন্যাস",
      html: `<h2 style="font-family: inherit; color: #dc2626;"><strong>ব্রেকিং নিউজ: ফরিদপুরে বড় ধরনের অগ্রগতি!</strong></h2>
<p style="color: #64748b; font-size: 13px; font-style: italic;">স্টাফ রিপোর্টার | আপডেট: ঠিক এখন</p>
<hr class="border-t border-red-200 my-3" />
<p><strong>ফরিদপুর সদর:</strong> আজ অত্যন্ত আনন্দঘন পরিবেশে ফরিদপুরে এক যুগান্তকারী উন্নয়ন কার্যক্রমের শুভ সূচনা ঘটেছে। স্থানীয় প্রতিনিধির দেওয়া বিস্তারিত তথ্যানুযায়ী, এলাকার বহুদিনের কাঙ্ক্ষিত এই দাবিটি অবশেষে বাস্তবায়িত হতে যাচ্ছে।</p>
<p>উদ্বোধনী অনুষ্ঠানে প্রধান অতিথি হিসেবে উপস্থিত ছিলেন ফরিদপুরের গণ্যমান্য ব্যক্তিবর্গ এবং স্থানীয় প্রশাসনের উর্ধ্বতন কর্মকর্তাগণ। তারা আশা প্রকাশ করেন যে, এই কার্যক্রমের ফলে জেলার অর্থনৈতিক চিত্র আমূল বদলে যাবে ও ব্যাপক কর্মসংস্থান সৃষ্টি হবে।</p>
<blockquote style="border-left: 4px solid #dc2626; padding-left: 1rem; color: #475569; margin: 1.5rem 0; font-style: italic;">"ফরিদপুরের সাধারণ মানুষের কল্যাণে আমরা সর্বদা নিয়োজিত। এটি আমাদের একটি দীর্ঘমেয়াদী রূপকল্পেরই অংশ।" - উদ্বোধনী ভাষণে বিশেষ অতিথি</blockquote>
<p>ইতিমধ্যেই এলাকার সর্বস্তরের মানুষের মাঝে এই প্রকল্পকে কেন্দ্র করে ব্যপক উৎসাহ-উদ্দীপনা লক্ষ করা গেছে। বিস্তারিত সংবাদ আসছে পরবর্তী বিশেষ প্রতিবেদনে।</p>`
    },
    {
      name: "Editorial Column",
      description: "বিশ্লেষণধর্মী ও সুচিন্তিত মতামত প্রকাশের কলাম",
      html: `<h3 style="color: #1e3a8a;"><strong>সম্পাদকীয় মতামত: আমাদের শিক্ষার মানোন্নয়ন ও আগামীর ফরিদপুর</strong></h3>
<p style="color: #64748b; font-size: 13px;">অনলাইন সম্পাদকীয় ডেস্ক | দৈনিক ফরিদপুর কড়চা</p>
<p>শিক্ষাই জাতির সুদৃঢ় মেরুদণ্ড। একটি শিক্ষিত ও দক্ষ সমাজ ব্যতীত আমরা কোনোভাবেই একটি প্রগতিশীল ফরিদপুর বা সমৃদ্ধশালী বাংলাদেশের কথা চিন্তা করতে পারি না। সাম্প্রতিক বছরগুলোতে আমাদের অবকাঠামোগত উন্নয়ন চোখে পড়ার মতো হলেও, নৈতিক ও প্রাতিষ্ঠানিক শিক্ষার মান নিয়ে এখনো কিছু গুরুত্বপূর্ণ প্রশ্ন রয়ে গেছে।</p>
<p>বিশেষ করে আমাদের গ্রামীণ অঞ্চলের বিদ্যালয় ও মহাবিদ্যালয়গুলোতে সুযোগ-সুবিধার ঘাটতি এবং প্রশিক্ষণপ্রাপ্ত শিক্ষকের অভাব একটি দীর্ঘস্থায়ী সমস্যা হিসেবে দেখা দিচ্ছে। আমাদের অবশ্যই এই শূন্যতা দ্রুত দূর করতে হবে। শিক্ষার্থীদের শুধু মুখস্থ বিদ্যায় পারদর্শী করার চেয়ে ব্যবহারিক ও প্রযুক্তিগত শিক্ষায় দক্ষ করতে হবে।</p>
<p>আসুন আমরা সকলে মিলে এমন একটি পরিবেশ তৈরি করি যেখানে প্রতিটি তরুণ হৃদয়ে জানার ও নতুন কিছু করার আকাঙ্ক্ষা সদা জাগ্রত থাকবে। সরকারের পাশাপাশি সমাজের বিত্তবান এবং সচেতন নাগরিকদেরও এখানে জোরালো ভূমিকা পালন করতে হবে।</p>`
    },
    {
      name: "Interview Q&A Skeleton",
      description: "কোনো ব্যক্তিত্বের সাথে প্রশ্নোত্তর পর্বের সুন্দর লেআউট",
      html: `<h3><strong>বিশেষ সাক্ষাৎকার: সফল উদ্যোক্তার মুখোমুখি</strong></h3>
<p class="text-xs text-slate-500">সাক্ষাৎকার নিয়েছেন: বিশেষ প্রতিবেদক</p>
<br/>
<p><strong>প্রশ্ন: আপনার এই অভাবনীয় সাফল্যের পেছনের মূল চালিকাশক্তি কোনটি ছিল?</strong></p>
<p style="color: #2563eb; padding-left: 10px;">উত্তর: মূল চালিকাশক্তি ছিল অবিচল বিশ্বাস ও কঠোর অধ্যবসায়। আমি যখন শুরু করেছিলাম তখন আমার কাছে খুব বেশি পুঁজি ছিল না, কিন্তু সুন্দর একটি স্বপ্ন ছিল।</p>
<br/>
<p><strong>প্রশ্ন: নতুন তরুণ উদ্যোক্তাদের জন্য আপনার কি কোনো বিশেষ পরামর্শ রয়েছে?</strong></p>
<p style="color: #2563eb; padding-left: 10px;">উত্তর: হ্যাঁ, পরামর্শ একটাই—শুরুতেই লাভের আশা না করে নিজের কাজের দক্ষতার ওপর জোর দিন। সততা বজায় রাখলে সাফল্য আসবেই লক্ষ্যচ্যুত হবেন না।</p>`
    }
  ];

  // Grid/Layout Templates list
  const layoutGrids = [
    {
      name: "2-Column Container",
      html: `<table style="width:100%; border-collapse:collapse; margin: 15px 0;">
  <tr>
    <td style="width:50%; padding:12px; border:1px dashed #cbd5e1; background-color:#f8fafc; vertical-align:top;">
      <strong>কলাম ১ (এখানে লিখুন)</strong>
      <p>বাম কলামের বিবরণ। এখানে আপনি আপনার ছবি অথবা সংবাদ উপ-অনুচ্ছেদ দিতে পারেন।</p>
    </td>
    <td style="width:50%; padding:12px; border:1px dashed #cbd5e1; background-color:#f8fafc; vertical-align:top;">
      <strong>কলাম ২ (এখানে লিখুন)</strong>
      <p>ডান কলামের বিবরণ। চমৎকারভাবে দুই কলামে আপনার সংবাদপত্র বিন্যাস সাজান।</p>
    </td>
  </tr>
</table>`
    },
    {
      name: "Hero Visual Layout (Top Block)",
      html: `<div style="background-color: #1e293b; color: #ffffff; padding: 24px; border-radius: 6px; margin: 15px 0; font-family: inherit;">
  <h2 style="color: #60a5fa; margin-bottom: 8px;"><strong>প্রধান আকর্ষণীয় শিরোনাম এখানে দিন</strong></h2>
  <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">এখানে একটি চমৎকার ভূমিকা অংশ লিখুন। এটি সম্পূর্ণ চওড়া কার্ডের মতন দেখাবে যা আপনার সংবাদের মূল থিমকে আকর্ষণীয়ভাবে ফুটিয়ে তুলবে পাঠকের কাছে।</p>
  <p style="color: #38bdf8; font-size: 11px; margin-top: 12px; text-transform: uppercase;">বিশেষ আয়োজন • দৈনিক কড়চা</p>
</div>`
    }
  ];

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(aiContextTopic || "");
  const [aiChoice, setAiChoice] = useState<"article" | "summarize" | "headline" | "improve">("article");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWarning, setAiWarning] = useState<string | null>(null);

  // Table Insert States
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  // Link insert states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  // Video embed states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoCode, setVideoCode] = useState("");

  // Search States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");

  // Keep internal state synched safely with react
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    setHtmlSource(value);
  }, [value]);

  // Synchronize on change
  const handleEditorInput = () => {
    if (editorRef.current) {
      const htmlOutput = editorRef.current.innerHTML;
      setHtmlSource(htmlOutput);
      onChange(htmlOutput);
    }
  };

  // Helper to execute commands natively
  const executeCommand = (command: string, value: string = "") => {
    if (viewMode !== "edit") return;
    
    // Restore focus to editor if lost
    if (editorRef.current) {
      editorRef.current.focus();
    }

    try {
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false);
      }
      handleEditorInput();
    } catch (e) {
      console.warn("execCommand failed:", e);
    }
    setActiveDropdown(null);
  };

  // Insert Custom Checkbox
  const insertCheckbox = () => {
    if (viewMode !== "edit" || !editorRef.current) return;
    editorRef.current.focus();
    
    const checkboxHtml = `<span style="display:inline-flex; align-items:center; margin-right:6px;" contenteditable="false">
      <input type="checkbox" style="width:14px; height:14px; cursor:pointer; margin-right:4px;" />
    </span>&nbsp;`;
    
    document.execCommand("insertHTML", false, checkboxHtml);
    handleEditorInput();
  };

  // Clear Formatting
  const clearFormatting = () => {
    executeCommand("removeFormat");
    // Also strip inline custom styles where appropriate
    try {
      document.execCommand("formatBlock", false, "p");
    } catch(e) {}
  };

  // Custom Comment insertion style
  const insertCommentAnchor = () => {
    if (viewMode !== "edit" || !editorRef.current) return;
    
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().trim() === "") {
      alert("অনুগ্রহ করে মন্তব্য করার জন্য প্রথমে কিছু লেখা সিলেক্ট করুন।");
      return;
    }
    
    const selectedText = sel.toString();
    const commentNote = prompt("মন্তব্য লিখুন:");
    if (!commentNote) return;

    editorRef.current.focus();
    const commentedHtml = `<span style="background-color:#fef08a; border-bottom:2px dashed #ca8a04; cursor:help;" title="মন্তব্য: ${commentNote}" class="news-editor-comment">
      ${selectedText}
    </span>`;
    
    document.execCommand("insertHTML", false, commentedHtml);
    handleEditorInput();
  };

  // Insert Link Modal Submit
  const handleInsertLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode !== "edit" || !editorRef.current) return;
    
    editorRef.current.focus();
    const finalLink = `<a href="${linkUrl}" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:500;">${linkText || linkUrl}</a>`;
    document.execCommand("insertHTML", false, finalLink);
    
    setShowLinkModal(false);
    setLinkUrl("https://");
    setLinkText("");
    handleEditorInput();
  };

  // Insert Video Submit (supports Youtube embed generation or generic source)
  const handleInsertVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode !== "edit" || !editorRef.current) return;

    let embedHtml = "";
    if (videoCode.includes("youtube.com") || videoCode.includes("youtu.be")) {
      // Extract video ID safely
      let videoId = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoCode.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
      
      if (videoId) {
        embedHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:14px 0; border-radius:6px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
        </div><p>&nbsp;</p>`;
      } else {
        embedHtml = `<p style="color:red;">Invalid Youtube Link!</p>`;
      }
    } else {
      // Direct raw link as fallback video component
      embedHtml = `<video controls style="max-width:100%; border-radius:6px; margin:14px 0;">
        <source src="${videoCode}" type="video/mp4" />
        আপনার ব্রাউজারটি ভিডিও সমর্থন করে না।
      </video><p>&nbsp;</p>`;
    }

    editorRef.current.focus();
    document.execCommand("insertHTML", false, embedHtml);
    setShowVideoModal(false);
    setVideoCode("");
    handleEditorInput();
  };

  // Insert Table Modal Submit
  const handleInsertTableSubmit = () => {
    if (viewMode !== "edit" || !editorRef.current) return;

    let tableHtml = `<table style="width:100%; border-collapse:collapse; margin:16px 0; text-align:left; font-size:12px; border:1px solid #cbd5e1;">`;
    
    // Header Row
    tableHtml += `<tr style="background-color:#f1f5f9; border-bottom:2px solid #cbd5e1;">`;
    for (let c = 0; c < tableCols; c++) {
      tableHtml += `<th style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">কলাম শিরোনাম ${c + 1}</th>`;
    }
    tableHtml += `</tr>`;

    // Body Rows
    for (let r = 0; r < tableRows - 1; r++) {
      tableHtml += `<tr style="border-bottom:1px solid #e2e8f0; ${r % 2 === 0 ? "background-color:#f8fafc;" : ""}">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="padding:10px; border:1px solid #cbd5e1;">তথ্য ${r + 1}, ${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</table><p>&nbsp;</p>`;

    editorRef.current.focus();
    document.execCommand("insertHTML", false, tableHtml);
    setShowTableModal(false);
    handleEditorInput();
  };

  // Search & Replace Implementation
  const executeSearchReplace = () => {
    if (!editorRef.current || !searchQuery) return;
    
    const editorHtml = editorRef.current.innerHTML;
    try {
      // Replace all occurrences safely with regex
      const regex = new RegExp(searchQuery, "gi");
      const matchedCount = (editorHtml.match(regex) || []).length;
      
      if (matchedCount === 0) {
        alert(`"${searchQuery}" সন্ধান করে কড়চায় কোনো ফলাফল মেলেনি।`);
        return;
      }

      const updatedHtml = editorHtml.replace(regex, replaceQuery || "");
      editorRef.current.innerHTML = updatedHtml;
      handleEditorInput();
      alert(`মোট ${matchedCount}টি জায়গায় সফল ও সুচারুভাবে পরিবর্তন সম্পন্ন হয়েছে!`);
      setShowSearchModal(false);
    } catch (e) {
      alert("অনুসন্ধান প্রক্রিয়ায় কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  // Local Image Upload & conversion to base64 inline rendering
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && editorRef.current) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;
        editorRef.current?.focus();
        
        const imgHtml = `
          <div style="margin: 16px 0; text-align:center;">
            <img src="${base64Url}" alt="${file.name}" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1); display:inline-block;" />
            <p style="font-size:11px; color:#64748b; margin-top:6px; font-style:italic;">সংবাদ চিত্র: ${file.name}</p>
          </div>
          <p>&nbsp;</p>
        `;
        document.execCommand("insertHTML", false, imgHtml);
        handleEditorInput();
      };
      reader.readAsDataURL(file);
    }
  };

  // Call API for real Gemini assistant
  const handleAiAssistantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiWarning(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: aiChoice
        })
      });

      const data = await response.json();
      if (data.warning) {
        setAiWarning(data.warning);
      }

      if (data.text && editorRef.current) {
        editorRef.current.focus();
        
        // Append or insert at cursor
        const cleanContent = data.text;
        document.execCommand("insertHTML", false, cleanContent);
        
        handleEditorInput();
        setShowAiModal(false);
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setAiWarning("সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে এআই সেটিংস চেক করুন।");
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle View Modes
  const handleViewModeChange = (mode: "edit" | "preview" | "code") => {
    if (mode === "edit" && viewMode === "code") {
      // Restore code to contenteditable
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlSource;
      }
      onChange(htmlSource);
    } else if (mode === "code" && viewMode === "edit") {
      // Sync list from current inline html
      if (editorRef.current) {
        setHtmlSource(editorRef.current.innerHTML);
      }
    }
    setViewMode(mode);
    setActiveDropdown(null);
  };

  // Raw HTML edit sync back to state
  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    setHtmlSource(rawVal);
    onChange(rawVal);
  };

  // Handle dropdown state safely
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <div className="w-full border border-slate-300 rounded shadow-sm overflow-hidden bg-white text-slate-800 flex flex-col font-sans mb-3 min-h-[350px]">
      
      {/* 3-ROW PREMIUM WYSIWYG TOOLBAR */}
      <div className="bg-slate-50 border-b border-slate-200 select-none flex flex-col text-xs shrink-0 relative z-30">
        
        {/* ROW 1: CORE FORMATS, COLOR, ALIGN, LISTS, INDENTS, AI */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200/60 font-sans">
          
          {/* Group 1: Basic text styles */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
              title="Bold Text (Ctrl+B)"
            >
              <Bold size={13} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
              title="Italic Text (Ctrl+I)"
            >
              <Italic size={13} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
              title="Underline Text (Ctrl+U)"
            >
              <Underline size={13} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>
          </div>

          {/* Group 2: Color pickers custom dropdown */}
          <div className="flex items-center gap-1">
            {/* ForeColor Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("textcolor")}
                className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs text-[10px] font-medium"
                title="Text Color"
              >
                <Baseline size={13} className="text-red-600" />
                <span>রঙ</span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {activeDropdown === "textcolor" && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded p-2 shadow-lg grid grid-cols-4 gap-1.5 z-40 animate-fade-in animate-duration-100">
                  {textColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => executeCommand("foreColor", color.code)}
                      className="w-7 h-7 rounded border border-slate-200 hover:scale-110 active:scale-95 transition"
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* BackColor/Highlight Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("bgcolor")}
                className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs text-[10px] font-medium"
                title="Highlight Background"
              >
                <Paintbrush size={13} className="text-amber-500" />
                <span>ব্যাকগ্রাউন্ড</span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {activeDropdown === "bgcolor" && (
                <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded p-2 shadow-lg grid grid-cols-4 gap-1.5 z-40 animate-fade-in">
                  {bgHighlightColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => executeCommand("backColor", color.code)}
                      className="w-7 h-7 rounded border border-slate-200 hover:scale-110 active:scale-95 transition flex items-center justify-center text-[8px] overflow-hidden"
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    >
                      {color.code === "transparent" ? "X" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group 3: Alignments */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("justifyLeft")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyCenter")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyRight")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyFull")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Justify Align"
            >
              <AlignJustify size={13} />
            </button>
          </div>

          {/* Group 4: Lists & Indents */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Unordered Bullet List"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Ordered Number List"
            >
              <ListOrdered size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("outdent")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Outdent block (Shift+Tab)"
            >
              <Outdent size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("indent")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Indent block (Tab)"
            >
              <Indent size={13} />
            </button>
          </div>

          {/* Group 5: Sub/Superscript */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("subscript")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Subscript"
            >
              <Subscript size={13} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("superscript")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Superscript"
            >
              <Superscript size={13} />
            </button>
          </div>

          {/* Group 6: AI-ASSISTANT HIGHLIGHT BUTTON */}
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => {
                setAiPrompt(aiContextTopic);
                setShowAiModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:to-red-650 text-white rounded font-bold shadow-sm cursor-pointer hover:shadow transition-all group scale-100 active:scale-97"
              title="Smart AI Writer assistant (Gemini Powered)"
            >
              <Sparkles size={13} className="animate-pulse" />
              <span>AI সহযোগী</span>
            </button>
          </div>

        </div>

        {/* ROW 2: ADVANCED INSERTS, EMOJIS, COMMENTS, CODE, TABLES, LAYOUTS */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200/60">
          
          {/* Checkbox template */}
          <button
            type="button"
            onClick={insertCheckbox}
            className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs"
            title="Insert Checkbox List row"
          >
            <CheckSquare size={13} className="text-sky-600" />
            <span>চেকবক্স</span>
          </button>

          {/* Comment tag */}
          <button
            type="button"
            onClick={insertCommentAnchor}
            className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs"
            title="Comment on current text selection"
          >
            <MessageSquare size={13} className="text-violet-600" />
            <span>মন্তব্য</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-300 mx-0.5"></div>

          {/* Clipboard utilities */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("cut")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Cut Selection"
            >
              <Scissors size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.getSelection()?.toString() || "");
                alert("সিলেক্টেড ক্লিপবোর্ডে কপি করা হয়েছে!");
              }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Copy Selection"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text) {
                    executeCommand("insertHTML", text);
                  }
                } catch (e) {
                  alert("ব্রাউজার ক্লিপবোর্ড ব্যবহারের পারমিশন প্রয়োজন।");
                }
              }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Paste Block (HTML Context)"
            >
              <Clipboard size={13} />
            </button>
          </div>

          {/* Blockquote, Special Characters */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "blockquote")}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs"
            title="Blockquote paragraph"
          >
            <Quote size={13} className="text-slate-600" />
          </button>

          {/* Search utility */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs"
            title="Search & Replace"
          >
            <Search size={13} className="text-slate-500" />
            <span>খুঁজুন</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-300 mx-0.5"></div>

          {/* Link manager */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                const selText = window.getSelection()?.toString() || "";
                setLinkText(selText);
                setShowLinkModal(true);
              }}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Insert Link"
            >
              <Link size={13} className="text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("unlink")}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
              title="Remove Link"
            >
              <Link2Off size={13} className="text-red-500" />
            </button>
          </div>

          {/* Emoji Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("emoji")}
              className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs"
              title="Emojis Selector"
            >
              <Smile size={13} className="text-amber-500" />
              <ChevronDown size={8} />
            </button>
            {activeDropdown === "emoji" && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded p-2.5 shadow-lg z-40 max-h-40 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 select-none uppercase">কড়চা ইমোজি সমূহ:</div>
                <div className="grid grid-cols-6 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => executeCommand("insertHTML", emoji)}
                      className="text-lg hover:bg-slate-100 p-1 rounded hover:scale-110 active:scale-95 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Special character Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("specials")}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs font-bold"
              title="Special Symbol Punctuation"
            >
              <span>৳ / %</span>
              <ChevronDown size={8} tabIndex={-1} />
            </button>
            {activeDropdown === "specials" && (
              <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded p-2 shadow-lg z-40">
                <div className="grid grid-cols-5 gap-1.5">
                  {specialChars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => executeCommand("insertHTML", char)}
                      className="p-1 hover:bg-slate-100 rounded border border-slate-100 font-bold hover:scale-105 active:scale-95 transition text-[13px] text-slate-800"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Insert Table Grid Panel Trigger */}
          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs"
            title="Complex dynamic table insertion"
          >
            <Grid size={13} className="text-emerald-600" />
            <span>টেবিল</span>
          </button>

          {/* Layout templates dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("layout_template")}
              className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs"
              title="Insert grid container layout blocks"
            >
              <Columns size={13} className="text-slate-600" />
              <span>লেআউট</span>
              <ChevronDown size={8} />
            </button>
            {activeDropdown === "layout_template" && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg p-1.5 z-40 font-sans">
                {layoutGrids.map((layout) => (
                  <button
                    key={layout.name}
                    type="button"
                    onClick={() => {
                      executeCommand("insertHTML", layout.html);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left p-1.5 hover:bg-slate-50 text-[11px] rounded flex flex-col transition"
                  >
                    <span className="font-bold text-slate-700">{layout.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Local file uploader & Image Embed */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept="image/*"
              id="editor-file-image-inline"
              className="hidden"
              onChange={handleLocalImageUpload}
            />
            <label
              htmlFor="editor-file-image-inline"
              className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs cursor-pointer text-xs"
              title="Embedded Images inline"
            >
              <ImageIcon size={13} className="text-rose-600" />
              <span>ছবি</span>
            </label>
          </div>

          {/* Video URL template insert */}
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition shadow-2xs"
            title="Youtube Embed video element"
          >
            <VideoIcon size={13} className="text-red-600" />
            <span>ভিডিও</span>
          </button>

          {/* Document Skeletal Templates */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("doc_skeleton")}
              className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs"
              title="Insert Premade Document templates"
            >
              <FileText size={13} className="text-indigo-600" />
              <span>টেমপ্লেট</span>
              <ChevronDown size={8} />
            </button>
            {activeDropdown === "doc_skeleton" && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded shadow-lg p-2 z-40 font-sans">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-1 pb-1.5 border-b border-slate-100">ইনসার্ট করুন খবর ফরম্যাট:</div>
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => {
                      executeCommand("insertHTML", tmpl.html);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left p-1.5 hover:bg-slate-50 rounded flex flex-col transition mb-1 text-[11px]"
                  >
                    <span className="font-bold text-slate-800">{tmpl.name}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{tmpl.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Code block style */}
          <button
            type="button"
            onClick={() => {
              const selText = window.getSelection()?.toString() || "";
              const formatted = `<pre style="background-color:#1e293b; color:#f8fafc; padding:12px; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:11px; overflow-x:auto;"><code>${selText || "// Code block এখানে লিখুন..."}</code></pre><p>&nbsp;</p>`;
              executeCommand("insertHTML", formatted);
            }}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-750 shadow-2xs"
            title="Formatted Monospace Code Block"
          >
            <CodeIcon size={13} />
          </button>

        </div>

        {/* ROW 3: DROPDOWNS PARA/HEADINGS, FONT FAMILY, FONT SIZE, HISTORY, VIEWMODE */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100/70">
          
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Heading Block Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("blockformat")}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 font-sans font-medium hover:scale-100 active:scale-97 transition"
              >
                <span>প্যারাগ্রাফ / হেডিং</span>
                <ChevronDown size={8} />
              </button>
              {activeDropdown === "blockformat" && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded p-1.5 shadow-lg flex flex-col z-45 font-sans">
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "p")}
                    className="text-left px-2 py-1.5 hover:bg-slate-50 text-[11px] rounded"
                  >
                    Normal Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "h1")}
                    className="text-left px-2 py-1.5 hover:bg-slate-50 text-sm font-black rounded"
                  >
                    Headline 1 (Giant)
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "h2")}
                    className="text-left px-2 py-1.5 hover:bg-slate-50 text-xs font-bold rounded"
                  >
                    Headline 2 (Medium)
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "h3")}
                    className="text-left px-2 py-1.5 hover:bg-slate-50 text-[11px] font-bold rounded"
                  >
                    Headline 3 (Sub-title)
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "pre")}
                    className="text-left px-2 py-1.5 hover:bg-slate-50 text-[10px] font-mono text-slate-500 rounded"
                  >
                    Monospace Box
                  </button>
                </div>
              )}
            </div>

            {/* Font Family Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("fontfamily")}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 font-sans"
                title="Change Font Style"
              >
                <span>ফন্ট ফ্যামিলি</span>
                <ChevronDown size={8} />
              </button>
              {activeDropdown === "fontfamily" && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded p-1 shadow-lg flex flex-col z-45 font-sans">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => executeCommand("fontName", font.value)}
                      className="text-left px-2.5 py-1.5 hover:bg-slate-50 text-[11px] rounded"
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font size Scale */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("fontsize")}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 font-sans"
                title="Change Font Size"
              >
                <span>আকার (Size)</span>
                <ChevronDown size={8} />
              </button>
              {activeDropdown === "fontsize" && (
                <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded p-1 shadow-lg flex flex-col z-45">
                  {fontSizes.map((sz) => (
                    <button
                      key={sz.name}
                      type="button"
                      onClick={() => executeCommand("fontSize", sz.value)}
                      className="text-left px-2.5 py-1.5 hover:bg-slate-50 text-[11px] rounded text-slate-700"
                    >
                      {sz.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-5 w-[1px] bg-slate-300 mx-0.5"></div>

            {/* Line Spacing control custom */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("linespacing")}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 font-sans"
                title="Row height Line Spacing block"
              >
                <span>লাইন স্পেস</span>
                <ChevronDown size={8} />
              </button>
              {activeDropdown === "linespacing" && (
                <div className="absolute left-0 mt-1 w-28 bg-white border border-slate-200 rounded p-1 shadow-lg flex flex-col z-45 font-sans">
                  {[
                    { label: "Standard (1.15)", val: "1.15" },
                    { label: "Comfortable (1.5)", val: "1.5" },
                    { label: "Wide Double (2.0)", val: "2.0" },
                    { label: "Super Wide (2.5)", val: "2.5" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        if (editorRef.current && viewMode === "edit") {
                          editorRef.current.focus();
                          // Set line height block style in current selection via dynamic command wrapper
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount > 0) {
                            const range = sel.getRangeAt(0);
                            let parentLineEl = range.commonAncestorContainer as HTMLElement;
                            if (parentLineEl.nodeType === Node.TEXT_NODE) {
                              parentLineEl = parentLineEl.parentElement as HTMLElement;
                            }
                            if (parentLineEl && parentLineEl !== editorRef.current) {
                              parentLineEl.style.lineHeight = item.val;
                              handleEditorInput();
                            } else {
                              executeCommand("formatBlock", "p");
                              if (editorRef.current.lastElementChild) {
                                (editorRef.current.lastElementChild as HTMLElement).style.lineHeight = item.val;
                                handleEditorInput();
                              }
                            }
                          }
                        }
                        setActiveDropdown(null);
                      }}
                      className="text-left px-2 py-1 hover:bg-slate-50 text-[11px] text-slate-700 rounded"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Page break divider */}
            <button
              type="button"
              onClick={() => {
                const hrDivider = `<br/><hr style="border: 0; border-top: 2px dashed #94a3b8; margin: 16px 0;" class="page-break" /><br/>`;
                executeCommand("insertHTML", hrDivider);
              }}
              className="px-2 py-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 shadow-2xs font-sans font-medium"
              title="Add visual dash page break separation"
            >
              পেজ ব্রেক
            </button>

            {/* Eraser clear formatting */}
            <button
              type="button"
              onClick={clearFormatting}
              className="p-1.5 bg-white hover:bg-slate-150 border border-slate-200 rounded text-slate-700 shadow-2xs"
              title="Clear all Styles"
            >
              <Eraser size={13} className="text-pink-600" />
            </button>

            <div className="h-5 w-[1px] bg-slate-300 mx-0.5"></div>

            {/* Undo/Redo */}
            <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => executeCommand("undo")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("redo")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={13} />
              </button>
            </div>
          </div>

          {/* VIEW MODE SELECTION TABS: Edit, Preview, HTML Code */}
          <div className="flex bg-slate-200/80 p-0.5 rounded border border-slate-300">
            <button
              type="button"
              onClick={() => handleViewModeChange("edit")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition text-[10px] font-bold ${
                viewMode === "edit"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-650 hover:text-slate-900"
              }`}
            >
              <Terminal size={11} className="stroke-[2.5]" />
              <span>সম্পাদনা</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("preview")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition text-[10px] font-bold ${
                viewMode === "preview"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-650 hover:text-slate-900"
              }`}
            >
              <Eye size={11} />
              <span>প্রিভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("code")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition text-[10px] font-bold ${
                viewMode === "code"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-650 hover:text-slate-900"
              }`}
            >
              <CodeIcon size={11} />
              <span>এইচটিএমএল কোড</span>
            </button>
          </div>

        </div>

      </div>

      {/* EDITING AREA BOX BASED ON THE VIEW MODE */}
      <div className="flex-1 min-h-[300px] flex flex-col relative z-10">

        {/* 1. EDIT MODE: FULL RICH CONTENTEDITABLE CANVAS */}
        {viewMode === "edit" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            className="flex-1 w-full p-5 focus:outline-none overflow-y-auto leading-relaxed text-slate-800 text-sm font-sans min-h-[300px] prose prose-slate max-w-none break-words"
            style={{ minHeight: "300px" }}
            placeholder={placeholder}
          />
        )}

        {/* 2. PREVIEW MODE: READ ONLY TYPOGRAPHY DISPLAY SCREEN */}
        {viewMode === "preview" && (
          <div className="flex-1 w-full p-5 bg-slate-50/40 overflow-y-auto min-h-[300px] prose prose-slate max-w-none font-sans">
            <div className="text-[10px] tracking-wider uppercase font-black text-rose-500 mb-4 select-none flex items-center gap-1 bg-rose-50 rounded px-2.5 py-1.5 w-fit border border-rose-100">
              <Sparkles size={10} className="text-rose-500" />
              <span>লাইভ ওয়েবসাইট প্রিভিউ প্রদর্শন স্কীম</span>
            </div>
            
            {/* Displaying actual formatted output */}
            <div 
              className="rich-editor-rendered-output space-y-3 break-words text-slate-800 text-sm antialiased"
              dangerouslySetInnerHTML={{ __html: htmlSource || `<p class="italic text-slate-400">খসড়াটি ফাঁকা রয়েছে।</p>` }}
            />
          </div>
        )}

        {/* 3. CODE VIEW MODE: INTERACTIVE RAW HTML SOURCE CODES */}
        {viewMode === "code" && (
          <div className="flex-1 flex flex-col min-h-[300px] bg-slate-900">
            <div className="bg-slate-800 text-slate-400 px-4 py-1.5 text-[9px] font-mono select-none flex items-center justify-between border-b border-slate-700">
              <span>RAW HTML SOURCE VIEW (সম্পূর্ণ এইচটিএমএল এডিট করা সম্ভব)</span>
              <span className="text-amber-500 font-bold">সরাসরি আপডেট সমর্থন করে</span>
            </div>
            <textarea
              value={htmlSource}
              onChange={handleRawHtmlChange}
              className="flex-1 w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed min-h-[280px]"
              placeholder="<!-- Insert HTML Source code manually if needed -->"
            />
          </div>
        )}

      </div>

      {/* FOOTER STATS / META INFORMATIONS */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-sans select-none shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span>আকার: <strong>{htmlSource ? (htmlSource.length / 1024).toFixed(2) : 0} KB</strong></span>
          <span className="h-3 w-[1px] bg-slate-300"></span>
          <span>ক্যারেক্টার সংখ্যা: <strong>{htmlSource ? htmlSource.length : 0}টি</strong></span>
          <span className="h-3 w-[1px] bg-slate-300"></span>
          <span>শব্দ সংখ্যা: <strong>{htmlSource ? htmlSource.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length : 0}টি</strong></span>
        </div>
        <div className="text-slate-400 text-[10px] italic flex items-center gap-1 font-sans">
          <span>দৈনিক ফরিদপুর কড়চা রিচ এডিটর ইঞ্জিন v4.2</span>
        </div>
      </div>

      {/* --------------------- DIALOG MODALS --------------------- */}

      {/* A. SMART ASSISTANT GEMINI AI MODAL POPUP */}
      {showAiModal && (
        <div className="fixed inset-0 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center p-4 z-999 animate-fade-in text-left">
          <div className="bg-white rounded border border-slate-200 max-w-lg w-full shadow-2xl p-6 font-sans relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <span>ম্যাজিক এআই সহায়ক (Gemini 3.5 Assistant)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <EyeOff size={16} />
              </button>
            </div>

            <form onSubmit={handleAiAssistantSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">এআই অ্যাকশন ধরণ সিলেক্ট করুন:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiChoice("article")}
                    className={`p-2 rounded text-left border transition ${
                      aiChoice === "article"
                        ? "border-purple-500 bg-purple-50/50 text-purple-700 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📝 সংবাদ কন্টেন্ট লিখুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiChoice("summarize")}
                    className={`p-2 rounded text-left border transition ${
                      aiChoice === "summarize"
                        ? "border-purple-500 bg-purple-50/50 text-purple-700 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📒 সংক্ষিপ্তসার (Summarize)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiChoice("headline")}
                    className={`p-2 rounded text-left border transition ${
                      aiChoice === "headline"
                        ? "border-purple-500 bg-purple-50/50 text-purple-700 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ✨ আকর্ষণীয় ৩টি শিরোনাম
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiChoice("improve")}
                    className={`p-2 rounded text-left border transition ${
                      aiChoice === "improve"
                        ? "border-purple-500 bg-purple-50/50 text-purple-700 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ✍️ লেখা পোলিশ ও গ্রামার ঠিক করুন
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {aiChoice === "improve" ? "যে অনুচ্ছেদটি ঠিক করবেন তা নিচে দিন:" : "আপনার ইচ্ছা বা সংবাদের বিষয়বস্তু লিখুন:"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="যেমন: ফরিদপুরে নতুন ব্রিজ উদ্বোধনকে কেন্দ্র করে একটি সংবাদ প্রতিবেদন লিখুন..."
                  className="w-full text-xs p-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 placeholder-slate-400"
                />
              </div>

              {aiWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px] leading-relaxed">
                  ⚠️ <strong>সতর্কতা:</strong> {aiWarning}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded text-xs font-bold font-sans tracking-wide shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>এআই লিখছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>লিখুন (Generate)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. INSERT TABLE DYNAMIC MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in text-left">
          <div className="bg-white rounded border border-slate-200 max-w-sm w-full p-5 font-sans relative">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Grid size={15} className="text-emerald-600" />
              <span>নতুন কাস্টম টেবিল তৈরি করুন</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">রো সংখ্যা (Rows):</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">কলাম সংখ্যা (Cols):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-3 py-1.5 border border-slate-350 text-slate-600 hover:bg-slate-50 rounded text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleInsertTableSubmit}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                >
                  টেবিল যুক্ত করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C. INSERT LINK DIALOG MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in text-left">
          <div className="bg-white rounded border border-slate-200 max-w-sm w-full p-5 font-sans">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Link size={15} className="text-blue-600" />
              <span>সংবাদের সাথে লিংক যুক্ত করুন</span>
            </h3>

            <form onSubmit={handleInsertLinkSubmit} className="space-y-4 text-xs text-slate-650">
              <div>
                <label className="block text-slate-600 font-bold mb-1">ডিসপ্লে লেখ্য টেক্সট (Text):</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="যেমন: ফরিদপুরের ইতিহাস"
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-850"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">লিংক ঠিকানা (URL):</label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-850 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
                >
                  লিংক যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. INSERT MOVIE/VIDEO EMBED DIALOG */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in text-left">
          <div className="bg-white rounded border border-slate-200 max-w-sm w-full p-5 font-sans">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <VideoIcon size={15} className="text-rose-600" />
              <span>ভিডিও এম্বেড করুন</span>
            </h3>

            <form onSubmit={handleInsertVideoSubmit} className="space-y-4 text-xs text-slate-650">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Youtube লিঙ্ক অথবা MP4 ফাইল লিঙ্ক:</label>
                <input
                  type="text"
                  required
                  value={videoCode}
                  onChange={(e) => setVideoCode(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-850 focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">নোট: ইউটিউব ভিডিও লিঙ্ক এম্বেড করা হলে সেটি মূল সংবাদে চমৎকার প্লেয়ার আকারে দেখাবে।</span>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer"
                >
                  ভিডিও বসান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. SEARCH AND REPLACE DOCK DIALOG */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs flex items-center justify-center p-4 z-99 animate-fade-in text-left">
          <div className="bg-white rounded border border-slate-200 max-w-sm w-full p-5 font-sans">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={15} className="text-blue-600" />
              <span>খুঁজুন এবং পরিবর্তন করুন</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-650">
              <div>
                <label className="block text-slate-600 font-bold mb-1">কোন শব্দটি খুঁজছেন?</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="যেমন: জেলা"
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">পরিবর্তিত শব্দ:</label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="যেমন: ফরিদপুর জেলা"
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-850 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={executeSearchReplace}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
                >
                  শব্দ পরিবর্তন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
