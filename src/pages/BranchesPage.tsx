import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { BranchManager } from "@/components/branches/BranchManager";
import { Footer } from "@/components/layout/Footer";

export default function BranchesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Icon name="Building" className="mr-3" size={32} />
                Управление филиалами
              </h1>
              <p className="text-gray-600">Добавляйте, редактируйте и отслеживайте филиалы на карте</p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
            >
              <Icon name="ArrowLeft" className="mr-2" size={20} />
              Вернуться в приложение
            </Button>
          </div>

          <BranchManager />
        </div>
      </div>
      <Footer />
    </div>
  );
}
