import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CountContext = createContext();

export const useCount = () => {
  const context = useContext(CountContext);
  if (!context) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
};

export const CountProvider = ({ children }) => {
  const [emailsCount, setEmailsCount] = useState(0);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  const fetchEmailsCounts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      const res = await axios.get("http://localhost:3000/fetchEmails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const emails = res.data || [];
      
      setEmailsCount(emails.length);
      setUnreadEmailsCount(emails.filter(email => !email.read).length);
    } catch (error) {
      console.error('Error fetching emails count:', error);
    }
  };

  const fetchEventsCount = async () => {
    try {
      const res = await axios.get("http://localhost:3000/upcomingEvents", {
        withCredentials: true,
      });
      const events = res.data.events || [];
      setEventsCount(events.length);
    } catch (error) {
      console.error('Error fetching events count:', error);
    }
  };

  const refreshCounts = () => {
    fetchEmailsCounts();
    fetchEventsCount();
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  const value = {
    emailsCount,
    unreadEmailsCount,
    eventsCount,
    refreshCounts,
    setEmailsCount,
    setUnreadEmailsCount,
    setEventsCount,
  };

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
};
