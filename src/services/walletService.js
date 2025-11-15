/**
 * Wallet Service for MetaMask and other Ethereum wallet connections
 */

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

// Get the Ethereum provider
export const getEthereumProvider = () => {
  if (isMetaMaskInstalled()) {
    return window.ethereum;
  }
  return null;
};

// Sepolia Testnet Chain ID
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

// Switch to Sepolia testnet
export const switchToSepolia = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask yüklənmiş deyil. Zəhmət olmasa MetaMask genişləndirməsini quraşdırın."
      );
    }

    const provider = getEthereumProvider();

    try {
      // Try to switch to Sepolia
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        // Add Sepolia network to MetaMask
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Test Network",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [
                "https://rpc.sepolia.org",
                "https://sepolia.infura.io/v3/",
              ],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  } catch (error) {
    if (error.code === 4001) {
      throw new Error("İstifadəçi şəbəkə dəyişikliyini rədd etdi");
    }
    throw error;
  }
};

// Request account access
export const connectWallet = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask yüklənmiş deyil. Zəhmət olmasa MetaMask genişləndirməsini quraşdırın."
      );
    }

    const provider = getEthereumProvider();

    // Switch to Sepolia testnet first
    await switchToSepolia();

    // Request account access
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      throw new Error("Hesab seçilmədi");
    }

    const address = accounts[0];

    // Get chain ID
    const chainId = await provider.request({ method: "eth_chainId" });
    const chainIdNumber = parseInt(chainId, 16);

    return {
      address,
      chainId: chainIdNumber,
      provider,
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error("İstifadəçi bağlantı istəyini rədd etdi");
    }
    throw error;
  }
};

// Get current connected account
export const getCurrentAccount = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }

    const provider = getEthereumProvider();
    const accounts = await provider.request({ method: "eth_accounts" });

    if (accounts.length === 0) {
      return null;
    }

    return accounts[0];
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
};

// Disconnect wallet (just clear local storage, actual disconnect is handled by MetaMask)
export const disconnectWallet = () => {
  // MetaMask doesn't have a disconnect method, so we just clear local data
  return true;
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  const provider = getEthereumProvider();
  provider.on("accountsChanged", callback);

  return () => {
    provider.removeListener("accountsChanged", callback);
  };
};

// Listen for chain changes
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  const provider = getEthereumProvider();
  provider.on("chainChanged", callback);

  return () => {
    provider.removeListener("chainChanged", callback);
  };
};

// Get wallet balance in ETH
export const getWalletBalance = async (address) => {
  try {
    if (!isMetaMaskInstalled() || !address) {
      return "0.00";
    }

    const provider = getEthereumProvider();
    const balance = await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    // Convert from Wei to ETH (1 ETH = 10^18 Wei)
    const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
    return balanceInEth.toFixed(4);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return "0.00";
  }
};

