const CODEX_WORDS = /코드|개발|수정|테스트|버그|오류|배포|github|git |저장소|repository|자동화/i;
const CLAUDE_WORDS = /\?|왜|어떻게|무엇|뭐야|알려|설명|요약|정리|분석|비교|계획|조사|작성|초안/i;
const REMEMBER_WORDS = /기억해|기록해|remember/i;
const EXPLICIT_WORDS = /삭제|결제|구독|비밀번호|토큰|api key|계정|공개|게시|발행|송금|거래/i;
const ASK_FIRST_WORDS = /수정|배포|push|커밋|commit|merge|전송|공유|연락/i;

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function commandForPlainText(text) {
  const value = compact(text);
  if (REMEMBER_WORDS.test(value)) return { command: '/lua remember', agent: 'remember', intent: '', payload: value };
  if (CODEX_WORDS.test(value)) return { command: '/lua do', agent: 'do', intent: '', payload: value };
  if (CLAUDE_WORDS.test(value)) return { command: '/lua ask', agent: 'ask', intent: '', payload: value };
  return { command: '/lua todo', agent: 'todo', intent: '', payload: value };
}

function approvalFor(command) {
  const text = compact(`${command.command} ${command.payload || command.intent || command.text}`);
  if (EXPLICIT_WORDS.test(text)) return 'explicit_approval';
  if (ASK_FIRST_WORDS.test(text) || ['do', 'work', 'run', 'build', 'qa', 'ops', 'release'].includes(command.agent)) {
    return 'ask_first';
  }
  return 'auto';
}

function routeCommand(command) {
  const agent = command.agent;
  let routeAgent = 'lua';
  if (['ask', 'research', 'write', 'ceo', 'pm', 'brief'].includes(agent)) routeAgent = 'claude';
  if (['do', 'work', 'run', 'build', 'qa', 'ops', 'release'].includes(agent)) routeAgent = 'codex';

  return {
    routeAgent,
    approval: approvalFor(command),
  };
}

function buildApprovalReply(command, commandId) {
  const task = compact(command.payload || command.intent || command.text, 'this task');
  const id = commandId || command.id || command.updateId || 'pending';
  return {
    text: [
      `Lua approval needed #${id}`,
      `Agent: ${command.routeAgent}`,
      `Task: ${task}`,
      `Risk: ${command.approval}`,
      `Reply /lua approve :: ${id} to continue, or /lua reject :: ${id} to cancel.`,
    ].join('\n'),
    replyMarkup: {
      inline_keyboard: [[
        { text: '승인', callback_data: `approve:${id}` },
        { text: '거절', callback_data: `reject:${id}` },
      ]],
    },
  };
}

module.exports = {
  buildApprovalReply,
  commandForPlainText,
  routeCommand,
};
