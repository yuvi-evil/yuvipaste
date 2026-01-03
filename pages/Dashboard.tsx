import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Key, FileText, Plus, Trash2, Eye, Terminal, 
  RefreshCw, LogOut, LayoutDashboard 
} from 'lucide-react';

import { User, ApiKey, Paste, RoutePath } from '../types';
import { getApiKeys, generateApiKey, revokeApiKey, getPastes, getSession, logout } from '../services/mockService';
import { Button, Card, Badge, CopyButton, Modal } from '../components/Common';

// --- Components ---

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, to: string }> = ({ icon, label, active, to }) => (
  <Link to={to} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1
    ${active ? 'bg-yuvi-50 text-yuvi-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <span className={`${active ? 'text-yuvi-600' : 'text-slate-400'} mr-3`}>{icon}</span>
    {label}
  </Link>
);

const DashboardLayout: React.FC<{ children: React.ReactNode, activePage: string }> = ({ children, activePage }) => {
  const navigate = useNavigate();
  const user = getSession();

  const handleLogout = () => {
    logout();
    navigate(RoutePath.LOGIN);
  };

  if (!user) return null; // Should be handled by route protection

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <span className="font-bold text-lg text-slate-800">YUVI PASTE</span>
        <Button variant="ghost" onClick={handleLogout}><LogOut className="w-5 h-5" /></Button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-yuvi-600 rounded-lg flex items-center justify-center text-white text-lg">Y</span>
            YUVI PASTE
          </h1>
        </div>
        
        <nav className="flex-1 p-4">
          <SidebarItem 
            to={RoutePath.DASHBOARD} 
            icon={<LayoutDashboard className="w-5 h-5"/>} 
            label="Overview" 
            active={activePage === 'overview'} 
          />
          <SidebarItem 
            to={RoutePath.API_KEYS} 
            icon={<Key className="w-5 h-5"/>} 
            label="API Keys" 
            active={activePage === 'keys'} 
          />
          <SidebarItem 
            to={RoutePath.MY_PASTES} 
            icon={<FileText className="w-5 h-5"/>} 
            label="My Pastes" 
            active={activePage === 'pastes'} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-yuvi-100 text-yuvi-700 flex items-center justify-center font-bold text-xs">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
              <p className="text-xs text-slate-500">Free Plan</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-none" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Pages ---

export const Overview: React.FC = () => {
  const [stats, setStats] = useState({ pastes: 0, keys: 0 });
  const [data, setData] = useState<any[]>([]);
  const user = getSession();

  useEffect(() => {
    if (user) {
      Promise.all([getPastes(user.uid), getApiKeys(user.uid)]).then(([p, k]) => {
        setStats({ pastes: p.length, keys: k.filter(key => key.status === 'active').length });
        
        // Mock chart data
        setData([
          { name: 'Used', value: p.length },
          { name: 'Remaining', value: 10 - p.length }
        ]);
      });
    }
  }, [user]);

  return (
    <DashboardLayout activePage="overview">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back to your secure workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-yuvi-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pastes</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.pastes}<span className="text-slate-300 text-lg">/10</span></h3>
            </div>
            <div className="p-3 bg-yuvi-50 text-yuvi-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active API Keys</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.keys}<span className="text-slate-300 text-lg">/2</span></h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Account Status</p>
              <h3 className="text-lg font-bold text-emerald-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Usage Quota">
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide domain={[0, 10]} />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">Free Tier Limit: 10 Pastes</p>
        </Card>

        <Card title="Quick Start" className="flex flex-col">
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto flex-1">
            <p className="text-slate-500 mb-2"># Create a paste via CLI</p>
            <p className="whitespace-pre">
              <span className="text-pink-400">curl</span> -X POST \<br/>
              &nbsp;&nbsp;https://yuvi-paste.web.app/api/paste \<br/>
              &nbsp;&nbsp;-H <span className="text-green-400">"X-API-KEY: YOUR_KEY"</span> \<br/>
              &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
              &nbsp;&nbsp;-d <span className="text-yellow-300">'{"{"}"title":"my-log","content":"hello","type":"text"}'</span>
            </p>
          </div>
          <div className="mt-4 text-right">
             <Link to={RoutePath.API_KEYS} className="text-sm text-yuvi-600 font-medium hover:underline">Get API Key &rarr;</Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Sub-component for Icon
const ShieldCheckIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const user = getSession();

  const loadKeys = async () => {
    if(user) setKeys(await getApiKeys(user.uid));
  };

  useEffect(() => { loadKeys(); }, [user]);

  const handleGenerate = async () => {
    if(!user) return;
    setLoading(true);
    try {
      const k = await generateApiKey(user.uid);
      setNewKey(k.key);
      await loadKeys();
      setModalOpen(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if(!confirm('Are you sure you want to revoke this key? Apps using it will stop working immediately.')) return;
    await revokeApiKey(id);
    await loadKeys();
  };

  return (
    <DashboardLayout activePage="keys">
       <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Keys</h2>
          <p className="text-slate-500 mt-1">Manage access tokens for programmatic paste creation.</p>
        </div>
        <Button onClick={handleGenerate} isLoading={loading} disabled={keys.filter(k => k.status === 'active').length >= 2}>
          <Plus className="w-4 h-4 mr-2" /> Generate Key
        </Button>
      </div>

      <Card>
        {keys.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No API Keys</h3>
            <p className="text-slate-500 mt-1 mb-4">Generate your first key to start creating pastes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Key ID</th>
                  <th className="px-6 py-4 font-medium">Preview</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{key.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-800">
                      {key.status === 'active' ? 'YUVI_••••••••••••' : '•••••••••••••••••'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={key.status === 'active' ? 'success' : 'neutral'}>
                        {key.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {key.status === 'active' && (
                        <button onClick={() => handleRevoke(key.id)} className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center justify-end w-full gap-1">
                          <Trash2 className="w-3 h-3" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="API Key Generated">
        <div className="text-center">
          <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-lg text-sm">
            This key will only be shown once. Copy it now.
          </div>
          {newKey && (
            <div className="relative">
              <input readOnly value={newKey} className="w-full bg-slate-100 border border-slate-200 rounded-lg py-3 px-4 font-mono text-sm text-slate-800 focus:outline-none mb-4" />
              <div className="absolute right-2 top-2.5">
                <CopyButton text={newKey} />
              </div>
            </div>
          )}
          <Button onClick={() => setModalOpen(false)} className="w-full">Done</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export const PasteList: React.FC = () => {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const user = getSession();

  useEffect(() => {
    if(user) getPastes(user.uid).then(setPastes);
  }, [user]);

  return (
    <DashboardLayout activePage="pastes">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Pastes</h2>
        <p className="text-slate-500 mt-1">View and manage your code snippets.</p>
      </div>

      <Card>
        {pastes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No Pastes Yet</h3>
            <p className="text-slate-500 mt-1">Use the API to create your first secure paste.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Size</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pastes.map((paste) => (
                  <tr key={paste.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{paste.title}</td>
                    <td className="px-6 py-4"><span className="uppercase text-xs font-bold text-slate-400">{paste.type}</span></td>
                    <td className="px-6 py-4 text-slate-500">{paste.size} B</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(paste.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <Link to={`/paste/${paste.id}`} className="text-yuvi-600 hover:text-yuvi-800 flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                      <Link to={`/raw/${paste.id}`} target="_blank" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium">
                        <Terminal className="w-3 h-3" /> Raw
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};