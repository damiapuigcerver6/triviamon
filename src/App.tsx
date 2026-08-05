import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TablaTiposPage from "./games/tabla-tipos/TablaTiposPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/juegos/tabla-de-tipos" element={<TablaTiposPage />} />
      </Route>
    </Routes>
  );
}

export default App;
