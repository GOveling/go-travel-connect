// Unified encryption system for all sensitive data across the application
// Uses AES-256-GCM encryption with user-specific keys

import {
  generateLocalKey,
  encryptLocalData,
  decryptLocalData,
  getUserPin,
  getSalt,
  type EncryptedData
} from "./localEncryption";

export enum DataSensitivityLevel {
  LOW = "low",        // Non-critical data (preferences, UI settings)
  MEDIUM = "medium",  // Personal data (name, email, basic profile)
  HIGH = "high",      // Sensitive data (financial, location, documents)
  CRITICAL = "critical" // Highly sensitive (passwords, payment info)
}

export interface EncryptedDataContainer {
  encryptedData: EncryptedData;
  sensitivityLevel: DataSensitivityLevel;
  dataType: string;
  version: string;
  createdAt: string;
  lastAccessedAt?: string;
}

export interface EncryptionOptions {
  sensitivityLevel: DataSensitivityLevel;
  dataType: string;
  useStrongPin?: boolean;
}

class UnifiedEncryptionService {
  private keyCache = new Map<string, CryptoKey>();
  private readonly ENCRYPTION_VERSION = "1.0";

  // Generate encryption key based on sensitivity level
  async generateKey(
    sensitivityLevel: DataSensitivityLevel,
    useStrongPin: boolean = false
  ): Promise<CryptoKey> {
    const cacheKey = `${sensitivityLevel}_${useStrongPin}`;
    
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    const pin = getUserPin();
    if (!pin) {
      throw new Error('PIN required for encryption');
    }

    const salt = getSalt();
    const key = await generateLocalKey(pin, salt);
    
    this.keyCache.set(cacheKey, key);
    return key;
  }

  // Encrypt any type of data with appropriate security level
  async encryptData<T>(
    data: T,
    options: EncryptionOptions
  ): Promise<EncryptedDataContainer> {
    const key = await this.generateKey(
      options.sensitivityLevel,
      options.useStrongPin
    );

    const serializedData = JSON.stringify(data);
    const encryptedData = await encryptLocalData(serializedData, key);

    return {
      encryptedData,
      sensitivityLevel: options.sensitivityLevel,
      dataType: options.dataType,
      version: this.ENCRYPTION_VERSION,
      createdAt: new Date().toISOString(),
    };
  }

  // Decrypt data with security validation
  async decryptData<T>(
    container: EncryptedDataContainer,
    expectedType?: string
  ): Promise<T> {
    if (expectedType && container.dataType !== expectedType) {
      throw new Error(`Data type mismatch. Expected: ${expectedType}, Got: ${container.dataType}`);
    }

    const key = await this.generateKey(container.sensitivityLevel);
    const decryptedString = await decryptLocalData(container.encryptedData, key);
    
    // Update last accessed time
    container.lastAccessedAt = new Date().toISOString();
    
    return JSON.parse(decryptedString);
  }

  // Clear encryption cache (for logout/security)
  clearKeyCache(): void {
    this.keyCache.clear();
  }

  // Validate data integrity
  validateContainer(container: EncryptedDataContainer): boolean {
    return !!(
      container.encryptedData &&
      container.sensitivityLevel &&
      container.dataType &&
      container.version &&
      container.createdAt
    );
  }
}

// Singleton instance
export const encryptionService = new UnifiedEncryptionService();

// Convenience functions for common encryption operations
export const encryptProfileData = (data: any) =>
  encryptionService.encryptData(data, {
    sensitivityLevel: DataSensitivityLevel.MEDIUM,
    dataType: "profile"
  });

export const encryptLocationData = (data: any) =>
  encryptionService.encryptData(data, {
    sensitivityLevel: DataSensitivityLevel.HIGH,
    dataType: "location"
  });

export const encryptFinancialData = (data: any) =>
  encryptionService.encryptData(data, {
    sensitivityLevel: DataSensitivityLevel.HIGH,
    dataType: "financial"
  });

export const encryptDocumentData = (data: any) =>
  encryptionService.encryptData(data, {
    sensitivityLevel: DataSensitivityLevel.CRITICAL,
    dataType: "document"
  });

export const decryptProfileData = <T>(container: EncryptedDataContainer) =>
  encryptionService.decryptData<T>(container, "profile");

export const decryptLocationData = <T>(container: EncryptedDataContainer) =>
  encryptionService.decryptData<T>(container, "location");

export const decryptFinancialData = <T>(container: EncryptedDataContainer) =>
  encryptionService.decryptData<T>(container, "financial");

export const decryptDocumentData = <T>(container: EncryptedDataContainer) =>
  encryptionService.decryptData<T>(container, "document");