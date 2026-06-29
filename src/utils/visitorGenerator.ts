/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisitorLog } from "../types";

const LOCAL_STORAGE_KEY = "bartasandhan_visitor_logs";

// Explicit latest logs matching the user's screenshot exactly
const explicitLogs = [
  {
    id: "v-341",
    sl: 341,
    date: "7 June 2026",
    rawDate: "2026-06-07",
    location: "Charlotte, North Carolina, US",
    visitorsCount: 1
  },
  {
    id: "v-340",
    sl: 340,
    date: "7 June 2026",
    rawDate: "2026-06-07",
    location: "Taiyuan, Shanxi, CN",
    visitorsCount: 1
  },
  {
    id: "v-339",
    sl: 339,
    date: "7 June 2026",
    rawDate: "2026-06-07",
    location: "Dhaka, Dhaka Division, BD",
    visitorsCount: 1
  },
  {
    id: "v-338",
    sl: 338,
    date: "6 June 2026",
    rawDate: "2026-06-06",
    location: "Charlotte, North Carolina, US",
    visitorsCount: 1
  },
  {
    id: "v-337",
    sl: 337,
    date: "6 June 2026",
    rawDate: "2026-06-06",
    location: "Kafrul, Dhaka Division, BD",
    visitorsCount: 1
  },
  {
    id: "v-336",
    sl: 336,
    date: "5 June 2026",
    rawDate: "2026-06-05",
    location: "Montréal, Quebec, CA",
    visitorsCount: 1
  },
  {
    id: "v-335",
    sl: 335,
    date: "4 June 2026",
    rawDate: "2026-06-04",
    location: "Moses Lake, Washington, US",
    visitorsCount: 1
  },
  {
    id: "v-334",
    sl: 334,
    date: "4 June 2026",
    rawDate: "2026-06-04",
    location: "Unknown City, Unknown Region, Unknown Country",
    visitorsCount: 1
  },
  {
    id: "v-333",
    sl: 333,
    date: "3 June 2026",
    rawDate: "2026-06-03",
    location: "Chattogram, Chittagong, BD",
    visitorsCount: 1
  },
  {
    id: "v-332",
    sl: 332,
    date: "3 June 2026",
    rawDate: "2026-06-03",
    location: "Taiyuan, Shanxi, CN",
    visitorsCount: 2
  }
];

// Helper to format date to readable format, e.g. "2 June 2026"
function getReadableDate(day: number, monthName: string, year: number): string {
  return `${day} ${monthName} ${year}`;
}

// Location pool for filler logs to make it look highly authentic
const locationPool = [
  "Dhaka, Dhaka Division, BD",
  "Chattogram, Chittagong, BD",
  "Taiyuan, Shanxi, CN",
  "Charlotte, North Carolina, US",
  "Social Circle, Georgia, US",
  "Ashburn, Virginia, US",
  "Kafrul, Dhaka Division, BD",
  "Montréal, Quebec, CA",
  "Moses Lake, Washington, US",
  "Paris, Île-de-France, FR",
  "London, England, GB",
  "Tokyo, Tokyo, JP",
  "Sydney, New South Wales, AU"
];

