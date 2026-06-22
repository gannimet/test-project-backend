import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServer({ server });

type IdentifiableWebSocket = {
    socket: WebSocket;
    id: string;
};

const connectedClients: IdentifiableWebSocket[] = [];

webSocketServer.on('connection', (ws) => {
    const clientId = crypto.randomUUID();

    console.log('New client connected:', clientId);
    connectedClients.push({
        id: clientId,
        socket: ws,
    });

    ws.on('message', (data) => {
        console.log('New message:', data.toString());
        connectedClients.forEach((client) => {
            client.socket.send(
                JSON.stringify({
                    sender: client.id,
                    content: data.toString(),
                }),
            );
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.log('Error:', error);
    });

    ws.send(
        JSON.stringify({
            sender: 'Server',
            content: 'Welcome to my Websocket server!',
        }),
    );
});

const allowedOrigins = ['http://localhost:5173', 'http://localhost:4200'];

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin ?? '';

    if (allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
        // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // if (req.method === 'OPTIONS') {
        //     return res.sendStatus(200);
        // }
    }

    next();
});

app.get('/randomnumber', (req, res) => {
    res.json({
        value: Math.random(),
    });
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
