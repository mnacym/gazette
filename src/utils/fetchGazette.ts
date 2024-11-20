import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { Task, Category } from '../types';

interface GazetteEntry {
  title: string;
  url: string;
  date: string;
  category: Category;
}

const GAZETTE_URL = 'https://www.gazette.gov.mv';

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
      
      // Categorize based on title keywords
      let category: Category = 'Other';
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

function convertToTasks(entries: GazetteEntry[]): Task[] {
  return entries.map((entry) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: entry.title,
    description: `Gazette notice from ${entry.date}. Source URL: ${GAZETTE_URL}${entry.url}`,
    category: entry.category,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default deadline: 1 week
    priority: 'Medium',
    status: 'Pending',
    source: `${GAZETTE_URL}${entry.url}`,
  }));
}

async function main() {
  const entries = await fetchGazettePage();
  const tasks = convertToTasks(entries);
  writeFileSync('src/data/gazette-tasks.json', JSON.stringify(tasks, null, 2));
  console.log(`Successfully extracted ${tasks.length} tasks from the gazette`);
}

main();