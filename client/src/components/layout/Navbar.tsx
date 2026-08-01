import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { augenEase } from "../../lib/motion";
import { Button } from "../ui/Button";
import { GilaLogo } from "../ui/GilaLogo";

type NavItem = { to: string; label: string; end?: boolean };

const publicLinks: NavItem[] = [
  { to: "/", label: "Community", end: true },
  { to: "/search", label: "Search" },
];

const privateLinks: NavItem[] = [
  { to: "/posts/create", label: "Discuss", end: false },
  { to: "/messenger", label: "Messages" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const links = [
    ...publicLinks,
    ...(user ? privateLinks : []),
    ...(user?.isAdmin ? [{ to: "/admin", label: "Admin" } satisfies NavItem] : []),
  ];

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header
      className={`nav-shell ${sticky ? "is-sticky" : ""} ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      data-theme="light"
    >
      <div className="container-site nav-bar">
        <Link
          to="/"
          className="logo-circle"
          aria-label="gila community home page"
          onClick={() => setMenuOpen(false)}
        >
          <GilaLogo />
        </Link>

        <nav className="nav-pill" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to={`/users/${user.username}`}
              className={({ isActive }) =>
                `nav-link ${isActive ? "is-active" : ""}`
              }
            >
              @{user.username}
            </NavLink>
          ) : null}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-menu-icon" aria-hidden="true">
              <span />
            </span>
          </button>

          {user ? (
            <Button
              size="sm"
              variant="secondary"
              animated={false}
              className="nav-cta"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <span className="nav-cta-full">Log out</span>
              <span className="nav-cta-short">Out</span>
            </Button>
          ) : (
            <Button
              href="/signup"
              size="sm"
              animated={false}
              className="nav-cta"
            >
              <span className="nav-cta-full">Join</span>
              <span className="nav-cta-short">Join</span>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            className="nav-mobile-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: augenEase }}
          >
            <nav aria-label="Mobile">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `nav-mobile-link ${isActive ? "is-active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink
                    to={`/users/${user.username}`}
                    className="nav-mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    @{user.username}
                  </NavLink>
                  <button
                    type="button"
                    className="nav-mobile-link w-full text-left"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="nav-mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="nav-mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Join
                  </NavLink>
                </>
              )}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="section-dark mt-10 border-t border-border-onDark sm:mt-16">
      <div className="container-site footer-inner">
        <Link to="/" className="footer-logo-link" aria-label="gila home">
          <GilaLogo className="footer-logo h-[15px] w-auto" />
        </Link>
        <div className="footer-links">
          <Link to="/" className="footer-link">
            Community
          </Link>
          <Link to="/search" className="footer-link">
            Search
          </Link>
          <Link to="/signup" className="footer-link">
            Join
          </Link>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} gila · India’s diabetic community · Peer
          support, not medical advice
        </p>
      </div>
    </footer>
  );
}
