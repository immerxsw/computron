require('dotenv').config();
const discord = require('discord.js');
const client = new discord.Client();
const PREFIX = process.env.PREFIX;

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

const helpEmbed = new discord.MessageEmbed()
    .setColor('#00e2ff')
    .setDescription('Computron is essentially an AIO tool for server admins.')
    .setAuthor('Computron', 'https://i.imgur.com/s3HbSQW.jpg', 'https://github.com/immerxdev/computron')
    .setTitle('Command List:')
    .addFields(
        { name: '!role add *roles*', value: 'Adds you to one or multiple roles. Separate with a comma.', inline: true },
        { name: '!role del *roles*', value: 'Removes you from one or multiple roles. Separate with a comma.', inline: true },
        { name: '!broadcast *announcement*', value: 'Sends a server-wide broadcast to the announcements channel.', inline: true }
    )
    .addFields(
        { name: '!say *message*', value: 'Similar to broadcast, but it displays in the channel you typed the command.', inline: true },
        { name: '!ban *ID*', value: 'Bans a user based on their user ID. Right click on a user and click *Copy ID*.', inline: true },
        { name: '!kick *ID*', value: 'Kicks a user based on their user ID. Follow instructions under *!ban*.', inline: true }
    )
    .setTimestamp()
	.setFooter('immerxdev on GitHub');

const isValidCmd = (message, cmdName) => message.content.toLowerCase().startsWith(PREFIX + cmdName)
const randomNumber = () => Math.floor(Math.random() * 100) + 1;
const checkPermissions = (role) => 
role.permissions.has('ADMINISTRATOR') || 
role.permissions.has('BAN_MEMBERS') || 
role.permissions.has('KICK_MEMBERS') || 
role.permissions.has('MANAGE_CHANNELS') || 
role.permissions.has('MANAGE_GUILD') || 
role.permissions.has('MANAGE_NICKNAMES');

client.on('message', async function(message) {
    if(message.author.bot) return;
    if(isValidCmd(message, "help")) {
        message.channel.send(helpEmbed);
    }
    if(isValidCmd(message, "rng"))
        message.channel.send("Your number is " + randomNumber());
    if(isValidCmd(message, "role add")) {
        let args = message.content.toLowerCase().substring(10);
        let roleNames = args.split(", ");
        let roleSet = new Set(roleNames);
        let { cache } = message.guild.roles;

        roleSet.forEach(roleName => {
            let role = cache.find(role => role.name.toLowerCase() === roleName);
            if(role) {
                if(message.member.roles.cache.has(role.id)) {
                    message.channel.send("You are already a " + role.name + ".");
                    return;
                }
                if(checkPermissions(role)) {
                        message.channel.send("The " + role.name + " role cannot be added.");
                }
                else {
                    message.member.roles.add(role)
                        .then(member => message.channel.send("Successfully added to " + role.name + "."))
                        .catch(err => {
                            console.log(err);
                            message.channel.send("Something went wrong...");
                        });
                }
            }
            else {
                message.channel.send("Role not found.");
            }
        });
    }
    else if(isValidCmd(message, "role del")) {
        let args = message.content.toLowerCase().substring(10);
        let roleNames = args.split(", ");
        let roleSet = new Set(roleNames);
        let { cache } = message.guild.roles;

        roleSet.forEach(roleName => {
            let role = cache.find(role => role.name.toLowerCase() === roleName);
            if(role) {
                if(message.member.roles.cache.has(role.id)) {
                    message.member.roles.remove(role)
                    .then(member => message.channel.send("Successfully removed from " + role.name + "."))
                    .catch(err => {
                        console.log(err);
                        message.channel.send("Something went wrong...");
                    });
                    return;
                }
                else {
                    message.channel.send("You've already been removed from " + role.name + ".");
                }
            }
            else {
                message.channel.send("Role not found.");
            }
        });
    }
    else if(isValidCmd(message, "broadcast")) {
        let announcement = message.content.substring(11);
        let announcementsChannel = client.channels.cache.find(channel => channel.name.toLowerCase() === 'announcements');
        if(announcementsChannel)
            announcementsChannel.send('@here ' + announcement)
    }
    else if(isValidCmd(message, "say")) {
        let phrase = message.content.substring(5);
        message.channel.send(phrase)
    }
    else if(isValidCmd(message, "ban")) {
        if(!message.member.hasPermission('BAN_MEMBERS')) {
            message.channel.send("You dont have permission to use that command.");
        }
        else {
            let memberId = message.content.substring(message.content.indexOf(' ') + 1);
            try {
                let bannedMember = await message.guild.members.ban(memberId);
                if(bannedMember) {
                    console.log(bannedMember.tag + " has been banned.");
                }
                else {
                    console.log("Ban unsuccessful.")
                }
            }
            catch(err) {
                console.log(err);
            }
        }
    }
    else if(isValidCmd(message, "kick")) {
        if(!message.member.hasPermission('KICK_MEMBERS')) {
            message.channel.send("You dont have permission to use that command.");
        }
        else {
            let memberId = message.content.substring(message.content.indexOf(' ') + 1);
            let member = message.guild.members.cache.get(memberId);
            if(member) {
                try {
                    await member.kick();
                    console.log('A member was kicked.');
                }
                catch(err) {
                    console.log(err);
                }
            } 
        }
    }
});