import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, Notification } from '../lib/supabase';
import { Bell, Check, X, Clock, FileText, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';

const TYPE_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: FileText },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  update: { label: 'Update', color: 'bg-green-500/20 text-green-400', icon: TrendingUp },
  digest: { label: 'Digest', color: 'bg-purple-500/20 text-purple-400', icon: BarChart3 },
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    loadNotifications();
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id).eq('read', false);
    loadNotifications();
  }

  async function dismissNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    loadNotifications();
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-white text-black px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-sm text-gray-400 hover:text-white">
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'unread' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const config = TYPE_CONFIG[notification.type];
              const Icon = config.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-[#111] border rounded-xl p-4 transition ${
                    notification.read ? 'border-gray-800' : 'border-gray-700 bg-[#151515]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${config.color}`}>{config.label}</span>
                        <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                        {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <h4 className="font-medium mb-1">{notification.title}</h4>
                      <p className="text-gray-400 text-sm">{notification.message}</p>
                      {notification.action_url && (
                        <button
                          onClick={() => navigate(notification.action_url!)}
                          className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                        >
                          View details
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
