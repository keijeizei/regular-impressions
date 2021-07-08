const shorthand_group =  {
  digit: '0-9',
  lowercase: 'a-z',
  uppercase: 'A-Z',
  letter: 'a-zA-Z',
  alphanumeric: 'a-zA-Z0-9',
}

const shorthand_char = {
  any: '.',
  whitespace: '\\s',
  notwhitespace: '\\S',
  word: '\\w',
  notword: '\\W',
  tab: '\\t',
  return: '\\r',
  newline: '\\n',
  boundary: '\\b',
  notboundary: '\\B',
  null: '',
}

const escapables = [
  '*',
  '+',
  '?',
  '\\',
  '.',
  '^',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '$',
  '&',
  '|',
]

const reserved = [
  'and',
  'anyexcept',
  'anyof',
  'comment',
  'end',
  'ifnextis',
  'ifnextisnot',
  'ifprevis',
  'ifprevisnot',
  'or',
  'regex',
  'repeat',
  'start',
]