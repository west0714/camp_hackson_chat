const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// 接続時の処理
io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  // ストリーマーのルームに参加
  socket.on('join', (streamerId) => {
    socket.join(streamerId);
    console.log(`${socket.id} がルーム ${streamerId} に参加`);
  });

  // チャットメッセージを受信してブロードキャスト
  socket.on('chat:message', ({ streamerId, ...payload }) => {
    io.to(streamerId).emit('chat:message', payload);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO サーバー起動中: http://localhost:${PORT}`);
});