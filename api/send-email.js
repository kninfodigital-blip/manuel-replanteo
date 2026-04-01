import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, telefono, perfil, edicion, mensaje } = req.body;

  // Validar campos requeridos
  if (!nombre || !email || !telefono || !edicion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // DEBUG: ver variables de entorno (log sin mostrar contraseña completa)
  console.log('=== DEBUG CREDENTIALS ===');
  console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
  console.log('GMAIL_USER value:', process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASS exists:', !!process.env.GMAIL_APP_PASS);
  console.log('GMAIL_APP_PASS length:', process.env.GMAIL_APP_PASS ? process.env.GMAIL_APP_PASS.length : 0);
  console.log('========================');

  // Crear transporter de Gmail
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  // Construir el contenido del email
  let content = `
    <h2>📬 Nuevo formulario del curso de replanteo</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Edición:</strong> ${edicion}</p>
  `;

  if (perfil) {
    content += `<p><strong>Perfil profesional:</strong> ${perfil}</p>`;
  }

  if (mensaje) {
    content += `<p><strong>Mensaje:</strong> ${mensaje}</p>`;
  }

  content += `
    <hr>
    <p style="color: #666; font-size: 0.9rem;">
      Este email fue enviado automáticamente desde el formulario de la web.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"Formulario Web" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Nueva solicitud de información - ${nombre}`,
      html: content,
    });

    return res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ error: 'Error al enviar el email' });
  }
}
