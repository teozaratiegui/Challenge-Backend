import axios from 'axios'

const runSimultaneousRequests = async () => {
  const fileId1 = 'eeb7276d-4346-4967-81fa-62b0a107c2b6' // Cambiar por tu UUID si querés
  const page = 1
  const url1 = `http://localhost:3000/files/${fileId1}?page=${page}`

  const fileId2 = '3ef6e57b-1f37-4859-984b-f8cce4827c23'
  const url2 = `http://localhost:3000/files/${fileId2}?page=${page}`

  console.time('Concurrent Requests')

  const headers = {
    'api-key': 2002
  }

  const request1 = axios.get(url1, { headers })
  const request2 = axios.get(url2, { headers })

  const [response1, response2] = await Promise.allSettled([request1, request2])

  console.timeEnd('Concurrent Requests')

  console.log('\n🔹 Resultado 1:')
  if (response1.status === 'fulfilled') {
    console.dir(response1.value.data, { depth: null })
  } else {
    console.error(response1.reason)
  }

  console.log('\n🔹 Resultado 2:')
  if (response2.status === 'fulfilled') {
    console.dir(response2.value.data, { depth: null })
  } else {
    console.error(response2.reason)
  }
}

runSimultaneousRequests()
