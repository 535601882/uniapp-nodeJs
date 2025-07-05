const historyMap = {};

function saveHistory(openid, messages, reply) {
  if (!historyMap[openid]) historyMap[openid] = [];
  historyMap[openid].push({ messages, reply, time: Date.now() });
  // 只保留最近20条
  if (historyMap[openid].length > 20) historyMap[openid].shift();
}

function getHistory(openid) {
  return historyMap[openid] || [];
}

module.exports = { saveHistory, getHistory }; 