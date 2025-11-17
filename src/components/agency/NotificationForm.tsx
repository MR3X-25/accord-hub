import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSchedule {
  id: string;
  date: string;
  time: string;
  message: string;
  type: "email" | "sms" | "whatsapp";
}

const NotificationForm = () => {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState({
    date: "",
    time: "",
    message: "",
    type: "email" as "email" | "sms" | "whatsapp",
  });
  const { toast } = useToast();

  const handleAddSchedule = () => {
    if (!currentSchedule.date || !currentSchedule.time || !currentSchedule.message) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const newSchedule: NotificationSchedule = {
      id: Date.now().toString(),
      ...currentSchedule,
    };

    setSchedules([...schedules, newSchedule]);
    setCurrentSchedule({ date: "", time: "", message: "", type: "email" });
    toast({ title: "Notificação agendada", description: "Notificação adicionada com sucesso" });
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast({ title: "Removido", description: "Notificação removida" });
  };

  const handleSendAll = () => {
    if (schedules.length === 0) {
      toast({ title: "Erro", description: "Não há notificações agendadas", variant: "destructive" });
      return;
    }

    toast({ title: "Enviado", description: `${schedules.length} notificação(ões) programada(s)` });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Notificações e Lembretes</h2>
            <p className="text-sm text-muted-foreground">Configure lembretes automáticos para pagamentos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notification-date">Data</Label>
              <Input
                id="notification-date"
                type="date"
                value={currentSchedule.date}
                onChange={(e) => setCurrentSchedule({ ...currentSchedule, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notification-time">Hora</Label>
              <Input
                id="notification-time"
                type="time"
                value={currentSchedule.time}
                onChange={(e) => setCurrentSchedule({ ...currentSchedule, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notification-type">Tipo de Notificação</Label>
            <Select
              value={currentSchedule.type}
              onValueChange={(value: "email" | "sms" | "whatsapp") => 
                setCurrentSchedule({ ...currentSchedule, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notification-message">Mensagem</Label>
            <Textarea
              id="notification-message"
              placeholder="Digite a mensagem do lembrete..."
              value={currentSchedule.message}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, message: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{nome}"}, {"{valor}"}, {"{vencimento}"} para personalizar a mensagem
            </p>
          </div>

          <Button onClick={handleAddSchedule} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Notificação
          </Button>
        </div>
      </Card>

      {schedules.length > 0 && (
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Notificações Agendadas ({schedules.length})</h3>
            <Button onClick={handleSendAll} className="gap-2">
              <Send className="w-4 h-4" />
              Programar Todas
            </Button>
          </div>

          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                        {schedule.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(schedule.date).toLocaleDateString("pt-BR")} às {schedule.time}
                      </span>
                    </div>
                    <p className="text-sm">{schedule.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSchedule(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationForm;
