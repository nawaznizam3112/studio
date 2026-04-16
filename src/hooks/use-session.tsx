
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface UserSession {
    userId: string;
    role: 'customer' | 'business' | 'admin' | 'clinician' | 'patient';
    name?: string;
    businessId?: string;
}

interface SessionContextType {
    session: UserSession | null;
    setSession: (session: UserSession | null) => void;
    loading: boolean;
    clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                setSession(JSON.parse(sessionData));
            }
        } catch (error) {
            console.error("Failed to parse user session from localStorage", error);
            localStorage.removeItem('userSession');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSetSession = (newSession: UserSession | null) => {
        setSession(newSession);
        if (newSession) {
            localStorage.setItem('userSession', JSON.stringify(newSession));
        } else {
            localStorage.removeItem('userSession');
        }
    };

    const clearSession = () => {
        localStorage.removeItem('userSession');
        setSession(null);
    };

    return (
        <SessionContext.Provider value={{ session, setSession: handleSetSession, loading, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
