import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | string | undefined | null) {
  if (num === undefined || num === null || num === "") return "0";
  if (typeof num === 'string') {
    // If it's already a formatted string like "1,00,000 and More", return it
    if (isNaN(Number(num.replace(/,/g, '')))) return num;
    num = Number(num.replace(/,/g, ''));
  }
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export const GENRES = [
  "LIFESTYLE", "DANCE", "SCRIPTED", "FOOD", "COMMUNITY_PAGE", "CELEBRITY",
  "TRAVEL", "CHALLENGE", "COUPLE_VLOGS", "UGC", "TECH", "AUTOMOTIVE",
  "DIY", "FASHION", "STYLING", "SKINCARE", "FITNESS", "FAMILY",
  "FINANCE", "MUSIC", "GAMING", "HOME_DECOR", "STORYTELLING", "VLOG"
];

export const LOCATIONS = [
  "THIRUVANANTHAPURAM", "KOLLAM", "PATHANAMTHITTA", "ALAPPUZHA", "KOTTAYAM",
  "IDUKKI", "ERNAKULAM", "THRISSUR", "PALAKKAD", "MALAPPURAM", "KOZHIKODE",
  "WAYANAD", "KANNUR", "KASARAGOD", "BANGLORE", "COIMBATORE", "TAMIL NADU",
  "HYDERABAD", "CHENNAI", "GCC", "DUBAI", "QATAR", "UK", "CANADA", "DELHI"
];

export const INFLUENCER_SIZES = ["nano", "micro", "macro", "mega"];

export interface Creator {
  id: string;
  name: string;
  instagram_handle: string;
  profile_link: string;
  primary_location: string;
  secondary_location: string;
  category: string;
  secondary_category?: string;
  followers_count: number | string;
  influencer_size: string;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  engagement_rate: number;
  contact_number: string;
  email: string;
  manager_details: string;
  commercials: string;
  flag_status: "clean" | "caution" | "blacklisted";
  flag_reason?: string;
  comments?: string;
  last_updated_at: string;
  last_updated_by?: string;
  profile_pic_url?: string;
}
