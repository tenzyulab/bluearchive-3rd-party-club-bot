import type { CategoryChannel, TextChannel } from 'discord.js'
import { bot, store } from '../main.js'
import {
  ROLE_ID_LAYER_1,
  ROLE_ID_LAYER_2,
  ROLE_ID_LAYER_3,
  ROLE_ID_LAYER_4,
  ROLE_ID_LAYER_5,
  CATEGORY_ID_LAYER_1,
  CATEGORY_ID_LAYER_2,
  CATEGORY_ID_LAYER_3,
  CATEGORY_ID_LAYER_4,
  CATEGORY_ID_LAYER_5,
} from '../constants.js'

const requireMessageCounts = [1, 10, 100, 1000, 10000]
const layerRoleIds = [
  ROLE_ID_LAYER_1,
  ROLE_ID_LAYER_2,
  ROLE_ID_LAYER_3,
  ROLE_ID_LAYER_4,
  ROLE_ID_LAYER_5,
]
const categoryIds = [
  CATEGORY_ID_LAYER_1,
  CATEGORY_ID_LAYER_2,
  CATEGORY_ID_LAYER_3,
  CATEGORY_ID_LAYER_4,
  CATEGORY_ID_LAYER_5,
]

bot.on('messageCreate', async (message) => {
  const { member } = message

  if (!member) return // DM
  if (member.user.bot) return

  const data = store.get(member)

  if (!data) return

  const currentMsgCount = (data.messageCount || 0) + 1

  store.update(member.id, 'messageCount', currentMsgCount)

  const layer = data.layer || 0

  if (layer >= requireMessageCounts.length) return // レイヤーが最大値を超えている場合は無視する

  const count = requireMessageCounts[layer]!

  if (currentMsgCount < count) return

  const roleId = layerRoleIds[layer]!

  store.update(member.id, 'layer', layer + 1)
  await member.roles.add(roleId)

  if (!data.roomId) {
    await message.channel.send({
      content: `${member} おめでとうございます！ <@&${roleId}> に昇格しました！`,
      allowedMentions: { roles: [] },
    })
    return
  }

  const channel = (await member.guild.channels.fetch(
    data.roomId
  )) as TextChannel
  const categoryId = categoryIds[layer]!
  const category = (await member.guild.channels.fetch(
    categoryId
  )) as CategoryChannel

  await channel.setParent(category, { lockPermissions: false })

  let position = 0

  category.children.cache.forEach((child) => {
    if (position < child.position) {
      position = child.position
    }
  })
  await channel.setPosition(position + 1)
  await channel.send({
    content: `${member} おめでとうございます！ <@&${roleId}> に昇格しました！`,
    allowedMentions: { roles: [] },
  })
  await store.save()
})
