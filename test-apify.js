import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function main() {
  try {
    const directUrls = ['https://www.instagram.com/microsoft/'];
    const resultsLimit = 1;

    console.log("Calling Apify...");
    const run = await apifyClient.actor('apify/instagram-scraper').call({
      directUrls,
      resultsLimit: resultsLimit,
      resultsType: 'details',
    });
    console.log("Success:", run);
  } catch (error) {
    console.error("Error calling Apify:");
    console.error(error.message);
    if (error.data) {
        console.error("Error data:", error.data);
    }
  }
}

main();
