import { bot, store } from '../main.js'

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
  const guildMemberRolesUpdate =
    newMember.roles.cache.size !== oldMember.roles.cache.size
  if (!guildMemberRolesUpdate) return

  store.update(
    newMember.id,
    'roleIds',
    newMember.roles.cache.map((role) => role.id)
  )
  await store.save()
})
