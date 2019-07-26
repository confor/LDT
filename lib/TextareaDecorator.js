/* TextareaDecorator.js
 * written by Colin Kuebler 2012
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Builds and maintains a styled output layer under a textarea input layer
 */

class TextareaDecorator {
	constructor(textarea, parser) {
		this.textarea = textarea;
		this.parser = parser;

		var parent = document.createElement("div"),
			output = document.createElement("pre");

		parent.appendChild(output);
		document.body.appendChild(parent);
		parent.className = 'ldt force-monospace';

		this.parent = parent;
		this.output = output;

		textarea.spellcheck = false;
		textarea.wrap = "off";
		textarea.className += ' force-monospace';

		textarea.addEventListener('input', e => this.update(), false );
		textarea.addEventListener('input', e => this.scroll());
		textarea.addEventListener('scroll', e => this.scroll());
		window.addEventListener('resize', e => this.reposition());
		window.addEventListener('scroll', e => this.reposition());

		this.styles();
		this.reposition();
		this.update();
	}

	styles() {
		this.parent.style['z-index'] = '9000';
		this.textarea.style['z-index'] = '9001';
		this.textarea.style.opacity = '0.4';

		var source = this.textarea,
			target = this.output,
			styles = window.getComputedStyle(source);

		var copy = ['fontSize', 'margin', 'padding', 'border'];

		for (let i = 0; i < copy.length; i++) {
			let name = copy[i];
			target.style[name] = styles[name];
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

	color(input, output, parser) {
		var oldTokens = output.childNodes;
		var newTokens = parser.tokenize(input);
		var firstDiff, lastDiffNew, lastDiffOld;
		// find the first difference
		for( firstDiff = 0; firstDiff < newTokens.length && firstDiff < oldTokens.length; firstDiff++ )
			if( newTokens[firstDiff] !== oldTokens[firstDiff].textContent ) break;
		// trim the length of output nodes to the size of the input
		while( newTokens.length < oldTokens.length )
			output.removeChild(oldTokens[firstDiff]);
		// find the last difference
		for( lastDiffNew = newTokens.length-1, lastDiffOld = oldTokens.length-1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld-- )
			if( newTokens[lastDiffNew] !== oldTokens[lastDiffOld].textContent ) break;
		// update modified spans
		for( ; firstDiff <= lastDiffOld; firstDiff++ ){
			oldTokens[firstDiff].className = parser.identify(newTokens[firstDiff]);
			oldTokens[firstDiff].textContent = oldTokens[firstDiff].innerText = newTokens[firstDiff];
		}
		// add in modified spans
		for( var insertionPt = oldTokens[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++ ){
			var span = document.createElement("span");
			span.className = parser.identify(newTokens[firstDiff]);
			span.textContent = span.innerText = newTokens[firstDiff];
			output.insertBefore( span, insertionPt );
		}
	}

	update() {
		var input = this.textarea.value;
		if( input ){
			this.color( input, this.output, this.parser );
			/*
			// determine the best size for the textarea
			var lines = input.split('\n');
			// find the number of columns
			var maxlen = 0,
				curlen;
			for( var i = 0; i < lines.length; i++ ){
				// calculate the width of each tab
				var tabLength = 0, offset = -1;
				while( (offset = lines[i].indexOf( '\t', offset+1 )) > -1 ){
					tabLength += 7 - (tabLength + offset) % 8;
				}
				curlen = lines[i].length + tabLength;
				// store the greatest line length thus far
				maxlen = maxlen > curlen ? maxlen : curlen;
			}
			this.textarea.cols = maxlen + 1;
			this.textarea.rows = lines.length + 1;*/
		} else {
			// clear the display
			output.innerHTML = '';
			// reset textarea rows/cols
			//this.textarea.cols = textarea.rows = 1;
		}
	}
}
