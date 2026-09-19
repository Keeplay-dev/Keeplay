"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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
    const name = e.target.regName.value;
    const username = e.target.regUsername.value;
    const password = e.target.regPassword.value;
    const acceptTerms = e.target.regAcceptTerms.checked;

    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
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
              <label htmlFor="regUsername" className="form-label">
                Nome de Usuário
              </label>
              <input
                type="text"
                id="regUsername"
                name="regUsername"
                className="input-field"
                placeholder="Ex: lucas_cult"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regPassword" className="form-label">
                Senha
              </label>
              <input
                type="password"
                id="regPassword"
                name="regPassword"
                className="input-field"
                placeholder="Crie uma senha..."
                required
              />
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
