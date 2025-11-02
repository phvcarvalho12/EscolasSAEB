import React, { useState, useMemo, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Slider } from './components/ui/slider';
import { MapPin, Star, Users, Award, Filter, Search, LogOut, AlertCircle } from 'lucide-react';
import { Auth } from './components/Auth';
import { UserProfile } from './components/UserProfile';
import { Alert, AlertDescription } from './components/ui/alert';

// Define a URL base da API lendo-a das variáveis de ambiente.
// Em desenvolvimento, será lido de .env.development
// Em produção, será lido de .env.production (ou .env.staging, se configurado)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
}

// ============================================
// MODIFICAÇÃO: Nova Definição da interface Escola
// Esta interface representa a estrutura dos dados que a API retorna para cada escola.
// ============================================
interface Escola {
  SiglaUF: string;
  NomeMunicipio: string;
  NomeEscola: string;
  Rede: 'Municipal' | 'Estadual' | 'Privada';
  OfereceAnosIniciais: boolean;
  OfereceAnosFinais: boolean;
  OfereceEnsinoMedio: boolean;
  IdebAnosIniciais: number | null;
  AnoReferenciaAnosIniciais: number | null;
  IdebAnosFinais: number | null;
  AnoReferenciaAnosFinais: number | null;
  IdebEnsinoMedio: number | null;
  AnoReferenciaEnsinoMedio: number | null;
}

// Função auxiliar para mapear tipo de ensino (ajustada para os novos booleanos)
const obterNiveisEnsino = (escola: Escola): string => {
  const niveis: string[] = [];
  if (escola.OfereceAnosIniciais) niveis.push('Fundamental I');
  if (escola.OfereceAnosFinais) niveis.push('Fundamental II');
  if (escola.OfereceEnsinoMedio) niveis.push('Médio');
  return niveis.length > 0 ? niveis.join(', ') : 'Não informado';
};

// Função para obter o IDEB geral ou o mais relevante
const obterIdebGeral = (escola: Escola): number => {
  if (escola.IdebEnsinoMedio !== null) return escola.IdebEnsinoMedio;
  if (escola.IdebAnosFinais !== null) return escola.IdebAnosFinais;
  if (escola.IdebAnosIniciais !== null) return escola.IdebAnosIniciais;
  return 0; // Ou outro valor padrão
};

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'Todas',
    nivelEnsino: 'Todos',
    distanciaMax: [10], // Mantido, mas não usado nos filtros da API
    idebMin: [5.0] // Mantido, mas aplicado após a busca da API
  });

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [erroEscolas, setErroEscolas] = useState('');

  // Estados para os filtros que serão enviados na requisição GET para a API
  const [filtrosAPI, setFiltrosAPI] = useState({
    UF: 'SP',
    Municipio: 'São Paulo',
    Rede: '', // 'Municipal', 'Estadual', 'Privada'
    TipoEnsino: '' // 'Anos Iniciais', 'Anos Finais', 'Ensino Médio'
  });

  /**
   * Função assíncrona para buscar escolas da API.
   * Ela constrói uma URL com parâmetros de querystring e faz uma requisição GET.
   */
  const buscarEscolas = async () => {
    setLoadingEscolas(true);
    setErroEscolas('');

    try {
      // 1. Constrói os parâmetros de querystring para a requisição GET
      //    A API espera parâmetros como: ?UF=SP&Municipio=SaoPaulo&Rede=Municipal
      const params = new URLSearchParams();

      if (filtrosAPI.UF) params.append('UF', filtrosAPI.UF);
      if (filtrosAPI.Municipio) params.append('Municipio', filtrosAPI.Municipio);
      if (filtrosAPI.Rede) params.append('Rede', filtrosAPI.Rede);
      if (filtrosAPI.TipoEnsino) params.append('TipoEnsino', filtrosAPI.TipoEnsino);

      // 2. Monta a URL completa para a requisição GET
      //    Exemplo: https://prolific-delight-production-432f.up.railway.app/Ideb?UF=SP&Municipio=São+Paulo
      const url = `${API_BASE_URL}/api/Ideb?${params.toString()}`;
      console.log('Realizando requisição GET para:', url); // Para depuração

      // 3. Executa a requisição GET usando a API Fetch
      const response = await fetch(url, {
        method: 'GET', // Explicitamente definindo o método GET (padrão para fetch se não especificado)
        headers: {
          'Content-Type': 'application/json', // Informa ao servidor que esperamos JSON
          // Adicione headers de autenticação aqui se necessário, ex:
          // 'Authorization': `Bearer ${tokenDoUsuarioLogado}`
        },
      });

      // 4. Verifica se a resposta da API foi bem-sucedida (status 2xx)
      if (!response.ok) {
        // Se a resposta não for OK, lança um erro com a mensagem da API ou padrão
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro ao buscar dados das escolas');
      }

      // 5. Converte a resposta para JSON
      const dados = await response.json();

      // ============================================
      // MODIFICAÇÃO: Mapeamento dos dados da API para a nova interface Escola
      // Os dados recebidos da API são mapeados para o formato esperado pelo frontend.
      // ============================================
      const escolasFormatadas: Escola[] = dados.map((item: any) => ({
        SiglaUF: item.siglaUF || 'ND',
        NomeMunicipio: item.nomeMunicipio || 'Não Informado',
        NomeEscola: item.nomeEscola || 'Escola sem nome',
        Rede: item.rede === 'Privada' ? 'Privada' : (item.rede === 'Estadual' ? 'Estadual' : 'Municipal'),
        OfereceAnosIniciais: item.ofereceAnosIniciais || false,
        OfereceAnosFinais: item.ofereceAnosFinais || false,
        OfereceEnsinoMedio: item.ofereceEnsinoMedio || false,
        IdebAnosIniciais: item.idebAnosIniciais || null,
        AnoReferenciaAnosIniciais: item.anoReferenciaAnosIniciais || null,
        IdebAnosFinais: item.idebAnosFinais || null,
        AnoReferenciaAnosFinais: item.anoReferenciaAnosFinais || null,
        IdebEnsinoMedio: item.idebEnsinoMedio || null,
        AnoReferenciaEnsinoMedio: item.anoReferenciaEnsinoMedio || null,
      }));

      // 6. Atualiza o estado das escolas com os dados formatados
      setEscolas(escolasFormatadas);

    } catch (erro: any) {
      console.error('Erro ao buscar escolas:', erro);
      setErroEscolas('Erro ao carregar dados das escolas. Tente novamente. Detalhes: ' + erro.message);
    } finally {
      setLoadingEscolas(false);
    }
  };

  // Efeito que carrega o usuário logado do localStorage ao iniciar a aplicação
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('escolafinder_usuario_logado');
    if (usuarioSalvo) {
      setUsuarioLogado(JSON.parse(usuarioSalvo));
    }
  }, []); // Executa apenas uma vez ao montar o componente

  // Efeito que dispara a busca de escolas sempre que o usuário logado ou os filtros da API mudam
  useEffect(() => {
    if (usuarioLogado) {
      buscarEscolas();
    }
  }, [usuarioLogado, filtrosAPI.UF, filtrosAPI.Municipio, filtrosAPI.Rede, filtrosAPI.TipoEnsino]);

  // ============================================
  // MODIFICAÇÃO: Lógica de filtros ajustada para a nova interface Escola
  // Este useMemo filtra os dados *já carregados* da API com base nos filtros internos do frontend.
  // ============================================
  const escolasFiltradas = useMemo(() => {
    return escolas.filter(escola => {
      const matchBusca = escola.NomeEscola.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                         escola.NomeMunicipio.toLowerCase().includes(filtros.busca.toLowerCase());

      const matchTipo = filtros.tipo === 'Todas' || (escola.Rede.toLowerCase() === filtros.tipo.toLowerCase() || (filtros.tipo === 'Pública' && (escola.Rede === 'Municipal' || escola.Rede === 'Estadual')));

      const matchNivel = filtros.nivelEnsino === 'Todos' ||
                        (filtros.nivelEnsino === 'Fundamental I' && escola.OfereceAnosIniciais) ||
                        (filtros.nivelEnsino === 'Fundamental II' && escola.OfereceAnosFinais) ||
                        (filtros.nivelEnsino === 'Médio' && escola.OfereceEnsinoMedio) ||
                        (filtros.nivelEnsino === 'Fundamental' && (escola.OfereceAnosIniciais || escola.OfereceAnosFinais)) ||
                        (filtros.nivelEnsino === 'Completo' && (escola.OfereceAnosIniciais && escola.OfereceAnosFinais && escola.OfereceEnsinoMedio));
      
      const idebGeral = obterIdebGeral(escola);
      const matchIdeb = idebGeral >= filtros.idebMin[0];

      return matchBusca && matchTipo && matchNivel && matchIdeb;
    });
  }, [filtros, escolas]);

  const handleLogin = (usuario: Usuario) => {
    setUsuarioLogado(usuario);
    localStorage.setItem('escolafinder_usuario_logado', JSON.stringify(usuario));
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setEscolas([]);
    localStorage.removeItem('escolafinder_usuario_logado');
  };

  const [carregandoAuth, setCarregandoAuth] = useState(true);

