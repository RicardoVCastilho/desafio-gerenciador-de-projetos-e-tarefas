import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      // Salva o token
      localStorage.setItem("token", res.data.token);

      // Salva os dados do usuário
      // Certifique-se que o backend retorna { name, email } junto do login
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redireciona para dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>ProTsK - Manager</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>
        Ainda não possui uma conta? <Link to="/register">Registre-se</Link>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;