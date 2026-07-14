'use client';

import { motion } from 'motion/react';
import { textReveal } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealText({ as = 'p', className, children, ...props }) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.p;

  return (
    <Component
      ref={ref}
      className={className}
      variants={textReveal}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {children}
    </Component>
  );
}
