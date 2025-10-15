import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Users, 
  Award, 
  Heart,
  HeartHandshake,
  Phone,
  Mail,
  Clock,
  Car,
  Bus,
  Calendar,
  BookOpen,
  GraduationCap,
  Building2,
  Wifi,
  MonitorPlay,
  Utensils,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface Escola {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: 'Pública' | 'Privada';
  ideb: number;
  enade: number;
  numeroAlunos: number;
  distanciaKm: number;
  lat: number;
  lng: number;
  nivelEnsino: 'Fundamental I' | 'Fundamental II' | 'Médio' | 'Fundamental Completo' | 'Completo';
  infraestrutura: string[];
}

interface EscolaDetalhesProps {
  escola: Escola;
  onVoltar: () => void;
  onLogout?: () => void;
  usuarioLogado?: {
    nome: string;
  };
}

export function EscolaDetalhes({ escola, onVoltar, onLogout, usuarioLogado }: EscolaDetalhesProps) {
  const [favoritada, setFavoritada] = useState(false);

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

  const toggleFavorito = () => {
    setFavoritada(!favoritada);
    // Aqui implementaria a lógica de salvar nos favoritos
  };

  // Dados mockados extras para a tela de detalhes
  const dadosExtras = {
    telefone: '(11) 3456-7890',
    email: 'contato@escola.edu.br',
    horarioFuncionamento: '7h00 às 17h30',
    anoFundacao: escola.tipo === 'Pública' ? 1985 : 1992,
    mensalidade: escola.tipo === 'Privada' ? 'R$ 1.200,00' : 'Gratuita',
    diretora: escola.tipo === 'Pública' ? 'Maria Santos Silva' : 'Ana Carolina Oliveira',
    vagas: {
      fundamental1: escola.nivelEnsino.includes('Fundamental') ? 30 : 0,
      fundamental2: escola.nivelEnsino.includes('Fundamental') ? 25 : 0,
      medio: escola.nivelEnsino.includes('Médio') || escola.nivelEnsino === 'Completo' ? 20 : 0
    },
    aprovacao: Math.floor(85 + (escola.ideb * 2)), // Mock baseado no IDEB
    transportePublico: ['Ônibus: Linha 875M, 632T', 'Metrô: Estação Vila Madalena (800m)'],
    estacionamento: escola.tipo === 'Privada' ? 'Gratuito para pais' : 'Limitado'
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onVoltar}
              className="hover:bg-green-50 text-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à busca
            </Button>
            
            <div className="flex-1">
              <h1 className="text-green-700 text-xl font-medium">{escola.nome}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{escola.endereco}, {escola.bairro} - {escola.cidade}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {usuarioLogado && (
                <>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-600">Bem-vindo,</p>
                    <p className="text-green-700 font-medium">{usuarioLogado.nome}</p>
                  </div>
                  {onLogout && (
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  )}
                </>
              )}
              <Button
                variant={favoritada ? "default" : "outline"}
                onClick={toggleFavorito}
                className={favoritada ? "bg-red-500 hover:bg-red-600" : "border-red-200 text-red-600 hover:bg-red-50"}
              >
                {favoritada ? (
                  <HeartHandshake className="h-4 w-4 mr-2" />
                ) : (
                  <Heart className="h-4 w-4 mr-2" />
                )}
                {favoritada ? 'Favoritada' : 'Favoritar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo Geral */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-green-800">{escola.nome}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={escola.tipo === 'Pública' ? 'secondary' : 'default'}>
                        {escola.tipo}
                      </Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {escola.nivelEnsino}
                      </Badge>
                      <span className="text-sm text-gray-600">{escola.distanciaKm} km de distância</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* IDEB */}
                  <div className="text-center">
                    <div className="mb-2">
                      <Badge className={`text-lg px-4 py-2 ${getIdebColor(escola.ideb)}`}>
                        {escola.ideb.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">IDEB</p>
                    <p className="text-xs text-gray-500">Índice de Desenvolvimento da Educação Básica</p>
                  </div>

                  {/* ENADE */}
                  <div className="text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      {getEnadeStars(escola.enade)}
                    </div>
                    <p className="text-sm font-medium">Conceito ENADE</p>
                    <p className="text-xs text-gray-500">Avaliação Nacional de Cursos</p>
                  </div>

                  {/* Taxa de Aprovação */}
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-2xl font-medium text-green-600">{dadosExtras.aprovacao}%</span>
                    </div>
                    <p className="text-sm font-medium">Taxa de Aprovação</p>
                    <p className="text-xs text-gray-500">Dados do último ano letivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs de Informações */}
            <Card className="border-green-200">
              <CardContent className="p-0">
                <Tabs defaultValue="sobre" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                    <TabsTrigger value="vagas">Vagas</TabsTrigger>
                    <TabsTrigger value="localizacao">Localização</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sobre" className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Fundada em</p>
                            <p className="text-gray-600">{dadosExtras.anoFundacao}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Total de Alunos</p>
                            <p className="text-gray-600">{escola.numeroAlunos.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Direção</p>
                            <p className="text-gray-600">{dadosExtras.diretora}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Horário de Funcionamento</p>
                            <p className="text-gray-600">{dadosExtras.horarioFuncionamento}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Mensalidade</p>
                            <p className="text-gray-600">{dadosExtras.mensalidade}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Tipo de Instituição</p>
                            <p className="text-gray-600">
                              {escola.tipo === 'Pública' ? 'Escola Pública Municipal' : 'Instituição Privada'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="estrutura" className="p-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Infraestrutura Disponível</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {escola.infraestrutura.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <Building2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>

                      {escola.tipo === 'Privada' && (
                        <div className="mt-6 space-y-3">
                          <h4 className="font-medium">Recursos Adicionais</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Wifi className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Wi-Fi Gratuito</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                              <MonitorPlay className="h-4 w-4 text-purple-600" />
                              <span className="text-sm">Lousa Digital</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                              <Utensils className="h-4 w-4 text-orange-600" />
                              <span className="text-sm">Cantina</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="vagas" className="p-6 space-y-4">
                    <h4 className="font-medium">Vagas Disponíveis para 2024</h4>
                    
                    {dadosExtras.vagas.fundamental1 > 0 && (
                      <div className="p-4 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Ensino Fundamental I (1º ao 5º ano)</span>
                          <Badge variant="secondary">{dadosExtras.vagas.fundamental1} vagas</Badge>
                        </div>
                        <Progress value={70} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Processo seletivo aberto</p>
                      </div>
                    )}

                    {dadosExtras.vagas.fundamental2 > 0 && (
                      <div className="p-4 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Ensino Fundamental II (6º ao 9º ano)</span>
                          <Badge variant="secondary">{dadosExtras.vagas.fundamental2} vagas</Badge>
                        </div>
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Inscrições até 15/12/2024</p>
                      </div>
                    )}

                    {dadosExtras.vagas.medio > 0 && (
                      <div className="p-4 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Ensino Médio</span>
                          <Badge variant="secondary">{dadosExtras.vagas.medio} vagas</Badge>
                        </div>
                        <Progress value={30} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Lista de espera disponível</p>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Como se inscrever</h5>
                      <p className="text-sm text-blue-700">
                        {escola.tipo === 'Pública' 
                          ? 'Inscrições através do portal da Secretaria de Educação do município.'
                          : 'Entre em contato diretamente com a escola para agendar uma visita e conhecer o processo seletivo.'
                        }
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="localizacao" className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Endereço Completo</h4>
                        <p className="text-gray-600">{escola.endereco}, {escola.bairro}</p>
                        <p className="text-gray-600">{escola.cidade}, SP</p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-3">Transporte Público</h4>
                        <div className="space-y-2">
                          {dadosExtras.transportePublico.map((transporte, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Bus className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{transporte}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Estacionamento</h4>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{dadosExtras.estacionamento}</span>
                        </div>
                      </div>

                      {/* Mock do mapa */}
                      <div className="mt-6">
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <MapPin className="h-8 w-8 mx-auto mb-2" />
                            <p>Mapa da localização</p>
                            <p className="text-xs">Integração com Google Maps</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contato */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">Contato</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-gray-600">{dadosExtras.telefone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{dadosExtras.email}</p>
                  </div>
                </div>

                <Separator />

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Entrar em Contato
                </Button>

                <Button variant="outline" className="w-full border-green-200 text-green-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita
                </Button>
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-medium text-green-600">{escola.ideb.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">IDEB</div>
                </div>

                <Separator />

                <div className="text-center">
                  <div className="text-2xl font-medium text-blue-600">{dadosExtras.aprovacao}%</div>
                  <div className="text-xs text-gray-500">Taxa de Aprovação</div>
                </div>

                <Separator />

                <div className="text-center">
                  <div className="text-2xl font-medium text-purple-600">{escola.numeroAlunos}</div>
                  <div className="text-xs text-gray-500">Total de Alunos</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}