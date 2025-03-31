import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename)
  }
})

export const upload = multer({ storage })
