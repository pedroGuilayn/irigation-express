FROM node:18-alpine

# Instalar wget para health checks
RUN apk add --no-cache wget

# Diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências de produção
RUN npm install --omit=dev

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]
