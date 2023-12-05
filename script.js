// default value for the input box
const inputBox = document.getElementById("input");
inputBox.textContent = ``;

// global variable containing all variables
var variables = {};

// OLD CODE without codemirror
/*
// event listener for auto translate on input change
document.getElementById('input').addEventListener('keyup', e => {
  variables = {}
  startTranslation()
})

// event listener to insert a \t when pressing tab
document.getElementById('input').addEventListener('keydown', e => {
  if (e.key == 'Tab') {
    e.preventDefault()
    var start = this.selectionStart
    var end = this.selectionEnd

    this.value = this.value.substring(0, start) + "\t" + this.value.substring(end)

    this.selectionStart = this.selectionEnd = start + 1
  }
})
*/

// codemirror's event listener for input change
editor.on("change", (editor) => {
  variables = {};
  var input = editor.doc.getValue();
  startTranslation(input);
});

const copyToClipboard = () => {
  var elm = document.getElementById("output");

  // for Internet Explorer
  if (document.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(elm);
    range.select();
  }

  // other browsers
  else if (window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(elm);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.execCommand("Copy");
  selection.removeAllRanges();

  // show snackbar for 3 seconds when copy button is clicked
  var x = document.getElementById("snackbar");
  x.className = "show";
  setTimeout(() => {
    x.className = x.className.replace("show", "");
  }, 3000);
};

/**
 * Get the input from the textarea, translate, and display the output.
 */
function startTranslation(input) {
  const outputBox = document.getElementById("output");

  output = convertToRegex(input || "");

  // OLD CODE without codemirror
  /*
  const input = document.getElementById('input').value
  output = convertToRegex(input)
  */

  // console.log(input)
  // console.log(output)
  outputBox.innerText = output;
}

/**
 * Convert the user input to a regular expression.
 * @param {String} input The input from the user
 * @returns The translated output
 */
function convertToRegex(input) {
  var output = "";
  var current_line;

  // checks before translation
  try {
    lines = escapeAndRemoveTabs(input);
    lines = evaluateVariables(lines);
  } catch (e) {
    return `Syntax error: ${e}`;
  }

  try {
    lines.forEach((line, i) => {
      const tokens = line.split(" ");
      // console.log(tokens)

      current_line = i + 1;
      output += evaluateLine(tokens);
    });
  } catch (e) {
    return `Syntax error at line ${current_line}: ${e}`;
  }

  output = replaceCharGroups(output);

  return output;
}

/**
 * Translates a line of input into a regular expression
 * @param {Array} tokens The tokens from a line of input
 * @param {Boolean} fromOr A value set to true if the function is called through an 'or' command
 * @returns The line of input translated into regular expression
 */
const evaluateLine = (tokens, fromOr) => {
  var output = "";
  if (tokens.length === 1) {
    if (tokens[0] === "start") return "^";
    if (tokens[0] === "end") return "$";
    if (tokens[0] === "or") return "|";
    return tokens[0];
  }

  if (tokens.includes("ifnextis")) {
    const command_index = tokens.findIndex((token) => token === "ifnextis");
    output += look(
      tokens.slice(0, command_index),
      tokens.slice(command_index + 1),
      "ifnextis"
    );
  } else if (tokens.includes("ifnextisnot")) {
    const command_index = tokens.findIndex((token) => token === "ifnextisnot");
    output += look(
      tokens.slice(0, command_index),
      tokens.slice(command_index + 1),
      "ifnextisnot"
    );
  } else if (tokens.includes("ifprevis")) {
    const command_index = tokens.findIndex((token) => token === "ifprevis");
    output += look(
      tokens.slice(0, command_index),
      tokens.slice(command_index + 1),
      "ifprevis"
    );
  } else if (tokens.includes("ifprevisnot")) {
    const command_index = tokens.findIndex((token) => token === "ifprevisnot");
    output += look(
      tokens.slice(0, command_index),
      tokens.slice(command_index + 1),
      "ifprevisnot"
    );
  } else if (tokens.includes("and")) {
    const and_index = tokens.findIndex((token) => token === "and");
    output +=
      evaluateLine(tokens.slice(0, and_index)) +
      evaluateLine(tokens.slice(and_index + 1));
  } else if (tokens.includes("or")) {
    const or_index = tokens.findIndex((token) => token === "or");
    // divide the line where the 'or' is and pass left and right side to or function
    output += or(tokens.slice(0, or_index), tokens.slice(or_index + 1), fromOr);
  } else if (tokens[0] === "anyexcept") output += any(tokens, false, false);
  else if (tokens[0] === "anyof") output += any(tokens, true, false);
  else if (tokens[0] === "comment") output += "";
  else if (tokens[0] === "range") output += range(tokens, false);
  else if (tokens[0] === "regex") output += regex(tokens);
  else if (tokens[0] === "repeat") output += repeat(tokens, false);
  else if (tokens[0] === "repeatlazy") output += repeat(tokens, true);
  else {
    tokens.forEach((token) => {
      output += token;
    });
  }

  return output;
};

/* -----------------------------------COMMANDS----------------------------------- */
/**
 * Evaluate an anyof/anyexcept command
 * @param {Array} tokens The array of tokens from a line
 * @param {Boolean} mode A value set to true if command is 'anyof', false if command is 'anyexcept'
 * @param {Boolean} fromWith A value set to true if the function is called through a 'with' command
 */
const any = (tokens, mode, fromWith) => {
  tokens.shift();
  tokens_passed = false;

  var output = "";
  if (!fromWith) {
    output += "[";
    if (!mode) output += "^";
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].length === 1) {
      output += tokens[i];
    } else if (tokens[i].length === 2 && tokens[i][0] === "\\") {
      output += tokens[i][1];
    }
    // remove the enclosing : and test if token is a shorthand
    else if (shorthand_group[tokens[i].slice(1, tokens[i].length - 1)]) {
      output += shorthand_group[tokens[i].slice(1, tokens[i].length - 1)];
    } else if (tokens[i] === "with") {
      output += riwith(tokens.slice(i + 1));
      tokens_passed = true;
      break;
    } else if (tokens[i] === "") {
      throw `Expected another argument for any${mode ? "of" : "except"}`;
    } else {
      throw `Invalid any${mode ? "of" : "except"} argument.`;
    }
  }

  // tokens are passed to another function using a 'with' command, statement should not be
  // closed with a ']' yet
  if (!tokens_passed) output += "]";

  return output;
};

