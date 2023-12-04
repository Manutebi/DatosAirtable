import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useWebSocket from '../hooks/useWebSocket';

const AirtableData = ({ user }) => {
    const [records, setRecords] = useState([]);
    const [editRecordId, setEditRecordId] = useState(null);
    const [formData, setFormData] = useState({});
    const socket = useWebSocket('http://localhost:3000');

    useEffect(() => {
        axios.get('https://api.airtable.com/v0/appQhDAYLGtvjhKcv/Test', {
            headers: {
                'Authorization': `Bearer keykY5YjFxN23izT6`
            }
        })
            .then(response => {
                setRecords(response.data.records);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        if (socket) {
            // Escuchar el evento 'recordsUpdated' emitido por el servidor
            socket.on('recordsUpdated', (updatedRecords) => {
                // Actualizar el estado con los registros actualizados
                setRecords(updatedRecords);
            });

            return () => {
                // Limpiar el listener cuando el componente se desmonte
                socket.off('recordsUpdated');
            };
        }
    }, [socket]);

    const handleEditClick = (record) => {
        setEditRecordId(record.id);
        setFormData(record.fields);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.patch(`https://api.airtable.com/v0/appQhDAYLGtvjhKcv/Test/${editRecordId}`, {
            fields: formData
        }, {
            headers: {
                'Authorization': `Bearer keykY5YjFxN23izT6`
            }
        })
            .then(response => {
                setRecords(records.map(record => record.id === editRecordId ? response.data : record));
                setEditRecordId(null); // Reset the form
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Rut</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(record => (
                        <tr key={record.id}>
                            <td>{record.fields.Rut}</td>
                            <td>{record.fields.Nombre}</td>
                            <td>{record.fields.Apellido}</td>
                            <td>{record.fields.Telefono}</td>
                            <td>{record.fields.Email}</td>
                            <td>
                                <button onClick={() => handleEditClick(record)}>Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {editRecordId && (
                <form onSubmit={handleSubmit}>
                    <input
                        name="Nombre"
                        value={formData.Nombre}
                        onChange={handleInputChange}
                    />
                    <input
                        name="Apellido"
                        value={formData.Apellido}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Guardar cambios</button>
                </form>
            )}
        </div>
    );
};

export default AirtableData;
