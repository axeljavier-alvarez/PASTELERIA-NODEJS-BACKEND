const multer = require('multer');
const path = require('path');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'src/imagenes'); // Verifica esta ruta
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Verifica el nombre
  }
});

const upload = multer({ storage: storage });

module.exports = upload;