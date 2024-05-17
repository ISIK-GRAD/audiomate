// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create a context for the user
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { username: 'Guest' };
  });

  useEffect(() => {
    if (user.username !== 'Guest') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
