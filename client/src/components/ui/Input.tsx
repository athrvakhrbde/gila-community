import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Input({ label, id, className = "", ...rest }: InputProps) {
  return (
    <label className="block" htmlFor={id}>
      {label ? <span className="field-label">{label}</span> : null}
      <input id={id} className={`field-input ${className}`} {...rest} />
    </label>
  );
}

export function Textarea({
  label,
  id,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <label className="block" htmlFor={id}>
      {label ? <span className="field-label">{label}</span> : null}
      <textarea id={id} className={`field-textarea ${className}`} {...rest} />
    </label>
  );
}
