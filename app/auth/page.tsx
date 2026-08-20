"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("fullName"));

    const supabase = createClient();

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(
      mode === "sign-up"
        ? "Account created. Check your email to confirm it."
        : "Signed in successfully.",
    );

    if (mode === "sign-in") window.location.href = "/";
  }

  async function signInWithGoogle() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="container toolPage">
      <p className="eyebrow">GARILINK TZ ACCOUNT</p>
      <h1>{mode === "sign-in" ? "Sign in" : "Create your account"}</h1>

      <form className="valueForm" onSubmit={submit}>
        {mode === "sign-up" && (
          <label>
            Full name
            <input name="fullName" required />
          </label>
        )}

        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label>
          Password
          <input name="password" type="password" minLength={8} required />
        </label>

        <button className="primary">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button onClick={signInWithGoogle}>Continue with Google</button>

      <p>{message}</p>

      <button
        onClick={() =>
          setMode(mode === "sign-in" ? "sign-up" : "sign-in")
        }
      >
        {mode === "sign-in"
          ? "Need an account? Register"
          : "Already registered? Sign in"}
      </button>
    </main>
  );
}