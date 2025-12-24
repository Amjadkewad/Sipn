import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/mockService';
import { UserRole } from '../types';

interface AuthProps {
  onLoginSuccess: (role: UserRole) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [method, setMethod] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Specific state for Admin Login
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isAdminMode) {
          // Admin Login Logic
          const user = loginUser(adminUser, adminPass, false);
          if (user && user.role === UserRole.ADMIN) {
              onLoginSuccess(UserRole.ADMIN);
          } else {
              setError("Invalid Admin Credentials");
          }
          return;
      }

      if (isLogin) {
        // User Login Logic
        const identifier = method === 'EMAIL' ? email : mobile;
        const pass = password;
        
        // Prevent admin login from user form
        if (identifier === 'Amjad kewad') {
            setError("Please use the Admin Portal for admin access.");
            return;
        }

        const user = loginUser(identifier, pass, method === 'MOBILE');
        if (user) {
          onLoginSuccess(user.role);
        } else {
          setError('Invalid credentials or user not found.');
        }

      } else {
        // User Signup Logic
        if (!name || (!email && !mobile) || !password) {
            setError('Please fill all fields');
            return;
        }
        registerUser(name, email, mobile, password);
        const user = loginUser(email || mobile, password, method === 'MOBILE');
        if (user) onLoginSuccess(user.role);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    try {
        const fakeEmail = `google_user_${Math.floor(Math.random()*1000)}@gmail.com`;
        let user = loginUser(fakeEmail, '', false);
        if(!user) {
            registerUser('Google User', fakeEmail, '');
            user = loginUser(fakeEmail, '', false);
        }
        if(user) onLoginSuccess(user.role);
    } catch(e: any) {
        setError(e.message);
    }
  };

  if (isAdminMode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm border-t-4 border-yellow-500">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Panel</h2>
                <p className="text-center text-gray-500 text-sm mb-6">Restricted Access</p>
                
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-xs text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase">Username</label>
                        <input 
                            type="text" 
                            value={adminUser} 
                            onChange={e => setAdminUser(e.target.value)}
                            className="w-full p-2 border rounded mt-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase">Password</label>
                        <input 
                            type="password" 
                            value={adminPass} 
                            onChange={e => setAdminPass(e.target.value)}
                            className="w-full p-2 border rounded mt-1 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded transition">
                        Access Dashboard
                    </button>
                </form>

                <button onClick={() => { setIsAdminMode(false); setError(''); }} className="mt-4 text-xs text-gray-400 hover:text-gray-600 w-full text-center">
                    ← Back to User App
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-appbg p-4 relative transition-colors duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-2">SpinRewards</h2>
        <p className="text-center text-gray-500 mb-6">{isLogin ? 'Welcome Back!' : 'Create an Account'}</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isLogin ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isLogin ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-600 outline-none" placeholder="John Doe" />
            </div>
          )}

          <div className="flex gap-2 mb-2">
             <button type="button" onClick={() => setMethod('EMAIL')} className={`text-xs px-2 py-1 rounded ${method === 'EMAIL' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200'}`}>Email</button>
             <button type="button" onClick={() => setMethod('MOBILE')} className={`text-xs px-2 py-1 rounded ${method === 'MOBILE' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200'}`}>Mobile</button>
          </div>

          {method === 'EMAIL' ? (
             <div>
               <label className="block text-sm font-medium text-gray-700">Email / Username</label>
               <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-600 outline-none" placeholder="user@example.com" />
             </div>
          ) : (
             <div>
               <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
               <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-600 outline-none" placeholder="03001234567" />
             </div>
          )}

           <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-600 outline-none" 
                placeholder="••••••••" 
              />
              {isLogin && <p className="text-right text-xs text-primary-600 mt-1 cursor-pointer hover:underline">Forgot Password?</p>}
           </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition shadow-lg">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin} className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 bg-white p-3 rounded-lg hover:bg-gray-50 transition">
             <span className="font-bold text-gray-600">G</span> Google
          </button>
        </div>

        {/* Separate Admin Link */}
        <div className="mt-8 text-center">
            <button onClick={() => { setIsAdminMode(true); setError(''); }} className="text-xs text-gray-400 hover:text-primary-600 underline">
                Admin Portal Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;