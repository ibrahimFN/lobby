const { Client, Enums } = require('fnbr');
const { readFile, writeFile } = require('fs').promises;
const { get } = require('request-promise');
require('dotenv').config();
const Discord = require('discord.js');

const bot = new Discord.Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });
bot.commands = new Discord.Collection();
bot.sessions = new Discord.Collection();

const embed = new Discord.MessageEmbed()
	.setColor('#8B008B')
	.setFooter('BlazeBot ❤ Use Code: im2rnado');

bot.once('ready', () => {
	bot.user.setActivity('Starting...', { type: 'LISTENING' });
});

(async () => {
	const currentLibVersion = JSON.parse(await readFile(require.resolve('fnbr').replace('index.js', 'package.json'))).version;
	const latestVersion = (await get({ url: 'https://registry.npmjs.org/-/package/fnbr/dist-tags', json: true })).latest;
	if (currentLibVersion !== latestVersion) console.log('\x1b[31mWARNING: You\'re using an older version of the library. Please run installDependencies.bat\x1b[0m');
	let config;
	try {
		config = JSON.parse(await readFile('./config.json'));
	}
	catch (e) {
		await writeFile('./config.json', JSON.stringify({
			outfit: 'Renegade Raider',
			backpack: 'Black Shield',
			emote: 'The Renegade',
			pickaxe: 'AC/DC',
			banner: 'InfluencerBanner57',
			bannerColor: 'defaultcolor',
			level: 999,
			status: 'Use Code: im2rnado',
			friendaccept: true,
			inviteaccept: true,
			platform: 'IOS',
		}, null, 2));
		console.log('WARNING: config.json was missing and created. Please adjust it to your preference.');
		return;
	}

	console.log('BlazeBot made by im2rnado. Massive credit to This Nils, Alex and xMistt for creating the library.');
	console.log('Twitter Account: https://twitter.com/im2rnadoo - For support, questions, etc.\x1b[0m');

	console.log('Fetching cosmetics...');
	let cosmetics;
	try {
		cosmetics = (await get({ url: 'https://fortnite-api.com/v2/cosmetics/br', json: true })).data;
	}
	catch (e) {
		console.log('Failed fetching cosmetics!');
		return;
	}
	console.log('Successfully fetched cosmetics!');

	const defaultCosmetics = {
		outfit: cosmetics.find((c) => c.name === config.outfit && c.type.value === 'outfit'),
		backpack: cosmetics.find((c) => c.name === config.backpack && c.type.value === 'backpack'),
		pickaxe: cosmetics.find((c) => c.name === config.pickaxe && c.type.value === 'pickaxe'),
		emote: cosmetics.find((c) => c.name === config.emote && c.type.value === 'emote'),
	};

	for (const key of Object.keys(defaultCosmetics)) {
		if (!defaultCosmetics[key]) {
			console.log(`WARNING: ${key} in config wasn't found! Please check the spelling`);
			return;
		}
	}

	const clientOptions = {
		status: config.status,
		platform: config.platform,
		cachePresences: false,
		kairos: {
			cid: defaultCosmetics.outfit.id,
			color: Enums.KairosColor.DARK_PURPLE,
		},
		keepAliveInterval: 30,
		auth: {},
		debug: false,
	};

	try {
		clientOptions.auth.deviceAuth = JSON.parse(await readFile('./deviceAuth.json'));
	}
	catch (e) {
		clientOptions.auth.authorizationCode = async () => Client.consoleQuestion('Please enter an authorization code: ');
	}

	const client = new Client(clientOptions);
	client.on('deviceauth:created', (da) => writeFile('./deviceAuth.json', JSON.stringify(da, null, 2)));
	console.log('Bot starting...');
	await client.login();
	console.log(`Bot started as ${client.user.displayName}!`);

	function randomStatus() {
		const status = ['+help', `${bot.users.cache.size} users`];
		const rstatus = Math.floor(Math.random() * status.length);

		// You can change the "WATCHING" into STREAMING, LISTENING, and PLAYING.
		bot.user.setActivity(status[rstatus], { type: 'LISTENING' });
	} setInterval(randomStatus, 20000);

	const embed12 = new Discord.MessageEmbed()
		.setColor('RANDOM')
		.setTitle(`Bot is online and started as **${client.user.displayName}**!`);
	bot.channels.cache.get('764779626202398755').send(embed12);
	await client.party.me.setOutfit(defaultCosmetics.outfit.id);
	await client.party.me.setBackpack(defaultCosmetics.backpack.id);
	await client.party.me.setPickaxe(defaultCosmetics.pickaxe.id);
	await client.party.me.setLevel(config.level);
	await client.party.me.setBanner(config.banner, config.bannerColor);

	client.on('friend:request', (req) => {
		if (config.friendaccept) req.accept();
		else req.decline();
		console.log(`${config.friendaccept ? 'Accepted' : 'Declined'} friend request from: ${req.displayName}`);
		const embed99 = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${config.friendaccept ? 'Accepted' : 'Declined'} friend request from: ${req.displayName}`);
		bot.channels.cache.get('764779626202398755').send(embed99);
	});

	client.on('party:invite', (inv) => {
		if (config.inviteaccept) inv.accept();
		else inv.decline();
		console.log(`${config.inviteaccept ? 'Accepted' : 'Declined'} party invite from: ${inv.sender.displayName}`);
		const embed98 = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${config.inviteaccept ? 'Accepted' : 'Declined'} party invite from: ${inv.sender.displayName}`);
		bot.channels.cache.get('764779626202398755').send(embed98);
	});

	client.on('party:member:joined', () => {
		client.party.me.setEmote(defaultCosmetics.emote.id);
                
	});

	const findCosmetic = (query, type) => {
		return cosmetics.find((c) => (c.id.toLowerCase() === query.toLowerCase()
      || c.name.toLowerCase() === query.toLowerCase()) && c.type.value === type);
	};

	bot.on('message', message => {

		const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();
		const content = args.join(' ');

		if (command === 'skin' || command === 'outfit') {
			const skin = findCosmetic(content, 'outfit');
			if (skin) {
				client.party.me.setOutfit(skin.id);
				embed.setTitle(`Set skin to **${skin.name}**`);
				embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${skin.id}/icon.png`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Skin **${content}** wasn't found!`);
				embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'cid') {
			client.party.me.setOutfit(content);
			embed.setTitle(`Set skin to\n**${content}**`);
			embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${content}/icon.png`);
			message.channel.send(embed);
		}
		else if (command === 'emote' || command === 'dance') {
			const emote = findCosmetic(content, 'emote');
			if (emote) {
				client.party.me.setEmote(emote.id);
				embed.setTitle(`Set emote to **${emote.name}**`);
				embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${emote.id}/icon.png`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Emote **${content}** wasn't found!`);
				embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'eid') {
			client.party.me.setEmote(content);
			embed.setTitle(`Set emote to **${content}**`);
			embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${content}/icon.png`);
			message.channel.send(embed);
		}
		else if (command === 'pickaxe') {
			const pickaxe = findCosmetic(content, 'pickaxe');
			if (pickaxe) {
				client.party.me.setPickaxe(pickaxe.id);
				embed.setTitle(`Set pickaxe to **${pickaxe.name}**`);
				embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${pickaxe.id}/icon.png`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Pickaxe **${content}** wasn't found!`);
				embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'pid') {
			client.party.me.setPickaxe(content);
			embed.setTitle(`Set pickaxe to **${content}**`);
			embed.setThumbnail(`https://fortnite-api.com/images/cosmetics/br/${content}/icon.png`);
			message.channel.send(embed);
		}
		else if (command === 'ready') {
			client.party.me.setReadiness(true);
			embed.setTitle('Ready!');
                        embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'unready') {
			client.party.me.setReadiness(false);
			embed.setTitle('Unready!');
                        embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'purpleskull' || command === 'ps') {
			client.party.me.setOutfit('CID_030_Athena_Commando_M_Halloween', [{ channel: 'ClothingColor', variant: 'Mat1' }]);
			embed.setTitle('Set skin to Purple Skull');
			embed.setThumbnail('https://fortnite-api.com/images/cosmetics/br/CID_030_Athena_Commando_M_Halloween/icon.png');
			message.channel.send(embed);
		}
		else if (command === 'pinkghoul' || command === 'pg') {
			client.party.me.setOutfit('CID_029_Athena_Commando_F_Halloween', [{ channel: 'Material', variant: 'Mat3' }]);
			embed.setTitle('Set skin to Pink Ghoul');
			embed.setThumbnail('https://fortnite-api.com/images/cosmetics/br/CID_029_Athena_Commando_F_Halloween/icon.png');
			message.channel.send(embed);
		}
		else if (command === 'midnightdusk') {
			client.party.me.setOutfit('CID_892_Athena_Commando_F_VampireCasual', [{ channel: 'Material', variant: 'Mat3' }]);
			embed.setTitle('Set skin to Midnight Dusk');
			embed.setThumbnail('https://fortnite-api.com/images/cosmetics/br/CID_892_Athena_Commando_F_VampireCasual/icon.png');
			message.channel.send(embed);
		}
		else if (command === 'level') {
			client.party.me.setLevel(parseInt(content, 10));
			embed.setTitle(`Set level to ${content}`);
                        embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
	});

})();

bot.login(process.env.DISCORD_TOKEN);
