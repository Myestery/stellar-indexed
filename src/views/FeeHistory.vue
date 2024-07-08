<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Soroban Operations Average Fees</h1>
    <div class="bg-white shadow-md rounded p-4">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="mt-6">
      <p class="text-xs font-semibold">
        Using Data from Hubble, provided by
        <a
          class="text-blue-500 underline"
          href="https://https://bridge.litemint.com"
          target="_blank"
          >Litemint</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "SorobanStatsChart",
  setup() {
    const chartCanvas = ref(null);
    const chartInstance = ref(null);

    const fetchData = async () => {
      const dates = [];
      const data = {
        createContract: [],
        invokeContract: [],
        uploadWasm: [],
      };

      for (let i = 5; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        dates.push(formattedDate);

        const response = await fetch(
          `https://bridge.litemint.com/soroban/stats?date=${formattedDate}`
        );
        const json = await response.json();

        json.operations.forEach((op) => {
          const avgFee = parseFloat(op.total_fee) / op.count / 10000000;
          switch (op.type) {
            case "create_contract":
              data.createContract.push(avgFee);
              break;
            case "invoke_contract":
              data.invokeContract.push(avgFee);
              break;
            case "upload_wasm":
              data.uploadWasm.push(avgFee);
              break;
          }
        });
      }

      renderChart(dates, data);
    };

    const renderChart = (dates, data) => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      const ctx = chartCanvas.value.getContext("2d");
      chartInstance.value = new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Create Contract",
              data: data.createContract,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Invoke Contract",
              data: data.invokeContract,
              borderColor: "rgb(54, 162, 235)",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
              label: "Upload WASM",
              data: data.uploadWasm,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.5)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Average Fees for Soroban Operations (Last 5 Days)",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Average Fee (XLM)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Date (Last 5 days)",
              },
            },
          },
        },
      });
    };

    onMounted(() => {
      fetchData();
    });

    return {
      chartCanvas,
    };
  },
};
</script>
