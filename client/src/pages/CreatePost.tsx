import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Reveal } from "../components/ui/Reveal";
import { PRODUCT } from "../lib/copy";

export function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
      });
      navigate(`/posts/${post._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal>
      <div className="mx-auto w-full max-w-2xl">
        <div className="page-hero">
          <p className="section-eyebrow">{PRODUCT.createEyebrow}</p>
          <h1 className="heading-lg">
            Start a <em>discussion</em>
          </h1>
          <p className="body-lg">{PRODUCT.createLead}</p>
        </div>
        <form className="surface-card flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            id="title"
            label="Title"
            value={title}
            maxLength={80}
            required
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Low-GI lunch ideas for office days"
          />
          <Textarea
            id="content"
            label="Your experience"
            value={content}
            maxLength={8000}
            required
            onChange={(e) => setContent(e.target.value)}
            placeholder="What helped you? What are you struggling with?"
          />
          {error ? <p className="error-banner">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Publishing…" : "Publish"}
          </Button>
          <p className="meta-label">{PRODUCT.disclaimer}</p>
        </form>
      </div>
    </Reveal>
  );
}
