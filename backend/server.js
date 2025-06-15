const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Tạo HTTP server
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
  },
  allowEIO3: true // Cho phép Engine.IO version 3
});

// Middleware xác thực Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token không tồn tại'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new Error('Không tìm thấy người dùng'));
    }

    socket.user = {
      _id: user._id,
      role: user.role,
      username: user.username,
      full_name: user.full_name
    };
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Token không hợp lệ'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token đã hết hạn'));
    }
    next(new Error('Lỗi xác thực'));
  }
});

// Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);

  // Join room riêng cho user
  socket.join(socket.user._id.toString());

  // Gửi event connected về client
  socket.emit('connected', {
    user: socket.user
  });

  // Xử lý gửi tin nhắn
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, content } = data;

      // Tạo tin nhắn mới
      const message = new Message({
        sender: socket.user._id,
        receiver: receiverId,
        content
      });
      await message.save();

      // Populate thông tin sender và receiver
      await message.populate([
        { path: 'sender', select: 'username full_name' },
        { path: 'receiver', select: 'username full_name' }
      ]);

      // Gửi tin nhắn đến người nhận
      io.to(receiverId).emit('newMessage', message);

      // Gửi xác nhận về cho người gửi
      socket.emit('messageSent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { message: 'Lỗi khi gửi tin nhắn' });
    }
  });

  // Xử lý typing status
  socket.on('typing', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('userTyping', {
      userId: socket.user._id,
      username: socket.user.username
    });
  });

  socket.on('stopTyping', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('userStopTyping', {
      userId: socket.user._id
    });
  });

  // Xử lý lỗi
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Travel App API' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});