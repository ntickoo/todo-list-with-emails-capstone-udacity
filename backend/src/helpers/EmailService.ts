import * as nodemailer from 'nodemailer';
import { Email } from '../models/Email';

const smtphost      = process.env.SMTP_HOST;
const smtpport      = Number(process.env.SMTP_PORT);
const smtpuser      = process.env.SMTP_USER;
const smtppassword  = process.env.SMTP_PASSWORD;




export class EmailService {
    constructor(private readonly transport = createEmailTransport()){}
    async sendMail(mail: Email) {
        const info = await this.transport.sendMail({
            from: "no-reply-todo-list@udacity.com",
            to: mail.to,
            subject: mail.subject,
            html: mail.body
        });

        console.log(`Message sent: %s`, info.response);
    }
}

function createEmailTransport() {
    return nodemailer.createTransport({
        host: smtphost,
        port: smtpport,
        auth: {
          user: smtpuser,
          pass: smtppassword
        }
      })
  }