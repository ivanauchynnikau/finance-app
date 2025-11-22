import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Скрыть loader после монтирования приложения
const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }
};

createRoot(document.getElementById("root")!).render(<App />);

// Скрыть loader после загрузки
hideLoader();
