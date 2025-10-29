
const { Propriedade, Usuario, Dispositivo, Setor } = require('../models');

const propriedadeResolvers = {
  Query: {
    // Buscar propriedade por ID
    propriedade: async (_, { id }) => {
      try {
        const propriedade = await Propriedade.findById(id);
        if (!propriedade) {
          throw new Error('Propriedade não encontrada');
        }
        return propriedade;
      } catch (error) {
        throw new Error(`Erro ao buscar propriedade: ${error.message}`);
      }
    },

    // Listar propriedades com filtros
    propriedades: async (_, { usuarioId, pagina = 0, limite = 10 }) => {
      try {
        const skip = pagina * limite;
        const filtro = usuarioId ? { usuarioId } : {};

        const [propriedades, total] = await Promise.all([
          Propriedade.find(filtro).skip(skip).limit(limite).sort({ createdAt: -1 }),
          Propriedade.countDocuments(filtro)
        ]);

        return {
          propriedades,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite),
        };
      } catch (error) {
        throw new Error(`Erro ao listar propriedades: ${error.message}`);
      }
    },

    // Estatísticas de propriedade
    estatisticasPropriedade: async (_, { propriedadeId }) => {
      try {
        const propriedade = await Propriedade.findById(propriedadeId);
        if (!propriedade) {
          throw new Error('Propriedade não encontrada');
        }

        const dispositivos = await Dispositivo.find({ 
          propriedadeId 
        });

        let totalSetores = 0;
        let areaTotal = 0;
        const setoresPorStatus = {};
        const dispositivosPorStatus = {};

        // Contar dispositivos por status
        dispositivos.forEach(d => {
          dispositivosPorStatus[d.status] = (dispositivosPorStatus[d.status] || 0) + 1;
        });

        // Buscar setores e calcular estatísticas
        for (const dispositivo of dispositivos) {
          const setores = await Setor.find({ dispositivoId: dispositivo._id });
          totalSetores += setores.length;

          setores.forEach(s => {
            areaTotal += s.area;
            setoresPorStatus[s.status] = (setoresPorStatus[s.status] || 0) + 1;
          });
        }

        return {
          propriedade,
          totalDispositivos: dispositivos.length,
          totalSetores,
          areaTotal,
          setoresPorStatus: Object.entries(setoresPorStatus).map(([status, count]) => ({
            status,
            count
          })),
          dispositivosPorStatus: Object.entries(dispositivosPorStatus).map(([status, count]) => ({
            status,
            count
          })),
        };
      } catch (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Criar propriedade
    criarPropriedade: async (_, { input }) => {
      try {
        // Verificar se usuário existe
        const usuario = await Usuario.findById(input.usuarioId);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }

        const propriedade = new Propriedade(input);
        await propriedade.save();
        return propriedade;
      } catch (error) {
        throw new Error(`Erro ao criar propriedade: ${error.message}`);
      }
    },

    // Atualizar propriedade
    atualizarPropriedade: async (_, { id, input }) => {
      try {
        const propriedade = await Propriedade.findById(id);
        if (!propriedade) {
          throw new Error('Propriedade não encontrada');
        }

        Object.assign(propriedade, input);
        await propriedade.save();
        return propriedade;
      } catch (error) {
        throw new Error(`Erro ao atualizar propriedade: ${error.message}`);
      }
    },

    // Deletar propriedade
    deletarPropriedade: async (_, { id }) => {
      try {
        const propriedade = await Propriedade.findById(id);
        if (!propriedade) {
          throw new Error('Propriedade não encontrada');
        }

        // Deletar dispositivos e setores associados
        const dispositivos = await Dispositivo.find({ propriedadeId: id });
        
        for (const dispositivo of dispositivos) {
          await Setor.deleteMany({ dispositivoId: dispositivo._id });
        }
        
        await Dispositivo.deleteMany({ propriedadeId: id });
        await Propriedade.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        throw new Error(`Erro ao deletar propriedade: ${error.message}`);
      }
    },
  },

  // Resolvers de campo
  Propriedade: {
    id: (parent) => parent._id,
    usuario: async (parent) => {
      return await Usuario.findById(parent.usuarioId);
    },
    dispositivos: async (parent) => {
      return await Dispositivo.find({ propriedadeId: parent._id });
    },
  },
};

module.exports = propriedadeResolvers;
