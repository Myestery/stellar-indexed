<template>
  <div>
    <!-- <h1>Stellar Events Data Fetcher (Vue)</h1> -->
    <EventDataFetcher />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import EventDataFetcher from './components/EventDataFetcher.vue'

export default defineComponent({
  name: 'App',
  components: {
    EventDataFetcher
  }
})
</script>
