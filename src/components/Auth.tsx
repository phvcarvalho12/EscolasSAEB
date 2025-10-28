import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
const API_BASE_URL = 'https://localhost:44308/api';

interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
}

interface AuthProps {
  onLogin: (usuario: Usuario) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Estados para formulário de cadastro
  const [dadosCadastro, setDadosCadastro] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
    nome: ''
  });

  // Estados para formulário de login
  const [dadosLogin, setDadosLogin] = useState({
    email: '',
    senha: ''
  });

  const [etapaCadastro, setEtapaCadastro] = useState<'dados' | 'perfil'>('dados');

  // Função para validar email
  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Função para validar senha
  const validarSenha = (senha: string): { valida: boolean; erros: string[] } => {
    const erros: string[] = [];
    
    if (senha.length < 6) {
      erros.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(senha)) {
      erros.push('Uma letra maiúscula');
    }
    if (!/[0-9]/.test(senha)) {
      erros.push('Um número');
    }

    return { valida: erros.length === 0, erros };
  };

  // Função para obter usuários (mock - em produção viria da API)
  const obterUsuarios = (): Usuario[] => {
    return []; // Retorna array vazio por enquanto
  };

  // Função para verificar se email já existe
  const emailExiste = (email: string): boolean => {
    const usuarios = obterUsuarios();
    return usuarios.some(usuario => usuario.email.toLowerCase() === email.toLowerCase());
  };

  // Função para lidar com cadastro
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso('');

    // Validações
    if (!validarEmail(dadosCadastro.email)) {
      setErro('Por favor, insira um email válido');
      setLoading(false);
      return;
    }

    const validacaoSenha = validarSenha(dadosCadastro.senha);
    if (!validacaoSenha.valida) {
      setErro('Senha deve ter: ' + validacaoSenha.erros.join(', '));
      setLoading(false);
      return;
    }

    if (dadosCadastro.senha !== dadosCadastro.confirmarSenha) {
      setErro('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (emailExiste(dadosCadastro.email)) {
      setErro('Este email já está cadastrado. Faça login.');
      setLoading(false);
      return;
    }

    try {
      // Simular delay de cadastro
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSucesso('Dados validados! Agora escolha seu nome de perfil.');
      setEtapaCadastro('perfil');
      setLoading(false);
    } catch (erro: any) {
      console.error('Erro no cadastro:', erro);
      setErro('Erro ao validar dados. Tente novamente.');
      setLoading(false);
    }
  };

  // Função para finalizar cadastro com nome do perfil
  const finalizarCadastro = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErro('');

  if (!dadosCadastro.nome.trim()) {
    setErro('Por favor, insira um nome para seu perfil');
    setLoading(false);
    return;
  }

  try {
    // POST /api/Cadastro/PostCadastro
    const response = await fetch(`${API_BASE_URL}/Cadastro/PostCadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify
      ({
        Email: dadosCadastro.email,
        Senha: dadosCadastro.senha,
        Nome: dadosCadastro.nome.trim()
      })

    });

    // Tratar erros
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      
      // Se o email já existe, sua API provavelmente retorna um erro específico
      if (errorData.message?.includes('email') || errorData.message?.includes('Email')) {
        throw new Error('Este email já está cadastrado. Faça login.');
      }
      
      throw new Error(errorData.message || 'Dados inválidos');
    }

    if (response.status === 500) {
      throw new Error('Erro no servidor. Tente novamente mais tarde.');
    }

    if (!response.ok) {
      throw new Error('Erro ao realizar cadastro');
    }

  let resultado = {};
try {
  resultado = await response.json();
} catch {
  console.warn("A resposta não era JSON ou estava vazia.");
}


    // Criar objeto de usuário
    const novoUsuario: Usuario = {
      id: resultado.id || Date.now().toString(),
      email: dadosCadastro.email,
      senha: '', // NÃO armazenar senha
      nome: dadosCadastro.nome.trim(),
      dataCriacao: resultado.dataCriacao || new Date().toISOString()
    };

    // Salvar no localStorage
    localStorage.setItem('escolafinder_usuario_logado', JSON.stringify(novoUsuario));

    setSucesso('Cadastro realizado com sucesso! Bem-vindo ao EscolaFinder!');

    // Fazer login automático
    setTimeout(() => onLogin(novoUsuario), 1500);

  } catch (erro: any) {
    console.error('Erro no cadastro:', erro);
    setErro(erro.message || 'Erro ao realizar cadastro. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

  // Função para lidar com login
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErro('');
//tentativa de conexão com a api
const response = await fetch(`${API_BASE_URL}/Cadastro/PostLogin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Email: dadosLogin.email,
    Senha: dadosLogin.senha
  })
});

