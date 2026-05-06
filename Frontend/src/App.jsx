import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import AviatorGame from "./components/Game/Game";
import Header from "./layout/header/header";
import { ToastContainer } from "react-toastify";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import { PrivyProvider } from "@privy-io/react-auth";

function App() {


const queryClient = new QueryClient();
  return( 
    
    <div>
          <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_KEY || "cmmln8b9i012l0dl4d0irltmd"}
      config={{
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
        loginMethods: ['google', 'apple', 'email', 'wallet'],
      }}
    >
          <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark" // or "light"
      />
  <Header/>
  <div className="routes-div">
  <AviatorGame />
  </div>
  </QueryClientProvider>
  </PrivyProvider>
    </div>
  );
}

export default App;
