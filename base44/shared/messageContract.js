import { assertId, invalid } from './apiContract.js';
/** Resolve authorization from the parent record, never a submitted sender or participant list. */
export async function accessMessages({ user, entities, input }) {
  if (!user?.id) throw Object.assign(new Error('Authentication required'), {status:401});
  const kind = input?.kind;
  if (!['conversation','session'].includes(kind) || !['list','create'].includes(input.operation)) throw invalid('Invalid message operation');
  const id = assertId(input.parentId);
  const parent = await entities[kind === 'conversation' ? 'Conversation' : 'CollaborationSession'].get(id).catch(() => null);
  const allowed = parent && (user.role === 'admin' || (kind === 'conversation'
    ? parent.participants?.includes(user.email)
    : parent.owner_email === user.email || parent.permissions?.public === true || parent.permissions?.allowed_users?.includes(user.email)));
  if (!allowed) throw Object.assign(new Error('Message access denied'), {status:403});
  const entity = entities[kind === 'conversation' ? 'Message' : 'CollaborationMessage'];
  const field = kind === 'conversation' ? 'conversation_id' : 'session_id';
  if (input.operation === 'list') return {messages:await entity.filter({[field]:id},'-created_date',100)};
  if (typeof input.content !== 'string' || !input.content.trim() || input.content.length > 8000) throw invalid('Message must contain 1–8000 characters');
  const record = {[field]:id,sender_email:user.email,content:input.content.trim()};
  if (kind === 'session') {
    const mentions = input.mentions ?? [];
    if (!Array.isArray(mentions) || mentions.length > 20 || mentions.some(v => typeof v !== 'string' || v.length > 320)) throw invalid('Invalid mentions');
    Object.assign(record,{sender_name:user.full_name || user.email,message_type:mentions.length ? 'mention' : 'text',mentions});
  }
  return {message:await entity.create(record)};
}
