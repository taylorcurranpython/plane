@cycles
Feature: Cycles

  Cycles are time-boxed iterations. Their dates must be ordered, work items can
  be moved in and out of them, and only completed cycles may be archived.

  Background:
    * configure headers = authHeaders
    * def cyclesUrl = projectUrl + 'cycles/'

  Scenario: Create, read, update and delete a cycle
    * def payload = { name: '#("Sprint " + runId)', description: 'Two week iteration', start_date: '2030-01-06', end_date: '2030-01-17' }
    Given url cyclesUrl
    And request payload
    When method post
    Then status 201
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        description: '#(payload.description)',
        start_date: '#string',
        end_date: '#string',
        archived_at: null,
        project: '#(project.id)',
        workspace: '#(uuid)',
        owned_by: '#(uuid)',
        created_at: '#(isoDateTime)'
      }
      """
    And match response.start_date contains '2030-01-06'
    And match response.end_date contains '2030-01-17'
    * def cycleId = response.id

    Given url cyclesUrl + cycleId + '/'
    When method get
    Then status 200
    And match response.id == cycleId

    Given url cyclesUrl + cycleId + '/'
    And request { name: '#("Sprint renamed " + runId)' }
    When method patch
    Then status 200
    And match response.name == 'Sprint renamed ' + runId

    Given url cyclesUrl
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results[*].id contains cycleId

    Given url projectUrl + 'cycles-lite/'
    When method get
    Then status 200
    And match response.results[*].id contains cycleId

    Given url cyclesUrl + cycleId + '/'
    When method delete
    Then status 204

    Given url cyclesUrl + cycleId + '/'
    When method get
    Then status 404

  Scenario: Work items can be added to and removed from a cycle
    Given url cyclesUrl
    And request { name: '#("Cycle with items " + runId)' }
    When method post
    Then status 201
    * def cycleId = response.id

    Given url projectUrl + 'work-items/'
    And request { name: '#("In cycle " + runId)' }
    When method post
    Then status 201
    * def workItemId = response.id

    Given url cyclesUrl + cycleId + '/cycle-issues/'
    And request { issues: ['#(workItemId)'] }
    When method post
    Then status 200
    And match response == '#[1]'
    And match response[0] contains { issue: '#(workItemId)', cycle: '#(cycleId)' }

    Given url cyclesUrl + cycleId + '/cycle-issues/'
    When method get
    Then status 200
    And match response.results[*].id contains workItemId

    Given url cyclesUrl + cycleId + '/cycle-issues/' + workItemId + '/'
    When method delete
    Then status 204

    Given url cyclesUrl + cycleId + '/cycle-issues/'
    When method get
    Then status 200
    And match response.results == '#[0]'

    Given url projectUrl + 'work-items/' + workItemId + '/'
    When method delete
    Then status 204
    Given url cyclesUrl + cycleId + '/'
    When method delete
    Then status 204

  Scenario: The start date may not be after the end date
    Given url cyclesUrl
    And request { name: '#("Backwards " + runId)', start_date: '2030-02-01', end_date: '2030-01-01' }
    When method post
    Then status 400
    And match response.non_field_errors[0] contains 'Start date cannot exceed end date'

  Scenario: A cycle requires a name
    Given url cyclesUrl
    And request { description: 'no name' }
    When method post
    Then status 400
    And match response.name == '#[1]'

  Scenario: Only completed cycles can be archived
    Given url cyclesUrl
    And request { name: '#("Future cycle " + runId)', start_date: '2030-03-01', end_date: '2030-03-14' }
    When method post
    Then status 201
    * def cycleId = response.id

    Given url cyclesUrl + cycleId + '/archive/'
    When method post
    Then status 400
    And match response.error contains 'completed'

    Given url cyclesUrl + cycleId + '/'
    When method delete
    Then status 204
