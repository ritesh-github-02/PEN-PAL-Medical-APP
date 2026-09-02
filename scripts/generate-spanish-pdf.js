const fs = require('fs');
const { jsPDF } = require('jspdf');

function createSpanishOnePagePdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const tealColor = [18, 138, 150]; // #128a96
  const darkTeal = [14, 116, 126];
  const slateDark = [15, 23, 42];
  const slateText = [51, 65, 85];

  // Top Banner
  doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
  doc.rect(0, 0, 160, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ELIMINACIÓN DE LA ETIQUETA DE ALERGIA A LA PENICILINA', 14, 11);

  let y = 26;

  // Title: ¡Despídete de la etiqueta!
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('¡Despídete de la etiqueta!', 14, y);

  y += 7;
  doc.setFontSize(13);
  doc.text('Deshazte de tu alergia a la penicilina para siempre', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const introText = 'Las personas a menudo son etiquetadas como "alérgicas a la penicilina" si tienen una mala reacción a la amoxicilina o la penicilina. La mayoría de las veces, estas reacciones no son alergias reales o peligrosas.';
  const introLines = doc.splitTextToSize(introText, 105);
  doc.text(introLines, 14, y);

  y += introLines.length * 4 + 4;

  // Why does it matter?
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('¿Por qué es importante?', 14, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const whyText = 'La penicilina y la amoxicilina a menudo funcionan mejor para ciertas infecciones. Las personas que tienen alergia a la penicilina pueden recibir diferentes antibióticos que no funcionan tan bien. A veces estos otros antibióticos tienen más efectos secundarios. También pueden costar más y tener peor sabor.';
  const whyLines = doc.splitTextToSize(whyText, 105);
  doc.text(whyLines, 14, y);

  y += whyLines.length * 3.8 + 4;

  // Did you know?
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('¿Sabías que?', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const facts = [
    'Muchos niños desarrollan un sarpullido cuando reciben amoxicilina, porque tienen un virus y no una alergia',
    'Las alergias a la penicilina no se transmiten en las familias',
    'El 80% de las personas con verdadera alergia a la penicilina la superan en 10 años',
    'Un proveedor puede realizarle pruebas de forma segura administrándole una dosis de amoxicilina por vía oral'
  ];
  facts.forEach(f => {
    doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.circle(18, y - 1, 0.8, 'F');
    const fLines = doc.splitTextToSize(f, 98);
    doc.text(fLines, 21, y);
    y += fLines.length * 3.8 + 2;
  });

  // Right Side: Infographic Image
  const spanishImg = fs.readFileSync('public/images/Spanish.png');
  const spanishBase64 = 'data:image/png;base64,' + spanishImg.toString('base64');
  doc.addImage(spanishBase64, 'PNG', 124, 38, 72, 70);

  y = 126;

  // Take the Challenge!
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('¡Enfrente el desafío!', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const challenge1 = 'Si su médico cree que su alergia a la penicilina no es real, puede darle una dosis de amoxicilina.';
  doc.text(challenge1, 14, y);

  y += 5;
  const challenge2 = 'El médico y las enfermeras lo observarán durante 1 hora después de tomar el medicamento para asegurarse de que no sea alérgico. Si no hay signos de una reacción alérgica, ¡puede tomar antibióticos de penicilina con seguridad! Asegúrese de avisar a sus médicos y farmacia las buenas noticias.';
  const c2Lines = doc.splitTextToSize(challenge2, 182);
  doc.text(c2Lines, 14, y);

  y += c2Lines.length * 3.8 + 3;
  const challenge3 = 'Aunque nos esforzamos por determinar qué personas pueden hacerse la prueba de forma segura, todavía existe una pequeña posibilidad de que usted pueda tener una reacción alérgica. Es por eso que le damos el medicamento en un lugar seguro donde puede obtener ayuda de inmediato si es necesario.';
  const c3Lines = doc.splitTextToSize(challenge3, 182);
  doc.text(c3Lines, 14, y);

  y += c3Lines.length * 3.8 + 5;

  // Delayed Medication Reactions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text('Reacciones tardías a la medicación', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const delayed1 = 'Aunque no es muy común, hay algunas reacciones a medicamentos que pueden ocurrir muchos días después de recibir amoxicilina. Estas reacciones generalmente no conducen a problemas duraderos. Esto es lo que debe tener en cuenta:';
  const d1Lines = doc.splitTextToSize(delayed1, 182);
  doc.text(d1Lines, 14, y);

  y += d1Lines.length * 3.8 + 2.5;
  const delayedSymptoms = [
    'Dolor o hinchazón en las articulaciones',
    'Dolor y enrojecimiento en los ojos, la boca o la vagina',
    'Sarpullido (por ejemplo picazón, dolor en la piel o ampollas en la piel)',
    'Fiebre alta'
  ];
  delayedSymptoms.forEach(s => {
    doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.circle(18, y - 1, 0.8, 'F');
    doc.text(s, 21, y);
    y += 4.5;
  });

  y += 2;
  const emText = 'Si tiene estos síntomas, debe llamar a su proveedor o acudir a una atención de urgencia. Si los síntomas son graves (como tener problemas para respirar), vaya al Departamento de Emergencias de inmediato.';
  const emLines = doc.splitTextToSize(emText, 140);
  doc.text(emLines, 14, y);

  // Bottom right Connecticut Children's logo
  const logoImg = fs.readFileSync('public/images/connecticut-childrens-logo.png');
  const logoBase64 = 'data:image/png;base64,' + logoImg.toString('base64');
  doc.addImage(logoBase64, 'PNG', 158, y - 4, 38, 17.5);

  const buf = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync('public/documents/PEN-PAL_Folleto_Familiar_Grupo_Control.pdf', buf);
  console.log('Saved PEN-PAL_Folleto_Familiar_Grupo_Control.pdf successfully, size:', buf.length);
}

createSpanishOnePagePdf();
