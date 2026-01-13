# Documentação Completa da API Recanto

Base URL: `https://recanto-backend-production.up.railway.app`

---

## 1. Autenticação
### POST /login
- **Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```
- **Response:**
```json
"jwt_token"
```

---

## 2. Residentes
### GET /residents
- **Response:** Array de Residentes
### GET /residents/{id}
- **Response:** Resident
### POST /residents
- **Request:**
```json
{
  "name": "Fulano",
  "cpf": "000.000.000-00",
  "email": "fulano@email.com",
  "phoneNumber": "99 99999-9999",
  "adress": "Rua X, 123",
  "password": "senha123",
  "discount": 0,
  "profiles": ["ROLE_RESIDENT"],
  "date": "2026-01-12"
}
```
- **Response:** Resident criado
### PUT /residents/{id}
- **Request:** (igual ao POST)
- **Response:** Resident atualizado
### DELETE /residents/{id}
- **Response:** Resident removido

---

## 3. Funcionários
### GET /employees
### GET /employees/{id}
### POST /employees
- **Request:**
```json
{
  "name": "Funcionário",
  "cpf": "000.000.000-00",
  "email": "func@email.com",
  "password": "senha123",
  "profiles": ["ROLE_EMPLOYEE"],
  "date": "2026-01-12"
}
```
### PUT /employees/{id}
### DELETE /employees/{id}

---

## 4. Ocorrências
### GET /occurrences
### GET /occurrences/{id}
### POST /occurrences
- **Request:**
```json
{
  "title": "Barulho",
  "description": "Barulho alto às 22h",
  "situation": "Aberto",
  "openDate": "2026-01-12T22:00:00",
  "finishDate": null,
  "person": 1,
  "personName": "Fulano"
}
```
### PUT /occurrences/{id}
### DELETE /occurrences/{id}

---

## 5. Reservas
### GET /reservations
### GET /reservations/{id}
### POST /reservations
- **Request:**
```json
{
  "openDate": "2026-01-12T10:00:00",
  "reserveDate": "2026-01-20T18:00:00",
  "localReservation": "Salão de festas",
  "reservationAuthorite": "Admin",
  "person": 1,
  "personName": "Fulano",
  "time": "18:00"
}
```
### PUT /reservations/{id}
### DELETE /reservations/{id}

---

## 6. Financeiro (Pagamentos)
### GET /payments
### GET /payments/{id}
### POST /payments
- **Request:**
```json
{
  "title": "Mensalidade",
  "datePayment": "2026-01-31",
  "situation": "Pendente",
  "modePayment": "Boleto",
  "finishPayment": null,
  "cash": 100.00,
  "discount": 0,
  "person": 1,
  "personName": "Fulano",
  "obs": "",
  "adress": "Rua X, 123"
}
```
### PUT /payments/{id}
### DELETE /payments/{id}

---

## 7. Avisos
### GET /annoucements
### GET /annoucements/{id}
### POST /annoucements
- **Request:**
```json
{
  "title": "Manutenção",
  "person": 1,
  "description": "Manutenção na piscina dia 15/01",
  "dateOpen": "2026-01-12",
  "personName": "Admin"
}
```
### PUT /annoucements/{id}
### DELETE /annoucements/{id}

---

## 8. Endereços
### GET /adress
### GET /adress/{id}
### POST /adress
- **Request:**
```json
{
  "adress": "Rua das Flores, 123",
  "person": 1,
  "personName": "Fulano"
}
```
### PUT /adress/{id}
### DELETE /adress/{id}

---

## 9. Portaria (Concierge)
### GET /providers
### GET /providers/{id}
### POST /providers
- **Request:**
```json
{
  "title": "Entrega",
  "name": "Visitante",
  "document": "RG123456",
  "car": "ABC-1234",
  "description": "Entrega de encomenda",
  "situation": "Finalizado",
  "person": 1,
  "dateOpen": "2026-01-12T09:00:00",
  "dateFinish": "2026-01-12T09:30:00",
  "personName": "Porteiro"
}
```
### PUT /providers/{id}
### DELETE /providers/{id}

---

## Observações
- Todos os endpoints aceitam e retornam JSON.
- Autenticação via JWT é obrigatória para rotas protegidas.
- Os campos dos payloads seguem as interfaces do frontend.
- Adapte os exemplos conforme sua necessidade.

---

Se precisar de exemplos de código ou detalhes de algum endpoint, só pedir!
