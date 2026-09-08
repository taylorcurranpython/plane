@auth @smoke
Feature: API key authentication on the public REST API

  Every /api/v1 endpoint is protected by the X-API-Key header. Requests without a
  key are 401; a key that does not resolve to an active token is 403; valid keys
  resolve to the token's owner and are scoped to the owner's workspaces.

  Scenario: A request without an API key is rejected
    Given url apiV1 + 'users/me/'
    When method get
    Then status 401
    And match response.detail == '#string'

  Scenario: A request with an unknown API key is rejected
    Given url apiV1 + 'users/me/'
    And header X-API-Key = 'plane_api_' + runId + '_definitely_not_a_real_key'
    When method get
    Then status 403
    And match response.detail contains 'not valid'

  Scenario: A valid API key resolves to the token owner
    Given url apiV1 + 'users/me/'
    And headers authHeaders
    When method get
    Then status 200
    And match response ==
      """
      {
        id: '#(uuid)',
        first_name: '#string',
        last_name: '#string',
        email: '#(userEmail)',
        avatar: '##string',
        avatar_url: '##string',
        display_name: '#string'
      }
      """

  Scenario: Authenticated responses expose rate-limit headers
    Given url apiV1 + 'users/me/'
    And headers authHeaders
    When method get
    Then status 200
    And match responseHeaders['X-RateLimit-Remaining'][0] == '#regex \\d+'
    And match responseHeaders['X-RateLimit-Reset'][0] == '#regex \\d+'

  Scenario: An API key cannot read a workspace it does not belong to
    Given url apiV1 + 'workspaces/no-such-workspace-' + runId + '/projects/'
    And headers authHeaders
    When method get
    Then status 403
    And match response.detail contains 'permission'
