export type ParsedCommand = 
  | { type: 'BACKLOG'; payload: string }
  | { type: 'NEXT'; payload: string }
  | { type: 'TASK'; payload: string }
  | { type: 'EVENT'; payload: string }
  | null;

export function parseCommand(input: string): ParsedCommand {
  const t = input.trim().toLowerCase();
  
  if (t.startsWith('add backlog:')) {
    return { type: 'BACKLOG', payload: input.slice(12).trim() };
  }
  
  if (t.startsWith('add next:')) {
    return { type: 'NEXT', payload: input.slice(9).trim() };
  }
  
  if (t.startsWith('add task:')) {
    return { type: 'TASK', payload: input.slice(9).trim() };
  }
  
  if (t.startsWith('add event:')) {
    return { type: 'EVENT', payload: input.slice(10).trim() };
  }
  
  return null;
}
