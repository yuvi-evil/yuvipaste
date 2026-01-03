import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { RoutePath, Paste, ApiKey } from './types';
import { getPasteById, getSession, simulateCreatePasteApi, generateApiKey } from './services/mockService';
import { Login, Register, VerifyOTP } from './pages/Auth';
import { Overview, ApiKeys, PasteList } from './pages/Dashboard';
import { Button, Card, CopyButton } from './components/Common';
import { Code, ExternalLink, Shield, Zap, Lock, Database } from 'lucide-react';

// --- Guards ---

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getSession();
  if (!user) return <Navigate to={RoutePath.LOGIN} />;
  if (!user.isVerified) return <Navigate to={RoutePath.VERIFY} />;
  return <>{children}</>;
};

// --- Public Pages ---

const Navbar: React.FC = () => {
  const user = getSession();
  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="w-8 h-8 bg-yuvi-600 rounded-lg flex items-center justify-center text-white">Y</div>
            YUVI PASTE
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <Link to={RoutePath.DASHBOARD}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to={RoutePath.LOGIN} className="text-sm font-medium text-slate-600 hover:text-yuvi-600">Login</Link>
                <Link to={RoutePath.REGISTER}>
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <div className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6">v1.0 Public Release</Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            The Secure, API-First <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yuvi-600 to-blue-400">Developer Pastebin</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Store configuration files, logs, and code snippets securely. 
            Built for automation with strict API-key access controls and clean URLs.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={RoutePath.REGISTER}>
              <Button className="h-12 px-8 text-base shadow-yuvi-200 shadow-lg">Create Free Account</Button>
            </Link>
            <a href="https://firebase.google.com" target="_blank" rel="noreferrer">
              <Button variant="secondary" className="h-12 px-8 text-base">Read Documentation</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-yuvi-600" />}
              title="Identity First"
              desc="Email OTP verification required for all accounts. No anonymous spam."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="API Driven"
              desc="Generate API keys and integrate directly into your CI/CD pipelines."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-emerald-500" />}
              title="Secure Access"
              desc="Raw views are protected. Data is isolated per user in Firestore."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} YUVI Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const Badge: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yuvi-50 text-yuvi-700 border border-yuvi-100 ${className}`}>
    {children}
  </span>
);

const PasteView: React.FC = () => {
  const { id } = useParams();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(id) {
      getPasteById(id).then(p => {
        setPaste(p);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-yuvi-600 border-t-transparent rounded-full"></div></div>;

  if (!paste) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-300">404</h1>
      <p className="text-slate-500 mt-2">Paste not found or private.</p>
      <Link to="/" className="mt-6 text-yuvi-600 hover:underline">Go Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileIcon type={paste.type} />
              {paste.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span>{new Date(paste.createdAt).toLocaleString()}</span>
              <span>&bull;</span>
              <span>{paste.size} Bytes</span>
              <span>&bull;</span>
              <span className="uppercase">{paste.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`#/raw/${paste.id}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="text-xs h-8">Raw</Button>
            </a>
            <Button variant="secondary" className="text-xs h-8" onClick={() => navigator.clipboard.writeText(paste.content)}>Copy</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <pre className="p-6 overflow-x-auto text-sm font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
            {paste.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Raw view simulator (Usually handled by backend)
const RawView: React.FC = () => {
    const { id } = useParams();
    const [content, setContent] = useState('Loading...');
    
    useEffect(() => {
        if(id) getPasteById(id).then(p => setContent(p ? p.content : 'Not Found'));
    }, [id]);

    return (
        <pre style={{wordWrap: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace', padding: '1rem'}}>
            {content}
        </pre>
    )
}

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'json') return <span className="text-yellow-600 text-xs font-mono font-bold">{'{ }'}</span>;
  if (type === 'code') return <Code className="w-5 h-5 text-blue-500" />;
  return <Database className="w-5 h-5 text-slate-400" />;
};

// --- Main App ---

export default function App() {
  // Setup demo data on mount
  useEffect(() => {
    const setupDemo = async () => {
      // Create a demo user if empty
      const user = getSession();
      if(user && user.isVerified) {
         // ensure user has a key for demo purposes
         const keys = await import('./services/mockService').then(m => m.getApiKeys(user.uid));
         if(keys.length === 0) {
             const k = await import('./services/mockService').then(m => m.generateApiKey(user.uid));
             // Create a demo paste
             await simulateCreatePasteApi(k.key, 'welcome_config.json', JSON.stringify({ "app": "YUVI PASTE", "status": "operational", "demo": true }, null, 2), 'json');
         }
      }
    };
    setupDemo();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path={RoutePath.LOGIN} element={<Login />} />
        <Route path={RoutePath.REGISTER} element={<Register />} />
        <Route path={RoutePath.VERIFY} element={<VerifyOTP />} />
        
        {/* Dashboard Routes */}
        <Route path={RoutePath.DASHBOARD} element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path={RoutePath.API_KEYS} element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        <Route path={RoutePath.MY_PASTES} element={<ProtectedRoute><PasteList /></ProtectedRoute>} />
        
        {/* Paste Views */}
        <Route path="/paste/:id" element={<PasteView />} />
        <Route path="/raw/:id" element={<RawView />} />
      </Routes>
    </HashRouter>
  );
}