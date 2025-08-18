<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/index';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.getUser);
const isLoading = ref(false);

// Form data
const name = ref(user.value?.name || '');
const email = ref(user.value?.email || '');

// Methods
const handleSave = async () => {
  isLoading.value = true;
  try {
    // TODO: Implement profile update API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    // Update user in store
    if (user.value) {
      authStore.updateUser({ name: name.value });
    }
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="profile-container">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="pa-6">
            <div class="d-flex align-center mb-6">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                @click="goBack"
                class="me-3"
              />
              <h1 class="text-h4">Edit Profile</h1>
            </div>

            <v-form @submit.prevent="handleSave">
              <v-text-field
                v-model="name"
                label="Name"
                variant="outlined"
                class="mb-4"
                required
              />

              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                variant="outlined"
                class="mb-6"
                disabled
                hint="Email cannot be changed"
                persistent-hint
              />

              <div class="d-flex gap-3">
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
                  Save Changes
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="goBack"
                  :disabled="isLoading"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
