<?php

class ForumExternalController extends WallExternalController {
	public function __construct() {
		$this->app = F::app();
	}
	
	public function getCommentsPage() {
		//workaround to prevent index data expose
		$title = F::build('Title', array($this->request->getVal('pagetitle'), $this->request->getVal('pagenamespace') ), 'newFromText');
		$this->response->setVal( 'html', $this->app->renderView( 'ForumController', 'board', array('title' => $title, 'page' => $this->request->getVal('page', 1) ) )); 
	}
	
	private function checkAdminAccess() {
		if(!$this->wg->User->isAllowed('forumadmin')) {
			return 'accessdenied';
		}
		return '';
	}
	
	/**
     * Create new board ajax call
     * @request boardTitle - title of the board
     * @request boardDescription - description of the board (optional)
     * @response status - [ok|error|accessdenied]
     * @response errorfield - optional error field.  nullable
     * @response errormsg - optional error message.  nullable
     */
	public function createNewBoard() {
		$this->status = self::checkAdminAccess();
		if(!empty($this->status)) {
			return;
		}
		
		$boardTitle = $this->getVal('boardTitle', '');
		$boardDescription = $this->getVal('boardDescription', '');
		
		$valid = $this->validateBoardData($boardTitle, $boardDescription);
		if(!$valid) {
			return true;
		}
		
		$newTitle = Title::newFromText($boardTitle, NS_WIKIA_FORUM_BOARD);
		if( $newTitle->exists() ) {
			$this->status = 'error';
			$this->errormsg = wfMsg('forum-board-title-validation-exists');
			return true;
		}

		$forum = new Forum();
		$forum->createBoard($boardTitle, $boardDescription);

		$this->status = 'ok';
		$this->errorfield = '';
		$this->errormsg = '';
	}
	
	/**
	* Edits existing board
	* @request boardId - unique id of the board
 	* @request boardTitle - new title of the board (optional), nullable
 	* @request boardDescription - description of the board (optional), nullable
 	* @response status - [ok|error|accessdenied]
  	* @response errorfield - optional error field.  nullable
 	* @response errormsg - optional error message.  nullable
	*/
	public function editBoard() {	
		$this->status = self::checkAdminAccess();
		if(!empty($this->status)) {
			return;
		}

		$boardId = $this->getVal('boardId', '');
		$boardTitle = $this->getVal('boardTitle', '');
		$boardDescription = $this->getVal('boardDescription', '');
		
		if(empty($boardId)) {
			$this->status = 'error';
			$this->errormsg = wfMsg('forum-board-id-validation-missing');
			return true;
		}
		
		$title = Title::newFromId($boardId);
		if(empty($title)) {
			$this->status = 'error';
			$this->errormsg = wfMsg('forum-board-id-validation-missing');
			return true;
		}
		
		$valid = $this->validateBoardData($boardTitle, $boardDescription);
		if(!$valid) {
			return true;
		}
		
		$newTitle = Title::newFromText($boardTitle, NS_WIKIA_FORUM_BOARD);
		if( $newTitle->exists() && $newTitle->getText() != $title->getText() ) {
			$this->status = 'error';
			$this->errormsg = wfMsg('forum-board-title-validation-exists');
			return true;
		}
		
		$forum = new Forum();
		$forum->editBoard($boardId, $boardTitle, $boardDescription);
	
		$this->status = 'ok';
		$this->errorfield = '';
		$this->errormsg = '';

	}
	
	/**
	 * Remove and merge board
	 * @request boardId - board to remove
	 * @request boardTitle - board Title for validation
	 * @request destinationBoardId - board to merge existing threads to
	 * @response status - [ok|error|accessdenied]
	 * @response errorfield - optional error field.  nullable
	 * @response errormsg - optional error message.  nullable
	 */
	public function removeBoard() {
		$this->status = self::checkAdminAccess();
		if(!empty($this->status)) {
			return;
		}
		
		$boardId = $this->getVal('boardId', '');
		$boardTitle = $this->getVal('boardTitle', '');
		$destinationBoardId = $this->getVal('destinationBoardId', '');
		
		/* backend magic */
		
		$this->status = 'ok';
		$this->errorfield = '';
		$this->errormsg = '';
	}
	
	public function validateBoardData($boardTitle, $boardDescription) {
		$this->status = 'error';
		$this->errorfield = '';
		$this->errormsg = '';
		
		// Reject illegal characters.
		$rxTc = Title::getTitleInvalidRegex();
		if ( preg_match( $rxTc, $boardTitle ) ) {
			$this->errorfield = 'boardTitle';
			$this->errormsg = wfMsg('forum-board-title-validation-invalid');
			return false;
		}
		
		$titleLength = strlen( $boardTitle );
		if( $titleLength > 40 || $titleLength < 4 ) {
			$this->errorfield = 'boardTitle';
			$this->errormsg = wfMsg( 'forum-board-title-validation-length' );	
			return false;		
		}
		
		$descriptionLength = strlen( $boardDescription );
		
		if( $descriptionLength > 255 || $descriptionLength < 4 ) {
			$this->errorfield = 'boardDescription';
			$this->errormsg = wfMsg( 'forum-board-description-validation-length' );
			return false;			
		}

		return true;
	}

	protected function replyToMessageBuildResponse($context, $reply) {
		$context->response->setVal('message', $this->app->renderView( 'ForumController', 'threadReply', array( 'comment' => $reply, 'isreply' => true ) ));
	}
	
}