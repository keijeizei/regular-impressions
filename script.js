// default value for the input box
const inputBox = document.getElementById('input')
inputBox.textContent = ``

// event listener for auto translate on input change
document.getElementById('input').addEventListener('keyup', (e) => {
  startTranslation()
})

function startTranslation() {
  const outputBox = document.getElementById('output')
  outputBox.innerText = 'Error'

  const input = document.getElementById('input').value
  console.log(input)
  output = convertToRegex(input)
  console.log(output)

  outputBox.innerText = output
}

function convertToRegex(input) {
  var output = ''

  lines = escape(input)

  lines.forEach(line => {
    const tokens = line.split(' ')
    // console.log(tokens)

    output += evaluateLine(tokens)
  })

  output = replaceCharGroups(output)

  return output
}

const evaluateLine = (tokens) => {
  var output = ''
  if(tokens.length === 1) {
    if(tokens[0] === 'start') return '^'
    if(tokens[0] === 'end') return '$'
    return tokens[0]
  }

  if(tokens[0] === 'anyexcept') output += anyexcept(tokens)

  if(tokens[0] === 'anyof') output += anyof(tokens)

  if(tokens[0] === 'regex') output += regex(tokens)

  if(tokens[0] === 'repeat') output += repeat(tokens)

  if(tokens[1] === 'or') {
    var temp_out = ''
    temp_out += `${tokens[0]}|`
    temp_out += evaluateLine(tokens.slice(2))
    output += enclose(temp_out)
  }

  return output
}

const anyof = (tokens) => {
  tokens.shift()

  var output = tokens.map(c => {
    if(c.length === 1 || c.length === 2 && c[0] === '\\') return c
    throw Error
  })

  output.unshift('[')
  output.push(']')
  return output.join('')
}

const anyexcept = (tokens) => {
  tokens.shift()

  var output = tokens.map(c => {
    if(c.length === 1 || c.length === 2 && c[0] === '\\') return c
    throw Error
  })

  output.unshift('[', '^')
  output.push(']')
  return output.join('')
}

const regex = (tokens) => {
  return tokens[1]
}

const repeat = (tokens) => {
  var output = ''
  const t_len = tokens.length
  // console.log(t_len)

  if(t_len < 5) {
    throw Error
  }

  // evaluate the string to be repeated
  output += enclose(evaluateLine(tokens.slice(1, t_len - 3)))

  if(tokens[t_len - 3] === '0' && tokens[t_len - 1] === '1') {
    output += '?'
  }
  else if(tokens[t_len - 1] === 'inf') {
    if(tokens[t_len - 3] === '0') output += '*'
    else if(tokens[t_len - 3] === '1') output += '+'
    else output += `{${tokens[t_len - 3]},}`
  }
  else {
    // check if the range is a number
    if(!isNaN(tokens[t_len - 3]) && !isNaN(tokens[t_len - 1])) {
      output += `{${tokens[t_len - 3]},${tokens[t_len - 1]}}`
    }
    else {
      throw Error
    }
  }
  return output
}

/**
 * Encloses a given string inside parenthesis if the length is greater than 1
 * @param {String} str String to be enclosed
 * @returns The potentially enclosed string
 */
const enclose = (str) => {
  if(str.length > 1) {
    // don't enclose if string is already enclosed
    if(str[0] === '(' && str[str.length - 1] === ')' || str[0] === '[' && str[str.length - 1] === ']') return str
    return `(${str})`
  }
  return str
}

/**
 * Scans an input string and escape all the characters that are to be escaped
 * @param {String} input The input to be scanned
 * @returns An array split into lines with its escapable characters appended with a \
 */
const escape = (input) => {
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

  const lines = input.split('\n')
  return lines.map(line => {
    // ignore lines starting with 'regex'
    if(line.match(/^regex/)) return line
    return (line.split(' ').map(c => escapables.includes(c) ? `\\${c}` : c)).join(' ')
  })
}

const replaceCharGroups = (str) => {
  const charGroups = {
    digit: '[0-9]',
    lowercase: '[a-z]',
    uppercase: '[A-Z]',
    letter: '[a-zA-Z]',
    alphanumeric: '[a-zA-Z0-9]',
    any: '.',
  	whitespace: '\\s',
    notwhitespace: '\\S',
    word: '\\w',
	  notword: '\\W',
	  tab: '\\t',
    return: '\\r',
  }

  Object.keys(charGroups).forEach(key => {
    const re = new RegExp('\\(*:' + key + ':\\)*', 'g')
    // console.log(re)
    str = str.replace(re, charGroups[key])
  })

  return str
}

// auto translate the default value on page load
startTranslation()