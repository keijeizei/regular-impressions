# Regular Impressions

A simple tool for writing regular expressions using a pseudocode-like language.

Demo: https://regular-impressions.netlify.app/

Examples: [Examples](#examples)

## Table of Contents

<!--ts-->
   * [Table of contents](#table-of-contents)
   * [How to use](#how-to-use)
   * [Commands](#commands)
      * [Variables](#variables)
   * [Shorthands](#shorthands)
   * [Examples](#examples)
<!--te-->

## How to use

- Commands are recommended to be written one command per line unless the commands are nested.
- Symbols and punctuations DO NOT need to be escaped.
- Multiple commands are concatenated using line breaks.
- Tabs can be used to indent for readability.

## Commands
#### `repeat`
- Match repeating patterns using the `repeat` command followed by the pattern and the number of repetitions or a range of repetition.
Repeat ranges are written as `l to u` where `l` and `u` are integers indicating the lower and upper bound of the range.
- Use the `inf` keyword to specify an infinite upper bound.

```
repeat text 1 to 5				RegEx: (text){1, 5}
repeat text 5					RegEx: (sample){5}
repeat sample 0 to inf				RegEx: (sample)*
```
#### `anyof`
- Match a character from a list of characters using the `anyof` command followed by the characters separated by spaces.
Shorthand groups can also be used (see [shorthands](#shorthands)).

```
anyof q w e r t y				RegEx: [qwerty]
anyof :lowercase: :digit: . ,			RegEx: [a-z0-9.,]
```
#### `anyexcept`
- Match any character not from a list of characters using the `anyexcept` command followed by the characters separated by spaces.

```
anyexcept a e i o u				RegEx: [^aeiou]
```
#### `range`
- Match a range of characters using the `range` command followed by the range of characters.
```
range a to d					RegEx: [a-d]
```
#### `with`
- Multiple `range` and `anyof` can be joined to create a large set of characters using the `with` command.
```
range a to d with anyof 1 2 3			RegEx: [a-d123]
anyof 1 2 3 with range a to d			RegEx: [123a-d]
range a to z with range A to Z			RegEx: [a-zA-Z]
```
#### `regex`
- Enter a regular expression using the `regex` command. This can also be used to escape commands
```
regex repeat\n					RegEx: repeat\n
```
#### `comment`
- Enter a comment using the `comment` command followed by your comment.
```
comment The line below means one or more 'a'
repeat a 1 to inf
```
#### `start` and `end`
- Match the start of a line using the `start` command and the end of the line using the `end` command.
```
start						RegEx: ^(text){2,}$
repeat text 2 to inf
end
```
#### `or`
- Match either of two or more words or commands by writing them separated by `or`.
- Inline `or` encloses the whole line in parenthesis, multiline `or` does not.
```
cash or money					RegEx: (cash|money)

repeat abc 0 to 1 or repeat xyz 1 to 2		RegEx: ((abc)?|(xyz){1,2})

repeat abc 0 to 1				RegEx: (abc)?|(xyz){1,2}
or
repeat xyz 1 to 2
```
#### `ifnextis`, `ifnextisnot`, `ifprevis`, `ifprevisnot`
- Match a word only if it is followed by another word using the `ifnextis` command. This is also known as lookahead assertion.
Other assertions include `ifnextisnot` (negative lookahead assertion), `ifprevis` (lookbehind assertion), and `ifprevisnot` (negative lookbehind assertion)
```
name ifnextis passed				RegEx: name(?=passed)
name ifnextisnot failed				RegEx: name(?!failed)
name ifprevis from				RegEx: name(?<=from)
name ifprevisnot to				RegEx: name(?<!to)
```
- Use the `:null:` shorthand to indicate an empty match for either of the look assertion arguments.
#### `and`
- Concatenation is recommended to be done by using line breaks for readability. However, inline concatenation is still possible by typing `and` between two commands. This can be used for cases like concatenating commands inside a look assertion.
```
:null: ifnextis repeat :any: 0 to inf and :digit:	RegEx: (?=.*[0-9])
```

### Variables
Multiple commands can be reused by assigning it to a variable. Variables start with the `variable` command followed by the name of the variable. Succeeding lines are the contents of the variable, and the last line should be `variable`, indicating the end of the declaration.
```
variable gerund
repeat :lowercase: 1 to inf
ing
variable

repeat gerund 0 to 1				RegEx evaluates to: ([a-z]+ing)?
```

## Shorthands

Shorthands are written inside `:` and are simple keywords for some character groups. While most of them takes more time to type than their RegEx counterparts, they are more descriptive and easier to remember.

| Shorthand         | RegEx         |
|-------------------|---------------|
| `:digit:`         | `[0-9]`       |
| `:lowercase:`     | `[a-z]`       |
| `:uppercase:`     | `[A-Z]`       |
| `:letter:`        | `[a-zA-Z]`    |
| `:alphanumeric:`  | `[a-zA-Z0-9]` |
| `:any:`           | `.`           |
| `:whitespace:`    | `\s`          |
| `:notwhitespace:` | `\S`          |
| `:word:`          | `\w`          |
| `:notword:`       | `\W`          |
| `:tab:`           | `\t`          |
| `:return:`        | `\r`          |
| `:newline:`       | `\n`          |
| `:boundary:`      | `\b`          |
| `:notboundary:`   | `\B`          |
| `:null:`          |               |

## Examples
- Simplified email pattern
```
start
repeat anyof :alphanumeric: + _ . - 1 to inf
@
repeat anyof :alphanumeric: . - 1 to inf
end
```

- Negative, whole, or decimal numbers
```
start
repeat - 0 to 1
repeat :digit: 0 to inf
repeat . 0 to 1
repeat :digit: 1 to inf
end
```

- URL pattern
```
start
http
repeat s 0 to 1
://
repeat www. 0 to 1
repeat anyof - :alphanumeric: @ : % . _ \ + ~ # = 2 to 256
.
repeat :lowercase: 2 to 6
:boundary:
repeat anyof - :alphanumeric: @ : % . _ \ + ~ # ( ) ? / = 0 to inf
end
```

- Password with 1 lowercase letter, 1 uppercase letter, 1 number, and contains at least 8 characters
```
:null: ifnextis repeat :any: 0 to inf and :digit:
:null: ifnextis repeat :any: 0 to inf and :alphanumeric:
:null: ifnextis repeat :any: 0 to inf and :uppercase:
:null: ifnextis repeat :any: 0 to inf and :lowercase:
start
repeat :any: 8 to inf
end
```

- Date in the form YYYY/MM/DD from 1900-01-01 to 2099-12-31
```
start
comment -------YEAR
	19 or 20
	repeat :digit: 2
	/
comment -------MONTH
	regex (
		0
		range 1 to 9

		or

		1
		anyof 0 1 2
	regex )
	/
comment -------DATE
	regex (
		0
		range 1 to 9

		or

		anyof 1 2
		range 0 to 9

		or

		3
		anyof 0 1
	regex )
end
```