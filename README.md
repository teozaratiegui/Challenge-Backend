# 📊 Excel Upload & Processing API

This API allows you to upload `.xlsx` files, validate them, and process their content asynchronously. It uses **MongoDB** for storage, **RabbitMQ** for background processing, and is containerized with **Docker Compose**.

---

## 🔧 Tech Stack
- **Node.js** + **Express** (API logic)
- **MongoDB** (stores parsed data and errors)
- **RabbitMQ** (queues and background job coordination)
- **Docker & Docker Compose** (container orchestration)
- **Yarn 4.9.0** (explicitly installed inside containers)


---

## 🚀 Quickstart

### 1. Clone & setup
```bash
git clone https://github.com/your-username/excel-api
cd excel-api
cp .env.example .env
```

### 2. Run the full stack (API + DB + Queue + Worker)
```bash
docker compose up --build
```
> If you experience any first-time connection issues, simply restart the containers.

---

## 🔐 API Authentication
All endpoints require specific API keys via the `api-key` header. These keys are defined in the `.env.example` file:
```env
API_KEY_UPLOAD=1182
API_KEY_STATUS=2002
API_KEY_DATA=1964
```

---

## 📥 Upload Workflow

### 🔼 Upload Excel
`POST /files`
- Header: `api-key: 1182`
- Form Data: `file` (must be a `.xlsx` file with `name`, `age`, `nums` headers)

✅ Example Response:
```json
{
  "taskId": "a4213d9a-891b-4bc4-8ea1-19222c807726"
}
```

### 🔍 Check Status
`GET /files/{id}?limit=10&offset=0`
- Header: `api-key: 2002`

✅ Response:
```json
{
  "status": "done",
  "errors": [{ "row": 5, "col": 3 }],
  "total": 12,
  "hasNext": true,
  "limit": 10,
  "offset": 0
}
```

### 📄 Get Valid Data
`GET /files/{uuid}/data?limit=10&offset=0`
- Header: `api-key: 1964`

✅ Response:
```json
{
  "total": 2,
  "hasNext": false,
  "limit": 10,
  "offset": 0,
  "data": [
    { "name": "Alice", "age": 30, "nums": [1, 2, 3] },
    { "name": "Bob", "age": 25, "nums": [4, 5] }
  ]
}
```
📚 API Docs

Interactive Swagger UI is available at:

👉 http://localhost:3000/api-docs/

⚠️ Note: When retrieving data from large Excel files (e.g. rows containing nums arrays with 5000+ items), Swagger may have trouble displaying such large payloads properly. It is recommended to use a smaller limit (e.g. 10) in Swagger or test through Postman, which handles larger responses more reliably (up to 100 records).
---

## 🧪 Run Tests
```bash
docker exec -it api yarn test
```
- Uses [Vitest](https://vitest.dev) for unit and integration tests

---

## ⚙️ Notes & Behavior
- The headers `name`, `age`, `nums` are required for the file to be processed
- Files with invalid structure are rejected immediately
- Worker uses **streaming** to process large files without memory issues
- Uploaded files are **automatically deleted** after processing


