const Alerta = require('../models/Alerta');
const StatusIrrigacao = require('../models/StatusIrrigacao');

const alertaResolvers = {
  Query: {
    // Buscar alerta por ID
    alerta: async (_, { id }) => {
      try {
        const alerta = await Alerta.findById(id);
        if (!alerta) {
          throw new Error('Alerta não encontrado');
        }
        return alerta;
      } catch (error) {
        throw new Error(`Erro ao buscar alerta: ${error.message}`);
      }
    },

    // Listar alertas com filtros e paginação
    alertas: async (_, { filtros = {}, pagina = 0, limite = 10 }) => {
      try {
        const query = {};

        if (filtros.setorId) query.setorId = filtros.setorId;
        if (filtros.dispositivoId) query.dispositivoId = filtros.dispositivoId;
        if (filtros.propriedadeId) query.propriedadeId = filtros.propriedadeId;
        if (filtros.tipo) query.tipo = filtros.tipo;
        if (filtros.severidade) query.severidade = filtros.severidade;
        if (filtros.status) query.status = filtros.status;
        if (filtros.lido !== undefined) query.lido = filtros.lido;

        const skip = pagina * limite;

        const [alertas, total] = await Promise.all([
          Alerta.find(query)
            .skip(skip)
            .limit(limite)
            .sort({ severidade: 1, createdAt: -1 }), // CRITICA primeiro
          Alerta.countDocuments(query)
        ]);

        return {
          alertas,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite)
        };
      } catch (error) {
        throw new Error(`Erro ao listar alertas: ${error.message}`);
      }
    },

    // Listar apenas alertas ativos
    alertasAtivos: async (_, { limite = 20 }) => {
      try {
        const alertas = await Alerta.find({
          status: 'ATIVO'
        })
          .sort({ severidade: 1, createdAt: -1 })
          .limit(limite);

        return alertas;
      } catch (error) {
        throw new Error(`Erro ao buscar alertas ativos: ${error.message}`);
      }
    },

    // Alertas de um setor específico
    alertasPorSetor: async (_, { setorId }) => {
      try {
        const alertas = await Alerta.find({
          setorId,
          status: 'ATIVO'
        }).sort({ severidade: 1, createdAt: -1 });

        return alertas;
      } catch (error) {
        throw new Error(`Erro ao buscar alertas do setor: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Resolver alerta
    resolverAlerta: async (_, { id, usuarioId, observacoes }) => {
      try {
        const alerta = await Alerta.findById(id);
        if (!alerta) {
          throw new Error('Alerta não encontrado');
        }

        await alerta.resolver(usuarioId, observacoes);
        return alerta;
      } catch (error) {
        throw new Error(`Erro ao resolver alerta: ${error.message}`);
      }
    },

    // Ignorar alerta
    ignorarAlerta: async (_, { id, usuarioId, observacoes }) => {
      try {
        const alerta = await Alerta.findById(id);
        if (!alerta) {
          throw new Error('Alerta não encontrado');
        }

        await alerta.ignorar(usuarioId, observacoes);
        return alerta;
      } catch (error) {
        throw new Error(`Erro ao ignorar alerta: ${error.message}`);
      }
    },

    // Marcar alerta como lido
    marcarAlertaComoLido: async (_, { id }) => {
      try {
        const alerta = await Alerta.findById(id);
        if (!alerta) {
          throw new Error('Alerta não encontrado');
        }

        alerta.lido = true;
        await alerta.save();
        return alerta;
      } catch (error) {
        throw new Error(`Erro ao marcar alerta como lido: ${error.message}`);
      }
    },

    // Marcar todos alertas como lidos
    marcarTodosAlertasComoLidos: async (_, { setorId }) => {
      try {
        const query = { lido: false };
        if (setorId) {
          query.setorId = setorId;
        }

        await Alerta.updateMany(query, { lido: true });

        // Também marcar alertas no status do setor
        if (setorId) {
          const status = await StatusIrrigacao.findOne({ setorId });
          if (status) {
            await status.marcarAlertasComoLidos();
          }
        }

        return true;
      } catch (error) {
        throw new Error(`Erro ao marcar alertas como lidos: ${error.message}`);
      }
    }
  },

  // Field resolvers
  Alerta: {
    id: (parent) => parent._id.toString()
  }
};

module.exports = alertaResolvers;
