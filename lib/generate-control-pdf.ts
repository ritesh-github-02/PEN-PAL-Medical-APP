import { jsPDF } from 'jspdf';

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateControlGroupPDF(locale: string = 'en'): Promise<void> {
  const isEs = locale === 'es';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const primaryTeal = [18, 138, 150]; // #128a96
  const darkNavy = [15, 23, 42]; // #0f172a
  const slateText = [51, 65, 85]; // slate-700
  const slateDark = [15, 23, 42]; // slate-900
  const slateMuted = [100, 116, 139]; // slate-500
  const cardBg = [248, 250, 252];
  const cardBorder = [226, 232, 240];

  // Load images in parallel
  const infoImgUrl = isEs ? '/images/Spanish.png' : '/images/English.png';
  const logoImgUrl = '/images/connecticut-childrens-logo.png';

  let infoBase64 = '';
  let logoBase64 = '';

  try {
    const [infoData, logoData] = await Promise.all([
      fetchImageAsBase64(infoImgUrl),
      fetchImageAsBase64(logoImgUrl),
    ]);
    infoBase64 = infoData;
    logoBase64 = logoData;
  } catch (err) {
    console.warn('Could not load one or more images for PDF generation:', err);
  }

  // =========================================================================
  // PAGE 1: Lose the Label & Infographic
  // =========================================================================
  let y = 10;

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(12, y, 186, 13, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEN-PAL  |  ' + (isEs ? 'Folleto Familiar del Grupo de Control' : 'Control Group Family Handout'), 18, y + 8.5);

  y += 16;

  // Sub-banner Tag
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.roundedRect(12, y, 186, 7.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(isEs ? 'ELIMINACIÓN DE LA ETIQUETA DE ALERGIA A LA PENICILINA' : 'PENICILLIN ALLERGY DELABELING', 16, y + 5);
  doc.text('PEN-PAL CLINICAL STUDY', 156, y + 5);

  y += 12;

  // Hero Section Title
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(isEs ? '¡Despídete de la etiqueta!' : 'Lose the Label!', 14, y);

  y += 6;
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.setFontSize(11);
  doc.text(isEs ? 'Deshazte de tu alergia a la penicilina para siempre' : 'Get rid of your penicillin allergy for good', 14, y);

  y += 5;
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  const introText = isEs
    ? 'Las personas a menudo son etiquetadas como "alérgicas a la penicilina" si tienen una mala reacción a la amoxicilina o la penicilina. La mayoría de las veces, estas reacciones no son alergias reales o peligrosas.'
    : 'People are often labeled as "penicillin allergic" if they have a bad reaction to amoxicillin or penicillin. Most of the time, these reactions are not real allergies or dangerous.';
  const introLines = doc.splitTextToSize(introText, 182);
  doc.text(introLines, 14, y);
  y += introLines.length * 4 + 3;

  // Two columns: Left (Why does it matter + Did you know), Right (Infographic)
  const colW = 88;
  const leftX = 12;
  const rightX = 106;
  const topColY = y;

  // Left Col - Box 1: Why does it matter?
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(leftX, topColY, colW, 44, 2, 2, 'FD');

  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(isEs ? '¿Por qué es importante?' : 'Why does it matter?', leftX + 5, topColY + 7);

  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  const whyText = isEs
    ? 'La penicilina y la amoxicilina a menudo funcionan mejor para ciertas infecciones. Las personas que tienen alergia a la penicilina pueden recibir diferentes antibióticos que no funcionan tan bien. A veces, estos otros antibióticos tienen más efectos secundarios. También pueden costar más y tener peor sabor.'
    : 'Penicillin and amoxicillin often work better for certain infections. People who have a penicillin allergy may get different antibiotics that do not work as well. Sometimes these other antibiotics have more side effects. They can also cost more and taste worse.';
  const whyLines = doc.splitTextToSize(whyText, colW - 10);
  doc.text(whyLines, leftX + 5, topColY + 13);

  // Left Col - Box 2: Did you know?
  const didYouKnowY = topColY + 48;
  doc.setFillColor(240, 249, 250); // #f0f9fa
  doc.setDrawColor(191, 231, 234); // #bfe7ea
  doc.roundedRect(leftX, didYouKnowY, colW, 76, 2, 2, 'FD');

  doc.setTextColor(13, 95, 103);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(isEs ? '¿Sabías que?' : 'Did you know?', leftX + 5, didYouKnowY + 7);

  const facts = isEs ? [
    'Muchos niños desarrollan una sarpullido cuando reciben amoxicilina, porque tienen un virus y no una alergia.',
    'Las alergias a la penicilina no se transmiten en la familia.',
    'El 80% de las personas con verdadera alergia a la penicilina la superan en 10 años.',
    'Un proveedor puede realizarle pruebas de forma segura administrándole una dosis de amoxicilina por vía oral.'
  ] : [
    'Many kids develop a rash when they get amoxicillin, because they have a virus and not an allergy.',
    'Penicillin allergies are not passed down in families.',
    '80% of people with true allergy to penicillin grow out of it in 10 years.',
    'A provider can safely test you by giving you a dose of amoxicillin by mouth.'
  ];

  let factY = didYouKnowY + 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(30, 41, 59);
  facts.forEach(f => {
    doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.circle(leftX + 7, factY - 1, 1, 'F');
    const fLines = doc.splitTextToSize(f, colW - 16);
    doc.text(fLines, leftX + 11, factY);
    factY += fLines.length * 3.8 + 2.5;
  });

  // Right Col: Infographic Image
  if (infoBase64) {
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(rightX, topColY, colW, 124, 2, 2, 'D');
    doc.addImage(infoBase64, 'PNG', rightX + 1, topColY + 1, colW - 2, 122);
  }

  // Footer Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('PEN-PAL CLINICAL RESEARCH PROTOCOL • ' + (isEs ? 'FOLLETO FAMILIAR DEL GRUPO DE CONTROL' : 'CONTROL GROUP FAMILY HANDOUT'), 14, 287);
  doc.text((isEs ? 'Página 1 de 2' : 'Page 1 of 2'), 180, 287);

  // =========================================================================
  // PAGE 2: Take the Challenge, Delayed Reactions & Connecticut Children Logo
  // =========================================================================
  doc.addPage();
  y = 10;

  // Header Banner Page 2
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(12, y, 186, 13, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEN-PAL  |  ' + (isEs ? 'Folleto Familiar del Grupo de Control' : 'Control Group Family Handout'), 18, y + 8.5);

  y += 18;

  // Section 1: Take the Challenge!
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(12, y, 186, 68, 2, 2, 'FD');

  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isEs ? '¡Enfrente el desafío!' : 'Take the Challenge!', 18, y + 8);

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  const leadP = isEs
    ? 'Si su médico cree que su alergia a la penicilina no es real, puede darle una dosis de amoxicilina.'
    : 'If your doctor believes that your penicillin allergy isn\'t real, they can give you a dose of amoxicillin.';
  doc.text(leadP, 18, y + 14);

  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const bodyP = isEs
    ? 'El médico y las enfermeras lo observarán durante 1 hora después de tomar el medicamento para asegurarse de que no sea alérgico. Si no hay signos de una reacción alérgica, ¡puede tomar antibióticos de penicilina con seguridad! Asegúrese de avisar a sus médicos y farmacia las buenas noticias.'
    : 'The doctor and nurses will watch you for 1 hour after taking the medicine to make sure you aren\'t allergic. If there are no signs of an allergic reaction, you can safely take penicillin antibiotics! Make sure you update your doctors and pharmacy with the good news.';
  const bodyPLines = doc.splitTextToSize(bodyP, 174);
  doc.text(bodyPLines, 18, y + 20);

  // Safety Callout inside Take the Challenge
  const calloutY = y + 21 + bodyPLines.length * 3.8;
  doc.setFillColor(240, 249, 250);
  doc.setDrawColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(18, calloutY, 174, 18, 'F');
  doc.setLineWidth(1.2);
  doc.line(18, calloutY, 18, calloutY + 18);
  doc.setLineWidth(0.2);

  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(7.4);
  const safetyText = isEs
    ? 'Aunque nos esforzamos por determinar qué personas pueden hacerse la prueba de forma segura, todavía existe una pequeña posibilidad de que usted pueda tener una reacción alérgica. Es por eso que le damos el medicamento en un lugar seguro donde puede obtener ayuda de inmediato si es necesario.'
    : 'Although we try hard to determine which people can be safely tested, there is still a small chance that you could have an allergic reaction. This is why we give you the medicine in a safe place where you can get help right away if needed.';
  const safetyLines = doc.splitTextToSize(safetyText, 166);
  doc.text(safetyLines, 22, calloutY + 5);

  y += 73;

  // Section 2: Delayed Medication Reactions
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(12, y, 186, 92, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isEs ? 'Reacciones tardías a la medicación' : 'Delayed Medication Reactions', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const delayedIntro = isEs
    ? 'Aunque no es muy común, hay algunas reacciones a medicamentos que pueden ocurrir muchos días después de recibir amoxicilina. Estas reacciones generalmente no conducen a problemas duraderos. Esto es lo que debe tener en cuenta:'
    : 'Although it is not very common, there are some medicine reactions that can occur many days after getting amoxicillin. These reactions do not usually lead to lasting problems. Here\'s what to watch out for:';
  const dLines = doc.splitTextToSize(delayedIntro, 174);
  doc.text(dLines, 18, y + 14);

  // 4 Reaction Boxes (2x2 Grid)
  const rCardW = 84;
  const rCardH = 12;
  const reactions = isEs ? [
    'Dolor o hinchazón en las articulaciones',
    'Dolor y enrojecimiento en ojos, boca o vagina',
    'Piel que se descama o se ampolla',
    'Fiebre con una erupción que se propaga'
  ] : [
    'Joint pain or swelling',
    'Pain and redness in eyes, mouth or vagina',
    'Skin that is peeling or blistering',
    'Fever with a spreading rash'
  ];

  const gridY = y + 15 + dLines.length * 3.8;
  // Row 1
  [0, 1].forEach(col => {
    const rx = col === 0 ? 18 : 108;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(rx, gridY, rCardW, rCardH, 1.5, 1.5, 'FD');
    doc.setFillColor(217, 119, 6); // amber-600
    doc.circle(rx + 4, gridY + 6, 1.2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(reactions[col], rx + 8, gridY + 7.5);
  });
  // Row 2
  [2, 3].forEach(col => {
    const rx = col === 2 ? 18 : 108;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(rx, gridY + 15, rCardW, rCardH, 1.5, 1.5, 'FD');
    doc.setFillColor(217, 119, 6);
    doc.circle(rx + 4, gridY + 21, 1.2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(reactions[col], rx + 8, gridY + 22.5);
  });

  // Emergency Callout Box
  const emY = gridY + 31;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(18, emY, 174, 18, 1.5, 1.5, 'FD');

  doc.setTextColor(120, 53, 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const emText = isEs
    ? 'Si tiene estos síntomas, debe llamar a su proveedor o acudir a una atención de urgencia. Si los síntomas son graves (como tener problemas para respirar), vaya al Departamento de Emergencias de inmediato.'
    : 'If you have these symptoms, you should call your provider or go to an urgent care. If the symptoms are severe (like having problems breathing), go to the Emergency Department right away.';
  const emLines = doc.splitTextToSize(emText, 168);
  doc.text(emLines, 21, emY + 5.5);

  y += 96;

  // Connecticut Children's Official Logo
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 75, y, 60, 27.6);
  }

  // Bottom text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('© ' + new Date().getFullYear() + ' PEN-PAL CLINICAL RESEARCH PROTOCOL • ' + (isEs ? 'FOLLETO FAMILIAR DEL GRUPO DE CONTROL' : 'CONTROL GROUP FAMILY HANDOUT'), 105, y + 33, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Protocol ID: PENPAL-2026-CTL  •  IRB Approved', 105, y + 37, { align: 'center' });

  // Footer Page 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text('PEN-PAL CLINICAL RESEARCH PROTOCOL • ' + (isEs ? 'FOLLETO FAMILIAR DEL GRUPO DE CONTROL' : 'CONTROL GROUP FAMILY HANDOUT'), 14, 287);
  doc.text((isEs ? 'Página 2 de 2' : 'Page 2 of 2'), 180, 287);

  // Trigger file download directly in browser
  const filename = isEs ? 'PEN-PAL_Folleto_Familiar_Grupo_Control.pdf' : 'PEN-PAL_Control_Group_Family_Handout.pdf';
  doc.save(filename);
}
