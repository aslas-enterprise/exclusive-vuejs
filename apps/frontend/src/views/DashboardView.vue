<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/index';

const router = useRouter();
const authStore = useAuthStore();
const user = authStore.getUser;

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="dashboard-container">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-6">
            <div class="text-center mb-6">
              <v-avatar size="80" class="mb-4">
                <v-img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user?.name || 'User'"
                />
                                  <span v-else class="text-h2 text-black">
                    {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                  </span>
              </v-avatar>
              <h1 class="text-h4 mb-2">Welcome, {{ user?.name || 'User' }}!</h1>
              <p class="text-body-1 text-medium-emphasis">
                You are successfully logged in to your dashboard.
              </p>
            </div>

            <v-divider class="mb-6" />

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-h6 mb-3">Account Information</h3>
                  <div class="mb-2">
                    <strong>Name:</strong> {{ user?.name || 'N/A' }}
                  </div>
                  <div class="mb-2">
                    <strong>Email:</strong> {{ user?.email || 'N/A' }}
                  </div>
                  <div class="mb-2">
                    <strong>Member since:</strong> 
                    {{ user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-h6 mb-3">Quick Actions</h3>
                  <v-btn
                    to="/profile"
                    color="primary"
                    variant="flat"
                    block
                    class="mb-3"
                  >
                    Edit Profile
                  </v-btn>
                  <v-btn
                    @click="handleLogout"
                    color="error"
                    variant="outlined"
                    block
                  >
                    Logout
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
