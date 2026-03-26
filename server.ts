import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import pkg from "xlsx";
const { readFile, utils, write } = pkg;
import { v4 as uuidv4 } from "uuid";
import { google } from "googleapis";
import dotenv from "dotenv";
import { ApifyClient } from "apify-client";

dotenv.config();

const SPREADSHEET_ID =
  process.env.SPREADSHEET_ID || "16M5YgdCeysACzPhd4pGxTJJDDi0luUdLyZ-rQgWyUcU";
const SHEET_NAME = "DATA_BASE";

const INTERNAL_TO_SHEET_MAP: { [key: string]: string } = {
  name: "NAME",
  profile_link: "Profile Link",
  influencer_size: "INFLUENCER SIZE",
  followers_count: "FOLLOWERS",
  category: "CONTENT GENRE",
  secondary_category: "SECONDARY CONTENT GENRE",
  primary_location: "LOCATION",
  secondary_location: "SECONDARY LOCATION",
  last_updated_at: "UPDATED DATE",
  commercials: "COMMERCIALS",
  contact_number: "PHONE NUMBER",
  email: "MAIL ID",
  engagement_rate: "ENGAGEMENT RATE",
  profile_pic_url: "PROFILE PIC",
  avg_views: "AVG VIEWS",
  avg_likes: "AVG LIKES",
  avg_comments: "AVG COMMENTS",
};

const SHEET_TO_INTERNAL_MAP: { [key: string]: string } = Object.entries(
  INTERNAL_TO_SHEET_MAP,
).reduce(
  (acc, [key, val]) => {
    acc[val] = key;
    return acc;
  },
  {} as { [key: string]: string },
);

const apifyClient = process.env.APIFY_API_TOKEN
  ? new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    })
  : null;

// Google Sheets Auth
// Google Sheets Auth - Production-Robust Key Parsing
const privateKey = process.env.GOOGLE_PRIVATE_KEY
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/^['"](.*)['"]$/, "$1") // Remove wrapping quotes
      .replace(/\\n/g, "\n") // Replace escaped \n with true newlines
  : undefined;

if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !privateKey) {
  console.warn(
    "GOOGLE_SERVICE_ACCOUNT_EMAIL is set but GOOGLE_PRIVATE_KEY is missing or empty.",
  );
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Helper to map sheet rows to objects based on the actual DATA_BASE structure
function rowsToObjects(rows: any[][]) {
  if (!rows || rows.length === 0) return [];
  const headers = rows[0];

  return rows.slice(1).map((row, rowIndex) => {
    const obj: any = { id: String(rowIndex + 1) };
    headers.forEach((header, index) => {
      const fieldName =
        SHEET_TO_INTERNAL_MAP[header] ||
        header.toLowerCase().replace(/ /g, "_");
      const value = row[index] || "";
      if (fieldName === "id" && !value) {
        // Keep the default id (rowIndex + 1)
      } else {
        obj[fieldName] = value;
      }
    });

    // Extract handle from profile link if possible
    if (obj.profile_link && !obj.instagram_handle) {
      try {
        const url = new URL(obj.profile_link);
        const path = url.pathname.split("/").filter(Boolean);
        if (path[0]) {
          obj.instagram_handle = path[0].split("?")[0];
        }
      } catch (e) {
        // Not a valid URL or other error
      }
    }

    // Ensure some defaults
    obj.flag_status = obj.flag_status || "clean";

    return obj;
  });
}

// Helper to map objects to sheet rows
function objectsToRows(objects: any[], headers: string[]) {
  return [
    headers,
    ...objects.map((obj) =>
      headers.map((header) => {
        const fieldName = SHEET_TO_INTERNAL_MAP[header] || header;
        return obj[fieldName] ?? "";
      }),
    ),
  ];
}

async function getSheetName() {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetNames =
      spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];
    if (sheetNames.includes(SHEET_NAME)) return SHEET_NAME;
    return sheetNames[0] || SHEET_NAME;
  } catch (error) {
    console.error("Error getting sheet name:", error);
    return SHEET_NAME;
  }
}

