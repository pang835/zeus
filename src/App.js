/* global BigInt */
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import OlympusTokenABI from "./abis/OlympusToken.json";

const OLY_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const styles = {
  container: { textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#e6f7ff", minHeight: "100vh" },
  heading: { fontSize: "2.5rem", color: "#333", marginBottom: "20px" },
  logo: { width: "150px", margin: "20px 0" },
  button: { padding: "10px 20px", fontSize: "1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", margin: "10px" },
  disconnectButton: { padding: "10px 20px", fontSize: "1rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", margin: "10px" },
  input: { padding: "10px", fontSize: "1rem", margin: "10px 0", width: "300px", borderRadius: "5px", border: "1px solid #ccc" },
  text: { fontSize: "1.2rem", color: "#555" },
  paragraph: { color: "#ffcc00", padding: "20px", borderRadius: "10px", margin: "20px auto", maxWidth: "600px", fontSize: "1.1rem", lineHeight: "1.6", backgroundColor: "transparent" },
  logoAndButtonContainer: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" },
  modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", textAlign: "center" },
  walletButton: { padding: "10px", fontSize: "1rem", margin: "10px", cursor: "pointer", width: "200px", display: "block" }
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [polAmount, setPolAmount] = useState(0);
  const [walletModal, setWalletModal] = useState(false);

  const initWeb3 = async (walletType) => {
    let provider = null;
  
    if (walletType === "metamask" && window.ethereum) {
      provider = window.ethereum;
    } else if (walletType === "trust" && window.trustwallet) {
      provider = window.trustwallet;
    } else if (walletType === "phantom" && window.phantom?.ethereum) {
      provider = window.phantom.ethereum;
    } else {
      alert("Selected wallet is not installed. Please install it and try again.");
      return;
    }
  
    try {
      await provider.request({ method: "eth_requestAccounts" });
  
      // Create Web3 instance with the provider
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
  
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
  
      const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
      setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));
  
      // ✅ Force Phantom Wallet to use Polygon
      await switchToPolygon(provider);
  
      setWalletModal(false); // Close modal after selecting wallet
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const switchToPolygon = async (provider) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }], // Polygon Mainnet
      });
      console.log("Switched to Polygon network!");
    } catch (error) {
      if (error.code === 4902) {
        // If Polygon is not available, add it to Phantom
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          });
          console.log("Polygon network added and switched!");
        } catch (addError) {
          console.error("Error adding Polygon network:", addError);
        }
      } else {
        console.error("Error switching to Polygon:", error);
      }
    }
  };
  
  

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount("");
    setBalance(0);
    console.log("Wallet disconnected");
  };

  const buyTokens = async () => {
    if (!web3 || !account) {
      alert("Please connect your wallet first.");
      return;
    }
  
    try {
      const contract = new web3.eth.Contract(OlympusTokenABI, OLY_CONTRACT_ADDRESS);
      const valueInWei = web3.utils.toWei(polAmount.toString(), "ether");
  
      // Fetch current gas price dynamically
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 300000; // Increase limit to avoid underestimation
  
      console.log("Sending transaction...");
      const tx = await contract.methods.buyTokens().send({
        from: account,
        value: valueInWei,
        gas: gasLimit,
        gasPrice: gasPrice,
      });
  
      console.log("Transaction receipt:", tx);
      alert("Tokens purchased successfully!");
    } catch (error) {
      console.error("Error buying tokens:", error);
      alert(`Transaction Failed: ${error.message}`);
    }
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

useEffect(() => {
  // Correct target date: April 1st, 2024 at 20:00 UTC
  const targetDate = new Date("2025-04-01T20:00:00Z"); // UTC format (ISO string)

  console.log("Target Date: ", targetDate); // Debug: Check the target date

  const updateCountdown = () => {
    const now = new Date(); // Get the current local date-time
    const nowUTC = new Date(now.toISOString()); // Convert current time to UTC

    console.log("Current UTC Time: ", nowUTC); // Debug: Check current UTC time

    const difference = targetDate.getTime() - nowUTC.getTime(); // Get the difference in milliseconds

    console.log("Difference in ms: ", difference); // Debug: Check the difference

    if (difference <= 0) {
      // If the target date has passed, set time left to 0
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    } else {
      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      console.log("Countdown: ", days, hours, minutes, seconds); // Debug: Check the countdown calculation

      // Update the timeLeft state with calculated values
      setTimeLeft({ days, hours, minutes, seconds });
    }
  };

  updateCountdown(); // Initialize countdown immediately
  const timer = setInterval(updateCountdown, 1000); // Update every second

  // Cleanup interval on unmount to stop timer
  return () => clearInterval(timer);
}, []);


  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Olympus Token ($ZEUS)</h1>
      <div style={styles.logoAndButtonContainer}>
        <img src="zeus-logo.jpg" alt="Zeus Logo" style={styles.logo} />
        {!account ? (
          <button onClick={() => setWalletModal(true)} style={styles.button}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <button onClick={buyTokens} style={styles.button}>
              Buy Tokens
            </button>
            <button onClick={disconnectWallet} style={styles.disconnectButton}>
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {account && (
        <div>
          <p style={styles.text}>Your MATIC Balance: {balance} MATIC</p>
          <input
            type="number"
            placeholder="Amount of POL"
            value={polAmount}
            onChange={(e) => setPolAmount(e.target.value)}
            style={styles.input}
          />
        </div>
      )}
{/* Countdown Timer */}
<div style={styles.countdown}>
        <p>
          Launching in: {timeLeft.days} Days {timeLeft.hours} Hours {timeLeft.minutes} Minutes {timeLeft.seconds} Seconds
        </p>
      </div>





      <div style={styles.paragraph}>
        <p>
          🚀 Don't miss out on the next big thing! 🚀
          <br />
          $ZEUS is the future of decentralized finance. With a limited supply of 1 million tokens, $ZEUS is designed to grow in value as adoption increases.
          <br />
          🌟 Why $ZEUS?
          <br />
          - Limited supply: Only 1 million tokens will ever exist.
          <br />
          - Referral rewards: Earn 0.1 $ZEUS for every successful referral.
          <br />
          - Early access: Get in before the masses and secure your financial future.
          <br />
          💰 Buy $ZEUS now and be part of the revolution!
        </p>
      </div>

      {walletModal && (
        <div style={styles.modal}>
          <h2>Select a Wallet</h2>
          <button onClick={() => initWeb3("metamask")} style={styles.walletButton}>
            🦊 MetaMask
          </button>
          <button onClick={() => initWeb3("trust")} style={styles.walletButton}>
            🏦 Trust Wallet
          </button>
          <button onClick={() => initWeb3("phantom")} style={styles.walletButton}>
            👻 Phantom Wallet
          </button>
          <button onClick={() => setWalletModal(false)} style={styles.disconnectButton}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
