const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf("1909699059:AAESdlLMsABR8FBDBo95TY7C1jEweORxLoM");
const adminID = "271778802";
const channel = "-1001380125976";
bot.start((ctx) => ctx.reply("مرحبا بك في بوت قناة عواطف مهتريه ارسل صوره او فديو وسيتم مراجعتها من المشرف قبل الارسال"));

bot.command("id", (ctx) => {
  ctx.reply(ctx.chat.id);
});

bot.on("photo", (ctx) => {
  let photo = ctx.message.photo;
  sendAdmin(photo[photo.length - 1].file_id);
});

bot.on("video", (ctx) => {
  sendAdminVideo(ctx.message.video.file_id);
});

bot.launch((e) => console.log("I am start"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function sendAdmin(photo) {
  bot.telegram.sendPhoto(
    adminID,
    photo,
    Markup.inlineKeyboard([
      Markup.button.callback("yes", "send-i"),
      Markup.button.callback("no", "remove"),
    ])
  );
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

bot.action("send-i", (e) => {
  let photo = e.update.callback_query.message.photo;
  bot.telegram.sendPhoto(channel, photo[photo.length - 1].file_id);
});

bot.action("send-v", (e) => {
  let video = e.update.callback_query.message.video.file_id;
  bot.telegram.sendVideo(channel, video);
});

