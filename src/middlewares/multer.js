const multer = require('multer');
const path = require('path'); // Asegúrate de importar `path`

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegúrate de que la carpeta exista
    cb(null, 'src/controllers/imagenes');
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo
    cb(null, Date.now() + path.extname(file.originalname)); // Extensión del archivo original
  }
});

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limita el tamaño del archivo a 5 MB (ajusta según sea necesario)
  fileFilter: (req, file, cb) => {
    // Filtra los tipos de archivos permitidos
    const filetypes = /jpeg|jpg|png|gif/; // Tipos de archivos permitidos
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Tipo de archivo no permitido.')); // Manejo de error
    }
  }
});

module.exports = upload;
