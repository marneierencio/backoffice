import type { NotificationData } from '@eds/components/NotificationPanel';
import { gql } from '@eds/utils/api';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_NOTIFICATIONS = 50;
const POLL_INTERVAL_MS = 30_000;

const MOCK_NOTIFICATIONS: NotificationData[] = [
  {
    id: 'mock-1',
    type: 'info',
    title: 'Welcome to Erencio',
    message: 'Your workspace is ready. Start by adding contacts and companies.',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'mock-2',
    type: 'success',
    title: 'Deal Closed',
    message: 'Acme Corp — Enterprise License has been marked as Closed Won.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

export type UseNotificationsReturn = {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
};

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationData[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await gql<{
        getNotifications?: {
          nodes: NotificationData[];
        };
      }>(`
        query GetNotifications {
          getNotifications(first: ${MAX_NOTIFICATIONS}, orderBy: { timestamp: DESC }) {
            nodes {
              id
              type
              title
              message
              timestamp
              read
              href
            }
          }
        }
      `);

      if (res.data?.getNotifications?.nodes) {
        setNotifications(res.data.getNotifications.nodes);
      }
      // If the query errors (endpoint not implemented), keep mock data
    } catch {
      // Graceful degradation: keep current notifications (mock data)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // Fire and forget mutation
    gql(`
      mutation MarkNotificationRead($id: ID!) {
        markNotificationAsRead(id: $id) { id read }
      }
    `, { id }).catch(() => {
      // Graceful degradation
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    gql(`
      mutation MarkAllNotificationsRead {
        markAllNotificationsAsRead { success }
      }
    `).catch(() => {
      // Graceful degradation
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};
