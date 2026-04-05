/**
 * SocketContext — Socket.io client for real-time features
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // ── Booking confirmed ──
    socket.on('booking_confirmed', ({ message, booking }) => {
      toast.success(message, { duration: 5000, icon: '🎟️' });
      addNotification({ type: 'booking_confirmed', message, data: booking });
    });

    // ── Booking cancelled ──
    socket.on('booking_cancelled', ({ message }) => {
      toast(message, { icon: '❌' });
      addNotification({ type: 'booking_cancelled', message });
    });

    // ── New event broadcast ──
    socket.on('new_event', ({ message }) => {
      toast(message, { icon: '🎉', duration: 4000 });
      addNotification({ type: 'new_event', message });
    });

    // ── Event sold out ──
    socket.on('event_sold_out', ({ message }) => {
      toast.error(message, { icon: '🔴' });
      addNotification({ type: 'sold_out', message });
    });

    // ── New booking (for organizer) ──
    socket.on('new_booking', ({ message }) => {
      toast.success(message, { icon: '💰' });
      addNotification({ type: 'new_booking', message });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const addNotification = (notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), time: new Date() }, ...prev.slice(0, 19)]);
    setUnreadCount(prev => prev + 1);
  };

  const clearUnread = () => setUnreadCount(0);

  const joinEventRoom = (eventId) => {
    socketRef.current?.emit('join_event', eventId);
  };

  const leaveEventRoom = (eventId) => {
    socketRef.current?.emit('leave_event', eventId);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      notifications,
      unreadCount,
      clearUnread,
      joinEventRoom,
      leaveEventRoom,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
