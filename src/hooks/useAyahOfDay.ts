/**
 * useAyahOfDay
 *
 * Fetches a random Ayah (verse) from the Al Quran Cloud API.
 * A new verse is fetched each calendar day; the result is cached in
 * localStorage keyed by date so the app stays offline-capable and
 * doesn't hammer the API on every re-render.
 *
 * API: https://alquran.cloud/api  (free, no key needed)
 * Endpoint: GET /ayah/{reference}/editions/quran-uthmani,en.asad
 */

import { useState, useEffect } from 'react';

export interface AyahOfDay {
  arabic: string;
  translation: string;
  transliteration: string;
  reference: string; // e.g. "Al-Baqarah 2:255"
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

const CACHE_KEY = 'salaf-ayah-of-day';
const TOTAL_AYAHS = 6236;

// 114 surahs: use surah/ayah notation to spread across the Quran
// We deterministically pick a verse index based on the day of the year.
function getDailyAyahNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  // Offset by a prime to avoid low-numbered ayahs every New Year
  return ((dayOfYear * 17 + 43) % TOTAL_AYAHS) + 1;
}

interface CachedAyah {
  date: string;
  ayah: AyahOfDay;
}

export function useAyahOfDay() {
  const [ayah, setAyah] = useState<AyahOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    // Check local cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedAyah = JSON.parse(cached);
        if (parsed.date === today && parsed.ayah) {
          setAyah(parsed.ayah);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Fetch from API
    const ayahNumber = getDailyAyahNumber();
    // Fetch Arabic + English translation (Asad) + English transliteration
    const url = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.asad,en.transliteration`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        const editions = data?.data;
        if (!Array.isArray(editions) || editions.length < 2) {
          throw new Error('Unexpected API response');
        }

        const arabicEd = editions[0];
        const translationEd = editions[1];
        const translitEd = editions[2];

        const result: AyahOfDay = {
          arabic: arabicEd.text,
          translation: translationEd.text,
          transliteration: translitEd?.text || '',
          reference: `${arabicEd.surah?.englishName} ${arabicEd.surah?.number}:${arabicEd.numberInSurah}`,
          surahName: arabicEd.surah?.englishName || '',
          surahNumber: arabicEd.surah?.number || 0,
          ayahNumber: arabicEd.numberInSurah || 0,
        };

        setAyah(result);
        // Cache for today
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, ayah: result }));
      })
      .catch((err) => {
        console.warn('Ayah API error, using fallback:', err);
        // Use a fallback verse so the UI never breaks
        const fallback: AyahOfDay = {
          arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
          translation: 'Indeed, with hardship will be ease.',
          transliteration: 'Inna ma\'a al-\'usri yusraa',
          reference: 'Ash-Sharh 94:6',
          surahName: 'Ash-Sharh',
          surahNumber: 94,
          ayahNumber: 6,
        };
        setAyah(fallback);
        setError('Could not load today\'s verse. Showing a favourite verse.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { ayah, loading, error };
}
