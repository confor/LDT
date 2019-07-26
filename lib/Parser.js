/* Parser.js
 * written by Colin Kuebler 2012
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Generates a tokenizer from regular expressions for TextareaDecorator
 */
"use strict";

class Parser {
	constructor(rules, i) {
		this.i = i ? 'i' : ''; // case sensitive
		this.parseRE = null;
		this.ruleSrc = [];
		this.ruleMap = {};

		this.add(rules);
	}

	add(rules) {
		for (let rule in rules) {
			if (!rules.hasOwnProperty(rule))
				continue;

			var s = rules[rule].source;
			this.ruleSrc.push(s);
			this.ruleMap[rule] = new RegExp('^('+s+')$', this.i );
		}

		this.parseRE = new RegExp( this.ruleSrc.join('|'), 'g'+ this.i );
	}

	tokenize(input) {
		return input.match(this.parseRE);
	}

	identify(token) {
		for (let rule in this.ruleMap) {
			if (!this.ruleMap.hasOwnProperty(rule))
				continue;

			if (this.ruleMap[rule].test(token))
				return rule;
		}
	}
}
