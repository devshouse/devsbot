const mySecret = process.env['TOKEN'];
const discord = require('discord.js');
const keepAlive = require('./server');
const client = new discord.Client();
const prefix = ';';
const fs = require('fs');
const db = require('quick.db');
client.commands = new discord.Collection();
const { MessageEmbed } = require('discord.js');

client.on('messageDelete', async message => {
	db.set(`snipemsg_${message.channel.id}`, message.content);
	db.set(`snipesender_${message.channel.id}`, message.author.id);
});

client.on('message', message => {
	if (message.content === ';snipe') {
		const msg = db.get(`snipemsg_${message.channel.id}`);
		const senderid = db.get(`snipesender_${message.channel.id}`);
		if (!msg) {
			return message.channel.send(`There is nothing to snipe.`);
		}
		const embed = new MessageEmbed()
			.setTitle(
				client.users.cache.get(senderid).username,
				client.users.cache
					.get(senderid)
					.displayAvatarURL({ format: 'png', dynamic: true })
			)
			.setDescription(msg)
			.setColor('RANDOM')
			.setTimestamp();
		message.channel.send(embed);
	}
});

client.on('message', message => {
	if (message.content === ';help') {
		let embed = new MessageEmbed()
			.setAuthor(
				client.user.username,
				client.user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					size: 1024
				}),
				'https://github.com/'
			)
			.setThumbnail(
				client.user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					size: 1024
				})
			)
			.setTitle('Help')
			.addField(
				`🤖Our bot prefix is ";"`,
				'If you would like to use any of the commands use it like that ;[command]'
			)
			.addField(
				`🔍 Snipe`,
				'To see the latest deleted massage in the channel you are typing it!'
			)
			.addField('✨ Example:', '➡️ ;snipe')
			.addField('📰 Wiki', `Search something in wikipidea!`)
			.addField('✨ Example:', `➡️ ;wiki USA`)
			.addField(`🟩Color`, `Use color’s hex code to see what color it is!`)
			.addField('✨ Example:', '➡️ ;color 6383\n➡️ ;color #6383')
			.setFooter('Made with 💖 and discord.js by Devs House team')
			.setColor('RANDOM');
		message.channel.send(embed);
	}
});

fs.readdirSync('./commands').forEach(dirs => {
	const commands = fs
		.readdirSync(`./commands/${dirs}`)
		.filter(files => files.endsWith('.js'));

	for (const file of commands) {
		const command = require(`./commands/${dirs}/${file}`);
		if (!command || !command.name) return;
		client.commands.set(command.name.toLowerCase(), command);
	}
});

client.on('error', e => console.error(e));
client.on('warn', e => console.warn(e));
client.on('debug', e => console.info(e));

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity(`Dev's Blog|;help`, { type: `WATCHING` });
});

client.on('message', message => {
	if (message.author.bot || message.channel.type === 'dm') {
		return;
	}

	if (message.content.indexOf(prefix) !== 0) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();

	const cmd =
		client.commands.get(command) ||
		client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

	if (!cmd) {
		return;
	}

	try {
		if (cmd) cmd.run(client, message, args);
	} catch (err) {
		console.log(err);
	}

	try {
		if (cmd) cmd.execute(client, message, args);
	} catch (err) {
		console.log(err);
	}
});

keepAlive();

client.login(process.env.TOKEN);
