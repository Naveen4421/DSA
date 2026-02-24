pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'naveen4421/dsa-tracker'
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials' // You need to set this in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Pulling secrets from Jenkins Environment/Credentials
                    // Note: Next.js needs these at BUILD TIME
                    withCredentials([
                        string(credentialsId: 'supabase-url', variable: 'SUPABASE_URL'),
                        string(credentialsId: 'supabase-key', variable: 'SUPABASE_KEY')
                    ]) {
                        sh "docker build \
                            --build-arg NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL} \
                            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY} \
                            -t ${DOCKER_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS_ID) {
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Assumes Jenkins has kubectl configured and access to the cluster
                    sh "kubectl apply -f k8s/deployment.yaml"
                    sh "kubectl rollout status deployment/dsa-tracker"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
