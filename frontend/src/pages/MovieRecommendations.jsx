import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Film, Star, ExternalLink, Play, Sparkles, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Interview Motivation',
  'Startup',
  'Leadership',
  'Technology',
  'Business',
  'Self Growth'
];

export default function MovieRecommendations() {
  const [movies, setMovies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'All' ? '/movies/recommendations' : `/movies/recommendations?category=${encodeURIComponent(selectedCategory)}`;
    api.get(url)
      .then((res) => setMovies(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-semibold text-pink-400">
          <Film className="w-3.5 h-3.5" /> Career Motivation Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white">Motivational Career Movie System</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Discover hand-curated motivational tech, startup, and leadership films tailored to fuel your ambition, build resilience, and spark inspiration.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400">Loading movie recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ y: -6 }}
              className="glass-card border border-slate-800/80 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-slate-950">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> {movie.imdb_rating}
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-pink-300 font-semibold uppercase">
                  {movie.category}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{movie.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{movie.genre} • {movie.runtime}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-pink-400 block mb-1">Why Watch:</strong>
                    {movie.recommendation_reason}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">{movie.streaming_availability}</span>
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> Trailer
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
