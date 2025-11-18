const HistoricoIrrigacao = require('../models/HistoricoIrrigacao');
const StatusIrrigacao = require('../models/StatusIrrigacao');
const ProgramacaoIrrigacao = require('../models/ProgramacaoIrrigacao');
const Alerta = require('../models/Alerta');
const apiExterna = require('../services/apiExterna');

const controleResolvers = {
  Mutation: {
    // Iniciar irrigação manual
    iniciarIrrigacaoManual: async (_, { input }) => {
      try {
        const { setorId, duracao, volumeAgua, usuarioId, observacoes } = input;

        // Validar setor
        const setor = await apiExterna.validarSetor(setorId);

        // Verificar se já está em irrigação
        const status = await StatusIrrigacao.findOne({ setorId });
        if (status?.emIrrigacao) {
          throw new Error('Setor já está em irrigação');
        }

        // Validar dispositivo
        if (setor.dispositivoId) {
          await apiExterna.validarDispositivo(setor.dispositivoId);
        }

        // Criar registro de histórico
        const historico = new HistoricoIrrigacao({
          setorId,
          dataHoraInicio: new Date(),
          duracaoPlanejada: duracao,
          volumeAguaPlanejado: volumeAgua,
          tipoIrrigacao: 'MANUAL',
          status: 'EM_ANDAMENTO',
          usuarioId,
          dispositivoId: setor.dispositivoId,
          observacoes
        });
        await historico.save();

        // Atualizar status do setor
        await StatusIrrigacao.findOneAndUpdate(
          { setorId },
          {
            emIrrigacao: true,
            historicoAtualId: historico._id,
            ultimoComando: {
              tipo: 'INICIAR',
              dataHora: new Date(),
              usuarioId
            },
            $inc: {
              totalIrrigacoesHoje: 1,
              totalIrrigacoesSemana: 1,
              totalIrrigacoesMes: 1
            }
          },
          { upsert: true }
        );

        // Enviar comando para o dispositivo via API externa
        if (setor.dispositivoId) {
          try {
            await apiExterna.enviarComandoDispositivo(setor.dispositivoId, 'INICIAR_IRRIGACAO', {
              setorId,
              duracao,
              volumeAgua
            });
          } catch (error) {
            console.error('Erro ao enviar comando para dispositivo:', error);
            // Criar alerta de falha
            await new Alerta({
              tipo: 'DISPOSITIVO_OFFLINE',
              severidade: 'ALTA',
              titulo: 'Falha ao comunicar com dispositivo',
              descricao: `Não foi possível enviar comando para o dispositivo ${setor.dispositivoId}`,
              setorId,
              dispositivoId: setor.dispositivoId,
              status: 'ATIVO'
            }).save();
          }
        }

        return historico;
      } catch (error) {
        throw new Error(`Erro ao iniciar irrigação manual: ${error.message}`);
      }
    },

    // Parar irrigação
    pararIrrigacao: async (_, { input }) => {
      try {
        const { setorId, usuarioId, motivo } = input;

        // Validar setor
        const setor = await apiExterna.validarSetor(setorId);

        // Buscar status atual
        const status = await StatusIrrigacao.findOne({ setorId });
        if (!status?.emIrrigacao || !status.historicoAtualId) {
          throw new Error('Setor não está em irrigação');
        }

        // Buscar histórico atual
        const historico = await HistoricoIrrigacao.findById(status.historicoAtualId);
        if (!historico) {
          throw new Error('Histórico de irrigação não encontrado');
        }

        // Atualizar histórico
        const dataHoraFim = new Date();
        const duracaoReal = Math.floor((dataHoraFim - historico.dataHoraInicio) / 60000); // minutos

        historico.dataHoraFim = dataHoraFim;
        historico.duracaoReal = duracaoReal;
        historico.status = motivo ? 'CANCELADA' : 'CONCLUIDA';
        historico.motivoCancelamento = motivo;
        await historico.save();

        // Atualizar status do setor
        await StatusIrrigacao.findOneAndUpdate(
          { setorId },
          {
            emIrrigacao: false,
            historicoAtualId: null,
            ultimaIrrigacao: dataHoraFim,
            ultimoComando: {
              tipo: 'PARAR',
              dataHora: new Date(),
              usuarioId
            }
          }
        );

        // Enviar comando para parar dispositivo
        if (setor.dispositivoId) {
          try {
            await apiExterna.enviarComandoDispositivo(setor.dispositivoId, 'PARAR_IRRIGACAO', {
              setorId
            });
          } catch (error) {
            console.error('Erro ao enviar comando para dispositivo:', error);
          }
        }

        // Verificar se houve problema (duração muito diferente do planejado)
        if (historico.status === 'CONCLUIDA' && duracaoReal < historico.duracaoPlanejada * 0.8) {
          await new Alerta({
            tipo: 'FALHA_IRRIGACAO',
            severidade: 'MEDIA',
            titulo: 'Irrigação interrompida prematuramente',
            descricao: `Irrigação parou aos ${duracaoReal} minutos (planejado: ${historico.duracaoPlanejada} minutos)`,
            setorId,
            historicoId: historico._id,
            status: 'ATIVO'
          }).save();
        }

        return historico;
      } catch (error) {
        throw new Error(`Erro ao parar irrigação: ${error.message}`);
      }
    },

    // Executar programação específica
    executarProgramacao: async (_, { programacaoId }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(programacaoId);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }

        if (!programacao.isValida()) {
          throw new Error('Programação inválida ou expirada');
        }

        // Validar setor
        const setor = await apiExterna.validarSetor(programacao.setorId);

        // Verificar se já está em irrigação
        const status = await StatusIrrigacao.findOne({ setorId: programacao.setorId });
        if (status?.emIrrigacao) {
          throw new Error('Setor já está em irrigação');
        }

        // Criar registro de histórico
        const historico = new HistoricoIrrigacao({
          setorId: programacao.setorId,
          programacaoId: programacao._id,
          dataHoraInicio: new Date(),
          duracaoPlanejada: programacao.duracao,
          volumeAguaPlanejado: programacao.volumeAgua,
          tipoIrrigacao: 'PROGRAMADA',
          status: 'EM_ANDAMENTO',
          dispositivoId: setor.dispositivoId
        });
        await historico.save();

        // Atualizar status do setor
        await StatusIrrigacao.findOneAndUpdate(
          { setorId: programacao.setorId },
          {
            emIrrigacao: true,
            historicoAtualId: historico._id,
            ultimoComando: {
              tipo: 'INICIAR',
              dataHora: new Date()
            },
            $inc: {
              totalIrrigacoesHoje: 1,
              totalIrrigacoesSemana: 1,
              totalIrrigacoesMes: 1
            }
          },
          { upsert: true }
        );

        // Enviar comando para dispositivo
        if (setor.dispositivoId) {
          try {
            await apiExterna.enviarComandoDispositivo(setor.dispositivoId, 'INICIAR_IRRIGACAO', {
              setorId: programacao.setorId,
              duracao: programacao.duracao,
              volumeAgua: programacao.volumeAgua
            });
          } catch (error) {
            console.error('Erro ao enviar comando para dispositivo:', error);

            // Marcar como falha
            historico.status = 'FALHA';
            historico.motivoFalha = 'Falha ao comunicar com dispositivo';
            await historico.save();

            // Criar alerta
            await new Alerta({
              tipo: 'FALHA_IRRIGACAO',
              severidade: 'CRITICA',
              titulo: 'Falha ao executar irrigação programada',
              descricao: `Erro ao comunicar com dispositivo ${setor.dispositivoId}`,
              setorId: programacao.setorId,
              dispositivoId: setor.dispositivoId,
              programacaoId: programacao._id,
              historicoId: historico._id,
              status: 'ATIVO'
            }).save();

            // Atualizar status
            await StatusIrrigacao.findOneAndUpdate(
              { setorId: programacao.setorId },
              {
                emIrrigacao: false,
                historicoAtualId: null
              }
            );

            throw new Error('Falha ao comunicar com dispositivo');
          }
        }

        // Se for programação única, desativar após execução
        if (programacao.tipoRecorrencia === 'UNICA') {
          programacao.ativa = false;
          await programacao.save();
        }

        return historico;
      } catch (error) {
        throw new Error(`Erro ao executar programação: ${error.message}`);
      }
    }
  }
};

module.exports = controleResolvers;
