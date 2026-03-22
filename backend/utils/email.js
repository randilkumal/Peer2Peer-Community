const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send approval email
exports.sendApprovalEmail = async (userEmail, userName, role) => {
  const transporter = createTransporter();
  
  const roleText = role === 'expert' ? 'Expert Student' : 'Lecturer';
  
  const mailOptions = {
    from: `"P2P Platform" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Your ${roleText} Account has been Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Account Approved!</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your <strong>${roleText}</strong> account has been approved by the admin.</p>
        <p>You can now log in and access all features of the platform.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Now
          </a>
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          P2P Platform Team
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error.message);
  }
};

// Send rejection email
exports.sendRejectionEmail = async (userEmail, userName, role, reason) => {
  const transporter = createTransporter();
  
  const roleText = role === 'expert' ? 'Expert Student' : 'Lecturer';
  
  const mailOptions = {
    from: `"P2P Platform" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Application Status - ${roleText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your interest in becoming a <strong>${roleText}</strong> on our platform.</p>
        <p>Unfortunately, your application could not be approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions, please contact the admin.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          P2P Platform Team
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error.message);
  }
};

// Send session notification
exports.sendSessionNotification = async (userEmail, userName, sessionTitle, sessionDetails) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"P2P Platform" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎓 Session Confirmed: ${sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Session Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>The session "<strong>${sessionTitle}</strong>" has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${sessionDetails.date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${sessionDetails.time}</p>
          ${sessionDetails.venue ? 
            `<p style="margin: 5px 0;"><strong>Venue:</strong> ${sessionDetails.venue}</p>` : ''}
          ${sessionDetails.onlineLink ? 
            `<p style="margin: 5px 0;"><strong>Link:</strong> <a href="${sessionDetails.onlineLink}">${sessionDetails.onlineLink}</a></p>` : ''}
        </div>
        <p>See you there!</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          P2P Platform Team
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Session notification sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error.message);
  }
};
