'use client'

import React, { ReactNode, createContext, useContext, useState } from 'react';

interface UserState {
    id: string;
    name: string;
    token: string;
    auth: boolean;
    isLoading: boolean; // 로딩 상태를 나타내는 속성 추가
}


interface AuthContextProps {
    userState: UserState;
    setUserState: React.Dispatch<React.SetStateAction<UserState>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [userState, setUserState] = useState<UserState>({
        id: '',
        name: '',
        token: '',
        auth: false,
        isLoading: false, // 초기 로딩 상태는 false로 설정
    });

    return (
        <AuthContext.Provider value={{ userState, setUserState }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('There is no provider.');
    }

    return context;
};
