pipeline {
    agent any

    environment {
        // התמונה שניצור ונדחוף ל-Registry המקומי
        IMAGE_NAME = "localhost:5000/shopping-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                // מושך את הקוד מהגיטהאב
                checkout scm 
            }
        }

        stage('Test') {
            steps {
                dir('shopping_app') {
                    // מתקין חבילות ומריץ טסטים. אם נכשל - התהליך עוצר כאן!
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                dir('shopping_app') {
                    script {
                        // בונה את התמונה עם מספר הריצה הייחודי של ג'נקינס
                        def app = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        // דוחף למאגר גם כגרסה ספציפית וגם כ-latest
                        app.push("${BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                dir('shopping_app') {
                    // טוען את קובץ ההרשאות של קוברנטיס מתוך הסודות של ג'נקינס
                    withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                        // מריץ את קובצי ה-YAML שיצרנו קודם
                        sh 'kubectl apply -f k8s/'
                        // מעדכן את הפודים לתמונה החדשה הרגע דחפנו
                        sh 'kubectl set image deployment/shopping-backend-deployment shopping-backend=${IMAGE_NAME}:${BUILD_NUMBER}'
                        // מחכה שהשרתים החדשים יעלו ויהיו בריאים לחלוטין
                        sh 'kubectl rollout status deployment/shopping-backend-deployment'
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                    // טריק של אלופים כדי למנוע שגיאות רשת: 
                    // במקום שג'נקינס ינסה לגשת לשרת מבחוץ, אנחנו מרימים פוד זמני *בתוך* קוברנטיס שבודק את נתיב הבריאות שיצרת!
                    sh 'kubectl run smoke-test-pod --rm -i --restart=Never --image=curlimages/curl -- curl -f http://shopping-backend-service/health'
                }
            }
        }
    }

    // מנגנון Rollback (התאוששות מכשלון)
    post {
        failure {
            echo '🚨 ה-Pipeline נכשל! מבצע Rollback לגרסה הקודמת והיציבה... 🚨'
            dir('shopping_app') {
                withCredentials([file(credentialsId: 'my-kubeconfig', variable: 'KUBECONFIG')]) {
                    sh 'kubectl rollout undo deployment/shopping-backend-deployment'
                }
            }
        }
    }
}