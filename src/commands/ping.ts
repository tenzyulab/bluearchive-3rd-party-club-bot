import { bot } from '../main.js'
import type { Command } from '../lib/discord.js'

const command: Command = {
  data: {
    name: 'ping',
    description: 'BOT がオンラインか確認する。',
  },
  async execute(interaction) {
    const latency = Math.round(bot.ws.ping)
    await interaction.reply({
      content: `🏓 ${latency}ms`,
      ephemeral: true,
    })
  },
}

export default command
