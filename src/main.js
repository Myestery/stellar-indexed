import './assets/main.css'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'

import App from './App.vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'

// const tokenFromLocalStorage = localStorage.getItem('token')
// Prompt the user for the API token
// const userToken = tokenFromLocalStorage || prompt("Please enter your API token:");
// localStorage.setItem('lastUsedToken', userToken)
const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibXllc3RlcnkiLCJleHAiOjE3MjAyNjUwODAsInVzZXJfaWQiOjg3LCJ1c2VybmFtZSI6InBvbHltZW5qb2huMUBnbWFpbC5jb20iLCJpYXQiOjE3MTk2NjAyODAsImF1ZCI6InBvc3RncmFwaGlsZSIsImlzcyI6InBvc3RncmFwaGlsZSJ9.RD6xcW1uzEBbUKXpdsVRcB692KcLturOaDhQ5UskySs"

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
