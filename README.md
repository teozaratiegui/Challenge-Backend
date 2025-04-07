# Excel Upload & Processing API

A scalable Node.js API to upload, validate and process `.xlsx` files asynchronously. The system enqueues the file, processes it in the background, stores both valid and erroneous records, and provides endpoints to query the job status and results.

---

## 📦 Requirements

- [Docker](https://www.docker.com/) (including Docker Compose) **must be installed** to run MongoDB and RabbitMQ containers.
- [Node.js](https://nodejs.org/) & [Yarn](https://yarnpkg.com/) installed locally to run the API.

MongoDB is used to persist the files, parsed records and error logs.  
RabbitMQ is used to decouple file uploads from processing using a messaging queue.

---

## ⚙️ Setup

Clone the repository:
```bash
git clone https://github.com/your-username/excel-api
cd excel-api
```

Install dependencies:
```bash
yarn install
```

Set up environment variables:
```bash
cp .env.example .env
```
---

## 🚀 Run the app

Launch the full system (API + MongoDB + RabbitMQ + Worker):
```bash
docker compose up --build
```

This will:
- Start MongoDB and RabbitMQ services
- Start the API server on `localhost:3000`
- Start the background worker

> 🔁 If some services fail to connect on first try, restart the containers.

---

## 📌 Endpoints

All endpoints require specific API keys. These must be passed using the appropriate headers.

### 1. Upload an Excel File
**POST** `/files`

Headers:
```
x-api-key: 1182
```
Body (multipart/form-data):
- `file`: Excel file (.xlsx)

Only files with headers: `name`, `age`, `nums` are accepted.

**Response**
```json
{
  "taskId": "a4213d9a-891b-4bc4-8ea1-19222c807726"
}
```

### 2. Check Job Status
**GET** `/files/{id}?limit=10&offset=0`

Headers:
```
x-api-key: 2002
```

**Response**
```json
{
  "status": "done",
  "total": 12,
  "hasNext": true,
  "limit": 10,
  "offset": 0
  "errors": [
    { "row": 5, "col": 3 }
  ],
}
```

### 3. Retrieve Valid Data
**GET** `/files/{uuid}/data?limit=10&offset=0`

Headers:
```
x-api-key: 1964
```

**Response**
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

---

## 🧪 Running tests

```bash
docker exec -it api yarn test
```
Integration and unit tests using Vitest.

---

## 🔧 Notes
- The worker uses streaming to process large Excel files efficiently, avoiding memory overload.
- Files are automatically deleted after being processed.
- Mapping validation is strict — the file must contain only `name`, `age`, `nums` in that order.

---

Good luck! 🚀

