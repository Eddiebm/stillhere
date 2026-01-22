import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, Post, UserProfile, Campaign, PlatformCredential, Notification, PLATFORMS, SUPABASE_URL } from '../lib/supabase';
import PlatformIcon from '../components/PlatformIcon';
import { LayoutDashboard, Link2, FileText, Calendar, Settings, LogOut, Plus, Check, X, Edit3, Clock, Sparkles, ChevronLeft, ChevronRight, CreditCard, Loader2, Globe, Key, Lightbulb, Bell } from 'lucide-react';

type Tab = 'dashboard' | 'accounts' | 'queue' | 'calendar' | 'settings';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [schedulingPost, setSchedulingPost] = useState<Post | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [credentialForm, setCredentialForm] = useState({ api_key: '', api_secret: '', access_token: '' });
  const [savingCredential, setSavingCredential] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ website_url: '', openai_api_key: '' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkOnboarding();
    loadData();
  }, [user]);

  async function checkOnboarding() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking onboarding:', error);
      return;
    }
    
    if (!data || !data.onboarding_completed) {
      navigate('/onboarding');
    } else {
      setProfile(data);
      setSettingsForm({
        website_url: data.website_url || '',
        openai_api_key: data.openai_api_key || '',
      });
    }
  }

  async function loadData() {
    const [postsRes, campaignsRes, credentialsRes, notifsRes] = await Promise.all([
      supabase.from('posts').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('platform_credentials').select('*').eq('user_id', user?.id),
      supabase.from('notifications').select('*').eq('user_id', user?.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
    ]);
    
    setPosts(postsRes.data || []);
    setCampaigns(campaignsRes.data || []);
    setCredentials(credentialsRes.data || []);
    setNotifications(notifsRes.data || []);
  }

  async function updatePostStatus(postId: string, status: string) {
    await supabase.from('posts').update({ status, updated_at: new Date().toISOString() }).eq('id', postId);
    loadData();
  }

  async function updatePostContent(postId: string, content: string) {
    await supabase.from('posts').update({ content, updated_at: new Date().toISOString() }).eq('id', postId);
    setEditingPost(null);
    loadData();
  }

  async function schedulePost(postId: string) {
    if (!scheduleDate || !scheduleTime) return;
    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    await supabase.from('posts').update({ 
      status: 'scheduled', 
      scheduled_for: scheduledFor,
      updated_at: new Date().toISOString() 
    }).eq('id', postId);
    
    // Create notification for scheduled post
    if (user) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'scheduled',
        title: 'Post scheduled',
        message: `Post scheduled for ${new Date(scheduledFor).toLocaleDateString()} at ${new Date(scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        action_url: '/dashboard?tab=calendar',
      });
    }
    
    setSchedulingPost(null);
    setScheduleDate('');
    setScheduleTime('09:00');
    loadData();
  }

  async function saveCredential(platform: string) {
    if (!user) return;
    setSavingCredential(true);
    try {
      await supabase.from('platform_credentials').upsert({
        user_id: user.id,
        platform,
        credentials: credentialForm,
        is_connected: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform' });
      setConnectingPlatform(null);
      setCredentialForm({ api_key: '', api_secret: '', access_token: '' });
      loadData();
    } catch (error) {
      console.error('Error saving credential:', error);
    } finally {
      setSavingCredential(false);
    }
  }

  async function disconnectPlatform(platform: string) {
    if (!user) return;
    await supabase.from('platform_credentials').delete().eq('user_id', user.id).eq('platform', platform);
    loadData();
  }

  async function saveSettings() {
    if (!user || !profile) return;
    setSavingSettings(true);
    try {
      let websiteContent = profile.website_content;
      
      if (settingsForm.website_url && settingsForm.website_url !== profile.website_url) {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-website`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: settingsForm.website_url }),
          });
          const data = await response.json();
          if (data.content) websiteContent = data.content;
        } catch (e) {
          console.error('Scrape error:', e);
        }
      }
      
      await supabase.from('user_profiles').update({
        website_url: settingsForm.website_url,
        website_content: websiteContent,
        openai_api_key: settingsForm.openai_api_key,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
      
      checkOnboarding();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSavingSettings(false);
    }
  }

  function handleLogout() {
    signOut();
    navigate('/');
  }

  const draftPosts = posts.filter(p => p.status === 'draft');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const thisWeekPosts = posts.filter(p => {
    const created = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  });

  const isConnected = (platform: string) => credentials.some(c => c.platform === platform && c.is_connected);

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: Date[] = [];
    
    for (let i = startPadding - 1; i >= 0; i--) days.push(new Date(year, month, -i));
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) days.push(new Date(year, month + 1, i));
    return days;
  };

  const getPostsForDate = (date: Date) => scheduledPosts.filter(p => 
    p.scheduled_for && new Date(p.scheduled_for).toDateString() === date.toDateString()
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-64 bg-[#111] border-r border-gray-800 p-6 flex flex-col">
        <img src="/images/logo.png" alt="StillHereHQ" className="h-8 mb-8" />
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'accounts', icon: Link2, label: 'Accounts' },
            { id: 'queue', icon: FileText, label: 'Content Queue' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition ${
                activeTab === item.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          
          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-gray-400 hover:text-white hover:bg-gray-800 mt-4"
          >
            <Bell className="w-5 h-5" />
            Notifications
            {notifications.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{notifications.length}</span>
            )}
          </button>

          <button
            onClick={() => navigate('/insights')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Lightbulb className="w-5 h-5" />
            Insights
          </button>

          <button
            onClick={() => navigate('/create-campaign')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Sparkles className="w-5 h-5" />
            Create Campaign
          </button>

          <button
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-gray-400 hover:text-white hover:bg-gray-800 mt-2"
          >
            <CreditCard className="w-5 h-5" />
            Upgrade Plan
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                {profile?.company_name && <p className="text-gray-400">{profile.company_name}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifDropdown && (
                    <div className="absolute right-0 top-12 w-80 bg-[#111] border border-gray-800 rounded-xl shadow-xl z-50">
                      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        <button onClick={() => navigate('/notifications')} className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.slice(0, 5).map(n => (
                            <div key={n.id} className="p-3 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => { setShowNotifDropdown(false); if(n.action_url) navigate(n.action_url); }}>
                              <p className="text-sm font-medium truncate">{n.title}</p>
                              <p className="text-xs text-gray-500 truncate">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => navigate('/create-campaign')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> New Campaign
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Posts This Week</p>
                <p className="text-3xl font-bold">{thisWeekPosts.length}</p>
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-400">{draftPosts.length}</p>
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-green-400">{scheduledPosts.length}</p>
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Platforms Connected</p>
                <p className="text-3xl font-bold">{credentials.filter(c => c.is_connected).length}</p>
              </div>
            </div>
            
            {draftPosts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pending Approval</h2>
                  <button onClick={() => setActiveTab('queue')} className="text-sm text-gray-400 hover:text-white">View All</button>
                </div>
                <div className="space-y-3">
                  {draftPosts.slice(0, 5).map(post => (
                    <div key={post.id} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                      <PlatformIcon platform={post.platform} />
                      <p className="flex-1 text-gray-300 line-clamp-2">{post.content}</p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setSchedulingPost(post)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30" title="Schedule">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingPost(post)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => updatePostStatus(post.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draftPosts.length === 0 && campaigns.length === 0 && (
              <div className="bg-[#111] border border-gray-800 rounded-xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create your first campaign</h3>
                <p className="text-gray-400 mb-6">Generate AI-powered content for your social media</p>
                <button onClick={() => navigate('/create-campaign')} className="bg-white text-black px-6 py-2 rounded-lg font-medium">
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accounts' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Connected Accounts</h1>
            <p className="text-gray-400 mb-6">Connect your social media accounts to publish content</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map(platform => {
                const connected = isConnected(platform.id);
                return (
                  <div key={platform.id} className="bg-[#111] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={platform.id} className="w-6 h-6" />
                        <span className="font-semibold">{platform.name}</span>
                      </div>
                      {connected && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Connected</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Max {platform.charLimit.toLocaleString()} characters</p>
                    {connected ? (
                      <button onClick={() => disconnectPlatform(platform.id)} className="w-full border border-red-500/50 text-red-400 py-2 rounded-lg hover:bg-red-500/10">
                        Disconnect
                      </button>
                    ) : (
                      <button onClick={() => setConnectingPlatform(platform.id)} className="w-full border border-gray-700 py-2 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Content Queue</h1>
              <button onClick={() => navigate('/create-campaign')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> Generate Posts
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="bg-[#111] border border-gray-800 rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">Create a campaign to generate your first posts</p>
                <button onClick={() => navigate('/create-campaign')} className="bg-white text-black px-6 py-2 rounded-lg font-medium">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.filter(p => p.status !== 'rejected').map(post => (
                  <div key={post.id} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                    <PlatformIcon platform={post.platform} className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 mb-2">{post.content}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          post.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{post.status}</span>
                        {post.scheduled_for && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.scheduled_for).toLocaleDateString()} at {new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {post.status === 'draft' && (
                        <>
                          <button onClick={() => setSchedulingPost(post)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30" title="Schedule">
                            <Clock className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingPost(post)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => updatePostStatus(post.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {post.status === 'scheduled' && (
                        <button onClick={() => setEditingPost(post)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Scheduled Posts Calendar</h1>
              <div className="flex items-center gap-4">
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-gray-800 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-gray-800 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-500 text-sm py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                  const dayPosts = getPostsForDate(date);
                  
                  return (
                    <div key={i} className={`min-h-[80px] p-2 rounded-lg text-sm ${
                      isToday ? 'bg-white text-black' : isCurrentMonth ? 'bg-[#1a1a1a] text-gray-400' : 'bg-[#0f0f0f] text-gray-600'
                    }`}>
                      <div className="font-medium mb-1">{date.getDate()}</div>
                      {dayPosts.slice(0, 2).map((post, j) => (
                        <div key={j} className={`text-xs truncate mb-1 px-1 py-0.5 rounded ${
                          post.platform === 'twitter' ? 'bg-sky-500/20 text-sky-400' :
                          post.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {post.scheduled_for && new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                      {dayPosts.length > 2 && <div className="text-xs text-gray-500">+{dayPosts.length - 2} more</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="max-w-2xl space-y-6">
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Account</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Plan</label>
                    <div className="flex items-center justify-between">
                      <p className="text-white">Free Plan</p>
                      <button onClick={() => navigate('/pricing')} className="text-sm text-blue-400 hover:text-blue-300">Upgrade</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Website
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={settingsForm.website_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, website_url: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                      placeholder="https://yourcompany.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll scan your website to help generate better content</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-gray-400" />
                  AI Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">OpenAI API Key (optional)</label>
                    <input
                      type="password"
                      value={settingsForm.openai_api_key}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openai_api_key: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                      placeholder="sk-..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Provide your own API key for enhanced AI content generation</p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="w-full bg-white text-black py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>

              {profile && (
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Profile</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Role</label>
                      <p className="text-white">{profile.role || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Company</label>
                      <p className="text-white">{profile.company_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Industry</label>
                      <p className="text-white">{profile.industry || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tone</label>
                      <p className="text-white capitalize">{profile.tone?.replace('_', ' ') || '-'}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/onboarding')} className="text-sm text-gray-400 hover:text-white mt-4">
                    Update profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Connect Platform Modal */}
      {connectingPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConnectingPlatform(null)}>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <PlatformIcon platform={connectingPlatform} className="w-6 h-6" />
              <h3 className="text-xl font-bold">Connect {PLATFORMS.find(p => p.id === connectingPlatform)?.name}</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">API Key</label>
                <input
                  type="password"
                  value={credentialForm.api_key}
                  onChange={(e) => setCredentialForm({ ...credentialForm, api_key: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">API Secret (optional)</label>
                <input
                  type="password"
                  value={credentialForm.api_secret}
                  onChange={(e) => setCredentialForm({ ...credentialForm, api_secret: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                  placeholder="Enter API secret"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Access Token (optional)</label>
                <input
                  type="password"
                  value={credentialForm.access_token}
                  onChange={(e) => setCredentialForm({ ...credentialForm, access_token: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                  placeholder="Enter access token"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setConnectingPlatform(null)} className="flex-1 border border-gray-700 py-2 rounded-lg hover:border-gray-500">Cancel</button>
              <button
                onClick={() => saveCredential(connectingPlatform)}
                disabled={!credentialForm.api_key || savingCredential}
                className="flex-1 bg-white text-black py-2 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingCredential ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savingCredential ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingPost(null)}>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Post</h3>
            <textarea
              defaultValue={editingPost.content}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white h-32 mb-4 focus:outline-none focus:border-gray-500 resize-none"
              id="edit-content"
            />
            <div className="flex gap-4">
              <button onClick={() => setEditingPost(null)} className="flex-1 border border-gray-700 py-2 rounded-lg hover:border-gray-500">Cancel</button>
              <button
                onClick={() => updatePostContent(editingPost.id, (document.getElementById('edit-content') as HTMLTextAreaElement).value)}
                className="flex-1 bg-white text-black py-2 rounded-lg font-medium"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {schedulingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSchedulingPost(null)}>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Schedule Post</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{schedulingPost.content}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSchedulingPost(null)} className="flex-1 border border-gray-700 py-2 rounded-lg hover:border-gray-500">Cancel</button>
              <button
                onClick={() => schedulePost(schedulingPost.id)}
                disabled={!scheduleDate}
                className="flex-1 bg-white text-black py-2 rounded-lg font-medium disabled:opacity-50"
              >Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
