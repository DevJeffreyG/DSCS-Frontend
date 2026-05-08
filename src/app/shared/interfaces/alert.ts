export interface ServerAlert {
  id: string;
  serverId: number;
  tipo: 'CRITICAL' | 'WARNING' | 'INFO';
  recurso: 'CPU' | 'RAM' | 'DISCO' | 'RED' | 'CONECTIVIDAD' | 'GENERAL';
  mensaje: string;
  valor?: number;
  umbral?: number;
  timestamp: Date;
  resuelto: boolean;
  resueltoEn?: Date;
}

export interface AlertThreshold {
  serverId: number;
  recurso: 'CPU' | 'RAM' | 'DISCO' | 'RED';
  limite: number;
  habilitado: boolean;
}

export interface AlertFilter {
  tipo?: 'CRITICAL' | 'WARNING' | 'INFO';
  recurso?: string;
  limit?: number;
  desde?: Date;
  hasta?: Date;
  resueltas?: boolean;
}

export interface AlertStats {
  total: number;
  criticas: number;
  advertencias: number;
  informativas: number;
  resueltas: number;
}
