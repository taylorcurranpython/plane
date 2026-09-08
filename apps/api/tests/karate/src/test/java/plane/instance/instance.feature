@instance @smoke
Feature: Instance health and public configuration

  The API process exposes an unauthenticated health check and the public
  instance descriptor that the web, admin and space apps read on boot.

  Scenario: Health check answers 200
    Given url baseUrl + '/'
    When method get
    Then status 200

  Scenario: Public instance descriptor is available without credentials
    Given url baseUrl + '/api/instances/'
    When method get
    Then status 200
    And match response.instance == '#object'
    And match response.instance.is_setup_done == '#boolean'
    And match response.instance.workspaces_exist == true
    And match response.config == '#object'
    And match response.config.is_smtp_configured == '#boolean'
    And match response.config.file_size_limit == '#number'