useEffect(() => {
  const usuarioSalvo = localStorage.getItem('escolafinder_usuario_logado');
  if (usuarioSalvo) {
    setUsuarioLogado(JSON.parse(usuarioSalvo));
  }
  setCarregandoAuth(false); // Marca como carregado
}, []);

// Mostra loading enquanto verifica autenticação
if (carregandoAuth) {
  return <div className="min-h-screen flex items-center justify-center">
    <p>Carregando...</p>
  </div>;
}

if (!usuarioLogado) {
  return <Auth onLogin={handleLogin} />;
}

  const getIdebColor = (ideb: number) => {
    if (ideb >= 8) return 'text-green-600 bg-green-100';
    if (ideb >= 7) return 'text-green-500 bg-green-50';
    if (ideb >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-500 bg-red-100';
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-green-700">Estado (UF)</Label>
                <Select
                  value={filtrosAPI.UF}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, UF: value })}
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-green-700">Município</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={filtrosAPI.Municipio}
                  onChange={(e) => setFiltrosAPI({ ...filtrosAPI, Municipio: e.target.value })}
                  className="border-green-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-700">Rede</Label>
                <Select
                  value={filtrosAPI.Rede}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, Rede: value })}
                >
                  <SelectTrigger className="border-green-200">
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
                <Label className="text-green-700">Tipo de Ensino</Label>
                <Select
                  value={filtrosAPI.TipoEnsino}
                  onValueChange={(value) => setFiltrosAPI({ ...filtrosAPI, TipoEnsino: value })}
                >
                  <SelectTrigger className="border-green-200">
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
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loadingEscolas ? 'Buscando...' : 'Buscar Escolas'}
                </Button>
              </div>
            </div>

            {erroEscolas && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {erroEscolas}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-green-700">Buscar por nome ou município:</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite o nome da escola ou município"
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

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

            {/* Sliders (Distância removido, IDEB mantido) */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
          {escolasFiltradas.map((escola, index) => (
            <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-green-800 leading-tight">
                    {escola.NomeEscola}
                  </CardTitle>
                  <Badge variant={escola.Rede === 'Pública' ? 'secondary' : 'default'}>
                    {escola.Rede}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{escola.NomeMunicipio} - {escola.SiglaUF}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Métricas */}
                <div className="space-y-3">
                  {escola.IdebAnosIniciais !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">IDEB Anos Iniciais ({escola.AnoReferenciaAnosIniciais}):</span>
                      <Badge className={getIdebColor(escola.IdebAnosIniciais)}>
                        {escola.IdebAnosIniciais.toFixed(1)}
                      </Badge>
                    </div>
                  )}

                  {escola.IdebAnosFinais !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">IDEB Anos Finais ({escola.AnoReferenciaAnosFinais}):</span>
                      <Badge className={getIdebColor(escola.IdebAnosFinais)}>
                        {escola.IdebAnosFinais.toFixed(1)}
                      </Badge>
                    </div>
                  )}

                  {escola.IdebEnsinoMedio !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">IDEB Ensino Médio ({escola.AnoReferenciaEnsinoMedio}):</span>
                      <Badge className={getIdebColor(escola.IdebEnsinoMedio)}>
                        {escola.IdebEnsinoMedio.toFixed(1)}
                      </Badge>
                    </div>
                  )}

                  {/* Níveis de Ensino Oferecidos */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ensino:</span>
                    <Badge variant="outline" className="text-xs">
                      {obterNiveisEnsino(escola)}
                    </Badge>
                  </div>
                </div>

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