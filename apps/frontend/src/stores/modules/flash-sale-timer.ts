import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFlashSaleTimerStore = defineStore('flashSaleTimer', () => {
  // Timer state
  const timeLeft = ref({
    days: 3,
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  // Set target date (3 days from now for flash sale)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(targetDate.getHours() + 12);

  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed values
  const formattedTime = computed(() => ({
    days: timeLeft.value.days.toString().padStart(2, '0'),
    hours: timeLeft.value.hours.toString().padStart(2, '0'),
    minutes: timeLeft.value.minutes.toString().padStart(2, '0'),
    seconds: timeLeft.value.seconds.toString().padStart(2, '0')
  }));

  // Safe timer values that are always available
  const safeTimeLeft = computed(() => ({
    days: timeLeft.value?.days ?? 3,
    hours: timeLeft.value?.hours ?? 12,
    minutes: timeLeft.value?.minutes ?? 0,
    seconds: timeLeft.value?.seconds ?? 0
  }));

  const isExpired = computed(() => {
    return timeLeft.value.days === 0 && 
           timeLeft.value.hours === 0 && 
           timeLeft.value.minutes === 0 && 
           timeLeft.value.seconds === 0;
  });

  // Timer functions
  const updateTimer = () => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance > 0) {
      timeLeft.value = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    } else {
      // Timer expired
      timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      stopTimer();
    }
  };

  const startTimer = () => {
    if (!timerInterval) {
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    }
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    // Reset target date
    const newTargetDate = new Date();
    newTargetDate.setDate(newTargetDate.getDate() + 3);
    newTargetDate.setHours(newTargetDate.getHours() + 12);
    Object.assign(targetDate, newTargetDate);
    startTimer();
  };

  return {
    timeLeft,
    formattedTime,
    safeTimeLeft,
    isExpired,
    startTimer,
    stopTimer,
    resetTimer,
    updateTimer
  };
});
