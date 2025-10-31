
const { Usuario, Propriedade, Dispositivo, Setor } = require('../models');

const dashboardResolvers = {
  Query: {
    dashboardUsuario: async (_, { usuarioId }) => {
      try {
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }

        const propriedades = await Propriedade.find({ usuarioId });
        const propriedadeIds = propriedades.map(p => p._id);

        const dispositivos = await Dispositivo.find({ 
          propriedadeId: { $in: propriedadeIds } 
        });
        const dispositivoIds = dispositivos.map(d => d._id);

        const setores = await Setor.find({ 
          dispositivoId: { $in: dispositivoIds } 
        });

        const setoresAtivos = setores.filter(s => s.status === 'ATIVO').length;
        const dispositivosAtivos = dispositivos.filter(d => d.status === 'ATIVO').length;

        return {
          usuario,
          totalPropriedades: propriedades.length,
          totalDispositivos: dispositivos.length,
          totalSetores: setores.length,
          setoresAtivos,
          dispositivosAtivos,
        };
      } catch (error) {
        throw new Error(`Erro ao buscar dashboard: ${error.message}`);
      }
    },
  },
};

module.exports = dashboardResolvers;
