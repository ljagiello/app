(function(){
	'use strict';
	if ( window.Wikia.AbTest && Wikia.AbTest.getGroup( 'OPTIMIZELY' ) === 'ENABLED' ) {
		document.write('<script src="//cdn.optimizely.com/js/595431323.js"></script>');
	}
})();
