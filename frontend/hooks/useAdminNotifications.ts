'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

export interface AdminSseEvent {
  type: 'NEW_ORDER' | 'PAYMENT_PROOF' | 'PING';
  orderId?: string;
  orderNumber?: string;
  userName?: string;
  message?: string;
  totalPrice?: number;
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    // Two-tone chime: D5 → A4
    const tones = [587.33, 440];
    tones.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch { /* AudioContext not available */ }
}

type EventCallback = (event: AdminSseEvent) => void;

export function useAdminNotifications(onEvent: EventCallback) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const esRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!isAuthenticated || !isAdmin()) return;
    if (esRef.current) esRef.current.close();

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1';
    const url = `${apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event: AdminSseEvent = JSON.parse(e.data);
        if (event.type !== 'PING') {
          playNotificationSound();
          onEventRef.current(event);
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);
}
