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
                    
                    sh 'yarn build'
                    
                    // Tạo cú hích file để kích hoạt theo dõi (watch) bên ngoài và để pm2 tự động reload
                    sh 'touch restart.txt'
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