// Get NFT list for an address
export const getNFTList = async (address, chainId = 11155111) => {
  try {
    if (!address) {
      return [];
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return [];
    }

    const apiKey = "KTGPVWIHA6FQ4MACCDF1X7R6SMZECNPH77";
    if (!apiKey) {
      return [];
    }

    const baseUrl = "https://api.etherscan.io/v2/api";
    const etherscanChainId =
      chainId === 11155111 ? 11155111 : chainId === 5 ? 5 : 1;

    const response = await fetch(
      `${baseUrl}?chainid=${etherscanChainId}&module=account&action=tokennfttx&address=${address}&page=1&offset=20&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.status === "0") {
      if (
        data.message === "No transactions found" ||
        data.result === null ||
        data.result === "" ||
        (Array.isArray(data.result) && data.result.length === 0)
      ) {
        return [];
      }
      return [];
    }

    if (!data.result || !Array.isArray(data.result)) {
      return [];
    }

    const nfts = data.result.map((nft) => ({
      tokenAddress: nft.contractAddress,
      tokenId: nft.tokenID,
      tokenName: nft.tokenName || "Unknown",
      tokenSymbol: nft.tokenSymbol || "",
      tokenURI: nft.tokenURI || "",
      blockNumber: parseInt(nft.blockNumber, 10),
      timestamp:
        typeof nft.timeStamp === "string"
          ? parseInt(nft.timeStamp, 10) * 1000
          : nft.timeStamp * 1000,
    }));

    return nfts;
  } catch (error) {
    console.error("Error getting NFT list:", error);
    return [];
  }
};

// Get transaction history
export const getTransactionHistory = async (address, chainId = 11155111) => {
  try {
    if (!address) {
      return [];
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.warn("Invalid Ethereum address format");
      return [];
    }

    const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
    if (!apiKey) {
      console.warn(
        "Etherscan API key not found. Please set REACT_APP_ETHERSCAN_API_KEY in your .env file. " +
          "Get a free API key at https://etherscan.io/apis"
      );
      return [];
    }

    const baseUrl = "https://api.etherscan.io/v2/api";
    const etherscanChainId =
      chainId === 11155111 ? 11155111 : chainId === 5 ? 5 : 1;
    const response = await fetch(
      `${baseUrl}?chainid=${etherscanChainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "0") {
      if (
        data.message === "No transactions found" ||
        data.result === null ||
        data.result === "" ||
        (Array.isArray(data.result) && data.result.length === 0)
      ) {
        return [];
      }

      const errorMessage =
        data.message || data.result || "Failed to fetch transactions";

      if (
        errorMessage.includes("Invalid API Key") ||
        errorMessage === "NOTOK" ||
        errorMessage.includes("invalid API key")
      ) {
        console.warn(
          "Etherscan API Key issue. Please check your REACT_APP_ETHERSCAN_API_KEY in .env file. " +
            "Get a free API key at https://etherscan.io/apis"
        );
        return [];
      }

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Max rate limit") ||
        errorMessage.includes("rateLimit")
      ) {
        console.warn(
          "Etherscan API rate limit exceeded. Please try again later."
        );
        return [];
      }

      if (errorMessage.includes("Invalid address format")) {
        console.warn("Invalid wallet address format");
        return [];
      }

      console.warn("Etherscan API error:", {
        message: data.message,
        result: data.result,
        status: data.status,
        fullResponse: data,
      });

      return [];
    }

    if (!data.result || !Array.isArray(data.result)) {
      return [];
    }

    const transactions = data.result.map((tx) => {
      let valueInEth;
      if (typeof tx.value === "string") {
        if (tx.value.startsWith("0x")) {
          valueInEth = parseInt(tx.value, 16) / Math.pow(10, 18);
        } else {
          valueInEth = parseInt(tx.value, 10) / Math.pow(10, 18);
        }
      } else {
        valueInEth = tx.value / Math.pow(10, 18);
      }

      const isReceived = tx.to.toLowerCase() === address.toLowerCase();

      const timestamp =
        typeof tx.timeStamp === "string"
          ? tx.timeStamp.startsWith("0x")
            ? parseInt(tx.timeStamp, 16) * 1000
            : parseInt(tx.timeStamp, 10) * 1000
          : tx.timeStamp * 1000;

      let status = "pending";
      if (tx.txreceipt_status !== undefined && tx.txreceipt_status !== null) {
        const receiptStatus =
          typeof tx.txreceipt_status === "string"
            ? parseInt(tx.txreceipt_status, 10)
            : tx.txreceipt_status;
        status = receiptStatus === 1 ? "success" : "failed";
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valueInEth.toFixed(4),
        timestamp: timestamp,
        status: status,
        type: isReceived ? "received" : "sent",
        blockNumber:
          typeof tx.blockNumber === "string" && tx.blockNumber.startsWith("0x")
            ? parseInt(tx.blockNumber, 16)
            : parseInt(tx.blockNumber, 10),
        gasUsed:
          typeof tx.gasUsed === "string" && tx.gasUsed.startsWith("0x")
            ? parseInt(tx.gasUsed, 16)
            : parseInt(tx.gasUsed, 10),
        gasPrice:
          typeof tx.gasPrice === "string" && tx.gasPrice.startsWith("0x")
            ? parseInt(tx.gasPrice, 16)
            : parseInt(tx.gasPrice, 10),
      };
    });

    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return [];
  }
};

// Get supported networks
export const getSupportedNetworks = () => {
  return [
    {
      chainId: 11155111,
      name: "Sepolia Testnet",
      symbol: "ETH",
      rpcUrl: "https://rpc.sepolia.org",
      explorerUrl: "https://sepolia.etherscan.io",
      icon: "🔷",
    },
    {
      chainId: 1,
      name: "Ethereum Mainnet",
      symbol: "ETH",
      rpcUrl: "https://eth.llamarpc.com",
      explorerUrl: "https://etherscan.io",
      icon: "💎",
    },
    {
      chainId: 5,
      name: "Goerli Testnet",
      symbol: "ETH",
      rpcUrl: "https://goerli.infura.io/v3/",
      explorerUrl: "https://goerli.etherscan.io",
      icon: "🔵",
    },
  ];
};

// Switch to a specific network
export const switchNetwork = async (chainId) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask yüklənmiş deyil. Zəhmət olmasa MetaMask genişləndirməsini quraşdırın."
      );
    }

    const provider = getEthereumProvider();
    const chainIdHex = `0x${chainId.toString(16)}`;

    const networks = getSupportedNetworks();
    const network = networks.find((n) => n.chainId === chainId);

    if (!network) {
      throw new Error("Dəstəklənən şəbəkə deyil");
    }

    try {
      // Try to switch to the network
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }

    return true;
  } catch (error) {
    if (error.code === 4001) {
      throw new Error("İstifadəçi şəbəkə dəyişikliyini rədd etdi");
    }
    throw error;
  }
};
