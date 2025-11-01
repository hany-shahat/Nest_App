 import { EventEmitter } from 'node:events';
import { verifyEmailTemplate } from '../email/templates/verify.email.templates';
import Mail from 'nodemailer/lib/mailer';
import { sendEmail } from '../email/send.email';
import { OtpEnum } from 'src/common/enums';
interface IEmail extends Mail.Options{
  otp:string,
}
export const emailEvent = new EventEmitter();
emailEvent.on(OtpEnum.ConfirmEmail, async (data: IEmail) => {
    try {
      data.subject = OtpEnum.ConfirmEmail
      data.html = verifyEmailTemplate({ otp:data.otp, title: OtpEnum.ConfirmEmail })
      await sendEmail(data)
    } catch (error) {
      console.log(`Fail to send email` ,error);
    }
}) 
emailEvent.on(OtpEnum.ResetPassword, async (data: IEmail) => {
    try {
      data.subject = OtpEnum.ResetPassword
      data.html = verifyEmailTemplate({ otp:data.otp, title:data.subject})
      await sendEmail(data)
    } catch (error) {
      console.log(`Fail to send email` ,error);
    }
}) 