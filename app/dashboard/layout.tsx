import React, { ReactNode } from "react";
import NavBar from "./_components/NavBar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="selection:bg-[hsl(320,65%,52%,20%)]">
      <NavBar />
      <div className="p-6">
      {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
