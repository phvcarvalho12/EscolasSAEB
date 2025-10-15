import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  Calendar,
  MapPin,
  Edit3,
  ChevronDown
} from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
}

interface UserProfileProps {
  usuario: Usuario;
  onLogout: () => void;
  showFullProfile?: boolean;
}

export function UserProfile({ usuario, onLogout, showFullProfile = false }: UserProfileProps) {
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Componente simplificado para header
  if (!showFullProfile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-green-50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-600 text-white text-sm">
                {obterIniciais(usuario.nome)}
              </AvatarFallback>
            </Avatar>
            <span className="text-green-700 hidden md:inline">{usuario.nome}</span>
            <ChevronDown className="h-4 w-4 text-green-600" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{usuario.nome}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {usuario.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setMostrarPerfil(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Modal/Overlay do perfil completo
  if (mostrarPerfil) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="bg-green-50 text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-green-600 text-white text-xl">
                  {obterIniciais(usuario.nome)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-green-700">{usuario.nome}</CardTitle>
            <p className="text-green-600">Usuário EscolaFinder</p>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{usuario.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Membro desde</p>
                  <p className="text-sm text-gray-600">{formatarData(usuario.dataCriacao)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Ativo
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Ações Rápidas</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
                
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setMostrarPerfil(false)}
              >
                Fechar
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}