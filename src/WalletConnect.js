// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import WalletConnectClient from '@walletconnect/client'; // Ensure you are importing the necessary WalletConnect client

const WalletConnectComponent = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [connectionError, setConnectionError] = useState(null); // For showing any errors

  // Initialize WalletConnect on component mount
  useEffect(() => {
    // Initialize WalletConnect client (you may already have this part)
    const walletConnect = new WalletConnectClient({
      bridge: "https://bridge.walletconnect.org", // Bridge URL
      qrcodeModal: {
        open: (uri, cb) => {
          // Open the WalletConnect modal
          setQrCodeUrl(uri);
          setIsModalOpen(true);  // Open the modal
          cb(); // Call the callback function to finalize the QR code display
        },
        close: () => {
          // Close the modal when the user dismisses it
          setIsModalOpen(false);
          console.log("User closed modal");
        }
      }
    });

    // Event listener for errors during connection
    walletConnect.on("error", (error) => {
      setConnectionError(error.message);
      console.log("Connection error: ", error.message);
    });

    // Cleanup when the component is unmounted
    return () => {
      walletConnect.off("error");
    };
  }, []);

  // Handle wallet disconnection
  const handleDisconnect = () => {
    setIsModalOpen(false); // Close the modal if disconnected
    console.log("Wallet disconnected.");
  };

  return (
    <div>
      {connectionError && <p>Error: {connectionError}</p>} {/* Show error message if any */}

      <h2>Connect Your Wallet</h2>

      {/* Conditionally render the WalletConnect modal */}
      {isModalOpen && (
        <div className="walletconnect-modal">
          <img src={qrCodeUrl} alt="WalletConnect QR Code" /> {/* Display QR Code */}
          <button onClick={handleDisconnect}>Disconnect</button> {/* Disconnect Button */}
        </div>
      )}

      {/* Button to initiate wallet connection */}
      <button onClick={() => console.log("Connect with WalletConnect")}>Connect Wallet</button>
    </div>
  );
};

export default WalletConnectComponent;
