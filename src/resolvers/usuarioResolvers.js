
const { Usuario, Propriedade, Dispositivo, Setor } = require('../models');

const usuarioResolvers = {
  Query: {
    // Buscar usuário por ID
    usuario: async (_, { id }) => {
      try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }
        return usuario;
      } catch (error) {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }
    },

    // Listar usuários com paginação
    usuarios: async (_, { pagina = 0, limite = 10 }) => {
      try {
        const skip = pagina * limite;
        
        const [usuarios, total] = await Promise.all([
          Usuario.find().skip(skip).limit(limite).sort({ createdAt: -1 }),
          Usuario.countDocuments()
        ]);

        return {
          usuarios,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite),
        };
      } catch (error) {
        throw new Error(`Erro ao listar usuários: ${error.message}`);
      }
    },

    // Buscar usuário por email
    usuarioPorEmail: async (_, { email }) => {
      try {
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }
        return usuario;
      } catch (error) {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Criar novo usuário
    criarUsuario: async (_, { input }) => {
      try {
        const usuarioExistente = await Usuario.findOne({ 
          email: input.email.toLowerCase() 
        });
        
        if (usuarioExistente) {
          throw new Error('Email já cadastrado');
        }

        const usuario = new Usuario(input);
        await usuario.save();
        return usuario;
      } catch (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }
    },

    // Atualizar usuário
    atualizarUsuario: async (_, { id, input }) => {
      try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }

        // Se está atualizando email, verifica duplicação
        if (input.email && input.email !== usuario.email) {
          const emailExiste = await Usuario.findOne({ 
            email: input.email.toLowerCase(),
            _id: { $ne: id }
          });
          
          if (emailExiste) {
            throw new Error('Email já cadastrado por outro usuário');
          }
        }

        Object.assign(usuario, input);
        await usuario.save();
        return usuario;
      } catch (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }
    },

    // Deletar usuário
    deletarUsuario: async (_, { id }) => {
      try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }

        // Buscar todas as propriedades do usuário
        const propriedades = await Propriedade.find({ usuarioId: id });
        
        // Deletar dispositivos e setores das propriedades
        for (const propriedade of propriedades) {
          const dispositivos = await Dispositivo.find({ 
            propriedadeId: propriedade._id 
          });
          
          for (const dispositivo of dispositivos) {
            await Setor.deleteMany({ dispositivoId: dispositivo._id });
          }
          
          await Dispositivo.deleteMany({ propriedadeId: propriedade._id });
        }

        // Deletar propriedades
        await Propriedade.deleteMany({ usuarioId: id });
        
        // Deletar usuário
        await Usuario.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        throw new Error(`Erro ao deletar usuário: ${error.message}`);
      }
    },
  },

  // Resolvers de campo para relacionamentos
  Usuario: {
    id: (parent) => parent._id,
    propriedades: async (parent) => {
      return await Propriedade.find({ usuarioId: parent._id });
    },
  },
};

module.exports = usuarioResolvers;
