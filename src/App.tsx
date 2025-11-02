// App.tsx
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

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
}

interface Escola {
  id: number;
  siglaUF: string;
  nomeMunicipio: string;
  nomeEscola: string;
  rede: 'Municipal' | 'Estadual' | 'Privada' | 'Não Informado';
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

const obterNiveisEnsino = (escola: Escola): string => {
  const niveis: string[] = [];
  if (escola.OfereceAnosIniciais) niveis.push('Fundamental I');
  if (escola.OfereceAnosFinais) niveis.push('Fundamental II');
  if (escola.OfereceEnsinoMedio) niveis.push('Médio');
  return niveis.length > 0 ? niveis.join(', ') : 'Não informado';
};

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  
  const [filtrosBusca, setFiltrosBusca] = useState({
    UF: '', 
    Municipio: '',
    Rede: '',
    TipoEnsino: '',
    IdebMinimo: 0.0 
  });

  // REMOVIDO: buscaNomeMunicipio não é mais necessária já que o campo de busca foi removido.
  // const [buscaNomeMunicipio, setBuscaNomeMunicipio] = useState(''); 

  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [erroEscolas, setErroEscolas] = useState('');

  const buscarEscolas = async () => {
    setLoadingEscolas(true);
    setErroEscolas('');

    try {
      const params = new URLSearchParams();

      if (filtrosBusca.UF) params.append('UF', filtrosBusca.UF);
      if (filtrosBusca.Municipio) params.append('Municipio', filtrosBusca.Municipio);
      if (filtrosBusca.Rede) params.append('Rede', filtrosBusca.Rede);
      if (filtrosBusca.TipoEnsino) params.append('TipoEnsino', filtrosBusca.TipoEnsino);
      if (filtrosBusca.IdebMinimo > 0) params.append('IdebMinimo', filtrosBusca.IdebMinimo.toFixed(1));

      const url = `${API_BASE_URL}/api/Ideb?${params.toString()}`;
      console.log('Realizando requisição GET para:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro ao buscar dados das escolas');
      }

      const responseData = await response.json();
      const escolasRecebidas = Array.isArray(responseData.escolas) ? responseData.escolas : [];
      
      const escolasFormatadas: Escola[] = escolasRecebidas.map((item: any) => ({
        id: item.id,
        siglaUF: item.siglaUF || 'ND',
        nomeMunicipio: item.nomeMunicipio || 'Não Informado',
        nomeEscola: item.nomeEscola || 'Escola sem nome',
        rede: item.rede === 'Privada' ? 'Privada' : (item.rede === 'Estadual' ? 'Estadual' : (item.rede === 'Municipal' ? 'Municipal' : 'Não Informado')),
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

      setEscolas(escolasFormatadas);

    } catch (erro: any) {
      console.error('Erro ao buscar escolas:', erro);
      setErroEscolas('Erro ao carregar dados das escolas. Tente novamente. Detalhes: ' + erro.message);
    } finally {
      setLoadingEscolas(false);
    }
  };

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('escolafinder_usuario_logado');
    if (usuarioSalvo) {
      setUsuarioLogado(JSON.parse(usuarioSalvo));
    }
  }, []);

  useEffect(() => {
    if (usuarioLogado) {
      buscarEscolas();
    }
  }, [usuarioLogado, filtrosBusca.UF, filtrosBusca.Municipio, filtrosBusca.Rede, filtrosBusca.TipoEnsino, filtrosBusca.IdebMinimo]);

