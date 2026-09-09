import { apiClient } from "@/lib/api-client";

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiryDate?: string | null;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  price: number;           // India price (INR)
  priceUS?: number | null; // USA price (USD)
  priceUK?: number | null; // UK price (GBP)
  shippingIN?: number;     // India shipping (INR)
  shippingUS?: number;       // USA shipping (USD)
  shippingUK?: number;       // UK shipping (GBP)
  codChargeIN?: number;    // India COD Surcharge (INR)
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  couponId?: string | null;
  coupon?: Coupon | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  bookId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'ONLINE' | 'COD';
  items: OrderItem[];
  comments?: string;
  currency?: string;
  country?: string;
  couponCode?: string;
  gstNumber?: string;
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  currency?: string;
  razorpayOrderId?: string;
  paymentMethod: string;
  stripeSessionUrl?: string;
  razorpayKeyId?: string;
}

export interface Webinar {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  date: string;
  zoomLink?: string | null;
  isActive: boolean;
  altform?: string | null;
  mode: 'ONLINE' | 'OFFLINE';
  link?: string | null;
  instructor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const ShopService = {
  async getBooks(): Promise<Book[]> {
    return apiClient.get<Book[]>('/shop/books');
  },

  async getBook(id: string): Promise<Book> {
    return apiClient.get<Book>(`/shop/books/${id}`);
  },

  async validateCoupon(code: string, items: { bookId: string; quantity: number; price: number }[]): Promise<{ coupon: any, discountAmount: number }> {
    return apiClient.post('/shop/coupons/validate', { code, items });
  },

  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>('/shop/orders', data);
  },

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<any> {
    return apiClient.post('/shop/orders/verify', data);
  },

  async getUserOrders(): Promise<any[]> {
    return apiClient.get<any[]>('/shop/orders/me');
  },

  async getRecentPurchases(): Promise<{ name: string; bookTitle: string; createdAt: string }[]> {
    return apiClient.get('/shop/recent-purchases');
  },

  async getWebinarBySlug(slug: string): Promise<Webinar> {
    return apiClient.get<Webinar>(`/shop/webinars/${slug}`);
  },

  async adminGetWebinars(): Promise<Webinar[]> {
    return apiClient.get<Webinar[]>('/admin/webinars');
  },

  async adminGetWebinar(idOrSlug: string): Promise<Webinar> {
    return apiClient.get<Webinar>(`/admin/webinars/${idOrSlug}`);
  },

  async adminCreateWebinar(data: Partial<Webinar>): Promise<Webinar> {
    return apiClient.post<Webinar>('/admin/webinars', data);
  },

  async adminUpdateWebinar(idOrSlug: string, data: Partial<Webinar>): Promise<Webinar> {
    return apiClient.patch<Webinar>(`/admin/webinars/${idOrSlug}`, data);
  },

  async adminDeleteWebinar(idOrSlug: string): Promise<void> {
    return apiClient.delete(`/admin/webinars/${idOrSlug}`);
  },


  // Admin Methods
  async adminGetBooks(isWebinar: boolean = false): Promise<Book[]> {
    return apiClient.get<Book[]>('/admin/books', { params: { isWebinar } }); 
  },

  async adminCreateBook(data: Partial<Book>): Promise<Book> {
    return apiClient.post<Book>('/admin/books', data);
  },

  async adminUpdateBook(id: string, data: Partial<Book>): Promise<Book> {
    return apiClient.patch<Book>(`/admin/books/${id}`, data);
  },

  async adminDeleteBook(id: string): Promise<void> {
    return apiClient.delete(`/admin/books/${id}`);
  },

  // ─── Admin Coupon Methods ─────────────────────────────────────
  async adminListCoupons(): Promise<any[]> {
    return apiClient.get<any[]>('/shop/admin/coupons');
  },

  async adminCreateCoupon(data: {
    code: string;
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number | null;
    expiryDate?: string | null;
    usageLimit?: number;
    isActive?: boolean;
  }): Promise<any> {
    return apiClient.post('/shop/admin/coupons', data);
  },

  async adminUpdateCoupon(id: string, data: Partial<{
    code: string;
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
    minOrderAmount: number;
    maxDiscount: number | null;
    expiryDate: string | null;
    usageLimit: number;
    isActive: boolean;
  }>): Promise<any> {
    return apiClient.patch(`/shop/admin/coupons/${id}`, data);
  },

  async adminDeleteCoupon(id: string): Promise<void> {
    return apiClient.delete(`/shop/admin/coupons/${id}`);
  },
};
