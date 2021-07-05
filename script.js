// default value for the input box
const inputBox = document.getElementById('input')
inputBox.textContent = ``

// global variable containing all variables
var variables = {}

// event listener for auto translate on input change
document.getElementById('input').addEventListener('keyup', (e) => {
  variables = {}
  startTranslation()
})

const copyToClipboard = () => {
  var elm = document.getElementById("output");
  
  // for Internet Explorer
  if(document.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(elm);
    range.select();
  }

  // other browsers
  else if(window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(elm);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.execCommand("Copy");
}

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

  lines = evaluateVariables(lines)

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
    if(tokens[0] === 'or') return '|'
    return tokens[0]
  }

  if(tokens[0] === 'anyexcept') output += anyexcept(tokens)

  else if(tokens[0] === 'anyof') output += anyof(tokens)

  else if(tokens[0] === 'comment') output += ''

  else if(tokens[0] === 'regex') output += regex(tokens)

  else if(tokens[0] === 'repeat') output += repeat(tokens)

  else if(tokens[1] === 'or') {
    var temp_out = ''
    temp_out += `${tokens[0]}|`
    temp_out += evaluateLine(tokens.slice(2))
    output += enclose(temp_out)
  }

  else if(tokens[1] === 'ifnextis') {
    output += `${tokens[0]}(?=${evaluateLine(tokens.slice(2))}))`
  }

  else if(tokens[1] === 'ifnextisnot') {
    output += `${tokens[0]}(?!${evaluateLine(tokens.slice(2))}))`
  }

  else if(tokens[1] === 'ifprevis') {
    output += `${tokens[0]}(?<=${evaluateLine(tokens.slice(2))}))`
  }

  else if(tokens[1] === 'ifprevisnot') {
    output += `${tokens[0]}(?<!${evaluateLine(tokens.slice(2))}))`
  }

  else {
    tokens.forEach(token => {
      output += token
    })
  }

  return output
}

/* ---------------COMMANDS--------------- */
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
  const lines = input.split('\n')
  return lines.map(line => {
    // ignore lines starting with 'regex'
    if(line.match(/^regex/)) return line
    return (line.split(' ').map(c => escapables.includes(c) ? `\\${c}` : c)).join(' ')
  })
}

/**
 * Evaluate all the variables, save them in the 'variables' global variable,
 * and replaces all occurences of them with their RegEx equivalent
 * @param {Array} lines The array of lines
 * @returns The new array of lines with the variable declarations removed and the variables evaluated
 */
const evaluateVariables = (lines) => {
  var variable_contents = []
  var isVariable = false
  var variable_name = ''

  lines.forEach((line, i) => {
    const tokens = line.split(' ')

    if(tokens[0] === 'variable') {
      // variable end
      if(isVariable) {
        var output = ''

        // evaluate the value of the variable
        variable_contents.forEach(line => {
          const tokens = line.split(' ')
      
          output += evaluateLine(tokens)
        })
      
        output = replaceCharGroups(output)
      
        variables[variable_name] = output

        // clear variable contents for the next possible variable
        variable_contents = []
        delete lines[i]
        isVariable = false
      }
      // variable start
      else {
        // reserved keyword variable names are not allowed
        if(reserved.includes(tokens[1])) throw Error
        
        // create a new empty key in variables
        variables[tokens[1]] = ''
        variable_name = tokens[1]                       // save variable name

        isVariable = true
        delete lines[i]
      }
    }
    else if(isVariable) {
      variable_contents.push(lines[i])
      delete lines[i]
    }
  })

  // replace all occurences of variable names with their regex equivalent
  lines.forEach((line, i) => {
    const tokens = line.split(' ')

    lines[i] = (tokens.map((token, j) => {
      if(Object.keys(variables).includes(token)) return variables[token]
      return token
    })).join(' ')
  })

  // remove all empty entries from delete, and remove all empty strings as well
  lines = lines.filter(line => line != false)

  return lines
}

const replaceCharGroups = (str) => {

  Object.keys(shorthands).forEach(key => {
    const re = new RegExp('\\(*:' + key + ':\\)*', 'g')
    str = str.replace(re, shorthands[key])
  })

  return str
}

// auto translate the default value on page load
startTranslation()