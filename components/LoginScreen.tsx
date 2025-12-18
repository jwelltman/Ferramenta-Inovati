import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import { SystemConfig } from '../types';
import BrandLogo from './BrandLogo';

interface LoginScreenProps {
  onLogin: (email: string) => void;
  config?: SystemConfig;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, config }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallback if no config is loaded yet (though App handles this, safe to have defaults)
  const themeColor = config?.themeColor || 'orange';
  const companyName = config?.companyName || 'Inovati Soluções';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Simple mock validation
      if (email === 'admin@inovati.com' && password === '123456') {
        onLogin(email);
      } else {
        setError('Credenciais inválidas. Tente admin@inovati.com / 123456');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('Um link de redefinição de senha foi enviado para o administrador do sistema.');
  };

  const handleCreateUser = () => {
    alert('Solicitação de novo acesso: Por favor, entre em contato com o RH ou o Administrador do Sistema para criar seu cadastro.');
  };

  const inputClass = `w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500 outline-none transition-all bg-white text-black font-medium shadow-sm placeholder-gray-400`;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className={`bg-white p-8 text-center border-b-4 border-${themeColor}-600 relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col items-center">
            <BrandLogo className="scale-125 mb-2" />
            <p className="text-gray-500 text-sm mt-4 font-medium">Portal do Colaborador</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-pulse">
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  className={inputClass}
                  placeholder="usuario@inovati.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-sm font-bold text-gray-800">Senha</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className={`text-xs text-${themeColor}-600 hover:text-${themeColor}-800 hover:underline font-medium`}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-${themeColor}-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acessando...
                  </>
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={handleCreateUser}
                className={`w-full bg-white border-2 border-${themeColor}-600 text-${themeColor}-600 hover:bg-${themeColor}-50 font-bold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2`}
              >
                <UserPlus size={20} />
                Criar Usuário
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 border-t pt-4">
            <p>&copy; 2024 {companyName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;