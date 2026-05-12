import { ReactNode } from 'react';

export interface SliderCourse {
  id: number;
  title: string;
  desc: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  price: string;
  image: string;
}

export interface ProblemItem {
  title: string;
  desc: string;
  color: string;
  image: string;
  link: string;
}

export interface FeatureItem {
  icon?: ReactNode;
  label: string;
}

export interface SuperpowerItem {
  title: string;
  desc: string;
  features: FeatureItem[];
  image: string;
  link: string;
}

export interface PartnerEditorialItem {
  title: string;
  desc: string;
  features: { label: string }[];
  image: string;
  link: string;
  icon: string;
  themeColor: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}
