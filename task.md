# Central de Eventos - Checklist

## 1. Planejamento e Estrutura
- [x] Levantar requisitos e arquitetura a partir do plano anterior
- [x] Criar pastas base do projeto (backend e frontend)
- [x] Inicializar projeto frontend (Next.js com CSS Vanilla e pnpm)
- [x] Inicializar projeto backend (Spring Boot)
- [ ] Inicializar e configurar banco de dados MySQL

## 2. Desenvolvimento do Backend (Spring Boot)
- [ ] Configurar conexão MySQL no application.properties
- [x] Criar entidades de Base e Autenticação (User, Company)
- [x] Criar entidades de Domínio (Freelancer, Event, EventParticipation)
- [x] Configurar Spring Security e implementação do filtro JWT
- [x] Desenvolver Rotas de Auth (/api/auth/login)
- [x] Desenvolver Rotas para o Freelancer
- [x] Desenvolver Rotas de Eventos (filtragem por company_id)
- [x] Implementar integração do EventParticipation
- [x] Implementar exportação CSV

## 3. Desenvolvimento do Frontend (Next.js)
- [x] Configurar estrutura CSS Vanilla e layouts base
- [x] Implementar serviço de API, Auth Context e roteamento seguro
- [x] Desenvolver página pública de Login
- [x] Desenvolver Área do Freelancer
- [x] Desenvolver Painel da Empresa (Owner)
- [x] Desenvolver Painel Root
- [x] Conectar funções completas com a API

## 4. Testes e Validação Final
- [ ] Testar cenários de permissão de acesso via interface
- [ ] Confirmar o bloqueio de dados de outras empresas
- [ ] Validar extração final do arquivo CSV
