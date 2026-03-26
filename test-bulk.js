import { google } from "googleapis";
import { ApifyClient } from 'apify-client';
import dotenv from "dotenv";
dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

const SHEET_NAME = "DATA_BASE";

const INTERNAL_TO_SHEET_MAP = {
  "name": "NAME",
  "profile_link": "Profile Link",
  "instagram_handle": "INSTAGRAM_HANDLE",
  "profile_pic_url": "PROFILE PIC"
};

const SHEET_TO_INTERNAL_MAP = Object.entries(INTERNAL_TO_SHEET_MAP).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const headers = rows[0];
  
  return rows.slice(1).map((row, rowIndex) => {
    const obj = { id: String(rowIndex + 1) };
    headers.forEach((header, index) => {
      const fieldName = SHEET_TO_INTERNAL_MAP[header] || header.toLowerCase().replace(/ /g, "_");
      obj[fieldName] = row[index] || "";
    });

    if (obj.profile_link && !obj.instagram_handle) {
      try {
        const url = new URL(obj.profile_link);
        const path = url.pathname.split('/').filter(Boolean);
        if (path[0]) {
          obj.instagram_handle = path[0].split('?')[0];
        }
      } catch (e) {}
    }
    return obj;
  });
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:AZ`,
  });

  const rows = response.data.values || [];
  const creators = rowsToObjects(rows);
  
  const creatorsToUpdate = creators.filter(c => c.instagram_handle && !c.profile_pic_url);
  console.log(`Creators to update count: ${creatorsToUpdate.length}`);
  if(creatorsToUpdate.length === 0) return;

  const directUrls = creatorsToUpdate.map(c => {
    const handle = c.instagram_handle.replace('@', '').trim();
    return `https://www.instagram.com/${handle}/`;
  });

  console.log("Direct URLs:");
  console.log(directUrls);

  try {
    const run = await apifyClient.actor('apify/instagram-scraper').call({
      directUrls,
      resultsLimit: creatorsToUpdate.length,
      resultsType: 'details',
    });
    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log("Dataset items length:", dataset.items.length);
    if(dataset.items.length > 0) {
      console.log("First item sample profile pic keys:", Object.keys(dataset.items[0]).filter(k => k.toLowerCase().includes('pic')));
      console.log("First item username/handle:", dataset.items[0].username, dataset.items[0].ownerUsername);
    }
    console.log("Success:", run);
  } catch (err) {
    console.error("Failed Apify call:", err.message);
    if(err.data) console.error(JSON.stringify(err.data, null, 2));
    if(err.response) console.error(err.response.data);
  }
}
main();
