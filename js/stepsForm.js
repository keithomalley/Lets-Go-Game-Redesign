;( function( window ) {
	
	'use strict';

	var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function stepsForm( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	stepsForm.prototype.options = {
		onSubmit : function() { return false; }
	};

	// // retrieves value in url
	// function delineate2(str)
	// {
	// point = str.lastIndexOf("=");
	// return(str.substring(point+1,str.length));
	// }

		// retrieves value in url
	function keepScore(question, answer)
	{

		if(question == 1 && answer == 1){
			return 5;
		}
		if(question == 2 && answer == 1){
			return 10;
		}
		if(question == 3 && answer == 1){
			return 15;
		}
		if(question == 4 && answer == 1){
			return 20;
		}
		else{
			return 0;
		}
		
	}

	/*function keepScore(form) {
		var answers = new Array();
		answers[0] = ['wallet', question1];
		answers[1] = ['phone', question2];
		answers[2] = ['keys', question3];
		answers[3] = ['card', question4];

		var theScore = 0;

		for (i=0; i < answers.length; i++) {
			currQuestionObject = answers[i][1];
				for (j=0; j<currQuestionObject.length; j++){
					if (currQuestionObject[j].checked && currQuestionObject[j].value == answers[i][0] ) {
					theScore++;
					break;
				}
		}
	}
	}*/

	stepsForm.prototype._init = function() {

		// // converting score to int
		// var del = parseInt(delineate2(text));

		var score = 0;

		var locate = window.location;
		document.newer.score.value = score;

		// current question
		this.current = 0;
		// questions
		this.questions = [].slice.call( this.el.querySelectorAll( 'ol.questions > li' ) );
		// total questions
		this.questionsCount = this.questions.length;
		// show first question
		classie.addClass( this.questions[0], 'current' );
		
		// next question control
		this.ctrlNext = this.el.querySelector( 'button.next' );

		// progress bar
		this.progress = this.el.querySelector( 'div.progress' );
		
		// question number status
		this.questionStatus = this.el.querySelector( 'span.number' );
		// current question placeholder
		this.currentNum = this.questionStatus.querySelector( 'span.number-current' );
		this.currentNum.innerHTML = Number( this.current + 1 );
		// total questions placeholder
		this.totalQuestionNum = this.questionStatus.querySelector( 'span.number-total' );
		this.totalQuestionNum.innerHTML = this.questionsCount;

		// error message
		this.error = this.el.querySelector( 'span.error-message' );
		
		// checks for HTML5 Form Validation support
		// a cleaner solution might be to add form validation to the custom Modernizr script
		this.supportsHTML5Forms = typeof document.createElement("input").checkValidity === 'function';
		
		// init events
		this._initEvents();
	};

	stepsForm.prototype._initEvents = function() {
		var self = this,
			// first input
			firstElInput = this.questions[ this.current ].querySelector( 'input' ),
			// focus
			onFocusStartFn = function() {
				firstElInput.removeEventListener( 'focus', onFocusStartFn );
				classie.addClass( self.ctrlNext, 'show' );
			};

		// show the next question control first time the input gets focused
		firstElInput.addEventListener( 'focus', onFocusStartFn );

		// show next question
		this.ctrlNext.addEventListener( 'click', function( ev ) { 
			ev.preventDefault();
			self._nextQuestion(); 
		} );

		// pressing enter will jump to next question
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// enter
			if( keyCode === 13 ) {
				ev.preventDefault();
				self._nextQuestion();
			}
		} );

		// disable tab
		this.el.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// tab
			if( keyCode === 9 ) {
				ev.preventDefault();
			} 
		} );
	};

	// correct answer
	stepsForm.prototype._nextQuestion = function() {

		console.log("wallet not selected");

		if( !this._validate() ) {
			return false;
		}

		// checks HTML5 validation
		if ( this.supportsHTML5Forms ) {
		    	var input = this.questions[ this.current ].querySelector( 'input' );
			// clear any previous error messages
			input.setCustomValidity( '' );

			
			// checks input against the validation constraint
			if ( !input.checkValidity() ) {
				// Optionally, set a custom HTML5 valiation message
				// comment or remove this line to use the browser default message
				// display the HTML5 error message
				this._showError( input.validationMessage );
				// prevent the question from changing
				return false;
			}
		}

		// check if form is filled
		if( this.current === this.questionsCount - 1 ) {
			this.isFilled = true;
		}

		// clear any previous error messages
		this._clearError();

		// current question
		var currentQuestion = this.questions[ this.current ];

		// increment current question iterator
		++this.current;

		// update progress bar
		this._progress();

		if( !this.isFilled ) {
			// change the current question number/status
			this._updateQuestionNumber();

			// add class "show-next" to form element (start animations)
			classie.addClass( this.el, 'show-next' );

			// remove class "current" from current question and add it to the next one
			// current question
			var nextQuestion = this.questions[ this.current ];
			classie.removeClass( currentQuestion, 'current' );
			classie.addClass( nextQuestion, 'current' );
		}

		// after animation ends, remove class "show-next" from form element and change current question placeholder
		var self = this,
			onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				if( self.isFilled ) {
					self._submit();
				}
				else {
					classie.removeClass( self.el, 'show-next' );
					self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
					self.questionStatus.removeChild( self.nextQuestionNum );
					// force the focus on the next input
					nextQuestion.querySelector( 'input' ).focus();
				}
			};

		if( support.transitions ) {
			this.progress.addEventListener( transEndEventName, onEndTransitionFn );
		}
		else {
			onEndTransitionFn();
		}
	}

	// updates the progress bar by setting its width
	stepsForm.prototype._progress = function() {
		this.progress.style.width = this.current * ( 100 / this.questionsCount ) + '%';
	}

	var counter = 0;
	// changes the current question number
	stepsForm.prototype._updateQuestionNumber = function() {

		// score incrementer
		counter++;
		// first, create next question number placeholder
		this.nextQuestionNum = document.createElement( 'span' );
		this.nextQuestionNum.className = 'number-next';
		this.nextQuestionNum.innerHTML = Number( this.current + 1 );
		// insert it in the DOM
		this.questionStatus.appendChild( this.nextQuestionNum );

		// accessing score passed through
		var locate = window.location;
		document.form2.score2.value = locate;

		// converting score from url to int
		var score = keepScore(this.current,1);
		// score updated
		//var score = del+counter;

		document.newer.score.value = score;

	}

	// submits the form
	stepsForm.prototype._submit = function() {
		this.options.onSubmit( this.el );
	}

	// TODO (next version..)
	// the validation function
	stepsForm.prototype._validate = function() {
		// current question´s input

		// String ans = "ansBtn"+[i];
		var input1 =  document.getElementsByName("ansBtn1");
		var input2 =  document.getElementsByName("ansBtn2");
		var input3 =  document.getElementsByName("ansBtn3");
		var input4 =  document.getElementsByName("ansBtn4");

		console.log(input1[0].checked);
		//this.questions[ this.current ].querySelector( 'input' ).value;
		/*if((input !== 'wallet') && (input !== 'keys') && (input !== 'card') && (input !== 'phone')) {
			this._showError( 'OTHER' );
			return false;
		}*/

		console.log(this.current);

		if (input1[0].checked !== true && this.current == 0) {
			this._showError( 'OTHER' );
			return false;
		} 
		else{
			input1[0].checked = false;
		}

		if (input2[0].checked !== true  && this.current == 1) {
			this._showError( 'OTHER' );
			return false;
		} 
		else{
			input2[0].checked = false;
		}

		if (input3[0].checked !== true  && this.current == 2) {
			this._showError( 'OTHER' );
			return false;
		} 
		else{
			input3[0].checked = false;
		}

		if (input4[0].checked !== true  && this.current == 3) {
			this._showError( 'OTHER' );
			return false;
		} 
		else{
			input4[0].checked = false;
		}

        // if (input2[0].checked !== true) {
        //             this._showError( 'OTHER' );
        //             return false;
        //         } 
		return true;
	}

	stepsForm.prototype._showError = function( err ) {
		var message = '';
		switch( err ) {
			case 'OTHER' : 
				message = 'Are you sure that is correct?';
				break;
			// ...
			default :
				message = err;
		};
		this.error.innerHTML = message;
		classie.addClass( this.error, 'show' );
	}

	// clears/hides the current error message
	stepsForm.prototype._clearError = function() {
		classie.removeClass( this.error, 'show' );
	}

	// add to global namespace
	window.stepsForm = stepsForm;

})( window );
