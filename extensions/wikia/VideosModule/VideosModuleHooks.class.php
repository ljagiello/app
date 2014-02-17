<?php

class VideosModuleHooks {

	static public function onGetRailModuleList(&$modules) {
		wfProfileIn(__METHOD__);

		$app = F::App();
		$pos = $app->wg->User->isAnon() ? 1305 : 1285;


		$modules[$pos] = array('VideosModule', 'index', null);

		wfProfileOut(__METHOD__);

		return true;
	}

	static public function onOutputPageBeforeHTML( OutputPage $out, &$text ) {
		// On file pages, this hook can be called mulitple times, so we're going to check if the
		// assets are loaded already before we load them again.
		global $wgVideosModuleAssetsLoaded;

		if ( empty( $wgVideosModuleAssetsLoaded ) ) {
			JSMessages::enqueuePackage( 'VideosModule', JSMessages::EXTERNAL );

			$scripts = AssetsManager::getInstance()->getURL( 'videos_module_js' );

			foreach( $scripts as $script ){
				$out->addScript( "<script src='{$script}'></script>" );
			}

			$wgVideosModuleAssetsLoaded = true;
		}

		return true;

	}

}