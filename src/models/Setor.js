
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUS_SETOR = ['ATIVO', 'AGUARDANDO', 'EM_MANUTENCAO', 'DESATIVADO'];

const setorSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  nome: {
    type: String,
    required: [true, 'Nome do setor é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  area: {
    type: Number,
    required: [true, 'Área do setor é obrigatória'],
    min: [0.1, 'Área deve ser maior que 0'],
    validate: {
      validator: Number.isFinite,
      message: 'Área deve ser um número válido',
    },
  },
  tipoCultura: {
    type: String,
    required: [true, 'Tipo de cultura é obrigatório'],
    trim: true,
  },
  status: {
    type: String,
    required: [true, 'Status do setor é obrigatório'],
    enum: {
      values: STATUS_SETOR,
      message: `Status inválido. Use: ${STATUS_SETOR.join(', ')}`,
    },
    default: 'AGUARDANDO',
  },
  horarioIrrigacao: {
    type: Date,
    required: false,
  },
  ultimaIrrigacao: {
    type: Date,
    required: false,
  },
  foiIrrigadoNaHora: {
    type: Boolean,
    default: false,
  },
  dispositivoId: {
    type: String,
    ref: 'Dispositivo',
    required: [true, 'ID do dispositivo é obrigatório'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual para relacionamento com Dispositivo
setorSchema.virtual('dispositivo', {
  ref: 'Dispositivo',
  localField: 'dispositivoId',
  foreignField: '_id',
  justOne: true,
});

// Método para verificar se deve irrigar agora
setorSchema.methods.deveIrrigarAgora = function() {
  if (!this.horarioIrrigacao) return false;
  
  const agora = new Date();
  const horario = new Date(this.horarioIrrigacao);
  
  // Verifica se está dentro de uma janela de 30 minutos
  const diferencaMinutos = Math.abs(agora - horario) / (1000 * 60);
  return diferencaMinutos <= 30;
};

// Índices para performance
setorSchema.index({ dispositivoId: 1 });
setorSchema.index({ status: 1 });
setorSchema.index({ tipoCultura: 1 });
setorSchema.index({ horarioIrrigacao: 1 });

const Setor = mongoose.model('Setor', setorSchema);

module.exports = Setor;
