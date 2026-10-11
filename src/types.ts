/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types sharing between frontend and backend

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  description?: string; // Summary of article
  content: string; // Full body
  category: string;
  subcategory?: string; // e.g. cricket, football, dhallywood, etc.
  tags: string[];
  publicationDate: string; // ISO string or Bengali Date string
  status: 'Draft' | 'Pending' | 'Published' | 'Approved' | 'Scheduled' | 'Rejected' | 'Imported';
  views: number;
  images: string[]; // Array of 1 to 5 images
  imageDescriptions?: string[]; // Array of descriptions corresponding to images
  videoUrl?: string; // Embedded video url
  dSubTitle?: string; // Domain or sub-title for aesthetic title display
  reporterId: string;
  reporterName: string;
  createdAt?: string;
  updatedAt?: string;
  isLead?: boolean;
  isHeadline?: boolean;
}

export type StaffRole = 'সংবাদ কর্মী' | 'সাংবাদিক' | 'প্রতিনিধি' | 'স্টাফ রিপোর্টার' | 'স্টাফ' | 'সম্পাদক';

export interface Staff {
  userId: string;
  passwordHash: string; // Plain password / MD5 or simulated safe hashing
  staffId: string; // e.g. S-101
  name: string;
  designation: StaffRole | string;
  fatherName: string;
  motherName: string;
  mobile: string;
  nid: string;
  presentAddress: string;
  permanentAddress: string;
  status: 'Active' | 'Suspended';
  email?: string;
  createdAt?: string;
  author?: 'Yes' | 'No';
  autoApprovePost?: 'Yes' | 'No';
  authorCity?: string;
  authorAddress?: string;
  picture?: string;
}

export interface WebConfig {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface VisitorLog {
  id: string;
  sl: number;
  date: string;
  rawDate: string;
  location: string;
  visitorsCount: number;
}
