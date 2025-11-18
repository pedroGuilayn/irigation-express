const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: [
      'FALHA_IRRIGACAO',
      'IRRIGACAO_ATRASADA',
      'CONSUMO_ELEVADO',
      'DISPOSITIVO_OFFLINE',
      'SETOR_INATIVO',
      'PROGRAMACAO_CONFLITO',
      'SENSOR_FALHA',
      'MANUTENCAO_NECESSARIA',
      'OUTRO'
    ],
    required: true
  },
  severidade: {
    type: String,
    enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'],
    default: 'MEDIA'
  },
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  // Entidades relacionadas
  setorId: {
    type: String,
    index: true
  },
  dispositivoId: {
    type: String,
    index: true
  },
  propriedadeId: {
    type: String,
    index: true
  },
  programacaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramacaoIrrigacao'
  },
  historicoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricoIrrigacao'
  },
  // Status do alerta
  status: {
    type: String,
    enum: ['ATIVO', 'RESOLVIDO', 'IGNORADO'],
    default: 'ATIVO'
  },
  lido: {
    type: Boolean,
    default: false
  },
  // Resolução
  dataResolucao: {
    type: Date
  },
  resolvidoPor: {
    type: String // usuarioId
  },
  observacoesResolucao: {
    type: String
  },
  // Metadados
  dadosAdicionais: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices para otimizar buscas
alertaSchema.index({ status: 1, createdAt: -1 });
alertaSchema.index({ severidade: 1, status: 1 });
alertaSchema.index({ setorId: 1, status: 1 });
alertaSchema.index({ tipo: 1, status: 1 });

// Método para resolver alerta
alertaSchema.methods.resolver = function(usuarioId, observacoes) {
  this.status = 'RESOLVIDO';
  this.dataResolucao = new Date();
  this.resolvidoPor = usuarioId;
  this.observacoesResolucao = observacoes;
  this.lido = true;
  return this.save();
};

// Método para ignorar alerta
alertaSchema.methods.ignorar = function(usuarioId, observacoes) {
  this.status = 'IGNORADO';
  this.dataResolucao = new Date();
  this.resolvidoPor = usuarioId;
  this.observacoesResolucao = observacoes;
  this.lido = true;
  return this.save();
};

const Alerta = mongoose.model('Alerta', alertaSchema);

module.exports = Alerta;
