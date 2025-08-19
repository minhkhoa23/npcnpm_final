// Backend Starter - Automatically starts the backend server
// This allows the frontend to run the backend server programmatically

class BackendStarter {
    constructor() {
        this.serverProcess = null;
        this.isServerRunning = false;
        this.healthCheckInterval = null;
    }

    // Check if we're running in an environment that supports backend starting
    canStartBackend() {
        // In browser environment, we can't start Node.js processes
        // This would only work in Electron or similar environments
        return typeof require !== 'undefined' && typeof process !== 'undefined';
    }

    // Start the backend server
    async startBackend() {
        if (!this.canStartBackend()) {
            console.log('Cannot start backend automatically in browser environment');
            return this.checkExistingServer();
        }

        try {
            const { spawn } = require('child_process');
            const path = require('path');
            
            // Path to the backend directory
            const backendPath = path.resolve(__dirname, '../../backend');
            
            console.log('Starting backend server...');
            
            // Start the backend server
            this.serverProcess = spawn('node', ['server.js'], {
                cwd: backendPath,
                stdio: 'pipe',
                env: {
                    ...process.env,
                    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/tournament',
                    PORT: process.env.PORT || '3000',
                    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
                    NODE_ENV: process.env.NODE_ENV || 'development'
                }
            });

            // Handle server output
            this.serverProcess.stdout.on('data', (data) => {
                console.log(`Backend: ${data}`);
            });

            this.serverProcess.stderr.on('data', (data) => {
                console.error(`Backend Error: ${data}`);
            });

            this.serverProcess.on('close', (code) => {
                console.log(`Backend server exited with code ${code}`);
                this.isServerRunning = false;
                this.clearHealthCheck();
            });

            // Wait a moment for server to start
            await this.delay(3000);
            
            // Check if server is running
            const isRunning = await this.checkServerHealth();
            if (isRunning) {
                this.isServerRunning = true;
                this.startHealthCheck();
                console.log('Backend server started successfully!');
            }
            
            return isRunning;
            
        } catch (error) {
            console.error('Failed to start backend server:', error);
            return false;
        }
    }

    // Check if server is already running
    async checkExistingServer() {
        console.log('Checking if backend server is already running...');
        
        try {
            const isRunning = await this.checkServerHealth();
            if (isRunning) {
                this.isServerRunning = true;
                this.startHealthCheck();
                console.log('Backend server is already running!');
                return true;
            } else {
                console.log('Backend server is not running. Please start it manually:');
                console.log('1. cd src/backend');
                console.log('2. node server.js');
                
                // Show user-friendly message
                this.showServerStartInstructions();
                return false;
            }
        } catch (error) {
            console.error('Error checking existing server:', error);
            return false;
        }
    }

    // Check server health
    async checkServerHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const response = await fetch('http://localhost:3000/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Health check timeout - server not responding');
            } else {
                console.log('Health check failed:', error.message);
            }
            return false;
        }
    }

    // Start periodic health checks
    startHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        this.healthCheckInterval = setInterval(async () => {
            const isHealthy = await this.checkServerHealth();
            if (!isHealthy && this.isServerRunning) {
                console.warn('Backend server appears to be down');
                this.isServerRunning = false;
                this.showServerDownMessage();
            } else if (isHealthy && !this.isServerRunning) {
                console.log('Backend server is back online');
                this.isServerRunning = true;
                this.hideServerDownMessage();
            }
        }, 10000); // Check every 10 seconds
    }

    // Clear health check interval
    clearHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    // Show server start instructions
    showServerStartInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'server-instructions';
        instructions.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f39c12;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        instructions.innerHTML = `
            <strong>Backend Server chưa chạy!</strong><br>
            Vui lòng mở terminal và chạy: <code>cd src/backend && node server.js</code><br>
            <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; padding: 5px 10px; background: white; color: #f39c12; border: none; border-radius: 3px; cursor: pointer;">Đã hiểu</button>
            <button onclick="window.location.reload()" style="margin-left: 5px; padding: 5px 10px; background: white; color: #f39c12; border: none; border-radius: 3px; cursor: pointer;">Reload trang</button>
        `;
        
        document.body.appendChild(instructions);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (instructions.parentElement) {
                instructions.style.display = 'none';
            }
        }, 10000);
    }

    // Show server down message
    showServerDownMessage() {
        let message = document.getElementById('server-down-message');
        if (!message) {
            message = document.createElement('div');
            message.id = 'server-down-message';
            message.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #e74c3c;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
            `;
            message.innerHTML = `
                <strong>Mất kết nối với server!</strong> Đang thử kết nối lại...
                <button onclick="window.location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #e74c3c; border: none; border-radius: 3px; cursor: pointer;">Reload</button>
            `;
            document.body.appendChild(message);
        }
        message.style.display = 'block';
    }

    // Hide server down message
    hideServerDownMessage() {
        const message = document.getElementById('server-down-message');
        if (message) {
            message.style.display = 'none';
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Stop the backend server
    stopBackend() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
        this.isServerRunning = false;
        this.clearHealthCheck();
    }

    // Get server status
    getStatus() {
        return {
            canStart: this.canStartBackend(),
            isRunning: this.isServerRunning,
            hasProcess: !!this.serverProcess
        };
    }
}

// Create global instance
export const backendStarter = new BackendStarter();

// Auto-start when imported
(async () => {
    console.log('Initializing backend connection...');
    
    try {
        // Try to start or connect to backend
        const success = await backendStarter.startBackend();
        
        if (success) {
            console.log('✅ Backend server is ready!');
            
            // Dispatch event to notify app that backend is ready
            window.dispatchEvent(new CustomEvent('backendReady'));
        } else {
            console.log('❌ Backend server is not available');
            
            // Dispatch event to notify app that backend is not available
            window.dispatchEvent(new CustomEvent('backendUnavailable'));
        }
    } catch (error) {
        console.error('Backend initialization error:', error);
        
        // Dispatch event to notify app that backend is not available
        window.dispatchEvent(new CustomEvent('backendUnavailable'));
    }
})();

// Make available globally for debugging
window.backendStarter = backendStarter;