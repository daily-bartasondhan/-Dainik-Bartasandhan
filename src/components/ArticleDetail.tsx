/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Article } from "../types";
import { getBengaliDateTime, toBengaliDigits } from "../utils";
import { ArrowLeft, Clock, Eye, Share2, Printer, ThumbsUp, MessageSquare, Play, Video, Facebook, MessageCircle } from "lucide-react";

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
  onSelectArticle: (id: string) => void;
}

export default function ArticleDetail({ articleId, onBack, onSelectArticle }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Load article details and increment views on mount
  useEffect(() => {
    setLoading(true);
    // Increment view counts on server side call
    fetch(`/api/news/${articleId}`)
      .then((res) => {
        if (!res.ok) throw new Error("সংবাদ হারিয়ে গেছে");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        // Load related category news
        fetch(`/api/news?category=${data.category}`)
          .then((r) => r.json())
          .then((relatedData) => {
            setRelated(relatedData.filter((item: Article) => item.id !== data.id).slice(0, 4));
          });
      })
      .catch((err) => {
        console.error("Error loading articleDetails", err);
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  // Utility to split content and insert distributed images (2 to 5) beautifully
  const renderNewsBody = () => {
    if (!article) return null;

    const additionalImages = article.images.slice(1); // images index 1 to 4 (representing 2 to 5)

    // Detect if content is rich HTML to prevent newline splits that break HTML elements
    const isHtml = /<[a-z][\s\S]*>/i.test(article.content);
    if (isHtml) {
      return (
        <div className="space-y-6">
          <div 
            className="text-gray-800 leading-relaxed text-lg mb-6 font-shonar html-content whitespace-normal"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          {additionalImages.map((imgUrl, idx) => (
            <div key={idx} className="my-8 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 p-2 shadow-sm">
              <img
                src={imgUrl}
                alt={`সংলগ্ন ছবি ${toBengaliDigits(idx + 2)}`}
                className="w-full max-h-[450px] object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="block text-center text-xs text-gray-500 mt-2 font-display">
                সংযুক্ত সংবাদের ছবি • দৈনিক বার্তাসন্ধান
              </span>
            </div>
          ))}
        </div>
      );
    }

    const paragraphs = article.content.split("\n").filter(p => p.trim() !== "");
    const totalParas = paragraphs.length;

    if (additionalImages.length === 0) {
      return paragraphs.map((para, idx) => (
        <div 
          key={idx} 
          className="text-gray-800 leading-relaxed text-lg mb-6 font-shonar"
          dangerouslySetInnerHTML={{ __html: para }}
        />
      ));
    }

    // Distribute images evenly across paragraphs
    const distributionMap: Record<number, string> = {};
    const step = Math.max(1, Math.floor(totalParas / (additionalImages.length + 1)));

    additionalImages.forEach((imgUrl, i) => {
      const targetIndex = Math.min((i + 1) * step, totalParas - 1);
      distributionMap[targetIndex] = imgUrl;
    });

    return paragraphs.map((para, idx) => {
      const hasImageAfter = distributionMap[idx];
      return (
        <React.Fragment key={idx}>
          <div 
            className="text-gray-800 leading-relaxed text-lg mb-6 font-shonar"
            dangerouslySetInnerHTML={{ __html: para }}
          />
          {hasImageAfter && (
            <div className="my-8 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 p-2 shadow-sm">
              <img
                src={hasImageAfter}
                alt={`সংলগ্ন ছবি ${toBengaliDigits(idx + 1)}`}
                className="w-full max-h-[450px] object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="block text-center text-xs text-gray-500 mt-2 font-display">
                সংযুক্ত সংবাদের ছবি • দৈনিক বার্তাসন্ধান
              </span>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  // Convert embed link if YouTube to beautiful iframe
  const renderVideoBlock = () => {
    if (!article || !article.videoUrl) return null;

    let embedSrc = article.videoUrl;
    if (article.videoUrl.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(article.videoUrl).search);
      const videoId = urlParams.get("v");
      if (videoId) {
        embedSrc = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (article.videoUrl.includes("youtu.be/")) {
      const videoId = article.videoUrl.split("/").pop();
      if (videoId) {
        embedSrc = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return (
      <div className="my-8 bg-gray-900 rounded-2xl p-4 overflow-hidden border border-gray-800">
        <span className="flex items-center gap-2 text-primary-red font-display text-sm font-semibold mb-3">
          <Video size={18} />
          <span>সংযুক্ত সংবাদ ভিডিও প্রতিবেদন</span>
        </span>
        <div className="relative aspect-video rounded-xl overflow-hidden">
          {embedSrc.startsWith("http") ? (
            <iframe
              src={embedSrc}
              title={article.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-slate-900 border border-slate-800 flex flex-col justify-center items-center text-gray-400 p-4 text-center">
              <p className="font-display font-medium text-sm">{article.videoUrl}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans space-y-4">
        <div className="w-12 h-12 border-4 border-primary-red border-t-transparent animate-spin rounded-full mx-auto"></div>
        <p className="font-display text-gray-500 text-lg">খবরটি খোলা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans space-y-4">
        <p className="font-display text-red-600 text-lg">দুঃখিত, সংবাদটি খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে!</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary-red text-white font-display text-sm font-bold rounded-lg cursor-pointer"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 font-sans" id={`article-page-${article.id}`}>
      
      {/* Back button and Sharing controls */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-red font-display font-bold transition-colors cursor-pointer"
          id="detail-back-button"
        >
          <ArrowLeft size={16} />
          <span>পূর্বের পাতায় ফিরে যান</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 text-gray-400 hover:text-accent-blue hover:bg-gray-100 rounded-full transition-all cursor-pointer"
            title="প্রিন্ট করুন"
          >
            <Printer size={16} />
          </button>
          
          <button
            onClick={() => {
              if (article) {
                const shareText = `${article.category} | ${article.title}\n${window.location.origin}/news/${article.id}`;
                navigator.clipboard.writeText(shareText);
                alert("সংবাদের ক্যাটাগরি, শিরোনাম এবং লিংক কপি করা হয়েছে!");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-primary-red text-xs font-display font-semibold rounded-full transition-all cursor-pointer border border-red-100"
            title="ক্যাটাগরি ও শিরোনামসহ লিংক কপি করুন"
          >
            <Share2 size={13} />
            <span>লিংক কপি</span>
          </button>

          {article && (
            <>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/news/${article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-display font-semibold rounded-full transition-all cursor-pointer border border-blue-100"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook size={13} />
                <span>ফেসবুক</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.category} | ${article.title}\n${window.location.origin}/news/${article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-display font-semibold rounded-full transition-all cursor-pointer border border-green-100"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <MessageCircle size={13} />
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* News detail central container (Col Span 8) */}
        <div className="lg:col-span-8 space-y-6 bg-white p-5 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          
          {/* Tag & Category info */}
          <div className="flex items-center gap-2">
            <span className="bg-red-700 text-white font-display text-xs font-bold px-3 py-0.5 rounded-full">
              {article.category}
            </span>
            {article.subcategory && (
              <span className="bg-gray-100 text-gray-600 font-display text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                {article.subcategory}
              </span>
            )}
          </div>

          {/* Headline Title */}
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-600 font-display font-semibold border-l-4 border-red-700 pl-4 py-1 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Timestamp, Views, and Reporter Section */}
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 py-3 border-t border-b border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-primary-red" />
                <span>প্রকাশকাল: {getBengaliDateTime(article.publicationDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye size={13} className="text-blue-500" />
                <span>{toBengaliDigits(article.views)} বার পঠিত</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-display font-semibold text-gray-700">ডিজিটাল ডেস্ক</span>
            </div>
          </div>

          {/* Feature Image Directly below News Headline (Img 1) */}
          <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-2.5 shadow-sm">
            <img
              src={article.images[0] || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"}
              alt={article.title}
              className="w-full max-h-[500px] object-cover rounded-xl"
              referrerPolicy="no-referrer"
              id="detail-feature-image"
            />
            <div className="p-3 bg-white text-center rounded-lg mt-2 border border-gray-50 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-display gap-2">
              <span>১ম ফিচার ইমেজ • {article.title}</span>
              <span>সংগৃহীত</span>
            </div>
          </div>

          {/* Reporter details overlay */}
          <div className="flex items-center gap-3 bg-red-50/40 p-4 rounded-xl border border-red-100/50">
            <div className="w-10 h-10 rounded-full bg-primary-red/10 text-primary-red flex items-center justify-center font-display font-extrabold text-lg shadow-sm border border-red-200">
              {article.reporterName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-display font-bold text-accent-blue">{article.reporterName}</p>
              <p className="text-xs font-display text-gray-500">
                {article.reporterName === "অনলাইন ডেস্ক" ? "বার্তা বিভাগ, দৈনিক বার্তাসন্ধান" : "বিশেষ সংবাদদাতা, দৈনিক বার্তাসন্ধান"}
              </p>
            </div>
          </div>

          {/* Content Body (with Distributed Images 2-5 inside) */}
          <article className="prose max-w-none text-justify my-6" id="article-main-body">
            {renderNewsBody()}
          </article>

          {/* Render embedded video is applicable */}
          {renderVideoBlock()}

          {/* Article Footer Flags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 font-display font-bold mt-1.5">ট্যাগ:</span>
              {article.tags.map(tag => (
                <span key={tag} className="text-xs font-display text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full border border-gray-200 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related News Under-Content Grid */}
          <div className="pt-8 border-t border-gray-100 space-y-6" id="under-article-related-news">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-xl font-display font-bold text-gray-900 relative">
                সম্পর্কিত আরো খবর
                <span className="absolute bottom-[-13px] left-0 w-16 h-[3px] bg-red-700 rounded-full"></span>
              </h3>
              <span className="text-xs font-display text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                {article.category}
              </span>
            </div>

            {related.length === 0 ? (
              <p className="text-sm text-gray-400 font-display py-4">
                এই ক্যাটাগরিতে আর কোনো পুরোনো খবর পাওয়া যায়নি।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {related.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectArticle(item.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group cursor-pointer bg-slate-50/50 hover:bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Image */}
                      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-100 relative shadow-2xs">
                        <img
                          src={item.images[0] || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-display font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-display font-bold text-gray-800 leading-snug group-hover:text-primary-red transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </div>

                    {/* Meta */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-display">
                      <span>{item.reporterName || "অনলাইন ডেস্ক"}</span>
                      <span>{getBengaliDateTime(item.publicationDate).split(",")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RELATED / RECOMENDED NEWS SIDEBAR (Col Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="border-b-2 border-red-700 pb-2">
              <h3 className="text-lg font-display font-extrabold text-accent-blue">
                সম্পর্কিত খবর ({article.category})
              </h3>
            </div>

            {related.length === 0 ? (
              <p className="text-sm text-gray-400 font-display text-center py-6">
                এই বিভাগে অন্য কোনো খবর পাওয়া যায়নি।
              </p>
            ) : (
              <div className="space-y-4">
                {related.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectArticle(item.id)}
                    className="group cursor-pointer flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="w-20 h-16 rounded overflow-hidden shrink-0">
                      <img
                        src={item.images[0] || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-display font-bold text-gray-800 group-hover:text-primary-red transition-colors line-clamp-2 leading-relaxed">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        {getBengaliDateTime(item.publicationDate).split(",")[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Helpline Box */}
          <div className="bg-gray-800 text-white rounded-2xl p-5 border border-gray-700 shadow-md">
            <h4 className="text-sm font-display font-bold text-primary-red uppercase tracking-wider mb-2">
              বার্তা কক্ষ সহায়তা
            </h4>
            <p className="text-xs text-gray-300 font-display leading-relaxed">
              পত্রিকায় প্রকাশিত কোনো সংবাদের ভুল সংশোধন বা পরামর্শ থাকলে আমাদের মেইল করুন: <strong className="text-white">editor@dainikbartasandhan.com</strong> অথবা ডিকশন নম্বরে যোগাযোগ করুন।
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
