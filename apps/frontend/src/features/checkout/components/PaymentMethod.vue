<template>
  <div class="payment-method">
    <div class="section-header">
      <div class="section-icon">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m2 0h5m-1 4l2-2m-2 2l-2-2m2-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2z" />
        </svg>
      </div>
      <h2 class="section-title">Payment Method</h2>
    </div>

    <v-form ref="form" @submit.prevent>
      <div class="payment-option">
        <v-radio-group
          v-model="selectedPaymentMethod"
          :rules="paymentMethodRules"
          required
          hide-details="auto"
        >
          <v-radio
            value="card"
            label="Credit/Debit Card"
            class="payment-radio"
          >
            <template #label>
              <div class="radio-label">
                <div class="payment-icon">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m2 0h5m-1 4l2-2m-2 2l-2-2m2-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2z" />
                  </svg>
                </div>
                <span class="payment-text">Credit/Debit Card</span>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </div>

      <div v-if="selectedPaymentMethod === 'card'" class="card-element-section">
        <v-text-field
          v-model="cardNumber"
          label="Card Number"
          variant="outlined"
          density="comfortable"
          :rules="cardNumberRules"
          required
          prepend-inner-icon="mdi-credit-card"
          hide-details="auto"
          placeholder="1234 5678 9012 3456"
          maxlength="16"
          @input="formatCardNumber"
        />

        <div class="card-details-grid">
          <v-text-field
            v-model="expiryDate"
            label="Expiry Date"
            variant="outlined"
            density="comfortable"
            :rules="expiryDateRules"
            required
            prepend-inner-icon="mdi-calendar"
            hide-details="auto"
            placeholder="MM/YY"
            maxlength="5"
            @input="formatExpiryDate"
          />

          <v-text-field
            v-model="cvv"
            label="CVV"
            variant="outlined"
            density="comfortable"
            :rules="cvvRules"
            required
            prepend-inner-icon="mdi-lock"
            hide-details="auto"
            placeholder="123"
            maxlength="4"
            type="password"
          />
        </div>

        <v-text-field
          v-model="cardholderName"
          label="Cardholder Name"
          variant="outlined"
          density="compact"
          :rules="cardholderNameRules"
          required
          prepend-inner-icon="mdi-account"
          hide-details="auto"
          placeholder="Name on card"
        />
      </div>

      <div class="security-info">
        <div class="security-content">
          <svg class="security-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div class="security-text">
            <div class="security-title">Secure Payment</div>
            <div class="security-description">
              Your payment information is encrypted and secure. We never store your card details.
            </div>
          </div>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue?: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref()

// Form data
const selectedPaymentMethod = ref('card')
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const cardholderName = ref('')
const cardErrors = ref<string[]>([])

// Validation rules
const paymentMethodRules = [
  (v: string) => !!v || 'Please select a payment method'
]

const cardNumberRules = [
  (v: string) => !!v || 'Card number is required',
  (v: string) => {
    const cleanNumber = v.replace(/\s/g, '')
    return cleanNumber.length === 16 || 'Please enter a valid 16-digit card number'
  },
  (v: string) => {
    const cleanNumber = v.replace(/\s/g, '')
    return luhnCheck(cleanNumber) || 'Invalid card number'
  }
]

const expiryDateRules = [
  (v: string) => !!v || 'Expiry date is required',
  (v: string) => /^\d{2}\/\d{2}$/.test(v) || 'Please use MM/YY format',
  (v: string) => isValidExpiryDate(v) || 'Card has expired or invalid date'
]

const cvvRules = [
  (v: string) => !!v || 'CVV is required',
  (v: string) => /^\d{3,4}$/.test(v) || 'CVV must be 3 or 4 digits'
]

const cardholderNameRules = [
  (v: string) => !!v || 'Cardholder name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
  (v: string) => /^[a-zA-Z\s]*$/.test(v) || 'Name can only contain letters and spaces'
]

// Methods
const formatCardNumber = (value: any) => {
  if (!value || typeof value !== 'string') return
  
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  
  if (parts.length) {
    cardNumber.value = parts.join(' ')
  }
}

const formatExpiryDate = (value: any) => {
  if (!value || typeof value !== 'string') return
  
  const v = value.replace(/\D/g, '')
  if (v.length >= 2) {
    expiryDate.value = v.substring(0, 2) + '/' + v.substring(2, 4)
  } else {
    expiryDate.value = v
  }
}

