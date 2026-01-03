import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/Common';
import { mockLogin, mockRegister, mockVerifyOTP, getSession } from '../services/mockService';
import { RoutePath } from '../types';
import { ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yuvi-600 text-white mb-4 shadow-lg shadow-yuvi-200">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="text-slate-500 mt-2 text-sm">{subtitle}</div>
      </div>
      {children}
      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} YUVI Systems. Secure by default.
      </div>
    </div>
  </div>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await mockLogin(email, password);
      if (!user.isVerified) {
        navigate(RoutePath.VERIFY);
      } else {
        navigate(RoutePath.DASHBOARD);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your API keys and pastes">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="yuvipanel1@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <Button type="submit" className="w-full" isLoading={loading}>Sign In</Button>
          <div className="text-center mt-4">
            <span className="text-sm text-slate-500">Don't have an account? </span>
            <a href={`#${RoutePath.REGISTER}`} className="text-sm font-medium text-yuvi-600 hover:text-yuvi-700">Register</a>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await mockRegister(email, password);
      // Automatically redirect to verify on success
      navigate(RoutePath.VERIFY);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the secure developer paste platform">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start">
            <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            We strictly accept Gmail accounts for OTP verification security in this demo.
          </div>
          <Input 
            label="Gmail Address" 
            type="email" 
            placeholder="yuvipanel1@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <Button type="submit" className="w-full" isLoading={loading}>Create Account</Button>
          <div className="text-center mt-4">
            <span className="text-sm text-slate-500">Already have an account? </span>
            <a href={`#${RoutePath.LOGIN}`} className="text-sm font-medium text-yuvi-600 hover:text-yuvi-700">Sign In</a>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};

export const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('your email');
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if(session) {
      setUserEmail(session.email);
    } else {
      // If no session, redirect to login
      navigate(RoutePath.LOGIN);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await mockVerifyOTP(otp);
      navigate(RoutePath.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setMsg(`New code sent to ${userEmail}`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <AuthLayout 
      title="Verify Identity" 
      subtitle={
        <span>
          Enter the 6-digit code sent to <br/>
          <span className="font-semibold text-yuvi-700">{userEmail}</span>
        </span>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
             <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 mb-2">
               <Lock className="w-5 h-5" />
             </div>
             <p className="text-sm text-slate-500 mb-4">
               For this demo, check your console or just use any 6-digit code (e.g., 123456).
             </p>
          </div>
          
          <div>
            <input 
              className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border-b-2 border-slate-200 focus:border-yuvi-500 focus:outline-none bg-transparent"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
            />
          </div>

          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
          {msg && <div className="text-green-600 text-center text-sm flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4"/> {msg}</div>}
          
          <Button type="submit" className="w-full" isLoading={loading} disabled={otp.length !== 6}>
            Verify Code
          </Button>
          
          <div className="text-center">
             <button type="button" onClick={handleResend} className="text-xs text-slate-400 hover:text-yuvi-600">Resend Code</button>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};