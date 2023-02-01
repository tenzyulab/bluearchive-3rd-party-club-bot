import { AttachmentBuilder, GuildMember, TextChannel } from 'discord.js'
import { bot } from '../main.js'

export type MemberData = {
  roleIds?: string[]
  roomId?: string
  messageCount?: number
  layer?: number
}

export type Data = {
  [memberId: string]: MemberData
}

export class DiscordStore {
  data: Data
  readonly store: TextChannel

  constructor(channel: TextChannel) {
    this.data = {}
    this.store = channel
  }

  get(member: string | GuildMember): MemberData | undefined {
    const id = typeof member === 'string' ? member : member.id
    return this.data[id]
  }

  insert(member: GuildMember) {
    this.data[member.id] = {
      roleIds: member.roles.cache.map((role) => role.id),
    }
    return this.data[member.id]!
  }

  update<T extends keyof MemberData>(
    memberId: string,
    path: T,
    value: MemberData[T]
  ) {
    const data = this.data[memberId]
    if (data) {
      data[path] = value
      return data
    } else {
      return false
    }
  }

  async save() {
    const json = JSON.stringify(this.data)
    const attachment = new AttachmentBuilder(Buffer.from(json), {
      name: 'store.json',
    })

    return await this.store.send({ files: [attachment] })
  }

  async pull(): Promise<this> {
    const messages = await this.store.messages.fetch()
    const lastAttachmentMessage = messages.find(
      (message) =>
        message.author.id === bot.user?.id && message.attachments.size > 0
    )
    if (!lastAttachmentMessage) {
      this.data = JSON.parse('{}')
      return this
    }

    const attachment = lastAttachmentMessage.attachments.first()
    if (!attachment) {
      this.data = JSON.parse('{}')
      return this
    }

    const dataUrl = attachment.url
    const response = await fetch(dataUrl)
    const bodyText = await response.text()

    this.data = JSON.parse(bodyText)
    return this
  }
}
