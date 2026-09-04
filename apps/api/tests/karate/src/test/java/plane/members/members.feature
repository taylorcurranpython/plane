@members
Feature: Workspace and project members

  The API key owner is a workspace admin and is automatically added as an
  administrator of every project they create.

  Background:
    * configure headers = authHeaders

  Scenario: The workspace member list includes the API key owner with their role
    Given url workspaceUrl + 'members/'
    When method get
    Then status 200
    And match response == '#array'
    And match response[*].email contains userEmail
    * def me = karate.filter(response, function(m){ return m.email == userEmail })[0]
    And match me == { id: '#(uuid)', first_name: '#string', last_name: '#string', email: '#(userEmail)', avatar: '##string', avatar_url: '##string', display_name: '#string', role: 20 }

  Scenario: The project creator is a member of the shared project
    Given url projectUrl + 'members/'
    When method get
    Then status 200
    And match response == '#array'
    And match response[*].email contains userEmail
    And match each response contains { id: '#(uuid)', email: '#string', display_name: '#string' }

  Scenario: Members of a project the caller does not belong to cannot be listed
    Given url workspaceUrl + 'projects/00000000-0000-4000-8000-000000000000/members/'
    When method get
    Then status 403
    And match response.detail contains 'permission'
