import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TablaTiposPage from "./games/tabla-tipos/TablaTiposPage";
import QuienEsEsePokemonPage from "./games/quien-es-ese-pokemon/QuienEsEsePokemonPage";
import ConexionesPage from "./games/conexiones/ConexionesPage";
import HigherLowerPage from "./games/higher-lower/HigherLowerPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/juegos/tabla-de-tipos" element={<TablaTiposPage />} />
        <Route path="/juegos/quien-es-ese-pokemon" element={<QuienEsEsePokemonPage />} />
        <Route path="/juegos/conexiones" element={<ConexionesPage />} />
        <Route path="/juegos/mayor-o-menor" element={<HigherLowerPage />} />
      </Route>
    </Routes>
  );
}

export default App;
