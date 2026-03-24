# Arquitetura e Plano - Central de Eventos Full-Stack

## Visão Geral
Aplicação full-stack para gestão de eventos e controle de pagamentos de freelancers, com suporte a múltiplas empresas e controle de acesso hierárquico. 
- **Backend:** Java Spring Boot
- **Frontend:** Next.js
- **Banco de Dados:** MySQL

## Arquitetura de Permissões (Perfis de Acesso)
- **Root (Super Admin):** Acesso total a todas as empresas, todos os eventos e todos os usuários.
- **Company Owner (Dono da Empresa):** Acesso apenas à sua própria empresa, aos eventos que a diretoria da empresa criou e visualização das pessoas vinculadas a esses eventos.
- **Freelancer (Usuário Comum):** Acesso apenas ao seu próprio perfil para visualizar/alterar seus dados pessoais básicos e de pagamento.

## Banco de Dados (MySQL)
Criação de cinco tabelas principais:
1. `users`: Gerencia a autenticação (E-mail, Senha Criptografada, Perfil/Role: ROOT, OWNER, FREELANCER).
2. `company`: Representa as empresas contratantes (Nome, CNPJ).
3. `freelancer`: Perfil estendido vinculado a um user (Nome, Documento, Chave PIX, etc).
4. `event`: Eventos agora pertencem a uma company (Nome, Local, Data, Horário, company_id).
5. `event_participation`: Vínculo de Freelancers aos Eventos (event_id, freelancer_id, payment_amount, attended).

## Backend (Java Spring Boot)
- **Tecnologias:** Spring Web, Spring Data JPA, Spring Security, JWT, MySQL Connector, Lombok.
- **Autenticação:** `POST /api/auth/login` (Retorna token JWT).
- **Isolamento de Dados:** Eventos serão filtrados automaticamente pelo `company_id` vinculado ao "Dono da Empresa" logado. Usuários ROOT ignoram o filtro.
- **Endpoints:** Gestão de freelancers, eventos, exportação CSV.

## Frontend (Next.js)
- **Estilo:** CSS Vanilla (Mobile-First). Sem Tailwind. Estrutura de roteamento Next.js App Router (ou Pages, usar App por padrão atual).
- **Páginas Principais:**
  - Login (Única porta de entrada)
  - Área do Freelancer
  - Painel Empresarial (Donos)
  - Painel Root

## Plano de Verificação
- Garantir validação de tokens JWT.
- Simular tentativa de um Dono de Empresa acessar/editar informações de uma Empresa "concorrente" (esperado 403 Forbidden).
- Validar se o usuário freelancer consegue atualizar apenas seus próprios dados.
