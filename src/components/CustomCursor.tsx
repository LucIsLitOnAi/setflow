"use client";
import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);


  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - (isHovered ? 24 : 8));
      cursorY.set(e.clientY - (isHovered ? 24 : 8));
      if (!isVisible) setIsVisible(true);
    };


    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("a, button, [role='button'], input, textarea, select");
      setIsHovered(!!isClickable);
      if (isClickable) {
        cursorX.set(e.clientX - 24);
        cursorY.set(e.clientY - 24);
      } else {
        cursorX.set(e.clientX - 8);
        cursorY.set(e.clientY - 8);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleElementHover);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
    };
  }, [cursorX, cursorY, isHovered]);

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full mix-blend-difference pointer-events-none z-[9999] bg-white hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
      animate={{
        width: isHovered ? 48 : 16,
        height: isHovered ? 48 : 16,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
}