/**
 * Evaluates look assertions commands.
 * This includes ifnextis, ifnextisnot, ifprevis, and ifprevisnot.
 * @param {Array} left An array of tokens at the left side of the look
 * @param {Array} right An array of tokens at the right side of the look
 * @param {String} command A string indicating the look assertion command
 */
const look = (left, right, command) => {
  var output = evaluateLine(left);
  switch (command) {
    case "ifnextis":
      output += "(?=";
      break;
    case "ifnextisnot":
      output += "(?!";
      break;
    case "ifprevis":
      output += "(?<=";
      break;
    case "ifprevisnot":
      output += "(?<!";
      break;
  }
  output += evaluateLine(right);
  output += ")";
  return output;
};

/**
 * Evaluate an or command
 * @param {Array} left An array of tokens at the left side of the or
 * @param {Array} right An array of tokens at the right side of the or
 * @param {Boolean} fromOr A value set to true if the function is called through an 'or' command
 */
const or = (left, right, fromOr) => {
  var output = "";

  if (!fromOr) output += "(";

  output += evaluateLine(left, false);
  output += "|";
  output += evaluateLine(right, true);

  // close the 'or' statement if it is the last 'or'
  if (!right.includes("or")) output += ")";

  return output;
};

/**
 * Evaluate a range command
 * @param {Array} tokens The array of tokens from a line
 * @param {Boolean} fromWith A value set to true if the function is called through a 'with' command
 */
