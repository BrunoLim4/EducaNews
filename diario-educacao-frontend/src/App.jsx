import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./pages/Home";
import Noticia from "./pages/Noticia";
import AdminLogin from "./pages/AdminLogin";
import AdminPainel from "./pages/AdminPainel";

function App() {

    return (

        <BrowserRouter>

            <Routes>


                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/noticia/:id"
                    element={<Noticia />}
                />


                {/* ÁREA ADMINISTRATIVA */}

                <Route
                    path="/secretaria"
                    element={<AdminLogin />}
                />

                <Route
                    path="/secretaria/painel"
                    element={<AdminPainel />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;