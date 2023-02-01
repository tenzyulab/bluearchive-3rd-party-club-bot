import { readdir } from 'fs/promises'
import { parse } from 'path'

import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  DMChannel,
  EmojiIdentifierResolvable,
  GuildChannel,
  Message,
  PartialGroupDMChannel,
  Routes,
  TextChannel,
} from 'discord.js'
import { bot, rest } from '../main.js'

// ------------------------------------

// Extends discord.js
// ------------------------------------
export class Command {
  constructor(
    readonly data: ChatInputApplicationCommandData,
    readonly execute: (
      interaction: ChatInputCommandInteraction
    ) => Promise<void>
  ) {}
}

export class MyBot extends Client {
  readonly commands: Command[] = []

  constructor(options: ClientOptions, readonly authorId?: string) {
    super(options)
  }

  async loadCogs(): Promise<void> {
    const cogs = await readdir('dist/cogs')

    for (const cog of cogs) {
      const cogName = parse(cog).name

      await import(`../cogs/${cogName}.js`)
      console.log(`loaded ${cogName} cog`)
    }
  }

  async loadCommand(guildId: string): Promise<void> {
    const commandFiles = await readdir('dist/commands')

    commandFiles.map(async (file) => {
      const commandName = parse(file).name
      const command: Command = (await import(`../commands/${commandName}.js`))
        .default

      this.commands.push(new Command(command.data, command.execute))
    })

    this.once('ready', async () => {
      const data = this.commands.map((command) => command.data)

      await this.application?.commands.set(data, guildId)
      this.application?.commands.cache.forEach((command) =>
        console.log(`loaded ${command.name} command`)
      )
    })

    this.on('interactionCreate', async (interaction) => {
      if (!(interaction instanceof ChatInputCommandInteraction)) return

      const command: Command | undefined = this.commands.find(
        (command) => interaction.command?.name === command.data.name
      )

      await command?.execute(interaction).catch(console.error)
    })
  }
}

// ------------------------------------

// Utils
// ------------------------------------

export const isTextChannel = (channel: unknown): channel is TextChannel =>
  channel instanceof TextChannel

export const getTextChannelById = (id: string) => {
  const channel = bot.channels.resolve(id)

  return isTextChannel(channel) ? channel : null
}

export const fastReact = async (
  message: Message,
  emoji: EmojiIdentifierResolvable
) =>
  await rest.put(
    Routes.channelMessageOwnReaction(
      message.channelId,
      message.id,
      encodeURIComponent(emoji.toString().replace(/<|>/g, ''))
    )
  )

export const nullableFetch = async (
  fetchable: { fetch: (arg0: any) => Promise<any> },
  options: string
) => await fetchable.fetch(options).catch(() => null)

export const getChannelName = async (id: string) => {
  const channel = await nullableFetch(bot.channels, id)
  if (!channel) return null

  if (channel instanceof DMChannel) {
    return await bot.users.fetch(channel.recipientId)
  }

  if (
    channel instanceof GuildChannel ||
    channel instanceof PartialGroupDMChannel
  ) {
    return channel.name
  }

  return null
}
