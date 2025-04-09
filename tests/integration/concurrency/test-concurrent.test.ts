import { describe, it, expect } from 'vitest'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'

const sendFile = async (filePath: string) => {
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath))

  return axios.post('http://localhost:3000/files', form, {
    headers: {
      ...form.getHeaders(),
      'api-key': '1182'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
}

describe('Upload heavy xlsx file concurrently', () => {
  it('should handle two concurrent heavy file uploads', async () => {
    const filePath = path.resolve(__dirname, 'test_file.xlsx')

    console.time('Concurrent Uploads')

    const request1 = sendFile(filePath)
    const request2 = sendFile(filePath)

    const [res1, res2] = await Promise.allSettled([request1, request2])
    console.timeEnd('Concurrent Uploads')

    expect(res1.status).toBe('fulfilled')
    expect(res2.status).toBe('fulfilled')

    if (res1.status === 'fulfilled') {
      expect(res1.value.data).toHaveProperty('taskId')
    }

    if (res2.status === 'fulfilled') {
      expect(res2.value.data).toHaveProperty('taskId')
    }
  }, 40000)
})
