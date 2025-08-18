<script setup lang="ts">
// Contact view component
</script>

<template>
  <div class="contact-container">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-6">
            <h1 class="text-h3 text-center mb-6">Contact Us</h1>
            <p class="text-body-1 text-center mb-8">
              Get in touch with us for any questions or support.
            </p>
            
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h5 mb-4">Contact Information</h3>
                <div class="mb-3">
                  <v-icon icon="mdi-email" class="me-2" />
                  <span>support@exclusive.com</span>
                </div>
                <div class="mb-3">
                  <v-icon icon="mdi-phone" class="me-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div class="mb-3">
                  <v-icon icon="mdi-map-marker" class="me-2" />
                  <span>123 Main Street, City, Country</span>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <h3 class="text-h5 mb-4">Send us a message</h3>
                <v-form>
                  <v-text-field
                    label="Name"
                    variant="outlined"
                    class="mb-3"
                  />
                  <v-text-field
                    label="Email"
                    type="email"
                    variant="outlined"
                    class="mb-3"
                  />
                  <v-textarea
                    label="Message"
                    variant="outlined"
                    rows="4"
                    class="mb-4"
                  />
                  <v-btn
                    color="primary"
                    variant="flat"
                    block
                  >
                    Send Message
                  </v-btn>
                </v-form>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.contact-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
