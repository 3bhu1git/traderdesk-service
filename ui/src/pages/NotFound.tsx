import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-900/30 rounded-xl flex items-center justify-center mb-6 border border-red-700/50">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-200 mb-2 font-mono">404</h1>
          <h2 className="text-xl font-semibold text-slate-300 mb-4 font-mono">PAGE NOT FOUND</h2>
          
          <p className="text-slate-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-sm hover:from-green-700 hover:to-green-600 transition-all duration-200 flex-1"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-sm hover:bg-slate-700/60 transition-colors flex-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;