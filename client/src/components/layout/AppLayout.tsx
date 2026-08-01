import { Outlet, useLocation } from "react-router-dom";
import { Footer, Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const { pathname } = useLocation();
  const hideSidebar =
    pathname.startsWith("/messenger") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");
  const compactChrome = pathname.startsWith("/messenger");

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className={`app-page ${compactChrome ? "pb-4 sm:pb-8" : ""}`}>
        <div className={`app-shell ${hideSidebar ? "is-full" : ""}`}>
          <main className="app-main">
            <Outlet />
          </main>
          {!hideSidebar ? (
            <aside className="app-sidebar" aria-label="Community sidebar">
              <Sidebar />
            </aside>
          ) : null}
        </div>
      </div>
      <div className={compactChrome ? "hidden sm:block" : undefined}>
        <Footer />
      </div>
    </div>
  );
}
