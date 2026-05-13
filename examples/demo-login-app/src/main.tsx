import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    if (email.includes("console")) {
      console.error("Optional demo console error");
    }
    // Intentionally no empty-password validation, no loading state, and no /home navigation.
    setPassword(password);
  }

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Demo target</p>
        <h1>Login</h1>
        <label>
          Email
          <input aria-label="Email" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input aria-label="Password" placeholder="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="button" onClick={login}>
          Login
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<LoginPage />);
