export const sendEmail = async ({ to, subject, text }) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[EmailService] Queued email', { to, subject, text });
  }
  return true;
};
