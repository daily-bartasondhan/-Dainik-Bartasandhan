/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Globe2, BookOpen, Film, HeartHandshake, Briefcase, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory?: (category: string, subcategory: string) => void;
}

export default function CategoryMegaMenu({ isOpen, onClose, onSelectCategory, onSelectSubcategory }: MegaMenuProps) {
  // Category Rows as specified exactly
  const rows = [
    {
      title: "প্রধান সংবাদ ও বিন্যাস",
      items: ["সর্বশেষ", "জাতীয়", "রাজনীতি", "সারাদেশ", "বিশ্ব", "খেলা", "শিক্ষা"]
    },
    {
      title: "সমাজ ও অর্থনীতি",
      items: ["বাণিজ্য", "বিনোদন", "মতামত", "আইন-আদালত", "অপরাধ", "স্বাস্থ্য", "ধর্ম"]
    },
    {
      title: "কর্মসংস্থান ও সাহিত্য",
      items: ["মূলধন", "শিল্প-সাহিত্য", "প্রবাস", "প্রযুক্তি", "চাকরি", "চট্টগ্রাম সারাবেলা", "লাইফস্টাইল"]
    },
    {
      title: "পরামর্শ ও সাময়িকী",
      items: ["নারী-শিশু", "আইন ও পরামর্শ", "সোশ্যাল মিডিয়া", "বিচিত্র", "কর্পোরেট", "পরিবেশ ও জলবায়ু", "পিএসআই"]
    },
    {
      title: "বিনোদন ও মিডিয়া",
      items: ["রম্যবেলা", "নির্বাচন", "অডিও", "ভিডিও"]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 transition-opacity"
            id="megamenu-backdrop"
          />

          {/* Mega menu contents */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed top-0 inset-x-0 bg-white shadow-2xl border-b-4 border-primary-red z-50 max-h-[90vh] overflow-y-auto"
            id="megamenu-panel"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
              {/* Menu Title and Close Button */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-7 bg-primary-red rounded-full"></div>
                  <h2 className="text-2xl font-bold font-display text-accent-blue">সকল ক্যাটাগরি</h2>
                </div>
                
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-display text-sm font-semibold transition-all duration-200"
                  id="megamenu-close-btn"
                >
                  <X size={18} />
                  <span>বন্ধ করুন (X)</span>
                </button>
              </div>

              {/* Grid representation modeled precisely after Ittefaq's structure */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-display">
                      সারি {rowIndex + 1} • {row.title}
                    </span>
                    <ul className="space-y-1.5">
                      {row.items.map((item) => (
                        <li key={item}>
                          <button
                            onClick={() => {
                              onSelectCategory(item);
                              onClose();
                            }}
                            className="w-full text-left font-display font-medium text-base text-gray-800 hover:text-primary-red hover:underline py-1 transition-all duration-150"
                          >
                            {item}
                          </button>
                          
                          {/* Inner subcategories displayed elegantly if Sports or Entertainment is hovered/shown */}
                          {item === "খেলা" && (
                            <div className="pl-4 mt-0.5 space-y-1 border-l-2 border-red-200 font-display text-sm text-gray-600">
                              {["ক্রিকেট", "ফুটবল", "অন্যান্য"].map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    if (onSelectSubcategory) {
                                      onSelectSubcategory("খেলা", sub);
                                    } else {
                                      onSelectCategory("খেলা");
                                    }
                                    onClose();
                                  }}
                                  className="block hover:text-primary-red text-xs py-0.5"
                                >
                                  • {sub}
                                </button>
                              ))}
                            </div>
                          )}

                          {item === "বিনোদন" && (
                            <div className="pl-4 mt-0.5 space-y-1 border-l-2 border-red-200 font-display text-sm text-gray-600">
                              {["ঢালিউড", "বলিউড", "হলিউড", "অন্যান্য"].map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    if (onSelectSubcategory) {
                                      onSelectSubcategory("বিনোদন", sub);
                                    } else {
                                      onSelectCategory("বিনোদন");
                                    }
                                    onClose();
                                  }}
                                  className="block hover:text-primary-red text-xs py-0.5"
                                >
                                  • {sub}
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Decorative Banner/Slogan inside Menu */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
                <span className="font-display">দৈনিক বার্তাসন্ধান — সত্যের সন্ধানে নিরন্তর পথচলা</span>
                <span className="font-display text-gray-400 mt-2 sm:mt-0">© ২০২৬ দৈনিক বার্তাসন্ধান। সর্বস্বত্ব সংরক্ষিত।</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
