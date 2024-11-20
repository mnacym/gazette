// @ts-check
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const GAZETTE_URL = 'https://www.gazette.gov.mv';

/**
 * @typedef {'Legal' | 'Administrative' | 'Financial' | 'Regulatory' | 'Other'} Category
 * @typedef {'High' | 'Medium' | 'Low'} Priority
 * @typedef {'Pending' | 'In Progress' | 'Completed' | 'Overdue'} Status
 * 
 * @typedef {Object} GazetteEntry
 * @property {string} title
 * @property {string} url
 * @property {string} date
 * @property {Category} category
 */

/**
 * Fetches gazette entries from the website
 * @returns {Promise<GazetteEntry[]>}
 */
async function fetchGazettePage() {
  try {
    const response = await fetch(GAZETTE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);
    /** @type {GazetteEntry[]} */
    const entries = [];

    $('.gazette-item').each((_, element) => {
      const title = $(element).find('.gazette-title').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const date = $(element).find('.gazette-date').text().trim();
      
      /** @type {Category} */
      let category = 'Other';
      if (title.toLowerCase().includes('law') || title.toLowerCase().includes('regulation')) {
        category = 'Legal';
      } else if (title.toLowerCase().includes('financial') || title.toLowerCase().includes('budget')) {
        category = 'Financial';
      } else if (title.toLowerCase().includes('administrative')) {
        category = 'Administrative';
      } else if (title.toLowerCase().includes('regulatory')) {
        category = 'Regulatory';
      }

      entries.push({ title, url, date, category });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching gazette data:', error);
    return [];
  }
}

/**
 * Converts gazette entries to tasks
 * @param {GazetteEntry[]} entries
 */
function convertToTasks(entries) {
  return entries.map((entry) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: entry.title,
    description: `Gazette notice from ${entry.date}. Source URL: ${GAZETTE_URL}${entry.url}`,
    category: entry.category,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default deadline: 1 week
    priority: /** @type {Priority} */ ('Medium'),
    status: /** @type {Status} */ ('Pending'),
    source: `${GAZETTE_URL}${entry.url}`,
  }));
}

async function main() {
  try {
    const entries = await fetchGazettePage();
    const tasks = convertToTasks(entries);
    
    // Create data directory if it doesn't exist
    const dataDir = 'src/data';
    mkdirSync(dataDir, { recursive: true });
    
    // Write tasks to JSON file
    writeFileSync(`${dataDir}/gazette-tasks.json`, JSON.stringify(tasks, null, 2));
    console.log(`Successfully extracted ${tasks.length} tasks from the gazette`);
  } catch (error) {
    console.error('Failed to process gazette data:', error);
    process.exit(1);
  }
}

main();