async function ensureColumnsExist(sheetName: string, headers: string[]) {
  try {
    const requiredHeaders = Object.values(INTERNAL_TO_SHEET_MAP);
    const missingHeaders = requiredHeaders.filter(
      (h) =>
        !headers.some(
          (existing) =>
            existing.trim().toUpperCase() === h.trim().toUpperCase(),
        ),
    );

    if (missingHeaders.length > 0) {
      console.log(
        `Adding missing columns to sheet: ${missingHeaders.join(", ")}`,
      );
      const newHeaders = [...headers, ...missingHeaders];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [newHeaders] },
      });
      return newHeaders;
    }
    return headers;
  } catch (error) {
    console.error("Error ensuring columns exist:", error);
    return headers;
  }
}

async function readCreatorsFromSheets() {
  try {
    const sheetName = await getSheetName();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:AZ`,
    });

    const rows = response.data.values || [];
    if (rows.length > 0) {
      const headers = rows[0];
      await ensureColumnsExist(sheetName, headers);
    }

    const data = rowsToObjects(rows);

    // Check if the data is valid (at least one item has a name or id)
    const isValid =
      data.length > 0 && data.some((c) => c.name || c.id || c.instagram_handle);
    if (!isValid && data.length > 0) {
      return readCreatorsLocal();
    }

    return data;
  } catch (error: any) {
    if (error.message?.includes("API has not been used")) {
      console.error(
        "CRITICAL: Google Sheets API is not enabled. Please enable it at: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=327721066917",
      );
    } else {
      console.error(
        "Error reading from Google Sheets:",
        error.message || error,
      );
    }
    return readCreatorsLocal();
  }
}

async function writeCreatorToSheets(creator: any) {
  try {
    const sheetName = await getSheetName();
    const creators = await readCreatorsFromSheets();
    const headers = Object.keys(creator);

    if (creators.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }

    const row = headers.map((h) => creator[h] ?? "");
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (error: any) {
    if (error.message?.includes("API has not been used")) {
      console.error(
        "CRITICAL: Google Sheets API is not enabled. Please enable it at: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=327721066917",
      );
    } else {
      console.error("Error writing to Google Sheets:", error.message || error);
    }
    throw error;
  }
}

async function updateCreatorInSheets(id: string, updates: any) {
  try {
    const sheetName = await getSheetName();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:AZ`,
    });
    const rows = response.data.values || [];
    if (rows.length === 0) return;

    const headers = rows[0];
    const normalizedHeaders = headers.map((h) => h.trim().toUpperCase());

    // Check if we need to add missing columns to the sheet
    const missingHeaders = Object.keys(updates)
      .map((key) => INTERNAL_TO_SHEET_MAP[key] || key)
      .filter(
        (header) => !normalizedHeaders.includes(header.trim().toUpperCase()),
      );

    if (missingHeaders.length > 0) {
      const newHeaders = [...headers, ...missingHeaders];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [newHeaders] },
      });
      console.log(
        `Added missing columns to sheet: ${missingHeaders.join(", ")}`,
      );
      // Refresh headers
      headers.push(...missingHeaders);
    }

    // Find the row. If id is a number, it's likely the row index (1-based)
    let rowIndex = -1;
    const idIndex = normalizedHeaders.indexOf("ID");

    if (idIndex !== -1) {
      rowIndex = rows.findIndex((row) => row[idIndex] === id);
    } else {
      // Fallback: use id as 1-based row index if it's a number
      const idNum = parseInt(id);
      if (!isNaN(idNum) && idNum > 0 && idNum < rows.length) {
        rowIndex = idNum;
      }
    }

    if (rowIndex === -1) {
      console.error(`Could not find creator with ID ${id} in sheet`);
      return;
    }

    const updatedRow = [...rows[rowIndex]];
    // Ensure the row is long enough for all headers
    while (updatedRow.length < headers.length) {
      updatedRow.push("");
    }
    Object.keys(updates).forEach((key) => {
      const sheetHeader = INTERNAL_TO_SHEET_MAP[key] || key;
      const colIndex = headers.findIndex(
        (h) => h.trim().toUpperCase() === sheetHeader.trim().toUpperCase(),
      );
      if (colIndex !== -1) {
        updatedRow[colIndex] = updates[key];
      }
    });

    console.log(
      `Final row to update (row ${rowIndex + 1}):`,
      JSON.stringify(updatedRow),
    );

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [updatedRow] },
    });
  } catch (error: any) {
    if (error.message?.includes("API has not been used")) {
      console.error(
        "CRITICAL: Google Sheets API is not enabled. Please enable it at: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=327721066917",
      );
    } else {
      console.error("Error updating Google Sheets:", error.message || error);
    }
    throw error;
  }
}

