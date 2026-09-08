@modules
Feature: Modules

  Modules group work items into deliverables. They start in the "planned"
  status, can hold work items, and once completed or cancelled can be archived
  and restored.

  Background:
    * configure headers = authHeaders
    * def modulesUrl = projectUrl + 'modules/'

  Scenario: Create, read, update and delete a module
    * def payload = { name: '#("Module " + runId)', description: 'Payments epic' }
    Given url modulesUrl
    And request payload
    When method post
    Then status 201
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        description: '#(payload.description)',
        status: 'planned',
        lead: null,
        members: [],
        archived_at: null,
        project: '#(project.id)',
        workspace: '#(uuid)',
        created_at: '#(isoDateTime)'
      }
      """
    * def moduleId = response.id

    Given url modulesUrl + moduleId + '/'
    When method get
    Then status 200
    And match response.id == moduleId

    Given url modulesUrl + moduleId + '/'
    And request { name: '#("Module renamed " + runId)', status: 'in-progress' }
    When method patch
    Then status 200
    And match response.name == 'Module renamed ' + runId
    And match response.status == 'in-progress'

    Given url modulesUrl
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results[*].id contains moduleId

    Given url projectUrl + 'modules-lite/'
    When method get
    Then status 200
    And match response.results[*].id contains moduleId

    Given url modulesUrl + moduleId + '/'
    When method delete
    Then status 204

    Given url modulesUrl + moduleId + '/'
    When method get
    Then status 404

  Scenario: Work items can be added to and removed from a module
    Given url modulesUrl
    And request { name: '#("Module with items " + runId)' }
    When method post
    Then status 201
    * def moduleId = response.id

    Given url projectUrl + 'work-items/'
    And request { name: '#("In module " + runId)' }
    When method post
    Then status 201
    * def workItemId = response.id

    Given url modulesUrl + moduleId + '/module-issues/'
    And request { issues: ['#(workItemId)'] }
    When method post
    Then status 200
    And match response == '#[1]'
    And match response[0] contains { issue: '#(workItemId)', module: '#(moduleId)' }

    Given url modulesUrl + moduleId + '/module-issues/'
    When method get
    Then status 200
    And match response.results[*].id contains workItemId

    Given url modulesUrl + moduleId + '/module-issues/' + workItemId + '/'
    When method delete
    Then status 204

    Given url modulesUrl + moduleId + '/module-issues/'
    When method get
    Then status 200
    And match response.results == '#[0]'

    Given url projectUrl + 'work-items/' + workItemId + '/'
    When method delete
    Then status 204
    Given url modulesUrl + moduleId + '/'
    When method delete
    Then status 204

  Scenario: Only completed or cancelled modules can be archived
    Given url modulesUrl
    And request { name: '#("Archivable " + runId)' }
    When method post
    Then status 201
    * def moduleId = response.id

    Given url modulesUrl + moduleId + '/archive/'
    When method post
    Then status 400
    And match response.error contains 'completed or cancelled'

    Given url modulesUrl + moduleId + '/'
    And request { status: 'completed' }
    When method patch
    Then status 200
    And match response.status == 'completed'

    Given url modulesUrl + moduleId + '/archive/'
    When method post
    Then status 204

    Given url projectUrl + 'archived-modules/'
    When method get
    Then status 200
    And match response.results[*].id contains moduleId

    Given url modulesUrl
    When method get
    Then status 200
    And match response.results[*].id !contains moduleId

    Given url projectUrl + 'archived-modules/' + moduleId + '/unarchive/'
    When method delete
    Then status 204

    Given url modulesUrl
    When method get
    Then status 200
    And match response.results[*].id contains moduleId

    Given url modulesUrl + moduleId + '/'
    When method delete
    Then status 204

  Scenario: A module requires a name
    Given url modulesUrl
    And request { description: 'no name' }
    When method post
    Then status 400
    And match response.name == '#[1]'

  Scenario: An unknown status is rejected
    Given url modulesUrl
    And request { name: '#("Bad status " + runId)', status: 'shipped' }
    When method post
    Then status 400
    And match response.status == '#[1]'
