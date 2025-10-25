import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePrescriptionPdf = (prescription, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Typography setup and header
  doc.font('Helvetica');
  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#1f6feb')
    .text('EHR Medical Center', { align: 'center' })
    .moveDown(0.5);

  doc
    .font('Helvetica')
    .fontSize(16)
    .fillColor('#0f172a')
    .text('PRESCRIPTION', { align: 'center' })
    .moveDown();

  // Add a horizontal line
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke('#1f6feb')
    .moveDown(1);

  // Prescription details in a structured format (ID left, Date right)
  doc.fontSize(12).fillColor('#0f172a');
  const detailsY = doc.y;
  doc.text(`Prescription ID: ${prescription._id}`, 50, detailsY);
  // robust issued date: prefer issuedAt, fall back to createdAt, finally to now
  const issuedTimestamp = prescription.issuedAt || prescription.createdAt || Date.now();
  const issuedDateText = new Date(issuedTimestamp).toLocaleDateString();
  doc.text(`Date: ${issuedDateText}`, 420, detailsY);
  doc.moveDown();

  // Patient and Doctor information in boxes (no borders)
  const boxY = doc.y;
  const infoBoxHeight = 70;

  // Draw patient box background only (no border)
  doc.fillColor('#f8fafc').rect(50, boxY, 240, infoBoxHeight).fill();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('PATIENT INFORMATION', 60, boxY + 8);
  doc.font('Helvetica').fontSize(10).text(`Name: ${prescription.patientId?.name || 'N/A'}`, 60, boxY + 25);
  doc.text(`ID: ${prescription.patientId?._id || 'N/A'}`, 60, boxY + 38);
  // support both `dateOfBirth` and `dob` fields (some records use dob)
  const patientDob = prescription.patientId?.dateOfBirth || prescription.patientId?.dob || null;
  const patientDobText = patientDob ? new Date(patientDob).toLocaleDateString() : 'N/A';
  doc.text(`Date of Birth: ${patientDobText}`, 60, boxY + 51);

  // Draw doctor box background only (no border)
  doc.fillColor('#f8fafc').rect(310, boxY, 240, infoBoxHeight).fill();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('PRESCRIBING PHYSICIAN', 320, boxY + 8);
  doc.font('Helvetica').fontSize(10).text(`Name: ${prescription.doctorId?.name || 'N/A'}`, 320, boxY + 25);
  doc.text(`Specialization: ${prescription.doctorId?.specialization || 'N/A'}`, 320, boxY + 38);
  doc.text(`License: ${prescription.doctorId?.licenseNumber || 'N/A'}`, 320, boxY + 51);

  // add space after the boxes
  doc.moveDown(2.5);

  // Medications section with proper formatting
  // PRESCRIBED MEDICATIONS heading aligned left
  // PRESCRIBED MEDICATIONS heading explicitly placed at left margin
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#1f6feb');
  // use explicit x coordinate so it's flush with left content
  doc.text('PRESCRIBED MEDICATIONS', 50, doc.y);
  doc.moveDown(0.5);

  prescription.medications.forEach((med, index) => {
    const medBoxX = 50;
    const medBoxWidth = 500;
    const innerPadding = 12;

    // Prepare text pieces
    const title = `${index + 1}. ${med.name}`;
    const instructions = `Instructions: ${med.instructions || 'Take as directed'}`;
    const dosageText = `Dosage: ${med.dose || 'As directed'}`;
    const frequencyText = `Frequency: ${med.frequency || 'As directed'}`;
    const durationText = `Duration: ${med.duration || 'As directed'}`;

    // Measure heights with proper font sizes
    doc.fontSize(12);
    const titleHeight = doc.heightOfString(title, { width: medBoxWidth - innerPadding * 2 });

    doc.fontSize(10);
    // Split details into three columns and measure each column's height
    const col1Width = 160; // dosage
    const col2Width = 160; // frequency
    const col3Width = medBoxWidth - innerPadding * 2 - col1Width - col2Width; // duration

    const dosageH = doc.heightOfString(dosageText, { width: col1Width });
    const frequencyH = doc.heightOfString(frequencyText, { width: col2Width });
    const durationH = doc.heightOfString(durationText, { width: col3Width });
    const detailsHeight = Math.max(dosageH, frequencyH, durationH);

    const instrHeight = doc.heightOfString(instructions, { width: medBoxWidth - innerPadding * 2 });

    const medBoxHeight = innerPadding * 2 + titleHeight + 6 + detailsHeight + 6 + instrHeight;

    // If the box would overflow the page, add a page first
    let medBoxY = doc.y;
    const bottomLimit = doc.page.height - doc.page.margins.bottom - 60; // keep footer space
    if (medBoxY + medBoxHeight > bottomLimit) {
      doc.addPage();
      medBoxY = doc.y;
    }

  // Draw box background only (no border)
  doc.fillColor('#ffffff').rect(medBoxX, medBoxY, medBoxWidth, medBoxHeight).fill();

    // Write medication content inside the box with calculated positions
    const contentX = medBoxX + innerPadding;
    let cursorY = medBoxY + innerPadding;

  // Medicine name: bold, no underline, left aligned
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(title, contentX, cursorY);
    cursorY += titleHeight + 6;

    // Details columns
    doc.fontSize(10).text(dosageText, contentX, cursorY, { width: col1Width });
    doc.text(frequencyText, contentX + col1Width + 10, cursorY, { width: col2Width });
    doc.text(durationText, contentX + col1Width + col2Width + 20, cursorY, { width: col3Width });

    cursorY += detailsHeight + 6;

    doc.fontSize(10).text(instructions, contentX, cursorY, { width: medBoxWidth - innerPadding * 2 });

    // move the cursor below the box for the next item
    doc.y = medBoxY + medBoxHeight + 12;
  });

    // Notes section
  if (prescription.notes) {
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1f6feb').text('CLINICAL NOTES:').moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text(prescription.notes, { width: 500 });
  }

  // Footer with disclaimer
  doc.moveDown(2);
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke('#e2e8f0')
    .moveDown(0.5);

  // small spacer before signature/footer
  doc.moveDown(2);

  // Signature section - signature on left, date on right, same line
  const sigY = doc.y;
  // check a couple of likely locations for the signature image
  const candidatePaths = [
    path.join(process.cwd(), 'public', 'signatures', 'harsh-signature.png'),
    path.join(process.cwd(), 'backend', 'public', 'signatures', 'harsh-signature.png'),
  ];

  let signatureImagePath = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      signatureImagePath = p;
      break;
    }
  }

  const sigX = 50;
  const sigWidth = 120; // small signature width
  const sigHeightGuess = 40; // space to reserve under the signature

  if (signatureImagePath) {
    try {
      // Render signature image on the left
      doc.image(signatureImagePath, sigX, sigY, { width: sigWidth });
      // ensure cursor moves below the image
      doc.y = Math.max(doc.y, sigY + sigHeightGuess + 8);
    } catch (err) {
      // fallback to text if image rendering fails
      doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text('Physician Signature: ____________________', sigX, sigY);
      doc.y = sigY + 20;
    }
  } else {
    // no signature image present: signature line on left
    doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text('Physician Signature: ____________________', sigX, sigY);
    doc.y = sigY + 20;
  }

  doc.end();
};
