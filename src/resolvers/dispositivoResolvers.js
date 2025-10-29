
const { Dispositivo, Propriedade, Setor } = require('../models');

const dispositivoResolvers = {
  Query: {
    // Buscar dispositivo por ID
    dispositivo: async (_, { id }) => {
      try {
        const dispositivo = await Dispositivo.findById(id);
        if (!dispositivo) {
          throw new Error('Dispositivo não encontrado');
        }
        return dispositivo;
      } catch (error) {
        throw new Error(`Erro ao buscar dispositivo: ${error.message}`);
      }
    },

    // Listar dispositivos com filtros
    dispositivos: async (_, { filtros = {}, pagina = 0, limite = 10 }) => {
      try {
        const skip = pagina * limite;
        const query = {};

        if (filtros.propriedadeId) query.propriedadeId = filtros.propriedadeId;
        if (filtros.status) query.status = filtros.status;
        if (filtros.tipo) query.tipo = filtros.tipo;

        const [dispositivos, total] = await Promise.all([
          Dispositivo.find(query).skip(skip).limit(limite).sort({ createdAt: -1 }),
          Dispositivo.countDocuments(query)
        ]);

        return {
          dispositivos,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite),
        };
      } catch (error) {
        throw new Error(`Erro ao listar dispositivos: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Criar dispositivo
    criarDispositivo: async (_, { input }) => {
      try {
        // Verificar se propriedade existe
        const propriedade = await Propriedade.findById(input.propriedadeId);
        if (!propriedade) {
          throw new Error('Propriedade não encontrada');
        }

        const dispositivo = new Dispositivo(input);
        await dispositivo.save();
        return dispositivo;
      } catch (error) {
        throw new Error(`Erro ao criar dispositivo: ${error.message}`);
      }
    },

    // Atualizar dispositivo
    atualizarDispositivo: async (_, { id, input }) => {
      try {
        const dispositivo = await Dispositivo.findById(id);
        if (!dispositivo) {
          throw new Error('Dispositivo não encontrado');
        }

        Object.assign(dispositivo, input);
        await dispositivo.save();
        return dispositivo;
      } catch (error) {
        throw new Error(`Erro ao atualizar dispositivo: ${error.message}`);
      }
    },

    // Deletar dispositivo
    deletarDispositivo: async (_, { id }) => {
      try {
        const dispositivo = await Dispositivo.findById(id);
        if (!dispositivo) {
          throw new Error('Dispositivo não encontrado');
        }

        // Deletar setores associados
        await Setor.deleteMany({ dispositivoId: id });
        await Dispositivo.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        throw new Error(`Erro ao deletar dispositivo: ${error.message}`);
      }
    },

    // Alterar status do dispositivo
    alterarStatusDispositivo: async (_, { id, status }) => {
      try {
        const dispositivo = await Dispositivo.findById(id);
        if (!dispositivo) {
          throw new Error('Dispositivo não encontrado');
        }

        dispositivo.status = status;
        await dispositivo.save();
        
        return dispositivo;
      } catch (error) {
        throw new Error(`Erro ao alterar status: ${error.message}`);
      }
    },
  },

  // Resolvers de campo
  Dispositivo: {
    id: (parent) => parent._id,
    propriedade: async (parent) => {
      return await Propriedade.findById(parent.propriedadeId);
    },
    setores: async (parent) => {
      return await Setor.find({ dispositivoId: parent._id });
    },
  },
};

module.exports = dispositivoResolvers;
