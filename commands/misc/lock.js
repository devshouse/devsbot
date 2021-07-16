const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "lock",
    category: "moderation",
    execute: async (client, message, args) => {
if (!message.member.hasPermission('MANAGE_CHANNELS')) {
return message.reply('You dont have manage chanтels permissions');
  }

        const channels = message.guild.channels.cache.filter(ch => ch.type !== 'category');
        if (args[0] === 'on') {
            channels.forEach(channel => {
                channel.updateOverwrite(message.guild.roles.everyone, {
                    SEND_MESSAGES: false
                }).then(() => {
                    channel.setName(channel.name += `🔒`)
                })
            })
            return message.channel.send('locked all channels');
        } else if (args[0] === 'off') {
            channels.forEach(channel => {
                channel.updateOverwrite(message.guild.roles.everyone, {
                    SEND_MESSAGES: true
                }).then(() => {
                        channel.setName(channel.name.replace(':lock:', ''))
                    }
                )
            })
            return message.channel.send('unlocked all channels')
        }
    }
}
