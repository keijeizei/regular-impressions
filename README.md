# Regular Impressions

A simple tool for writing regular expressions using pseudocode-like text. This project is under development.

Demo: https://regular-impressions.netlify.app/

## How to use

- Commands should strictly be written one command per line.
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

- Match either of two or more words by writing them separated by `or`.
```
cash or money					RegEx: (cash|money)
```

- Match a word only if it is followed by another word using the `ifnextis` command. This is also known as lookahead assertion.
Other assertions include `ifnextisnot` (negative lookahead assertion), `ifprevis` (lookbehind assertion), and `ifprevisnot` (negative lookbehind assertion)
```
name ifnextis pass				RegEx: name(?=pass)
name ifnextisnot fail				RegEx: name(?!fail)
name ifprevis from				RegEx: name(?<=from)
name ifprevisnot from				RegEx: name(?<!done)
```

## List of shorthands

Shorthands are written inside `:` and are shorthands for some character groups and have descriptive names.

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