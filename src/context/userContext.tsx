'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWeb3 } from './Web3Context'
import { RegistrationVerificationResponse, User } from '@/types/user'
import { AuthenticatieUser, isUserRejectedSignatureError, RegisterUser } from '@/services/Api/auth/auth'  



interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    // Get wallet data from Web3Context
    const { account, signer, isConnected , disconnectWallet} = useWeb3();

    // User state
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated on wallet connection
    useEffect(() => {
        if (isConnected && account && signer) {
            checkAuthentication();
        }
    }, [isConnected, account]);

    // Reset user state when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, [isConnected]);

    // Check if the wallet address is already authenticated
    const checkAuthentication = async () => {
        if (!account) return;

        setIsLoading(true);
        try {
            //register user if not registered
            const response = await RegisterUser(account)
          
            if (response?.status === 200) {
                //sign message and authenticate user
                if (signer) {
                    const signature = await signer.signMessage(response.data.toSign);
                    const authResponse = await AuthenticatieUser(account, signature)
                    if (authResponse?.status === 200) {
                        //set user and isAuthenticated to true
                        setUser(authResponse.data.user);
                        localStorage.setItem("token", authResponse.data.token)
                        setIsAuthenticated(true);
                    }
                }

                //  setUser(response.data.toSign);
                // setIsAuthenticated(true);
            }
        } catch (err) {
            if (isUserRejectedSignatureError(err)) {
                disconnectWallet()
              }
        } finally {
            setIsLoading(false);
        }
    };

   


    return (
        <UserContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            isLoading,
            error
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}