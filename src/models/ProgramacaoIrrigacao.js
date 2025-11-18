const mongoose = require('mongoose');

const programacaoIrrigacaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  setorId: {
    type: String,
    required: true,
    index: true
  },
  ativa: {
    type: Boolean,
    default: true
  },
  tipoRecorrencia: {
    type: String,
    enum: ['UNICA', 'DIARIA', 'SEMANAL', 'PERSONALIZADA'],
    required: true
  },
  // Para recorrência única
  dataHoraInicio: {
    type: Date
  },
  // Para recorrência diária/semanal
  horarioInicio: {
    type: String, // Formato HH:mm
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Horário deve estar no formato HH:mm'
    }
  },
  // Para recorrência semanal
  diasSemana: [{
    type: Number,
    min: 0,
    max: 6 // 0 = Domingo, 6 = Sábado
  }],
  // Duração da irrigação em minutos
  duracao: {
    type: Number,
    required: true,
    min: 1
  },
  // Quantidade estimada de água em litros
  volumeAgua: {
    type: Number
  },
  // Data de validade (opcional)
  dataValidade: {
    type: Date
  },
  // Configurações avançadas
  prioridade: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  observacoes: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para otimizar consultas
programacaoIrrigacaoSchema.index({ setorId: 1, ativa: 1 });
programacaoIrrigacaoSchema.index({ dataHoraInicio: 1 });

// Método para verificar se a programação está válida
programacaoIrrigacaoSchema.methods.isValida = function() {
  if (this.dataValidade && this.dataValidade < new Date()) {
    return false;
  }
  return this.ativa;
};

const ProgramacaoIrrigacao = mongoose.model('ProgramacaoIrrigacao', programacaoIrrigacaoSchema);

module.exports = ProgramacaoIrrigacao;
