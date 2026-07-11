'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { isAnalyticsEnabled } from '@/components/common/Analytics';

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('transaction_id') || 'ORDER_' + Math.floor(Math.random() * 1000000);
  const valueStr = searchParams.get('value') || '499';
  const qtyStr = searchParams.get('quantity') || '1';
  const itemId = searchParams.get('item_id') || '5e569d64-9678-4689-a594-ec9c0020f07b';
  const itemName = searchParams.get('item_name') || 'Gigi - The Awkward Age';
  const priceStr = searchParams.get('price') || '499';

  useEffect(() => {
    if (isAnalyticsEnabled()) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({ ecommerce: null });
      windowObj.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: transactionId,
          currency: 'INR',
          value: parseFloat(valueStr),
          items: [{
            item_id: itemId,
            item_name: itemName,
            price: parseFloat(priceStr),
            quantity: parseInt(qtyStr, 10)
          }]
        }
      });
      // Meta Pixel Event removed as integrated via GTM
    }
  }, [transactionId, valueStr, qtyStr, itemId, itemName, priceStr]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-10 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900">Order Confirmed! 🎉</h1>
        <p className="text-slate-600 mb-6 text-lg leading-relaxed">
          Thank you for ordering your book. Your order has been successfully placed, and we will get it delivered to you soon! Our team will connect with you shortly with further updates.
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-left mb-8 max-w-sm mx-auto">
          <h3 className="font-bold text-slate-900 mb-4 text-center">Need help? We're here for you:</h3>
          <div className="space-y-3 font-medium text-slate-700">
            <p className="flex items-center justify-center gap-2">
              <span>📧</span> Email: <a href="mailto:connect@infano.care" className="text-primary hover:underline font-bold">connect@infano.care</a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>💬</span> WhatsApp: <a href="https://wa.me/916362994347" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">+91 6362994347</a>
            </p>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <PurchaseSuccessContent />
    </React.Suspense>
  );
}
