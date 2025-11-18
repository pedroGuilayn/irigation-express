const mongoose = require('mongoose');

const historicoIrrigacaoSchema = new mongoose.Schema({
  setorId: {
    type: String,
    required: true,
    index: true
  },
  programacaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramacaoIrrigacao'
  },
  // Dados da execução
  dataHoraInicio: {
    type: Date,
    required: true,
    index: true
  },
  dataHoraFim: {
    type: Date
  },
  duracaoPlanejada: {
    type: Number, // em minutos
    required: true
  },
  duracaoReal: {
    type: Number // em minutos
  },
  // Tipo de irrigação
  tipoIrrigacao: {
    type: String,
    enum: ['PROGRAMADA', 'MANUAL', 'EMERGENCIAL', 'TESTE'],
    required: true
  },
  // Status da execução
  status: {
    type: String,
    enum: ['EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'FALHA'],
    default: 'EM_ANDAMENTO',
    required: true
  },
  // Consumo de água
  volumeAguaPlanejado: {
    type: Number // em litros
  },
  volumeAguaReal: {
    type: Number // em litros
  },
  // Informações adicionais
  motivoCancelamento: {
    type: String
  },
  motivoFalha: {
    type: String
  },
  observacoes: {
    type: String
  },
  // Dados do usuário que executou (se manual)
  usuarioId: {
    type: String
  },
  // Dados do dispositivo
  dispositivoId: {
    type: String
  },
  // Condições climáticas no momento (se disponível)
  temperatura: {
    type: Number
  },
  umidade: {
    type: Number
  },
  pluviosidade: {
    type: Number
  }
}, {
  timestamps: true
});

// Índices compostos para queries complexas
historicoIrrigacaoSchema.index({ setorId: 1, dataHoraInicio: -1 });
historicoIrrigacaoSchema.index({ status: 1, dataHoraInicio: -1 });
historicoIrrigacaoSchema.index({ tipoIrrigacao: 1, dataHoraInicio: -1 });

// Método para calcular eficiência
historicoIrrigacaoSchema.methods.calcularEficiencia = function() {
  if (!this.duracaoReal || !this.duracaoPlanejada) {
    return null;
  }
  const eficienciaTempo = (this.duracaoReal / this.duracaoPlanejada) * 100;

  if (this.volumeAguaReal && this.volumeAguaPlanejado) {
    const eficienciaVolume = (this.volumeAguaReal / this.volumeAguaPlanejado) * 100;
    return {
      tempo: eficienciaTempo,
      volume: eficienciaVolume,
      media: (eficienciaTempo + eficienciaVolume) / 2
    };
  }

  return { tempo: eficienciaTempo };
};

const HistoricoIrrigacao = mongoose.model('HistoricoIrrigacao', historicoIrrigacaoSchema);

module.exports = HistoricoIrrigacao;
