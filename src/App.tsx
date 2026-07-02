import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Demo from "./demo";
import GridScanPage from "./pages/GridScanPage";
import CreatePage from "./pages/CreatePage";
import PdfCreator from "./pages/PdfCreator";
import PptCreator from "./pages/PptCreator";
import ImageCreator from "./pages/ImageCreator";
import AvatarCreator from "./pages/AvatarCreator";
import AskPage from "./pages/AskPage";
import AiPage from "./pages/AiPage";
import SearchPage from "./pages/SearchPage";
import LawsPage from "./pages/LawsPage";
import LawsAskPage from "./pages/LawsAskPage";
import GamesPage from "./pages/GamesPage";
import ProfilePage from "./pages/ProfilePage";
import SnakeLadder from "./pages/games/SnakeLadder";
import CarRacing from "./pages/games/CarRacing";
import TicTacToe from "./pages/games/TicTacToe";
import Puzzle from "./pages/games/Puzzle";
import GuessCaptcha from "./pages/games/GuessCaptcha";
import Cricket from "./pages/games/Cricket";
import BlankPage from "./pages/BlankPage";
import VisualChatPage from "./pages/VisualChatPage";
import AuthSuccessPage from "./pages/AuthSuccessPage";
import { User, Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { GradientBackground } from "./components/ui/noisy-gradient-backgrounds";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { useState } from "react";

function GlobalBackground() {
  const { isLightMode } = useTheme();

  return (
    <>
      {/* Dark Mode Background */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isLightMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* We can place AnoAI here globally if desired, although some pages already have it. We'll leave the container here safely. */}
      </div>

      {/* Light Mode Gradient Background */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isLightMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <GradientBackground 
          gradientOrigin="top-left"
          noiseIntensity={0.8}
          noisePatternSize={100}
        />
      </div>
    </>
  );
}

function GlobalProfileButton({ onOpenAuth }: { onOpenAuth: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  const hideOnRoutes = ["/ask", "/laws", "/lawsask"];
  if (hideOnRoutes.includes(location.pathname)) return null;

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex gap-2">
      <div
        onClick={toggleTheme}
        className={`cursor-pointer hover:scale-110 transition-all duration-300 p-3 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center ${
          isLightMode 
            ? 'bg-white/90 border-gray-200 shadow-md text-[#111111] hover:text-purple-600 hover:border-purple-300' 
            : 'bg-black/40 backdrop-blur-md border-white/20 text-white'
        }`}
        title="Toggle Theme"
      >
        {isLightMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
      </div>
      <div
        onClick={handleProfileClick}
        className={`cursor-pointer hover:scale-110 transition-all duration-300 p-3 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center ${
          isLightMode 
            ? 'bg-white/90 border-gray-200 shadow-md text-[#111111] hover:text-purple-600 hover:border-purple-300' 
            : 'bg-black/40 backdrop-blur-md border-white/20 text-white'
        }`}
        title="Profile"
      >
        <User className="w-6 h-6" />
      </div>
    </div>
  );
}

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen relative">
      <GlobalBackground />
      <GlobalProfileButton onOpenAuth={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <div className="relative z-10 w-full min-h-screen">
        <Routes>
          <Route path="/" element={<GridScanPage />} />
          <Route path="/auth-success" element={<AuthSuccessPage />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="/visual-chat" element={<VisualChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/create/pdf" element={<PdfCreator />} />
          <Route path="/create/ppt" element={<PptCreator />} />
          <Route path="/create/image" element={<ImageCreator />} />
          <Route path="/create/avatar" element={<AvatarCreator />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/search" element={<SearchPage onBack={() => window.history.back()} />} />
          <Route path="/laws" element={<LawsPage />} />
          <Route path="/lawsask" element={<LawsAskPage />} />
          <Route path="/games" element={<GamesPage />} />
          {/* Games */}
          <Route path="/games/snake-ladder" element={<SnakeLadder />} />
          <Route path="/games/car-racing" element={<CarRacing />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/games/puzzle" element={<Puzzle />} />
          <Route path="/games/captcha" element={<GuessCaptcha />} />
          <Route path="/games/cricket" element={<Cricket />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
