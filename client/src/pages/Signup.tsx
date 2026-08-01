import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { PRODUCT } from "../lib/copy";

export function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal>
      <div className="mx-auto w-full max-w-md">
        <div className="page-hero">
          <p className="section-eyebrow">{PRODUCT.signupEyebrow}</p>
          <h1 className="heading-lg">
            Your diabetes <em>community</em>
          </h1>
          <p className="body-lg">{PRODUCT.signupLead}</p>
        </div>
        <form className="surface-card flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            id="username"
            label="Username"
            required
            minLength={6}
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="No spaces"
          />
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
            {busy ? "Creating account…" : PRODUCT.joinCta}
          </Button>
          <p className="meta-label">{PRODUCT.disclaimer}</p>
        </form>
        <p className="body-sm mt-4">
          Already a member?{" "}
          <Link to="/login" className="underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </Reveal>
  );
}
