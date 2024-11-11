module.exports = {
    apps: [
        {
            script: "packages/administrasi-be/dist/src/main.js",
            instances: 2,
            exec_mode: "cluster",
            name: "backend"
        },
        {
            // script: "cd packages/administrasi && node server.js",
            script: "cd packages/administrasi && node server.js",
            name: "frontend",
        }
    ]
}