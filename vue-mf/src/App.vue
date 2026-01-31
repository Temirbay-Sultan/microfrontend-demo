<template>
  <div :style="appStyle">
    <Counter />
  </div>
</template>

<script setup>
import Counter from './Counter.vue'

const appStyle = {
  padding: '10px',
  backgroundColor: 'transparent',
  minHeight: '100%'
}
</script>
