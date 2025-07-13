import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  objective?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
  last_consultation?: string | null;
  nutritionist_id?: string;
  isActive?: boolean;
};

type UserContextType = {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUser: (newData: Partial<User>) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => { },
  logout: async () => { },
  isLoading: true,
  updateUser: async () => { },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (newData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);