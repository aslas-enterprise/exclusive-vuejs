<template>
  <div class="categories-sidebar">
    <div class="categories-container">
      <h3 class="categories-title">Exclusive</h3>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p>Loading categories...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <v-icon icon="mdi-alert-circle" size="32" color="error" />
        <p>{{ error }}</p>
        <v-btn @click="categoriesStore.fetchCategories({ isActive: true })" color="primary" variant="outlined" size="small">
          Retry
        </v-btn>
      </div>

      <!-- Categories List -->
      <ul v-else-if="categories.length > 0" class="categories-list">
        <li 
          v-for="category in categories" 
          :key="category.id" 
          class="category-item"
        >
          <div class="category-header" @click="toggleCategory(category.id)">
            <span class="category-name">{{ category.name }}</span>
            <v-icon 
              :icon="category.isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'" 
              size="16" 
              class="category-arrow"
              :class="{ 'rotated': category.isExpanded }"
            />
          </div>
          
          <!-- Subcategories Dropdown -->
          <transition name="subcategory-dropdown">
            <div v-if="category.isExpanded" class="subcategories-dropdown">
              <ul class="subcategories-list">
                <li 
                  v-for="subcategory in category.subcategories" 
                  :key="subcategory.id" 
                  class="subcategory-item"
                  @click="selectSubcategory(category.id, subcategory.id)"
                >
                  <span class="subcategory-name">{{ subcategory.name }}</span>
                </li>
              </ul>
            </div>
          </transition>
        </li>
      </ul>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <v-icon icon="mdi-folder-outline" size="32" color="grey" />
        <p>No categories available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCategoriesStore } from '../../../stores/modules/categories';



const categoriesStore = useCategoriesStore();

// Track expanded state separately
const expandedCategories = ref<Set<string>>(new Set());

// Fetch categories on component mount
onMounted(async () => {
  try {
    await categoriesStore.fetchCategories({ isActive: true });
  } catch (error) {
    // Handle error silently or emit an event
  }
});

// Get categories from store
const categories = computed(() => {
  return categoriesStore.activeCategories.map(category => ({
    ...category,
    isExpanded: expandedCategories.value.has(category.id),
    subcategories: category.subcategories || []
  }));
});

// Loading state
const loading = computed(() => categoriesStore.loading);

// Error state
const error = computed(() => categoriesStore.error);

const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    // If clicking the same category, close it
    expandedCategories.value.delete(categoryId);
  } else {
    // If clicking a different category, close all others and open this one
    expandedCategories.value.clear(); // Close all categories
    expandedCategories.value.add(categoryId); // Open only this category
  }
};

const selectSubcategory = (categoryId: string, subcategoryId: string) => {
  // Handle subcategory selection
  // You can emit an event here or call a function to handle navigation
  // For now, just log the selection
  // console.log(`Selected: Category ${categoryId}, Subcategory ${subcategoryId}`);
};
</script>

<style scoped>
.categories-sidebar {
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

.categories-container {
  padding: 20px;
}

.categories-title {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin-bottom: 24px;
}

.categories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-header:hover {
  background: #f8f8f8;
  padding-left: 8px;
}

.category-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.category-arrow {
  color: #999;
  transition: transform 0.3s ease;
}

.category-arrow.rotated {
  transform: rotate(90deg);
}

.subcategories-dropdown {
  position: absolute;
  left: 100%;
  top: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.subcategories-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: white;
}

.subcategory-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}

.subcategory-item:hover {
  background: #f8f8f8;
  padding-left: 20px;
}

.subcategory-item:last-child {
  border-bottom: none;
}

.subcategory-name {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

/* Transition animations */
.subcategory-dropdown-enter-active,
.subcategory-dropdown-leave-active {
  transition: all 0.2s ease;
}

.subcategory-dropdown-enter-from,
.subcategory-dropdown-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.subcategory-dropdown-enter-to,
.subcategory-dropdown-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Loading, Error, and Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.error-state .v-btn {
  margin-top: 8px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .categories-sidebar {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .categories-container {
    padding: 16px;
  }
  
  .categories-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .subcategories-dropdown {
    position: static;
    left: auto;
    top: auto;
    margin-top: 8px;
    margin-left: 20px;
    box-shadow: none;
    border: 1px solid #e0e0e0;
    border-radius: 0px;
    min-width: auto;
  }
}

@media (max-width: 600px) {
  .categories-container {
    padding: 12px;
  }
  
  .category-header {
    padding: 10px 0;
  }
  
  .subcategory-item {
    padding: 6px 0 6px 16px;
  }
  
  .subcategory-item:hover {
    padding-left: 20px;
  }
}
</style>
