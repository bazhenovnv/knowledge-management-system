import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SoundType, getSoundName, playSound } from "@/utils/soundEffects";
import { toast } from "sonner";

interface NotificationSettingsCardProps {
  soundEnabled: boolean;
  soundType: SoundType;
  onSoundToggle: (checked: boolean) => void;
  onSoundTypeChange: (type: SoundType) => void;
}

export default function NotificationSettingsCard({
  soundEnabled,
  soundType,
  onSoundToggle,
  onSoundTypeChange
}: NotificationSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Bell" size={20} className="mr-2 text-orange-600" />
          Настройки уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Звуковые уведомления</Label>
              <p className="text-sm text-gray-600">Воспроизводить звук при восстановлении соединения с сервером</p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={onSoundToggle}
            />
          </div>

          {soundEnabled && (
            <div className="pl-4 border-l-2 border-gray-200 space-y-3">
              <div>
                <Label htmlFor="soundType">Тип звука</Label>
                <div className="flex gap-2 mt-2">
                  <Select 
                    value={soundType}
                    onValueChange={(value) => onSoundTypeChange(value as SoundType)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">{getSoundName('notification')}</SelectItem>
                      <SelectItem value="success">{getSoundName('success')}</SelectItem>
                      <SelectItem value="alert">{getSoundName('alert')}</SelectItem>
                      <SelectItem value="chime">{getSoundName('chime')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      playSound(soundType);
                      toast.success(`Звук "${getSoundName(soundType)}" воспроизведен`);
                    }}
                  >
                    <Icon name="Volume2" size={16} className="mr-2" />
                    Тест
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Выберите звук и нажмите "Тест" для прослушивания</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
