import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  characterCount: number;
}

export class PdfExtractionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PdfExtractionError';
  }
}

/**
 * Extract text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise with extracted text and metadata
 */
export async function extractPdfText(file: File): Promise<PdfExtractionResult> {
  try {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new PdfExtractionError('Invalid file type. Please select a PDF file.', 'INVALID_TYPE');
    }

    // Check file size (limit to 50MB for performance)
    if (file.size > 50 * 1024 * 1024) {
      throw new PdfExtractionError('PDF file is too large. Please select a file smaller than 50MB.', 'FILE_TOO_LARGE');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable automatic font loading for better performance
      disableFontFace: true,
      // Set maximum allowed image size
      maxImageSize: 1024 * 1024
    });

    let pdfDocument;
    try {
      pdfDocument = await loadingTask.promise;
    } catch (error: any) {
      // Handle specific PDF loading errors
      if (error.name === 'PasswordException') {
        throw new PdfExtractionError('This PDF is password-protected and cannot be processed.', 'PASSWORD_PROTECTED');
      } else if (error.name === 'InvalidPDFException') {
        throw new PdfExtractionError('This file appears to be corrupted or is not a valid PDF.', 'INVALID_PDF');
      } else if (error.name === 'MissingPDFException') {
        throw new PdfExtractionError('PDF file could not be loaded.', 'MISSING_PDF');
      } else {
        throw new PdfExtractionError('Failed to load PDF file. Please try a different file.', 'LOAD_ERROR');
      }
    }

    const pageCount = pdfDocument.numPages;
    
    // Extract text from all pages
    const textPromises: Promise<string>[] = [];
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const pagePromise = pdfDocument.getPage(pageNum).then(async (page) => {
        try {
          const textContent = await page.getTextContent();
          
          // Combine all text items from the page
          const pageText = textContent.items
            .map((item: any) => {
              // Handle both string items and objects with 'str' property
              if (typeof item === 'string') {
                return item;
              } else if (item && typeof item.str === 'string') {
                return item.str;
              }
              return '';
            })
            .join(' ');
          
          return pageText;
        } catch (error) {
          console.warn(`Failed to extract text from page ${pageNum}:`, error);
          return `[Error extracting text from page ${pageNum}]`;
        }
      });
      
      textPromises.push(pagePromise);
    }

    // Wait for all pages to be processed
    const pageTexts = await Promise.all(textPromises);
    
    // Combine all page texts
    const fullText = pageTexts
      .filter(text => text.trim().length > 0)
      .join('\n\n')
      .trim();

    // Check if we actually extracted any text
    if (!fullText || fullText.length < 10) {
      throw new PdfExtractionError(
        'This PDF appears to contain only images or unextractable content. Please try a text-based PDF or copy and paste the content manually.',
        'NO_TEXT_CONTENT'
      );
    }

    return {
      text: fullText,
      pageCount: pageCount,
      characterCount: fullText.length
    };

  } catch (error) {
    // Re-throw PDF extraction errors as-is
    if (error instanceof PdfExtractionError) {
      throw error;
    }
    
    // Handle unexpected errors
    console.error('Unexpected error during PDF text extraction:', error);
    throw new PdfExtractionError(
      'An unexpected error occurred while processing the PDF. Please try again or use a different file.',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Check if a file is a PDF based on its type and extension
 * @param file - File to check
 * @returns true if file appears to be a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || 
         file.type.includes('pdf') || 
         file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Get user-friendly error message for PDF extraction errors
 * @param error - The error that occurred
 * @returns User-friendly error message
 */
export function getPdfErrorMessage(error: unknown): string {
  if (error instanceof PdfExtractionError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return `PDF processing failed: ${error.message}`;
  }
  
  return 'An unknown error occurred while processing the PDF file.';
}