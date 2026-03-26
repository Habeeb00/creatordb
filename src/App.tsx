import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Search, 
  Plus, 
  Bell, 
  ArrowRight, 
  MoreHorizontal, 
  Download, 
  X, 
  Link as LinkIcon, 
  MapPin, 
  Mail, 
  Phone,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { cn, formatNumber, GENRES, LOCATIONS, INFLUENCER_SIZES, type Creator } from './lib/utils';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'creators', label: 'Creators', icon: Users },
    { id: 'shortlist', label: 'Shortlist', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'health', label: 'Health Check', icon: ShieldCheck },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#F9F9F9] border-r border-gray-100 flex flex-col py-8 z-50">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-black text-black tracking-tighter uppercase">The Curator</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Precision Suite</p>
      </div>
      
      <nav className="flex-1">
        <div className="px-6 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full px-6 py-3 flex items-center gap-3 transition-all duration-200 border-l-4",
              activeTab === item.id 
                ? "bg-white text-[#276EF1] border-[#276EF1]" 
                : "text-gray-600 border-transparent hover:bg-gray-200"
            )}
          >
            <item.icon size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-6 pt-6 border-t border-gray-100 space-y-1">
        <button className="w-full text-gray-500 py-2 flex items-center gap-3 hover:text-black transition-colors">
          <Settings size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Settings</span>
        </button>
        <button className="w-full text-gray-500 py-2 flex items-center gap-3 hover:text-black transition-colors">
          <HelpCircle size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Support</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ onAddClick }: { onAddClick: () => void }) => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white border-b border-gray-100 flex justify-between items-center px-8">
      <div className="flex items-center w-full max-w-lg">
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full bg-[#F6F6F6] border-none py-2 pl-10 pr-4 text-sm font-medium focus:ring-0 focus:bg-gray-100 transition-all placeholder:text-gray-400" 
            placeholder="Search database intelligence..." 
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
          New Export
        </button>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-black transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 bg-gray-200 overflow-hidden">
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const CreatorModal = ({ isOpen, onClose, onSave, initialData }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, initialData?: Creator }) => {
  const [formData, setFormData] = useState<Partial<Creator>>(initialData || {
    name: '',
    instagram_handle: '',
    profile_link: '',
    primary_location: '',
    secondary_location: '',
    category: GENRES[0],
    followers_count: '',
    avg_views: 0,
    avg_likes: 0,
    avg_comments: 0,
    contact_number: '',
    email: '',
    manager_details: '',
    commercials: '',
    flag_status: 'clean',
    secondary_category: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl border border-gray-200"
      >
        <div className="p-10 border-b border-gray-200 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="w-1.5 h-12 bg-[#276EF1]"></div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mb-1">Curation Engine</span>
              <h1 className="text-4xl font-black tracking-tighter text-black uppercase">{initialData ? 'Edit Creator' : 'Add New Creator'}</h1>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-16 scrollbar-hide">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1]">01 / Identity</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                <input 
                  className="uber-input w-full" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Alex Rivers" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Profile Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    className="uber-input w-full pl-10" 
                    value={formData.profile_link}
                    onChange={e => setFormData({...formData, profile_link: e.target.value})}
                    placeholder="instagram.com/alexrivers" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1]">02 / Classification</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Followers Count</label>
                <input 
                  className="uber-input w-full font-black text-lg" 
                  value={formData.followers_count}
                  onChange={e => setFormData({...formData, followers_count: e.target.value})}
                  placeholder="e.g. 250,000 or 1M+" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Genre</label>
                <select 
                  className="uber-input w-full appearance-none font-bold uppercase tracking-wider"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Secondary Genre</label>
                <select 
                  className="uber-input w-full appearance-none font-bold uppercase tracking-wider"
                  value={formData.secondary_category}
                  onChange={e => setFormData({...formData, secondary_category: e.target.value})}
                >
                  <option value="">None</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1]">03 / Geography</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Location</label>
                <select 
                  className="uber-input w-full appearance-none font-bold uppercase tracking-wider"
                  value={formData.primary_location}
                  onChange={e => setFormData({...formData, primary_location: e.target.value})}
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Secondary Location</label>
                <select 
                  className="uber-input w-full appearance-none font-bold uppercase tracking-wider"
                  value={formData.secondary_location}
                  onChange={e => setFormData({...formData, secondary_location: e.target.value})}
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1]">04 / Business & Contact</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Commercials (Rate)</label>
                <input 
                  className="uber-input w-full font-black text-lg" 
                  value={formData.commercials}
                  onChange={e => setFormData({...formData, commercials: e.target.value})}
                  placeholder="e.g. 12,500 - 15,000" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Mail ID</label>
                <input 
                  className="uber-input w-full" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="creator@agency.com" 
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-10 border-t-4 border-black bg-white flex justify-end gap-6">
          <button onClick={onClose} className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="bg-black text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            {initialData ? 'Update Creator' : 'Add Creator to Database'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Views ---

const DashboardView = ({ creators, onSearch }: { creators: Creator[], onSearch: (filters: any) => void }) => {
  const [filters, setFilters] = useState({
    name: '',
    size: 'All',
    genre: 'All',
    location: '',
    region: ''
  });

  // Calculate real insights from data
  const topPerformer = [...creators].sort((a, b) => (Number(b.avg_views) || 0) - (Number(a.avg_views) || 0))[0];
  const fastestGrowing = [...creators]
    .filter(c => c.avg_views)
    .sort((a, b) => (Number(b.engagement_rate) || 0) - (Number(a.engagement_rate) || 0))
    .slice(0, 2);

  const totalFollowers = creators.reduce((acc, c) => acc + (Number(c.followers_count) || 0), 0);
  const avgEngagement = (creators.reduce((acc, c) => acc + (Number(c.engagement_rate) || 0), 0) / (creators.length || 1)).toFixed(1);

  return (
    <div className="pt-28 pb-20 px-12 max-w-6xl">
      <section className="mb-16">
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tight text-black mb-2 uppercase">Creator Search</h2>
          <div className="h-1 w-12 bg-[#276EF1]"></div>
        </div>

        <div className="mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search by Name or Handle</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                className="w-full bg-[#F6F6F6] border border-gray-200 py-4 pl-12 pr-4 text-lg font-medium focus:border-black outline-none" 
                placeholder="Enter name or @handle..." 
                value={filters.name}
                onChange={e => setFilters({...filters, name: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size</label>
            <select 
              className="w-full bg-[#F6F6F6] border border-gray-200 py-3 px-4 text-sm font-medium focus:border-black outline-none"
              value={filters.size}
              onChange={e => setFilters({...filters, size: e.target.value})}
            >
              <option value="All">All Sizes</option>
              {INFLUENCER_SIZES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Genre</label>
            <select 
              className="w-full bg-[#F6F6F6] border border-gray-200 py-3 px-4 text-sm font-medium focus:border-black outline-none"
              value={filters.genre}
              onChange={e => setFilters({...filters, genre: e.target.value})}
            >
              <option value="All">All Genres</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</label>
            <select 
              className="w-full bg-[#F6F6F6] border border-gray-200 py-3 px-4 text-sm font-medium focus:border-black outline-none"
              value={filters.location}
              onChange={e => setFilters({...filters, location: e.target.value})}
            >
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Region</label>
            <select 
              className="w-full bg-[#F6F6F6] border border-gray-200 py-3 px-4 text-sm font-medium focus:border-black outline-none"
              value={filters.region}
              onChange={e => setFilters({...filters, region: e.target.value})}
            >
              <option value="">All Regions</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={() => onSearch(filters)}
            className="w-full md:w-auto px-10 py-4 bg-[#276EF1] text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Search className="mr-2" size={18} />
            Execute Search
          </button>
          <button 
            onClick={() => {
              const reset = { name: '', size: 'All', genre: 'All', location: '', region: '' };
              setFilters(reset);
              onSearch(reset);
            }}
            className="w-full md:w-auto px-10 py-4 bg-gray-100 text-black font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-black uppercase tracking-tight">Active Inventory Intel</h3>
            <p className="text-gray-500 text-xs mt-1">Real-time data from your connected Google Sheet</p>
          </div>
          <button className="text-[#276EF1] text-[11px] font-bold uppercase tracking-widest flex items-center hover:underline">
            Database Map <ArrowRight className="ml-1" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 border border-gray-200 p-8 flex flex-col justify-between">
            {topPerformer ? (
              <>
                <div>
                  <div className="inline-block px-2 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest mb-6">Top Performer</div>
                  <h4 className="text-4xl font-black mb-3">{topPerformer.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-lg mb-8">
                    Dominating the <span className="text-black font-bold">{topPerformer.category}</span> vertical with 
                    average views exceeding <span className="text-[#276EF1] font-bold">{formatNumber(topPerformer.avg_views)}</span> per post.
                    Verified influence in {topPerformer.primary_location}.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-0 border-t border-gray-100 pt-8">
                  <div className="border-r border-gray-100 pr-6">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Followers</p>
                    <p className="text-3xl font-black text-black">{formatNumber(topPerformer.followers_count)}</p>
                  </div>
                  <div className="border-r border-gray-100 px-6">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Engagement</p>
                    <p className="text-3xl font-black text-[#276EF1]">{topPerformer.engagement_rate}%</p>
                  </div>
                  <div className="pl-6">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Avg Views</p>
                    <p className="text-3xl font-black text-black">{formatNumber(topPerformer.avg_views)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 font-bold uppercase tracking-widest">Loading metrics...</p>
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-6">
            <div className="border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest">Network Impact</h5>
                  <p className="text-[10px] text-gray-500 font-medium">Real-time Stats</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-normal mb-6">
                Your total network reach is now <span className="text-[#276EF1] font-bold">{formatNumber(totalFollowers)}</span> across all verticals.
              </p>
              <div className="p-3 bg-white border border-gray-100 mb-6">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Portfolio Engagement</p>
                <p className="text-xl font-black text-black">{avgEngagement}% <span className="text-[10px] text-green-500 ml-1">AVG</span></p>
              </div>
            </div>
            <div className="border border-gray-200 p-6">
              <h5 className="text-xs font-black uppercase tracking-widest mb-4">High Engagement</h5>
              <div className="space-y-3">
                {fastestGrowing.map((c, i) => (
                  <div key={i} className={cn("flex items-center justify-between py-2", i === 0 && "border-b border-gray-100")}>
                    <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[120px]">{c.name}</span>
                    <span className="text-xs font-bold text-[#276EF1]">{c.engagement_rate}% E.R</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const CreatorDetailPanel = ({ isOpen, onClose, creator, onSave }: { isOpen: boolean, onClose: () => void, creator: Creator | null, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Creator>>({});
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    if (creator) setFormData(creator);
  }, [creator]);

  if (!creator) return null;

  const handleScrape = async () => {
    setIsScraping(true);
    const toastId = toast.loading("Scraping latest reels...");
    try {
      const res = await fetch(`/api/creators/${creator.id}/scrape`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Scraped ${data.reels_count} reels! Avg Views: ${formatNumber(data.avg_views)}`, { id: toastId });
        setFormData(prev => ({ 
          ...prev, 
          avg_views: data.avg_views,
          avg_likes: data.avg_likes,
          avg_comments: data.avg_comments,
          engagement_rate: data.engagement_rate,
          profile_pic_url: data.profile_pic_url
        }));
      } else {
        toast.error(data.error || "Failed to scrape Instagram", { id: toastId });
      }
    } catch (error) {
      toast.error("Error connecting to scraper", { id: toastId });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] ml-64"
          />
          <motion.section 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-[750px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-5">
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-all rounded-full">
                  <X size={20} />
                </button>
                <div>
                  <h3 className="font-black text-2xl text-black leading-none">{creator.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Editor Active</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Last updated: {creator.last_updated_at || 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4">
                  <div className="aspect-square bg-gray-50 border border-gray-100 overflow-hidden">
                    <img 
                      src={(formData.profile_pic_url || creator.profile_pic_url) ? `/api/image?url=${encodeURIComponent((formData.profile_pic_url || creator.profile_pic_url) as string)}` : `https://picsum.photos/seed/${creator.id}/400/400`} 
                      alt={creator.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('picsum.photos')) {
                          target.src = `https://picsum.photos/seed/${creator.id}/400/400`;
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="col-span-8 grid grid-cols-2 gap-px bg-gray-100 border border-gray-100">
                  <div className="bg-white p-6 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Followers</p>
                    <p className="text-3xl font-black text-black">{formatNumber(creator.followers_count)}</p>
                  </div>
                  <div className="bg-white p-6 flex flex-col justify-center border-l border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Engagement Rate</p>
                    <p className="text-3xl font-black text-[#276EF1]">{formData.engagement_rate || creator.engagement_rate}%</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                    <div className="text-center flex-1 border-r border-gray-200 relative group">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Avg. Views</p>
                      <p className="text-lg font-black text-black">{formatNumber(formData.avg_views || creator.avg_views)}</p>
                      <button 
                        onClick={handleScrape}
                        disabled={isScraping}
                        className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="Scrape latest reels"
                      >
                        {isScraping ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <BarChart3 size={10} />}
                      </button>
                    </div>
                    <div className="text-center flex-1 border-r border-gray-200">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Likes</p>
                      <p className="text-lg font-black text-black">{formatNumber(formData.avg_likes || creator.avg_likes)}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Comments</p>
                      <p className="text-lg font-black text-black">{formatNumber(formData.avg_comments || creator.avg_comments)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-4">
                    <Briefcase className="text-[#276EF1]" size={18} />
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-black">Business Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Handle</label>
                      <input 
                        className="w-full uber-input" 
                        value={formData.instagram_handle || ''} 
                        onChange={e => setFormData({...formData, instagram_handle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Email</label>
                      <input 
                        className="w-full uber-input" 
                        value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Commercials</label>
                      <input 
                        className="w-full uber-input font-black" 
                        value={formData.commercials || ''} 
                        onChange={e => setFormData({...formData, commercials: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-4">
                    <ShieldCheck className="text-[#276EF1]" size={18} />
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-black">Internal Intel</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Vetting Status</label>
                      <select 
                        className="w-full uber-input uppercase tracking-wider font-black appearance-none"
                        value={formData.flag_status}
                        onChange={e => setFormData({...formData, flag_status: e.target.value as any})}
                      >
                        <option value="clean">Clean</option>
                        <option value="caution">Caution</option>
                        <option value="blacklisted">Blacklisted</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Comments</label>
                      <textarea 
                        className="w-full bg-[#F6F6F6] text-black p-4 text-sm font-medium leading-relaxed min-h-[140px] focus:ring-0 border-none resize-none"
                        value={formData.comments || ''}
                        onChange={e => setFormData({...formData, comments: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t-4 border-black bg-white flex justify-end gap-4">
              <button 
                onClick={() => onSave(formData)}
                className="w-full h-14 flex items-center justify-center bg-black text-white hover:opacity-80 transition-all font-black text-sm uppercase tracking-[0.2em] gap-3"
              >
                Save Changes
              </button>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
};

const CreatorsListView = ({ 
  creators, 
  onEdit, 
  onShortlist, 
  shortlistedIds,
  onSort,
  sortConfig,
  onSearch,
  activeFilters,
  onScrape,
  isBulkScraping
}: { 
  creators: Creator[], 
  onEdit: (c: Creator) => void, 
  onShortlist: (id: string) => void, 
  shortlistedIds: Set<string>,
  onSort?: (key: string) => void,
  sortConfig?: { key: string, order: 'asc' | 'desc' },
  onSearch?: (filters: any) => void,
  activeFilters?: any,
  onScrape?: (id: string) => void,
  isBulkScraping?: boolean
}) => {
  const SortIcon = ({ column }: { column: string }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown size={12} className="ml-1 opacity-20" />;
    return sortConfig.order === 'asc' ? <ArrowUp size={12} className="ml-1 text-black" /> : <ArrowDown size={12} className="ml-1 text-black" />;
  };

  return (
    <div className="pt-24 px-10 pb-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          <span>Inventory</span>
          <ChevronRight size={12} />
          <span className="text-black">Discovery</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase">Search Results</h2>
      </div>

      {isBulkScraping && (
        <div className="mb-10 bg-[#276EF1] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
            <div className="h-full bg-white transition-all duration-[60000ms] ease-linear" style={{ width: '100%' }}></div>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-80 mb-1">Intelligence Engine</p>
                <h3 className="text-2xl font-black uppercase tracking-tight">Updating Result Metrics</h3>
                <p className="text-sm mt-1 opacity-90 font-medium">Re-calculating Average Views and Engagement Rates for these search results...</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black mb-1">SYNCING</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">EST. TIME: ~60S</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex border border-gray-100 mb-8 divide-x divide-gray-100">
        <div className="flex-1 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Creators</p>
          <p className="text-2xl font-bold">{Array.isArray(creators) ? creators.length : 0}</p>
        </div>
        <div className="flex-1 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Platform Avg. Views</p>
          <p className="text-2xl font-bold text-[#276EF1]">
            {Array.isArray(creators) 
              ? formatNumber(Math.round(creators.reduce((acc, c) => acc + (Number(c.avg_views) || 0), 0) / (creators.length || 1)))
              : "0"}
          </p>
        </div>
        <div className="flex-1 p-6 flex items-center justify-between">
          <div className="flex-1 flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text"
                placeholder="Search name or handle..."
                className="w-full bg-gray-50 border border-gray-100 py-2 pl-10 pr-10 text-xs font-medium focus:border-black outline-none"
                value={activeFilters?.name || ''}
                onChange={(e) => onSearch?.({ ...activeFilters, name: e.target.value })}
              />
              {activeFilters?.name && (
                <button 
                  onClick={() => onSearch?.({ ...activeFilters, name: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <select 
              className="bg-gray-50 border border-gray-100 py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-black outline-none"
              value={activeFilters?.genre || 'All'}
              onChange={(e) => onSearch?.({ ...activeFilters, genre: e.target.value })}
            >
              <option value="All">Genre</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              className="bg-gray-50 border border-gray-100 py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-black outline-none"
              value={activeFilters?.size || 'All'}
              onChange={(e) => onSearch?.({ ...activeFilters, size: e.target.value })}
            >
              <option value="All">Size</option>
              {INFLUENCER_SIZES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>

            <select 
              className="bg-gray-50 border border-gray-100 py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-black outline-none"
              value={activeFilters?.location || ''}
              onChange={(e) => onSearch?.({ ...activeFilters, location: e.target.value })}
            >
              <option value="">Location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button 
            onClick={() => onSearch?.({ name: '', size: 'All', genre: 'All', location: '', region: '' })}
            className="p-2 ml-2 hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
            title="Clear all filters"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {activeFilters && Object.values(activeFilters).some(v => v && v !== 'All') && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'All') return null;
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                <span>{key}: {value as string}</span>
                <button onClick={() => onSearch?.({ ...activeFilters, [key]: key === 'size' || key === 'genre' ? 'All' : '' })}>
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead className="bg-white border-b border-gray-100">
            <tr className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <th className="py-4 px-6 w-12">
                <input type="checkbox" className="w-4 h-4 border-2 border-gray-300 rounded-none checked:bg-black" />
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort?.('name')}>
                <div className="flex items-center">Name <SortIcon column="name" /></div>
              </th>
              <th className="py-4 px-4">Handle</th>
              <th className="py-4 px-4 text-right cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort?.('followers_count')}>
                <div className="flex items-center justify-end">Followers <SortIcon column="followers_count" /></div>
              </th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Location</th>
              <th className="py-4 px-4 text-right cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onSort?.('avg_views')}>
                <div className="flex items-center justify-end">Avg. Views <SortIcon column="avg_views" /></div>
              </th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-6 w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(creators) && creators.map((creator, index) => (
              <tr 
                key={creator.id || `creator-${index}`} 
                className="base-table-row group cursor-pointer"
                onClick={() => onEdit(creator)}
              >
                <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={shortlistedIds.has(creator.id)}
                    onChange={() => onShortlist(creator.id)}
                    className="w-4 h-4 border-2 border-gray-300 rounded-none checked:bg-black cursor-pointer" 
                  />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 overflow-hidden rounded-full shrink-0">
                      <img 
                        src={creator.profile_pic_url ? `/api/image?url=${encodeURIComponent(creator.profile_pic_url)}` : `https://picsum.photos/seed/${creator.id}/100/100`} 
                        alt={creator.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('picsum.photos')) {
                            target.src = `https://picsum.photos/seed/${creator.id}/100/100`;
                          }
                        }}
                      />
                    </div>
                    <span className="font-semibold text-sm">{creator.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">@{creator.instagram_handle}</td>
                <td className="py-4 px-4 text-sm font-medium text-right">{formatNumber(creator.followers_count)}</td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600">{creator.category}</span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{creator.primary_location}</td>
                <td className="py-4 px-4 text-sm font-bold text-[#276EF1] text-right">{formatNumber(creator.avg_views)}</td>
                <td className="py-4 px-4">
                  <span className={cn(
                    "inline-flex items-center text-[10px] font-bold uppercase",
                    creator.flag_status === 'clean' ? "text-green-600" : 
                    creator.flag_status === 'caution' ? "text-amber-600" : "text-red-600"
                  )}>
                    {creator.flag_status}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onScrape?.(creator.id); }}
                      className="p-1 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                      title="Scrape latest reels"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-black">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HealthCheckView = ({ onRefresh }: { onRefresh: () => void }) => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/sheets');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      toast.error("Failed to fetch health status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 px-10 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-10 pb-10 max-w-5xl">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          <span>System</span>
          <ChevronRight size={12} />
          <span className="text-black">Health Check</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight uppercase">Sheet Integration Status</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-100 p-8 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Connection Status</p>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              health?.status === 'connected' ? "bg-green-500" : "bg-red-500"
            )}></div>
            <p className="text-2xl font-black uppercase tracking-tight">
              {health?.status === 'connected' ? 'Connected' : 'Error'}
            </p>
          </div>
        </div>
        <div className="border border-gray-100 p-8 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Spreadsheet ID</p>
          <p className="text-sm font-mono truncate text-gray-600">{health?.spreadsheetId}</p>
        </div>
        <div className="border border-gray-100 p-8 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Sheet</p>
          <p className="text-2xl font-black uppercase tracking-tight">{health?.details?.activeSheet || 'N/A'}</p>
        </div>
      </div>

      <div className="border border-gray-100 p-8 bg-white mb-12">
        <h3 className="text-xs font-black uppercase tracking-widest mb-6">Database Maintenance</h3>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="p-6 bg-gray-50 border border-gray-100">
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-2">Missing Profile Pictures</h4>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Scan all creators in your database and automatically fetch their Instagram profile pictures if they are missing.
            </p>
            <button 
              onClick={async () => {
                const toastId = toast.loading("Bulk updating profile pictures...");
                try {
                  const res = await fetch('/api/creators/bulk-profile-pics', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    toast.success(`Updated ${data.updatedCount} profile pictures!`, { id: toastId });
                    onRefresh();
                  } else {
                    toast.error(data.error || "Failed to bulk update", { id: toastId });
                  }
                } catch (error) {
                  toast.error("Network error during bulk update", { id: toastId });
                }
              }}
              className="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Start Bulk Update
            </button>
          </div>
        </div>
      </div>

      {health?.status === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-8 mb-12">
          <h3 className="text-red-800 font-black text-xs uppercase tracking-widest mb-2">Error Details</h3>
          <p className="text-red-700 text-sm font-medium mb-4">{health.error}</p>
          {health.errorType === 'API_NOT_ENABLED' && (
            <div className="mt-6 p-6 bg-white border border-red-100">
              <p className="text-sm text-gray-700 mb-4 font-bold">The Google Sheets API is not enabled for your project.</p>
              <a 
                href="https://console.developers.google.com/apis/api/sheets.googleapis.com/overview" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Enable API in Console
              </a>
            </div>
          )}
        </div>
      )}

      {health?.status === 'connected' && (
        <div className="space-y-12">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1] mb-6 flex items-center gap-4">
              Available Sheets
              <div className="flex-1 h-px bg-gray-100"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {health.details.sheets?.map((s: any) => (
                <div key={s.title} className={cn(
                  "p-6 border flex justify-between items-center",
                  s.title === health.details.activeSheet ? "border-black bg-gray-50" : "border-gray-100"
                )}>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{s.title}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{s.rowCount} Rows × {s.columnCount} Columns</p>
                  </div>
                  {s.title === health.details.activeSheet && (
                    <span className="px-2 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest">Active</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#276EF1] mb-6 flex items-center gap-4">
              Detected Headers
              <div className="flex-1 h-px bg-gray-100"></div>
            </h3>
            <div className="flex flex-wrap gap-2">
              {health.details.headers?.map((h: string) => (
                <span key={h} className="px-4 py-2 bg-gray-100 text-black text-[10px] font-bold uppercase tracking-widest border border-gray-200">
                  {h}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-gray-50 p-8 border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Configuration Check</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Service Account</span>
                <span className="text-xs font-mono">{health.serviceAccountEmail}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Private Key</span>
                <span className={cn("text-xs font-bold uppercase", health.privateKeySet ? "text-green-600" : "text-red-600")}>
                  {health.privateKeySet ? 'Configured' : 'Missing'}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="mt-16">
        <button 
          onClick={fetchHealth}
          className="px-10 py-4 bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all"
        >
          Refresh Diagnostics
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, order: 'asc' | 'desc' }>({ key: 'name', order: 'asc' });
  const [isBulkScraping, setIsBulkScraping] = useState(false);
  const [bulkScrapeProgress, setBulkScrapeProgress] = useState({ current: 0, total: 0 });
  const [activeFilters, setActiveFilters] = useState<any>({});

  const fetchCreators = async (filters = {}, sort = sortConfig, triggerScrape = false) => {
    setLoading(true);
    setActiveFilters(filters);
    try {
      const params = new URLSearchParams({
        ...filters,
        sort: sort.key,
        order: sort.order
      });
      const res = await fetch(`/api/creators?${params}`);
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setCreators(data);
        
        // If a new search was triggered and we have results, update their metrics
        if (triggerScrape && data.length > 0) {
          const ids = data.map((c: Creator) => c.id);
          setIsBulkScraping(true);
          setBulkScrapeProgress({ current: 0, total: data.length });
          toast.info(`Updating metrics for ${data.length} search results...`);
          
          fetch('/api/creators/bulk-scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          }).then(async (scrapeRes) => {
            const scrapeData = await scrapeRes.json();
            if (scrapeData.success) {
              toast.success(`Updated metrics for ${scrapeData.updatedCount} creators!`);
              // Re-fetch to show latest data
              fetchCreators(filters, sort, false);
            }
          }).catch(() => {
            toast.error("Failed to update results metrics");
          }).finally(() => {
            setIsBulkScraping(false);
          });
        }
      } else {
        setCreators([]);
        toast.error(data.error || "Failed to fetch creators");
      }
    } catch (error) {
      setCreators([]);
      toast.error("Failed to fetch creators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleSaveCreator = async (data: any) => {
    try {
      const url = editingCreator ? `/api/creators/${editingCreator.id}` : '/api/creators';
      const method = editingCreator ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingCreator ? "Creator updated" : "Creator added");
        setIsModalOpen(false);
        setIsPanelOpen(false);
        setEditingCreator(null);
        fetchCreators();
      } else {
        toast.error("Failed to save creator");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const toggleShortlist = (id: string) => {
    const next = new Set(shortlistedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setShortlistedIds(next);
  };

  const handleExport = async () => {
    if (shortlistedIds.size === 0) {
      toast.error("No creators shortlisted");
      return;
    }

    const safeCreators = Array.isArray(creators) ? creators : [];
    const shortlisted = safeCreators.filter(c => shortlistedIds.has(c.id));
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creators: shortlisted }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shortlist.xlsx';
        a.click();
        toast.success("Export successful");
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleSort = (key: string) => {
    const order = sortConfig.key === key && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSort = { key, order };
    setSortConfig(newSort);
    fetchCreators(activeFilters, newSort);
  };

  const handleScrape = async (id: string) => {
    const toastId = toast.loading("Scraping latest reels...");
    try {
      const res = await fetch(`/api/creators/${id}/scrape`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Scraped ${data.reels_count} reels! Avg Views: ${formatNumber(data.avg_views)}`, { id: toastId });
        fetchCreators(activeFilters); // Refresh list
      } else {
        toast.error(data.error || "Failed to scrape Instagram", { id: toastId });
      }
    } catch (error) {
      toast.error("Error connecting to scraper", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header onAddClick={() => { setEditingCreator(null); setIsModalOpen(true); }} />

      <main className="ml-64 min-h-screen">
        {activeTab === 'dashboard' && (
          <DashboardView creators={creators} onSearch={(f) => { fetchCreators(f, sortConfig, true); setActiveTab('creators'); }} />
        )}
        
        {activeTab === 'creators' && (
          <CreatorsListView 
            creators={creators} 
            onEdit={(c) => { setEditingCreator(c); setIsPanelOpen(true); }}
            onShortlist={toggleShortlist}
            shortlistedIds={shortlistedIds}
            onSort={handleSort}
            sortConfig={sortConfig}
            onSearch={fetchCreators}
            activeFilters={activeFilters}
            onScrape={handleScrape}
            isBulkScraping={isBulkScraping}
          />
        )}

        {activeTab === 'shortlist' && (
          <CreatorsListView 
            creators={(Array.isArray(creators) ? creators : []).filter(c => shortlistedIds.has(c.id))} 
            onEdit={(c) => { setEditingCreator(c); setIsPanelOpen(true); }}
            onShortlist={toggleShortlist}
            shortlistedIds={shortlistedIds}
            onSort={handleSort}
            sortConfig={sortConfig}
            onSearch={fetchCreators}
            activeFilters={activeFilters}
            onScrape={handleScrape}
            isBulkScraping={isBulkScraping}
          />
        )}

        {activeTab === 'health' && (
          <HealthCheckView onRefresh={() => fetchCreators(activeFilters)} />
        )}
      </main>

      <CreatorModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCreator(null); }}
        onSave={handleSaveCreator}
      />

      <CreatorDetailPanel 
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setEditingCreator(null); }}
        creator={editingCreator}
        onSave={handleSaveCreator}
      />

      <div className="fixed bottom-8 right-8 flex gap-3 z-50">
        <button 
          onClick={() => { setEditingCreator(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-black text-white px-6 py-4 font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg uppercase tracking-widest"
        >
          <Plus size={20} />
          Add Creator
        </button>
        {shortlistedIds.size > 0 && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-black px-6 py-4 font-bold text-sm hover:bg-gray-50 transition-all shadow-lg uppercase tracking-widest"
          >
            <Download size={20} />
            Export Shortlist ({shortlistedIds.size})
          </button>
        )}
      </div>
    </div>
  );
}
