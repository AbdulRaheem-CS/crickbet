"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import HeroSlider from '@/components/public/HeroSlider';
import { TOPICS, TABS, slugify, findArticleBySlug } from '../topicsData';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [searchQuery, setSearchQuery] = useState('');

  // Look up the article across all categories
  const found = findArticleBySlug(slug);

  // Article not found — show 404-style message
  if (!found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#1a4f8e' }}>
        <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-white/70 mb-8">We couldn&apos;t find the article you were looking for.</p>
        <Link href="/topics" className="px-6 py-3 rounded-lg font-semibold text-black" style={{ background: '#7FFF00' }}>
          ← Back to Help Topics
        </Link>
      </div>
    );
  }

  const { categoryKey, category, article } = found;

  // Related articles: other articles in the same category (up to 6, excluding current)
  const relatedArticles = category.articles
    .filter((a) => slugify(a.title) !== slug)
    .slice(0, 6);

  return (
    <div className="m-0 p-0" style={{ background: '#1a4f8e' }}>

      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Header area: Greeting + Search ── */}
      <div className="pt-8 pb-4 text-center" style={{}}>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Good Day!</h1>
        <p className="text-lg md:text-xl text-white mb-5">
          How can we <span className="text-[#7FFF00]">help you</span> today?
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our help articles..."
              className="w-full py-3 px-5 pr-12 rounded-full bg-white text-gray-700 placeholder-gray-500 text-[15px] focus:outline-none shadow-md"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="w-full" style={{  }}>
        <div className="max-w-4xl mx-auto px-4 pt-5">
          <div className="rounded-lg border border-[#2e6aaf] overflow-hidden" style={{ borderColor: '#61d81d', marginBottom: '1rem' }}>
            <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const isActive = tab === categoryKey;
                return (
                  <Link
                    key={tab}
                    href="/topics"
                    className="relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0"
                    style={{ color: isActive ? '#7FFF00' : 'rgba(255,255,255,0.85)' }}
                  >
                    {TOPICS[tab].label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Article Content ── */}
      <div className="w-full" style={{ background: '#1a4f8e' }}>
        <div className="max-w-4xl mx-auto px-6 md:px-8 pt-8 pb-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/topics" className="hover:text-[#7FFF00] transition">Help Topics</Link>
            <span>›</span>
            <Link href="/topics" className="hover:text-[#7FFF00] transition">{category.label}</Link>
            <span>›</span>
            <span className="text-white/70 truncate">{article.title}</span>
          </div>

          {/* Category badge */}
          <div className="mb-4">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: '#0e2f57', color: '#7FFF00', border: '1px solid #2e6aaf' }}
            >
              {category.label}
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-8">
            {article.title}
          </h1>

          {/* Divider */}
          <div className="w-full h-px mb-8" style={{ background: '#2e6aaf' }} />

          {/* Article Content */}
          <div className="text-white/85 text-[15px] leading-[1.9] space-y-4">
            {article.content.split('\n').map((para, i) =>
              para.trim() ? <p key={i}>{para.trim()}</p> : null
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px mt-12 mb-10" style={{ background: '#2e6aaf' }} />

          {/* ── Related Articles ── */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-lg mb-5">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <ul>
                  {relatedArticles.slice(0, Math.ceil(relatedArticles.length / 2)).map((rel, i) => (
                    <li key={i}>
                      <Link
                        href={`/topics/${slugify(rel.title)}`}
                        className="flex items-start gap-2.5 py-3 text-white hover:text-[#7FFF00] transition"
                      >
                        <span className="text-[#7FFF00] text-sm mt-px shrink-0">›</span>
                        <span className="text-[14px] leading-relaxed">{rel.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul>
                  {relatedArticles.slice(Math.ceil(relatedArticles.length / 2)).map((rel, i) => (
                    <li key={i}>
                      <Link
                        href={`/topics/${slugify(rel.title)}`}
                        className="flex items-start gap-2.5 py-3 text-white hover:text-[#7FFF00] transition"
                      >
                        <span className="text-[#7FFF00] text-sm mt-px shrink-0">›</span>
                        <span className="text-[14px] leading-relaxed">{rel.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/topics"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition"
              style={{ background: '#133d6e', color: '#7FFF00', border: '1px solid #2e6aaf', marginBottom: '2rem' }}
            >
              ← Back to Help Topics
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}


