import React, { useEffect, useState } from "react";
import axios from "axios";
import EmailCard from "../components/EmailCard";

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      const res = await axios.get("http://localhost:3000/fetchEmails");
      setEmails(res.data);
    };
    fetchEmails();
  }, []);

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {emails.map((mail) => (
          <EmailCard
            key={mail.email_id}
            email={mail.from_email}
            subject={mail.subject}
            summary={mail.summary}
            date={mail.date}
            hovered={hoveredId === mail.email_id}
            onHoverStart={() => setHoveredId(mail.email_id)}
            onHoverEnd={() => setHoveredId(null)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
