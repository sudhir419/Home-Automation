import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef<Point>({ x: -100, y: -100 });
  const ringPos = useRef<Point>({ x: -100, y: -100 });
  const isInsideWindow = useRef<boolean>(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      isInsideWindow.current = true;

      if (!isVisible) {
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        setIsVisible(true);
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, .btn, .nav-item, .device-card, .room-card, .chip, input, select, label, [role="button"]');
        setIsHovered(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => {
      isInsideWindow.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      ringPos.current.x = e.clientX;
      ringPos.current.y = e.clientY;
      isInsideWindow.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animId: number;

    const render = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // 1. Center dot follows mouse directly
      if (dotRef.current && isInsideWindow.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) ${
          isClicking ? 'scale(0.7)' : isHovered ? 'scale(1.3)' : 'scale(1)'
        }`;
      }

      // 2. Decreased circle follow speed:
      // 0.18 interpolation rate gives a gentle, elegant, relaxed elastic trail
      if (ringRef.current && isInsideWindow.current) {
        ringPos.current.x += (mx - ringPos.current.x) * 0.18;
        ringPos.current.y += (my - ringPos.current.y) * 0.18;

        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) ${
          isClicking ? 'scale(0.85)' : isHovered ? 'scale(1.4)' : 'scale(1)'
        }`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible, isHovered, isClicking]);

  return (
    <>
      {/* Outer Concentric Precision Ring with Relaxed Follow Speed */}
      <div
        ref={ringRef}
        className={`precision-cursor-ring ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
        aria-hidden="true"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Inner Solid Center Dot */}
      <div
        ref={dotRef}
        className={`precision-cursor-dot ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
        aria-hidden="true"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
