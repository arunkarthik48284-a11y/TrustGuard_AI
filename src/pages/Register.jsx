import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Building, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        organization_name: orgName,
        email,
        password,
        role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white">TrustGuard AI Onboarding</h1>
          <p className="text-xs text-gray-400 mt-1">Register your organization security perimeter</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Organization Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme CyberLabs Inc."
                  className="w-full bg-[#0B0F19] text-gray-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="security@acmelabs.io"
                  className="w-full bg-[#0B0F19] text-gray-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B0F19] text-gray-200 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B0F19] text-gray-200 text-xs px-3.5 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="admin">Admin (Full Security Controls)</option>
                <option value="analyst">Security Analyst (Audit & Inspection)</option>
                <option value="developer">Developer (API Integrations)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Organization...' : <>Complete Onboarding <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="pt-3 border-t border-gray-800 text-center text-xs text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
