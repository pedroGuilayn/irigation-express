const axios = require('axios');

// URL base da API Spring Boot (configurável via variável de ambiente)
const API_BASE_URL = process.env.API_EXTERNA_URL || 'http://localhost:8080/api';

/**
 * Serviço para integração com a API externa em Spring Boot
 * Responsável por buscar dados de Usuários, Propriedades, Dispositivos e Setores
 */
class ApiExternaService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('Erro na API Externa:', error.message);
        if (error.response) {
          throw new Error(`API Externa retornou erro: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('API Externa não está respondendo');
        } else {
          throw new Error(`Erro ao comunicar com API Externa: ${error.message}`);
        }
      }
    );
  }

  // ==================== USUÁRIOS ====================

  async buscarUsuario(id) {
    try {
      const response = await this.client.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  async listarUsuarios(pagina = 0, limite = 10) {
    try {
      const response = await this.client.get('/usuarios', {
        params: { pagina, limite }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }
  }

  async buscarUsuarioPorEmail(email) {
    try {
      const response = await this.client.get(`/usuarios/email/${email}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }

  // ==================== PROPRIEDADES ====================

  async buscarPropriedade(id) {
    try {
      const response = await this.client.get(`/propriedades/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar propriedade: ${error.message}`);
    }
  }

  async listarPropriedades(usuarioId = null, pagina = 0, limite = 10) {
    try {
      const params = { pagina, limite };
      if (usuarioId) params.usuarioId = usuarioId;

      const response = await this.client.get('/propriedades', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar propriedades: ${error.message}`);
    }
  }

  // ==================== DISPOSITIVOS ====================

  async buscarDispositivo(id) {
    try {
      const response = await this.client.get(`/dispositivos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar dispositivo: ${error.message}`);
    }
  }

  async listarDispositivos(filtros = {}, pagina = 0, limite = 10) {
    try {
      const params = { pagina, limite, ...filtros };
      const response = await this.client.get('/dispositivos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar dispositivos: ${error.message}`);
    }
  }

  async enviarComandoDispositivo(dispositivoId, comando, parametros = {}) {
    try {
      const response = await this.client.post(`/dispositivos/${dispositivoId}/comandos`, {
        comando,
        parametros
      });
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao enviar comando para dispositivo: ${error.message}`);
    }
  }

  async buscarStatusDispositivo(dispositivoId) {
    try {
      const response = await this.client.get(`/dispositivos/${dispositivoId}/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar status do dispositivo: ${error.message}`);
    }
  }

  // ==================== SETORES ====================

  async buscarSetor(id) {
    try {
      const response = await this.client.get(`/setores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar setor: ${error.message}`);
    }
  }

  async listarSetores(filtros = {}, pagina = 0, limite = 10) {
    try {
      const params = { pagina, limite, ...filtros };
      const response = await this.client.get('/setores', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar setores: ${error.message}`);
    }
  }

  async listarSetoresPorDispositivo(dispositivoId) {
    try {
      const response = await this.client.get(`/dispositivos/${dispositivoId}/setores`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar setores do dispositivo: ${error.message}`);
    }
  }

  async listarSetoresPorPropriedade(propriedadeId) {
    try {
      const response = await this.client.get(`/propriedades/${propriedadeId}/setores`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao listar setores da propriedade: ${error.message}`);
    }
  }

  // ==================== VALIDAÇÕES ====================

  async validarSetor(setorId) {
    try {
      const setor = await this.buscarSetor(setorId);
      if (!setor) {
        throw new Error(`Setor ${setorId} não encontrado`);
      }
      return setor;
    } catch (error) {
      throw new Error(`Erro ao validar setor: ${error.message}`);
    }
  }

  async validarDispositivo(dispositivoId) {
    try {
      const dispositivo = await this.buscarDispositivo(dispositivoId);
      if (!dispositivo) {
        throw new Error(`Dispositivo ${dispositivoId} não encontrado`);
      }
      return dispositivo;
    } catch (error) {
      throw new Error(`Erro ao validar dispositivo: ${error.message}`);
    }
  }

  async validarPropriedade(propriedadeId) {
    try {
      const propriedade = await this.buscarPropriedade(propriedadeId);
      if (!propriedade) {
        throw new Error(`Propriedade ${propriedadeId} não encontrada`);
      }
      return propriedade;
    } catch (error) {
      throw new Error(`Erro ao validar propriedade: ${error.message}`);
    }
  }
}

// Singleton
const apiExternaService = new ApiExternaService();

module.exports = apiExternaService;
