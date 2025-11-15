import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import {
  connectWallet,
  isMetaMaskInstalled,
  getCurrentAccount,
  formatAddress,
  onAccountsChanged,
  onChainChanged,
  getWalletBalance,
  getTransactionHistory,
  getNFTList,
  getSupportedNetworks,
  switchNetwork,
} from "../services/walletService";

const WalletPage = () => {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.walletAddress) {
        setWalletAddress(parsedUser.walletAddress);
        setChainId(parsedUser.chainId);
      } else {
        getCurrentAccount().then((address) => {
          if (address) {
            setWalletAddress(address);
          }
        });
      }
    }

    const unsubscribeAccounts = onAccountsChanged((accounts) => {
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const updatedUser = {
            ...parsedUser,
            walletAddress: address,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setWalletAddress("");
      }
    });

    const unsubscribeChain = onChainChanged((chainId) => {
      const chainIdNumber = parseInt(chainId, 16);
      setChainId(chainIdNumber);
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const updatedUser = {
          ...parsedUser,
          chainId: chainIdNumber,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    });

    return () => {
      if (unsubscribeAccounts) unsubscribeAccounts();
      if (unsubscribeChain) unsubscribeChain();
    };
  }, []);

  const loadBalance = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoadingBalance(true);
    try {
      const walletBalance = await getWalletBalance(walletAddress);
      setBalance(walletBalance);
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [walletAddress]);

  const loadTransactions = useCallback(async () => {
    if (!walletAddress || !chainId) {
      setTransactions([]);
      return;
    }
    setIsLoadingTransactions(true);
    try {
      const txHistory = await getTransactionHistory(walletAddress, chainId);
      setTransactions(txHistory);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [walletAddress, chainId]);

  const loadNFTs = useCallback(async () => {
    if (!walletAddress || !chainId) {
      setNfts([]);
      return;
    }
    setIsLoadingNFTs(true);
    try {
      const nftList = await getNFTList(walletAddress, chainId);
      setNfts(nftList);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setNfts([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [walletAddress, chainId]);

  useEffect(() => {
    if (walletAddress) {
      loadBalance();
      loadTransactions();
      loadNFTs();
    } else {
      setBalance("0.00");
      setTransactions([]);
      setNfts([]);
    }
  }, [walletAddress, chainId, loadBalance, loadTransactions, loadNFTs]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!isMetaMaskInstalled()) {
        alert(
          "MetaMask yüklənmiş deyil. Zəhmət olmasa MetaMask genişləndirməsini quraşdırın.\n\nMetaMask yükləmək üçün: https://metamask.io"
        );
        setIsConnecting(false);
        return;
      }

      const walletData = await connectWallet();
      const { address, chainId: chain } = walletData;

      setWalletAddress(address);
      setChainId(chain);

      const updatedUser = {
        ...user,
        walletAddress: address,
        chainId: chain,
        provider: user?.provider || "wallet",
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      alert(error.message || "Cüzdan bağlantısında xəta baş verdi.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async (targetChainId) => {
    if (targetChainId === chainId) {
      setShowNetworkSelector(false);
      return;
    }

    setIsSwitchingNetwork(true);
    try {
      await switchNetwork(targetChainId);
      setChainId(targetChainId);
      const updatedUser = {
        ...user,
        chainId: targetChainId,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      await loadBalance();
      await loadTransactions();
      await loadNFTs();
    } catch (error) {
      alert(error.message || "Şəbəkə dəyişikliyində xəta baş verdi.");
    } finally {
      setIsSwitchingNetwork(false);
      setShowNetworkSelector(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress("");
    setChainId(null);
    const updatedUser = {
      ...user,
      walletAddress: null,
      chainId: null,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getChainName = (chainId) => {
    if (!chainId) return "Şəbəkə seçilməyib";
    const chains = {
      1: "Ethereum Mainnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
      137: "Polygon",
      80001: "Mumbai Testnet",
      56: "BSC",
      97: "BSC Testnet",
    };
    return chains[chainId] || `Chain ID: ${chainId}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {walletAddress ? (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Cüzdan balansı</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold">
                      {isLoadingBalance ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        `${balance} ETH`
                      )}
                    </p>
                    <button
                      onClick={loadBalance}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                      title="Yenilə"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-8 h-8" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-blue-100 text-xs font-mono">
                  {formatAddress(walletAddress)}
                </p>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şəbəkə
              </label>
              <button
                onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                disabled={isSwitchingNetwork}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-blue-500 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getSupportedNetworks().find((n) => n.chainId === chainId)
                      ?.icon || "🔷"}
                  </span>
                  <span className="font-medium text-gray-900">
                    {chainId ? getChainName(chainId) : "Şəbəkə seçilməyib"}
                  </span>
                </div>
                {isSwitchingNetwork ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {showNetworkSelector && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {getSupportedNetworks().map((network) => (
                    <button
                      key={network.chainId}
                      onClick={() => handleSwitchNetwork(network.chainId)}
                      className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                        network.chainId === chainId ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="text-lg">{network.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">
                          {network.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {network.symbol}
                        </p>
                      </div>
                      {network.chainId === chainId && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cüzdan ünvanı</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {formatAddress(walletAddress)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Kopyala"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {chainId && (
                    <a
                      href={
                        chainId === 11155111
                          ? `https://sepolia.etherscan.io/address/${walletAddress}`
                          : chainId === 5
                          ? `https://goerli.etherscan.io/address/${walletAddress}`
                          : `https://etherscan.io/address/${walletAddress}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Etherscan-də görüntülə"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Son əməliyyatlar</span>
                </h4>
                <button
                  onClick={loadTransactions}
                  disabled={isLoadingTransactions}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Yenilə"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-600 ${
                      isLoadingTransactions ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.map((tx, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === "received"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.type === "received" ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {tx.type === "received" ? "Alındı" : "Göndərildi"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono truncate">
                              {formatAddress(
                                tx.type === "received" ? tx.from : tx.to
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(tx.timestamp).toLocaleDateString(
                                "az-AZ",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-sm font-semibold ${
                              tx.type === "received"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tx.type === "received" ? "+" : "-"}
                            {tx.value} ETH
                          </p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            {tx.status === "success" ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : tx.status === "failed" ? (
                              <XCircle className="w-3 h-3 text-red-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-yellow-500" />
                            )}
                            <span className="text-xs text-gray-500">
                              {tx.status === "success"
                                ? "Tamamlandı"
                                : tx.status === "failed"
                                ? "Uğursuz"
                                : "Gözləyir"}
                            </span>
                          </div>
                          {chainId && (
                            <a
                              href={
                                chainId === 11155111
                                  ? `https://sepolia.etherscan.io/tx/${tx.hash}`
                                  : chainId === 5
                                  ? `https://goerli.etherscan.io/tx/${tx.hash}`
                                  : `https://etherscan.io/tx/${tx.hash}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>Etherscan-də görüntülə</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Əməliyyat tarixçəsi yoxdur
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>NFT-lər</span>
                </h4>
                <button
                  onClick={loadNFTs}
                  disabled={isLoadingNFTs}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Yenilə"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-600 ${
                      isLoadingNFTs ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              {isLoadingNFTs ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : nfts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nfts.map((nft, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {nft.tokenName}
                          </p>
                          <p className="text-xs text-gray-500">
                            #{nft.tokenId}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Kontrakt:</span>{" "}
                          {formatAddress(nft.tokenAddress)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(nft.timestamp).toLocaleDateString("az-AZ", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  NFT tapılmadı
                </div>
              )}
            </div>

            <button
              onClick={handleDisconnectWallet}
              className="w-full px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Cüzdanı ayır</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                MetaMask və ya digər Ethereum cüzdanınızı bağlayın
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-5 h-5" />
                <span>
                  {isConnecting ? "Bağlanır..." : "MetaMask ilə bağla"}
                </span>
              </button>
            </div>

            {!isMetaMaskInstalled() && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>MetaMask yüklənmiş deyil</strong>
                </p>
                <p className="text-xs text-yellow-700 mb-3">
                  MetaMask genişləndirməsini quraşdırmaq üçün:
                </p>
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>metamask.io</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WalletPage;
