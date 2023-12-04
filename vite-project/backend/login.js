const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();


app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(bodyParser.json());

// Configuración de CSP para permitir la carga de fuentes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; font-src 'self' http://localhost:5000;");
    next();
});



// Simular una base de datos de usuarios
const users = {
    'usuario1': { password: 'contraseña1', name: 'Usuario Uno' },
    // ... (más usuarios)
};

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        res.json({ username, name: users[username].name });
    } else {
        res.status(401).send('Credenciales incorrectas');
    }
});

// Ruta para actualizar un registro en Airtable
app.patch('/updateRecord/:recordId', (req, res) => {
    const { recordId } = req.params;
    const { fields, user } = req.body;

    // Asegúrate de incluir tu API Key de Airtable y la ID de tu base
    axios.patch(`https://api.airtable.com/v0/appQhDAYLGtvjhKcv/Test/${recordId}`, {
        fields: { ...fields, lastModifiedBy: user.name }
    }, {
        headers: {
            'Authorization': `Bearer keykY5YjFxN23izT6`
        }
    })
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error al actualizar el registro');
        });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
