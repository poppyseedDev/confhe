import { motion } from "framer-motion";
import { useAppState } from "./hooks/useAppState";
import { Devnet } from "./components/Devnet";
import { Connect } from "./components/Connect";
import { Election } from "./components/Election/Election";
import "./App.css";

function App() {
  const {
    isInitialized,
    loading,
    showElection,
    showElectionScreen,
  } = useAppState();

  if (loading) return <p>Loading...</p>;
  if (!isInitialized) return <p>Error: App could not initialize.</p>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="app-container"
    >
      {showElection ? (
        <Election />
      ) : (
        <>
          <header className="app-header">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              Transparent, Secure, and Universal Elections
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Revolutionizing voting with encrypted, decentralized, and
              verifiable elections for everyone.
            </motion.p>
          </header>

          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="main-content"
          >
            <Connect onConnectionSuccess={showElectionScreen}>
              {(account, provider) => (
                <div className="devnet-container">
                  <Devnet
                    account={account}
                    provider={provider}
                    onConnectionSuccess={showElectionScreen}
                  />
                </div>
              )}
            </Connect>
          </motion.main>
        </>
      )}

      <footer className="app-footer">
        <p className="footer-highlight">
          "The future of democracy is <strong>secure</strong>, transparent, and
          <strong> universal</strong>."
        </p>
      </footer>
    </motion.div>
  );
}

export default App;