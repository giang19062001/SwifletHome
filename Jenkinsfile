pipeline {
    agent any
    
    tools {
        nodejs 'node'
    }

    environment {
        DEPLOY_DIR = '/var/www/SwifletHome'
    }

    stages {
        stage('Deploy Directly to Production') {
            steps {
                dir("${DEPLOY_DIR}") {
                    
                    git branch: 'main', url: 'https://github.com/giang19062001/SwifletHome.git'
                    
                    withCredentials([
                        file(credentialsId: 'firebase-key', variable: 'FIREBASE_JSON'),
                        file(credentialsId: 'env-file', variable: 'DOTENV_FILE')
                    ]) {
                        sh 'cat "$FIREBASE_JSON" > firebase-adminsdk.json'
                        sh 'cat "$DOTENV_FILE" > .env'
                    }
                    
                   sh '''
                    md5sum package.json > .current_deps_hash
                    
                    if cmp -s .current_deps_hash .last_deps_hash; then
                        echo "package.json not change, skip yarn install."
                    else
                        yarn install
                        cp .current_deps_hash .last_deps_hash
                    fi
                    '''
                    
                    sh 'yarn build'
                    
                    sh '''
                    sudo /usr/bin/pm2 reload SWIFLETHOME --update-env
                    '''
                }
            }
        }
    }
    // clear
    post {
        always {
            cleanWs()
        }
    }
}