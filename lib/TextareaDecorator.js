/* TextareaDecorator.js
 * written by Colin Kuebler 2012
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Builds and maintains a styled output layer under a textarea input layer
 */

class TextareaDecorator {
	constructor(textarea, parser, options) {
		this.textarea = textarea;
		this.parser = parser;
		this.options = Object.assign({}, { nowrap: false, monospace: true, opacity: '0.2' }, options);

		var parent = document.createElement("div"),
			output = document.createElement("pre");

		parent.appendChild(output);
		document.body.appendChild(parent);
		parent.className = 'ldt';

		this.parent = parent;
		this.output = output;

		if (this.options.nowrap) {
			textarea.wrap = "off";
		}

		if (this.options.monospace !== false) {
			parent.className += ' force-monospace';
			textarea.className += ' force-monospace';
		}

		textarea.addEventListener('input', e => this.update(), false );
		textarea.addEventListener('input', e => this.scroll());
		textarea.addEventListener('scroll', e => this.scroll());
		textarea.addEventListener('mouseup', e => this.reposition()); // resize
		window.addEventListener('resize', e => this.reposition());
		window.addEventListener('scroll', e => this.reposition());

		this.styles();
		this.reposition();
		this.update();
	}

	styles() {
		this.parent.style['z-index'] = '9000';
		this.textarea.style['z-index'] = '9001';
		this.textarea.style['caret-color'] = 'black';
		this.textarea.style.color = 'rgba(0, 0, 0, ' + this.options.opacity + ')';
		this.textarea.style.backgroundColor = 'transparent';

		var source = this.textarea,
			target = this.output,
			styles = window.getComputedStyle(source);

		var copy = ['fontSize', 'margin', 'padding', 'border', 'lineHeight'];

		for (let i = 0; i < copy.length; i++) {
			let name = copy[i];
			target.style[name] = styles[name];
		}

		if (!this.options.nowrap) {
			target.style['white-space'] = 'pre-wrap';
			target.style['word-wrap'] = 'break-word';
		}
	}

	scroll() {
		this.parent.scrollTop = this.textarea.scrollTop;
		this.parent.scrollLeft = this.textarea.scrollLeft;
	}

	reposition() {
		// http://javascript.info/coordinates
		// https://stackoverflow.com/a/11396681/4301778
		var bodyBox = document.body.getBoundingClientRect(),
			target = this.textarea,
			parent = this.parent,
			box = target.getBoundingClientRect();

		var top = box.top - bodyBox.top,
			left = box.left - bodyBox.left;

		parent.style.position = 'absolute';
		target.style.position = 'relative';

		parent.style.top = top + 'px';
		parent.style.left = left + 'px';
		parent.style.width = box.width + 'px';
		parent.style.height = box.height + 'px';
	}

	color() {
		var input = this.textarea.value,
			oldTokens = this.output.childNodes,
			newTokens = this.parser.tokenize(input);

		var firstDiff, lastDiffNew, lastDiffOld;
		// find the first difference
		for( firstDiff = 0; firstDiff < newTokens.length && firstDiff < oldTokens.length; firstDiff++ )
			if( newTokens[firstDiff] !== oldTokens[firstDiff].textContent ) break;
		// trim the length of output nodes to the size of the input
		while( newTokens.length < oldTokens.length )
			this.output.removeChild(oldTokens[firstDiff]);
		// find the last difference
		for( lastDiffNew = newTokens.length-1, lastDiffOld = oldTokens.length-1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld-- )
			if( newTokens[lastDiffNew] !== oldTokens[lastDiffOld].textContent ) break;
		// update modified spans
		for( ; firstDiff <= lastDiffOld; firstDiff++ ){
			oldTokens[firstDiff].className = this.parser.identify(newTokens[firstDiff]);
			oldTokens[firstDiff].textContent = oldTokens[firstDiff].innerText = newTokens[firstDiff];
		}
		// add in modified spans
		for( var insertionPt = oldTokens[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++ ){
			var span = document.createElement("span");
			span.className = this.parser.identify(newTokens[firstDiff]);
			span.textContent = span.innerText = newTokens[firstDiff];
			this.output.insertBefore( span, insertionPt );
		}
	}

	update() {
		var input = this.textarea.value;
		if (input)
			this.color();
		else
			while(this.output.firstChild)
				this.output.removeChild(this.output.firstChild);
	}
}
