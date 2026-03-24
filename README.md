# 🎟️ Central de Eventos Full-Stack

Uma plataforma moderna para a gestão inteligente de escalas operacionais, pagamentos pontuais via PIX e controle de portarias de freelancers, estruturada com **Spring Boot (Java)**, **MySQL** e **Next.js**.

---

## 🚀 Como Subir o Projeto Tradicionalmente

**1. Operando o Backend (Java)**
A engine roda na porta `8080` (Acesso do MySQL via credencial root/root no port 3306).
```bash
cd backend
./mvnw clean compile spring-boot:run
```

**2. Operando o Frontend (Next.js)**
Toda a parte visual de Dashboards roda na porta `3000`, e nós configuramos para escutar toda a rede (`0.0.0.0`) por padrão.
```bash
cd frontend
pnpm run dev
```

---

## 📱 Tutorial: Acessando o App via Celular ou Outra Máquina (Modo Portaria)

O *Windows Defender Firewall* corta por padrão qualquer requisição que venha de fora (mesmo de aparelhos na mesma rede Wi-Fi).

Para testar no celular o **App de Check-in em Tempo Real**, faça o seguinte:
Abra seu **Prompt de Comando (CMD)** ou **PowerShell** no Windows na versão **"Executar como administrador"** e use as senhas da porta a seguir.

### 🟢 ABRIR PORTAS (Habilitar Acesso Local Wi-Fi)
Copie as restrições abaixo juntas e dê *Enter*:
```powershell
netsh advfirewall firewall add rule name="Liberar Central - NextJS" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Liberar Central - Java" dir=in action=allow protocol=TCP localport=8080
```
> *Agora vá no Google Chrome ou Safari do celular e digite: `http://SEU_IP:3000` (como `http://192.168.0.26:3000`)*

### 🔴 FECHAR PORTAS (Bloqueio Total)
Quando você for desligar o pc, for acessar o wifi de um aeroporto, lanchonete, ou quando o sistema for temporariamente paralisado. Rode as deleções de permissão da sua máquina (Como administrador):
```powershell
netsh advfirewall firewall delete rule name="Liberar Central - NextJS"
netsh advfirewall firewall delete rule name="Liberar Central - Java"
```

---

*Tecnologias implementadas com Arquitetura de Ponta a Ponta: Autenticação JWT Seguro, Exportador Invisível de planilhas CSV, Engine Dinâmica sem Loops infinitos e UI Glassmorphism Pura (Vanilla).*
