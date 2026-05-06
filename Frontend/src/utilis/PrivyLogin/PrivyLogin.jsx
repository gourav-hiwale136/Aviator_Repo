import React, { useEffect, useState, useRef, useContext } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import Style from './PrivyLogin.module.scss';
// import { AuthContext } from '../../../context/AuthContext';
import { usePrivyLogin, useWeb3Login, deepDecimalFix } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

export default function PrivyLogin() {
  const { login, ready, user, logout, authenticated } = usePrivy();
  const { login: authLogin, refreshCurrentUser, logout: authLogout } = useContext(AuthContext);
  const { wallets } = useWallets();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const hasProcessedAuthRef = useRef(false);
  const lastUserIdRef = useRef(null);

  const privyLoginMutation = usePrivyLogin();
  const web3LoginMutation = useWeb3Login();

  const solanaWallet = wallets?.find(
    (wallet) =>
      wallet.chainId === 'solana' ||
      wallet.chainType === 'solana' ||
      wallet.walletClientType === 'privy' ||
      (wallet.accounts && wallet.accounts[0]?.chain === 'solana'),
  );

  const publicKey =
    solanaWallet?.address ||
    user?.wallet?.address ||
    (solanaWallet?.accounts && solanaWallet.accounts[0]?.address);

  useEffect(() => {
    if (!authenticated) {
      hasProcessedAuthRef.current = false;
      lastUserIdRef.current = null;
    }
  }, [authenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!authenticated || !user) {
      return;
    }

    const currentUserId = user.id || user.wallet?.address || user.email;

    if (hasProcessedAuthRef.current && lastUserIdRef.current === currentUserId) {
      return;
    }

    if (privyLoginMutation.isPending || web3LoginMutation.isPending) {
      return;
    }

    const verifyUser = async () => {
      try {
        if (user?.wallet?.address) {
          // WEB3 WALLET LOGIN - NO PRIVY TOKEN NEEDED
          const walletAddress = user.wallet.address;
          const message = `Login to hybrid: ${Date.now()}`;
          let signature = null;

          if (solanaWallet?.signMessage) {
            try {
              const encodedMessage = new TextEncoder().encode(message);
              const signatureBytes = await solanaWallet.signMessage(encodedMessage);
              signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
            } catch (signError) {
              console.error('Message signing failed:', signError);
            }
          }

          web3LoginMutation.mutate(
            {
              address: walletAddress,
              message,
              signature,
              referral: null,
            },
            {
              onSuccess: (response) => {
                if (response?.data?.token && response?.data?.user) {
                  const userData = deepDecimalFix(response.data.user || {});
                  authLogin(userData, response.data.token);

                  setTimeout(() => {
                    refreshCurrentUser();
                  }, 500);

                  toast.success('Wallet connected successfully');
                  hasProcessedAuthRef.current = true;
                  lastUserIdRef.current = currentUserId;
                }
              },
              onError: (error) => {
                console.error('Web3 login error:', error);
                toast.error('Wallet login failed. Please try again.');
                hasProcessedAuthRef.current = false;
              },
            },
          );
        }
      } catch (error) {
        console.error('Backend verification failed:', error);
        toast.error('Authentication failed');
        hasProcessedAuthRef.current = false;
      }
    };

    verifyUser();
  }, [authenticated, user]);

  const handleConnectClick = async () => {
    if (publicKey && authenticated) {
      setShowDropdown(!showDropdown);
      return;
    }

    try {
      setIsConnecting(true);
      await login();
    } catch (err) {
      console.error('Connection failed:', err);
      toast.error('Connection failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      authLogout();

      setShowDropdown(false);
      hasProcessedAuthRef.current = false;
      lastUserIdRef.current = null;

      toast.success('Disconnected successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to disconnect');
    }
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard
        .writeText(publicKey)
        .then(() => {
          toast.success('Address copied!');
          setShowDropdown(false);
        })
        .catch((err) => {
          console.error('Copy failed:', err);
          toast.error('Failed to copy address');
        });
    }
  };
console.log('showDropdown', showDropdown)
  return (
    <div
      className={Style.wallet_connect}
      style={{ position: 'relative', display: 'inline-block' }}
      ref={dropdownRef}
    >
      <button
        className={Style.btn_metamask}
        onClick={handleConnectClick}
        disabled={isConnecting || privyLoginMutation.isPending || web3LoginMutation.isPending}
      >
        {publicKey && authenticated ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
              {`${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`}
            </span>
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>▼</span>
          </>
        ) : isConnecting || privyLoginMutation.isPending || web3LoginMutation.isPending ? (
          'Connecting...'
        ) : (
          'Sign In'
        )}
      </button>

      {showDropdown && publicKey && authenticated && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '10px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Connected Wallet
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {publicKey}
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #f0f0f0',
            }}
            onClick={handleCopyAddress}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            <span>📋</span> Copy Address
          </div>

          <div
            style={{
              padding: '12px 16px',
              color: '#dc3545',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={handleDisconnect}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            <span>🚪</span> Disconnect
          </div>
        </div>
      )}
    </div>
  );
}
