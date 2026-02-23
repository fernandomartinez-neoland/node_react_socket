import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('✅ Conectado:', socket.id);

  // El técnico se une a su sala personal
  socket.on('join_tecnico', (tecnicoId) => {
    socket.join(tecnicoId);
    socket.tecnicoId = tecnicoId; // guardamos referencia
    console.log(`🔧 Técnico unido a sala: ${tecnicoId}`);
  });

  // Cualquiera envía un mensaje a una sala
  socket.on('enviar_mensaje', (data) => {
    console.log(`💬 [${data.de}] → [${data.para}]: ${data.mensaje}`);

    // Reenviar al destinatario
    io.to(data.para).emit('recibir_mensaje', {
      de: data.de,
      mensaje: data.mensaje,
      hora: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Desconectado:', socket.id);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});