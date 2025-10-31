
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const usuarioSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

usuarioSchema.virtual('propriedades', {
  ref: 'Propriedade',
  localField: '_id',
  foreignField: 'usuarioId',
});

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

usuarioSchema.methods.compararSenha = async function(senhaCandidata) {
  return await bcrypt.compare(senhaCandidata, this.senha);
};

usuarioSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.senha;
  delete obj.__v;
  return obj;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
