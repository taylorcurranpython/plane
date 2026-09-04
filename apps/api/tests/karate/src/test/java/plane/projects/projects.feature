@projects
Feature: Project lifecycle

  Projects are the container for every other resource. Creating one seeds the
  default workflow states and makes the creator an administrator; identifiers
  are unique per workspace and validated for special characters.

  Background:
    * configure headers = authHeaders
    * def projectsUrl = workspaceUrl + 'projects/'
    * def suffix = runId.substring(0, 6).toUpperCase()
    * def newProject =
      """
      function(identifier) {
        return {
          name: 'Karate ' + identifier,
          identifier: identifier,
          description: 'Created by the Karate suite',
          network: 2
        };
      }
      """

  Scenario: Create, read, update and delete a project
    * def payload = newProject('KP' + suffix)
    Given url projectsUrl
    And request payload
    When method post
    Then status 201
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        identifier: '#(payload.identifier)',
        description: '#(payload.description)',
        network: 2,
        archived_at: null,
        workspace: '#(uuid)',
        total_members: 1,
        total_cycles: 0,
        total_modules: 0,
        is_member: true,
        member_role: 20,
        created_by: '#(uuid)',
        created_at: '#(isoDateTime)',
        updated_at: '#(isoDateTime)'
      }
      """
    * def projectId = response.id

    Given url projectsUrl + projectId + '/'
    When method get
    Then status 200
    And match response.id == projectId
    And match response.identifier == payload.identifier

    Given url projectsUrl + projectId + '/'
    And request { name: 'Karate renamed', description: 'Updated by Karate' }
    When method patch
    Then status 200
    And match response.name == 'Karate renamed'
    And match response.description == 'Updated by Karate'
    And match response.identifier == payload.identifier

    Given url projectsUrl + projectId + '/'
    When method delete
    Then status 204

    Given url projectsUrl + projectId + '/'
    When method get
    Then status 404

  Scenario: Listing projects is paginated and contains the shared project
    Given url projectsUrl
    And param per_page = 5
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results == '#[_ <= 5]'
    And match each response.results contains { id: '#(uuid)', identifier: '#string', name: '#string' }

    Given url projectsUrl
    And param per_page = 100
    When method get
    Then status 200
    And match response.results[*].id contains project.id

  Scenario: The lite listing only exposes picker fields
    Given url workspaceUrl + 'projects-lite/'
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results[*].id contains project.id
    And match each response.results contains { id: '#(uuid)', name: '#string', identifier: '#string' }
    And match each response.results !contains { total_members: '#present', member_role: '#present' }

  Scenario: A project identifier must be unique within the workspace
    * def payload = newProject('KD' + suffix)
    Given url projectsUrl
    And request payload
    When method post
    Then status 201
    * def projectId = response.id

    Given url projectsUrl
    And request newProject(payload.identifier)
    When method post
    Then status 409

    Given url projectsUrl + projectId + '/'
    When method delete
    Then status 204

  Scenario: An identifier is required to create a project
    Given url projectsUrl
    And request { name: '#("No identifier " + runId)' }
    When method post
    Then status 400
    And match response.identifier == '#[1]'

  Scenario Outline: Special characters are rejected in the identifier: <identifier>
    Given url projectsUrl
    And request newProject('<identifier>')
    When method post
    Then status 400
    And match response.non_field_errors[0] contains 'special characters'

    Examples:
      | identifier |
      | KA-1       |
      | KA.1       |
      | KA@1       |
      | KA#1       |

  Scenario: Reading a project that does not exist returns 404
    Given url projectsUrl + '00000000-0000-4000-8000-000000000000/'
    When method get
    Then status 404
    And match response.error == '#string'

  Scenario: A project can be archived and unarchived
    * def payload = newProject('KR' + suffix)
    Given url projectsUrl
    And request payload
    When method post
    Then status 201
    * def projectId = response.id

    Given url projectsUrl + projectId + '/archive/'
    When method post
    Then status 204

    Given url projectsUrl + projectId + '/'
    When method get
    Then status 200
    And match response.archived_at == '#(isoDateTime)'

    Given url projectsUrl + projectId + '/archive/'
    When method delete
    Then status 204

    Given url projectsUrl + projectId + '/'
    When method get
    Then status 200
    And match response.archived_at == null

    Given url projectsUrl + projectId + '/'
    When method delete
    Then status 204

  Scenario: The project summary reports counts for its sub-resources
    Given url projectUrl + 'summary/'
    When method get
    Then status 200
    And match response ==
      """
      {
        id: '#(project.id)',
        name: '#(project.name)',
        identifier: '#(project.identifier)',
        counts: {
          modules: '#number',
          intakes: '#number',
          cycles: '#number',
          issues: '#number',
          members: '#number',
          pages: '#number',
          states: '#number',
          labels: '#number'
        }
      }
      """
    And match response.counts.members == 1
    And assert response.counts.states >= 5
