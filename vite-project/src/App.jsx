import React, { useState } from 'react';
import Login from './components/Login'; // Asegúrate de importar el componente Login
import AirtableData from './components/AirtableData'; // Asegúrate de importar el componente AirtableData

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        // Mostrar el formulario de inicio de sesión si no hay un usuario autenticado
        <Login onLogin={setUser} />
      ) : (
        // Mostrar el componente AirtableData una vez que el usuario haya iniciado sesión
        <AirtableData user={user} />
      )}
    </div>
  );
};

export default App;
