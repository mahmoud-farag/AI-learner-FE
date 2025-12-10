import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import customErrors from './customErrors.js';

const { InternalServerError } = customErrors;
/**
 * Extract text from PDF file
 * @param {string} fileBuffer – file buffer
 * @returns {Promise<{text: string, numPages: number}>}
 */
const parsePdf = async (params = {}) => {
  try {
    const { fileBuffer } = params;

    // const dataBuffer = await fs.readFile(filePath);

    // pdf-parse expects a Buffer or Uint8Array
    const parser = new PDFParse(new Uint8Array(fileBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info
    };

  } catch (error) {

    console.error("PDF parsing error:", error);

    throw new InternalServerError("Failed to extract text from PDF");
  }
};

export default parsePdf;