const EXCEL_FILE = path.join(process.cwd(), "creators.xlsx");

function readCreatorsLocal() {
  if (!fs.existsSync(EXCEL_FILE)) return [];
  const wb = readFile(EXCEL_FILE);
  const ws = wb.Sheets[SHEET_NAME] || wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return utils.sheet_to_json(ws) as any[];
}

function calculateInfluencerSize(followers: number) {
  if (followers < 10000) return "nano";
  if (followers < 100000) return "micro";
  if (followers < 1000000) return "macro";
  return "mega";
}

function calculateEngagementRate(
  likes: number,
  comments: number,
  followers: number,
) {
  if (!followers || followers === 0) return 0;
  return parseFloat((((likes + comments) / followers) * 100).toFixed(2));
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Routes
  app.get("/api/health/sheets", async (req, res) => {
    try {
      const health: any = {
        spreadsheetId: SPREADSHEET_ID,
        serviceAccountEmail:
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "Not set",
        privateKeySet: !!privateKey,
        status: "unknown",
        details: {},
      };

      try {
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
        });

        health.status = "connected";
        health.details.title = spreadsheet.data.properties?.title;
        health.details.sheets = spreadsheet.data.sheets?.map((s) => ({
          title: s.properties?.title,
          index: s.properties?.index,
          rowCount: s.properties?.gridProperties?.rowCount,
          columnCount: s.properties?.gridProperties?.columnCount,
        }));

        health.details.activeSheet = SHEET_NAME;

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:Z5`,
        });
        health.details.rows = response.data.values || [];
        health.details.headers = response.data.values?.[0] || [];
      } catch (err: any) {
        health.status = "error";
        health.error = err.message || "Failed to connect to Google Sheets";
      }

      res.json(health);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: "Health check failed", details: error.message });
    }
  });

  app.get("/api/image", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("No URL provided");
    try {
      const fetchRes = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });
      if (!fetchRes.ok)
        return res
          .status(fetchRes.status)
          .send(`Failed to fetch: ${fetchRes.statusText}`);

      const buffer = await fetchRes.arrayBuffer();
      res.setHeader(
        "Content-Type",
        fetchRes.headers.get("content-type") || "image/jpeg",
      );
      // Set aggressively long caching
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/creators", async (req, res) => {
    try {
      let creators = await readCreatorsFromSheets();
      const { name, location, region, category, genre, size, sort, order } =
        req.query;

      // Filter by name or handle
      if (name) {
        creators = creators.filter(
          (c) =>
            (c.name?.toString() || "")
              .toLowerCase()
              .includes((name as string).toLowerCase()) ||
            (c.instagram_handle?.toString() || "")
              .toLowerCase()
              .includes((name as string).toLowerCase()),
        );
      }

      // Filter by location
      if (location) {
        creators = creators.filter((c) =>
          (c.primary_location?.toString() || "")
            .toLowerCase()
            .includes((location as string).toLowerCase()),
        );
      }

      // Filter by region (secondary location)
      if (region) {
        creators = creators.filter((c) =>
          (c.secondary_location?.toString() || "")
            .toLowerCase()
            .includes((region as string).toLowerCase()),
        );
      }

      // Filter by category (genre)
      const activeCategory = (category || genre) as string;
      if (activeCategory && activeCategory !== "All") {
        creators = creators.filter(
          (c) =>
            (c.category?.toString() || "").toLowerCase() ===
              activeCategory.toLowerCase() ||
            (c.secondary_category?.toString() || "").toLowerCase() ===
              activeCategory.toLowerCase(),
        );
      }

      // Filter by size
      if (size && size !== "All") {
        creators = creators.filter(
          (c) =>
            (c.influencer_size?.toString() || "").toLowerCase() ===
            (size as string).toLowerCase(),
        );
      }

      // Sorting
      if (sort) {
        const sortField = sort as string;
        const sortOrder = order === "desc" ? -1 : 1;

        creators.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          // Special handling for followers count (can be string)
          if (sortField === "followers_count") {
            const parseFollowers = (val: any) => {
              if (typeof val === "number") return val;
              if (typeof val === "string") {
                const cleaned = val.replace(/,/g, "").toLowerCase();
                if (cleaned.includes("m")) return parseFloat(cleaned) * 1000000;
                if (cleaned.includes("k")) return parseFloat(cleaned) * 1000;
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
              }
              return 0;
            };
            valA = parseFollowers(valA);
            valB = parseFollowers(valB);
          }

          if (valA < valB) return -1 * sortOrder;
          if (valA > valB) return 1 * sortOrder;
          return 0;
        });
      }

      res.json(creators);
    } catch (error: any) {
      console.error("Error in /api/creators:", error);
      res
        .status(500)
        .json({ error: "Failed to read creators", details: error.message });
    }
  });

  app.post("/api/creators/bulk-scrape", async (req, res) => {
    try {
      if (!apifyClient) {
        return res
          .status(500)
          .json({ error: "Apify API token not configured" });
      }

      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No creator IDs provided" });
      }

      const creators = await readCreatorsFromSheets();
      const creatorsToScrape = creators.filter(
        (c) => ids.includes(c.id) && c.instagram_handle,
      );

      if (creatorsToScrape.length === 0) {
        return res.json({
          success: true,
          message: "No creators with handles found in the provided list",
          count: 0,
        });
      }

      console.log(
        `Bulk scraping metrics for ${creatorsToScrape.length} creators`,
      );

      const directUrls = Array.from(
        new Set(
          creatorsToScrape.map((c) => {
            const handle = c.instagram_handle
              .replace("@", "")
              .trim()
              .split("?")[0]
              .split("/")[0];
            return `https://www.instagram.com/${handle}/`;
          }),
        ),
      ).filter((url) => url.length > 26 && !url.includes("//", 8));

      const run = await apifyClient.actor("apify/instagram-scraper").call({
        directUrls,
        resultsLimit: creatorsToScrape.length * 6, // Fetch up to 6 reels per creator
        resultsType: "posts",
      });

      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();

      const sheetName = await getSheetName();
      const sheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:AZ`,
      });
      const rows = sheetResponse.data.values || [];
      const headers = rows[0];
      const normalizedHeaders = headers.map((h) => h.trim().toUpperCase());
      const idIndex = normalizedHeaders.indexOf("ID");

      const colIndices = {
        avg_views: headers.findIndex(
          (h) => h.trim().toUpperCase() === "AVG VIEWS",
        ),
        avg_likes: headers.findIndex(
          (h) => h.trim().toUpperCase() === "AVG LIKES",
        ),
        avg_comments: headers.findIndex(
          (h) => h.trim().toUpperCase() === "AVG COMMENTS",
        ),
        engagement_rate: headers.findIndex(
          (h) => h.trim().toUpperCase() === "ENGAGEMENT RATE",
        ),
        profile_pic: headers.findIndex(
          (h) => h.trim().toUpperCase() === "PROFILE PIC",
        ),
        updated: headers.findIndex(
          (h) => h.trim().toUpperCase() === "UPDATED DATE",
        ),
      };

      const dataToUpdate: { range: string; values: any[][] }[] = [];
      let updatedCount = 0;

      for (const creator of creatorsToScrape) {
        const handle = creator.instagram_handle
          .replace("@", "")
          .trim()
          .toLowerCase();

        // Find reels for this specific creator
        const creatorReels = items
          .filter((item: any) => {
            const itemHandle = (
              item.username ||
              item.ownerUsername ||
              item.user?.username ||
              ""
            ).toLowerCase();
            const isMatch =
              itemHandle === handle ||
              handle.includes(itemHandle) ||
              itemHandle.includes(handle);
            const isReel =
              item.type === "Video" ||
              item.type === "Reel" ||
              item.videoPlayCount !== undefined;
            return isMatch && isReel;
          })
          .slice(0, 6);

        if (creatorReels.length > 0) {
          const totalViews = creatorReels.reduce(
            (acc: number, r: any) => acc + (r.videoPlayCount || 0),
            0,
          );
          const totalLikes = creatorReels.reduce(
            (acc: number, r: any) => acc + (r.likesCount || 0),
            0,
          );
          const totalComments = creatorReels.reduce(
            (acc: number, r: any) => acc + (r.commentsCount || 0),
            0,
          );

          const avgViews = Math.round(totalViews / creatorReels.length);
          const avgLikes = Math.round(totalLikes / creatorReels.length);
          const avgComments = Math.round(totalComments / creatorReels.length);
          const er = calculateEngagementRate(
            avgLikes,
            avgComments,
            Number(creator.followers_count || 0),
          );

          let rowIndex = -1;
          if (idIndex !== -1) {
            rowIndex = rows.findIndex((row) => row[idIndex] === creator.id);
          } else {
            const idNum = parseInt(creator.id);
            if (!isNaN(idNum) && idNum > 0 && idNum < rows.length)
              rowIndex = idNum;
          }

          if (rowIndex !== -1) {
            const updates = [
              { col: colIndices.avg_views, val: avgViews },
              { col: colIndices.avg_likes, val: avgLikes },
              { col: colIndices.avg_comments, val: avgComments },
              { col: colIndices.engagement_rate, val: er },
              { col: colIndices.updated, val: new Date().toISOString() },
            ];

            // Try to extract profile pic if missing
            if (colIndices.profile_pic !== -1) {
              let pic = "";
              for (const r of creatorReels) {
                const itemAny = r as any;
                pic =
                  itemAny.ownerProfilePicUrl ||
                  itemAny.userProfilePicUrl ||
                  (itemAny.owner && itemAny.owner.profilePicUrl) ||
                  itemAny.profilePicUrl ||
                  "";
                if (pic) break;
              }
              if (pic) updates.push({ col: colIndices.profile_pic, val: pic });
            }

            updates.forEach((u) => {
              if (u.col !== -1) {
                const colLetter = String.fromCharCode(65 + u.col);
                dataToUpdate.push({
                  range: `${sheetName}!${colLetter}${rowIndex + 1}`,
                  values: [[u.val]],
                });
              }
            });
            updatedCount++;
          }
        }
      }

      if (dataToUpdate.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: "RAW",
            data: dataToUpdate,
          },
        });
      }

      res.json({
        success: true,
        updatedCount,
        totalAttempted: creatorsToScrape.length,
      });
    } catch (error: any) {
      console.error("Bulk scrape error:", error);
      res.status(500).json({
        error: "Failed to bulk update metrics",
        details: error.message,
      });
    }
  });

  app.post("/api/creators/bulk-profile-pics", async (req, res) => {
    try {
      if (!apifyClient) {
        return res
          .status(500)
          .json({ error: "Apify API token not configured" });
      }

      const creators = await readCreatorsFromSheets();
      // Force re-scraping all profile pictures because Instagram CDN links expire after a few days
      const creatorsToUpdate = creators.filter((c) => c.instagram_handle);

      if (creatorsToUpdate.length === 0) {
        return res.json({
          success: true,
          message: "No creators with an instagram handle found",
          count: 0,
        });
      }

      console.log(
        `Bulk updating profile pics for ${creatorsToUpdate.length} creators in a single batch`,
      );

      // Prepare all URLs for a single Apify run
      let directUrls = Array.from(
        new Set(
          creatorsToUpdate.map((c) => {
            const handle = c.instagram_handle
              .replace("@", "")
              .trim()
              .split("?")[0]
              .split("/")[0];
            return `https://www.instagram.com/${handle}/`;
          }),
        ),
      ).filter((url) => url.length > 26 && !url.includes("//", 8)); // ensure valid handles

      console.log("Filtered directUrls:", directUrls);

      if (directUrls.length === 0) {
        return res.json({
          success: true,
          message: "No valid instagram URLs found",
          count: 0,
        });
      }

      // Call Apify Instagram Scraper ONCE for all URLs
      const run = await apifyClient.actor("apify/instagram-scraper").call({
        directUrls,
        resultsLimit: directUrls.length,
        resultsType: "details",
      });

      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();
      console.log(`Apify returned ${items.length} items for bulk update`);

      const sheetName = await getSheetName();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:AZ`,
      });
      const rows = response.data.values || [];
      if (rows.length === 0)
        return res.json({ success: true, updatedCount: 0 });

      const headers = rows[0];
      const normalizedHeaders = headers.map((h) => h.trim().toUpperCase());
      const idIndex = normalizedHeaders.indexOf("ID");
      const picColIndex = headers.findIndex(
        (h) => h.trim().toUpperCase() === "PROFILE PIC",
      );

      if (picColIndex === -1) {
        return res
          .status(500)
          .json({ error: "PROFILE PIC column not found in sheet" });
      }

      const dataToUpdate: { range: string; values: any[][] }[] = [];
      let updatedCount = 0;

      for (const creator of creatorsToUpdate) {
        const handle = creator.instagram_handle
          .replace("@", "")
          .trim()
          .toLowerCase();

        const item = items.find((i: any) => {
          const itemHandle = (
            i.username ||
            i.ownerUsername ||
            i.user?.username ||
            ""
          ).toLowerCase();
          return (
            itemHandle === handle ||
            handle.includes(itemHandle) ||
            itemHandle.includes(handle)
          );
        });

        if (item) {
          const profilePicUrl =
            (item as any).ownerProfilePicUrl ||
            (item as any).userProfilePicUrl ||
            (item as any).owner?.profilePicUrl ||
            (item as any).profilePicUrl ||
            (item as any).user?.profile_pic_url ||
            (item as any).user?.profilePicUrl ||
            "";

          if (profilePicUrl) {
            // Find row index
            let rowIndex = -1;
            if (idIndex !== -1) {
              rowIndex = rows.findIndex((row) => row[idIndex] === creator.id);
            } else {
              const idNum = parseInt(creator.id);
              if (!isNaN(idNum) && idNum > 0 && idNum < rows.length)
                rowIndex = idNum;
            }

            if (rowIndex !== -1) {
              const colLetter = String.fromCharCode(65 + picColIndex);
              dataToUpdate.push({
                range: `${sheetName}!${colLetter}${rowIndex + 1}`,
                values: [[profilePicUrl]],
              });
              updatedCount++;
            }
          }
        }
      }

      if (dataToUpdate.length > 0) {
        console.log(
          `Sending batch update for ${dataToUpdate.length} profile pictures`,
        );
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: "RAW",
            data: dataToUpdate,
          },
        });
      }

      res.json({
        success: true,
        updatedCount,
        totalAttempted: creatorsToUpdate.length,
      });
    } catch (error: any) {
      console.error("Bulk profile pic error:", error);
      res.status(500).json({
        error: "Failed to bulk update profile pictures",
        details: error.message,
      });
    }
  });

  app.post("/api/creators/:id/scrape", async (req, res) => {
    const { id } = req.params;

    if (!apifyClient) {
      return res.status(500).json({ error: "Apify API Token not configured" });
    }

    try {
      const creators = await readCreatorsFromSheets();
      const creator = creators.find((c) => c.id === id);

      if (!creator || !creator.instagram_handle) {
        return res
          .status(404)
          .json({ error: "Creator or Instagram handle not found" });
      }

      const handle = creator.instagram_handle.replace("@", "").trim();

      console.log(`Starting Apify scrape for handle: ${handle}`);

      // Call Apify Instagram Scraper
      const run = await apifyClient.actor("apify/instagram-scraper").call({
        directUrls: [`https://www.instagram.com/${handle}/`],
        resultsLimit: 12, // Fetch more to ensure we get enough reels
        resultsType: "posts",
        searchLimit: 1,
        searchType: "user",
      });

      // Fetch results from the dataset
      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();
      console.log(`Apify returned ${items.length} items for handle ${handle}`);

      // Filter for reels/videos and get the last 6
      // In Apify's output, reels often have type 'Video' or 'Reel'
      const reels = items
        .filter(
          (item: any) =>
            item.type === "Video" ||
            item.type === "Reel" ||
            item.videoPlayCount !== undefined ||
            item.displayUrl?.includes("reel"),
        )
        .slice(0, 6);

      if (reels.length === 0) {
        // Fallback: if no reels found, maybe they are just posts?
        // But user specifically asked for reels.
        return res.status(404).json({
          error: "No reels found for this creator in the latest posts",
        });
      }

      const totalViews = reels.reduce(
        (acc: number, reel: any) => acc + (reel.videoPlayCount || 0),
        0,
      );
      const totalLikes = reels.reduce(
        (acc: number, reel: any) => acc + (reel.likesCount || 0),
        0,
      );
      const totalComments = reels.reduce(
        (acc: number, reel: any) => acc + (reel.commentsCount || 0),
        0,
      );

      // Extract profile pic from any item in the results
      let profilePicUrl = "";
      for (const item of items) {
        profilePicUrl =
          (item as any).ownerProfilePicUrl ||
          (item as any).userProfilePicUrl ||
          (item as any).owner?.profilePicUrl ||
          (item as any).profilePicUrl ||
          (item as any).user?.profile_pic_url ||
          (item as any).user?.profilePicUrl ||
          "";
        if (profilePicUrl) break;
      }

      // If still not found, try to get it from the user object if it exists
      if (!profilePicUrl && (items[0] as any)?.user) {
        profilePicUrl =
          (items[0] as any).user.profile_pic_url ||
          (items[0] as any).user.profilePicUrl ||
          "";
      }

      if (!profilePicUrl && (items[0] as any)?.owner) {
        profilePicUrl =
          (items[0] as any).owner.profilePicUrl ||
          (items[0] as any).owner.profile_pic_url ||
          "";
      }

      console.log(
        `Extracted profile pic URL for ${handle}: ${profilePicUrl ? "Found" : "Not found"}`,
      );
      if (profilePicUrl)
        console.log(`URL: ${profilePicUrl.substring(0, 50)}...`);

      const avgViews = Math.round(totalViews / reels.length);
      const avgLikes = Math.round(totalLikes / reels.length);
      const avgComments = Math.round(totalComments / reels.length);

      const followers = Number(creator.followers_count || 0);
      const engagementRate = calculateEngagementRate(
        avgLikes,
        avgComments,
        followers,
      );

      // Update creator data in sheets
      const updates = {
        avg_views: avgViews,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        engagement_rate: engagementRate,
        profile_pic_url: profilePicUrl,
        last_updated_at: new Date().toISOString(),
      };

      console.log(
        `Updating creator ${id} in sheets with:`,
        JSON.stringify(updates),
      );
      await updateCreatorInSheets(id, updates);

      res.json({
        success: true,
        avg_views: avgViews,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        engagement_rate: engagementRate,
        profile_pic_url: profilePicUrl,
        reels_count: reels.length,
        reels: reels.map((r: any) => ({
          url: r.url,
          views: r.videoPlayCount,
          likes: r.likesCount,
          comments: r.commentsCount,
        })),
      });
    } catch (error: any) {
      console.error("Scraping error:", error);
      res.status(500).json({
        error: "Failed to scrape Instagram data",
        details: error.message,
      });
    }
  });

  app.post("/api/creators", async (req, res) => {
    try {
      const newCreator = {
        ...req.body,
        id: uuidv4(),
        followers_count: Number(req.body.followers_count || 0),
        avg_likes: Number(req.body.avg_likes || 0),
        avg_comments: Number(req.body.avg_comments || 0),
        last_updated_at: new Date().toISOString(),
      };

      newCreator.influencer_size = calculateInfluencerSize(
        newCreator.followers_count,
      );
      newCreator.engagement_rate = calculateEngagementRate(
        newCreator.avg_likes,
        newCreator.avg_comments,
        newCreator.followers_count,
      );

      // Try to fetch profile pic automatically if handle is provided
      if (newCreator.instagram_handle && apifyClient) {
        try {
          const handle = newCreator.instagram_handle.replace("@", "").trim();
          const run = await apifyClient.actor("apify/instagram-scraper").call({
            directUrls: [`https://www.instagram.com/${handle}/`],
            resultsLimit: 1,
            resultsType: "details",
          });
          const { items } = await apifyClient
            .dataset(run.defaultDatasetId)
            .listItems();
          for (const item of items) {
            const pic =
              (item as any).ownerProfilePicUrl ||
              (item as any).userProfilePicUrl ||
              (item as any).owner?.profilePicUrl ||
              (item as any).profilePicUrl ||
              (item as any).user?.profile_pic_url ||
              (item as any).user?.profilePicUrl ||
              ((item as any).user &&
                ((item as any).user.profile_pic_url ||
                  (item as any).user.profilePicUrl)) ||
              ((item as any).owner &&
                ((item as any).owner.profilePicUrl ||
                  (item as any).owner.profile_pic_url));
            if (pic) {
              newCreator.profile_pic_url = pic;
              break;
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile pic for new creator:", err);
        }
      }

      await writeCreatorToSheets(newCreator);
      res.status(201).json(newCreator);
    } catch (error) {
      res.status(500).json({ error: "Failed to add creator" });
    }
  });

  app.patch("/api/creators/:id", async (req, res) => {
    try {
      const creators = await readCreatorsFromSheets();
      const existing = creators.find((c) => c.id === req.params.id);
      if (!existing)
        return res.status(404).json({ error: "Creator not found" });

      const updates = {
        ...req.body,
        last_updated_at: new Date().toISOString(),
      };

      // Recalculate if metrics changed
      const followers = Number(
        updates.followers_count ?? existing.followers_count,
      );
      const likes = Number(updates.avg_likes ?? existing.avg_likes);
      const comments = Number(updates.avg_comments ?? existing.avg_comments);

      if (updates.followers_count !== undefined) {
        updates.influencer_size = calculateInfluencerSize(followers);
      }

      if (
        updates.avg_likes !== undefined ||
        updates.avg_comments !== undefined ||
        updates.followers_count !== undefined
      ) {
        updates.engagement_rate = calculateEngagementRate(
          likes,
          comments,
          followers,
        );
      }

      await updateCreatorInSheets(req.params.id, updates);
      res.json({ ...existing, ...updates });
    } catch (error) {
      res.status(500).json({ error: "Failed to update creator" });
    }
  });

  app.post("/api/export", (req, res) => {
    try {
      const { creators } = req.body;
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(creators);
      utils.book_append_sheet(wb, ws, "Shortlist");

      const buf = write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=shortlist.xlsx",
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buf);
    } catch (error) {
      res.status(500).json({ error: "Failed to export" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

const app = await startServer();

if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
