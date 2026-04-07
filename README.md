
## API Documentation

### Base URL

```
http://localhost:3000/
```

```
https://git-pix.vercel.app/
```

---

## Upload Image

Uploads an image to the repository and returns a publicly accessible URL.

### Endpoint

```
POST /api/upload
```

---

### Request Body

```json
{
  "imageBase64": "string",
  "fileName": "string",
  "password": "string"
}
```

---

### Parameters

| Field       | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| imageBase64 | string | Yes      | Base64-encoded image string (without data URI prefix) |
| fileName    | string | Yes      | Original file name including extension                |
| password    | string | Yes      | Application password for authentication               |

---

### Example Request

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "<base64_string>",
    "fileName": "image.png",
    "password": "your_password"
  }'
```

---

### Success Response

```json
{
  "url": "https://raw.githubusercontent.com/<user>/<repo>/main/images/<file>"
}
```

---

### Error Responses

#### Unauthorized

```json
{
  "error": "Unauthorized"
}
```

#### Bad Request

```json
{
  "error": "Missing fields"
}
```

#### Upload Failure

```json
{
  "error": "GitHub upload failed"
}
```

---
