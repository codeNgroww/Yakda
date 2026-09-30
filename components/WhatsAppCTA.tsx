'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function WhatsAppCTA() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 }); // distance from right/bottom
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const wasDragged = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const phoneNumber = '97145534286';
  const message = encodeURIComponent('Hi Yakda! I would like to know more about your products.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    wasDragged.current = false;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;

    const dx = dragRef.current.startX - e.clientX;
    const dy = dragRef.current.startY - e.clientY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      wasDragged.current = true;
    }

    const newX = Math.max(8, Math.min(window.innerWidth - 68, dragRef.current.startPosX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 68, dragRef.current.startPosY + dy));

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;

    // Snap to nearest edge (left or right)
    if (btnRef.current) {
      const btnRect = btnRef.current.getBoundingClientRect();
      const centerX = btnRect.left + btnRect.width / 2;
      const snapRight = window.innerWidth - centerX > centerX;
      setPosition(prev => ({
        ...prev,
        x: snapRight ? window.innerWidth - 84 : 24,
      }));
    }
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isExpanded]);


  return (
    <>
      {/* Tooltip bubble */}
      <div
        className={`fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[260px] transition-all duration-300 ${
          isExpanded
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
        }`}
        style={{
          bottom: position.y + 70,
          right: position.x,
          transformOrigin: 'bottom right',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.549 4.108 1.513 5.84L0 24l6.336-1.469A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.883 0-3.672-.508-5.25-1.463l-.375-.225-3.913.907.975-3.75-.247-.394A9.71 9.71 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A2A4E] mb-1">Chat with us!</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Need help? We&apos;re here to assist you with all your stationery needs.
            </p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full text-center bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          Start Chat
        </a>
      </div>

      {/* Floating WhatsApp Button — Draggable */}
      <button
        ref={btnRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => {
          if (!wasDragged.current) setIsExpanded(!isExpanded);
        }}
        className={`fixed z-[9999] w-[60px] h-[60px] rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)] transition-shadow group ${
          isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'
        }`}
        style={{
          right: position.x,
          bottom: position.y,
          transition: isDragging ? 'none' : 'right 0.3s ease, bottom 0.1s ease, transform 0.2s ease',
          touchAction: 'none',
        }}
        aria-label="Chat on WhatsApp"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="white"
          className="transition-transform duration-300 group-hover:rotate-[15deg] pointer-events-none"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.549 4.108 1.513 5.84L0 24l6.336-1.469A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.883 0-3.672-.508-5.25-1.463l-.375-.225-3.913.907.975-3.75-.247-.394A9.71 9.71 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
        </svg>

        {/* Pulse ring animation — only when not dragging */}
        {!isDragging && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none"></span>
        )}
      </button>
    </>
  );
}
