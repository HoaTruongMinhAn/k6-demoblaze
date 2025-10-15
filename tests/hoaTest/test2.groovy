pipeline {
    agent any
    
    environment{
        K6_CLOUD_TOKEN = credentials("k6-cloud-token")
        K6_CLOUD_PROJECT_ID = 5059314
    }    

    stages {
        stage('Checkout'){
            steps{
                git branch: 'master', url: 'https://github.com/HoaTruongMinhAn/k6-demoblaze.git'
            }
        }
        
        stage('Run k6 Functional Tests') {
            steps {
                script {
                    // Define test scripts
                    def tests = [
                        [name: "mix", path: "tests/mix/mix-scenario-weighted.js"]
                    ]

                    // Empty list to store report URLs
                    def reportList = []

                    tests.each { test ->
                        echo "🚀 Running ${test.name}..."
                        def dockerCmd = sh(
                            script: 'command -v docker || echo /usr/local/bin/docker',
                            returnStdout: true
                        ).trim()
                        def dockerAvailable = sh(
                            script: "[ -x '${dockerCmd}' ] && echo yes || echo no",
                            returnStdout: true
                        ).trim() == 'yes'

                        def cmd = dockerAvailable ?
                            "${dockerCmd} run --rm -v \"${env.WORKSPACE}\":/work -w /work -e K6_CLOUD_TOKEN -e K6_CLOUD_PROJECT_ID -e DISTRIBUTION_PROFILE=ecommerce -e TEST_PROFILE=mix grafana/k6:latest run ${test.path} -o cloud" :
                            "DISTRIBUTION_PROFILE=ecommerce TEST_PROFILE=mix /opt/homebrew/bin/k6 run ${test.path} -o cloud"

                        def output = sh(
                            script: cmd,
                            returnStdout: true
                        ).trim()

                        // Find report URL in output
                        def match = output =~ /(https:\/\/[^\s]+grafana\.net[^\s]*)/
                        if (match && match[0]) {
                            def url = match[0][0].toString().replaceAll(/[)\]]+$/, "")
                            reportList << [name: test.name, url: url]
                            echo "✅ Found report for ${test.name}: ${url}"
                        } else {
                            reportList << [name: test.name, url: "Not found"]
                            echo "⚠️ No URL found for ${test.name}"
                        }
                    }

                    // Store all reports as HTML for the email
                    def htmlReports = reportList.collect { r ->
                        if (r.url == "Not found") {
                            return "<p><b>${r.name} report:</b> Not found</p>"
                        } else {
                            return "<p><b>${r.name} report:</b> <a href='${r.url}'>${r.url}</a></p>"
                        }
                    }.join("\n")

                    // Make available for email stage
                    env.K6_REPORTS_HTML = htmlReports
                }
            }
        }
    }

    post {
        success {
            emailext(
                from: 'Jenkins <anhoapitago1@gmail.com>',
                to: 'anhoapitago@gmail.com, anhoapitago1@gmail.com, ',
                subject: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>✅ <b>Build succeeded!</b></p>
                         <p><b>Job:</b> ${env.JOB_NAME}</p>
                         <p><b>Build URL:</b> <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a></p>
                         <h3>K6 Cloud Reports</h3>
                         ${env.K6_REPORTS_HTML}
                         """,
                mimeType: 'text/html'
            )
        }

        failure {
            emailext(
                to: 'anhoapitago1@gmail.com',
                subject: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>❌ <b>Build failed.</b></p>
                         <p><b>Job:</b> ${env.JOB_NAME}</p>
                         <p><b>Check logs:</b> <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a></p>
                         <h3>K6 Cloud Reports (if available)</h3>
                         ${env.K6_REPORTS_HTML}
                         """,
                mimeType: 'text/html'
            )
        }
    }
}
