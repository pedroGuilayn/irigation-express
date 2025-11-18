const HistoricoIrrigacao = require('../models/HistoricoIrrigacao');
const ProgramacaoIrrigacao = require('../models/ProgramacaoIrrigacao');
const StatusIrrigacao = require('../models/StatusIrrigacao');
const Alerta = require('../models/Alerta');

const relatorioResolvers = {
  Query: {
    // Relatório de consumo de um setor
    relatorioConsumo: async (_, { setorId, dataInicio, dataFim }) => {
      try {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);

        // Buscar todos os históricos do período
        const historicos = await HistoricoIrrigacao.find({
          setorId,
          dataHoraInicio: { $gte: inicio, $lte: fim },
          status: { $in: ['CONCLUIDA', 'CANCELADA'] }
        }).sort({ dataHoraInicio: 1 });

        // Calcular totais
        let volumeTotalAgua = 0;
        let duracaoTotalMinutos = 0;
        let irrigacoesProgramadas = 0;
        let irrigacoesManuais = 0;
        let irrigacoesEmergenciais = 0;
        let totalIrrigacoes = historicos.length;
        let falhas = 0;
        let somatorioEficiencia = 0;
        let countEficiencia = 0;

        // Agrupar por dia
        const consumoPorDia = {};

        for (const hist of historicos) {
          // Calcular totais
          if (hist.volumeAguaReal) volumeTotalAgua += hist.volumeAguaReal;
          if (hist.duracaoReal) duracaoTotalMinutos += hist.duracaoReal;

          // Contar por tipo
          if (hist.tipoIrrigacao === 'PROGRAMADA') irrigacoesProgramadas++;
          else if (hist.tipoIrrigacao === 'MANUAL') irrigacoesManuais++;
          else if (hist.tipoIrrigacao === 'EMERGENCIAL') irrigacoesEmergenciais++;

          // Calcular eficiência
          const eficiencia = hist.calcularEficiencia();
          if (eficiencia?.media) {
            somatorioEficiencia += eficiencia.media;
            countEficiencia++;
          }

          // Agrupar por dia
          const dia = hist.dataHoraInicio.toISOString().split('T')[0];
          if (!consumoPorDia[dia]) {
            consumoPorDia[dia] = {
              data: dia,
              totalIrrigacoes: 0,
              volumeAgua: 0,
              duracaoMinutos: 0
            };
          }

          consumoPorDia[dia].totalIrrigacoes++;
          if (hist.volumeAguaReal) consumoPorDia[dia].volumeAgua += hist.volumeAguaReal;
          if (hist.duracaoReal) consumoPorDia[dia].duracaoMinutos += hist.duracaoReal;
        }

        // Contar falhas no período
        falhas = await HistoricoIrrigacao.countDocuments({
          setorId,
          dataHoraInicio: { $gte: inicio, $lte: fim },
          status: 'FALHA'
        });

        // Converter objeto de consumo por dia em array
        const consumoPorDiaArray = Object.values(consumoPorDia).sort((a, b) =>
          a.data.localeCompare(b.data)
        );

        // Calcular médias
        const volumeMedioAgua = totalIrrigacoes > 0 ? volumeTotalAgua / totalIrrigacoes : 0;
        const duracaoMediaMinutos = totalIrrigacoes > 0 ? duracaoTotalMinutos / totalIrrigacoes : 0;
        const eficienciaMedia = countEficiencia > 0 ? somatorioEficiencia / countEficiencia : null;

        return {
          setorId,
          periodo: `${inicio.toLocaleDateString()} - ${fim.toLocaleDateString()}`,
          dataInicio: inicio,
          dataFim: fim,
          totalIrrigacoes,
          volumeTotalAgua,
          volumeMedioAgua,
          duracaoTotalMinutos,
          duracaoMediaMinutos,
          irrigacoesProgramadas,
          irrigacoesManuais,
          irrigacoesEmergenciais,
          falhas,
          eficienciaMedia,
          consumoPorDia: consumoPorDiaArray
        };
      } catch (error) {
        throw new Error(`Erro ao gerar relatório de consumo: ${error.message}`);
      }
    },

    // Estatísticas de um setor
    estatisticasSetor: async (_, { setorId }) => {
      try {
        const [
          totalProgramacoes,
          programacoesAtivas,
          totalIrrigacoes,
          ultimoHistorico,
          status,
          alertasAtivos
        ] = await Promise.all([
          ProgramacaoIrrigacao.countDocuments({ setorId }),
          ProgramacaoIrrigacao.countDocuments({ setorId, ativa: true }),
          HistoricoIrrigacao.countDocuments({ setorId }),
          HistoricoIrrigacao.findOne({ setorId, status: 'CONCLUIDA' })
            .sort({ dataHoraFim: -1 }),
          StatusIrrigacao.findOne({ setorId }),
          Alerta.countDocuments({ setorId, status: 'ATIVO' })
        ]);

        // Calcular volume total de água
        const result = await HistoricoIrrigacao.aggregate([
          {
            $match: {
              setorId,
              status: 'CONCLUIDA',
              volumeAguaReal: { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              volumeTotalAgua: { $sum: '$volumeAguaReal' }
            }
          }
        ]);

        const volumeTotalAgua = result.length > 0 ? result[0].volumeTotalAgua : 0;

        return {
          setorId,
          totalProgramacoes,
          programacoesAtivas,
          totalIrrigacoes,
          ultimaIrrigacao: ultimoHistorico?.dataHoraFim || null,
          proximaIrrigacao: status?.proximaIrrigacao || null,
          volumeTotalAgua,
          alertasAtivos
        };
      } catch (error) {
        throw new Error(`Erro ao buscar estatísticas do setor: ${error.message}`);
      }
    },

    // Dashboard geral de irrigação
    dashboardIrrigacao: async () => {
      try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const [
          setoresEmIrrigacao,
          irrigacoesHoje,
          alertasAtivosData,
          statusGeral
        ] = await Promise.all([
          StatusIrrigacao.countDocuments({ emIrrigacao: true }),
          HistoricoIrrigacao.countDocuments({
            dataHoraInicio: { $gte: hoje }
          }),
          Alerta.find({ status: 'ATIVO' })
            .sort({ severidade: 1, createdAt: -1 })
            .limit(10),
          StatusIrrigacao.find({})
        ]);

        // Calcular próximas irrigações
        const proximasIrrigacoes = [];
        for (const status of statusGeral) {
          if (status.proximaIrrigacao && status.proximaProgramacaoId) {
            const prog = await ProgramacaoIrrigacao.findById(status.proximaProgramacaoId);
            if (prog) {
              proximasIrrigacoes.push({
                setorId: status.setorId,
                programacaoId: prog._id.toString(),
                dataHora: status.proximaIrrigacao,
                duracao: prog.duracao
              });
            }
          }
        }

        proximasIrrigacoes.sort((a, b) => a.dataHora - b.dataHora);

        // Calcular consumo de água
        const consumoHojeResult = await HistoricoIrrigacao.aggregate([
          {
            $match: {
              dataHoraInicio: { $gte: hoje },
              status: 'CONCLUIDA',
              volumeAguaReal: { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$volumeAguaReal' }
            }
          }
        ]);

        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());

        const consumoSemanaResult = await HistoricoIrrigacao.aggregate([
          {
            $match: {
              dataHoraInicio: { $gte: inicioSemana },
              status: 'CONCLUIDA',
              volumeAguaReal: { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$volumeAguaReal' }
            }
          }
        ]);

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        const consumoMesResult = await HistoricoIrrigacao.aggregate([
          {
            $match: {
              dataHoraInicio: { $gte: inicioMes },
              status: 'CONCLUIDA',
              volumeAguaReal: { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$volumeAguaReal' }
            }
          }
        ]);

        return {
          setoresEmIrrigacao,
          irrigacoesHoje,
          proximasIrrigacoes: proximasIrrigacoes.slice(0, 5),
          alertasAtivos: alertasAtivosData,
          consumoHoje: consumoHojeResult.length > 0 ? consumoHojeResult[0].total : 0,
          consumoSemana: consumoSemanaResult.length > 0 ? consumoSemanaResult[0].total : 0,
          consumoMes: consumoMesResult.length > 0 ? consumoMesResult[0].total : 0
        };
      } catch (error) {
        throw new Error(`Erro ao gerar dashboard: ${error.message}`);
      }
    }
  }
};

module.exports = relatorioResolvers;
