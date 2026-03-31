import React from 'react';

interface GenericErrorUIProps {
  onClick: () => void;
}

const GenericErrorUI: React.FC<GenericErrorUIProps> = ({ onClick }) => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Ups! Algo anda mal...</h1>
      <p>Se ha producido un error interno.  Por favor, intente nuevamente. Gracias.</p>
      <button  onClick={() => {
                location.reload();
              }}>Aceptar</button>
    </div>
  );
};

export default GenericErrorUI;
