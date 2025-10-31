
const { Setor, Dispositivo } = require('../models');

const setorResolvers = {
  Query: {
    // Buscar setor por ID
    setor: async (_, { id }) => {
      try {
        const setor = await Setor.findById(id);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }
        return setor;
      } catch (error) {
        throw new Error(`Erro ao buscar setor: ${error.message}`);
      }
    },

    // Listar setores com filtros
    setores: async (_, { filtros = {}, pagina = 0, limite = 10 }) => {
      try {
        const skip = pagina * limite;
        const query = {};

        if (filtros.dispositivoId) query.dispositivoId = filtros.dispositivoId;
        if (filtros.status) query.status = filtros.status;
        if (filtros.tipoCultura) query.tipoCultura = filtros.tipoCultura;

        const [setores, total] = await Promise.all([
          Setor.find(query).skip(skip).limit(limite).sort({ createdAt: -1 }),
          Setor.countDocuments(query)
        ]);

        return {
          setores,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite),
        };
      } catch (error) {
        throw new Error(`Erro ao listar setores: ${error.message}`);
      }
    },

    // Setores que devem irrigar agora
    setoresParaIrrigar: async (_, { dispositivoId }) => {
      try {
        const query = { status: 'AGUARDANDO' };
        if (dispositivoId) query.dispositivoId = dispositivoId;

        const setores = await Setor.find(query);
        
        // Filtrar setores que devem irrigar agora
        return setores.filter(setor => setor.deveIrrigarAgora());
      } catch (error) {
        throw new Error(`Erro ao buscar setores para irrigar: ${error.message}`);
      }
    },
  },

  Mutation: {
    criarSetor: async (_, { input }) => {
      try {
        const dispositivo = await Dispositivo.findById(input.dispositivoId);
        if (!dispositivo) {
          throw new Error('Dispositivo não encontrado');
        }

        const setor = new Setor(input);
        await setor.save();
        return setor;
      } catch (error) {
        throw new Error(`Erro ao criar setor: ${error.message}`);
      }
    },

    atualizarSetor: async (_, { id, input }) => {
      try {
        const setor = await Setor.findById(id);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }

        Object.assign(setor, input);
        await setor.save();
        return setor;
      } catch (error) {
        throw new Error(`Erro ao atualizar setor: ${error.message}`);
      }
    },

    deletarSetor: async (_, { id }) => {
      try {
        const setor = await Setor.findById(id);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }

        await Setor.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(`Erro ao deletar setor: ${error.message}`);
      }
    },

    iniciarIrrigacao: async (_, { setorId }) => {
      try {
        const setor = await Setor.findById(setorId);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }

        setor.status = 'ATIVO';
        setor.ultimaIrrigacao = new Date();
        setor.foiIrrigadoNaHora = setor.deveIrrigarAgora();
        
        await setor.save();
        return setor;
      } catch (error) {
        throw new Error(`Erro ao iniciar irrigação: ${error.message}`);
      }
    },

    pararIrrigacao: async (_, { setorId }) => {
      try {
        const setor = await Setor.findById(setorId);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }

        setor.status = 'AGUARDANDO';
        await setor.save();
        return setor;
      } catch (error) {
        throw new Error(`Erro ao parar irrigação: ${error.message}`);
      }
    },

    programarIrrigacao: async (_, { setorId, horario }) => {
      try {
        const setor = await Setor.findById(setorId);
        if (!setor) {
          throw new Error('Setor não encontrado');
        }

        setor.horarioIrrigacao = new Date(horario);
        setor.status = 'AGUARDANDO';
        
        await setor.save();
        return setor;
      } catch (error) {
        throw new Error(`Erro ao programar irrigação: ${error.message}`);
      }
    },
  },

  Setor: {
    id: (parent) => parent._id,
    dispositivo: async (parent) => {
      return await Dispositivo.findById(parent.dispositivoId);
    },
  },
};

module.exports = setorResolvers;
