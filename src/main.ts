import { REST } from '@discordjs/rest'
import { GatewayIntentBits } from 'discord-api-types/v10'
import { Partials, TextChannel } from 'discord.js'
import { BOT_TOKEN, CHANNEL_ID_JSON_STORE, GUILD_ID } from './constants.js'
import { MyBot } from './lib/discord.js'
import { DiscordStore } from './lib/discord-store.js'
import { createPeriodicFunction } from './utils.js'

export const bot = new MyBot({
  intents: Number(
    Object.values(GatewayIntentBits)
      .filter(Number.isInteger)
      .reduce((a, b) => Number(a) | Number(b))
  ),
  partials: [Partials.Message, Partials.User],
})

export const rest = new REST({ offset: 0, version: '9' }).setToken(BOT_TOKEN)
//
;(async () => {
  await bot.loadCogs()
  await bot.loadCommand(GUILD_ID)
  await bot.login(BOT_TOKEN).then(() => console.log('Bot is online!'))
})()

export let store: DiscordStore

bot.once('ready', async () => {
  const guild = await bot.guilds.fetch(GUILD_ID)
  const storeChannel = (await guild.channels.fetch(
    CHANNEL_ID_JSON_STORE
  )) as TextChannel

  store = new DiscordStore(storeChannel)
  await store.pull()

  const members = await guild.members.fetch()

  members.forEach((member) => {
    if (store.get(member.id)) return
    store.insert(member)
  })

  // 20分ごとに保存
  createPeriodicFunction(() => store.save(), 20)
})
