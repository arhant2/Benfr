const path = require('path');

const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

const emailTemplatedCompiled = pug.compileFile(
  path.join(__dirname, '../views/email/index.pug')
);

const orderEmailTemplateCompiled = pug.compileFile(
  path.join(__dirname, '../views/email/order.pug')
);

module.exports = class Email {
  constructor({ email, name }, baseUrl) {
    this.to = email;
    this.firstName = (name || 'user').split(' ')[0];
    this.from = `${process.env.EMAIL_BY} <${process.env.EMAIL_FROM}>`;
    this.baseUrl = baseUrl;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(html, subject, attachments) {
    // 1) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html, {
        baseElement: '*',
        tags: { img: { format: 'skip' } },
      }),
    };

    if (attachments) {
      mailOptions.attachments = attachments;
    }

    // 2) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const subject = 'Welcome to Benfr Family';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Greeting from Benfr for joining our family!',
      heading: 'Welcome to Benfr Family!',
      text: `Hello ${this.firstName},<br>I ceo of Benfr, give you a warm welcome to the Benfr Family. Now you can, explore the Benfr Family. Explore the whole new world. Just click the button below to get started.`,
      link: {
        href: this.baseUrl,
        text: 'Explore now',
      },
    });

    await this.send(html, subject);
  }

  async sendSignup({ relativeUrl, time }) {
    const subject = `Complete signup request on Benfr(Link Valid for ${time})`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Greeting from Benfr for joining our family!',
      heading: 'Welcome to Benfr Family!',
      text: `Hello user,<br>Please confirm your signup on Benfr by clicking the button below.<br>If you haven't made the request, kindly ignore this email.`,
      link: {
        href: `${this.baseUrl}${relativeUrl}`,
        text: 'Complete signup',
      },
    });

    await this.send(html, subject);
  }

  async sendEmailChangeOtpToNewEmail({ otp, time }) {
    const subject = `Otp to add your email to an existing account on Benfr(Valid for ${time})`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader:
        'We have received a request to add your email to an existing on Benfr',
      heading: `Otp to add your email to an existing account on Benfr(Valid for ${time})`,
      text: `Hello user,<br>We have received a request to add your email to an esisting on Benfr.Otp for the same is <strong>${otp}</strong><br>If you haven't made the request, kindly ignore this email.<br>Please don't share otp with anyone even if the person claims to be a Benfr Employee.`,
    });

    await this.send(html, subject);
  }

  async sendEmailChangeOtpToOldEmail({ otp, time }) {
    const subject = `Otp to change email on Benfr(Valid for ${time})`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'We have received a request to change your email on Benfr',
      heading: `Otp to change email on Benfr(Valid for ${time})`,
      text: `Hello ${this.firstName},<br>We have received a request to change your email on Benfr. Otp for the same is <strong>${otp}</strong><br>If you haven't made the request, your account may be at risk, kindly change your password as soon as possible and contact admin at Benfr.<br>Please don't share otp with anyone even if the person claims to be a Benfr Employee.`,
    });

    await this.send(html, subject);
  }

  async sendEmailChangeConfirmationToNewEmail() {
    const subject = 'Successfully added your email to Benfr account';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your email has been successfully added to Benfr account',
      heading: 'Successfully added your email to Benfr account',
      text: `Hello ${this.firstName},<br>Your email has been sucessfully added to Benfr. Now you can login using this email.<br>Kindly note that you will note be able to login with old email now and you will receive all future communications on this email.<br>Happy Shopping :)`,
      link: {
        href: this.baseUrl,
        text: 'Shop Now',
      },
    });

    await this.send(html, subject);
  }

  async sendEmailChangeConfirmationToOldEmail() {
    const subject = 'Successfully changed your email on Benfr';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your account has been successfully added to Benfr account',
      heading: 'Successfully changed your email on Benfr',
      text: `Hello ${this.firstName},<br>This is to inform you that your email has been sucessfully changed to Benfr. Now you can login the new email.<br>Kindly note that you will note be able to login with this email now and you will receive all future communications on the new email.<br>If you have any query, contact admin at Benfr.<br>Happy Shopping :)`,
      link: {
        href: this.baseUrl,
        text: 'Shop Now',
      },
    });

    await this.send(html, subject);
  }

  async sendPasswordResetToken({ relativeUrl, time }) {
    const subject = `Forgot your password (Link valid for ${time})`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'To reset your password click on the link',
      heading: `Forgot your password (Link valid for ${time})`,
      text: `Hello ${this.firstName},<br>We got to know you forgot your password. Don't worry just click the button below to reset your password.<br>If you haven't made this request, you are safe, kindly ignore this email. Please don't share the link with anyone if the person claims to be Benfr Employee.`,
      link: {
        href: `${this.baseUrl}${relativeUrl}`,
        text: 'Reset Password',
      },
    });

    await this.send(html, subject);
  }

  async sendPasswordResetConfirmation({ date }) {
    const subject = `Password reset sucessfully`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader:
        'This is to inform your password has been sucessfully reseted.',
      heading: 'Password reset sucessfully',
      text: `Hello ${this.firstName},<br>This is to inform your password on Benfr has been reseted sucessfully at ${date}.<br>Please don't share your login details with anyone even if the person claims to be a Benfr employee.<br>Happy Shopping :)`,
    });

    await this.send(html, subject);
  }

  async sendPasswordUpdateConfirmation({ date }) {
    const subject = `Password update sucessfully`;

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader:
        'This is to inform your password has been sucessfully updated.',
      heading: 'Password updated sucessfully',
      text: `Hello ${this.firstName},<br>This is to inform your password on Benfr has been updated sucessfully at ${date}.<br>Please don't share your login details with anyone even if the person claims to be a Benfr employee.<br>Happy Shopping :)`,
    });

    await this.send(html, subject);
  }

  async sendReviewDeleteAlert({ title, body }) {
    const subject = 'Review removed';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader:
        'This is to inform that your review seems to voilate guidlines of Benfr',
      heading: 'Review removed',
      text: `Hello ${this.firstName},
      <br>
      This is to inform you that the following review written by you seems to voilate the guidlines of Benfr
      <br>
      <br>
      Title: ${title}
      <br>
      Body: ${body}
      <br>
      <br>
      Your review has been deleted.
      Giving such reviews in future may even lead to your account suspension and strict actions may be taken. If you think this is a mistake, please contact admin at Benfr.
      `,
    });

    await this.send(html, subject);
  }

  async sendAccountSuspesionAlertDueToSpamming() {
    const subject = 'Account suspension';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'You have been detected as spammer',
      heading: 'Account suspension',
      text: `Hello ${this.firstName},<br>This is to inform you that you have been detected as spammer by our systems and hence your account has been suspended.<br>If you have any queries contact admin at Benfr.`,
    });

    await this.send(html, subject);
  }

  async sendAccountSuspesionAlertByAdmin({ reason }) {
    const subject = 'Account suspension';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your account on Benfr has been suspended',
      heading: 'Account suspension',
      text: `Hello ${this.firstName},
      <br>
      This is to inform you that your account on Benfr has been suspended.
      <br>
      <br>
      Reason: ${reason}
      <br>
      If you have any queries contact admin at Benfr.`,
    });

    await this.send(html, subject);
  }

  async sendAccountReactivationAlert() {
    const subject = 'Account Reactivation';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your account on Benfr has been reactivated',
      heading: 'Account Reactivation',
      text: `Hello ${this.firstName},<br>We are happy to inform you, your account on Benfr has been reactivated. Now you can login back to your account and do what you want, but remember to follow benfr guildlines while doing the same.<br>Happy Shopping :)`,
      link: {
        href: this.baseUrl,
        text: 'Shop Now',
      },
    });

    await this.send(html, subject);
  }

  // ==============================================
  //                    Order
  // ==============================================

  async sendOrderBookedAlert({ order }) {
    const subject = 'Order Sucessfully placed';

    const html = orderEmailTemplateCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Thank you for the order on Benfr',
      heading: 'Thank you for your order!',
      text: `Hello ${this.firstName},<br>Your order has been sucessfully placed on the Benfr. Please find your order summary.`,
      order,
    });

    await this.send(html, subject);
  }

  async sendOrderConfirmedAlert({ order }) {
    const subject = 'Order Confirmed';

    const html = orderEmailTemplateCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your order has been confirmed',
      heading: 'Your order has been confirmed!',
      text: `Hello ${this.firstName},<br>Your order has been confirmed successfully. Please find your updated order summary below.`,
      order,
    });

    await this.send(html, subject);
  }

  async sendOrderPackedAlert({ order }) {
    const subject = 'Order Packed';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your order has been packed',
      heading: `Your order #${order.id} has been packed!`,
      text: `Hello ${this.firstName},<br>Your order #${order.id} has been packed.`,
    });

    await this.send(html, subject);
  }

  async sendOrderShippedAlert({ order }) {
    const subject = 'Order Shipped';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your order has been shipped',
      heading: `Your order #${order.id} has been shipped!`,
      text: `Hello ${this.firstName},<br>Your order #${order.id} has been shipped. Please keep the change ready.`,
    });

    await this.send(html, subject);
  }

  async sendOrderDeliveredAlert({ order, invoice }) {
    const subject = 'Order Delivered';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your order has been delivered',
      heading: `Your order #${order.id} has been delivered!`,
      text: `Hello ${this.firstName},<br>Your order #${order.id} has been delivered. Please find the attachment attached.`,
    });

    const attachments = [
      {
        filename: `invoice-${order.id}.pdf`,
        content: invoice,
      },
    ];

    await this.send(html, subject, attachments);
  }

  async sendOrderCancellationByUserAlert({ order }) {
    const subject = 'Order Cancelled';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'As per your request, your order has been cancelled',
      heading: `Your order #${order.id} has been cancelled!`,
      text: `Hello ${this.firstName},<br>As per your request, your order #${order.id} has been cancelled.<br>If you any issue, please contact admin at Benfr.`,
    });

    await this.send(html, subject);
  }

  async sendOrderCancellationByAdminAlert({ order, reason }) {
    const subject = 'Order Cancelled';

    const html = emailTemplatedCompiled({
      subject,
      baseUrl: this.baseUrl,
      preheader: 'Your order has been cancelled',
      heading: `Your order #${order.id} has been cancelled!`,
      text: `Hello ${this.firstName},
      <br>
      We are sorry to inform that your order #${order.id} has been cancelled.
      <br>
      <br>
      Reason for cancellation: ${reason}
      <br>
      <br>
      If you any issue, please contact admin at Benfr.`,
    });

    await this.send(html, subject);
  }
};
