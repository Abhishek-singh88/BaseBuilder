import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect } from 'react'

export function useWalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // Auto-connect if user already has a connected wallet
  useEffect(() => {
    const miniAppConnector = connectors[0]
    if (miniAppConnector && !isConnected && !isPending) {
      // Only auto-connect if we're in a Farcaster environment
      if (typeof window !== 'undefined' && window.parent !== window) {
        connect({ connector: miniAppConnector })
      }
    }
  }, [connect, connectors, isConnected, isPending])

  const handleConnect = () => {
    const miniAppConnector = connectors[0]
    if (miniAppConnector) {
      connect({ connector: miniAppConnector })
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return {
    address,
    isConnected,
    connect: handleConnect,
    disconnect: handleDisconnect,
    isPending
  }
}