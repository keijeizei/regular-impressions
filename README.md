# Regular Impressions

A simple tool for writing regular expressions using pseudocode-like text. This project is under development.

Demo: https://regular-impressions.netlify.app/

## How to use

- Commands should strictly be written one command per line unless the commands are nested.
- Symbols and punctuations DO NOT need to be escaped.
- Multiple commands are concatenated using line breaks.
- See next section for list of commands.

## List of commands

- Match repeating patterns using the `repeat` command followed by the pattern and the range of repetition.
Use the `inf` keyword to specify an infinite upper bound.

```
repeat text 1 to 5				RegEx: (text){1, 5}
repeat sample 0 to inf				RegEx: (sample)*
```

- Match a character from a list of characters using the `anyof` command followed by the characters separated by spaces.

```
anyof q w e r t y				RegEx: [qwerty]
```

- Match any character not from a list of characters using the `anyexcept` command followed by the characters separated by spaces.

```
anyexcept a e i o u				RegEx: [^aeiou]
```

- Enter a regular expression using the `regex` command.
```
regex repeat\n					RegEx: repeat\n
```

- Enter a comment using the `comment` command followed by your comment.
```
comment The line below means one or more 'a'
repeat a 1 to inf
```

- Match the start of a line using the `start` command and the end of the line using the `end` command.
```
start						RegEx: ^(text){2,}$
repeat text 2 to inf
end
```

- Match either of two or more words by writing them separated by `or`.
To put an `or` between two commands, put the `or` in a new line between the two commands.
```
cash or money					RegEx: (cash|money)

repeat text 0 to 1				RegEx: (text)?|(text){1,2}
or
repeat text 1 to 2
```

- Match a word only if it is followed by another word using the `ifnextis` command. This is also known as lookahead assertion.
Other assertions include `ifnextisnot` (negative lookahead assertion), `ifprevis` (lookbehind assertion), and `ifprevisnot` (negative lookbehind assertion)
```
name ifnextis passed				RegEx: name(?=passed)
name ifnextisnot failed				RegEx: name(?!failed)
name ifprevis from				RegEx: name(?<=from)
name ifprevisnot to				RegEx: name(?<!to)
```

#### Variables
Multiple commands can be reused by assigning it to a variable. Variables start with the `variable` command followed by the name of the variable. Succeeding lines are the contents of the variable, and the last line should be `variable`, indicating the end of the declaration.
```
variable gerund
repeat :lowercase: 1 to inf
ing
variable

repeat gerund 0 to 1				RegEx evaluates to: ([a-z]+ing)?
```

## List of shorthands

Shorthands are written inside `:` and are shorthands for some character groups. While most of them takes more time to type than their RegEx counterparts, they are more descriptive and easier to remember.

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

## Examples
Simplified email pattern
```
start
repeat :notwhitespace: 1 to inf
@
repeat :notwhitespace: 1 to inf
end
```

Negative, whole, or decimal numbers
```
start
repeat - 0 to 1
repeat :digit: 0 to inf
repeat . 0 to 1
repeat :digit: 1 to inf
end
```

Simplified domain name pattern
```
start
http
repeat s 0 to 1
://
repeat www. 0 to 1
repeat :alphanumeric: 1 to 63
.
repeat :letter: 2 to 6
end
```