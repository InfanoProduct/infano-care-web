import { FaqItem } from "../types";

export const PARENTS_FAQS: FaqItem[] = [
  {
    question: "Will my daughter's health data be shared with the school?",
    answer: "Never, without your daughter's explicit consent. Health data — including period tracking, mood logs, and journal entries — is entirely private to your daughter."
  },
  {
    question: "What age is the app suitable for?",
    answer: "Infano is designed for girls aged 10 to 21. Content is segmented by age group and unlocks progressively."
  },
  {
    question: "What if my daughter encounters something that upsets her?",
    answer: "Infano is a closed, moderated environment. All content is pre-approved by our expert council."
  },
  {
    question: "Can I see what she's doing on the app?",
    answer: "You have access to a parent dashboard that shows her learning journey progress, badges earned, and community engagement."
  }
];

export const SCHOOL_FAQS: FaqItem[] = [
  { 
    question: "How is student data protected?", 
    answer: "We utilize end-to-end encryption and strictly follow DPDP Act guidelines. No data is shared with third parties under any circumstances." 
  },
  { 
    question: "Is the content moderated?", 
    answer: "All student interactions within our digital spaces are moderated in real-time by both AI filters and human moderators." 
  },
  { 
    question: "What is the implementation timeline?", 
    answer: "Institutional onboarding typically takes 10 to 14 business days, including technical setup and faculty orientation." 
  }
];

export const ECOSYSTEM_FAQS: FaqItem[] = [
  {
    question: "Is the platform available offline?",
    answer: "Core content—including story journeys and the wellness tracker—is available offline and syncs when your daughter is connected. Live expert circles require internet connectivity."
  },
  {
    question: "In which languages is Infano available?",
    answer: "Infano is currently available in English, Hindi, Tamil, Telugu, Marathi, and Kannada. We are actively developing content in several other regional languages."
  },
  {
    question: "Is Infano available on iOS and Android?",
    answer: "Yes. The Infano app is available on both platforms. It is also accessible via any web browser for a desktop-friendly school or home experience."
  }
];
