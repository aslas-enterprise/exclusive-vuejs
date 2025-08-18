import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { flashSalesApi, type FlashSale } from '../../apis/flash-sales.api';

export const useFlashSalesStore = defineStore('flashSales', () => {
  // State
  const flashSales = ref<FlashSale[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeFlashSales = computed(() => flashSales.value.filter(sale => sale.isActive));
  
  const currentFlashSale = computed(() => {
    const now = new Date();
    return activeFlashSales.value.find(sale => {
      const startDate = new Date(sale.startDate);
      const endDate = new Date(sale.endDate);
      return startDate <= now && endDate >= now;
    });
  });

  const flashSaleItems = computed(() => {
    const current = currentFlashSale.value;
    return current?.items || [];
  });

  // Actions
  const fetchActiveFlashSales = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await flashSalesApi.getActiveFlashSales();
      flashSales.value = response;
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch flash sales';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getFlashSaleById = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await flashSalesApi.getFlashSaleById(id);
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch flash sale';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    flashSales,
    loading,
    error,
    
    // Getters
    activeFlashSales,
    currentFlashSale,
    flashSaleItems,
    
    // Actions
    fetchActiveFlashSales,
    getFlashSaleById,
    clearError,
  };
});
