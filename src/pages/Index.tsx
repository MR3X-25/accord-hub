import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, User, FileText, Moon, Sun } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
      </div>
      
      <Card className="glass-card w-full max-w-4xl p-8 md:p-12">
        <div className="text-center mb-8">
          <img src={logo} alt="MR3X" className="w-24 h-24 mx-auto mb-6 rounded-2xl" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">MR3X</h1>
          <p className="text-muted-foreground text-lg">Gestão de Cobranças de Aluguéis</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/acordos">
            <Card className="glass-card p-8 hover:scale-105 transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-accent/10 mb-4">
                  <FileText className="w-12 h-12 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Acordos</h2>
                <p className="text-muted-foreground mb-4">Ver acordos cadastrados</p>
                <Button variant="outline" className="w-full">Ver</Button>
              </div>
            </Card>
          </Link>
          
          <Link to="/agencia">
            <Card className="glass-card p-8 hover:scale-105 transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Agência</h2>
                <p className="text-muted-foreground mb-4">Gerenciar acordos</p>
                <Button className="gradient-primary w-full">Acessar</Button>
              </div>
            </Card>
          </Link>
          
          <Link to="/inquilino">
            <Card className="glass-card p-8 hover:scale-105 transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-secondary/10 mb-4">
                  <User className="w-12 h-12 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Inquilino</h2>
                <p className="text-muted-foreground mb-4">Visualizar e assinar</p>
                <Button className="gradient-secondary w-full">Acessar</Button>
              </div>
            </Card>
          </Link>
          
          <Link to="/verificar">
            <Card className="glass-card p-8 hover:scale-105 transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-green-500/10 mb-4">
                  <FileText className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verificar</h2>
                <p className="text-muted-foreground mb-4">Validar documentos</p>
                <Button variant="outline" className="w-full">Verificar</Button>
              </div>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Index;
