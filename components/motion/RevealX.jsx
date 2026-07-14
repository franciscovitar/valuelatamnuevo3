'use client';

import { motion } from 'motion/react';
import { xRevealLeft, xRevealRight } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealX({
  as = 'div',
  className,
  children,
  direction = 'left',
  ...props
}) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.div;
  const variants = direction === 'right' ? xRevealRight : xRevealLeft;

  return (
    <Component
      ref={ref}
      className={className}
      variants={variants}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {children}
    </Component>
  );
}
