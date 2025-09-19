import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../utils/api';

const SettingsPage: React.FC = () => {
  // State for password change form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  
  // State for customization form
  const { settings, updateSettings } = useSettings();
  const [customizationMessage, setCustomizationMessage] = useState({ text: '', type: '' });
  const [logo, setLogo] = useState<string | null>(settings.logo);
  const [tagline, setTagline] = useState(settings.tagline);
  const [buttonColor, setButtonColor] = useState(settings.buttonColor);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);

  // Sync local state if context changes from another tab/window
  useEffect(() => {
    setLogo(settings.logo);
    setTagline(settings.tagline);
    setButtonColor(settings.buttonColor);
    setWhatsappNumber(settings.whatsappNumber);
  }, [settings]);


  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });
    if (password.length < 6) {
      setPasswordMessage({ text: 'A senha deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { newPassword: password }
      });
      setPasswordMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ text: error.message || 'Erro ao alterar senha.', type: 'error' });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings = { logo, tagline, buttonColor, whatsappNumber };
    try {
      await api('/settings', {
        method: 'PUT',
        body: newSettings
      });
      updateSettings(newSettings); // Atualiza o contexto local
      setCustomizationMessage({ text: 'Configurações da página inicial salvas com sucesso!', type: 'success' });
      setTimeout(() => setCustomizationMessage({ text: '', type: '' }), 3000);
    } catch (error: any) {
      setCustomizationMessage({ text: error.message || 'Erro ao salvar configurações.', type: 'error' });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-gold mb-6">Configurações</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customization Form */}
        <div className="bg-brand-dark p-6 rounded-lg">
          <h2 className="text-xl font-bold text-brand-light-gray mb-4">Personalização da Página Inicial</h2>
          <form onSubmit={handleCustomizationSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1">Logo</label>
              {logo && <img src={logo} alt="Preview" className="h-16 mb-2 bg-gray-500 p-1 rounded"/>}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-sm text-brand-gray file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-brand-light-gold"
              />
              {logo && <button type="button" onClick={() => setLogo(null)} className="text-xs text-red-500 hover:text-red-400 mt-1">Remover logo</button>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1">Frase de Efeito</label>
              <textarea
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                rows={3}
                className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>

             <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-brand-gray mb-1">Cor do Botão "Agendar"</label>
                    <input
                        type="text"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                </div>
                 <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-brand-light-dark border-none rounded-md cursor-pointer"
                    title="Escolha uma cor"
                 />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1">Número do WhatsApp (com código do país)</label>
              <input
                type="tel"
                placeholder="Ex: 5511999998888"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>

            {customizationMessage.text && <p className={customizationMessage.type === 'success' ? "text-green-400" : "text-red-500"}>{customizationMessage.text}</p>}
            <div className="pt-2">
              <button
                type="submit"
                className="bg-brand-gold text-brand-dark font-bold py-2 px-6 rounded-md hover:bg-brand-light-gold"
              >
                Salvar Personalização
              </button>
            </div>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-brand-dark p-6 rounded-lg">
          <h2 className="text-xl font-bold text-brand-light-gray mb-4">Alterar Senha de Administrador</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1">Nova Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                required
              />
            </div>
            {passwordMessage.text && <p className={passwordMessage.type === 'success' ? "text-green-400" : "text-red-500"}>{passwordMessage.text}</p>}
            <div className="pt-2">
              <button
                type="submit"
                className="bg-brand-gold text-brand-dark font-bold py-2 px-6 rounded-md hover:bg-brand-light-gold"
              >
                Alterar Senha
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
