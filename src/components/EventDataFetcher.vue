<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Stellar Events Data Fetcher (Vue)</h1>
      <h2 class="text-xl font-bold text-gray-700">
        Contract ID:
        <a
          class="text-red-300 underline"
          href="https://stellar.expert/explorer/testnet/contract/CC6MWZMG2JPQEENRL7XVICAY5RNMHJ2OORMUHXKRDID6MNGXSSOJZLLF"
          >CC6MWZMG2JPQEENRL7XVICAY5RNMHJ2OORMUHXKRDID6MNGXSSOJZLLF</a
        >
      </h2>

      <!-- <button
        @click="logout"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button> -->
    </div>
    <div>
      <h3>Run the code below to invoke the contract</h3>
      <pre class="bg-gray-100 p-4 rounded-lg">
        <code class="language-javascript">
          stellar contract invoke \
          --id CC6MWZMG2JPQEENRL7XVICAY5RNMHJ2OORMUHXKRDID6MNGXSSOJZLLF \
          --source alice \
          --network testnet \
          -- \
          increment
        </code>
      </pre>
    </div>
    <div class="flex justify-between">
      <h2 class="text-xl font-bold">
        Contract Code:
        <a
          class="text-red-300 underline"
          href="https://github.com/stellar/soroban-examples/tree/main/events"
          >Events</a
        >
      </h2>
      <!-- environment -->
      <h2 class="text-xl font-bold text-gray-700">Environment: Testnet</h2>
    </div>
    <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
    <div v-if="error" class="text-center text-red-500">
      Error fetching data: {{ error.message }}
    </div>
    <div v-if="result" class="mt-6">
      <h2 class="text-2xl font-bold mb-4">Fetched Data:</h2>
      <ul>
        <li
          v-for="item in result.eventByTopic.nodes"
          :key="item.txInfoByTx.txHash"
          class="mb-4 p-4 border border-gray-300 rounded-lg shadow"
        >
          <p class="text-lg font-medium">
            Current Count: {{ parseXdr(item.data) }}
          </p>
          <p class="text-gray-600">
            Updated At:
            {{
              new Date(
                item.txInfoByTx.ledgerByLedger.closeTime * 1000
              ).toLocaleString()
            }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { xdr, scValToNative } from "@stellar/stellar-sdk";
import gql from "graphql-tag";

const GET_EVENT_BY_TOPIC = gql`
  query MyQuery {
    eventByTopic(t2: "AAAADwAAAAlpbmNyZW1lbnQAAAA=") {
      nodes {
        contractId
        topic1
        topic2
        topic3
        topic4
        data
        txInfoByTx {
          ledgerByLedger {
            closeTime
            sequence
          }
          memo
          txHash
          opCount
          fee
        }
      }
    }
  }
`;
function parseXdr(eventXdr) {
  const parseddr = scValToNative(xdr.ScVal.fromXDR(eventXdr, "base64"));
  return parseddr;
}
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    // Implement your logout logic here
    localStorage.removeItem("token");
    localStorage.removeItem("lastUsedToken");
    location.reload();
  }
}
export default defineComponent({
  name: "EventDataFetcher",
  setup() {
    const { result, loading, error } = useQuery(GET_EVENT_BY_TOPIC);

    watch(loading, (isLoading) => {
      if (isLoading) {
        console.log("Loading data...");
      }
    });

    watch(error, (err) => {
      if (err) {
        console.error("Error fetching data:", err);
      }
    });

    watch(result, (data) => {
      if (data) {
        localStorage.setItem("token", localStorage.getItem("lastUsedToken"));
      }
    });

    return {
      result,
      loading,
      error,
      parseXdr,
      logout,
    };
  },
});
</script>
