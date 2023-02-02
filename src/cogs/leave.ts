import { bot } from '../main.js'
import { CHANNEL_ID_CALLBACK, USER_ID_OWNER } from '../constants.js'
import type { TextChannel } from 'discord.js'

bot.on('guildMemberRemove', async (member) => {
  const channel = (await member.guild.channels.fetch(
    CHANNEL_ID_CALLBACK
  )) as TextChannel
  await channel.send(`${USER_ID_OWNER} [AUDIT] ${member.displayName} LEFT`)

  return
})
