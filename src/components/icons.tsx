import React from 'react';

type IconProps = React.ComponentProps<'svg'> & {
  size?: number;
  color?: string;
};

export const LinkedinIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1c-.94.56-2 1-3.16 1.23A4.53 4.53 0 0 0 16.33 0c-2.51 0-4.55 2-4.55 4.49 0 .35.04.7.12 1.03C7.69 5.44 4.07 3.5 1.64 0.64a4.46 4.46 0 0 0-.62 2.26c0 1.55.79 2.91 2 3.71a4.28 4.28 0 0 1-2.07-.57v.06c0 2.15 1.55 3.94 3.6 4.35-.38.1-.77.15-1.18.15-.29 0-.57-.03-.85-.08.57 1.78 2.22 3.08 4.18 3.12A9.07 9.07 0 0 1 0 19.54 12.78 12.78 0 0 0 7 21c8.06 0 12.46-6.65 12.46-12.42 0-.19 0-.38-.01-.57A8.8 8.8 0 0 0 23 3z" />
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
