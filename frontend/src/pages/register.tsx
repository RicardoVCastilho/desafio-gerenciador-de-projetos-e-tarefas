import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Conta registrada com sucesso, por favor faça o login");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>ProTsK - Registrar</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p>
        Já possui uma conta? <Link to="/">Faça o login</Link>
      </p>
    </div>
  );
}

export default Register;