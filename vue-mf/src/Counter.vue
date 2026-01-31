<template>
  <div :style="containerStyle">
    <h3>Vue Counter Component</h3>
    <p>Счётчик: <strong>{{ count }}</strong></p>
    <button @click="increment" :style="btnIncrementStyle">+1</button>
    <button @click="reset" :style="btnResetStyle">Сброс</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const reset = () => {
  count.value = 0
}

const containerStyle = {
  padding: '15px',
  backgroundColor: '#282c34',
  borderRadius: '8px',
  color: 'white',
  marginTop: '10px'
}

const btnIncrementStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#61dafb',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '10px'
}

const btnResetStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#ff6b6b',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
}
</script>
