import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  provider: string;
  color: string;
}

export function useCalendar(date: string) {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [date]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const res = await fetch(`/api/calendar?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await res.json();
      setEvents(data);
    } catch (e: any) {
      setError(e.message);
    }
    
    setLoading(false);
  }

  return { events, loading, error, refetch: fetchEvents };
}

function CalendarDay({ date, onDateChange }: { date: string; onDateChange: (d: string) => void }) {
  const { events, loading, error } = useCalendar(date);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handlePrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="calendar-day">
      <div className="calendar-nav">
        <button onClick={handlePrevDay} className="nav-btn">← Previous</button>
        <div className="date-display">
          <span className="date-text">{formatDate(date)}</span>
          <button onClick={handleToday} className="today-btn">Today</button>
        </div>
        <button onClick={handleNextDay} className="nav-btn">Next →</button>
      </div>

      {loading ? (
        <p className="placeholder">Loading events...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : events.length === 0 ? (
        <p className="placeholder">No events for this day</p>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-item" style={{ borderLeftColor: event.color }}>
              <div className="event-time">
                {formatTime(event.start)} - {formatTime(event.end)}
              </div>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
                <span className="event-provider">{event.provider}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarDay;
