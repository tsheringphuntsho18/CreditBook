const db = require('../db/knex');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const getReceipt = async (req, res, next) => {
  try {
    const receipt = await db('receipts')
      .select('receipts.*', 'transactions.type', 'transactions.amount', 'transactions.description', 'transactions.reference_number', 'transactions.created_at as transaction_date', 'customers.name as customer_name', 'shops.name as shop_name', 'shops.address as shop_address', 'shops.phone as shop_phone')
      .leftJoin('transactions', 'receipts.transaction_id', 'transactions.id')
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin('shops', 'transactions.shop_id', 'shops.id')
      .where({ 'receipts.id': req.params.id })
      .first();

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    if (!receipt.pdf_path || !fs.existsSync(receipt.pdf_path)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${receipt.receipt_number}.pdf"`);

    const fileStream = fs.createReadStream(receipt.pdf_path);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const generateReceipt = async (req, res, next) => {
  try {
    const transactionId = req.params.transactionId;

    const transaction = await db('transactions')
      .select('transactions.*', 'customers.name as customer_name', 'shops.name as shop_name', 'shops.address as shop_address', 'shops.phone as shop_phone')
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin('shops', 'transactions.shop_id', 'shops.id')
      .where({ 'transactions.id': transactionId, 'transactions.shop_id': req.user.shop_id })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const existingReceipt = await db('receipts').where({ transaction_id: transactionId }).first();
    if (existingReceipt) {
      return res.json(existingReceipt);
    }

    const lastReceipt = await db('receipts')
      .where({ shop_id: req.user.shop_id })
      .orderBy('created_at', 'desc')
      .first();

    let receiptNumber = 1;
    if (lastReceipt) {
      const lastNum = parseInt(lastReceipt.receipt_number.split('-')[1]);
      receiptNumber = lastNum + 1;
    }

    const receiptPrefix = `RCP-${new Date().getFullYear()}`;
    const formattedNumber = String(receiptNumber).padStart(6, '0');
    const fullReceiptNumber = `${receiptPrefix}-${formattedNumber}`;

    const receiptsDir = path.join(__dirname, '../../../receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const pdfPath = path.join(receiptsDir, `${fullReceiptNumber}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).font('Helvetica-Bold').text(transaction.shop_name, { align: 'center' });
    doc.moveDown(0.5);

    if (transaction.shop_address) {
      doc.fontSize(10).font('Helvetica').text(transaction.shop_address, { align: 'center' });
    }
    if (transaction.shop_phone) {
      doc.fontSize(10).text(`Phone: ${transaction.shop_phone}`, { align: 'center' });
    }

    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica-Bold').text('RECEIPT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Receipt #: ${fullReceiptNumber}`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').text('Customer Details');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(11).text(`Name: ${transaction.customer_name}`);
    doc.text(`Date: ${new Date(transaction.transaction_date).toLocaleString()}`);
    doc.text(`Transaction Type: ${transaction.type.toUpperCase()}`);

    if (transaction.reference_number) {
      doc.text(`Reference: ${transaction.reference_number}`);
    }

    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').text('Transaction Details');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    doc.font('Helvetica').fontSize(11);
    doc.text('Description:', 50, tableTop);
    doc.text(transaction.description || 'N/A', 150, tableTop);

    doc.text('Amount:', 50, tableTop + 20);
    const amountText = transaction.type === 'credit'
      ? `- Nu. ${parseFloat(transaction.amount).toFixed(2)}`
      : `+ Nu. ${parseFloat(transaction.amount).toFixed(2)}`;
    doc.font('Helvetica-Bold').text(amountText, 150, tableTop + 20);

    const customer = await db('customers').where({ id: transaction.customer_id }).first();
    doc.text('Balance:', 50, tableTop + 40);
    doc.font('Helvetica-Bold').text(`Nu. ${parseFloat(customer.balance).toFixed(2)}`, 150, tableTop + 40);

    doc.moveDown(3);
    doc.font('Helvetica').fontSize(10).text('Thank you for your business!', { align: 'center' });

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const receipt = await db('receipts').insert({
      transaction_id: transactionId,
      receipt_number: fullReceiptNumber,
      pdf_path: pdfPath,
    }).returning('*');

    res.status(201).json(receipt[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getReceipt, generateReceipt };
