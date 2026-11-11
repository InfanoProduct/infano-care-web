import React from 'react';
import { Metadata } from 'next';
import CheckoutPage from '../page';

export const metadata: Metadata = {
  title: 'Secure Checkout | Gigi The Awkward Age | Infano Care',
  description: 'Complete your purchase securely on Infano Care.',
};

export default function BookCheckoutSlugPage() {
  return <CheckoutPage />;
}

