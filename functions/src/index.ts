import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

admin.initializeApp();
const db = admin.firestore();

const GAZETTE_URL = 'https://www.gazette.gov.mv';

interface GazetteEntry {
  title: string;
  url: string;
  date: string;
  category: 'Legal' | 'Administrative' | 'Financial' | 'Regulatory' | 'Other';
}

function determineCategory(title: string) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('law') || lowerTitle.includes('regulation')) return 'Legal';
  if (lowerTitle.includes('financial') || lowerTitle.includes('budget')) return 'Financial';
  if (lowerTitle.includes('administrative')) return 'Administrative';
  if (lowerTitle.includes('regulatory')) return 'Regulatory';
  return 'Other';
}

async function fetchGazettePage(): Promise<GazetteEntry[]> {
  try {
    const response = await fetch(GAZETTE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);
    const entries: GazetteEntry[] = [];

    $('.gazette-item').each((_, element) => {
      const title = $(element).find('.gazette-title').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const date = $(element).find('.gazette-date').text().trim();
      const category = determineCategory(title);

      entries.push({ title, url, date, category });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching gazette data:', error);
    return [];
  }
}

export const fetchGazetteData = functions.https.onCall(async (data, context) => {
  try {
    const entries = await fetchGazettePage();
    let newEntries = 0;

    for (const entry of entries) {
      // Check if task already exists
      const snapshot = await db.collection('tasks')
        .where('source', '==', `${GAZETTE_URL}${entry.url}`)
        .limit(1)
        .get();

      if (snapshot.empty) {
        // Add new task
        await db.collection('tasks').add({
          title: entry.title,
          description: `Gazette notice from ${entry.date}. Source URL: ${GAZETTE_URL}${entry.url}`,
          category: entry.category,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          preSubmissionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'Medium',
          status: 'Pending',
          source: `${GAZETTE_URL}${entry.url}`,
          hasInfoSession: false,
          requiresRegistration: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        newEntries++;
      }
    }

    return { newEntries };
  } catch (error) {
    console.error('Error in fetchGazetteData:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch gazette data');
  }
});