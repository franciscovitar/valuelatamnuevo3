'use client';

import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/lib/motion/variants';
import { useRevealAnimation, useInViewOnce, useMotionReduced } from '@/lib/motion/hooks';

export default function RevealStagger({
  as = 'div',
  className,
  children,
  itemAs = 'div',
  ...props
}) {
  const reduceMotion = useMotionReduced();
  const [ref, inView] = useInViewOnce();
  const { initial, getAnimate } = useRevealAnimation(reduceMotion);
  const Component = motion[as] || motion.div;
  const Item = motion[itemAs] || motion.div;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial={initial}
      animate={getAnimate(inView)}
      {...props}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <Item key={child?.key ?? index} variants={staggerItem}>
              {child}
            </Item>
          ))
        : children}
    </Component>
  );
}
