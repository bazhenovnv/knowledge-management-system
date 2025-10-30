import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BranchModalProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onEdit?: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
}

export const BranchModal = ({ branch, isOpen, onClose, userRole, onEdit, onDelete }: BranchModalProps) => {
  if (!branch) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Icon name="MapPin" className="text-blue-600" size={28} />
              Филиал в городе {branch.city}
            </DialogTitle>
            {userRole === 'admin' && onEdit && onDelete && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(branch);
                    onClose();
                  }}
                  className="hover:bg-blue-50"
                >
                  <Icon name="Edit" size={16} className="mr-1" />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDelete(branch);
                    onClose();
                  }}
                  className="hover:bg-red-50 hover:border-red-300"
                >
                  <Icon name="Trash2" size={16} className="text-red-600" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Фотогалерея */}
          {branch.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {branch.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={image}
                    alt={`${branch.city} - фото ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Информация о филиале */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="MapPin" className="text-gray-500 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Адрес</p>
                  <p className="font-medium text-gray-900">{branch.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="Phone" className="text-gray-500 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <a
                    href={`tel:${branch.phone}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {branch.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Mail" className="text-gray-500 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${branch.email}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="Users" className="text-gray-500 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Сотрудников</p>
                  <Badge variant="secondary" className="mt-1">
                    {branch.employees} человек
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icon name="Info" size={18} className="text-blue-600" />
              О филиале
            </h4>
            <p className="text-gray-700 leading-relaxed">{branch.description}</p>
          </div>

          {/* Услуги */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Предоставляемые услуги</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Продажа онлайн-касс
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Техническое обслуживание
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Регистрация в ФНС
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Консультации 24/7
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Обучение персонала
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                Замена фискальных накопителей
              </div>
            </div>
          </div>

          {/* График работы */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-blue-600" />
              График работы
            </h4>
            <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
            <p className="text-gray-700">Сб: 10:00 - 15:00</p>
            <p className="text-gray-500 text-sm mt-1">Воскресенье — выходной</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};