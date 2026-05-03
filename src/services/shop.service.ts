import { apiClient } from "@/lib/api-client";

export interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
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
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  razorpayOrderId?: string;
  paymentMethod: string;
}

export const ShopService = {
  async getBooks(): Promise<Book[]> {
    return apiClient.get<Book[]>('/shop/books');
  },

  async getBook(id: string): Promise<Book> {
    return apiClient.get<Book>(`/shop/books/${id}`);
  },

  async validateCoupon(code: string, amount: number): Promise<{ coupon: any, discountAmount: number }> {
    return apiClient.post('/shop/coupons/validate', { code, amount });
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
  }
};
