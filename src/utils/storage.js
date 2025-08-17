import config from '../config/environment';

class StorageManager {
  constructor() {
    this.storage = window.localStorage;
    this.keys = config.storage;
  }

  // Set item with validation
  set(key, value) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      this.storage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting storage item:', error);
      return false;
    }
  }

  // Get item with parsing
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return defaultValue;
      
      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error('Error getting storage item:', error);
      return defaultValue;
    }
  }

  // Remove item
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing storage item:', error);
      return false;
    }
  }

  // Clear all items
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Check if key exists
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  // Get all keys
  getAllKeys() {
    return Object.keys(this.storage);
  }

  // Auth specific methods
  setAuthToken(token) {
    return this.set(this.keys.jwtToken, token);
  }

  getAuthToken() {
    return this.get(this.keys.jwtToken);
  }

  removeAuthToken() {
    return this.remove(this.keys.jwtToken);
  }

  setUserRole(role) {
    return this.set(this.keys.userRole, role);
  }

  getUserRole() {
    return this.get(this.keys.userRole);
  }

  setVoterData(data) {
    const success = this.set(this.keys.voterCCCD, data.cccd) &&
                   this.set(this.keys.userName, data.fullName) &&
                   this.set(this.keys.isVoter, 'true');
    
    if (data.walletAddress) {
      this.set(this.keys.walletAddress, data.walletAddress);
    }
    
    return success;
  }

  setAdminData(data) {
    const success = this.set(this.keys.adminCCCD, data.cccd) &&
                   this.set(this.keys.userName, data.name) &&
                   this.set(this.keys.isAdmin, 'true');
    
    if (data.isSuperAdmin) {
      this.set(this.keys.isSuperAdmin, 'true');
    }
    
    return success;
  }

  clearUserData() {
    const keysToRemove = [
      this.keys.jwtToken,
      this.keys.userRole,
      this.keys.voterCCCD,
      this.keys.adminCCCD,
      this.keys.userName,
      this.keys.walletAddress,
      this.keys.isAdmin,
      this.keys.isVoter,
      this.keys.isSuperAdmin,
    ];

    keysToRemove.forEach(key => this.remove(key));
  }

  // Check authentication status
  isAuthenticated() {
    return this.has(this.keys.jwtToken);
  }

  isVoter() {
    return this.get(this.keys.isVoter) === 'true';
  }

  isAdmin() {
    return this.get(this.keys.isAdmin) === 'true';
  }

  isSuperAdmin() {
    return this.get(this.keys.isSuperAdmin) === 'true';
  }

  // Get current user info
  getCurrentUser() {
    if (this.isVoter()) {
      return {
        type: 'voter',
        cccd: this.get(this.keys.voterCCCD),
        name: this.get(this.keys.userName),
        walletAddress: this.get(this.keys.walletAddress),
      };
    } else if (this.isAdmin()) {
      return {
        type: 'admin',
        cccd: this.get(this.keys.adminCCCD),
        name: this.get(this.keys.userName),
        isSuperAdmin: this.isSuperAdmin(),
      };
    }
    return null;
  }

  // Session management
  setSessionData(key, data) {
    return this.set(`session_${key}`, data);
  }

  getSessionData(key) {
    return this.get(`session_${key}`);
  }

  removeSessionData(key) {
    return this.remove(`session_${key}`);
  }

  // Cache management
  setCache(key, data, ttl = 3600000) { // Default 1 hour
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    return this.set(`cache_${key}`, cacheData);
  }

  getCache(key) {
    const cacheData = this.get(`cache_${key}`);
    if (!cacheData) return null;

    const { data, timestamp, ttl } = cacheData;
    const now = Date.now();

    if (now - timestamp > ttl) {
      this.remove(`cache_${key}`);
      return null;
    }

    return data;
  }

  clearCache() {
    const keys = this.getAllKeys();
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        this.remove(key);
      }
    });
  }
}

// Create singleton instance
const storage = new StorageManager();

export default storage;
