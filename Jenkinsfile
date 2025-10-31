pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'utfpr-api-express'
        CONTAINER_NAME = 'api-express'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonando repositório...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Construindo imagem Docker...'
                sh """
                    docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                    docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                """
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo '🛑 Parando container antigo...'
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                """
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Fazendo deploy...'
                sh """
                    # Obter a rede do docker-compose
                    NETWORK=\$(docker network ls --format '{{.Name}}' | grep utfpr || echo 'utfpr_default')
                    
                    # Iniciar container
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --network \$NETWORK \
                        --restart unless-stopped \
                        -e NODE_ENV=production \
                        -e PORT=4000 \
                        -e MONGODB_URI=mongodb://admin:admin123@mongodb:27017/irrigation?authSource=admin \
                        ${DOCKER_IMAGE}:latest
                    
                    echo "✅ Container iniciado!"
                """
            }
        }
        
        stage('Health Check') {
            steps {
                echo '✅ Verificando GraphQL...'
                script {
                    def healthCheck = false
                    def maxRetries = 10
                    
                    for (int i = 0; i < maxRetries; i++) {
                        try {
                            sh '''
                                docker exec ${CONTAINER_NAME} wget -q -O- \
                                --post-data='{"query":"{ __typename }"}' \
                                --header='Content-Type: application/json' \
                                http://localhost:4000/graphql
                            '''
                            healthCheck = true
                            echo "✅ GraphQL está respondendo!"
                            break
                        } catch (Exception e) {
                            echo "⏳ Tentativa ${i+1}/${maxRetries}..."
                            sleep 3
                        }
                    }
                    
                    if (!healthCheck) {
                        echo "⚠️  Health check falhou, mas container está rodando"
                    }
                }
            }
        }
        
        stage('Restart Nginx') {
            steps {
                echo '🔄 Reiniciando Nginx...'
                sh 'docker restart nginx-proxy || true'
            }
        }
    }
    
    post {
        success {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '✅ DEPLOY REALIZADO COM SUCESSO!'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo ''
            echo '🌐 GraphQL disponível em:'
            echo '   http://192.168.30.65/graphql'
            echo ''
        }
        failure {
            echo '❌ Pipeline falhou!'
            echo 'Logs do container:'
            sh 'docker logs ${CONTAINER_NAME} --tail 50 || true'
        }
        always {
            echo '🧹 Limpando...'
            sh 'docker image prune -f || true'
        }
    }
}
