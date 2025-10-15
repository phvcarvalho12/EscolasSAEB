import React, { useState, useMemo, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Slider } from './components/ui/slider';
import { MapPin, Star, Users, Award, Filter, Search, LogOut, AlertCircle } from 'lucide-react'; // Adicionado AlertCircle
import { Auth } from './components/Auth';
import { UserProfile } from './components/UserProfile';
import { EscolaDetalhes } from './components/EscolaDetalhes';
import { Alert, AlertDescription } from './components/ui/alert'; // Adicionado Alert e AlertDescription

// ============================================
// 1. ADICIONE NO TOPO: API_BASE_URL
// ============================================
const API_BASE_URL = 'https://localhost:44308/api';

interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
}

// Definição da interface Escola (manter como está, pode precisar de pequenos ajustes dependendo da API)
interface Escola {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: 'Pública' | 'Privada';
  ideb: number; // Índice de Desenvolvimento da Educação Básica (0-10)
  enade: number; // Conceito ENADE (1-5)
  numeroAlunos: number;
  distanciaKm: number; // Distância simulada do usuário
  lat: number;
  lng: number;
  nivelEnsino: 'Fundamental I' | 'Fundamental II' | 'Médio' | 'Fundamental Completo' | 'Completo';
  infraestrutura: string[];
}

// Função auxiliar para mapear tipo de ensino (manter como está)
const mapearNivelEnsino = (tipoEnsino: string): Escola['nivelEnsino'] => {
  const tipo = tipoEnsino?.toLowerCase() || '';
  if (tipo.includes('iniciais')) return 'Fundamental I';
  if (tipo.includes('finais')) return 'Fundamental II';
  if (tipo.includes('médio')) return 'Médio';
  // Adicione outras lógicas se 'Completo' for uma opção real da API e não apenas um mapeamento interno
  if (tipo.includes('completo')) return 'Completo';
  return 'Fundamental Completo'; // Default
};


