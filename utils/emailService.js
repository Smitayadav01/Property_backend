const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send welcome email to new users
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Welcome to ${process.env.SITE_NAME}! 🏠`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${process.env.SITE_NAME}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to ${process.env.SITE_NAME}!</h1>
              <p>Your trusted partner in real estate</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining ${process.env.SITE_NAME}! We're excited to help you find your dream property in the beautiful Vasai-Virar region.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">
                <strong>🔍 Browse Properties</strong><br>
                Explore thousands of verified properties in Vasai-Virar
              </div>
              <div class="feature">
                <strong>❤️ Save to Wishlist</strong><br>
                Keep track of properties you love
              </div>
              <div class="feature">
                <strong>📝 List Your Property</strong><br>
                List your property for FREE and reach genuine buyers
              </div>
              <div class="feature">
                <strong>💬 Direct Contact</strong><br>
                Connect directly with property owners
              </div>
              
              <p>Ready to start your property journey?</p>
              <a href="${process.env.SITE_URL}" class="button">Explore Properties</a>
              
              <p>If you have any questions, our team is here to help!</p>
              <p><strong>Contact us:</strong><br>
              📞 +91 9876543210<br>
              📧 info@vasaiproperties.com</p>
            </div>
            <div class="footer">
              <p>© 2024 ${process.env.SITE_NAME}. All rights reserved.</p>
              <p>Vasai-Virar, Palghar, Maharashtra</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send property listing confirmation to owner
const sendPropertyListedEmail = async (propertyData, ownerEmail, ownerName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: ownerEmail,
      subject: `🎉 Your Property is Now Live on ${process.env.SITE_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Property Listed Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .property-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .tip { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Property Listed Successfully!</h1>
              <p>Your property is now live on ${process.env.SITE_NAME}</p>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              
              <h2>Congratulations ${ownerName}!</h2>
              <p>Your property has been successfully listed on our platform and is now visible to thousands of potential buyers and tenants.</p>
              
              <div class="property-card">
                <h3>📋 Property Details:</h3>
                <p><strong>Title:</strong> ${propertyData.title}</p>
                <p><strong>Location:</strong> ${propertyData.location}</p>
                <p><strong>Type:</strong> ${propertyData.type.charAt(0).toUpperCase() + propertyData.type.slice(1)}</p>
                <p><strong>BHK:</strong> ${propertyData.bhk}</p>
                <p><strong>Price:</strong> ₹${propertyData.price.toLocaleString()}</p>
                <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">✅ LIVE</span></p>
              </div>
              
              <h3>🚀 What happens next?</h3>
              <ul>
                <li>Your property is now searchable on our website</li>
                <li>Interested buyers/tenants can contact you directly</li>
                <li>You'll receive email notifications for inquiries</li>
                <li>Our team will help promote your listing</li>
              </ul>
              
              <div class="tip">
                <h4>💡 Tips to get more inquiries:</h4>
                <ul>
                  <li>Add high-quality photos of your property</li>
                  <li>Write a detailed description highlighting key features</li>
                  <li>Keep your contact information updated</li>
                  <li>Respond quickly to inquiries</li>
                </ul>
              </div>
              
              <p>View your live property listing:</p>
              <a href="${process.env.SITE_URL}" class="button">View Property</a>
              
              <p><strong>Need help?</strong> Our support team is always ready to assist you!</p>
              <p>📞 +91 9876543210 | 📧 support@vasaiproperties.com</p>
            </div>
            <div class="footer">
              <p>© 2024 ${process.env.SITE_NAME}. All rights reserved.</p>
              <p>Thank you for choosing ${process.env.SITE_NAME}!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Property listed email sent to ${ownerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending property listed email:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification for new property
const sendAdminNotification = async (propertyData, ownerName, ownerEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `🏠 New Property Listed - ${propertyData.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Property Listed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .property-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 New Property Listed</h1>
              <p>Admin Notification</p>
            </div>
            <div class="content">
              <h2>New Property Submission</h2>
              <p>A new property has been listed on the platform.</p>
              
              <div class="property-info">
                <h3>Property Information:</h3>
                <p><strong>Title:</strong> ${propertyData.title}</p>
                <p><strong>Location:</strong> ${propertyData.location}</p>
                <p><strong>Type:</strong> ${propertyData.type.charAt(0).toUpperCase() + propertyData.type.slice(1)}</p>
                <p><strong>BHK:</strong> ${propertyData.bhk}</p>
                <p><strong>Price:</strong> ₹${propertyData.price.toLocaleString()}</p>
                <p><strong>Status:</strong> For ${propertyData.status}</p>
                <p><strong>Owner:</strong> ${ownerName}</p>
                <p><strong>Owner Email:</strong> ${ownerEmail}</p>
                <p><strong>Listed on:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>The property has been automatically approved and is now live on the website.</p>
              
              <a href="${process.env.SITE_URL}" class="button">View Website</a>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for property: ${propertyData.title}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

// Send inquiry notification to property owner
const sendInquiryNotification = async (propertyData, ownerEmail, ownerName, inquiryData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: ownerEmail,
      subject: `🔔 New Inquiry for Your Property: ${propertyData.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Property Inquiry</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .inquiry-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .contact-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Property Inquiry!</h1>
              <p>Someone is interested in your property</p>
            </div>
            <div class="content">
              <h2>Hello ${ownerName}!</h2>
              <p>Great news! You have received a new inquiry for your property listing on ${process.env.SITE_NAME}.</p>
              
              <div class="inquiry-card">
                <h3>📋 Property Details:</h3>
                <p><strong>Property:</strong> ${propertyData.title}</p>
                <p><strong>Location:</strong> ${propertyData.location}</p>
              </div>
              
              <div class="inquiry-card">
                <h3>👤 Inquirer Information:</h3>
                <p><strong>Name:</strong> ${inquiryData.name}</p>
                <p><strong>Email:</strong> ${inquiryData.email}</p>
                <p><strong>Phone:</strong> ${inquiryData.phone}</p>
                
                <h4>💬 Message:</h4>
                <div class="contact-info">
                  <p>"${inquiryData.message}"</p>
                </div>
              </div>
              
              <h3>📞 Next Steps:</h3>
              <ul>
                <li>Contact the inquirer as soon as possible</li>
                <li>Answer their questions about the property</li>
                <li>Schedule a property viewing if they're interested</li>
                <li>Be professional and responsive</li>
              </ul>
              
              <div class="contact-info">
                <h4>Quick Contact Options:</h4>
                <p>📞 <strong>Call:</strong> <a href="tel:${inquiryData.phone}">${inquiryData.phone}</a></p>
                <p>📧 <strong>Email:</strong> <a href="mailto:${inquiryData.email}">${inquiryData.email}</a></p>
              </div>
              
              <a href="${process.env.SITE_URL}" class="button">View Your Property</a>
              
              <p><strong>Tip:</strong> Quick responses lead to better conversion rates. Try to contact the inquirer within a few hours!</p>
            </div>
            <div class="footer">
              <p>© 2024 ${process.env.SITE_NAME}. All rights reserved.</p>
              <p>This inquiry was sent through ${process.env.SITE_NAME} platform</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Inquiry notification sent to ${ownerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending inquiry notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPropertyListedEmail,
  sendAdminNotification,
  sendInquiryNotification
};