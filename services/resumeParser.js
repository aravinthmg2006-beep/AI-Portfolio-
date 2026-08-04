const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

/**
 * Parse resume PDF file and extract text
 * @param {string|Object} fileOrPath - Path string or Multer file object
 * @returns {Promise<string>} Extracted text from PDF
 */
const parseResumePDF = async (fileOrPath) => {
  try {
    let dataBuffer;

    if (typeof fileOrPath === 'string') {
      if (!fs.existsSync(fileOrPath)) {
        throw new Error('File not found');
      }
      const ext = path.extname(fileOrPath).toLowerCase();
      if (ext !== '.pdf') {
        throw new Error('Only PDF files are allowed');
      }
      const stats = fs.statSync(fileOrPath);
      if (stats.size / (1024 * 1024) > 5) {
        throw new Error('File size exceeds 5MB limit');
      }
      dataBuffer = fs.readFileSync(fileOrPath);
    } else if (fileOrPath && fileOrPath.path) {
      const stats = fs.statSync(fileOrPath.path);
      if (stats.size / (1024 * 1024) > 5) {
        throw new Error('File size exceeds 5MB limit');
      }
      dataBuffer = fs.readFileSync(fileOrPath.path);
    } else if (fileOrPath && fileOrPath.buffer) {
      dataBuffer = fileOrPath.buffer;
    } else {
      throw new Error('Invalid PDF file provided');
    }

    const data = await pdf(dataBuffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Unable to read this resume. Please upload a valid text-based PDF.');
    }

    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error.message);
    if (error.message.includes('Unable to read this resume')) {
      throw error;
    }
    throw new Error(`Unable to read this resume. Please upload a valid text-based PDF.`);
  }
};

/**
 * Convenience alias method
 */
const parseResume = async (fileOrPath) => {
  return await parseResumePDF(fileOrPath);
};

/**
 * Save uploaded file to uploads directory
 */
const saveUploadedFile = (file, folder) => {
  return new Promise((resolve) => {
    try {
      const uploadDir = path.join(__dirname, '..', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname || '.png');
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path && fs.existsSync(file.path)) {
        fs.copyFileSync(file.path, filePath);
      } else {
        return resolve(null);
      }

      const relativePath = path.join('uploads', folder, filename).replace(/\\/g, '/');
      resolve(relativePath);
    } catch (error) {
      console.warn('Warning: Could not save uploaded file to local disk:', error.message);
      resolve(null);
    }
  });
};

/**
 * Delete file from uploads directory
 */
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  parseResumePDF,
  parseResume,
  saveUploadedFile,
  deleteFile
};