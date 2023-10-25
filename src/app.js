const WechatyBuilder = require('wechaty').WechatyBuilder
const qrcodeTerminal = require('qrcode-terminal')
const config = require('./config')
const ChatGPT = require('./chatgpt')

let BOT
let chatGPTClient
let userName
const startTime = new Date()

function sucessLog(str) {
  console.log(`\x1B[32m${str}\x1B[0m`)
}
function errorLog(str) {
  console.log(`\x1B[31m${str}\x1B[0m`)
}

// 开启扫码
function onScan(qrcode) {
  qrcodeTerminal.generate(qrcode, { small: true }); // 在console端显示二维码
  const qrcodeImageUrl = [
    "https://api.qrserver.com/v1/create-qr-code/?data=",
    encodeURIComponent(qrcode),
  ].join("");

  sucessLog(qrcodeImageUrl);
  
}

// 微信登录完成
async function onLogin(user) {
  sucessLog(`${user} has logged in`);
  const date = new Date();
  sucessLog(`Current time:${date}`);
  userName = user.name()
}

// 退出微信登录
function onLogout(user) {
  errorLog(`${user} has logged out`);
}

/**
 * 微信机器人接收到消息
 * @param {*} msg 
 * @returns 
 */
function onMessage(msg) {
  if (msg.self()) {
    return;
  }
  if (msg.date() < startTime) {
    return;
  }
  if (msg.talker().type() !== BOT.Contact.Type.Individual) {
    return
  }

  console.log(msg.text().trim());

  const isText = msg.type() === BOT.Message.Type.Text // 是否文字信息
  const room = msg.room();

  if (room && isText) {
    roomReply(msg)
  } else if (isText) {
    privateReply(msg)
  }
}
/**
 * 群聊提到我
 * @param {*} msg 
 * @returns 
 */
async function roomReply(msg) {
  const receiver = msg.to();
  const content = msg.text().trim();
  const room = msg.room();

  const pattern = RegExp(`^@${receiver.name()}\\s+${config.groupKey}[\\s]*`);

  // if (await msg.mentionSelf()) {
  console.log(userName, receiver.name());
  if (userName == receiver.name()) {
    console.log(12);
    if (pattern.test(content)) {
      console.log(34);
      const groupContent = content.replace(pattern, "");
      chatGPTClient.replyMessage(room, groupContent);
      return;
    }
  }
}

/**
 * 私聊
 * @param {*} msg 
 * @returns 
 */
function privateReply(msg) {
  const content = msg.text().trim();
  const contact = msg.talker();

  if (content.startsWith(config.privateKey) || config.privateKey === "") {
    let privateContent = content;
    if (config.privateKey) {
      privateContent = content.substring(config.privateKey.length).trim();
    }
    chatGPTClient.replyMessage(contact, privateContent);
  }
}


async function init() {
  sucessLog('---------init--------');
  try {
    chatGPTClient = new ChatGPT();
    BOT = WechatyBuilder.build({
      name: "WechatEveryDay",
      puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
      puppetOptions: {
        uos: true,
      },
    });

    BOT
      .on("scan", onScan)
      .on("login", onLogin)
      .on("logout", onLogout)
      .on("message", onMessage);

    BOT
      .start()
      .then(() => sucessLog("Start to log in wechat..."))
      .catch((e) => {
        errorLog('BOT start error')
        console.error(e)
      });

  } catch (error) {
    errorLog('init error:')
    console.log(error)
  }
}
init()
