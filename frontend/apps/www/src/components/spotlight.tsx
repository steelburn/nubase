'use client';

import { motion } from 'motion/react';
import { cn } from '@nubase/ui';

/**
 * Aceternity-style Spotlight (MIT). A single soft conic glow used sparingly for
 * a refined, high-end hero — animated in with Motion instead of a Tailwind
 * keyframe so it needs no config changes.
 */
export function Spotlight({
  className,
  fill = 'white',
  delay = 0,
}: {
  className?: string;
  fill?: string;
  delay?: number;
}) {
  return (
    <motion.svg
      initial={{ opacity: 0, x: -40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('pointer-events-none absolute z-[1] h-[140%] w-[120%] lg:w-[80%]', className)}
      viewBox="0 0 3787 2842"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.18"
        />
      </g>
      <defs>
        <filter
          id="spotlight-blur"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </motion.svg>
  );
}
