const { Client, Enums } = require('fnbr');
const { readFile, writeFile } = require('fs').promises;
const { get } = require('request-promise');
require('dotenv').config();
const Discord = require('discord.js');

const Rarities = {
	Common: '#B1B1B1',
	Uncommon: '#5BFD00',
	Rare: '#00FFF6',
	Epic: '#D505FF',
	Legendary: '#F68B20',
	'Icon Series': '#00FFF6',
	'Shadow Series': '#111111',
	'Slurp Series': '#0c9ea6',
	'Star Wars Series': '#010c62',
	'MARVEL SERIES': '#e20604',
	'DC SERIES': '#002dd0',
	LavaSeries: '#f49d09',
};

const bot = new Discord.Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });
bot.commands = new Discord.Collection();
bot.sessions = new Discord.Collection();

const embed = new Discord.MessageEmbed()
	.setColor('#E38C2D')
	.setFooter('BlazeBot ❤ EPIC: Code im2rnado');

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
			emote: 'Witch Way',
			pickaxe: 'AC/DC',
			banner: 'InfluencerBanner57',
			bannerColor: 'defaultcolor',
			level: 999,
			status: 'Use Code: im2rnado',
			friendaccept: true,
			inviteaccept: true,
			platform: 'WIN',
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
		const status = ['Code: im2rnado', `${bot.users.cache.size} users`];
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

		if (message.author.bot) return;

		if (message.content.startsWith('!') || message.content.startsWith('+') || message.content.startsWith('?')) {
			const embed1010 = new Discord.MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`The prefix is **${process.env.PREFIX}**`)
				.setFooter('Need Help? Use .help');
			return message.channel.send(embed1010);
		}

		const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();
		const content = args.join(' ');

		if (command === 'skin' || command === 'outfit') {
			if (!args.length) return embed.setTitle('Please enter a valid skin name!');
			const skin = findCosmetic(content, 'outfit');
			if (skin) {
				client.party.me.setOutfit(skin.id);
				embed.setTitle(`Set skin to **${skin.name}**`);
				console.log(skin.rarity.displayValue);
				embed.setColor(Rarities[skin.rarity.displayValue]);
				embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${skin.id}.png?b=true`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Skin **${content}** wasn't found!`);
				embed.setThumbnail('https://emoji.gg/assets/emoji/x.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'cid') {
			if (!args.length) return embed.setTitle('Please enter a valid cid!');
			client.party.me.setOutfit(content);
			embed.setTitle(`Set skin to\n**${content}**`);
			embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${content}.png?b=true`);
			message.channel.send(embed);
		}
		else if (command === 'emote' || command === 'dance') {
			if (!args.length) return embed.setTitle('Please enter a valid emote name!');
			const emote = findCosmetic(content, 'emote');
			if (emote) {
				client.party.me.setEmote(emote.id);
				embed.setTitle(`Set emote to **${emote.name}**`);
				embed.setColor(Rarities[emote.rarity.displayValue]);
				embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${emote.id}.png?b=true`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Emote **${content}** wasn't found!`);
				embed.setThumbnail('https://emoji.gg/assets/emoji/x.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'eid') {
			if (!args.length) return embed.setTitle('Please enter a valid eid!');
			client.party.me.setEmote(content);
			embed.setTitle(`Set emote to **${content}**`);
			embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${content}.png?b=true`);
			message.channel.send(embed);
		}
		else if (command === 'backbling' || command === 'backpack') {
			if (!args.length) return embed.setTitle('Please enter a valid backbling name!');
			const backbling = findCosmetic(content, 'backpack');
			if (backbling) {
				client.party.me.setBackpack(backbling.id);
				embed.setTitle(`Set backbling to **${backbling.name}**`);
				embed.setColor(Rarities[backbling.rarity.displayValue]);
				embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${backbling.id}.png?b=true`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Backbling **${content}** wasn't found!`);
				embed.setThumbnail('https://emoji.gg/assets/emoji/x.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'bid') {
			if (!args.length) return embed.setTitle('Please enter a valid bid!');
			client.party.me.setBackpack(content);
			embed.setTitle(`Set backbling to **${content}**`);
			embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${content}.png?b=true`);
			message.channel.send(embed);
		}
		else if (command === 'pickaxe') {
			if (!args.length) return embed.setTitle('Please enter a valid pickaxe name!');
			const pickaxe = findCosmetic(content, 'pickaxe');
			if (pickaxe) {
				client.party.me.setPickaxe(pickaxe.id);
				client.party.me.setEmote('EID_IceKing');
				embed.setTitle(`Set pickaxe to **${pickaxe.name}**`);
				embed.setColor(Rarities[pickaxe.rarity.displayValue]);
				embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${pickaxe.id}.png?b=true`);
				message.channel.send(embed);
			}
			else {
				embed.setTitle(`Pickaxe **${content}** wasn't found!`);
				embed.setThumbnail('https://emoji.gg/assets/emoji/x.png');
				message.channel.send(embed);
			}
		}
		else if (command === 'pid') {
			if (!args.length) return embed.setTitle('Please enter a valid pid!');
			client.party.me.setPickaxe(content);
			client.party.me.setEmote('EID_IceKing');
			embed.setTitle(`Set pickaxe to **${content}**`);
			embed.setThumbnail(`https://blobry.herokuapp.com/images/cosmetics/br/${content}.png?b=true`);
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
			embed.setTitle('Set skin to **Purple Skull**');
			embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_030_Athena_Commando_M_Halloween.png?b=true');
			message.channel.send(embed);
		}
		else if (command === 'pinkghoul' || command === 'pg') {
			client.party.me.setOutfit('CID_029_Athena_Commando_F_Halloween', [{ channel: 'Material', variant: 'Mat3' }]);
			embed.setTitle('Set skin to **Pink Ghoul**');
			embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_029_Athena_Commando_F_Halloween.png?b=true');
			message.channel.send(embed);
		}
		else if (command === 'hologram') {
			client.party.me.setOutfit('CID_VIP_Athena_Commando_M_GalileoGondola_SG');
			embed.setTitle('Set skin to **Hologram**');
			embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_VIP_Athena_Commando_M_GalileoGondola_SG.png?b=true');
			message.channel.send(embed);
		}
		else if (command === 'leaked') {
			const number = Math.floor(Math.random() * 12);
			if (number == 0) {
				client.party.me.setOutfit('CID_900_Athena_Commando_M_Famine');
				embed.setTitle('Set skin to **Headlock**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_900_Athena_Commando_M_Famine.png?b=true');
				message.channel.send(embed);
			}
			if (number == 1) {
				client.party.me.setOutfit('CID_901_Athena_Commando_F_PumpkinSpice');
				embed.setTitle('Set skin to **Patch**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_901_Athena_Commando_F_PumpkinSpice.png?b=true');
				message.channel.send(embed);
			}
			if (number == 2) {
				client.party.me.setOutfit('CID_902_Athena_Commando_M_PumpkinPunk');
				embed.setTitle('Set skin to **Punk**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_902_Athena_Commando_M_PumpkinPunk.png?b=true');
				message.channel.send(embed);
			}
			if (number == 3) {
				client.party.me.setOutfit('CID_903_Athena_Commando_F_Frankie');
				embed.setTitle('Set skin to **Ravina**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_903_Athena_Commando_F_Frankie.png?b=true');
				message.channel.send(embed);
			}
			if (number == 4) {
				client.party.me.setOutfit('CID_904_Athena_Commando_M_Jekyll');
				embed.setTitle('Set skin to **The Good Doctor**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_904_Athena_Commando_M_Jekyll.png?b=true');
				message.channel.send(embed);
			}
			if (number == 5) {
				client.party.me.setOutfit('CID_915_Athena_Commando_F_Ravenquillskull');
				embed.setTitle('Set skin to **Bone Ravage**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_915_Athena_Commando_F_Ravenquillskull.png?b=true');
				message.channel.send(embed);
			}
			if (number == 6) {
				client.party.me.setOutfit('CID_916_Athena_Commando_F_Fuzzybearskull');
				embed.setTitle('Set skin to **Skull Squad Leader**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_916_Athena_Commando_F_Fuzzybearskull.png?b=true');
				message.channel.send(embed);
			}
			if (number == 7) {
				client.party.me.setOutfit('CID_917_Athena_Commando_M_Durrburgerskull');
				embed.setTitle('Set skin to **Bone Boss**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_917_Athena_Commando_M_Durrburgerskull.png?b=true');
				message.channel.send(embed);
			}
			if (number == 8) {
				client.party.me.setOutfit('CID_918_Athena_Commando_M_Teriyakifishskull');
				embed.setTitle('Set skin to **Fishskull**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_918_Athena_Commando_M_Teriyakifishskull.png?b=true');
				message.channel.send(embed);
			}
			if (number == 9) {
				client.party.me.setOutfit('CID_919_Athena_Commando_F_BabaYaga');
				embed.setTitle('Set skin to **Baba Yaga**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_919_Athena_Commando_F_BabaYaga.png?b=true');
				message.channel.send(embed);
			}
			if (number == 10) {
				client.party.me.setOutfit('CID_920_Athena_Commando_M_PartyTrooper');
				embed.setTitle('Set skin to **Party Trooper**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_920_Athena_Commando_M_PartyTrooper.png?b=true');
				message.channel.send(embed);
			}
                        if (number == 11) {
				client.party.me.setOutfit('CID_900_Athena_Commando_M_Famine');
				embed.setTitle('Set skin to **Zombie Midas**');
				embed.setThumbnail('https://blobry.herokuapp.com/images/cosmetics/br/CID_900_Athena_Commando_M_Famine.png?b=true');
				message.channel.send(embed);
			}
		}
		else if (command === 'level') {
			const levelno = args[0];
			if (!levelno || isNaN(levelno)) return embed.setTitle('Please enter a level number!');
			client.party.me.setLevel(parseInt(content, 10));
			embed.setTitle(`Set level to ${content}`);
			embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'invite') {
			const user = args.join(' ');
			if (!user) return embed.setTitle('Please provide a user to invite.');
			client.party.invite(user);
			embed.setTitle(`**${user}** has been invited`);
			embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'add') {
			const user = args.join(' ');
			if (!user) return embed.setTitle('Please provide a user to add.');
			client.addFriend(user);
			embed.setTitle(`Friend request has been sent to **${user}**`);
			embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'gift') {
			const user = args.join(' ');
			if (!user) return embed.setTitle('Please provide a user to gift.');
			client.party.me.setEmote('EID_NeverGonna');
			embed.setTitle(`I gifted **${user}** the whole shop! If it isn't there, make sure you're using Code: im2rnado in the Item Shop!`);
			embed.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed);
		}
		else if (command === 'help') {
			const embed1 = new Discord.MessageEmbed();
			embed1.setColor('#E38C2D');
			embed1.setFooter('BlazeBot ❤ EPIC: Code im2rnado');
			embed1.setTitle(':mailbox_with_mail: Hey! Want some help?');
			embed1.setDescription('[Press Me](https://github.com/Im2rnado/Blaze-Help)');
			embed1.setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));
			embed1.setThumbnail('https://discordapp.com/assets/8becd37ab9d13cdfe37c08c496a9def3.png');
			message.channel.send(embed1);
		}
	});

})();

bot.login(process.env.DISCORD_TOKEN);
