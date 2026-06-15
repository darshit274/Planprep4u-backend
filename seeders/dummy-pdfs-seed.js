'use strict';

require('dotenv').config();
process.env.NODE_ENV = 'test';

const { v4: uuidv4 } = require('uuid');
const { Pdfs, PdfCategory, Admin, sequelize } = require('../models');
const path = require('path');
const fs = require('fs');

const ADMIN_ID = 'f69c5e54-5b6a-4a3b-9d1c-ab59860b4219';

// Minimal valid 1-page PDF bytes (base64 encoded)
const DUMMY_PDF_BASE64 = `JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmoKMiAwIG9iajw8L0tpZHMgWzMgMCBSXS9Db3VudCAxPj5lbmRvYmoKMyAwIG9iajw8L01lZGlhQm94IFswIDAgMyAzXT4+ZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbgoKdHJhaWxlcjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjE0NAolJUVPRg==`;

async function seed() {
  try {
    // ─── 1. Update folder pricing ──────────────────────────────────────────
    await PdfCategory.update(
      { access_level: 'free', price: 0, currency: 'INR' },
      { where: { id: 1 } } // Study Materials → free
    );
    await PdfCategory.update(
      { access_level: 'premium', price: 199, currency: 'INR' },
      { where: { id: 2 } } // Previous Year Papers → premium ₹199
    );
    await PdfCategory.update(
      { access_level: 'premium', price: 299, currency: 'INR' },
      { where: { id: 3 } } // Reference Books → premium ₹299
    );
    await PdfCategory.update(
      { access_level: 'free', price: 0, currency: 'INR' },
      { where: { id: 4 } } // Practice Sets → free
    );
    await PdfCategory.update(
      { access_level: 'free', price: 0, currency: 'INR' },
      { where: { id: 5 } } // Syllabus & Patterns → free
    );
    // Sub-folder 8 (materials under Study Materials) → mark as free override
    await PdfCategory.update(
      { is_free_override: true },
      { where: { id: 8 } }
    );

    console.log('✅ Folder pricing updated');

    // ─── 2. Create dummy PDF file on disk ─────────────────────────────────
    const uploadDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const dummyFilePath = path.join(uploadDir, 'dummy-sample.pdf');
    fs.writeFileSync(dummyFilePath, Buffer.from(DUMMY_PDF_BASE64, 'base64'));
    const dummyFileSize = fs.statSync(dummyFilePath).size;
    const relPath = 'uploads/pdfs/dummy-sample.pdf';

    console.log('✅ Dummy PDF file created at:', dummyFilePath);

    // ─── 3. Delete old dummy PDFs (clean re-seed) ─────────────────────────
    await Pdfs.destroy({ where: { uploaded_by: ADMIN_ID, title: { [require('sequelize').Op.like]: '[DEMO]%' } } });

    // ─── 4. Insert dummy PDFs ─────────────────────────────────────────────
    const pdfs = [
      // Free folder — Study Materials (id:1)
      {
        id: uuidv4(),
        title: '[DEMO] UPSC GS Paper 1 Notes',
        description: 'Comprehensive notes covering History, Geography and Indian Society for UPSC General Studies Paper 1.',
        category_id: 1,
        file_path: relPath,
        original_filename: 'UPSC_GS1_Notes.pdf',
        file_size: dummyFileSize,
        mime_type: 'application/pdf',
        access_level: 'free',
        is_free: true,
        price: 0,
        currency: 'INR',
        download_count: 142,
        view_count: 891,
        is_featured: true,
        is_active: true,
        tags: (['UPSC', 'GS Paper 1', 'History', 'Geography']),
        uploaded_by: ADMIN_ID,
      },
      {
        id: uuidv4(),
        title: '[DEMO] SSC CGL Quantitative Aptitude Shortcuts',
        description: 'Speed math tricks and shortcut formulas for SSC CGL Tier 1 and Tier 2 quantitative aptitude section.',
        category_id: 1,
        file_path: relPath,
        original_filename: 'SSC_CGL_Quant_Shortcuts.pdf',
        file_size: dummyFileSize * 2,
        mime_type: 'application/pdf',
        access_level: 'free',
        is_free: true,
        price: 0,
        currency: 'INR',
        download_count: 234,
        view_count: 1204,
        is_featured: false,
        is_active: true,
        tags: (['SSC CGL', 'Quantitative Aptitude', 'Math', 'Shortcuts']),
        uploaded_by: ADMIN_ID,
      },
      {
        id: uuidv4(),
        title: '[DEMO] Indian Polity – Laxmikanth Summary',
        description: 'Chapter-wise concise summary of M. Laxmikanth\'s Indian Polity. Ideal for quick revision before exams.',
        category_id: 8, // sub-folder (free override)
        file_path: relPath,
        original_filename: 'Indian_Polity_Laxmikanth_Summary.pdf',
        file_size: dummyFileSize * 3,
        mime_type: 'application/pdf',
        access_level: 'free',
        is_free: true,
        price: 0,
        currency: 'INR',
        download_count: 567,
        view_count: 2310,
        is_featured: true,
        is_active: true,
        tags: (['Polity', 'Laxmikanth', 'UPSC', 'Constitution']),
        uploaded_by: ADMIN_ID,
      },

      // Premium folder — Previous Year Papers (id:2) ₹199
      {
        id: uuidv4(),
        title: '[DEMO] UPSC Prelims Previous 10 Years Papers',
        description: 'Solved papers from UPSC Civil Services Preliminary Examination 2014–2023 with detailed explanations.',
        category_id: 2,
        file_path: relPath,
        original_filename: 'UPSC_Prelims_PYQ_10Years.pdf',
        file_size: dummyFileSize * 5,
        mime_type: 'application/pdf',
        access_level: 'premium',
        is_free: false,
        price: 0, // price resolved from folder
        currency: 'INR',
        download_count: 89,
        view_count: 445,
        is_featured: true,
        is_active: true,
        tags: (['UPSC', 'Previous Year Papers', 'Prelims', 'Solved']),
        uploaded_by: ADMIN_ID,
      },
      {
        id: uuidv4(),
        title: '[DEMO] SSC CGL Tier 1 Last 5 Years Solved Papers',
        description: 'Fully solved SSC CGL Tier 1 question papers from 2019 to 2023 with answer keys and solutions.',
        category_id: 2,
        file_path: relPath,
        original_filename: 'SSC_CGL_Tier1_PYQ_5Years.pdf',
        file_size: dummyFileSize * 4,
        mime_type: 'application/pdf',
        access_level: 'premium',
        is_free: false,
        price: 0,
        currency: 'INR',
        download_count: 61,
        view_count: 320,
        is_featured: false,
        is_active: true,
        tags: (['SSC CGL', 'Previous Year Papers', 'Tier 1', 'Solved']),
        uploaded_by: ADMIN_ID,
      },

      // Premium folder — Reference Books (id:3) ₹299
      {
        id: uuidv4(),
        title: '[DEMO] Complete Reasoning Book for Competitive Exams',
        description: 'Covers Verbal and Non-Verbal Reasoning with 500+ practice questions for SSC, Bank, Railway exams.',
        category_id: 3,
        file_path: relPath,
        original_filename: 'Complete_Reasoning_Book.pdf',
        file_size: dummyFileSize * 8,
        mime_type: 'application/pdf',
        access_level: 'premium',
        is_free: false,
        price: 0,
        currency: 'INR',
        download_count: 38,
        view_count: 211,
        is_featured: false,
        is_active: true,
        tags: (['Reasoning', 'Reference Book', 'SSC', 'Bank', 'Railway']),
        uploaded_by: ADMIN_ID,
      },

      // Free folder — Practice Sets (id:4)
      {
        id: uuidv4(),
        title: '[DEMO] IBPS PO Mock Test Set – 10 Full Tests',
        description: 'Practice with 10 full-length IBPS PO mock tests with solutions. Covers all sections as per latest pattern.',
        category_id: 4,
        file_path: relPath,
        original_filename: 'IBPS_PO_Mock_Tests.pdf',
        file_size: dummyFileSize * 6,
        mime_type: 'application/pdf',
        access_level: 'free',
        is_free: true,
        price: 0,
        currency: 'INR',
        download_count: 312,
        view_count: 1876,
        is_featured: false,
        is_active: true,
        tags: (['IBPS PO', 'Mock Test', 'Practice', 'Banking']),
        uploaded_by: ADMIN_ID,
      },
    ];

    await Pdfs.bulkCreate(pdfs);
    console.log(`✅ Inserted ${pdfs.length} dummy PDFs`);
    console.log('\nSummary:');
    console.log('  Free PDFs (Study Materials):     3');
    console.log('  Premium PDFs (PYQ, ₹199):        2');
    console.log('  Premium PDFs (Books, ₹299):      1');
    console.log('  Free PDFs (Practice Sets):       1');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