const range = (tokens, fromWith) => {
  const t_len = tokens.length;

  if (t_len < 4) throw "Too few arguments for range.";

  if (tokens[1].length !== 1 || tokens[2] !== "to" || tokens[3].length !== 1) {
    throw "Invalid range format.";
  }

  if (tokens[t_len - 1] === "") throw "Expected another argument for range";

  var output = "";
  if (!fromWith) output += "[";

  output += `${tokens[1]}-${tokens[3]}`;

  // range can be followed by a with keyword
  if (tokens[4] === "with") output += riwith(tokens.slice(5));
  else output += "]";

  return output;
};

const regex = (tokens) => {
  if (tokens[1] === "") throw "Expected another argument for regex";
  return tokens[1];
};

const repeat = (tokens, isLazy) => {
  const t_len = tokens.length;

  if (tokens[t_len - 1] === "") throw "Expected another argument for repeat";

  var output = "";

  // the end is a range
  if (tokens[t_len - 2] === "to") {
    if (t_len < 5) throw "Too few arguments for repeat.";

    // evaluate the string to be repeated
    output += enclose(evaluateLine(tokens.slice(1, t_len - 3)));

    if (tokens[t_len - 3] === "0" && tokens[t_len - 1] === "1") {
      output += "?";
    } else if (tokens[t_len - 1] === "inf") {
      if (tokens[t_len - 3] === "0") output += "*";
      else if (tokens[t_len - 3] === "1") output += "+";
      else output += `{${tokens[t_len - 3]},}`;
    } else {
      // check if the range is a number
      if (!isNaN(tokens[t_len - 3]) && !isNaN(tokens[t_len - 1])) {
        if (!/^\+?(0|[1-9]\d*)$/.test(tokens[t_len - 1]))
          throw "Lower bound of repeat must be a positive integer.";

        if (!/^\+?(0|[1-9]\d*)$/.test(tokens[t_len - 1]))
          throw "Upper bound of repeat must be a positive integer.";

        if (parseInt(tokens[t_len - 3]) >= parseInt(tokens[t_len - 1]))
          throw "Upper bound of repeat must be greater that the lower bound.";

        output += `{${tokens[t_len - 3]},${tokens[t_len - 1]}}`;
      } else {
        throw "Range is not a valid number.";
      }
    }
  }
  // the end is only a number
  else if (!isNaN(tokens[t_len - 1]) && tokens[t_len - 1] !== "") {
    if (t_len < 3) throw "Too few arguments for repeat.";

    if (!/^\+?(0|[1-9]\d*)$/.test(tokens[t_len - 1]))
      throw "Repetition quantifier of repeat must be a positive integer.";

    // evaluate the string to be repeated
    output += enclose(evaluateLine(tokens.slice(1, t_len - 1)));

    output += `{${tokens[t_len - 1]}}`;
  } else throw "Invalid repeat statement.";

  if (isLazy) output += "?";

  return output;
};

const riwith = (tokens) => {
  console.log(tokens);
  if (tokens[0] === "range") return range(tokens, true);
  else if (tokens[0] === "anyof") return any(tokens, true, true);
  throw "Invalid command after with.";
};

/* -----------------------------TRANSLATION FUNCTIONS---------------------------- */

/**
 * Encloses a given string inside parenthesis if the length is greater than 1
 * and the string is not yet enclosed.
 * @param {String} str String to be enclosed
 * @returns The potentially enclosed string
 */
const enclose = (str) => {
  if (str.length > 1) {
    // don't enclose if string is already enclosed
    if (
      (str[0] === "(" && str[str.length - 1] === ")") ||
      (str[0] === "[" && str[str.length - 1] === "]")
    ) {
      return str;
    }
    return `(${str})`;
  }
  return str;
};

/**
 * Scans an input string and escape all the characters that are to be escaped and
 * removes all tabs at the start of a line
 * @param {String} input The input to be scanned
 * @returns An array split into lines with its escapable characters appended with a \
 */
