'use client';

import { motion } from 'motion/react';
import { yReveal } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealY({ as = 'div', className, children, ...props }) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      className={className}
      variants={yReveal}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {children}
    </Component>
  );
}
