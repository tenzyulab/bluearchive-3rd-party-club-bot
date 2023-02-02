import {
  CategoryChannel,
  ChannelType,
  OverwriteType,
  TextChannel,
} from 'discord.js'
import { bot, store } from '../main.js'
import {
  CATEGORY_ID_ROOM,
  CHANNEL_ID_CALLBACK,
  CHANNEL_ID_TUTORIAL,
  ROLE_ID_BOT,
  ROLE_ID_MEMBER,
  USER_ID_OWNER,
} from '../constants.js'

bot.on('guildMemberAdd', async (member) => {
  const cbChannel = (await member.guild.channels.fetch(
    CHANNEL_ID_CALLBACK
  )) as TextChannel
  await cbChannel.send(`${USER_ID_OWNER} [AUDIT] ${member.displayName} JOINED`)

  const data = store.get(member.id)
  const comeBack = !!data

  if (comeBack) {
    await member.roles.set(data.roleIds || [])
    if (!data.roomId) return

    const channel = (await member.guild.channels.fetch(
      data.roomId
    )) as CategoryChannel

    await channel.permissionOverwrites.create(member.id, {
      ManageChannels: true,
    })

    return
  }
  const mainChannel = (await member.guild.channels.fetch(
    CHANNEL_ID_TUTORIAL
  )) as TextChannel
  await mainChannel.send(`${member} さんが新しく参加しました！`)

  await member.roles.add(member.user.bot ? ROLE_ID_BOT : ROLE_ID_MEMBER)
  store.insert(member)

  if (member.user.bot) return

  const category = (await member.guild.channels.fetch(
    CATEGORY_ID_ROOM
  )) as CategoryChannel

  const channel = await category.children.create({
    name: `${member.displayName}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: member.id,
        allow: ['ManageChannels'],
        type: OverwriteType.Member,
      },
    ],
  })

  store.update(member.id, 'roomId', channel.id)
  await store.save()

  await channel.send(
    `ようこそ、${member}さん！ <#${CHANNEL_ID_TUTORIAL}> を読んでもわからないことがあれば気軽に質問してください！`
  )

  return
})