const escapeAndRemoveTabs = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    line = line.replace(/^\s+/, "");

    // ignore lines starting with 'regex'
    if (line.match(/^regex/)) return line;

    // escape all escapable characters and change their spacing to 1 space
    return line
      .split(/\s+/)
      .map((token) =>
        token
          .split("")
          .map((c) => (escapables.includes(c) ? `\\${c}` : c))
          .join("")
      )
      .join(" ");
  });
};

/**
 * Evaluate all the variables, save them in the 'variables' global variable,
 * and replaces all occurences of them with their RegEx equivalent
 * @param {Array} lines The array of lines
 * @returns The new array of lines with the variable declarations removed and the variables evaluated
 */
const evaluateVariables = (lines) => {
  var variable_contents = [];
  var isVariable = false;
  var variable_name = "";

  lines.forEach((line, i) => {
    const tokens = line.split(" ");

    if (tokens[0] === "variable") {
      // variable end
      if (isVariable) {
        var output = "";

        // evaluate the value of the variable
        variable_contents.forEach((line) => {
          const tokens = line.split(" ");

          output += evaluateLine(tokens);
        });

        output = replaceCharGroups(output);

        variables[variable_name] = output;

        // clear variable contents for the next possible variable
        variable_contents = [];
        delete lines[i];
        isVariable = false;
      }
      // variable start
      else {
        // reserved keyword variable names are not allowed
        if (reserved.includes(tokens[1]))
          throw "Variable name is a reserved keyword.";

        if (tokens[1] === "") throw "Expected variable name.";

        // create a new empty key in variables
        variables[tokens[1]] = "";
        variable_name = tokens[1]; // save variable name

        isVariable = true;
        delete lines[i];
      }
    } else if (isVariable) {
      variable_contents.push(lines[i]);
      delete lines[i];
    }
  });

  // replace all occurences of variable names with their regex equivalent
  lines.forEach((line, i) => {
    const tokens = line.split(" ");

    // ignore lines starting with 'regex'
    if (tokens[0] === "regex") return;

    lines[i] = tokens
      .map((token, j) => {
        if (Object.keys(variables).includes(token)) return variables[token];
        return token;
      })
      .join(" ");
  });

  if (isVariable) throw `Variable ${variable_name} is unterminated.`;

  return lines;
};

/**
 * Replace shorthands inside ':' with their regular expression counterparts.
 * @param {String} str A string of code
 * @returns A string with shorthands replaced
 */
const replaceCharGroups = (str) => {
  Object.keys(shorthand_group).forEach((key) => {
    str = str.replaceAll(`(:${key}:)`, `[${shorthand_group[key]}]`); // remove () if shorthand is enclosed in ()
    str = str.replaceAll(`:${key}:`, `[${shorthand_group[key]}]`);
  });

  Object.keys(shorthand_char).forEach((key) => {
    str = str.replaceAll(`(:${key}:)`, `${shorthand_char[key]}`); // remove () if shorthand is enclosed in ()
    str = str.replaceAll(`:${key}:`, `${shorthand_char[key]}`);
  });

  return str;
};

// auto translate the default value on page load
startTranslation();

/* -----------------------------------MODAL----------------------------------- */

const toggleModal = (mode) => {
  var modal = document.getElementById("modal");
  var examples = document.getElementById("content-examples");
  var title_examples = document.getElementById("title-examples");
  var about = document.getElementById("content-about");
  var title_about = document.getElementById("title-about");

  switch (mode) {
    case "examples":
      modal.style.visibility = "visible";
      examples.style.display = "block";
      title_examples.style.display = "block";
      about.style.display = "none";
      title_about.style.display = "none";
      break;
    case "about":
      modal.style.visibility = "visible";
      examples.style.display = "none";
      title_examples.style.display = "none";
      about.style.display = "block";
      title_about.style.display = "block";
      break;
    default:
      modal.style.visibility = "hidden";
      examples.style.display = "none";
      title_examples.style.display = "none";
      about.style.display = "none";
      title_about.style.display = "none";
  }
};
