import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function LineChart({ data, height = 260 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chartData: ChartData<"line"> = {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: "Complaints",
          data: data.map((d) => d.value),
          borderColor: "#1e2a6b",
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return "rgba(30, 42, 107, 0.05)";
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(30, 42, 107, 0.12)");
            gradient.addColorStop(1, "rgba(30, 42, 107, 0.0)");
            return gradient;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#1e2a6b",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          backgroundColor: "#18181b",
          titleColor: "#fff",
          bodyColor: "#d4d4d8",
          borderColor: "#27272a",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          titleFont: { size: 12, weight: 600 as const },
          bodyFont: { size: 13 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#a1a1aa",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#f4f4f5",
            drawTicks: false,
          },
          border: { display: false },
          ticks: {
            color: "#a1a1aa",
            font: { size: 11 },
            padding: 10,
            stepSize: 10,
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: chartData,
      options,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data]);

  return (
    <div style={{ height }} className="w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
