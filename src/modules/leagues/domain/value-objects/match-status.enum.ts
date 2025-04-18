export enum MatchStatus {
  SCHEDULED = 'Scheduled', // Programado pero no iniciado
  TIMED = 'Timed', // Programado con hora específica (similar a Scheduled)
  IN_PLAY = 'In Play', // En curso
  PAUSED = 'Paused', // Descanso, interrupción
  FINISHED = 'Finished', // Finalizado normalmente
  SUSPENDED = 'Suspended', // Suspendido, podría reanudarse
  POSTPONED = 'Postponed', // Aplazado antes de empezar
  CANCELLED = 'Cancelled', // Cancelado definitivamente
  AWARDED = 'Awarded', // Resultado decidido por comité (e.g., walkover)
}
