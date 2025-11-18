const HistoricoIrrigacao = require('../models/HistoricoIrrigacao');
const StatusIrrigacao = require('../models/StatusIrrigacao');

const historicoResolvers = {
  Query: {
    // Buscar histórico por ID
    historico: async (_, { id }) => {
      try {
        const historico = await HistoricoIrrigacao.findById(id);
        if (!historico) {
          throw new Error('Histórico não encontrado');
        }
        return historico;
      } catch (error) {
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }
    },

    // Listar históricos com filtros e paginação
    historicos: async (_, { filtros = {}, pagina = 0, limite = 10 }) => {
      try {
        const query = {};

        if (filtros.setorId) query.setorId = filtros.setorId;
        if (filtros.dispositivoId) query.dispositivoId = filtros.dispositivoId;
        if (filtros.tipoIrrigacao) query.tipoIrrigacao = filtros.tipoIrrigacao;
        if (filtros.status) query.status = filtros.status;

        if (filtros.dataInicio || filtros.dataFim) {
          query.dataHoraInicio = {};
          if (filtros.dataInicio) {
            query.dataHoraInicio.$gte = new Date(filtros.dataInicio);
          }
          if (filtros.dataFim) {
            query.dataHoraInicio.$lte = new Date(filtros.dataFim);
          }
        }

        const skip = pagina * limite;

        const [historicos, total] = await Promise.all([
          HistoricoIrrigacao.find(query)
            .skip(skip)
            .limit(limite)
            .sort({ dataHoraInicio: -1 }),
          HistoricoIrrigacao.countDocuments(query)
        ]);

        return {
          historicos,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite)
        };
      } catch (error) {
        throw new Error(`Erro ao listar históricos: ${error.message}`);
      }
    },

    // Histórico de um setor específico
    historicosPorSetor: async (_, { setorId, limite = 10 }) => {
      try {
        const historicos = await HistoricoIrrigacao.find({ setorId })
          .sort({ dataHoraInicio: -1 })
          .limit(limite);

        return historicos;
      } catch (error) {
        throw new Error(`Erro ao buscar histórico do setor: ${error.message}`);
      }
    },

    // Irrigações em andamento
    irrigacoesEmAndamento: async () => {
      try {
        const irrigacoes = await HistoricoIrrigacao.find({
          status: 'EM_ANDAMENTO'
        }).sort({ dataHoraInicio: -1 });

        return irrigacoes;
      } catch (error) {
        throw new Error(`Erro ao buscar irrigações em andamento: ${error.message}`);
      }
    },

    // Status de irrigação de um setor
    statusIrrigacaoSetor: async (_, { setorId }) => {
      try {
        let status = await StatusIrrigacao.findOne({ setorId });

        if (!status) {
          // Criar status inicial se não existir
          status = new StatusIrrigacao({
            setorId,
            emIrrigacao: false,
            totalIrrigacoesHoje: 0,
            totalIrrigacoesSemana: 0,
            totalIrrigacoesMes: 0,
            alertas: []
          });
          await status.save();
        }

        return status;
      } catch (error) {
        throw new Error(`Erro ao buscar status do setor: ${error.message}`);
      }
    },

    // Status geral de irrigação de todos os setores
    statusIrrigacaoGeral: async () => {
      try {
        const status = await StatusIrrigacao.find({})
          .sort({ emIrrigacao: -1, updatedAt: -1 });

        return status;
      } catch (error) {
        throw new Error(`Erro ao buscar status geral: ${error.message}`);
      }
    }
  },

  // Field resolvers
  HistoricoIrrigacao: {
    id: (parent) => parent._id.toString(),

    // Calcular eficiência da irrigação
    eficiencia: (parent) => {
      return parent.calcularEficiencia();
    }
  },

  StatusIrrigacao: {
    id: (parent) => parent._id.toString()
  }
};

module.exports = historicoResolvers;
