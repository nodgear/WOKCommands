import { ApplicationCommand, MessageEmbed } from 'discord.js'
import { ICallbackObject, ICommand } from '../..'

export = {
  description: 'Permite ao desenvolvedor gerenciar commandos Slash',
  category: 'Configuração',

  permissions: ['ADMINISTRATOR'],

  maxArgs: 1,
  expectedArgs: '[command-id]',

  ownerOnly: true,
  hidden: true,

  slash: 'both',

  callback: async (options: ICallbackObject) => {
    const { channel, instance, text } = options

    const { guild } = channel
    const { slashCommands } = instance

    const global = await slashCommands.get()

    if (text) {
      let useGuild = true

      try {
        global?.forEach((cmd: ApplicationCommand) => {
          if (cmd.id === text) {
            useGuild = false
            throw new Error('')
          }
        })
      } catch (ignored) {}

      slashCommands.delete(text, useGuild ? guild.id : undefined)

      if (useGuild) {
        return `Slash command with the ID "${text}" has been deleted from guild "${guild.id}".`
      }

      return `Slash command with the ID "${text}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot.`
    }

    let allSlashCommands = ''

    if (global.size) {
      global.forEach((cmd: ApplicationCommand) => {
        allSlashCommands += `${cmd.name}: ${cmd.id}\n`
      })
    } else {
      allSlashCommands = 'None'
    }

    const embed = new MessageEmbed()
      .addField(
        'Deletando:',
        `${instance.getPrefix(guild)}slash <command-id>`
      )
      .addField('Lista de comandos globais:', allSlashCommands)

    if (guild) {
      const guildOnly = await slashCommands.get(guild.id)

      let guildOnlyCommands = ''

      if (guildOnly.size) {
        guildOnly.forEach((cmd: ApplicationCommand) => {
          guildOnlyCommands += `${cmd.name}: ${cmd.id}\n`
        })
      } else {
        guildOnlyCommands = 'None'
      }

      embed.addField(
        'Lista de comandos do servidor:',
        guildOnlyCommands
      )
    }

    if (instance.color) {
      embed.setColor(instance.color)
    }

    return embed
  },
} as ICommand
