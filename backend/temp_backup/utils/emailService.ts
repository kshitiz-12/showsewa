import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP Email
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"ShowSewa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your ShowSewa OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ShowSewa</h1>
            <p>Your Entertainment Booking Platform</p>
          </div>
          <div class="content">
            <h2>OTP Verification</h2>
            <p>Hello,</p>
            <p>Thank you for using ShowSewa! Use the following OTP to complete your verification:</p>
            <div class="otp-box">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            <p><strong>Important:</strong> Do not share this OTP with anyone for security reasons.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ShowSewa. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send Booking Confirmation Email
export const sendBookingConfirmation = async (
  email: string,
  name: string,
  bookingDetails: any
): Promise<void> => {
  const mailOptions = {
    from: `"ShowSewa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Booking Confirmation - ${bookingDetails.reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .total { font-size: 20px; color: #dc2626; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Reference: ${bookingDetails.reference}</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Your booking has been confirmed! Here are the details:</p>
            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Booking Reference:</span>
                <span class="value">${bookingDetails.reference}</span>
              </div>
              <div class="detail-row">
                <span class="label">Event/Movie:</span>
                <span class="value">${bookingDetails.itemName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="label">Seats:</span>
                <span class="value">${bookingDetails.seats}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value total">NPR ${bookingDetails.amount}</span>
              </div>
            </div>
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Save this email as your booking confirmation</li>
              <li>Arrive 15 minutes before the start time</li>
              <li>Show this booking reference at the venue</li>
            </ul>
            <p>Thank you for choosing ShowSewa!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ShowSewa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send Newsletter
export const sendNewsletter = async (
  email: string,
  subject: string,
  content: string
): Promise<void> => {
  const mailOptions = {
    from: `"ShowSewa Newsletter" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: content,
  };

  await transporter.sendMail(mailOptions);
};
