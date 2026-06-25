export interface ResumenDashboard {
  totalTickets: number;
  ticketsNuevos: number;
  ticketsEnAtencion: number;
  ticketsEscalados: number;
  ticketsResueltos: number;
  ticketsCerrados: number;
  totalUsuarios: number;
  totalTecnicos: number;
  totalClientes: number;
  tiempoPromedioResolucionHoras: number | null;
}

export interface Conteo {
  etiqueta: string;
  total: number;
}

export interface TecnicoConteo {
  tecnicoId: number;
  nombreCompleto: string;
  total: number;
}

export interface TecnicoRanking {
  tecnicoId: number;
  nombreCompleto: string;
  ticketsResueltos: number;
  tiempoPromedioHoras: number | null;
}

export interface CategoriaRanking {
  categoriaId: number;
  nombre: string;
  totalTicketsResueltos: number;
  tiempoPromedioHoras: number | null;
}
