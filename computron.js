require('dotenv').config();
const discord = require('discord.js');
const client = new discord.Client();
const PREFIX = process.env.PREFIX;

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

const helpEmbed = new discord.MessageEmbed()
    .setColor('#0099ff')
    .setAuthor('Computron', 'https://i.imgur.com/s3HbSQW.jpg')
    .setTitle('Command List:')
    .addFields(
        { name: '!role add role(s)', value: 'Adds you to one or multiple roles. Separate with a comma', inline: true },
        { name: '!role del role(s)', value: 'Removes you from one or multiple roles. Separate with a comma', inline: true }
    )

const isValidCmd = (message, cmdName) => message.content.toLowerCase().startsWith(PREFIX + cmdName)
const randomNumber = () => Math.floor(Math.random() * 100) + 1;
const checkPermissions = (role) => 
role.permissions.has('ADMINISTRATOR') || 
role.permissions.has('BAN_MEMBERS') || 
role.permissions.has('KICK_MEMBERS') || 
role.permissions.has('MANAGE_CHANNELS') || 
role.permissions.has('MANAGE_GUILD') || 
role.permissions.has('MANAGE_NICKNAMES');

client.on('message', function(message) {
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
});