  // REMOVIDO: escolasFiltradas não é mais necessária já que o campo de busca foi removido.
  //          Agora, a lista de 'escolas' já é o resultado final da API.
  const escolasExibidas = useMemo(() => {
    return escolas;
  }, [escolas]);


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
    setCarregandoAuth(false);
  }, []);

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
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-green-600 text-3xl font-bold mb-2">EscolaFinder</h1>
              <p className="text-gray-600">Encontre a escola ideal para seu filho baseado em dados oficiais</p>
            </div>
            <div className="flex items-center gap-4">
              <UserProfile usuario={usuarioLogado} onLogout={handleLogout} simplifiedHeader={true} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
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
                  value={filtrosBusca.UF}
                  onValueChange={(value) => setFiltrosBusca({ ...filtrosBusca, UF: value })}
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Selecione o Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Estados</SelectItem>
                    <SelectItem value="AC">Acre</SelectItem>
                    <SelectItem value="AL">Alagoas</SelectItem>
                    <SelectItem value="AP">Amapá</SelectItem>
                    <SelectItem value="AM">Amazonas</SelectItem>
                    <SelectItem value="BA">Bahia</SelectItem>
                    <SelectItem value="CE">Ceará</SelectItem>
                    <SelectItem value="DF">Distrito Federal</SelectItem>
                    <SelectItem value="ES">Espírito Santo</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="MA">Maranhão</SelectItem>
                    <SelectItem value="MT">Mato Grosso</SelectItem>
                    <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="PA">Pará</SelectItem>
                    <SelectItem value="PB">Paraíba</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="PE">Pernambuco</SelectItem>
                    <SelectItem value="PI">Piauí</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="RO">Rondônia</SelectItem>
                    <SelectItem value="RR">Roraima</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="SE">Sergipe</SelectItem>
                    <SelectItem value="TO">Tocantins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-green-700">Município</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={filtrosBusca.Municipio}
                  onChange={(e) => setFiltrosBusca({ ...filtrosBusca, Municipio: e.target.value })}
                  className="border-green-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-700">Rede de Ensino</Label>
                <Select
                  value={filtrosBusca.Rede}
                  onValueChange={(value) => setFiltrosBusca({ ...filtrosBusca, Rede: value })}
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Todas as Redes" />
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
                <Label className="text-green-700">Tipo de Ensino Oferecido</Label>
                <Select
                  value={filtrosBusca.TipoEnsino}
                  onValueChange={(value) => setFiltrosBusca({ ...filtrosBusca, TipoEnsino: value })}
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Todos os Tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                    <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-green-700">
                  IDEB mínimo: {filtrosBusca.IdebMinimo.toFixed(1)}
                </Label>
                <Slider
                  value={[filtrosBusca.IdebMinimo]}
                  onValueChange={(value) => setFiltrosBusca({ ...filtrosBusca, IdebMinimo: value[0] })}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* REMOVIDO: Botão "Aplicar Filtros e Buscar Escolas" */}
              {/*
              <div className="md:col-span-4">
                <Button
                  onClick={buscarEscolas}
                  disabled={loadingEscolas}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loadingEscolas ? 'Buscando...' : 'Aplicar Filtros e Buscar Escolas'}
                </Button>
              </div>
              */}
            </div>

            {erroEscolas && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {erroEscolas}
                </AlertDescription>
              </Alert>
            )}

            {/* REMOVIDO: Bloco "Buscar por nome ou município (no resultado atual)" */}
            {/*
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> 
              <div className="space-y-2 md:col-span-2">
                <Label className="text-green-700">Buscar por nome ou município (no resultado atual):</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite o nome da escola ou município"
                    value={buscaNomeMunicipio}
                    onChange={(e) => setBuscaNomeMunicipio(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            */}
          </CardContent>
        </Card>

        <div className="mb-4">
          {loadingEscolas ? (
            <p className="text-green-800 font-semibold">Carregando escolas...</p>
          ) : (
            <h2 className="text-green-800 font-semibold">
              {escolasExibidas.length} escola(s) encontrada(s) {/* Alterado para escolasExibidas */}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escolasExibidas.map((escola) => ( {/* Alterado para escolasExibidas */}
            <Card key={escola.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-green-800 leading-tight">
                    {escola.nomeEscola}
                  </CardTitle>
                  <Badge variant={escola.rede === 'Privada' ? 'default' : 'secondary'} className={escola.rede === 'Privada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                    {escola.rede}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{escola.nomeMunicipio} - {escola.siglaUF}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
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

        {escolasExibidas.length === 0 && !loadingEscolas && ( {/* Alterado para escolasExibidas */}
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