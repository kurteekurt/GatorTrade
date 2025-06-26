import { useState } from 'react';

export function useSearch(initialCategory = '', initialText = '', initialResults = []) {
  const [searchCategory, setSearchCategory] = useState(initialCategory);
  const [searchText, setSearchText] = useState(initialText);
  const [results, setResults] = useState(initialResults);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const handleSearch = async (
    categoryParam = searchCategory,
    textParam = searchText,
    min = minPrice,
    max = maxPrice
  ) => {
    if (textParam.length > 40) {
      alert('Search cannot exceed 40 characters.');
      return;
    }

    try {
      const params = new URLSearchParams({
        category: categoryParam,
        query: textParam,
        minPrice: min,
        maxPrice: max,
      });

      const response = await fetch(`/items/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          alert(data.error || 'Invalid search input.');
          window.history.back(); // ⬅️ Redirect user to the previous page
        } else {
          console.error('Search error:', data.error);
        }
        return;
      }

      setResults(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  return {
    searchCategory,
    setSearchCategory,
    searchText,
    setSearchText,
    results,
    setResults,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    handleSearch,
  };
}
