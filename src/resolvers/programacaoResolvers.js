const ProgramacaoIrrigacao = require('../models/ProgramacaoIrrigacao');
const StatusIrrigacao = require('../models/StatusIrrigacao');
const apiExterna = require('../services/apiExterna');
const logProducer = require('../messageService/Producer');

const programacaoResolvers = {
  Query: {
    // Buscar programação por ID
    programacao: async (_, { id }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(id);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }
        return programacao;
      } catch (error) {
        throw new Error(`Erro ao buscar programação: ${error.message}`);
      }
    },

    // Listar programações com filtros e paginação
    programacoes: async (_, { filtros = {}, pagina = 0, limite = 10 }) => {
      try {
        const query = {};

        if (filtros.setorId) query.setorId = filtros.setorId;
        if (filtros.ativa !== undefined) query.ativa = filtros.ativa;
        if (filtros.tipoRecorrencia) query.tipoRecorrencia = filtros.tipoRecorrencia;

        const skip = pagina * limite;

        const [programacoes, total] = await Promise.all([
          ProgramacaoIrrigacao.find(query)
            .skip(skip)
            .limit(limite)
            .sort({ createdAt: -1 }),
          ProgramacaoIrrigacao.countDocuments(query)
        ]);

        return {
          programacoes,
          total,
          pagina,
          totalPaginas: Math.ceil(total / limite)
        };
      } catch (error) {
        throw new Error(`Erro ao listar programações: ${error.message}`);
      }
    },

    // Buscar programações de um setor específico
    programacoesPorSetor: async (_, { setorId }) => {
      try {
        // Validar se o setor existe na API externa
        // await apiExterna.validarSetor(setorId); // DESABILITADO PARA TESTES

        const programacoes = await ProgramacaoIrrigacao.find({ setorId })
          .sort({ prioridade: -1, horarioInicio: 1 });

        return programacoes;
      } catch (error) {
        throw new Error(`Erro ao buscar programações do setor: ${error.message}`);
      }
    },

    // Listar apenas programações ativas
    programacoesAtivas: async () => {
      try {
        const agora = new Date();

        const programacoes = await ProgramacaoIrrigacao.find({
          ativa: true,
          $or: [
            { dataValidade: null },
            { dataValidade: { $gte: agora } }
          ]
        }).sort({ prioridade: -1 });

        return programacoes;
      } catch (error) {
        throw new Error(`Erro ao buscar programações ativas: ${error.message}`);
      }
    },

    // Calcular próximas irrigações programadas
    proximasIrrigacoes: async (_, { limite = 10 }) => {
      try {
        const agora = new Date();
        const proximas = [];

        // Buscar programações ativas
        const programacoes = await ProgramacaoIrrigacao.find({
          ativa: true,
          $or: [
            { dataValidade: null },
            { dataValidade: { $gte: agora } }
          ]
        });

        for (const prog of programacoes) {
          let proximaData = null;

          if (prog.tipoRecorrencia === 'UNICA' && prog.dataHoraInicio) {
            if (prog.dataHoraInicio > agora) {
              proximaData = prog.dataHoraInicio;
            }
          } else if (prog.horarioInicio) {
            // Calcular próxima execução baseada no horário
            const [hora, minuto] = prog.horarioInicio.split(':').map(Number);
            const dataBase = new Date(agora);
            dataBase.setHours(hora, minuto, 0, 0);

            if (dataBase <= agora) {
              dataBase.setDate(dataBase.getDate() + 1);
            }

            if (prog.tipoRecorrencia === 'SEMANAL' && prog.diasSemana?.length > 0) {
              // Encontrar próximo dia da semana válido
              let diasProcurados = 0;
              while (diasProcurados < 7) {
                if (prog.diasSemana.includes(dataBase.getDay())) {
                  proximaData = new Date(dataBase);
                  break;
                }
                dataBase.setDate(dataBase.getDate() + 1);
                diasProcurados++;
              }
            } else {
              proximaData = dataBase;
            }
          }

          if (proximaData) {
            proximas.push({
              setorId: prog.setorId,
              programacaoId: prog._id.toString(),
              dataHora: proximaData,
              duracao: prog.duracao
            });
          }
        }

        // Ordenar por data e limitar
        proximas.sort((a, b) => a.dataHora - b.dataHora);
        return proximas.slice(0, limite);
      } catch (error) {
        throw new Error(`Erro ao calcular próximas irrigações: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Criar nova programação
    criarProgramacao: async (_, { input }) => {
      try {
        // Validar setor na API externa
        // await apiExterna.validarSetor(input.setorId); // DESABILITADO PARA TESTES

        // Validações de negócio
        if (input.tipoRecorrencia === 'UNICA' && !input.dataHoraInicio) {
          throw new Error('Programação única requer dataHoraInicio');
        }

        if ((input.tipoRecorrencia === 'DIARIA' || input.tipoRecorrencia === 'SEMANAL') && !input.horarioInicio) {
          throw new Error('Programação recorrente requer horarioInicio');
        }

        if (input.tipoRecorrencia === 'SEMANAL' && (!input.diasSemana || input.diasSemana.length === 0)) {
          throw new Error('Programação semanal requer diasSemana');
        }

        const programacao = new ProgramacaoIrrigacao(input);
        await programacao.save();

        // Atualizar status do setor
        await atualizarProximaIrrigacao(input.setorId);

        return programacao;
      } catch (error) {
        // ENVIAR LOG CRÍTICO APENAS EM CASO DE ERRO
        await logProducer.sendLog(
          `ERRO CRITICO: Falha ao criar programacao - ${error.message} | Setor: ${input.setorId} | Tipo: ${input.tipoRecorrencia}`,
          input.usuarioId || 'system'
        );
        throw new Error(`Erro ao criar programação: ${error.message}`);
      }
    },

    // Atualizar programação existente
    atualizarProgramacao: async (_, { id, input }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(id);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }

        Object.assign(programacao, input);
        await programacao.save();

        // Atualizar próxima irrigação se a programação foi alterada
        await atualizarProximaIrrigacao(programacao.setorId);

        return programacao;
      } catch (error) {
        throw new Error(`Erro ao atualizar programação: ${error.message}`);
      }
    },

    // Deletar programação
    deletarProgramacao: async (_, { id }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(id);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }

        const setorId = programacao.setorId;
        await ProgramacaoIrrigacao.findByIdAndDelete(id);

        // Atualizar próxima irrigação do setor
        await atualizarProximaIrrigacao(setorId);

        return true;
      } catch (error) {
        throw new Error(`Erro ao deletar programação: ${error.message}`);
      }
    },

    // Ativar programação
    ativarProgramacao: async (_, { id }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(id);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }

        programacao.ativa = true;
        await programacao.save();

        await atualizarProximaIrrigacao(programacao.setorId);

        return programacao;
      } catch (error) {
        throw new Error(`Erro ao ativar programação: ${error.message}`);
      }
    },

    // Desativar programação
    desativarProgramacao: async (_, { id }) => {
      try {
        const programacao = await ProgramacaoIrrigacao.findById(id);
        if (!programacao) {
          throw new Error('Programação não encontrada');
        }

        programacao.ativa = false;
        await programacao.save();

        await atualizarProximaIrrigacao(programacao.setorId);

        return programacao;
      } catch (error) {
        throw new Error(`Erro ao desativar programação: ${error.message}`);
      }
    }
  },

  // Field resolvers
  ProgramacaoIrrigacao: {
    id: (parent) => parent._id.toString()
  }
};

// Função auxiliar para atualizar próxima irrigação do setor
async function atualizarProximaIrrigacao(setorId) {
  try {
    const agora = new Date();
    let proximaIrrigacao = null;
    let proximaProgramacaoId = null;

    // Buscar programações ativas do setor
    const programacoes = await ProgramacaoIrrigacao.find({
      setorId,
      ativa: true,
      $or: [
        { dataValidade: null },
        { dataValidade: { $gte: agora } }
      ]
    });

    // Calcular próxima execução
    for (const prog of programacoes) {
      let dataExecucao = null;

      if (prog.tipoRecorrencia === 'UNICA' && prog.dataHoraInicio && prog.dataHoraInicio > agora) {
        dataExecucao = prog.dataHoraInicio;
      } else if (prog.horarioInicio) {
        const [hora, minuto] = prog.horarioInicio.split(':').map(Number);
        const dataBase = new Date(agora);
        dataBase.setHours(hora, minuto, 0, 0);

        if (dataBase <= agora) {
          dataBase.setDate(dataBase.getDate() + 1);
        }

        dataExecucao = dataBase;
      }

      if (dataExecucao && (!proximaIrrigacao || dataExecucao < proximaIrrigacao)) {
        proximaIrrigacao = dataExecucao;
        proximaProgramacaoId = prog._id;
      }
    }

    // Atualizar ou criar status do setor
    await StatusIrrigacao.findOneAndUpdate(
      { setorId },
      {
        proximaIrrigacao,
        proximaProgramacaoId
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Erro ao atualizar próxima irrigação:', error);
  }
}

module.exports = programacaoResolvers;
