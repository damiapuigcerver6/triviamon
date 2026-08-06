import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TablaTiposPage from "./games/tabla-tipos/TablaTiposPage";
import DetectivePokemonPage from "./games/detective-pokemon/DetectivePokemonPage";
import ConexionesPage from "./games/conexiones/ConexionesPage";
import HigherLowerPage from "./games/higher-lower/HigherLowerPage";
import QuienEsEsePokemonPage from "./games/quien-es-ese-pokemon/QuienEsEsePokemonPage";
import ParrillaPokemonPage from "./games/parrilla-pokemon/ParrillaPokemonPage";
import PokedlePage from "./games/pokedle/PokedlePage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/juegos/tabla-de-tipos" element={<TablaTiposPage />} />
        <Route path="/juegos/detective-pokemon" element={<DetectivePokemonPage />} />
        <Route path="/juegos/conexiones" element={<ConexionesPage />} />
        <Route path="/juegos/mayor-o-menor" element={<HigherLowerPage />} />
        <Route path="/juegos/quien-es-ese-pokemon" element={<QuienEsEsePokemonPage />} />
        <Route path="/juegos/parrilla-pokemon" element={<ParrillaPokemonPage />} />
        <Route path="/juegos/pokedle" element={<PokedlePage />} />
      </Route>
    </Routes>
  );
}

export default App;