export function getOrInitializeVisitorLogs(): VisitorLog[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error loading visitor logs from local storage", e);
    }
  }

  // Generate dynamic filler logs to match target counts exactly
  const logs: VisitorLog[] = [...explicitLogs];
  let currentSl = 331;

  // Let's verify our target metrics:
  // Today (7 June): 3 visitors (SL 341, 339, 340 already sum up to 1+1+1 = 3 visitors) - PERFECT!
  // Yesterday (6 June): 2 visitors (SL 338, 337 already sum up to 1+1 = 2 visitors) - PERFECT!
  // This Week (1 June to 7 June): Target is 5, but we can have up to 15 for This Month. Wait, in the screenshot:
  // Today (3) + Yesterday (2) = 5. Okay!
  // What about 1 June to 5 June? We need logs that add up to (This Month 15 - 5) = 10 visitors.
  // Let's generate some logs for June 1st to 5th June.
  
  // 5 June: SL 336 (1 visitor) - explicit. We need 9 more visitors for June 1 to 5.
  // June 5 additional:
  logs.push({
    id: `v-${currentSl}`,
    sl: currentSl--,
    date: "5 June 2026",
    rawDate: "2026-06-05",
    location: "Dhaka, Dhaka Division, BD",
    visitorsCount: 1
  });

  // June 4 additional: SL 335 (1), SL 334 (1) are explicit.
  logs.push({
    id: `v-${currentSl}`,
    sl: currentSl--,
    date: "4 June 2026",
    rawDate: "2026-06-04",
    location: "Chattogram, Chittagong, BD",
    visitorsCount: 1
  });

  // June 3 additional: SL 333 (1), SL 332 (2) are explicit.
  // June 2: 2 visitors
  logs.push({
    id: `v-${currentSl}`,
    sl: currentSl--,
    date: "2 June 2026",
    rawDate: "2026-06-02",
    location: "Taiyuan, Shanxi, CN",
    visitorsCount: 2
  });

  // June 1: 3 visitors
  logs.push({
    id: `v-${currentSl}`,
    sl: currentSl--,
    date: "1 June 2026",
    rawDate: "2026-06-01",
    location: "Dhaka, Dhaka Division, BD",
    visitorsCount: 3
  });

  // At this point:
  // Today (7 June): 3
  // Yesterday (6 June): 2
  // 5 June: 1 + 1 = 2
  // 4 June: 1 + 1 + 1 = 3
  // 3 June: 1 + 2 = 3
  // 2 June: 2
  // 1 June: 3
  // Total in June so far: 3 + 2 + 2 + 3 + 3 + 2 + 3 = 18.
  // Wait, let's make sure the visitor count sums match the metrics in the screenshot where the cards say:
  // Today: 3, This Week: 5, This Month: 15.
  // If This Month: 15, we can adjust our generated logs so that June 1 to June 5 has exactly 10 visitors.
  // Let's refine the June 1-5 generated logs to sum up to exactly 10!
  // Explicit June 1-7 logs already in explicitLogs:
  // - 7 June: v-341(1), v-340(1), v-339(1). Sum = 3
  // - 6 June: v-338(1), v-337(1). Sum = 2
  // - 5 June: v-336(1). Sum = 1
  // - 4 June: v-335(1), v-334(1). Sum = 2
  // - 3 June: v-333(1), v-332(2). Sum = 3
  // Sum of explicit logs = 3 + 2 + 1 + 2 + 3 = 11.
  // To reach exactly 15 visitors for June, we need exactly (15 - 11) = 4 more visitors on June 1 and 2!
  // Perfect! Let's generate:
  // - 2 June: 2 visitors (1 log)
  // - 1 June: 2 visitors (1 log)
  // Total June visitors is now exactly 15! This is elegant and flawless.
  
  // Clear the array and rebuild perfectly
  const finalLogs: VisitorLog[] = [...explicitLogs];
  let slCount = 331;

  // June 2 filler
  finalLogs.push({
    id: `v-${slCount}`,
    sl: slCount--,
    date: "2 June 2026",
    rawDate: "2026-06-02",
    location: "Social Circle, Georgia, US",
    visitorsCount: 2
  });

  // June 1 filler
  finalLogs.push({
    id: `v-${slCount}`,
    sl: slCount--,
    date: "1 June 2026",
    rawDate: "2026-06-01",
    location: "Ashburn, Virginia, US",
    visitorsCount: 2
  });

  // Total June = 15. The "This Month Visitors" card will read exactly 15!

  // Now, Last Week (24 May to 31 May): Target is 12 visitors.
  // Let's generate logs in May to get exactly 12 visitors in the range May 24 - May 31.
  for (let d = 31; d >= 24; d--) {
    const vc = d % 3 === 0 ? 2 : 1; 
    finalLogs.push({
      id: `v-${slCount}`,
      sl: slCount--,
      date: `${d} May 2026`,
      rawDate: `2026-05-${d}`,
      location: locationPool[slCount % locationPool.length],
      visitorsCount: vc
    });
  }
  // Let's check how many visitors generated for May 24-31 (Last Week):
  // 31 (vc = 2), 30 (vc = 1), 29 (vc = 1), 28 (vc = 2), 27 (vc = 1), 26 (vc = 1), 25 (vc = 2), 24 (vc = 1).
  // Sum = 2 + 1 + 1 + 2 + 1 + 1 + 2 + 1 = 11.
  // Let's add 1 extra v_count on 24 May to make the sum exactly 12!
  finalLogs[finalLogs.length - 1].visitorsCount += 1; // Now it's 12! Perfect. Last Week Visitors = 12.

  // Now, Last Month (May): Target is 64 visitors.
  // Let's generate logs for May 1st to May 23rd sum up to (64 - 12) = 52 visitors.
  // We can generate logs for May 1 to May 23.
  for (let d = 23; d >= 1; d -= 2) { // alternate days
    const vc = (d % 4 === 0) ? 4 : (d % 3 === 0 ? 3 : 5);
    finalLogs.push({
      id: `v-${slCount}`,
      sl: slCount--,
      date: `${d} May 2026`,
      rawDate: `2026-05-${d < 10 ? '0' + d : d}`,
      location: locationPool[slCount % locationPool.length],
      visitorsCount: vc
    });
  }
  // Let's make sure the sum is exactly 52.
  let currentMay1To23Sum = finalLogs
    .filter(x => x.rawDate >= "2026-05-01" && x.rawDate <= "2026-05-23")
    .reduce((s, i) => s + i.visitorsCount, 0);
  
  if (currentMay1To23Sum !== 52) {
    // Tweak the last elements to match exactly 52
    const diff = 52 - currentMay1To23Sum;
    finalLogs[finalLogs.length - 1].visitorsCount += diff;
  }

  // Verify total May visitors:
  // May 1-23: 52 visitors.
  // May 24-31: 12 visitors.
  // Total May: 64 visitors. Perfect! "Last Month Visitors" card will read exactly 64!

  // Now, This Year 2026 Visitors: Target is 751.
  // Visitors so far in 2026 (June + May) = 15 (June) + 64 (May) = 79.
  // We need remaining (751 - 79) = 672 visitors across Jan, Feb, Mar, Apr of 2026!
  // Let's generate them. Since we don't want too many elements in JSON, we can generate monthly blocks or individual list of logs.
  // Let's generate around 150 older records with random dates in Jan-Apr 2026, with an average visitorCount of 4 to 5, summing up to exactly 672.
  let requiredRemaining = 672;
  const oldMonths = [
    { name: "April", numStr: "04", days: 30 },
    { name: "March", numStr: "03", days: 31 },
    { name: "February", numStr: "02", days: 28 },
    { name: "January", numStr: "01", days: 31 }
  ];

  let monthIdx = 0;
  let dayIdx = 1;
  while (requiredRemaining > 0) {
    const currentMonth = oldMonths[monthIdx];
    const vc = Math.min(requiredRemaining, Math.floor(Math.random() * 5) + 3); // 3 to 7
    const dayStr = dayIdx < 10 ? `0${dayIdx}` : `${dayIdx}`;
    
    finalLogs.push({
      id: `v-${slCount}`,
      sl: slCount--,
      date: `${dayIdx} ${currentMonth.name} 2026`,
      rawDate: `2026-${currentMonth.numStr}-${dayStr}`,
      location: locationPool[slCount % locationPool.length],
      visitorsCount: vc
    });

    requiredRemaining -= vc;

    dayIdx += 2; // jump every 2 days
    if (dayIdx > currentMonth.days) {
      dayIdx = 1;
      monthIdx = (monthIdx + 1) % oldMonths.length;
    }
  }

  // Adjust if slCount gets out of hand or anything, but slCount is descending smoothly, which is perfect.

  // Save to localStorage
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalLogs));
  return finalLogs;
}

export function saveVisitorLogs(logs: VisitorLog[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  }
}
