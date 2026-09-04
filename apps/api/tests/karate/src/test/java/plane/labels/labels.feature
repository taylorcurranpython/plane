@labels
Feature: Labels

  Labels are project-scoped tags that can be attached to work items. Names are
  unique within a project and labels can be nested one level under a parent.

  Background:
    * configure headers = authHeaders
    * def labelsUrl = projectUrl + 'labels/'

  Scenario: Create, read, update and delete a label
    * def payload = { name: '#("bug-" + runId)', color: '#EF4444', description: 'Something is broken' }
    Given url labelsUrl
    And request payload
    When method post
    Then status 201
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        color: '#(payload.color)',
        description: '#(payload.description)',
        project: '#(project.id)',
        workspace: '#(uuid)',
        parent: null,
        sort_order: '#number',
        created_at: '#(isoDateTime)'
      }
      """
    * def labelId = response.id

    Given url labelsUrl + labelId + '/'
    When method get
    Then status 200
    And match response.id == labelId
    And match response.name == payload.name

    Given url labelsUrl + labelId + '/'
    And request { name: '#("defect-" + runId)', color: '#F97316' }
    When method patch
    Then status 200
    And match response.name == 'defect-' + runId
    And match response.color == '#F97316'

    Given url labelsUrl
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results[*].id contains labelId

    Given url labelsUrl + labelId + '/'
    When method delete
    Then status 204

    Given url labelsUrl + labelId + '/'
    When method get
    Then status 404

  Scenario: Label names are unique within a project
    * def payload = { name: '#("dup-" + runId)', color: '#111111' }
    Given url labelsUrl
    And request payload
    When method post
    Then status 201
    * def labelId = response.id

    Given url labelsUrl
    And request payload
    When method post
    Then status 409
    And match response == { error: '#string', id: '#(labelId)' }

    Given url labelsUrl + labelId + '/'
    When method delete
    Then status 204

  Scenario: A label can be nested under a parent label
    Given url labelsUrl
    And request { name: '#("parent-" + runId)', color: '#222222' }
    When method post
    Then status 201
    * def parentId = response.id

    Given url labelsUrl
    And request { name: '#("child-" + runId)', color: '#333333', parent: '#(parentId)' }
    When method post
    Then status 201
    And match response.parent == parentId
    * def childId = response.id

    Given url labelsUrl + childId + '/'
    When method delete
    Then status 204
    Given url labelsUrl + parentId + '/'
    When method delete
    Then status 204

  Scenario: A label requires a name
    Given url labelsUrl
    And request { color: '#444444' }
    When method post
    Then status 400
    And match response.name == '#[1]'
