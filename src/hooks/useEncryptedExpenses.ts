// Encrypted financial data management for trip expenses
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  encryptFinancialData,
  decryptFinancialData,
  type EncryptedDataContainer
} from "@/utils/unifiedEncryption";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export interface EncryptedExpenseData {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string[];
  splitBetween: string[];
  category?: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface OfflineExpense {
  id: string;
  encryptedExpense: EncryptedDataContainer;
  isOffline: boolean;
  lastSync?: string;
}

export const useEncryptedExpenses = (tripId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<EncryptedExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Save encrypted expense offline
  const saveExpenseOffline = async (expenseData: EncryptedExpenseData): Promise<void> => {
    if (!user?.id) return;

    try {
      const encryptedContainer = await encryptFinancialData(expenseData);
      const offlineExpense: OfflineExpense = {
        id: expenseData.id,
        encryptedExpense: encryptedContainer,
        isOffline: true,
        lastSync: new Date().toISOString()
      };

      const storageKey = `encrypted_expenses_${user.id}_${tripId || 'general'}`;
      const existingExpenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const updatedExpenses = [...existingExpenses, offlineExpense];
      localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));

      logSecurityEvent("Expense saved offline with encryption", { 
        userId: user.id,
        tripId: expenseData.tripId,
        expenseId: expenseData.id,
        amount: expenseData.amount 
      });
    } catch (error) {
      logSecurityEvent("Failed to save encrypted expense offline", { 
        userId: user.id,
        error: error.message 
      });
      throw error;
    }
  };

  // Load encrypted expenses from offline storage
  const loadExpensesOffline = async (): Promise<EncryptedExpenseData[]> => {
    if (!user?.id) return [];

    try {
      const storageKey = `encrypted_expenses_${user.id}_${tripId || 'general'}`;
      const offlineData = localStorage.getItem(storageKey);
      if (!offlineData) return [];

      const offlineExpenses: OfflineExpense[] = JSON.parse(offlineData);
      const decryptedExpenses: EncryptedExpenseData[] = [];

      for (const expense of offlineExpenses) {
        try {
          const decryptedExpense = await decryptFinancialData<EncryptedExpenseData>(
            expense.encryptedExpense
          );
          decryptedExpenses.push(decryptedExpense);
        } catch (decryptError) {
          logSecurityEvent("Failed to decrypt expense", { 
            userId: user.id,
            expenseId: expense.id,
            error: decryptError.message 
          });
        }
      }

      logSecurityEvent("Expenses loaded from encrypted offline storage", { 
        userId: user.id,
        tripId,
        count: decryptedExpenses.length 
      });

      return decryptedExpenses;
    } catch (error) {
      logSecurityEvent("Failed to load encrypted expenses offline", { 
        userId: user.id,
        tripId,
        error: error.message 
      });
      return [];
    }
  };

  // Add a new expense with encryption
  const addExpense = async (expenseData: Omit<EncryptedExpenseData, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (!user?.id || !isValidUser(user.id)) {
      throw new Error("Invalid user");
    }

    try {
      setLoading(true);

      const newExpense: EncryptedExpenseData = {
        ...expenseData,
        id: crypto.randomUUID(),
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!isOfflineMode && navigator.onLine && tripId) {
        // Try to save online first
        const { error } = await supabase.from('trip_expenses').insert({
          trip_id: newExpense.tripId,
          description: newExpense.description,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy,
          split_between: newExpense.splitBetween,
          created_by: user.id
        });

        if (error) {
          throw error;
        }

        logSecurityEvent("Expense saved online", { 
          userId: user.id,
          tripId: newExpense.tripId,
          amount: newExpense.amount 
        });
      }

      // Always save encrypted copy offline
      await saveExpenseOffline(newExpense);
      
      // Update local state
      setExpenses(prev => [...prev, newExpense]);

      toast({
        title: "Gasto registrado",
        description: `${newExpense.description} - $${newExpense.amount} guardado de forma segura`,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar gasto';
      setError(errorMessage);
      logSecurityEvent("Expense creation failed", { 
        userId: user.id,
        tripId,
        error: errorMessage 
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load expenses (online or offline)
  const loadExpenses = async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      let expenseData: EncryptedExpenseData[] = [];

      if (isOfflineMode || !navigator.onLine) {
        // Load from encrypted offline storage
        expenseData = await loadExpensesOffline();
      } else {
        // Try to load from online first
        try {
          let query = supabase
            .from('trip_expenses')
            .select('*')
            .order('created_at', { ascending: false });

          if (tripId) {
            query = query.eq('trip_id', tripId);
          }

          const { data, error } = await query;

          if (error) throw error;

          expenseData = (data || []).map(expense => ({
            id: expense.id,
            tripId: expense.trip_id,
            description: expense.description,
            amount: expense.amount,
            currency: 'USD', // Default currency
            paidBy: Array.isArray(expense.paid_by) ? expense.paid_by.map(String) : [],
            splitBetween: Array.isArray(expense.split_between) ? expense.split_between.map(String) : [],
            date: expense.created_at,
            createdBy: expense.created_by,
            createdAt: expense.created_at,
            updatedAt: expense.updated_at
          }));

          logSecurityEvent("Expenses loaded online", { 
            userId: user.id,
            tripId,
            count: expenseData.length 
          });
        } catch (onlineError) {
          // Fallback to offline
          expenseData = await loadExpensesOffline();
          if (expenseData.length > 0) {
            toast({
              title: "Modo Offline",
              description: "Usando gastos almacenados localmente",
              variant: "default"
            });
          }
        }
      }

      setExpenses(expenseData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar gastos';
      setError(errorMessage);
      logSecurityEvent("Failed to load expenses", { 
        userId: user.id,
        tripId,
        error: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate expense summary
  const getExpenseSummary = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const userExpenses = expenses.filter(expense => expense.createdBy === user?.id);
    const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      total,
      userTotal,
      count: expenses.length,
      userCount: userExpenses.length
    };
  };

  // Sync offline expenses when back online
  const syncOfflineExpenses = async (): Promise<boolean> => {
    if (!user?.id || !navigator.onLine || !tripId) return false;

    try {
      const offlineExpenses = await loadExpensesOffline();
      let syncCount = 0;

      for (const expense of offlineExpenses) {
        try {
          const { error } = await supabase.from('trip_expenses').insert({
            trip_id: expense.tripId,
            description: expense.description,
            amount: expense.amount,
            paid_by: expense.paidBy,
            split_between: expense.splitBetween,
            created_by: expense.createdBy
          });

          if (!error) {
            syncCount++;
          }
        } catch (syncError) {
          logSecurityEvent("Expense sync failed", { 
            userId: user.id,
            expenseId: expense.id,
            error: syncError.message 
          });
        }
      }

      if (syncCount > 0) {
        // Clear offline data after successful sync
        const storageKey = `encrypted_expenses_${user.id}_${tripId}`;
        localStorage.removeItem(storageKey);
        
        logSecurityEvent("Offline expenses synced", { 
          userId: user.id,
          tripId,
          syncedCount: syncCount 
        });

        toast({
          title: "Sincronización completa",
          description: `${syncCount} gastos sincronizados`,
        });
      }

      return true;
    } catch (error) {
      logSecurityEvent("Expense sync failed", { 
        userId: user.id,
        tripId,
        error: error.message 
      });
      return false;
    }
  };

  // Toggle offline mode
  const toggleOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    if (offline) {
      toast({
        title: "Modo Offline Activado",
        description: "Gastos con encriptación AES-256 local",
      });
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [user, tripId, isOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isOfflineMode) {
        syncOfflineExpenses();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isOfflineMode, user, tripId]);

  return {
    expenses,
    loading,
    error,
    isOfflineMode,
    addExpense,
    loadExpenses,
    getExpenseSummary,
    toggleOfflineMode,
    syncOfflineExpenses
  };
};