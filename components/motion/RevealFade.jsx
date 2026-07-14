'use client';

import { motion } from 'motion/react';
import { fadeReveal } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealFade({ as = 'div', className, children, ...props }) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      className={className}
      variants={fadeReveal}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {children}
    </Component>
  );
}
