const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configura CORS para permitir solicitudes de tu aplicación React
const corsOptions = {
    origin: 'http://localhost:5173', // El origen de tu aplicación React
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Métodos permitidos
    credentials: true // Permite cookies y otros datos de autenticación
};

app.use(cors(corsOptions));

// Aplica las mismas opciones de CORS para socket.io
const io = new Server(server, {
    cors: corsOptions
});

// Configuración de la API de Airtable
const airtableApiKey = 'keykY5YjFxN23izT6';
const airtableBaseId = 'appQhDAYLGtvjhKcv';
const airtableTableName = 'Test';

// Almacena los registros locales para comparar con los de Airtable
let localRecords = [];

// Función para obtener los registros de Airtable
const fetchAirtableRecords = async () => {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`, {
            headers: {
                'Authorization': `Bearer ${airtableApiKey}`
            }
        });
        return response.data.records;
    } catch (error) {
        console.error('Error al obtener registros de Airtable:', error);
        return [];
    }
};

// Función para verificar si hay actualizaciones en Airtable
const checkForUpdates = async () => {
    const currentRecords = await fetchAirtableRecords();
    // Compara los registros actuales de Airtable con los registros locales
    const updates = currentRecords.filter((record) => {
        const localRecord = localRecords.find((r) => r.id === record.id);
        return !localRecord || JSON.stringify(record.fields) !== JSON.stringify(localRecord.fields);
    });

    if (updates.length > 0) {
        // Actualiza los registros locales
        localRecords = currentRecords;
        // Retorna los registros actualizados
        return updates;
    }

    // No hay actualizaciones
    return null;
};

// Rutas HTTP
app.get('/', (req, res) => {
    res.send('Servidor backend corriendo correctamente');
});

// Eventos de WebSocket
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    // Verifica si hay actualizaciones cada 10 segundos
    setInterval(async () => {
        const updates = await checkForUpdates();
        if (updates) {
            // Emitir un evento a todos los clientes con los datos actualizados
            io.emit('recordsUpdated', updates);
        }
    }, 10000);

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
