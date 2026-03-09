import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Calendar {
  id: string;
  summary: string;
  description: string;
  backgroundColor: string;
  primary: boolean;
  provider: string;
  enabled?: boolean;
}

const STORAGE_KEY = 'enabled_calendars';

export function useCalendars() {
  const { getToken } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);

  // Load enabled calendars from localStorage
  const getEnabledCalendars = (): Record<string, boolean> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveEnabledCalendars = (enabled: Record<string, boolean>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  async function fetchCalendars() {
    try {
      const token = getToken();
      const res = await fetch('/api/calendars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const enabled = getEnabledCalendars();
        
        // Merge with enabled state
        const merged: Calendar[] = data.map((cal: Calendar) => ({
          ...cal,
          enabled: enabled[cal.id] === false ? false : true
        }));
        
        setCalendars(merged);
      }
    } catch (e) {
      console.error('Failed to fetch calendars:', e);
    }
    setLoading(false);
  }

  function toggleCalendar(id: string) {
    const updated = calendars.map(cal => 
      cal.id === id ? { ...cal, enabled: cal.enabled === false ? true : false } : cal
    );
    setCalendars(updated);
    
    // Save to localStorage
    const enabled: Record<string, boolean> = {};
    updated.forEach(cal => {
      enabled[cal.id] = cal.enabled || false;
    });
    saveEnabledCalendars(enabled);
  }

  function getEnabledIds(): string[] {
    return calendars.filter(cal => cal.enabled).map(cal => cal.id);
  }

  return { calendars, loading, toggleCalendar, getEnabledIds, refetch: fetchCalendars };
}
