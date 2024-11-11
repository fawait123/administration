import handler from 'serve-handler';
import http from 'http';
import dotenv from 'dotenv'

dotenv.config({
    path: '.env'
})

const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: 'dist', // serve from the `dist` folder
        rewrites: [
            { source: '**', destination: '/index.html' } // necessary for SPA routing
        ],
    });
});

const PORT = process.env.FE_PORT || 7000

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Running at http://localhost:${PORT}`);
});