const isValidExpiryDate = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
  
  const [month, year] = expiry.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month)
  const expYear = parseInt(year)
  
  if (expMonth < 1 || expMonth > 12) return false
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false
  
  return true
}

const luhnCheck = (num: string): boolean => {
  let arr = (num + '')
    .split('')
    .reverse()
    .map(x => parseInt(x))
  
  let lastDigit = arr.splice(0, 1)[0]
  let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0)
  sum += lastDigit
  
  return sum % 10 === 0
}

// Watch for changes and emit updates
watch([cardNumber, expiryDate, cvv, cardholderName], () => {
  emit('update:modelValue', {
    cardNumber: cardNumber.value,
    expiryDate: expiryDate.value,
    cvv: cvv.value,
    cardholderName: cardholderName.value
  })
  
  // Clear errors when user types
  cardErrors.value = []
}, { deep: true })

// Expose form validation method
defineExpose({
  validate: () => form.value?.validate()
})
</script>

<style scoped>
.payment-method {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #DB4444 0%, #000000 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.payment-option {
  margin-bottom: 1.5rem;
}

.payment-radio {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #fecaca;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #fef2f2 0%, #f3f4f6 100%);
}

.radio-input {
  width: 1.25rem;
  height: 1.25rem;
  color: #DB4444;
  margin-right: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
}

.payment-icon {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #DB4444 0%, #000000 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-text {
  font-weight: 600;
  color: #1f2937;
}

.card-element-section {
  margin-bottom: 1.5rem;
}

.card-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.card-element {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.card-element:focus-within {
  border-color: #DB4444;
  box-shadow: 0 0 0 4px rgba(219, 68, 68, 0.1);
}

.card-errors {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.security-info {
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.75rem;
  border: 1px solid #bfdbfe;
}

.security-content {
  display: flex;
  align-items: flex-start;
}

.security-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #DB4444;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.security-text {
  flex: 1;
}

.security-title {
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.security-description {
  font-size: 0.75rem;
  color: #1d4ed8;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .payment-method {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .payment-radio {
    padding: 0.75rem;
  }
  
  .payment-icon {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Fixed height for all form fields */
.v-text-field:deep(.v-field),
.v-select:deep(.v-field) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
}

.v-text-field:deep(.v-field__input),
.v-select:deep(.v-field__input) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.v-text-field:deep(.v-field__outline),
.v-select:deep(.v-field__outline) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
}

/* Ensure consistent spacing for labels and placeholders */
.v-text-field:deep(.v-field__label),
.v-select:deep(.v-field__label) {
  top: 16px !important;
  transform: translateY(-50%) !important;
}

.v-text-field:deep(.v-field--focused .v-field__label),
.v-select:deep(.v-field--focused .v-field__label),
.v-text-field:deep(.v-field--variant-outlined .v-field__label),
.v-select:deep(.v-field--variant-outlined .v-field__label) {
  top: 8px !important;
  transform: translateY(0) !important;
}

/* Prevent height changes on error states */
.v-text-field:deep(.v-field--error),
.v-select:deep(.v-field--error) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
}

/* Ensure consistent height for prepend icons */
.v-text-field:deep(.v-field__prepend-inner),
.v-select:deep(.v-field__prepend-inner) {
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
}

/* Fix height for radio group */
.v-radio-group:deep(.v-selection-control) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
}

.v-radio-group:deep(.v-selection-control__wrapper) {
  min-height: 56px !important;
  max-height: 56px !important;
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
}

/* Fix error message layout disruption */
.v-text-field:deep(.v-messages),
.v-select:deep(.v-messages) {
  position: relative !important;
  margin-top: 4px !important;
  min-height: 20px !important;
  max-height: none !important;
  height: auto !important;
  display: block !important;
}

.v-text-field:deep(.v-messages__message),
.v-select:deep(.v-messages__message) {
  font-size: 12px !important;
  line-height: 16px !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 16px !important;
  max-height: none !important;
  height: auto !important;
  color: #dc2626 !important;
  font-weight: 500 !important;
}

/* Card details grid layout */
.card-details-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 1rem !important;

  align-items: start !important;
}

.card-details-grid .form-group {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* Form spacing */
.form-group {
  margin-bottom: 1.5rem !important;
}

.form-group:last-child {
  margin-bottom: 0 !important;
}

/* Ensure proper spacing between form elements */
.card-element-section {
  margin-bottom: 1.5rem !important;
}

.card-element-section .v-text-field {
  margin-bottom: 1rem !important;
}

.card-element-section .v-text-field:last-child {
  margin-bottom: 0 !important;
}
</style>
