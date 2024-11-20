import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Database setup
const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { tasks: [] });

// Constants
const GAZETTE_URL = 'https://www.gazette.gov.mv';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock gazette data for testing (since the actual website might be inaccessible)
const mockGazetteData = [
  {
    title: "Public Notice: Registration for Government Services",
    url: "/notices/2024/03/registration",
    date: "2024-03-15",
    category: "Administrative"
  },
  {
    title: "New Financial Regulations 2024",
    url: "/regulations/2024/03/financial",
    date: "2024-03-14",
    category: "Financial"
  },
  {
    title: "Legal Framework Updates",
    url: "/legal/2024/03/framework",
    date: "2024-03-13",
    category: "Legal"
  }
];

// Gazette fetching function
async function fetchGazetteData() {
  try {
    // In production, uncomment the following code and remove the mock data
    /*
    const response = await fetch(GAZETTE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);
    const entries = [];

    $('.gazette-item').each((_, element) => {
      const title = $(element).find('.gazette-title').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const date = $(element).find('.gazette-date').text().trim();
      
      let category = determineCategory(title);
      entries.push({ title, url, date, category });
    });
    */

    // Using mock data for development
    const entries = mockGazetteData.map(entry => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: entry.title,
      description: `Gazette notice from ${entry.date}. Source URL: ${GAZETTE_URL}${entry.url}`,
      category: entry.category,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      preSubmissionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Pending',
      source: `${GAZETTE_URL}${entry.url}`,
      hasInfoSession: Math.random() > 0.5,
      requiresRegistration: Math.random() > 0.5,
    }));

    return entries;
  } catch (error) {
    console.error('Error fetching gazette data:', error);
    throw new Error('Failed to fetch gazette data');
  }
}

function determineCategory(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('law') || lowerTitle.includes('regulation')) return 'Legal';
  if (lowerTitle.includes('financial') || lowerTitle.includes('budget')) return 'Financial';
  if (lowerTitle.includes('administrative')) return 'Administrative';
  if (lowerTitle.includes('regulatory')) return 'Regulatory';
  return 'Other';
}

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/refresh-gazette', async (req, res) => {
  try {
    const gazetteEntries = await fetchGazetteData();
    await db.read();
    
    // Add new entries while preserving existing ones
    const existingUrls = new Set(db.data.tasks.map(task => task.source));
    const newEntries = gazetteEntries.filter(entry => !existingUrls.has(entry.source));
    
    db.data.tasks = [...db.data.tasks, ...newEntries];
    await db.write();
    
    res.json({ message: 'Gazette data refreshed successfully', newEntries: newEntries.length });
  } catch (error) {
    console.error('Error refreshing gazette data:', error);
    res.status(500).json({ error: 'Failed to refresh gazette data' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    await db.read();
    const task = {
      ...req.body,
      id: Date.now().toString(),
      status: 'Pending',
    };
    db.data.tasks.push(task);
    await db.write();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    await db.read();
    const { id } = req.params;
    const taskIndex = db.data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.data.tasks[taskIndex] = {
      ...db.data.tasks[taskIndex],
      ...req.body,
    };
    
    await db.write();
    res.json(db.data.tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.read();
    const { id } = req.params;
    db.data.tasks = db.data.tasks.filter(t => t.id !== id);
    await db.write();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});