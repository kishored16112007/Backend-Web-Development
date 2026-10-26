
'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'otp') {
      const { email, otp } = job.data;

      await transporter.sendMail({
        from: process.env.SMTP_USER || 'no-reply@example.com',
        to: email,
        subject: 'Your Email Verification OTP',
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      });

      console.log(`OTP email sent to ${email}`);
    }
  },
  {
    connection,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed: ${error.message}`);
});

module.exports = worker;
