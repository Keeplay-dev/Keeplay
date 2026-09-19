"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Estados específicos para validação em tempo real de cadastro
  const [regUsername, setRegUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });
  const [regPassword, setRegPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Verificação de disponibilidade de nome de usuário em tempo real
  useEffect(() => {
    const trimmed = regUsername.trim();
    if (!trimmed) {
      setUsernameStatus({ state: "idle", message: "" });
      setFieldErrors(prev => ({ ...prev, username: null }));
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        state: "invalid",
        message: "O nome de usuário deve ter no mínimo 3 caracteres."
      });
      return;
    }

    if (trimmed.length > 30) {
      setUsernameStatus({
        state: "invalid",
        message: "O nome de usuário deve ter no máximo 30 caracteres."
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(trimmed)) {
      setUsernameStatus({
        state: "invalid",
        message: "Use apenas letras, números, sublinhado (_) ou ponto (.)."
      });
      return;
    }

    setUsernameStatus({ state: "checking", message: "Verificando disponibilidade..." });

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ state: "available", message: data.message });
          setFieldErrors(prev => ({ ...prev, username: null }));
        } else {
          setUsernameStatus({ state: "taken", message: data.message });
          setFieldErrors(prev => ({ ...prev, username: data.message }));
        }
      } catch (err) {
        // Fallback silencioso
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [regUsername]);

  // Handle Login
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const identifier = e.target.loginIdentifier.value;
    const password = e.target.loginPassword.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao fazer login");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle Register
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const name = e.target.regName.value.trim();
    const username = regUsername.trim();
    const password = regPassword;
    const acceptTerms = e.target.regAcceptTerms.checked;

    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso.");
      return;
    }

    if (usernameStatus.state === "taken") {
      const msg = "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário.";
      setError(msg);
      setFieldErrors(prev => ({ ...prev, username: msg }));
      const inputEl = document.getElementById("regUsername");
      if (inputEl) inputEl.focus();
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          if (data.fieldErrors.username) {
            setUsernameStatus({ state: "taken", message: data.fieldErrors.username });
            const inputEl = document.getElementById("regUsername");
            if (inputEl) inputEl.focus();
          }
        }
        throw new Error(data.error || "Erro ao registrar");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-wrapper">
      <div className="auth-card">
        <div
          className="auth-brand"
          style={{
            width: "68px",
            height: "68px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src="/keeplay_icon.jpg"
            alt="Keeplay"
            className="auth-brand-img"
            width="68"
            height="68"
            style={{
              width: "68px",
              height: "68px",
              objectFit: "cover",
              borderRadius: "18px",
              display: "block",
            }}
          />
        </div>
        <h1>Keeplay</h1>
        <p className="subtitle">
          Seu diário cultural, rede de amigos & gamificação de entretenimento
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab-btn ${isLoginTab ? "active" : ""}`}
            onClick={() => {
              setIsLoginTab(true);
              setError("");
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLoginTab ? "active" : ""}`}
            onClick={() => {
              setIsLoginTab(false);
              setError("");
            }}
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {isLoginTab ? (
          <form id="loginForm" autoComplete="off" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="loginIdentifier" className="form-label">
                Usuário
              </label>
              <input
                type="text"
                id="loginIdentifier"
                name="loginIdentifier"
                className="input-field"
                placeholder="Digite seu usuário..."
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword" className="form-label">
                Senha
              </label>
              <input
                type="password"
                id="loginPassword"
                name="loginPassword"
                className="input-field"
                placeholder="Digite sua senha..."
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>
        ) : (
          <form id="registerForm" autoComplete="off" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="regName" className="form-label">
                Nome Completo
              </label>
              <input
                type="text"
                id="regName"
                name="regName"
                className="input-field"
                placeholder="Ex: Lucas Silva"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regUsername" className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Nome de Usuário</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "normal" }}>Único / Sem repetição</span>
              </label>
              <input
                type="text"
                id="regUsername"
                name="regUsername"
                className={`input-field ${
                  usernameStatus.state === "taken" || fieldErrors.username
                    ? "input-error"
                    : usernameStatus.state === "available"
                    ? "input-success"
                    : ""
                }`}
                placeholder="Ex: lucas_cult"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                autoComplete="username"
              />

              {/* AVISO DO NOME DE USUÁRIO */}
              <div style={{ marginTop: "0.4rem", fontSize: "0.76rem" }}>
                {usernameStatus.state === "idle" && (
                  <span style={{ color: "var(--text-secondary)" }}>
                    🔒 O nome de usuário não pode se repetir e deve ser exclusivo.
                  </span>
                )}
                {usernameStatus.state === "checking" && (
                  <span style={{ color: "#facc15" }}>
                    ⏳ Verificando disponibilidade...
                  </span>
                )}
                {(usernameStatus.state === "taken" || fieldErrors.username) && (
                  <span style={{ color: "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>❌</span>
                    <span>{fieldErrors.username || usernameStatus.message || "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário."}</span>
                  </span>
                )}
                {usernameStatus.state === "available" && !fieldErrors.username && (
                  <span style={{ color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>✓</span>
                    <span>Nome de usuário disponível!</span>
                  </span>
                )}
                {usernameStatus.state === "invalid" && !fieldErrors.username && (
                  <span style={{ color: "#f97316", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>⚠️</span>
                    <span>{usernameStatus.message}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regPassword" className="form-label">
                Senha
              </label>
              <input
                type="password"
                id="regPassword"
                name="regPassword"
                className={`input-field ${fieldErrors.password ? "input-error" : ""}`}
                placeholder="Crie uma senha..."
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                }}
                required
                autoComplete="new-password"
              />

              {/* AVISO E REQUISITOS DA SENHA */}
              <div style={{ marginTop: "0.4rem", fontSize: "0.76rem" }}>
                {fieldErrors.password && (
                  <div style={{ color: "#ef4444", fontWeight: 600, marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>❌</span>
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
                <div style={{ color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 600 }}>
                  🔒 Requisitos da senha:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  <span style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    background: regPassword.length >= 6 ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: regPassword.length >= 6 ? "#10b981" : "var(--text-muted)",
                    border: regPassword.length >= 6 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.2s"
                  }}>
                    {regPassword.length >= 6 ? "✓" : "•"} Mínimo 6 caracteres
                  </span>
                  <span style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    background: /[a-zA-Z]/.test(regPassword) ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: /[a-zA-Z]/.test(regPassword) ? "#10b981" : "var(--text-muted)",
                    border: /[a-zA-Z]/.test(regPassword) ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.2s"
                  }}>
                    {/[a-zA-Z]/.test(regPassword) ? "✓" : "•"} Pelo menos 1 letra
                  </span>
                  <span style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    background: /[0-9]/.test(regPassword) ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: /[0-9]/.test(regPassword) ? "#10b981" : "var(--text-muted)",
                    border: /[0-9]/.test(regPassword) ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.2s"
                  }}>
                    {/[0-9]/.test(regPassword) ? "✓" : "•"} Pelo menos 1 número
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group terms-agreement-group">
              <label className="terms-checkbox-label" htmlFor="regAcceptTerms">
                <input type="checkbox" id="regAcceptTerms" name="regAcceptTerms" required />
                <span className="terms-label-text">
                  Li e concordo com os{" "}
                  <a href="/termos_lgpd.pdf" target="_blank" className="btn-terms-modal-trigger" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>
                    Termos de Uso e Proteção de Dados (LGPD)
                  </a>
                </span>
              </label>
              <div
                className="terms-pdf-actions"
                style={{
                  marginTop: "0.35rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="/termos_lgpd.pdf"
                  target="_blank"
                  className="btn-terms-pdf-link"
                  title="Abrir documento oficial em PDF"
                >
                  📄 Abrir Termos & LGPD (PDF)
                </a>
              </div>
              <div className="terms-badge-hint">
                <span>🛡️</span> Seus dados protegidos conforme a LGPD.
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Cadastrar e Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
