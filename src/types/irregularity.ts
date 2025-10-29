export interface Irregularity {
  municipio: string;
  numFormulario: string;
  numeroPoste: string;
  operadora: string;
  irregularidade: string;
  vencidas: number;
  noPrazo: string;
  emailEnviado: string;
  dataEnvioEmail: string;
  regularizado: string;
  statusVerificacao: "normal" | "aguardando_verificacao_jvm"; // Registros que foram regularizados e reapareceram
  bairro: string;
  logradouro: string;
  numLogradouro: string;
}

export interface IrregularityStats {
  total: number;
  vencidas: number;
  noPrazo: number;
  regularizadas: number;
  pendentes: number;
  porMunicipio: Record<string, number>;
  porOperadora: Record<string, number>;
}
