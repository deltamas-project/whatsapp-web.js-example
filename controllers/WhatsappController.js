// const puppeteer = require('puppeteer')
const qrcode = require('qrcode-terminal')
const { Client, LocalAuth } = require('whatsapp-web.js')

const client = new Client({
    authStrategy: new LocalAuth(),
    // puppeteer: { headless: false }
})

client.initialize()

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message)
})

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log('Client is ready!')
})

client.on('message', async msg => {
    try {
        if (msg.body == '!ping') {
            msg.reply('pong')
        } else if (msg.body.startsWith('!echo ')) {
            msg.reply(msg.body.slice(6))
        } else if (msg.body === '!groupinfo') {
            let chat = await msg.getChat()
            if (chat.isGroup) {
                console.log(chat)

                // get group metadata
                let groupMetadata = chat.groupMetadata

                let groupName = groupMetadata?.subject
                let groupDesc = groupMetadata?.desc
                let groupCreatedAt = groupMetadata?.creation?.toString()
                let totalGroupUser = groupMetadata?.size
                let owner

                if (groupMetadata?.owner) {
                    owner = groupMetadata?.owner?.user
                }

                console.log(owner)

                msg.reply(`
                    *Group Details*
                    Name: ${groupName}
                    Description: ${groupDesc}
                    Created At: ${groupCreatedAt}
                    Created By: ${owner}
                    Participant count: ${totalGroupUser}
                `)
            } else {
                msg.reply('This command can only be used in a group!')
            }
        } else if (msg.body === '!info') {
            let info = client.info
            client.sendMessage(msg.from, `
                *Connection info*
                User name: ${info.pushname}
                My number: ${info.wid.user}
                Platform: ${info.platform}
            `)
        }
    } catch (error) {
        console.error(error)
    }
})

const api = async (req, res) => {
    let phoneNumber = req.query.phoneNumber
    const message = req.query.message

    // Debug Mode
    console.log(phoneNumber, message)

    try {
        if (phoneNumber.startsWith('+')) {
            phoneNumber = phoneNumber.slice(1)
        } else if (phoneNumber.startsWith('0')) {
            phoneNumber = phoneNumber.slice(1)
        }

        // Format : 628xxxx@c.us
        phoneNumber = `62${phoneNumber}@c.us`

        const user = await client.isRegisteredUser(phoneNumber)
        if (user) {
            await client.sendMessage(phoneNumber, message)
            res.json({
                status: true,
                message: 'Message sent successfully!',
            })
        } else {
            res.json({
                status: false,
                message: 'User not registered!',
            })
        }
    } catch (error) {
        // Debug Mode
        console.error(error)

        res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = api