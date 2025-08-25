import { Chat } from "@/components/chat/chat";
import { Sidebar } from "@/components/sidebar/sidebar";
import logo from "../public/logo.svg";

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="w-full h-14 flex items-center justify-between bg-[#a3e636] pt-2 px-5 select-none">
        <img src={logo} alt="Logo" className="h-5" />
        <p className="text-lg font-medium">
          LLM Chat <span className="text-sm font-normal">v1.0</span>
        </p>
        <div className="w-33 hidden md:block"></div>
      </header>
      <div className="h-3 bg-[url('/wave.svg')] bg-left-top bg-auto z-20"></div>
      <main className="flex-1 min-h-0 -mt-3 flex">
        <Sidebar />
        <Chat />
      </main>
    </div>
  );
};

export default App;
