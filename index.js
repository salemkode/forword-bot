const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
let prompt = require('prompt-sync')();
require('dotenv').config()

if(!process.env.START){
  let tokin = prompt("bot tokin is => ")
  let adminID = prompt("bot adminID is => ")
  let channel = prompt("bot channelID is => ")
  fs.writeFileSync( ".env" ,
`BOT_TOKIN=${tokin}
BOT_ADMIN=${adminID}
BOT_CHANNEL=${channel}
START=true`)
require('dotenv').config()

}
const bot = new Telegraf(process.env.BOT_TOKIN);
const adminID = process.env.BOT_ADMIN;
const channel = process.env.BOT_CHANNEL;
bot.start((ctx) => ctx.reply("مرحبا بك في بوت تحويل الرسائل لقناة البوت"));

bot.command("id", (ctx) => {
  ctx.reply(ctx.chat.id);
});

function fullName(ctx) {
  let from = ctx.from;
  let result = (from.first_name || "") + " " + (from.last_name || "") ;
  return result.split(" ").join("_")
}

function caption(ctx){
  let name = "#مشاركة_" + fullName(ctx);
  let { caption } = ctx.message;
  return name + "\n" + ( caption || "");
}

bot.on("photo", (ctx) => {
  let photo = ctx.message.photo;
  sendAdmin(photo[photo.length - 1].file_id, {caption :  caption(ctx)});
});

bot.on("video", (ctx) => {
  sendAdminVideo(ctx.message.video.file_id,  {caption : caption(ctx)});
});

bot.launch().then((e) => console.log("I am start"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function sendAdmin(photo , op) {
  bot.telegram.sendPhoto(
    adminID,
    photo,
    { ...Markup.inlineKeyboard([
      Markup.button.callback("yes", "send-i"),
      Markup.button.callback("no", "remove"),
    ]) , ...op }
  )
  
}

function sendAdminVideo(video) {
  bot.telegram.sendVideo(
    adminID,
    video,
    Markup.inlineKeyboard([
      Markup.button.callback("yes", "send-v"),
      Markup.button.callback("no", "remove"),
    ])
  );
}

bot.action("remove", (e) => {
  let chat = e.update.callback_query.message.chat.id;
  let messageId = e.update.callback_query.message.message_id;
  bot.telegram.deleteMessage(chat, messageId);
});

const action_caption = ctx=> ctx.update.callback_query.message.caption || "";

bot.action("send-i", (ctx) => {
  let photo = ctx.update.callback_query.message.photo;
  bot.telegram.sendPhoto(channel, photo[photo.length - 1].file_id , {caption : action_caption(ctx)});
});

bot.action("send-v", (ctx) => {
  let video = ctx.update.callback_query.message.video.file_id;
  bot.telegram.sendVideo(channel, video , {caption : action_caption(ctx)});
});

