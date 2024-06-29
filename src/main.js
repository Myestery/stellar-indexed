import './assets/main.css'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

import App from './App.vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'

const tokenFromLocalStorage = localStorage.getItem('token')
// Prompt the user for the API token
const userToken = tokenFromLocalStorage || prompt("Please enter your API token:");
localStorage.setItem('lastUsedToken', userToken)

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

app.mount('#app')
