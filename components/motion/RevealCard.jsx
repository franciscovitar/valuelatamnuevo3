'use client';

import { motion } from 'motion/react';
import { cardReveal } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealCard({ as = 'article', className, children, ...props }) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.article;

  return (
    <Component
      ref={ref}
      className={className}
      variants={cardReveal}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {children}
    </Component>
  );
}
