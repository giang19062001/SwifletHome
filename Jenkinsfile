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
                            FLYWAY_DIR="/var/jenkins_home/flyway/flyway-10.15.0"
                            
                            if [ ! -d "$FLYWAY_DIR" ]; then
                                echo "Downloading Flyway CLI..."
                                mkdir -p /var/jenkins_home/flyway
                                wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/10.15.0/flyway-commandline-10.15.0-linux-x64.tar.gz | tar xvz -C /var/jenkins_home/flyway
                            else
                                echo "Flyway CLI already in $FLYWAY_DIR, skip downloading"
                            fi
                            
                            $FLYWAY_DIR/flyway \
                                -locations=filesystem:${DEPLOY_DIR}/db/migrations \
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