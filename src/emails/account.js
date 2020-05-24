const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'andrewblyth90@gmail.com',
        subject: 'Welcome to the task app!',
        text: `Welcome to the app, ${name}. Let me know how you get on with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'andrewblyth90@gmail.com',
        subject: `We're sorry to see you go ${name}!`,
        text: 'Please let me know why you decided to leave so I can make future improvements!'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}