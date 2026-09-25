import { OurApp } from '../types';

const FIRESTORE_QUERY_URL =
  'https://firestore.googleapis.com/v1/projects/gen-lang-client-0686392114/databases/ai-studio-khutbahcraft-519fc26c-c7b7-46e1-950b-9ad5d5b26399/documents:runQuery';

const CACHE_KEY = 'adhkar_our_apps_cache_v1';
const CACHE_AGE_MS = 10 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12000;

const DEFAULT_APPS: OurApp[] = [
  {
    id: 'adhkar-muslim',
    name: 'أذكار المسلم - الورد اليومي',
    description: 'أذكار الصباح والمساء، أدعية مأثورة، أسماء الله الحسنى، رقية، تسبيح، قرآن وورد يومي.',
    packageName: 'com.muslim.adhkar.wird',
    category: 'أذكار وأدعية',
  },
];

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
}

function parseFieldValue(value: FirestoreValue | undefined): string {
  if (!value) return '';
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return value.integerValue;
  if (value.doubleValue !== undefined) return String(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue ? 'true' : 'false';
  return '';
}

function parseFirestoreDoc(document: { name?: string; fields?: Record<string, FirestoreValue> }): OurApp | null {
  if (!document || !document.fields) return null;
  const f = document.fields;
  const rawName =
    parseFieldValue(f.name) || parseFieldValue(f.appName) || parseFieldValue(f.title);
  if (!rawName) return null;
  const id = document.name ? document.name.split('/').pop() || rawName : rawName;
  const iconUrl = parseFieldValue(f.iconUrl) || parseFieldValue(f.icon) || parseFieldValue(f.logo);
  const storeUrl =
  parseFieldValue(f.storeUrl) ||
  parseFieldValue(f.playStoreUrl) ||
  parseFieldValue(f.androidUrl) ||
  parseFieldValue(f.url) ||
  parseFieldValue(f.link);
  const packageName = parseFieldValue(f.packageName) || parseFieldValue(f.package);
  return {
    id,
    name: rawName,
    description:
      parseFieldValue(f.description) ||
      parseFieldValue(f.desc) ||
      parseFieldValue(f.details) ||
      undefined,
    iconUrl: iconUrl || undefined,
    storeUrl: storeUrl || undefined,
    packageName: packageName || undefined,
    category: parseFieldValue(f.category) || undefined,
    createdAt: parseFieldValue(f.createdAt) || undefined,
  };
}

export function loadAppsCache(): { apps: OurApp[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.apps) || typeof parsed.fetchedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveAppsCache(apps: OurApp[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ apps, fetchedAt: Date.now() }));
  } catch {
    // storage full/blocked - ignore
  }
}

async function fetchAppsFromFirestore(): Promise<OurApp[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(FIRESTORE_QUERY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'apps' }],
          orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Firestore responded ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload)) throw new Error('Unexpected Firestore payload');
    const apps = payload
      .map((entry: { document?: { name?: string; fields?: Record<string, FirestoreValue> } }) =>
        entry && entry.document ? parseFirestoreDoc(entry.document) : null
      )
      .filter((app): app is OurApp => app !== null);
    return apps;
  } finally {
    clearTimeout(timer);
  }
}

export function storeUrlOf(app: OurApp): string | undefined {
  if (app.storeUrl) return app.storeUrl;
  if (app.packageName) return `https://play.google.com/store/apps/details?id=${app.packageName}`;
  return undefined;
}

export interface OurAppsResult {
  apps: OurApp[];
  fromCache: boolean;
  fetchedAt: number | null;
}

export async function getOurApps(options?: { force?: boolean }): Promise<OurAppsResult> {
  const cached = loadAppsCache();
  const now = Date.now();
  const force = Boolean(options?.force);
  if (!force && cached && now - cached.fetchedAt < CACHE_AGE_MS) {
    return { apps: cached.apps, fromCache: true, fetchedAt: cached.fetchedAt };
  }
  try {
    const fresh = await fetchAppsFromFirestore();
    if (fresh.length > 0) {
      saveAppsCache(fresh);
      return { apps: fresh, fromCache: false, fetchedAt: now };
    }
  } catch {
    // offline or error - fall through to stale cache / defaults
  }
  if (cached) {
    return { apps: cached.apps, fromCache: true, fetchedAt: cached.fetchedAt };
  }
  return { apps: DEFAULT_APPS, fromCache: true, fetchedAt: null };
}