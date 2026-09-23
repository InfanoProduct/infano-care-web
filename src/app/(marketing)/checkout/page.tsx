'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ShopService, Book } from '@/services/shop.service';
import { useRegion, getBookPrice, getShippingCharge } from '@/hooks/use-region';
import {
  ArrowLeft, CheckCircle2, ShoppingBag, Tag,
  Loader2, CreditCard, Truck, AlertCircle,
  Plus, Minus, Lock
} from 'lucide-react';
import { isAnalyticsEnabled } from '@/components/common/Analytics';

const bookImages = [
  '/Page-1.png',
  '/Page-2.png',
  '/page-3.png',
  '/Page-4.png',
  '/Page-5.png',
  '/Page-6.png',
  '/Page-7.png'
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const nameParam = searchParams.get('name') || '';
  const phoneParam = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';
  const { user, isAuthenticated } = useAuthStore();
  const {
    region,
    currencySymbol,
    currencyCode,
    countryName,
    dialCode,
    flagEmoji,
    isoCode,
    getLocalizedLink,
    formatPrice
  } = useRegion();

  const [book, setBook] = useState<Book | null>({
    id: bookId || 'default',
    title: 'Gigi — The Awkward Age',
    description: 'A story of Every Adolescent Girl',
    price: 499,
    priceUS: 19.99,
    priceUK: 14.99,
    imageUrl: '/Page-1.png',
    stock: 100,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cachedOrder, setCachedOrder] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(bookImages[0]);

  // Financials
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentFailedReason, setPaymentFailedReason] = useState('');
  const rzpRef = React.useRef<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [intlPaymentMethod, setIntlPaymentMethod] = useState<'CARD' | 'PAYPAL'>('CARD');
  const paypalContainerRef = React.useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD',
    gstNumber: '',
  });


  useEffect(() => {
    if (nameParam || phoneParam || emailParam || user) {
      const fallbackName = user?.profile?.displayName || (user?.username?.includes('@') ? '' : user?.username) || '';
      const targetName = nameParam || fallbackName;
      let targetPhone = phoneParam || user?.phone || '';
      const targetEmail = emailParam || user?.email || '';

      if (targetPhone) {
        const cleaned = targetPhone.replace(/[\s\-()]/g, '');
        if (region === 'IN') {
          if (cleaned.startsWith('+91') && cleaned.length === 13) {
            targetPhone = cleaned.substring(3);
          } else if (cleaned.startsWith('91') && cleaned.length === 12) {
            targetPhone = cleaned.substring(2);
          }
        } else if (region === 'US') {
          if (cleaned.startsWith('+1') && cleaned.length === 12) {
            targetPhone = cleaned.substring(2);
          } else if (cleaned.startsWith('1') && cleaned.length === 11) {
            targetPhone = cleaned.substring(1);
          }
        } else if (region === 'UK') {
          if (cleaned.startsWith('+44') && cleaned.length === 13) {
            targetPhone = cleaned.substring(3);
          } else if (cleaned.startsWith('44') && cleaned.length === 12) {
            targetPhone = cleaned.substring(2);
          }
        }
      }

      setFormData(prev => {
        const updates: Partial<typeof prev> = {};
        if (targetName && !prev.guestName) updates.guestName = targetName;
        if (targetPhone && !prev.guestPhone) updates.guestPhone = targetPhone;
        if (targetEmail && !prev.guestEmail) updates.guestEmail = targetEmail;

        if (Object.keys(updates).length === 0) {
          return prev;
        }
        return {
          ...prev,
          ...updates
        };
      });
    }
  }, [nameParam, phoneParam, emailParam, user, region]);

  useEffect(() => {
    setCachedOrder(null);
  }, [formData, quantity, appliedCoupon]);

  useEffect(() => {
    async function loadBook() {
      try {
        if (bookId) {
          const data = await ShopService.getBook(bookId);
          if (data) {
            setBook(data);
          } else {
            throw new Error('Book not found');
          }
        } else {
          const books = await ShopService.getBooks();
          if (books && books.length > 0) {
            const targetBook = books.find(b => b.isActive) || books[0];
            setBook(targetBook);
          } else {
            setBook({
              id: 'default',
              title: 'The Awkward Age',
              description: 'A story of Every Adolescent Girl',
              price: 499,
              stock: 100,
              isActive: true
            });
          }
        }
      } catch (err) {
        console.error('Error loading checkout book:', err);
        setBook({
          id: 'default',
          title: 'The Awkward Age',
          description: 'A story of Every Adolescent Girl',
          price: 499,
          stock: 100,
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  useEffect(() => {
    if (isAnalyticsEnabled() && book) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({
        event: 'begin_checkout',
        value: getBookPrice(book, region) * quantity,
        currency: currencyCode,
        content_ids: [book.id],
        content_type: 'product',
        ecommerce: {
          currency: currencyCode,
          value: getBookPrice(book, region) * quantity,
          items: [{
            item_id: book.id,
            item_name: book.title,
            price: getBookPrice(book, region),
            quantity: quantity
          }]
        }
      });
    }
  }, [book, region, currencyCode, quantity]);

  useEffect(() => {
    let shouldFetch = false;
    let codeToFetch = formData.pincode.trim();

    if (region === 'IN' && codeToFetch.length === 6 && /^\d{6}$/.test(codeToFetch)) {
      shouldFetch = true;
    } else if (region === 'US' && codeToFetch.length === 5 && /^\d{5}$/.test(codeToFetch)) {
      shouldFetch = true;
    } else if (region === 'UK') {
      const cleanCode = codeToFetch.replace(/\s+/g, '');
      const ukRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
      if (ukRegex.test(codeToFetch)) {
        shouldFetch = true;
        codeToFetch = cleanCode;
      }
    }

    if (shouldFetch) {
      const fetchPincodeData = async () => {
        setPincodeLoading(true);
        try {
          const res = await fetch(`/api/pincode?code=${codeToFetch}&region=${region}`);
          if (!res.ok) {
            console.warn('Postal code auto-fill unavailable at the moment');
            return;
          }
          const data = await res.json();
          if (data && data.success) {
            setFormData(prev => ({
              ...prev,
              city: data.city,
              state: data.state
            }));
            setFormErrors(prev => ({ ...prev, pincode: '', city: '', state: '' }));
          }
        } catch (err) {
          console.warn('Postal code lookup failed (network issue or timeout)');
        } finally {
          setPincodeLoading(false);
        }
      };
      fetchPincodeData();
    }
  }, [formData.pincode, region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const applyCoupon = async () => {
    if (!couponCode || !book) return;
    setValidatingCoupon(true);
    setError(null);
    try {
      const result = await ShopService.validateCoupon(couponCode, [{ bookId: book.id, quantity: 1, price: book.price }]);
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
    } catch (err: any) {
      setError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const calculateTotal = () => {
    if (!book) return { subtotal: 0, gst: 0, delivery: 0, codCharge: 0, total: 0 };
    const price = getBookPrice(book, region);
    const baseSubtotal = price * quantity;
    const appliedDiscount = region === 'IN' ? discountAmount : 0; // Coupons disabled for US/UK
    const priceAfterDiscount = baseSubtotal - appliedDiscount;
    
    if (region === 'IN') {
      const deliveryCharge = getShippingCharge(book, region);
      const taxableValue = Math.round((priceAfterDiscount / 1.05) * 100) / 100;
      const gst = Math.round((priceAfterDiscount - taxableValue) * 100) / 100;
      const codSurcharge = formData.paymentMethod === 'COD' ? (book.codChargeIN ?? 40) : 0;
      const total = priceAfterDiscount + deliveryCharge + codSurcharge;
      return { subtotal: baseSubtotal, gst, delivery: deliveryCharge, codCharge: codSurcharge, total };
    } else {
      const deliveryCharge = getShippingCharge(book, region);
      const total = priceAfterDiscount + deliveryCharge;
      return { subtotal: baseSubtotal, gst: 0, delivery: deliveryCharge, codCharge: 0, total };
    }
  };

  const { subtotal, gst, delivery, codCharge, total } = calculateTotal();

  // Refs for PayPal callbacks to always access the freshest data without re-rendering buttons
  const formDataRef = React.useRef(formData);
  const bookRef = React.useRef(book);
  const quantityRef = React.useRef(quantity);
  const totalRef = React.useRef(total);
  const deliveryRef = React.useRef(delivery);
  const subtotalRef = React.useRef(subtotal);
  const userRef = React.useRef(user);
  const currentOrderRef = React.useRef<any>(null);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { bookRef.current = book; }, [book]);
  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { totalRef.current = total; }, [total]);
  useEffect(() => { deliveryRef.current = delivery; }, [delivery]);
  useEffect(() => { subtotalRef.current = subtotal; }, [subtotal]);
  useEffect(() => { userRef.current = user; }, [user]);

  const validateForm = () => {
    const curForm = formDataRef.current;
    const errors: Record<string, string> = {};
    if (!curForm.guestName.trim()) errors.guestName = 'Full name is required';
    
    // Phone Validation
    const digits = curForm.guestPhone.replace(/\D/g, '');
    if (region === 'IN') {
      if (!curForm.guestPhone.trim() || !/^\d{10}$/.test(curForm.guestPhone)) {
        errors.guestPhone = 'Valid 10-digit mobile number is required';
      }
    } else if (region === 'US') {
      if (!curForm.guestPhone.trim() || !/^\d{10}$/.test(digits)) {
        errors.guestPhone = 'Valid 10-digit mobile number is required';
      }
    } else if (region === 'UK') {
      const isValidUK = (digits.length === 10 && !digits.startsWith('0')) || (digits.length === 11 && digits.startsWith('0'));
      if (!curForm.guestPhone.trim() || !isValidUK) {
        errors.guestPhone = 'Valid UK phone number is required (10 or 11 digits)';
      }
    } else {
      const cleanPhone = curForm.guestPhone.replace(/[\s\-()]/g, '');
      if (!curForm.guestPhone.trim() || !/^\d{7,15}$/.test(cleanPhone)) {
        errors.guestPhone = 'Valid phone number is required (7-15 digits)';
      }
    }

    // Email validation (mandatory for US/UK)
    if (region !== 'IN') {
      if (!curForm.guestEmail.trim()) {
        errors.guestEmail = 'Email address is required for international orders';
      } else if (!/\S+@\S+\.\S+/.test(curForm.guestEmail)) {
        errors.guestEmail = 'Please enter a valid email address';
      }
    } else if (curForm.guestEmail.trim() && !/\S+@\S+\.\S+/.test(curForm.guestEmail)) {
      errors.guestEmail = 'Please enter a valid email address';
    }

    // Pincode/Zip validation
    if (region === 'IN') {
      if (!curForm.pincode.trim() || curForm.pincode.length !== 6) {
        errors.pincode = 'Valid 6-digit pincode is required';
      }
    } else if (region === 'US') {
      if (!curForm.pincode.trim() || !/^\d{5}$/.test(curForm.pincode)) {
        errors.pincode = 'Valid 5-digit ZIP code is required';
      }
    } else if (region === 'UK') {
      if (!curForm.pincode.trim() || curForm.pincode.length < 3 || curForm.pincode.length > 10) {
        errors.pincode = 'Valid postal code is required';
      }
    }

    if (!curForm.shippingAddress.trim()) errors.shippingAddress = 'Street address is required';
    if (!curForm.city.trim()) errors.city = 'City is required';
    if (!curForm.state.trim()) errors.state = 'State / Region is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardInputChange = (field: 'number' | 'expiry' | 'cvv' | 'name', value: string) => {
    if (field === 'number') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData(prev => ({ ...prev, number: formatted }));
      if (cardErrors.number) setCardErrors(prev => ({ ...prev, number: '' }));
    } else if (field === 'expiry') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      let formatted = digitsOnly;
      if (digitsOnly.length >= 2) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      }
      setCardData(prev => ({ ...prev, expiry: formatted }));
      if (cardErrors.expiry) setCardErrors(prev => ({ ...prev, expiry: '' }));
    } else if (field === 'cvv') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      setCardData(prev => ({ ...prev, cvv: digitsOnly }));
      if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: '' }));
    } else if (field === 'name') {
      setCardData(prev => ({ ...prev, name: value }));
      if (cardErrors.name) setCardErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const validateCardData = () => {
    const errors: Record<string, string> = {};
    const cleanNumber = cardData.number.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 13) {
      errors.number = 'Please enter a valid card number (13-16 digits)';
    }

    const cleanExpiry = cardData.expiry.trim();
    if (!cleanExpiry || !/^\d{2}\/\d{2}$/.test(cleanExpiry)) {
      errors.expiry = 'MM/YY required';
    } else {
      const [month, year] = cleanExpiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (month < 1 || month > 12) {
        errors.expiry = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card expired';
      }
    }

    const cleanCvv = cardData.cvv.replace(/\D/g, '');
    if (!cleanCvv || cleanCvv.length < 3) {
      errors.cvv = '3-4 digits required';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── PayPal Wallet 1-Click Button (for PAYPAL tab) ──────────────────────────
  useEffect(() => {
    if (region !== 'US' && region !== 'UK') return;
    if (intlPaymentMethod !== 'PAYPAL') {
      setPaypalReady(false);
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
      const el = document.getElementById('paypal-button-container');
      if (el) el.innerHTML = '';
      return;
    }

    let isMounted = true;

    const initPaypal = () => {
      const paypal = (window as any).paypal;
      if (!paypal?.Buttons || !paypalContainerRef.current) return false;

      paypalContainerRef.current.innerHTML = '';

      paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        onClick: (_data: any, actions: any) => {
          if (!validateForm()) {
            setError('Please complete all required shipping and contact details above before continuing.');
            return actions.reject();
          }
          setError(null);
          setInitiatingPayment(true);
          return actions.resolve();
        },
        createOrder: async () => {
          setError(null);
          setInitiatingPayment(true);
          try {
            const curBook = bookRef.current;
            if (!curBook) throw new Error('Book details not loaded');
            const curForm = formDataRef.current;

            let finalPhone = curForm.guestPhone.trim();
            const phoneDigits = finalPhone.replace(/\D/g, '');
            if (region === 'US' && phoneDigits.length === 10) {
              finalPhone = `+1${phoneDigits}`;
            } else if (region === 'UK' && (phoneDigits.length === 10 || phoneDigits.length === 11)) {
              finalPhone = phoneDigits.startsWith('0') ? `+44${phoneDigits.slice(1)}` : `+44${phoneDigits}`;
            }

            const orderData = {
              userId: userRef.current?.id,
              guestEmail: curForm.guestEmail.trim() || undefined,
              guestName: curForm.guestName.trim() || undefined,
              guestPhone: finalPhone || undefined,
              shippingAddress: curForm.shippingAddress.trim(),
              city: curForm.city.trim(),
              state: curForm.state.trim(),
              pincode: curForm.pincode.trim(),
              items: [{ bookId: curBook.id, quantity: quantityRef.current }],
              country: region,
              currency: currencyCode,
              paymentMethod: 'ONLINE' as const,
              comments: JSON.stringify({
                country: region,
                method: 'PAYPAL_WALLET',
                flow: 'SINGLE_FORM_CHECKOUT',
              }),
            };

            const order = await ShopService.createOrder(orderData);
            currentOrderRef.current = order;
            setTimeout(() => setInitiatingPayment(false), 2500);
            return order.paypalOrderId;
          } catch (err: any) {
            setInitiatingPayment(false);
            setError(err.message || 'Failed to initialize payment.');
            throw err;
          }
        },
        onApprove: async (data: any) => {
          setInitiatingPayment(false);
          setProcessing(true);
          try {
            const captureResult: any = await ShopService.capturePaypalOrder({ paypalOrderId: data.orderID });
            const curBook = bookRef.current;
            const order = currentOrderRef.current;
            const successParams = new URLSearchParams({
              transaction_id: captureResult?.id || order?.id || data.orderID,
              value: captureResult?.totalAmount?.toString() || order?.totalAmount?.toString() || totalRef.current.toString(),
              quantity: quantityRef.current.toString(),
              item_id: curBook?.id || '',
              item_name: curBook?.title || '',
              price: getBookPrice(curBook, region).toString(),
              discount: '0',
              delivery: deliveryRef.current.toString(),
              cod_charge: '0',
              subtotal: subtotalRef.current.toString(),
              payment_method: 'ONLINE',
              image_url: curBook?.imageUrl || '/Page-1.png'
            });
            router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
          } catch (err: any) {
            setError(err.message || 'Payment capture failed. Please contact support.');
            setProcessing(false);
          }
        },
        onCancel: () => {
          setInitiatingPayment(false);
          setProcessing(false);
        },
        onError: (err: any) => {
          console.error('[PAYPAL] Error:', err);
          setInitiatingPayment(false);
          setError('Payment could not be completed. Please ensure your shipping and billing address are in ' + countryName + '.');
          setProcessing(false);
        },
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
        },
      }).render(paypalContainerRef.current);

      if (isMounted) setPaypalReady(true);
      return true;
    };

    setPaypalReady(false);
    if (initPaypal()) return;

    const timer = setInterval(() => {
      if (initPaypal()) {
        clearInterval(timer);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
      const el = document.getElementById('paypal-button-container');
      if (el) el.innerHTML = '';
    };
  }, [region, currencyCode, intlPaymentMethod]);

  const handleCardSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      setError('Please complete all required shipping and contact details above before continuing.');
      return;
    }
    if (!validateCardData()) {
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      const curBook = bookRef.current;
      if (!curBook) throw new Error('Book details not loaded');
      const curForm = formDataRef.current;

      let finalPhone = curForm.guestPhone.trim();
      const phoneDigits = finalPhone.replace(/\D/g, '');
      if (region === 'US' && phoneDigits.length === 10) {
        finalPhone = `+1${phoneDigits}`;
      } else if (region === 'UK' && (phoneDigits.length === 10 || phoneDigits.length === 11)) {
        finalPhone = phoneDigits.startsWith('0') ? `+44${phoneDigits.slice(1)}` : `+44${phoneDigits}`;
      }

      const payload = {
        userId: userRef.current?.id,
        guestEmail: curForm.guestEmail.trim(),
        guestName: curForm.guestName.trim(),
        guestPhone: finalPhone || undefined,
        shippingAddress: curForm.shippingAddress.trim(),
        city: curForm.city.trim(),
        state: curForm.state.trim(),
        pincode: curForm.pincode.trim(),
        items: [{ bookId: curBook.id, quantity: quantityRef.current }],
        country: region,
        currency: currencyCode,
        card: {
          number: cardData.number,
          expiry: cardData.expiry,
          cvv: cardData.cvv,
          name: cardData.name.trim() || curForm.guestName.trim(),
        },
      };

      const order = await ShopService.payWithCardDirect(payload);

      const successParams = new URLSearchParams({
        transaction_id: order?.id || order?.paypalOrderId || 'CARD-TXN',
        value: order?.totalAmount?.toString() || totalRef.current.toString(),
        quantity: quantityRef.current.toString(),
        item_id: curBook?.id || '',
        item_name: curBook?.title || '',
        price: getBookPrice(curBook, region).toString(),
        discount: '0',
        delivery: deliveryRef.current.toString(),
        cod_charge: '0',
        subtotal: subtotalRef.current.toString(),
        payment_method: 'ONLINE',
        image_url: curBook?.imageUrl || '/Page-1.png'
      });
      router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
    } catch (err: any) {
      console.error('[CARD DIRECT ERROR]', err);
      setError(err?.message || 'Card payment failed. Please check your card details.');
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (region === 'US' || region === 'UK') {
      if (intlPaymentMethod === 'CARD') {
        return handleCardSubmit(e);
      }
      return;
    }
    if (!book) return;

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let order = cachedOrder;

      let finalPhone = formData.guestPhone.trim();
      const phoneDigits = finalPhone.replace(/\D/g, '');
      if (region === 'IN') {
        if (phoneDigits.length === 10) {
          finalPhone = `+91${phoneDigits}`;
        } else if (phoneDigits.length === 12 && phoneDigits.startsWith('91')) {
          finalPhone = `+${phoneDigits}`;
        }
      }

      if (!order) {
        const orderData = {
          ...formData,
          guestPhone: finalPhone,
          userId: user?.id,
          items: [{ bookId: book.id, quantity }],
          couponCode: region === 'IN' ? appliedCoupon?.code : undefined,
          country: region,
          currency: currencyCode,
          comments: JSON.stringify({ country: region }),
        };
        order = await ShopService.createOrder(orderData);
        if (formData.paymentMethod === 'ONLINE') {
          setCachedOrder(order);
        }
      }

      // ── India Gateway routing (Razorpay or COD) ───────────────────────────
      if (formData.paymentMethod === 'ONLINE' && order.razorpayOrderId) {
        // Razorpay popup (India)
        if (typeof (window as any).Razorpay === 'undefined') {
          setError('Payment gateway is still loading. Please wait a few seconds and try again.');
          setProcessing(false);
          return;
        }
        const options = {
          key: order.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(order.totalAmount * 100),
          currency: order.currency || currencyCode,
          name: 'Infano.care',
          description: `Purchase: ${book.title}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ShopService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              const successParams = new URLSearchParams({
                transaction_id: order.id,
                value: order.totalAmount.toString(),
                quantity: quantity.toString(),
                item_id: book.id,
                item_name: book.title,
                price: getBookPrice(book, region).toString(),
                discount: discountAmount.toString(),
                delivery: delivery.toString(),
                cod_charge: codCharge.toString(),
                subtotal: subtotal.toString(),
                payment_method: formData.paymentMethod,
                image_url: book.imageUrl || '/Page-1.png'
              });
              router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
            } catch (err) {
              setError('Payment verification failed.');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: isAuthenticated ? user?.username : formData.guestName,
            email: formData.guestEmail,
            contact: finalPhone,
          },
          modal: {
            ondismiss: () => {
              setPaymentFailedReason('Payment window was closed before completion.');
              setPaymentFailed(true);
              setProcessing(false);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setPaymentFailedReason(response.error.description || 'Payment failed due to a network or banking issue.');
          setPaymentFailed(true);
          setProcessing(false);
        });
        rzpRef.current = rzp;
        rzp.open();

      } else {
        // COD (or fallback) — redirect to success immediately
        const successParams = new URLSearchParams({
          transaction_id: order.id,
          value: order.totalAmount.toString(),
          quantity: quantity.toString(),
          item_id: book.id,
          item_name: book.title,
          price: getBookPrice(book, region).toString(),
          discount: discountAmount.toString(),
          delivery: delivery.toString(),
          cod_charge: codCharge.toString(),
          subtotal: subtotal.toString(),
          payment_method: formData.paymentMethod,
          image_url: book.imageUrl || '/Page-1.png'
        });
        router.push(getLocalizedLink(`/purchase-success?${successParams.toString()}`));
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Order placement failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-primary/20 pt-20 md:pt-28 pb-16 font-sans">

      {/* Payment Failed Modal Popup */}
      {paymentFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-rose-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 shadow-sm">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Payment Failed</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{paymentFailedReason}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPaymentFailed(false);
                  if (region === 'IN' && rzpRef.current) {
                    rzpRef.current.open();
                  }
                }}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Retry Payment
              </button>
              <button
                onClick={() => setPaymentFailed(false)}
                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-sm border border-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {(region === 'US' || region === 'UK') && (
        <Script
          key={`paypal-sdk-${region}-${currencyCode}`}
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAAFardVSBZ0pcgeK2NqFbZNPYxzWOeODSCXI6AdAeFC5RkY40lEj7jqFeVVDv7QnCyJzSyo_oYLShPerc'}&currency=${currencyCode}&locale=${region === 'UK' ? 'en_GB' : 'en_US'}&components=buttons`}
        />
      )}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Link
          href={getLocalizedLink("/gigi-the-awkward-age-book")}
          className="inline-flex items-center text-slate-500 hover:text-primary mb-8 md:mb-12 transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to product
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* Left: Product Gallery & Summary */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 w-full max-w-full">
            <div className="space-y-2 max-w-100 mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {book?.title || 'The Awkward Age'}
              </h1>
              <p className="text-slate-500 font-medium text-sm italic">
                {book?.description || 'A story of every adolescent girl'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative aspect-3/4 rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-100 w-full max-w-100 mx-auto lg:mx-0">
                <Image
                  src={selectedImage}
                  alt="Book preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-all duration-700"
                  priority
                />
              </div>

              <div className="flex gap-2 flex-wrap max-w-100 mx-auto lg:mx-0 justify-center lg:justify-start">
                {bookImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-11 aspect-3/4 rounded-md overflow-hidden shrink-0 transition-all border-2 ${selectedImage === img ? 'border-primary ring-1 ring-primary/20' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="44px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/30 space-y-6 max-w-100 w-full mx-auto lg:mx-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Order summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center" itemScope itemType="https://schema.org/Offer">
                  <span className="text-slate-500 text-sm font-medium">Unit price</span>
                  <span className="font-bold text-slate-900 text-sm" data-price={getBookPrice(book, region)}>{formatPrice(getBookPrice(book, region), false)}</span>
                  <meta itemProp="price" content={getBookPrice(book, region).toString()} />
                  <meta itemProp="priceCurrency" content={currencyCode} />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 text-sm font-medium">Shipping charge</span>
                  <span className={`text-sm font-bold ${delivery === 0 ? 'text-emerald-600' : 'text-slate-900'}`} data-price={delivery}>
                    {delivery === 0 ? 'Free' : formatPrice(delivery, false)}
                  </span>
                </div>

                {region === 'IN' && formData.paymentMethod === 'COD' && (
                  <div className="flex justify-between items-center pt-1" itemScope itemType="https://schema.org/Offer">
                    <span className="text-slate-500 text-sm font-medium">Cash on Delivery</span>
                    <span className="font-bold text-slate-900 text-sm" data-price={book?.codChargeIN ?? 40}>₹{book?.codChargeIN ?? 40}</span>
                    <meta itemProp="price" content={(book?.codChargeIN ?? 40).toString()} />
                    <meta itemProp="priceCurrency" content="INR" />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-400 hover:text-slate-900 transition-colors font-bold"
                    >
                      -
                    </button>
                    <span className="text-slate-900 font-extrabold min-w-3 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(book?.stock || 10, quantity + 1))}
                      className="text-slate-400 hover:text-slate-900 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {region === 'IN' && discountAmount > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                      <Tag size={14} /> Discount
                    </span>
                    <span className="font-bold text-emerald-600 text-sm flex items-center gap-0.5">
                      <span>-₹</span>
                      <span data-price={discountAmount}>{discountAmount}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-5 border-t border-slate-100" itemScope itemType="https://schema.org/Offer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total amount</span>
                  <p className="text-[10px] text-slate-400 font-medium">Incl. of all taxes</p>
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter" data-price={total}>
                  {formatPrice(total, false)}
                </span>
                <meta itemProp="price" content={total.toString()} />
                <meta itemProp="priceCurrency" content={currencyCode} />
              </div>
            </div>
          </div>

          {/* Right: Unified Checkout Form */}
          <div className="lg:col-span-7 w-full max-w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 md:p-12 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>

              {/* Step 1: Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    01
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Personal details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Full name <span className="text-rose-500">*</span></label>
                    <input
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.guestName ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder={region === 'US' ? 'e.g. Sarah Jenkins' : region === 'UK' ? 'e.g. Emma Watson' : 'e.g. Ananya Sharma'}
                    />
                    {formErrors.guestName && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.guestName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Phone number <span className="text-rose-500">*</span></label>
                    
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-2 text-slate-500 font-bold text-sm pointer-events-none border-r border-slate-200 pr-2.5">
                        <img
                          src={`https://flagcdn.com/w40/${isoCode}.png`}
                          className="w-5 h-3.5 object-cover rounded-sm border border-slate-200/50 shrink-0"
                          alt={countryName}
                        />
                        <span>{dialCode}</span>
                      </div>
                      <input
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        className={`w-full pl-22 pr-4 py-3 rounded-lg bg-white border ${formErrors.guestPhone ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                        placeholder={region === 'IN' ? '10-digit mobile' : region === 'US' ? '10-digit phone' : 'Phone number'}
                      />
                    </div>
                    {formErrors.guestPhone && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.guestPhone}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                    Email address {region === 'IN' ? '(optional)' : <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.guestEmail ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                    placeholder="your@email.com"
                  />
                  {formErrors.guestEmail && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.guestEmail}</p>}
                </div>
              </div>

              {/* Step 2: Delivery Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    02
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Delivery address</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                      {region === 'US' ? 'ZIP Code' : region === 'UK' ? 'Postal Code' : 'Pincode'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={region === 'IN' ? 6 : region === 'US' ? 5 : 10}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.pincode ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                        placeholder={region === 'US' ? '5-digit ZIP (e.g. 90210)' : region === 'UK' ? 'e.g. SW1A 1AA' : '6-digit pincode'}
                      />
                      {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
                    </div>
                    {formErrors.pincode && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.pincode}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">Country</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-2 pointer-events-none">
                        <span className="text-base">{flagEmoji}</span>
                      </div>
                      <input
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-700 cursor-not-allowed text-sm shadow-inner"
                        value={`${countryName} (${region})`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.shippingAddress ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                    placeholder="House/Flat number, Street address"
                  />
                  {formErrors.shippingAddress && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.shippingAddress}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.city ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                      placeholder="City"
                    />
                    {formErrors.city && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                      {region === 'US' ? 'State' : region === 'UK' ? 'County / Region' : 'State'} <span className="text-rose-500">*</span>
                    </label>
                    {region === 'US' ? (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.state ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 text-sm shadow-sm`}
                      >
                        <option value="">Select State</option>
                        {US_STATES.map(s => (
                          <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white border ${formErrors.state ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm`}
                        placeholder={region === 'UK' ? 'e.g. Greater London' : 'State'}
                      />
                    )}
                    {formErrors.state && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{formErrors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Promo code (India only) */}
              {region === 'IN' && (
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold text-slate-600 ml-0.5">Promo code</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code e.g. PROMO15"
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode || validatingCoupon}
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {validatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <Tag size={13} className="text-emerald-600" />
                      <p className="text-emerald-700 text-[11px] font-bold">
                        🎉 Code <span className="font-black">{appliedCoupon.code}</span> applied — you save ₹{discountAmount}!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                    03
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Payment method</h2>
                </div>

                {region === 'IN' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      id='payment-online'
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ONLINE' }))}
                      className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'ONLINE' ? 'border-primary bg-primary/3' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <CreditCard size={20} className={formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-400'} />
                      <div className="space-y-1 text-center">
                        <div className={`text-base font-bold ${formData.paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-800'}`}>Pay online</div>
                        <div className="text-xs font-medium text-slate-500">Cards, UPI, NetBanking</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id='payment-cod'
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
                      className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/3' : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <Truck size={20} className={formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-400'} />
                      <div className="space-y-1 text-center">
                        <div className={`text-base font-bold ${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-800'}`}>Cash on delivery</div>
                        <div className="text-xs font-medium text-slate-500">Pay at door, just a little more!</div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="w-full grid sm:grid-cols-2 gap-3.5">
                    {/* Option 1: Credit / Debit Card */}
                    <button
                      type="button"
                      id="payment-card"
                      onClick={() => setIntlPaymentMethod('CARD')}
                      className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 text-center cursor-pointer ${
                        intlPaymentMethod === 'CARD'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <CreditCard size={22} className={intlPaymentMethod === 'CARD' ? 'text-primary' : 'text-slate-400'} />
                      <div className="space-y-1">
                        <div className={`text-sm font-bold ${intlPaymentMethod === 'CARD' ? 'text-primary' : 'text-slate-800'}`}>
                          Debit or Credit Card
                        </div>
                        <div className="text-[11px] font-medium text-slate-500">
                          Visa, Mastercard, AMEX, Discover
                        </div>
                      </div>
                    </button>

                    {/* Option 2: PayPal */}
                    <button
                      type="button"
                      id="payment-paypal"
                      onClick={() => setIntlPaymentMethod('PAYPAL')}
                      className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 text-center cursor-pointer ${
                        intlPaymentMethod === 'PAYPAL'
                          ? 'border-[#0070BA] bg-[#0070BA]/5 ring-1 ring-[#0070BA]/20 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center font-black italic text-base ${intlPaymentMethod === 'PAYPAL' ? 'text-[#0070BA]' : 'text-slate-400'}`}>
                        P
                      </div>
                      <div className="space-y-1">
                        <div className={`text-sm font-bold ${intlPaymentMethod === 'PAYPAL' ? 'text-[#0070BA]' : 'text-slate-800'}`}>
                          PayPal Wallet
                        </div>
                        <div className="text-[11px] font-medium text-slate-500">
                          1-Click Express checkout
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {/* Action area */}
              {region === 'IN' ? (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processing || pincodeLoading}
                    className="w-full py-4 bg-primary text-white rounded-lg font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing securely...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        {formData.paymentMethod === 'ONLINE' 
                          ? `Pay ${formatPrice(total, false)} & place order`
                          : `Place order via COD (${formatPrice(total, false)})`
                        }
                      </>
                    )}
                  </button>
                </div>
              ) : intlPaymentMethod === 'CARD' ? (
                <div key="intl-card-view" className="space-y-4 pt-1">
                  <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CreditCard size={15} className="text-primary" /> Card details
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Lock size={10} /> 256-bit Encrypted
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                        Card number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          name="cardNumber"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          maxLength={19}
                          value={cardData.number}
                          onChange={(e) => handleCardInputChange('number', e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className={`w-full px-3.5 py-2.5 rounded-lg bg-white border ${cardErrors.number ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-xs`}
                        />
                        <div className="absolute right-3 pointer-events-none flex items-center gap-1.5 text-slate-400">
                          <CreditCard size={16} />
                        </div>
                      </div>
                      {cardErrors.number && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{cardErrors.number}</p>}
                    </div>

                    {/* Expiration & CVV */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                          Expiration date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                          placeholder="MM/YY"
                          className={`w-full px-3.5 py-2.5 rounded-lg bg-white border ${cardErrors.expiry ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-xs`}
                        />
                        {cardErrors.expiry && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{cardErrors.expiry}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 ml-0.5">
                          Security code (CVV) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="cardCvv"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          placeholder="CVV"
                          className={`w-full px-3.5 py-2.5 rounded-lg bg-white border ${cardErrors.cvv ? 'border-rose-400 focus:ring-rose-50' : 'border-slate-200 focus:border-primary/60 focus:ring-primary/5'} focus:ring-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm shadow-xs`}
                        />
                        {cardErrors.cvv && <p className="text-[10px] text-rose-500 font-bold ml-0.5">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>

                  {processing && (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary bg-primary/5 rounded-xl border border-primary/20">
                      <Loader2 className="animate-spin" size={18} /> Authorizing card with bank & placing order...
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-primary text-white rounded-lg font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing card payment...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Pay {formatPrice(total, false)} & place order
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div key="intl-paypal-view" className="pt-2 space-y-3">
                  <div ref={paypalContainerRef} id="paypal-button-container" className="w-full min-h-[48px]" />

                  {!paypalReady && (
                    <div className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={18} /> Connecting to PayPal...
                    </div>
                  )}

                  {initiatingPayment && (
                    <div className="flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-bold text-slate-800 bg-primary/5 border border-primary/20 rounded-xl shadow-xs animate-pulse">
                      <Loader2 className="animate-spin text-primary shrink-0" size={16} />
                      <span>Connecting to PayPal... Please wait.</span>
                    </div>
                  )}

                  {processing && (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary bg-primary/5 rounded-xl border border-primary/20">
                      <Loader2 className="animate-spin" size={18} /> Processing payment & verifying shipping details...
                    </div>
                  )}
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-emerald-600 font-black text-xs">🔒 256-bit SSL</div>
                  <p className="text-[10px] text-slate-400 font-medium">Bank-grade security</p>
                </div>
                <div className="space-y-1">
                  <div className="text-primary font-black text-xs">🛡️ Buyer Protection</div>
                  <p className="text-[10px] text-slate-400 font-medium">{region === 'IN' ? 'Verified guarantee' : 'PayPal guarantee'}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-700 font-black text-xs">✈️ Tracked Post</div>
                  <p className="text-[10px] text-slate-400 font-medium">Delivered to {countryName}</p>
                </div>
              </div>

              <p className="text-center text-slate-500 text-[10px] font-medium pt-2">
                By placing order, you agree to our <Link href={getLocalizedLink("/legal#terms")} className="underline underline-offset-2 hover:text-primary transition-colors">Terms</Link> and <Link href={getLocalizedLink("/legal#privacy")} className="underline underline-offset-2 hover:text-primary transition-colors">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
