<?php
/**
 * @author: Jacek Jursza <jacek@wikia-inc.com>
 * Date: 29.04.13 13:09
 *
 */

class ElasticSearchQuery {

	protected $client;

	public function __construct(  $index = 'video151', $type = 'videos'  ) {

		$this->client = new ElasticSearchClient(  $index, $type );
	}

	public function indexData( $id, $data ) {

		$url = $this->client->getItemUrl( $id );
		return $this->client->call( $url, 'PUT', $data );
	}

	public function getData( $id ) {

		$url = $this->client->getItemUrl( $id );
		$resp = $this->client->call( $url, 'GET' );

		if ( $resp['statusCode'] == 200 ) {

			return json_decode( $resp['response'] );
		}

		return false;
	}

}