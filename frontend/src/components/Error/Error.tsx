import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ErrorComponentProps {
  errorMessage: string;
  onConnectionSuccess: (account: string) => void;
  onConnectionError: (error: string) => void;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  errorMessage,
  onConnectionSuccess,
  onConnectionError,
}) => {
  const [loading, setLoading] = useState(false);

  const connectMetamask = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('Metamask no está instalado.');
      }

      // Solicita acceso a las cuentas de Metamask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        // Si hay cuentas disponibles, notifica la conexión exitosa
        onConnectionSuccess(accounts[0]);
      } else {
        throw new Error('No se encontraron cuentas en Metamask.');
      }
    } catch (error: any) {
      // Notifica errores si ocurre algún problema
      onConnectionError(error.message || 'Error al conectar con Metamask.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Connect__error">
      <motion.p
        initial={{ x: 0 }}
        animate={{
          x: [0, -10, 10, -10, 10, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 5,
        }}
        className="no-wallet"
      >
        {errorMessage}
      </motion.p>
      <motion.button
        initial={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="Connect__metamask-button"
        onClick={connectMetamask}
        disabled={loading}
      >
        {loading ? 'Conectando...' : 'Conectar Metamask'}
      </motion.button>
    </div>
  );
};