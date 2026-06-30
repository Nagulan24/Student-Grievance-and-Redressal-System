import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  horizontal?: boolean;
}

export function BarChart({ data, height = 260, horizontal = false }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chartData: ChartData<"bar"> = {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color || "#1e2a6b"),
          borderRadius: 6,
          borderSkipped: false,
          barThickness: horizontal ? 24 : undefined,
          maxBarThickness: 40,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      indexAxis: horizontal ? "y" : "x",
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
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: chartData,
      options,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, horizontal]);

  return (
    <div style={{ height }} className="w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
