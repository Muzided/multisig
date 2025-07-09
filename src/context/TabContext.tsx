'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface TabContextType {
    activeTab: string;
    setActiveTab: (active: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabProviderProps {
    children: ReactNode;
}

export function TabProvider({ children }: TabProviderProps) {
    const [activeTab, setActiveTab] = useState<string>("overview");

    return (
        <TabContext.Provider value={{
            activeTab,
            setActiveTab
        }}>
            {children}
        </TabContext.Provider>
    );
}

export function useTab(): TabContextType {
    const context = useContext(TabContext);
    if (context === undefined) {
        throw new Error('useTab must be used within a TabProvider');
    }
    return context;
}