export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'Todas',
    nivelEnsino: 'Todos',
    distanciaMax: [10], // Array para o Slider
    idebMin: [5.0] // Array para o Slider
  });

  // ============================================
  // 2. ADICIONE NOVOS ESTADOS PARA A API IDEB
  // ============================================
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [erroEscolas, setErroEscolas] = useState('');

  // Estados para os filtros da API IDEB
  const [filtrosAPI, setFiltrosAPI] = useState({
    UF: 'SP',
    Municipio: 'São Paulo',
    Rede: '', // Municipal, Estadual, Privada ou vazio
    TipoEnsino: '' // Anos Iniciais, Anos Finais, Ensino Médio ou vazio
  });

  // ============================================
  // 3. ADICIONE A FUNÇÃO PARA BUSCAR ESCOLAS
  // ============================================
  const buscarEscolas = async () => {
    setLoadingEscolas(true);
    setErroEscolas('');

    try {
      // Construir query string
      const params = new URLSearchParams();

      if (filtrosAPI.UF) params.append('UF', filtrosAPI.UF);
      if (filtrosAPI.Municipio) params.append('Municipio', filtrosAPI.Municipio);
      if (filtrosAPI.Rede) params.append('Rede', filtrosAPI.Rede);
      if (filtrosAPI.TipoEnsino) params.append('TipoEnsino', filtrosAPI.TipoEnsino);

      // GET https://localhost:44308/api/Ideb
      const response = await fetch(
        `${API_BASE_URL}/Ideb?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados das escolas');
      }

      const dados = await response.json();

      // Mapear os dados da API para o formato da interface Escola
      const escolasFormatadas: Escola[] = dados.map((item: any, index: number) => ({
        id: item.id || index + 1, // Usar id da API se existir, senão gerar um
        nome: item.nome || item.nomeEscola || `Escola ${index + 1}`,
        endereco: item.endereco || 'Endereço não informado',
        bairro: item.bairro || 'Centro', // A API pode não ter bairro, usar default ou tentar extrair do endereço
        cidade: item.municipio || filtrosAPI.Municipio,
        tipo: item.rede === 'Privada' ? 'Privada' : 'Pública',
        ideb: item.ideb || 0,
        enade: item.enade || 3, // Se não tiver, usar valor padrão
        numeroAlunos: item.numeroAlunos || Math.floor(Math.random() * (1500 - 100 + 1)) + 100, // Gerar aleatório
        distanciaKm: item.distancia || parseFloat((Math.random() * 10).toFixed(1)), // Gerar aleatório
        lat: item.latitude || -23.550520, // Usar lat da API se existir, senão default
        lng: item.longitude || -46.633308, // Usar lng da API se existir, senão default
        nivelEnsino: mapearNivelEnsino(item.tipoEnsino || filtrosAPI.TipoEnsino),
        infraestrutura: item.infraestrutura || ['Biblioteca', 'Quadra Esportiva'] // Default ou buscar de outra API
      }));

      setEscolas(escolasFormatadas);

    } catch (erro: any) {
      console.error('Erro ao buscar escolas:', erro);
      setErroEscolas('Erro ao carregar dados das escolas. Tente novamente. Detalhes: ' + erro.message);
    } finally {
      setLoadingEscolas(false);
    }
  };

  // Verificar se há usuário logado no localStorage ao carregar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('escolafinder_usuario_logado');
    if (usuarioSalvo) {
      setUsuarioLogado(JSON.parse(usuarioSalvo));
    }
  }, []);

  // ============================================
  // 4. ADICIONE useEffect PARA BUSCAR ESCOLAS AO CARREGAR
  // ============================================
  useEffect(() => {
    // Só buscar escolas se o usuário estiver logado e se a lista de escolas estiver vazia (primeira carga)
    // Ou se os filtros da API mudarem para que ele recarregue automaticamente
    if (usuarioLogado) {
      buscarEscolas();
    }
  }, [usuarioLogado, filtrosAPI.UF, filtrosAPI.Municipio, filtrosAPI.Rede, filtrosAPI.TipoEnsino]); // Dependências para re-buscar


  // Mover useMemo para antes do early return para manter a ordem dos hooks
  // ============================================
  // 5. MODIFICAR o useMemo de escolasFiltradas
  // ============================================
  const escolasFiltradas = useMemo(() => {
    return escolas.filter(escola => { // SUBSTITUA 'escolasDatabase' por 'escolas'
      const matchBusca = escola.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                        escola.bairro.toLowerCase().includes(filtros.busca.toLowerCase());

      const matchTipo = filtros.tipo === 'Todas' || escola.tipo === filtros.tipo;

      const matchNivel = filtros.nivelEnsino === 'Todos' ||
                        escola.nivelEnsino === filtros.nivelEnsino ||
                        (filtros.nivelEnsino === 'Fundamental' &&
                         (escola.nivelEnsino.includes('Fundamental') || escola.nivelEnsino === 'Completo'));

      const matchDistancia = escola.distanciaKm <= filtros.distanciaMax[0];

      const matchIdeb = escola.ideb >= filtros.idebMin[0];

      return matchBusca && matchTipo && matchNivel && matchDistancia && matchIdeb;
    }).sort((a, b) => a.distanciaKm - b.distanciaKm); // Ordenar por proximidade
  }, [filtros, escolas]); // Adicione 'escolas' como dependência para o useMemo


  // Função para fazer login
  const handleLogin = (usuario: Usuario) => {
    setUsuarioLogado(usuario);
    localStorage.setItem('escolafinder_usuario_logado', JSON.stringify(usuario));
  };

  // Função para fazer logout
  const handleLogout = () => {
    setUsuarioLogado(null);
    setEscolaSelecionada(null); // Limpar escola selecionada ao deslogar
    setEscolas([]); // Limpar escolas ao deslogar
    localStorage.removeItem('escolafinder_usuario_logado');
  };

  // Se não há usuário logado, mostrar tela de auth
  if (!usuarioLogado) {
    return <Auth onLogin={handleLogin} />;
  }

  // Se há escola selecionada, mostrar detalhes
  if (escolaSelecionada) {
    return (
      <EscolaDetalhes
        escola={escolaSelecionada}
        onVoltar={() => setEscolaSelecionada(null)}
        onLogout={handleLogout}
        usuarioLogado={{ nome: usuarioLogado.nome }}
      />
    );
  }

  const getIdebColor = (ideb: number) => {
    if (ideb >= 8) return 'text-green-600 bg-green-100';
    if (ideb >= 7) return 'text-green-500 bg-green-50';
    if (ideb >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-500 bg-red-100';
  };

  const getEnadeStars = (enade: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < enade ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-green-600 text-3xl font-bold mb-2">EscolaFinder</h1>
              <p className="text-gray-600">Encontre a escola ideal para seu filho baseado em dados oficiais</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">Bem-vindo,</p>
                <p className="text-green-700 font-medium">{usuarioLogado.nome}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <UserProfile usuario={usuarioLogado} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Filtros */}
        <Card className="mb-6 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Filter className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* ============================================ */}
            {/* 6. ADICIONAR NOVOS FILTROS NO JSX (API) */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-blue-700">Estado (UF)</Label>
                <Select
                  value={filtrosAPI.UF}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, UF: value })}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    {/* Adicione outros estados conforme necessário */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Município</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={filtrosAPI.Municipio}
                  onChange={(e) => setFiltrosAPI({ ...filtrosAPI, Municipio: e.target.value })}
                  className="border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Rede</Label>
                <Select
                  value={filtrosAPI.Rede}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, Rede: value })}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="Municipal">Municipal</SelectItem>
                    <SelectItem value="Estadual">Estadual</SelectItem>
                    <SelectItem value="Privada">Privada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Tipo de Ensino</Label>
                <Select
                  value={filtrosAPI.TipoEnsino}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, TipoEnsino: value })}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                    <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Button
                  onClick={buscarEscolas}
                  disabled={loadingEscolas}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loadingEscolas ? 'Buscando...' : 'Buscar Escolas'}
                </Button>
              </div>
            </div>

            {/* Exibir erro se houver */}
            {erroEscolas && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {erroEscolas}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Busca por nome/bairro */}
              <div className="space-y-2">
                <Label className="text-green-700">Buscar por nome ou bairro:</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite o nome da escola ou bairro"
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label className="text-green-700">Tipo de escola:</Label>
                <Select
                  value={filtros.tipo}
                  onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Pública">Pública</SelectItem>
                    <SelectItem value="Privada">Privada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nível de Ensino */}
              <div className="space-y-2">
                <Label className="text-green-700">Nível de ensino:</Label>
                <Select
                  value={filtros.nivelEnsino}
                  onValueChange={(value) => setFiltros({ ...filtros, nivelEnsino: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Fundamental I">Fundamental I (1º-5º ano)</SelectItem>
                    <SelectItem value="Fundamental II">Fundamental II (6º-9º ano)</SelectItem>
                    <SelectItem value="Fundamental">Fundamental Completo</SelectItem>
                    <SelectItem value="Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Completo">Educação Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distância */}
              <div className="space-y-3">
                <Label className="text-green-700">
                  Distância máxima: {filtros.distanciaMax[0]} km
                </Label>
                <Slider
                  value={filtros.distanciaMax}
                  onValueChange={(value) => setFiltros({ ...filtros, distanciaMax: value })}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* IDEB Mínimo */}
              <div className="space-y-3">
                <Label className="text-green-700">
                  IDEB mínimo: {filtros.idebMin[0].toFixed(1)}
                </Label>
                <Slider
                  value={filtros.idebMin}
                  onValueChange={(value) => setFiltros({ ...filtros, idebMin: value })}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4">
          {loadingEscolas ? (
            <p className="text-green-800 font-semibold">Carregando escolas...</p>
          ) : (
            <h2 className="text-green-800 font-semibold">
              {escolasFiltradas.length} escola(s) encontrada(s)
            </h2>
          )}
        </div>

        {/* Lista de Escolas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escolasFiltradas.map((escola) => (
            <Card key={escola.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-green-800 leading-tight">
                    {escola.nome}
                  </CardTitle>
                  <Badge variant={escola.tipo === 'Pública' ? 'secondary' : 'default'}>
                    {escola.tipo}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{escola.distanciaKm.toFixed(1)} km • {escola.bairro}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Endereço */}
                <p className="text-sm text-gray-600">
                  {escola.endereco}, {escola.bairro}
                </p>

                {/* Métricas */}
                <div className="space-y-3">
                  {/* IDEB */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">IDEB:</span>
                    <Badge className={getIdebColor(escola.ideb)}>
                      {escola.ideb.toFixed(1)}
                    </Badge>
                  </div>

                  {/* ENADE */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conceito ENADE:</span>
                    <div className="flex gap-1">
                      {getEnadeStars(escola.enade)}
                    </div>
                  </div>

                  {/* Número de Alunos */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Alunos:</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      {escola.numeroAlunos.toLocaleString()}
                    </span>
                  </div>

                  {/* Nível de Ensino */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ensino:</span>
                    <Badge variant="outline" className="text-xs">
                      {escola.nivelEnsino}
                    </Badge>
                  </div>
                </div>

                {/* Infraestrutura */}
                <div>
                  <span className="text-sm font-medium mb-2 block">Infraestrutura:</span>
                  <div className="flex flex-wrap gap-1">
                    {escola.infraestrutura.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Botão de ação */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setEscolaSelecionada(escola)}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {escolasFiltradas.length === 0 && !loadingEscolas && (
          <Card className="border-green-200">
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg mb-2">Nenhuma escola encontrada</h3>
                <p>Tente ajustar os filtros para encontrar mais resultados</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}