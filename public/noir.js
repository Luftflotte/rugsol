// Noir.js - Wallet Connection Script
// Handles wallet connections with effect animations

(function() {
  'use strict';

  class NoirConnector {
    constructor() {
      this.connected = false;
      this.wallet = null;
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.checkExistingConnection();
    }

    setupEventListeners() {
      // Find all buttons with noir-connect class
      const buttons = document.querySelectorAll('.noir-connect');

      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.connectWallet();
        });
      });
    }

    async checkExistingConnection() {
      // Check if wallet is already connected
      if (typeof window !== 'undefined' && window.solana) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          this.connected = true;
          this.wallet = response.publicKey.toString();
          this.updateButtonStates();
        } catch (err) {
          // No existing connection
          this.connected = false;
        }
      }
    }

    async connectWallet() {
      try {
        // Check if Solana wallet is available
        if (!window.solana) {
          console.warn('Solana wallet not found. Please install Phantom or compatible wallet.');
          this.showNotification('Install a Solana wallet (Phantom, Solflare, etc.)', 'error');
          return;
        }

        // Connect to wallet
        const response = await window.solana.connect();
        this.connected = true;
        this.wallet = response.publicKey.toString();

        // Update UI
        this.updateButtonStates();
        this.showNotification(`Connected: ${this.wallet.slice(0, 6)}...`, 'success');

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('walletConnected', {
          detail: { wallet: this.wallet }
        }));

      } catch (err) {
        console.error('Wallet connection failed:', err);
        this.showNotification('Failed to connect wallet', 'error');
      }
    }

    disconnectWallet() {
      if (window.solana) {
        window.solana.disconnect();
        this.connected = false;
        this.wallet = null;
        this.updateButtonStates();
        this.showNotification('Wallet disconnected', 'info');

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
      }
    }

    updateButtonStates() {
      const buttons = document.querySelectorAll('.noir-connect');

      buttons.forEach(button => {
        if (this.connected) {
          button.textContent = `Connected: ${this.wallet.slice(0, 6)}...`;
          button.classList.add('connected');
          button.disabled = false;
          button.removeEventListener('click', this.connectWallet);
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.disconnectWallet();
          });
        } else {
          button.textContent = 'Connect Wallet';
          button.classList.remove('connected');
          button.disabled = false;
        }
      });
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `noir-notification noir-notification-${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        background-color: ${this.getNotificationColor(type)};
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      `;

      document.body.appendChild(notification);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    getNotificationColor(type) {
      const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
      };
      return colors[type] || colors.info;
    }

    getWalletAddress() {
      return this.wallet;
    }

    isConnected() {
      return this.connected;
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .noir-connect {
      transition: all 0.3s ease;
    }

    .noir-connect.connected {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.5);
      color: #10b981;
    }

    .noir-connect:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Initialize Noir Connector when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NoirConnector = new NoirConnector();
    });
  } else {
    window.NoirConnector = new NoirConnector();
  }

  // Export for use in modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoirConnector;
  }
})();
