import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router/router";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
