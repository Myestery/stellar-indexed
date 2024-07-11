<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Stellar Token List from BlockEden</h1>
    <div v-if="loading" class="text-center">
      <p class="text-lg">Loading...</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      <p class="text-lg">Error: {{ error.message }}</p>
    </div>
    <div v-else>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border border-gray-300">Name</th>
            <th class="p-2 border border-gray-300">Symbol</th>
            <th class="p-2 border border-gray-300">Contract ID</th>
            <th class="p-2 border border-gray-300">Admin Address</th>
            <th class="p-2 border border-gray-300">Decimal</th>
            <th class="p-2 border border-gray-300">Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in tokenMetadata" :key="token.contract_id" class="hover:bg-gray-50">
            <td class="p-2 border border-gray-300">{{ token.name }}</td>
            <td class="p-2 border border-gray-300">{{ token.symbol }}</td>
            <td class="p-2 border border-gray-300">{{ token.contract_id }}</td>
            <td class="p-2 border border-gray-300">{{ token.admin_address }}</td>
            <td class="p-2 border border-gray-300">{{ token.decimal }}</td>
            <td class="p-2 border border-gray-300">{{ new Date(token.updated_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 flex justify-between items-center">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="tokenMetadata.length < pageSize"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const pageSize = 30;
const currentPage = ref(1);
const offset = ref(0);

const TOKEN_QUERY = gql`
  query GetTokenMetadata($limit: Int!, $offset: Int!) {
    token_metadata(limit: $limit, offset: $offset, order_by: { updated_at: desc }) {
      admin_address
      name
      contract_id
      symbol
      updated_at
      decimal
    }
  }
`;

const { result, loading, error, refetch } = useQuery(TOKEN_QUERY, {
  limit: pageSize,
  offset,
});

const tokenMetadata = ref([]);

watchEffect(() => {
  if (result.value) {
    tokenMetadata.value = result.value.token_metadata;
  }
});

const nextPage = () => {
  currentPage.value++;
  offset.value += pageSize;
  refetch();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    offset.value -= pageSize;
    refetch();
  }
};
</script>