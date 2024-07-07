import './assets/main.css'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

import App from './App.vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'
import router from './router'

const userToken = import.meta.env.VITE_API_TOKEN

const httpLink = createHttpLink({
  uri: 'https://api.mercurydata.app:2083/graphql',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)
app.use(router)
app.mount('#app')
