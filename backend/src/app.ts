import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import roomsRoutes from './routes/rooms.js';
import playerRoutes from './routes/playerRoutes.js';
import cookieParser from 'cookie-parser';
import { registerSocketHandler } from './sockets/index.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

registerSocketHandler(io);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/player', playerRoutes);

app.get('/', (req, res) => {
    res.send('API работает');
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Сервер запущен на порту  http://localhost:${PORT}`));