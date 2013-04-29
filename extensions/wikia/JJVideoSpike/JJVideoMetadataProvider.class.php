<?php
/**
 * User: artur
 * Date: 23.04.13
 * Time: 16:18
 */

class JJVideoMetadataProvider {

	public function get( $title ) {

		$title = Title::newFromText( $title, NS_FILE );
		$file = wfFindFile($title);
		if( !$file ) return false;
		$meta = $file->getMetadata();
		$resultMeta = array();
		if( $meta ) {
			$meta= unserialize($meta);
			if ( isset($meta['keywords']) )
				$resultMeta['keywords'] = $meta['keywords'];
			if ( isset($meta['tags']) )
				$resultMeta['tags'] = $meta['tags'];
			if ( isset($meta['description']) )
				$resultMeta['description'] = $meta['description'];
			if ( isset($meta['category']) )
				$resultMeta['category'] = $meta['category'];
			if ( isset($meta['title']) )
				$resultMeta['title'] = $meta['title'];
			if ( isset($meta['actors']) ) {
				$resultMeta['actors'] = $meta['actors'];
			}
			if ( isset($meta['genres']) ) {
				$resultMeta['genres'] = $meta['genres'];
			}
			return $resultMeta;
		} else {
			return false;
		}
	}

	public function getExpanded( $title, $metadata=null ) {

		if ( empty( $metadata ) ) {
			$metadata = $this->get( $title );
		}



		return $metadata;

	}

}
