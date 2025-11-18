const mongoose = require('mongoose');

const statusIrrigacaoSchema = new mongoose.Schema({
  setorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Status atual
  emIrrigacao: {
    type: Boolean,
    default: false
  },
  historicoAtualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricoIrrigacao'
  },
  // Última irrigação
  ultimaIrrigacao: {
    type: Date
  },
  // Próxima irrigação programada
  proximaIrrigacao: {
    type: Date
  },
  proximaProgramacaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramacaoIrrigacao'
  },
  // Estatísticas rápidas
  totalIrrigacoesHoje: {
    type: Number,
    default: 0
  },
  totalIrrigacoesSemana: {
    type: Number,
    default: 0
  },
  totalIrrigacoesMes: {
    type: Number,
    default: 0
  },
  // Alertas
  alertas: [{
    tipo: {
      type: String,
      enum: ['FALHA', 'ATRASO', 'CONSUMO_ALTO', 'DISPOSITIVO_OFFLINE', 'OUTRO']
    },
    mensagem: String,
    dataHora: {
      type: Date,
      default: Date.now
    },
    lido: {
      type: Boolean,
      default: false
    }
  }],
  // Último comando enviado
  ultimoComando: {
    tipo: {
      type: String,
      enum: ['INICIAR', 'PARAR', 'PAUSAR']
    },
    dataHora: Date,
    usuarioId: String
  }
}, {
  timestamps: true
});

// Método para adicionar alerta
statusIrrigacaoSchema.methods.adicionarAlerta = function(tipo, mensagem) {
  this.alertas.push({
    tipo,
    mensagem,
    dataHora: new Date(),
    lido: false
  });
  return this.save();
};

// Método para marcar alertas como lidos
statusIrrigacaoSchema.methods.marcarAlertasComoLidos = function() {
  this.alertas.forEach(alerta => {
    alerta.lido = true;
  });
  return this.save();
};

const StatusIrrigacao = mongoose.model('StatusIrrigacao', statusIrrigacaoSchema);

module.exports = StatusIrrigacao;
