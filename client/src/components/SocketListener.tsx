'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '@/lib/socket';
import { addNotification } from '@/store/slices/notificationSlice';
import { apiSlice } from '@/store/services/api';

export function SocketListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (data: any) => {
      dispatch(addNotification(data));
      // Invalidate relevant RTK Query tags to refresh data automatically
      dispatch(apiSlice.util.invalidateTags(['Notification', 'Product', 'Order']));
    };

    socket.on('notification', handleNotification);
    socket.on('sale_notification', handleNotification);
    socket.on('order_notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('sale_notification', handleNotification);
      socket.off('order_notification', handleNotification);
    };
  }, [dispatch]);

  return null;
}
