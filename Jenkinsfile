pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "localhost:5000/shopping-backend"
        FRONTEND_IMAGE = "localhost:5000/shopping-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm 
            }
        }

        stage('Test Backend') {
            steps {
                dir('shopping_app') {
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    // בניית הבקאנד
                    dir('shopping_app') {
                        def backend = docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}")
                        backend.push("${BUILD_NUMBER}")
                        backend.push("latest")
                    }
                    // בניית הפרונטאנד
                    dir('client') {
                        def frontend = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}")
                        frontend.push("${BUILD_NUMBER}")
                        frontend.push("latest")
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                    dir('shopping_app') {
                        // פריסת תשתיות ובקאנד
                        sh 'kubectl apply -f k8s/'
                        
                        // הזרקת תמונת בקאנד ועדכון
                        sh "docker save ${BACKEND_IMAGE}:${BUILD_NUMBER} | docker exec -i k3d-my-cluster-server-0 ctr -n k8s.io images import -"
                        sh "kubectl set image deployment/shopping-backend-deployment shopping-backend=${BACKEND_IMAGE}:${BUILD_NUMBER}"
                        
                        // הזרקת תמונת פרונטאנד ועדכון
                        sh "docker save ${FRONTEND_IMAGE}:${BUILD_NUMBER} | docker exec -i k3d-my-cluster-server-0 ctr -n k8s.io images import -"
                        sh "kubectl set image deployment/shopping-frontend-deployment shopping-frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                        
                        sh 'kubectl rollout status deployment/shopping-backend-deployment'
                        sh 'kubectl rollout status deployment/shopping-frontend-deployment'
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                    // בדיקת בריאות לבקאנד
                    sh 'kubectl run smoke-test-pod --rm -i --restart=Never --image=curlimages/curl -- curl -f http://shopping-backend-service/health'
                }
            }
        }
    }

    post {
        failure {
            echo '🚨 Pipeline failed! 🚨'
            withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                sh 'kubectl rollout undo deployment/shopping-backend-deployment'
                sh 'kubectl rollout undo deployment/shopping-frontend-deployment'
            }
        }
    }
}