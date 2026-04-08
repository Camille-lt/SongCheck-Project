"use client";

import { Gauge, Music2, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DEFAULT_SONGS,
  EXTRA_KNOWN_ARTISTS,
  SONG_CATALOG,
} from "@/data/musicCatalog";

type AnalysisResponse = {
  genre_dominant: string;
  energy_score: number;
  similar_artists: string[];
};

const MAX_SUGGESTIONS = 8;

const KNOWN_ARTISTS = Array.from(
  new Set(SONG_CATALOG.map((entry) => entry.split(" - ")[0].trim().toLowerCase())),
);

const ARTIST_DICTIONARY = new Set([...KNOWN_ARTISTS, ...EXTRA_KNOWN_ARTISTS]);
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [songs, setSongs] = useState<string[]>([]);
  const [songInput, setSongInput] = useState("");
  const [maxSongs, setMaxSongs] = useState<5 | 10 | 15>(5);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const gaugeValue = useMemo(() => {
    if (!result) return 0;
    return Math.max(0, Math.min(100, result.energy_score));
  }, [result]);

  const filteredSuggestions = useMemo(() => {
    const input = songInput.trim().toLowerCase();
    if (!input) return [];
    return SONG_CATALOG.filter((entry) => {
      const alreadyAdded = songs.some(
        (addedSong) => addedSong.toLowerCase() === entry.toLowerCase(),
      );
      return !alreadyAdded && entry.toLowerCase().includes(input);
    }).slice(0, MAX_SUGGESTIONS);
  }, [songInput, songs]);

  async function analyzeVibe() {
    if (songs.length === 0) {
      setError("Ajoute au moins une musique ou un artiste.");
      return;
    }

    setStarted(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songs }),
      });

      if (!response.ok) {
        throw new Error("API unavailable. Verify backend is running.");
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function normalizeSongInput(rawValue: string): string {
    const cleaned = rawValue.trim().replace(/\s+/g, " ");
    if (!cleaned.includes("-")) return cleaned;

    const [leftRaw, ...rest] = cleaned.split("-");
    const rightRaw = rest.join("-");
    const left = leftRaw.trim();
    const right = rightRaw.trim();

    if (!left || !right) return cleaned;

    const rightIsKnownArtist = ARTIST_DICTIONARY.has(right.toLowerCase());
    if (rightIsKnownArtist) {
      return `${right} - ${left}`;
    }

    return `${left} - ${right}`;
  }

  function isValidSongEntry(value: string): boolean {
    if (!value.includes("-")) return false;
    const [artistRaw, ...titleParts] = value.split("-");
    const artist = artistRaw.trim();
    const title = titleParts.join("-").trim();
    return artist.length >= 2 && title.length >= 2;
  }

  function addSong(forcedValue?: string) {
    const rawInput = typeof forcedValue === "string" ? forcedValue : songInput;
    const cleaned = rawInput.trim();
    if (!cleaned) return;
    if (songs.length >= maxSongs) {
      setError(`Tu as atteint la limite de ${maxSongs} morceaux.`);
      return;
    }

    const normalized = normalizeSongInput(cleaned);
    if (!isValidSongEntry(normalized)) {
      setError(
        "Entre un artiste et une chanson valides au format: Artiste - Titre.",
      );
      return;
    }

    const alreadyExists = songs.some(
      (song) => song.toLowerCase() === normalized.toLowerCase(),
    );
    if (alreadyExists) {
      setError(
        `Ce morceau existe deja dans la liste: "${normalized}".`,
      );
      setSongInput(normalized);
      return;
    }

    setSongs((prev) => [...prev, normalized]);
    setError("");
    setSongInput("");
    setShowSuggestions(false);
  }

  function removeSong(indexToRemove: number) {
    setSongs((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function quitSession() {
    setSongInput("");
    setSongs([]);
    setResult(null);
    setError("");
    setLoading(false);
    setStarted(false);
  }

  if (!started) {
    return (
      <main className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-5xl rounded-3xl border border-white/15 bg-white/[0.04] p-8 shadow-[0_0_120px_rgba(255,79,0,0.08)] backdrop-blur-xl md:p-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-[0.18em] text-white/70 uppercase">
              <Music2 size={14} className="text-[#FF6A1A]" />
              SongCheck Experience
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
              SongCheck!
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
              Identifie instantanement l&apos;ADN musical de ta playlist, avec un
              scoring energie et des recommandations IA.
            </p>
            <button
              onClick={analyzeVibe}
              className="group inline-flex items-center gap-3 rounded-full border border-[#FF6A1A] bg-[#FF6A1A] px-10 py-5 text-lg font-medium text-black shadow-[0_0_0_rgba(255,106,26,0)] transition duration-200 hover:bg-[#ff7a33] hover:shadow-[0_10px_30px_rgba(255,106,26,0.35)] active:bg-[#e65b10]"
            >
              <WandSparkles size={20} />
              Analyser ma Vibe
            </button>
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/45">
          © 2026 Camille Lebigot
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs tracking-[0.18em] text-white/70 uppercase">
            <Music2 size={14} className="text-[#FF6A1A]" />
            Ma Playlist
          </div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={quitSession}
                className="rounded-xl border border-[#FF6A1A] bg-black px-3 py-2 text-xs font-semibold text-[#FF6A1A] transition duration-200 hover:bg-[#1a0b03] hover:text-[#ff8f52] hover:shadow-[0_8px_24px_rgba(255,106,26,0.25)] active:bg-[#120802]"
              >
                Quitter
              </button>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-white/60">Max morceaux :</span>
            <select
              value={maxSongs}
              onChange={(event) => {
                const nextMax = Number(event.target.value) as 5 | 10 | 15;
                setMaxSongs(nextMax);
                setSongs((prev) => prev.slice(0, nextMax));
              }}
              className="rounded-lg border border-[#FF6A1A] bg-black px-2 py-1 text-xs text-[#FF6A1A] outline-none transition duration-200 hover:bg-[#140700] hover:shadow-[0_6px_18px_rgba(255,106,26,0.2)] focus:bg-[#140700]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
            <span className="text-xs text-white/45">
              ({songs.length}/{maxSongs})
            </span>
          </div>
          <div className="mb-4 flex gap-2">
            <div className="relative w-full">
              <input
                value={songInput}
                onChange={(event) => {
                  setSongInput(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSong();
                  }
                }}
                placeholder="Ex: Radiohead - Creep ou Kanye West"
                className="w-full rounded-xl border border-[#FF6A1A] bg-black px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-white/40 hover:bg-[#0d0d0d] focus:border-[#FF6A1A] focus:shadow-[0_0_0_2px_rgba(255,106,26,0.22)]"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-20 mt-2 max-h-44 overflow-y-auto rounded-xl border border-[#FF6A1A] bg-black/95 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
                  {filteredSuggestions.map((entry) => (
                    <button
                      key={entry}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        addSong(entry);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/85 transition duration-150 hover:bg-[#1b0a02] hover:text-[#FF6A1A]"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => addSong()}
              disabled={songs.length >= maxSongs}
              className="rounded-xl border border-[#FF6A1A] bg-[#FF6A1A] px-4 py-3 text-sm font-semibold text-black shadow-[0_0_0_rgba(255,106,26,0)] transition duration-200 hover:bg-[#ff7a33] hover:shadow-[0_10px_24px_rgba(255,106,26,0.35)] active:bg-[#e65b10] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#FF6A1A] disabled:hover:shadow-none"
            >
              Ajouter
            </button>
          </div>
          <ul className="space-y-3">
            {songs.map((song, index) => (
              <li
                key={`${song}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80"
              >
                <span>{song}</span>
                <button
                  onClick={() => removeSong(index)}
                  className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/70 transition duration-200 hover:border-[#FF6A1A] hover:bg-[#1a0b03] hover:text-[#ff8f52] active:bg-[#120802]"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={analyzeVibe}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF6A1A] bg-[#FF6A1A] px-4 py-3 text-sm font-semibold text-black shadow-[0_0_0_rgba(255,106,26,0)] transition duration-200 hover:bg-[#ff7a33] hover:shadow-[0_10px_24px_rgba(255,106,26,0.35)] active:bg-[#e65b10] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#FF6A1A] disabled:hover:shadow-none"
          >
            <Sparkles size={16} />
            {loading ? "Analyse en cours..." : "Lancez l'analyse"}
          </button>
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs tracking-[0.18em] text-white/70 uppercase">
            <Gauge size={14} className="text-[#FF6A1A]" />
            Resultats IA
          </div>

          {loading && (
            <p className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              L&apos;IA analyse les morceaux...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-xl border border-[#FF6A1A]/60 bg-[#FF6A1A]/10 p-4 text-sm text-[#FFC7A3]">
              {error}
            </p>
          )}

          {!loading && !error && result && (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs tracking-[0.14em] text-white/50 uppercase">
                  Genre Dominant
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {result.genre_dominant}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs tracking-[0.14em] text-white/50 uppercase">
                  Energy Score
                </p>
                <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/20 bg-black/60">
                  <div
                    className="h-full bg-[#FF6A1A] transition-all duration-500"
                    style={{ width: `${gaugeValue}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/80">{gaugeValue}/100</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs tracking-[0.14em] text-white/50 uppercase">
                  3 Artistes Similaires
                </p>
                <ul className="mt-2 space-y-2 text-white/85">
                  {result.similar_artists.map((artist) => (
                    <li key={artist}>- {artist}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <p className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              Lance l&apos;analyse pour voir les jauges orange et recommandations.
            </p>
          )}
        </section>
      </div>
      <p className="mt-8 text-center text-xs text-white/45">© 2026 Camille Lebigot</p>
    </main>
  );
}
