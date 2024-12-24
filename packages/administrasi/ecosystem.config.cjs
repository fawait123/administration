module.exports = {
    apps: [{
        script: "server.js",
        instances: 1,
        exec_mode: "cluster",
        name: "frontend"
    }]
}
