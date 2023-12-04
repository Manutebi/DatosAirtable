import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useWebSocket = (url) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketIo = io(url);

        socketIo.on('connect', () => {
            console.log('Conectado al servidor WebSocket');
        });

        socketIo.on('error', (error) => {
            console.error('Error en la conexión WebSocket:', error);
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, [url]);

    return socket;
};


export default useWebSocket;
