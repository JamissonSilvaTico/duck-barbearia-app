import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { api } from '../utils/api';

interface Settings {
    logo: string | null;
    tagline: string;
    buttonColor: string;
    whatsappNumber: string;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
    logo: null,
    tagline: "Estilo, precisão e uma experiência única. Agende seu horário e redescubra seu visual.",
    buttonColor: "#d4af37",
    whatsappNumber: '',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                // Tenta buscar do cache primeiro para uma carga mais rápida
                const cachedSettings = localStorage.getItem('appSettings');
                if (cachedSettings) {
                    setSettings(JSON.parse(cachedSettings));
                }

                // Busca as configurações mais recentes da API
                const serverSettings = await api<Settings>('/settings');
                setSettings(serverSettings);
                localStorage.setItem('appSettings', JSON.stringify(serverSettings));
            } catch (error) {
                console.error("Failed to fetch settings from API, using defaults.", error);
                // Em caso de erro, usa os padrões e limpa o cache
                setSettings(DEFAULT_SETTINGS);
                localStorage.removeItem('appSettings');
            }
        };

        fetchInitialSettings();
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        // Atualiza o cache local imediatamente para refletir a mudança na UI
        localStorage.setItem('appSettings', JSON.stringify(updated));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
