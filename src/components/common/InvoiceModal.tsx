'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { getCurrencySymbol, getOrderCountry } from '@/lib/utils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'PROGRAM' | 'BOOK';
  data: any;
}

export function InvoiceModal({ isOpen, onClose, type, data }: InvoiceModalProps) {
  if (!isOpen || !data) return null;

  const orderCountry = type === 'BOOK' ? getOrderCountry(data) : 'IN';
  const isInternational = type === 'BOOK' && (orderCountry !== 'IN' || (data.currency && data.currency !== 'INR'));
  const currencySymbol = type === 'PROGRAM' ? '₹' : getCurrencySymbol(data);

  const invoiceNo = type === 'PROGRAM' 
    ? `INF-PRG-${data.id.slice(-6).toUpperCase()}` 
    : `INF-BOK-${data.id.slice(-6).toUpperCase()}`;

  const invoiceDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const buyerName = type === 'PROGRAM'
    ? (data.guestName || data.user?.profile?.displayName || data.user?.username || 'Customer')
    : (data.guestName || 'Customer');

  const buyerPhone = type === 'PROGRAM'
    ? (data.user?.phone || 'N/A')
    : (data.guestPhone || 'N/A');

  const buyerEmail = type === 'PROGRAM'
    ? (data.guestEmail || data.user?.parentEmail || 'N/A')
    : (data.guestEmail || 'N/A');

  const paymentMethod = type === 'PROGRAM'
    ? 'Razorpay (ONLINE)'
    : (data.paypalCaptureId || data.paypalOrderId)
      ? 'PayPal (ONLINE)'
      : (data.paymentMethod ? `${data.paymentMethod} (ONLINE)` : 'ONLINE');

  const transactionId = type === 'PROGRAM'
    ? data.id
    : (data.paypalCaptureId || data.paypalOrderId || data.razorpayPaymentId || data.id);

  // Billing address
  const billingAddress = type === 'BOOK'
    ? `${data.shippingAddress || ''}${data.city ? `, ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}${data.pincode ? ` - ${data.pincode}` : ''}`
    : 'Online Mentoring Service';

  // Helper to determine if an item is a program
  const isItemProgram = (item: any) => {
    const book = item.book || {};
    const bookId = (item.bookId || '').toLowerCase();
    const bookTitle = (book.title || item.bookTitle || '').toLowerCase();
    if (book.curriculum?.length || book.duration) return true;
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    return false;
  };

  // Indian tax invoice line items
  let domesticLineItems: Array<{
    name: string;
    hsn: string;
    qty: number;
    rate: number;
    taxableVal: number;
    cgstRate: number;
    cgstAmt: number;
    sgstRate: number;
    sgstAmt: number;
    total: number;
  }> = [];

  // International invoice line items
  let internationalLineItems: Array<{
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
  }> = [];

  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let grandTotal = 0;
  let discountAmt = data.discountAmount || 0;
  let deliveryCharge = 0;

  if (isInternational) {
    const items = data.items || [];
    let itemsSubtotal = 0;

    items.forEach((item: any) => {
      const itemPrice = item.price != null ? Number(item.price) : Number(item.book?.price || 0);
      const qty = Number(item.quantity || 1);
      const itemTotal = itemPrice * qty;
      itemsSubtotal += itemTotal;

      internationalLineItems.push({
        name: item.book?.title || item.bookTitle || 'The Awkward Age',
        qty,
        unitPrice: itemPrice,
        total: itemTotal,
      });
    });

    if (itemsSubtotal === 0 && data.totalAmount) {
      itemsSubtotal = Number(data.totalAmount);
      internationalLineItems.push({
        name: 'The Awkward Age',
        qty: 1,
        unitPrice: itemsSubtotal,
        total: itemsSubtotal,
      });
    }

    subtotal = itemsSubtotal;
    grandTotal = Number(data.totalAmount || itemsSubtotal);
    deliveryCharge = data.deliveryCharge != null && data.deliveryCharge > 0
      ? Number(data.deliveryCharge)
      : Math.max(0, Math.round((grandTotal - (itemsSubtotal - discountAmt)) * 100) / 100);
  } else if (type === 'PROGRAM') {
    // 18% inclusive GST for mentoring programs in India
    const pricePaid = data.pricePaid || 0;
    const taxableVal = Math.round((pricePaid / 1.18) * 100) / 100;
    const gstAmt = Math.round((pricePaid - taxableVal) * 100) / 100;
    const cgstAmt = Math.round((gstAmt / 2) * 100) / 100;
    const sgstAmt = Math.round((gstAmt / 2) * 100) / 100;

    domesticLineItems.push({
      name: `${data.program?.title || 'Infano Mentoring'} Program Enrollment`,
      hsn: '999299',
      qty: 1,
      rate: taxableVal,
      taxableVal,
      cgstRate: 9,
      cgstAmt,
      sgstRate: 9,
      sgstAmt,
      total: pricePaid
    });

    subtotal = taxableVal;
    cgstTotal = cgstAmt;
    sgstTotal = sgstAmt;
    grandTotal = pricePaid;
  } else {
    // Domestic India Book Order: 5% inclusive GST for books, 18% for programs
    const items = data.items || [];
    
    items.forEach((item: any) => {
      const itemPrice = item.price != null ? item.price : (item.book?.price || 0);
      const itemTotal = itemPrice * item.quantity;
      const itemDiscount = data.subtotal > 0 ? (itemTotal / data.subtotal) * discountAmt : 0;
      const finalItemTotal = itemTotal - itemDiscount;
      
      const isProg = isItemProgram(item);
      const taxRate = isProg ? 0.18 : 0.05;
      const gstPercent = isProg ? 18 : 5;
      
      const taxableVal = Math.round((finalItemTotal / (1 + taxRate)) * 100) / 100;
      const gstAmt = Math.round((finalItemTotal - taxableVal) * 100) / 100;
      const cgstAmt = Math.round((gstAmt / 2) * 100) / 100;
      const sgstAmt = Math.round((gstAmt / 2) * 100) / 100;

      domesticLineItems.push({
        name: item.book?.title || item.bookTitle || 'The Awkward Age Book',
        hsn: isProg ? '999299' : '4901',
        qty: item.quantity,
        rate: Math.round((itemPrice / (1 + taxRate)) * 100) / 100,
        taxableVal,
        cgstRate: gstPercent / 2,
        cgstAmt,
        sgstRate: gstPercent / 2,
        sgstAmt,
        total: finalItemTotal
      });

      subtotal += taxableVal;
      cgstTotal += cgstAmt;
      sgstTotal += sgstAmt;
      grandTotal += finalItemTotal;
    });

    subtotal = Math.round(subtotal * 100) / 100;
    cgstTotal = Math.round(cgstTotal * 100) / 100;
    sgstTotal = Math.round(sgstTotal * 100) / 100;
    grandTotal = Math.round(grandTotal * 100) / 100;
  }

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Infano-Invoice-${invoiceNo}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none print:static print:bg-white print:p-0 print:backdrop-blur-none">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide all non-printable elements */
          .no-print, aside, header, nav, button, footer, [class*="NotificationBell"], [class*="universal-header"] {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Reset parent layout containers completely to avoid height clipping or overflow pages */
          html, body {
            background: #fff !important;
            color: #000 !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Reset Next.js root layout structural nodes */
          .customer-dashboard, 
          main, 
          div[class*="flex-1"], 
          div[class*="h-screen"], 
          div[class*="h-full"], 
          div[class*="overflow-y-auto"], 
          div[class*="overflow-hidden"],
          .max-w-7xl, 
          .max-w-[1000px],
          .max-w-[1280px] {
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          
          /* Target modal backdrop wrapper - remove fixed overlay positioning and background */
          div[class*="fixed"][class*="inset-0"] {
            position: static !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          
          /* Target modal card wrapper - remove flexbox, fixed height, shadows, border, and curves */
          div[class*="bg-white"][class*="rounded-2xl"] {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
          
          /* Target print content area - ensure normal page flow */
          .print-area {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Set print sheet layout margins and rules */
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}} />

      <div 
        className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden print:h-auto print:border-none print:shadow-none print:rounded-none animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header Panel - hidden on print */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 no-print">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <FileText size={18} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              {isInternational ? 'Invoice' : 'Tax Invoice'}
            </h3>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none justify-center px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="flex-1 overflow-y-auto p-8 print-area print:overflow-visible bg-white font-sans text-slate-800 text-[11px] leading-relaxed">
          
          {/* Top Invoice Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-150 pb-6 mb-6">
            <div className="space-y-1">
              <img 
                src="/logo/infano-logo-for-light-bg.png" 
                alt="Infano Care Logo" 
                className="h-10 object-contain object-left mb-2.5"
              />
              <p className="font-extrabold text-slate-900 text-sm">
                Berry Bird Technologies Pvt Ltd
              </p>
              <p className="text-slate-500 font-semibold text-[10px]">
                infano.care • Empowering adolescent girls, one family at a time.
              </p>
              {!isInternational && (
                <p className="text-slate-600 font-bold mt-2">
                  GSTIN: <span className="text-slate-800 font-black">29AAFCI8765A1Z2</span>
                </p>
              )}
              <p className="text-slate-500 font-semibold">Bengaluru, Karnataka, India • connect@infano.care</p>
            </div>
            <div className="text-right space-y-1 mt-1 shrink-0">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-250/50 rounded-lg font-black text-[10px] uppercase tracking-wider print:border-none print:bg-transparent print:p-0 print:text-xs">
                {isInternational ? 'Invoice' : 'Tax Invoice'}
              </span>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-3">Invoice Number</p>
              <p className="text-slate-900 font-black text-xs font-mono tracking-tight">{invoiceNo}</p>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5">Invoice Date</p>
              <p className="text-slate-700 font-bold text-[10px]">{invoiceDate}</p>
            </div>
          </div>

          {/* Billing & Shipping Columns */}
          <div className="grid grid-cols-2 gap-12 border-b border-slate-100 pb-6 mb-6">
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Bill To:</h4>
              <p className="font-extrabold text-slate-900 text-sm">{buyerName}</p>
              {buyerPhone && buyerPhone !== 'N/A' && (
                <p className="text-slate-600 font-semibold">Phone: <span className="text-slate-800 font-bold">{buyerPhone}</span></p>
              )}
              <p className="text-slate-600 font-semibold">Email: <span className="text-slate-800 font-bold">{buyerEmail}</span></p>
              {isInternational && orderCountry && (
                <p className="text-slate-600 font-semibold">Country: <span className="text-slate-800 font-bold">{orderCountry}</span></p>
              )}
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping & Billing Address:</h4>
              <p className="text-slate-700 font-semibold leading-relaxed whitespace-pre-line">{billingAddress}</p>
              
              <div className="pt-2">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Payment Details</span>
                <span className="text-slate-800 font-black text-[10px] block mt-0.5 uppercase">{paymentMethod}</span>
                {transactionId && (
                  <span className="text-slate-500 font-mono text-[9px] block mt-0.5">ID: {transactionId}</span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6 overflow-x-auto print:overflow-x-visible">
            {isInternational ? (
              /* International Table (No GST/CGST/SGST/HSN) */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {internationalLineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 font-medium text-slate-700 hover:bg-slate-50/30">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block">{item.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{item.qty}</td>
                      <td className="py-3 px-3 text-right font-mono">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">{currencySymbol}{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* India Domestic Tax Table (with GST/CGST/SGST/HSN) */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-center">HSN</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Taxable Rate</th>
                    <th className="py-2.5 px-2 text-center">CGST %</th>
                    <th className="py-2.5 px-2 text-right">CGST</th>
                    <th className="py-2.5 px-2 text-center">SGST %</th>
                    <th className="py-2.5 px-2 text-right">SGST</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {domesticLineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 font-medium text-slate-700 hover:bg-slate-50/30">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block">{item.name}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500 font-semibold font-mono">{item.hsn}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">{item.qty}</td>
                      <td className="py-3 px-2 text-right font-mono">{currencySymbol}{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-bold">{item.cgstRate}%</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{currencySymbol}{item.cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-bold">{item.sgstRate}%</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-600">{currencySymbol}{item.sgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">{currencySymbol}{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals Block */}
          <div className="flex justify-end mb-8">
            <div className="w-72 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-slate-600 font-semibold">
              {isInternational ? (
                /* International Totals Breakdown */
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>Item Price:</span>
                    <span className="font-mono text-slate-800">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-[10px] text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono">-{currencySymbol}{discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px]">
                    <span>Shipping Charge:</span>
                    <span className="font-mono text-slate-800">
                      {deliveryCharge > 0 ? `${currencySymbol}${deliveryCharge.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Total Price:</span>
                    <span className="font-mono text-primary text-sm">{currencySymbol}{grandTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                /* Domestic India Totals */
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>Total Taxable Value:</span>
                    <span className="font-mono text-slate-800">{currencySymbol}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>CGST Total:</span>
                    <span className="font-mono text-slate-800">{currencySymbol}{cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>SGST Total:</span>
                    <span className="font-mono text-slate-800">{currencySymbol}{sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary text-sm">{currencySymbol}{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Declaration and Signature */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-150 mt-10">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 uppercase text-[8px] tracking-wider">Declaration:</p>
              <p className="text-slate-400 font-semibold text-[9px] leading-relaxed">
                We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct. This is a computer-generated invoice and does not require a physical signature.
              </p>
            </div>
            <div className="text-right flex flex-col justify-end items-end space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Authorized Signatory for</p>
              <p className="font-extrabold text-slate-900 text-[10px]">Berry Bird Technologies Pvt Ltd</p>
              <div className="h-8"></div>
              <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase">Computer Generated Invoice</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
