pipeline {
    agent any
    
    tools {
        nodejs 'node'
    }

    environment {
        DEPLOY_DIR = '/var/www/SwifletHome'
        TZ = 'Asia/Ho_Chi_Minh'
    }

    stages {
        stage('Deploy Directly to Production') {
            steps {
                dir("${DEPLOY_DIR}") {
                    sh '''
                        git config --global --add safe.directory /var/www/SwifletHome
                        
                        if [ ! -d ".git" ]; then
                            git init
                            git remote add origin https://github.com/giang19062001/SwifletHome.git
                        fi
                        
                        git fetch origin main
                        git reset --hard origin/main
                    '''

                sh '''
                    md5sum package.json > .current_deps_hash
                    
                    if cmp -s .current_deps_hash .last_deps_hash; then
                        echo "package.json not change, skip yarn install."
                    else
                        yarn install
                        cp .current_deps_hash .last_deps_hash
                    fi
                    '''
                    
                    sh 'yarn lint'
                    sh 'yarn build'
                    
                    // run Migration DB by Flyway via Docker 
                    withCredentials([
                        string(credentialsId: 'FLYWAY_DB_URL', variable: 'DB_URL'),
                        string(credentialsId: 'FLYWAY_DB_USER', variable: 'DB_USER'),
                        string(credentialsId: 'FLYWAY_DB_PASS', variable: 'DB_PASS')
                    ]) {
                        sh '''
                            docker run --rm \
                                --add-host=host.docker.internal:host-gateway \
                                -v ${DEPLOY_DIR}/db/migrations:/flyway/sql \
                                flyway/flyway:latest \
                                -url=${DB_URL} \
                                -user=${DB_USER} \
                                -password=${DB_PASS} \
                                -baselineOnMigrate=true \
                                -baselineVersion=1 \
                                migrate
                        '''
                    }

                    withCredentials([string(credentialsId: 'SSH_SERVER_REMOTE', variable: 'SERVER')]) {
                        sh 'ssh -o StrictHostKeyChecking=no $SERVER "cd $DEPLOY_DIR && pm2 reload SWIFLETHOME --update-env"'
                    }

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