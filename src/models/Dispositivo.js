
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUS_DISPOSITIVO = ['ATIVO', 'INATIVO', 'MANUTENCAO', 'FALHA'];

const dispositivoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  nome: {
    type: String,
    required: [true, 'Nome do dispositivo é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  tipo: {
    type: String,
    trim: true,
    enum: {
      values: ['CONTROLADOR', 'SENSOR', 'ATUADOR', 'OUTRO'],
      message: 'Tipo inválido. Use: CONTROLADOR, SENSOR, ATUADOR ou OUTRO',
    },
    default: 'CONTROLADOR',
  },
  modelo: {
    type: String,
    required: [true, 'Modelo do dispositivo é obrigatório'],
    trim: true,
  },
  status: {
    type: String,
    required: [true, 'Status do dispositivo é obrigatório'],
    enum: {
      values: STATUS_DISPOSITIVO,
      message: `Status inválido. Use: ${STATUS_DISPOSITIVO.join(', ')}`,
    },
    default: 'INATIVO',
  },
  dataInstalacao: {
    type: Date,
    required: [true, 'Data de instalação é obrigatória'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Data de instalação não pode ser no futuro',
    },
  },
  propriedadeId: {
    type: String,
    ref: 'Propriedade',
    required: [true, 'ID da propriedade é obrigatório'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

dispositivoSchema.virtual('propriedade', {
  ref: 'Propriedade',
  localField: 'propriedadeId',
  foreignField: '_id',
  justOne: true,
});

dispositivoSchema.virtual('setores', {
  ref: 'Setor',
  localField: '_id',
  foreignField: 'dispositivoId',
});

dispositivoSchema.index({ propriedadeId: 1 });
dispositivoSchema.index({ status: 1 });
dispositivoSchema.index({ tipo: 1 });

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;
