const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// 接続時の処理

// チャット履歴をメモリ上で管理
const chatHistory = {};

// ✅ 履歴取得用のAPI
app.get('/history/:streamerId', (req, res) => {
  const { streamerId } = req.params;
  res.json(chatHistory[streamerId] || []);
});

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  // ✅ ストリーマーのルームに参加
  socket.on('join', (streamerId) => {
    socket.join(streamerId);
  });

  // ✅ チャットメッセージ受信・保存・配信
  socket.on('chat:message', ({ streamerId, ...payload }) => {
    // 履歴に追加
    if (!chatHistory[streamerId]) {
      chatHistory[streamerId] = [];
    }
    chatHistory[streamerId].push(payload);

    // 100件制限
    if (chatHistory[streamerId].length > 100) {
      chatHistory[streamerId].shift();  // 古いメッセージ削除
    }

    // メッセージをルーム内全員に配信
    io.to(streamerId).emit('chat:message', payload);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO サーバー起動中`);
});