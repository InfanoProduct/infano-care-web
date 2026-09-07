export function getImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80'; // Fallback image

  if (url.startsWith('http')) {
    return url;
  }

  // If it's a relative path starting with /uploads
  if (url.startsWith('/uploads')) {
    // Get the base API URL and remove the /api suffix if present
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api').replace(/\/api$/, '');
    return `${apiBase}${url}`;
  }

  // Fallback for other relative paths
  return url;
}

export function getCategoryColor(categoryName: string | undefined): string {
  if (!categoryName) return 'bg-primary';
  
  // Specific brand colors from design analysis
  const brandColors: Record<string, string> = {
    'Technology': 'bg-[#2D9CDB]',
    'Travel': 'bg-[#6C5CE7]',
    'Life Style': 'bg-[#27AE60]',
    'Food': 'bg-[#56CCF2]',
    'Wildlife': 'bg-[#F2994A]',
    'Health & Wellness': 'bg-[#00D1C1]',
    'Motivation': 'bg-[#4a1e7f]',
    'Business': 'bg-[#1E293B]',
    'Beauty': 'bg-[#F43F5E]',
  };

  const name = categoryName.trim();
  if (brandColors[name]) return brandColors[name];

  const palette = [
    'bg-[#FF385C]', 'bg-[#00D1C1]', 'bg-[#1D9BF0]', 'bg-[#FFB100]',
    'bg-[#FF5A5F]', 'bg-[#4a1e7f]', 'bg-[#EC4899]', 'bg-[#6366F1]',
    'bg-[#F43F5E]', 'bg-[#F97316]', 'bg-[#8B5CF6]', 'bg-[#0EA5E9]',
    'bg-[#059669]', 'bg-[#D946EF]', 'bg-[#F59E0B]', 'bg-[#3B82F6]',
    'bg-[#64748B]', 'bg-[#EF4444]', 'bg-[#84CC16]', 'bg-[#10B981]',
    'bg-[#06B6D4]', 'bg-[#D946EF]',
  ];

  // Robust deterministic hash to pick a color from the palette
  const searchName = name.toLowerCase();
  let hash = 0;
  for (let i = 0; i < searchName.length; i++) {
    hash = ((hash << 5) + hash) + searchName.charCodeAt(i);
  }
  
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to document.execCommand', err);
    }
  }

  // Fallback for non-secure contexts (HTTP)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copyToClipboard failed', err);
    return false;
  }
}

export function formatIndianDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours.toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
}

export function formatOrderId(id: string | undefined | null): string {
  if (!id) return '';
  return `ORD-${id.slice(0, 8).toUpperCase()}`;
}

export function getOrderCountry(order: any): string {
  if (!order) return 'IN';
  if (order.country && typeof order.country === 'string' && order.country.trim()) {
    const c = order.country.trim().toUpperCase();
    if (c === 'GB') return 'UK';
    return c;
  }
  if (order.currency && typeof order.currency === 'string') {
    const cur = order.currency.trim().toUpperCase();
    if (cur === 'USD') return 'US';
    if (cur === 'GBP') return 'UK';
    if (cur === 'EUR') return 'EU';
    if (cur === 'INR') return 'IN';
  }
  if (order.comments) {
    try {
      const commentsObj = typeof order.comments === 'string'
        ? JSON.parse(order.comments)
        : order.comments;
      if (commentsObj && typeof commentsObj === 'object' && commentsObj.country) {
        const c = String(commentsObj.country).trim().toUpperCase();
        if (c === 'GB') return 'UK';
        return c;
      }
    } catch (e) {
      if (typeof order.comments === 'string') {
        const cleaned = order.comments.trim().toUpperCase();
        if (cleaned === 'US' || cleaned === 'UK' || cleaned === 'GB' || cleaned === 'IN') {
          return cleaned === 'GB' ? 'UK' : cleaned;
        }
      }
    }
  }
  return 'IN';
}

export function getCurrencySymbol(input?: any): string {
  if (!input) return '₹';
  if (typeof input === 'object') {
    const country = getOrderCountry(input);
    const currency = (input.currency || '').toUpperCase();
    if (currency === 'USD' || country === 'US') return '$';
    if (currency === 'GBP' || country === 'UK' || country === 'GB') return '£';
    if (currency === 'EUR' || country === 'EU') return '€';
    if (currency === 'CAD') return 'CA$';
    if (currency === 'AUD') return 'A$';
    if (currency === 'AED') return 'AED ';
    return '₹';
  }

  const str = String(input).trim().toUpperCase();
  switch (str) {
    case 'US':
    case 'USA':
    case 'USD':
      return '$';
    case 'UK':
    case 'GB':
    case 'GBP':
      return '£';
    case 'EUR':
    case 'EU':
      return '€';
    case 'CAD':
      return 'CA$';
    case 'AUD':
      return 'A$';
    case 'AED':
      return 'AED ';
    case 'IN':
    case 'IND':
    case 'INR':
    default:
      return '₹';
  }
}
