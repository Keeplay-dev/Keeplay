import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="app-container" id="appSection" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <main className="main-content" style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
