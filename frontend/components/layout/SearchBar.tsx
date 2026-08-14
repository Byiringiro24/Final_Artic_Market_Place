'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { get } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
}

export default function SearchBar() {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    get<SearchSuggestion[]>('/products', { search: debouncedQuery, limit: '5' })
      .then((res) => {
        setSuggestions(Array.isArray(res.data) ? res.data : []);
        setIsOpen(true);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    const params = new URLSearchParams({ search: query });
    if (category !== 'all') params.set('category', category);
    router.push(`/${locale}/search?${params.toString()}`);
  }

  function handleSelect(suggestion: SearchSuggestion) {
    setIsOpen(false);
    setQuery('');
    router.push(`/${locale}/product/${suggestion.slug}`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex h-10">
        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="hidden sm:block bg-gray-200 text-gray-800 text-xs px-2 rounded-l-md border-r border-gray-300 cursor-pointer min-w-[80px] max-w-[120px] focus:outline-none"
          aria-label="Search category"
        >
          <option value="all">All</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home-kitchen">Home & Kitchen</option>
          <option value="sports-outdoors">Sports</option>
        </select>

        {/* Input */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search ARTIC Marketplace..."
          className="flex-1 px-4 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange bg-white"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        {/* Submit button */}
        <button
          type="submit"
          className="bg-artic-orange hover:bg-artic-orange-dark text-black px-4 rounded-r-md transition-colors flex items-center"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-md z-50 border border-gray-200 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul role="listbox">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-4 py-3 hover:bg-artic-light-bg text-sm flex items-center justify-between group"
                    role="option"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-800">{s.name}</span>
                    </span>
                    <span className="text-xs text-gray-400">{s.category?.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              No suggestions for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
