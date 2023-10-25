const ChatGPTClientPromise = import('@waylaidwanderer/chatgpt-api')

const config = require('./config')

let ChatGPTClient

const clientOptions = {
  modelOptions: {
    model: "gpt-3.5-turbo",
    temperature: 0,
  },
  debug: false,
}

module.exports = class ChatGPT {
  chatGPT;
  chatOption;
  constructor() {
    ChatGPTClientPromise.then(module => {
      ChatGPTClient = module.ChatGPTClient

      this.chatGPT = new ChatGPTClient(
        config.OPENAI_API_KEY,
        {
          ...clientOptions,
          reverseProxyUrl: config.reverseProxyUrl
        },
      )
      this.chatOption = {};
    });
  }

  async test() {
    const response = await this.chatGPT.sendMessage("hello");
    console.log("response test: ", response);
  }

  async getChatGPTReply(content, contactId) {
    const data = await this.chatGPT.sendMessage(
      content,
      this.chatOption[contactId]
    );
    const { response, conversationId, messageId } = data;
    this.chatOption = {
      [contactId]: {
        conversationId,
        parentMessageId: messageId,
      },
    };
    console.log("chatGPT: ", response);
    return response;
  }

  async replyMessage(contact, content) {
    const { id: contactId } = contact;

    try {
      if (content.trim().toLocaleLowerCase() === config.resetKey.toLocaleLowerCase()) {
        this.chatOption = {
          ...this.chatOption,
          [contactId]: {},
        };
        await contact.say("对话已被重置");
        return;
      }

      const message = await this.getChatGPTReply(content, contactId);

      if (
        (contact.topic && contact?.topic() && config.groupReplyMode) ||
        (!contact.topic && config.privateReplyMode)
      ) {
        const result = content + "\n-----------\n" + message;
        await contact.say(result);
        return;
      } else {
        await contact.say(message);
      }

    } catch (error) {
      
    }
  }
}