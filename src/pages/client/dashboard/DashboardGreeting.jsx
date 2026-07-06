import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

const DashboardGreeting = () => {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good Morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    updateGreeting();
    
    //Update the greeting periodically in case the user leaves the tab open for hours
    const intervalId = setInterval(updateGreeting, 60000); // Checks every minute
    return () => clearInterval(intervalId);
  }, []);

  // Safely extract the first name. 
  // Adjust 'full_name' or 'name' based on your Supabase profiles table schema
  const fullName = profile?.full_name || profile?.name || "";
  const firstName = fullName.split(" ")[0] || "Investor";

  return (
    <div className="p-6 flex items-center justify-between">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-heading">
        {greeting}, {firstName}
      </h1>

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="w-2 h-2 rounded-full bg-success"></span>
        <span>Live data</span>
      </div>
    </div>
  );
};

export default DashboardGreeting;