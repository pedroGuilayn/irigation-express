// Models focados em irrigação
const ProgramacaoIrrigacao = require('./ProgramacaoIrrigacao');
const HistoricoIrrigacao = require('./HistoricoIrrigacao');
const StatusIrrigacao = require('./StatusIrrigacao');
const Alerta = require('./Alerta');

// Os models abaixo foram removidos pois essas entidades
// são gerenciadas pela API externa em Spring Boot
// const Usuario = require('./Usuario');
// const Propriedade = require('./Propriedade');
// const Dispositivo = require('./Dispositivo');
// const Setor = require('./Setor');

module.exports = {
  ProgramacaoIrrigacao,
  HistoricoIrrigacao,
  StatusIrrigacao,
  Alerta,
};
