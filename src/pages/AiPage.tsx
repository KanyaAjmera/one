import { useNavigate } from "react-router-dom";
import SearchPage from "@/pages/SearchPage";

export default function AiPage() {
  const navigate = useNavigate();

  return <SearchPage onBack={() => navigate("/demo")} />;
}
