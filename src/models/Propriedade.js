
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const propriedadeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  nome: {
    type: String,
    required: [true, 'Nome da propriedade é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  localizacao: {
    type: String,
    required: [true, 'Localização é obrigatória'],
    trim: true,
  },
  tamanho: {
    type: Number,
    required: [true, 'Tamanho da propriedade é obrigatório'],
    min: [0.1, 'Tamanho deve ser maior que 0'],
    validate: {
      validator: Number.isFinite,
      message: 'Tamanho deve ser um número válido',
    },
  },
  usuarioId: {
    type: String,
    ref: 'Usuario',
    required: [true, 'ID do usuário é obrigatório'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

propriedadeSchema.virtual('usuario', {
  ref: 'Usuario',
  localField: 'usuarioId',
  foreignField: '_id',
  justOne: true,
});

propriedadeSchema.virtual('dispositivos', {
  ref: 'Dispositivo',
  localField: '_id',
  foreignField: 'propriedadeId',
});

propriedadeSchema.index({ usuarioId: 1 });
propriedadeSchema.index({ nome: 1 });

const Propriedade = mongoose.model('Propriedade', propriedadeSchema);

module.exports = Propriedade;
