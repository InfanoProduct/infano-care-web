import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type Region = 'IN' | 'US' | 'UK';

export interface RegionMetadata {
  region: Region;
  currencySymbol: string;
  currencyCode: string;
  bookPrice: number;
  urlPrefix: string;
  dialCode: string;
  flagEmoji: string;
  isoCode: string;
  countryName: string;
  getLocalizedLink: (href: string) => string;
  formatPrice: (amount?: number, scale?: boolean) => string;
}

const REGION_CONFIGS: Record<Region, Omit<RegionMetadata, 'getLocalizedLink' | 'formatPrice' | 'region'>> = {
  IN: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    bookPrice: 499,
    urlPrefix: '',
    dialCode: '+91',
    flagEmoji: '🇮🇳',
    isoCode: 'in',
    countryName: 'India',
  },
  US: {
    currencySymbol: '$',
    currencyCode: 'USD',
    bookPrice: 19.99,
    urlPrefix: '/en-us',
    dialCode: '+1',
    flagEmoji: '🇺🇸',
    isoCode: 'us',
    countryName: 'United States',
  },
  UK: {
    currencySymbol: '£',
    currencyCode: 'GBP',
    bookPrice: 14.99,
    urlPrefix: '/en-uk',
    dialCode: '+44',
    flagEmoji: '🇬🇧',
    isoCode: 'gb',
    countryName: 'United Kingdom',
  },
};

export function useRegion(): RegionMetadata {
  const pathname = usePathname() || '';

  // 1. Determine base region from pathname (SSR-safe, no suspense)
  let baseRegion: Region = 'IN';
  const lowerPath = pathname.toLowerCase();
  if (lowerPath.startsWith('/en-us') || lowerPath.includes('/en-us')) {
    baseRegion = 'US';
  } else if (lowerPath.startsWith('/en-uk') || lowerPath.includes('/en-uk')) {
    baseRegion = 'UK';
  }

  const [region, setRegion] = useState<Region>(baseRegion);

  // 2. Client-side hydration/mount logic to read query parameters without suspending the page
  useEffect(() => {
    let currentRegion = baseRegion;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rParam = params.get('__region')?.toUpperCase();
      if (rParam === 'US' || rParam === 'UK') {
        currentRegion = rParam as Region;
      }
    }
    if (currentRegion !== region) {
      setRegion(currentRegion);
    }
  }, [pathname, baseRegion]);

  const config = REGION_CONFIGS[region];

  const getLocalizedLink = (href: string) => {
    if (region === 'IN') return href;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return href;
    
    // Normalize href to remove duplicate prefix if already present
    const cleanHref = href.replace(/^\/(en-us|en-uk)/i, '');
    const prefix = config.urlPrefix;
    
    return `${prefix}${cleanHref.startsWith('/') ? '' : '/'}${cleanHref}`;
  };

  const formatPrice = (amount?: number, scale = true) => {
    let finalAmount = amount !== undefined ? amount : config.bookPrice;
    if (scale && region !== 'IN' && amount !== undefined) {
      if (region === 'US') {
        finalAmount = Math.round((amount / 83) * 100) / 100;
      } else if (region === 'UK') {
        finalAmount = Math.round((amount / 105) * 100) / 100;
      }
    }
    
    return `${config.currencySymbol}${finalAmount.toLocaleString('en-US', {
      minimumFractionDigits: region === 'IN' ? 0 : 2,
      maximumFractionDigits: region === 'IN' ? 0 : 2,
    })}`;
  };

  return {
    region,
    ...config,
    getLocalizedLink,
    formatPrice,
  };
}

/**
 * Returns the correct unit price for a book based on the current region.
 * Falls back to conversion-rate calculation if country-specific price is not set in DB.
 */
export function getBookPrice(
  book: { price: number; priceUS?: number | null; priceUK?: number | null } | null | undefined,
  region: Region
): number {
  if (!book) return REGION_CONFIGS[region].bookPrice;
  if (region === 'US') {
    return book.priceUS != null ? book.priceUS : Math.round((book.price / 83) * 100) / 100;
  }
  if (region === 'UK') {
    return book.priceUK != null ? book.priceUK : Math.round((book.price / 105) * 100) / 100;
  }
  return book.price;
}

export function getShippingCharge(
  book: {
    shippingIN?: number;
    shippingUS?: number;
    shippingUK?: number;
  } | null | undefined,
  region: Region
): number {
  if (!book) {
    return 0;
  }
  if (region === 'IN') {
    return book.shippingIN ?? 0;
  }
  if (region === 'US') return book.shippingUS ?? 0;
  if (region === 'UK') return book.shippingUK ?? 0;
  return 0;
}
