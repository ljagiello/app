<!doctype html>
	<html lang="ks">
		<head>
			<meta charset="utf-8" />
			<title>414 Request-URI Too Long</title>
			<style type="text/css">
				html {
					height: 100%;
				}
				body {
					color: #3A3A3A;
					font-family: Arial, sans-serif;
					font-size: 1.2em;
					background-color: #F6F6F6;
					padding: 0px;
					margin: 0px;
					height: 100%;
					overflow: hidden;
				}
				h1 {
					font-family: Arial, sans-serif;	
					font-weight: 900;
					font-size: 3em;
					color: #002e54;
					text-align: center;
				}
				h2 {
					font-family: Arial, sans-serif;	
					font-weight: bold;
					font-size: 1em;
					color: #777;
					text-align: left;	
				}
				h3 {
					font-family: Arial, sans-serif;	
					font-weight: bold;
					font-size: 1em;
					color: #777;
					text-align: left;		
				}
				a {
					color: #002e54;
					text-decoration: none;
				}
				a:hover {
					color: #006DB2;
				}
				#wrapper {
					width: 100%;
					height: 100%;
				}
				#content {
					width: 600px;
					height: 100%;
					padding: 40px 20px;
					margin: auto;
					background-color: #fff;
					border-left: 1px solid #cccccc;
					border-right: 1px solid #cccccc;
				}
				img#wikialogo {
					width: 50%;
					margin: 0px auto;
					display: block;
				}
				div.links {
					margin-top: 30px;
					font-size: 0.8em;
				}
				div.technical {
					margin-top: 60px;
					font-size: 0.6em;
					color: #777;
				}

			</style>
			<!--[if IE]>
			<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
			<![endif]-->
		</head>
		<body>
			<div id="wrapper">
				<div id="content">
					<img src="http://upload.wikimedia.org/wikipedia/commons/1/17/Wikia_Logo.svg" id="wikialogo"/>
					<div class="friendly">
						<h1>We are sorry!</h1>
						<p>The address you gave us is too long. Please check it for mistakes.</p>
					</div>
					<div class="links">
						For more info and updates check out our <a href="https://twitter.com/Wikia">Twitter Feed</a>.
					</div>
					<div class="technical">
						<h2>Technical explanation for geeks and administrators:</h2>
						<h3>414 Request-URI Too Long</h3>
						<p>The server is refusing to service the request because the Request-URI is longer than the server is willing to interpret. This rare condition is only likely to occur when a client has improperly converted a POST request to a GET request with long query information, when the client has descended into a URI black hole of redirection (e.g., a redirected URI prefix that points to a suffix of itself), or when the server is under attack by a client attempting to exploit security holes present in some servers using fixed-length buffers for reading or manipulating the Request-URI.</p>
					</div>
			</div> <!-- #content -->
		</div> <!-- #wrapper -->
	</body>
</html>