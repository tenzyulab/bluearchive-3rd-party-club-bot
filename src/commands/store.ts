import { store } from '../main.js'
import type { Command } from '../lib/discord.js'
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js'
import type { MemberData } from '../lib/discord-store.js'

const path: (keyof MemberData)[] = [
  'roleIds',
  'roomId',
  'messageCount',
  'layer',
]

const command: Command = {
  data: {
    name: 'update',
    description: '(管理者コマンド) ストアのマニュアルアップデート',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: '対象ユーザー',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'path',
        description: '更新するパス',
        choices: path.map((p) => ({ name: p, value: p })),
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'value',
        description: '更新する値 (Json String)',
        required: true,
      },
    ],
  },
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: 'このコマンドは管理者のみ実行可能です。',
        ephemeral: true,
      })
      return
    }

    const user = interaction.options.getUser('user', true)
    const path = interaction.options.getString('path', true) as keyof MemberData
    const _value = interaction.options.getString('value', true)
    let value!: any
    try {
      value = JSON.parse(_value)
    } catch (error) {
      value = _value
    }

    store.update(user.id, path, value)
    await store.save()

    await interaction.reply({
      content: '更新しました。',
      ephemeral: true,
    })
  },
}

export default command