console.log("Resposta da API:", response.status, response);

  if (!validarEmail(dadosLogin.email)) {
    setErro('Por favor, insira um email válido');
    setLoading(false);
    return;
  }

  try {
    // POST https://localhost:44308/api/Cadastro/PostLogin
    const response = await fetch(`${API_BASE_URL}/Cadastro/PostLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: dadosLogin.email,
        senha: dadosLogin.senha
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 404) {
        throw new Error('Email ou senha incorretos');
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    }

    let resultado = {};
try {
  resultado = await response.json();
} catch {
  console.warn("A resposta não era JSON ou estava vazia.");
}


    // Criar objeto de usuário
    const usuario: Usuario = {
      id: resultado.id || Date.now().toString(),
      email: resultado.email || dadosLogin.email,
      senha: '', // Não armazenar senha
      nome: resultado.nome || 'Usuário',
      dataCriacao: resultado.dataCriacao || new Date().toISOString()
    };

    setSucesso('Login realizado com sucesso!');
    setTimeout(() => onLogin(usuario), 1000);

  } catch (erro: any) {
    console.error('Erro no login:', erro);
    setErro(erro.message || 'Erro ao fazer login. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center bg-green-50">
          <CardTitle className="text-green-700 text-2xl">EscolaFinder</CardTitle>
          <p className="text-green-600">Encontre a escola ideal para seu filho</p>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Tab de Login */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-green-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={dadosLogin.email}
                      onChange={(e) => setDadosLogin({ ...dadosLogin, email: e.target.value })}
                      className="pl-10 border-green-200 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-senha" className="text-green-700">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={dadosLogin.senha}
                      onChange={(e) => setDadosLogin({ ...dadosLogin, senha: e.target.value })}
                      className="pl-10 pr-10 border-green-200 focus:border-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {mostrarSenha ? 
                        <EyeOff className="h-4 w-4 text-gray-400" /> : 
                        <Eye className="h-4 w-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            {/* Tab de Cadastro */}
            <TabsContent value="cadastro" className="space-y-4">
              {etapaCadastro === 'dados' ? (
                <form onSubmit={handleCadastro} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cadastro-email" className="text-green-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="cadastro-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={dadosCadastro.email}
                        onChange={(e) => setDadosCadastro({ ...dadosCadastro, email: e.target.value })}
                        className="pl-10 border-green-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cadastro-senha" className="text-green-700">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="cadastro-senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        value={dadosCadastro.senha}
                        onChange={(e) => setDadosCadastro({ ...dadosCadastro, senha: e.target.value })}
                        className="pl-10 pr-10 border-green-200 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {mostrarSenha ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mínimo 6 caracteres, uma maiúscula e um número
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha" className="text-green-700">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmar-senha"
                        type={mostrarConfirmacao ? 'text' : 'password'}
                        placeholder="Confirme sua senha"
                        value={dadosCadastro.confirmarSenha}
                        onChange={(e) => setDadosCadastro({ ...dadosCadastro, confirmarSenha: e.target.value })}
                        className="pl-10 pr-10 border-green-200 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {mostrarConfirmacao ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Validando...' : 'Continuar'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={finalizarCadastro} className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-700 mb-2">
                      Quase pronto!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Agora escolha um nome para seu perfil
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome-perfil" className="text-green-700">Nome do Perfil</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="nome-perfil"
                        type="text"
                        placeholder="Como você quer ser chamado?"
                        value={dadosCadastro.nome}
                        onChange={(e) => setDadosCadastro({ ...dadosCadastro, nome: e.target.value })}
                        className="pl-10 border-green-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
                  </Button>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-green-200 text-green-700"
                    onClick={() => setEtapaCadastro('dados')}
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Alertas */}
          {erro && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {erro}
              </AlertDescription>
            </Alert>
          )}

          {sucesso && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                {sucesso}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}