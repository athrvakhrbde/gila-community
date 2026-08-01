import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { PRODUCT } from "../lib/copy";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal>
      <div className="mx-auto w-full max-w-md">
        <div className="page-hero">
          <p className="section-eyebrow">{PRODUCT.loginEyebrow}</p>
          <h1 className="heading-lg">Log in</h1>
          <p className="body-lg">{PRODUCT.loginLead}</p>
        </div>
        <form className="surface-card flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="error-banner">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <p className="body-sm mt-4">
          New here?{" "}
          <Link to="/signup" className="underline underline-offset-2">
            {PRODUCT.joinCta}
          </Link>
        </p>
      </div>
    </Reveal>
  );
}
